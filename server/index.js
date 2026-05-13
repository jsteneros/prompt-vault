import "dotenv/config";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const prisma = new PrismaClient();

const API_PORT = Number(process.env.API_PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET;
const APP_URL = process.env.APP_URL || "http://localhost:5173";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESET_FROM_EMAIL =
  process.env.RESET_FROM_EMAIL || "PromptVault <no-reply@promptvault.app>";
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
    }
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: "10mb" }));

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

const promptSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  fullPrompt: z.string().trim().min(1),
  headerImage: z
    .string()
    .optional()
    .default(
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    ),
  tags: z.preprocess(
    (value) => (Array.isArray(value) ? value : []),
    z
      .array(z.string())
      .transform((tags) => tags.map((tag) => tag.trim()).filter(Boolean))
      .transform((tags) => (tags.length ? tags : ["general"])),
  ),
  isFavorite: z.coerce.boolean().optional().default(false),
  visibility: z
    .string()
    .optional()
    .default("private")
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(["public", "private"])),
});

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function sanitizePrompt(prompt) {
  return {
    id: prompt.id,
    title: prompt.title,
    description: prompt.description,
    fullPrompt: prompt.fullPrompt,
    headerImage: prompt.headerImage,
    tags: prompt.tags,
    isFavorite: prompt.isFavorite,
    visibility: prompt.visibility.toLowerCase(),
    createdAt: prompt.createdAt,
    userId: prompt.userId,
    owner: prompt.user
      ? {
          id: prompt.user.id,
          name: prompt.user.name,
          email: prompt.user.email,
        }
      : undefined,
  };
}

function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function sendResetPasswordEmail({ email, name, resetUrl }) {
  if (!RESEND_API_KEY) {
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    return { delivered: false, previewUrl: resetUrl };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESET_FROM_EMAIL,
      to: [email],
      subject: "Reset your PromptVault password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <p>Hi ${name || "there"},</p>
          <p>We received a request to reset your PromptVault password.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;">
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send reset email: ${text}`);
  }

  return { delivered: true };
}

function authRequired(req, res, next) {
  const user = parseUserFromAuthHeader(req.headers.authorization);
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  req.user = user;
  next();
}

function parseUserFromAuthHeader(authorizationHeader) {
  const header = authorizationHeader || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });
    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid email enumeration.
  if (!user) {
    return res.json({
      ok: true,
      message: "If an account exists for this email, a reset link has been sent.",
    });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  const resetUrl = `${APP_URL}?resetToken=${rawToken}`;

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      expiresAt,
      userId: user.id,
    },
  });

  const emailResult = await sendResetPasswordEmail({
    email: user.email,
    name: user.name,
    resetUrl,
  });

  return res.json({
    ok: true,
    message: "If an account exists for this email, a reset link has been sent.",
    previewUrl: emailResult.previewUrl,
  });
});

app.post("/api/auth/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const tokenHash = hashResetToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now()
  ) {
    return res.status(400).json({ error: "Reset link is invalid or expired" });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        id: { not: resetToken.id },
        usedAt: null,
      },
      data: { usedAt: new Date() },
    }),
  ]);

  return res.json({ ok: true, message: "Password reset successfully." });
});

app.get("/api/auth/me", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ user: sanitizeUser(user) });
});

app.get("/api/prompts", authRequired, async (req, res) => {
  const prompts = await prisma.prompt.findMany({
    where: { userId: req.user.id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ prompts: prompts.map(sanitizePrompt) });
});

app.post("/api/prompts", authRequired, async (req, res) => {
  const parsed = promptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid prompt payload",
      details: parsed.error.flatten(),
    });
  }

  const created = await prisma.prompt.create({
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      fullPrompt: parsed.data.fullPrompt.trim(),
      headerImage: parsed.data.headerImage,
      tags: parsed.data.tags.map((tag) => tag.trim()),
      isFavorite: parsed.data.isFavorite,
      visibility: parsed.data.visibility === "public" ? "PUBLIC" : "PRIVATE",
      userId: req.user.id,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return res.status(201).json({ prompt: sanitizePrompt(created) });
});

app.put("/api/prompts/:id", authRequired, async (req, res) => {
  const parsed = promptSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid prompt payload",
      details: parsed.error.flatten(),
    });
  }

  const existing = await prisma.prompt.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!existing) return res.status(404).json({ error: "Prompt not found" });

  const updated = await prisma.prompt.update({
    where: { id: req.params.id },
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      fullPrompt: parsed.data.fullPrompt.trim(),
      headerImage: parsed.data.headerImage,
      tags: parsed.data.tags,
      isFavorite: parsed.data.isFavorite,
      visibility: parsed.data.visibility === "public" ? "PUBLIC" : "PRIVATE",
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return res.json({ prompt: sanitizePrompt(updated) });
});

app.patch("/api/prompts/:id/favorite", authRequired, async (req, res) => {
  const body = z.object({ isFavorite: z.boolean() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid payload" });

  const updated = await prisma.prompt.updateMany({
    where: { id: req.params.id, userId: req.user.id },
    data: { isFavorite: body.data.isFavorite },
  });

  if (!updated.count) return res.status(404).json({ error: "Prompt not found" });
  return res.json({ ok: true });
});

app.delete("/api/prompts/:id", authRequired, async (req, res) => {
  const deleted = await prisma.prompt.deleteMany({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!deleted.count) return res.status(404).json({ error: "Prompt not found" });
  return res.status(204).send();
});

app.get("/api/prompts/public", async (_req, res) => {
  const prompts = await prisma.prompt.findMany({
    where: { visibility: "PUBLIC" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ prompts: prompts.map(sanitizePrompt) });
});

app.get("/api/prompts/:id", async (req, res) => {
  const prompt = await prisma.prompt.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!prompt) return res.status(404).json({ error: "Prompt not found" });

  if (prompt.visibility === "PUBLIC") {
    return res.json({ prompt: sanitizePrompt(prompt) });
  }

  const user = parseUserFromAuthHeader(req.headers.authorization);
  if (!user) {
    return res.status(401).json({ error: "Login required for private prompt" });
  }
  if (user.id !== prompt.userId) {
    return res.status(403).json({ error: "You do not have access to this prompt" });
  }

  return res.json({ prompt: sanitizePrompt(prompt) });
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.listen(API_PORT, () => {
  console.log(`PromptVault API running on http://localhost:${API_PORT}`);
});
