const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function apiFetch(path, options = {}) {
  const { headers: optionHeaders = {}, ...restOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...optionHeaders,
    },
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const data = await response.json();
      message = data.error || message;
      if (data.details?.fieldErrors) {
        const fieldErrors = Object.entries(data.details.fieldErrors)
          .flatMap(([field, errors]) =>
            (errors || []).filter(Boolean).map((err) => `${field}: ${err}`),
          )
          .filter(Boolean);
        if (fieldErrors.length) {
          message = `${message}: ${fieldErrors[0]}`;
        }
      }
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(payload) {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload) {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resendVerification(token) {
  return apiFetch("/api/auth/resend-verification", {
    method: "POST",
    headers: authHeader(token),
  });
}

export async function verifyEmail(payload) {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(token) {
  return apiFetch("/api/auth/me", { headers: authHeader(token) });
}

export async function updateProfile(token, payload) {
  return apiFetch("/api/auth/profile", {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function updatePassword(token, payload) {
  return apiFetch("/api/auth/password", {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function getMyPrompts(token) {
  return apiFetch("/api/prompts", { headers: authHeader(token) });
}

export async function getPublicPrompts() {
  return apiFetch("/api/prompts/public");
}

export async function getPromptById(id, token = "") {
  return apiFetch(`/api/prompts/${id}`, {
    headers: authHeader(token),
  });
}

export async function createPrompt(token, payload) {
  return apiFetch("/api/prompts", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function updatePrompt(token, id, payload) {
  return apiFetch(`/api/prompts/${id}`, {
    method: "PUT",
    headers: authHeader(token),
    body: JSON.stringify(payload),
  });
}

export async function setFavorite(token, id, isFavorite) {
  return apiFetch(`/api/prompts/${id}/favorite`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ isFavorite }),
  });
}

export async function deletePrompt(token, id) {
  return apiFetch(`/api/prompts/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}
