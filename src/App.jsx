import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import AddPromptModal from "./components/AddPromptModal";
import AuthModal from "./components/AuthModal";
import FilterBar from "./components/FilterBar";
import GuestFavoriteModal from "./components/GuestFavoriteModal";
import PromptCard from "./components/PromptCard";
import PromptModal from "./components/PromptModal";
import Toast from "./components/Toast";
import {
  createPrompt,
  deletePrompt,
  forgotPassword,
  getMe,
  getMyPrompts,
  getPromptById,
  getPublicPrompts,
  login,
  register,
  resetPassword,
  setFavorite,
  updatePrompt,
} from "./api/client";
import { getGravatarUrl } from "./utils/gravatar";

const SESSION_TOKEN_KEY = "promptvault.session.token";

function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem(SESSION_TOKEN_KEY) || "",
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [publicPrompts, setPublicPrompts] = useState([]);

  const [activeFilter, setActiveFilter] = useState("My Prompts");
  const [activeTag, setActiveTag] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuestFavoriteModalOpen, setIsGuestFavoriteModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [publicActiveTag, setPublicActiveTag] = useState("All");
  const [publicSearch, setPublicSearch] = useState("");
  const [toast, setToast] = useState("");
  const [pendingSharedPromptId, setPendingSharedPromptId] = useState("");
  const [resetToken, setResetToken] = useState("");

  const setPromptQueryParam = (promptId) => {
    const url = new URL(window.location.href);
    if (promptId) {
      url.searchParams.set("prompt", promptId);
    } else {
      url.searchParams.delete("prompt");
    }
    if (!resetToken) {
      url.searchParams.delete("resetToken");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const openPrompt = (prompt) => {
    if (!prompt?.id) return;
    setSelectedPrompt(prompt);
    setPromptQueryParam(prompt.id);
  };

  const closePrompt = () => {
    setSelectedPrompt(null);
    setPromptQueryParam("");
  };

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(SESSION_TOKEN_KEY);
      return;
    }
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublic() {
      try {
        const data = await getPublicPrompts();
        if (!cancelled) setPublicPrompts(data.prompts || []);
      } catch {
        if (!cancelled) setPublicPrompts([]);
      }
    }

    loadPublic();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("prompt") || "";
    const activeResetToken = params.get("resetToken") || "";
    if (sharedId) setPendingSharedPromptId(sharedId);
    if (activeResetToken) {
      setResetToken(activeResetToken);
      setAuthMode("reset");
      setAuthError("");
      setAuthSuccess("");
      setIsAuthModalOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!pendingSharedPromptId) return;

    let cancelled = false;
    async function loadSharedPrompt() {
      try {
        const data = await getPromptById(pendingSharedPromptId, token);
        if (cancelled) return;
        setSelectedPrompt(data.prompt);
      } catch (error) {
        if (cancelled) return;
        if (String(error.message).toLowerCase().includes("login required")) {
          setAuthMode("login");
          setAuthError("Please create an account or login to view this private prompt.");
          setAuthSuccess("");
          setIsAuthModalOpen(true);
          return;
        }
        setToast(error.message || "Could not open shared prompt");
        setPromptQueryParam("");
      } finally {
        if (!cancelled) setPendingSharedPromptId("");
      }
    }

    loadSharedPrompt();
    return () => {
      cancelled = true;
    };
  }, [pendingSharedPromptId, token]);

  useEffect(() => {
    let cancelled = false;

    async function loadAuthed() {
      if (!token) {
        setCurrentUser(null);
        setPrompts([]);
        return;
      }

      try {
        const [me, mine] = await Promise.all([getMe(token), getMyPrompts(token)]);
        if (cancelled) return;
        setCurrentUser(me.user);
        setPrompts(mine.prompts || []);
        setActiveFilter("My Prompts");
        setActiveTag(null);
      } catch {
        if (cancelled) return;
        setToken("");
        setCurrentUser(null);
        setPrompts([]);
      }
    }

    loadAuthed();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(""), 1800);
    return () => clearTimeout(timeout);
  }, [toast]);

  const allTags = useMemo(() => {
    const bag = new Set();
    prompts.forEach((prompt) => prompt.tags.forEach((tag) => bag.add(tag)));
    return [...bag].sort((a, b) => a.localeCompare(b));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesFavorite =
        activeFilter !== "My Favourites" || Boolean(prompt.isFavorite);
      const matchesTag = !activeTag || prompt.tags.includes(activeTag);
      return matchesFavorite && matchesTag;
    });
  }, [prompts, activeFilter, activeTag]);

  const avatarUrl = useMemo(
    () => (currentUser ? getGravatarUrl(currentUser.email, 56) : ""),
    [currentUser],
  );

  const publicTags = useMemo(() => {
    const bag = new Set();
    publicPrompts.forEach((prompt) => {
      prompt.tags.forEach((tag) => bag.add(tag));
    });
    return ["All", ...[...bag].sort((a, b) => a.localeCompare(b))];
  }, [publicPrompts]);

  const filteredPublicPrompts = useMemo(() => {
    const query = publicSearch.trim().toLowerCase();
    return publicPrompts.filter((prompt) => {
      const matchesTag =
        publicActiveTag === "All" || prompt.tags.includes(publicActiveTag);
      const matchesSearch =
        !query ||
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.fullPrompt.toLowerCase().includes(query) ||
        prompt.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesTag && matchesSearch;
    });
  }, [publicPrompts, publicActiveTag, publicSearch]);

  const refreshPublicPrompts = async () => {
    try {
      const data = await getPublicPrompts();
      setPublicPrompts(data.prompts || []);
    } catch {
      // noop
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Prompt copied ✨");
    } catch {
      setToast("Copy failed");
    }
  };

  const handleSharePrompt = async (prompt) => {
    if (!prompt?.id) return;
    const url = new URL(window.location.href);
    url.searchParams.set("prompt", prompt.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setToast("Prompt link copied ✨");
    } catch {
      setToast("Could not copy share link");
    }
  };

  const handleToggleFavorite = async (id) => {
    const prompt = prompts.find((item) => item.id === id);
    if (!prompt || !token) return;

    const nextFavorite = !prompt.isFavorite;
    setPrompts((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isFavorite: nextFavorite } : item,
      ),
    );

    try {
      await setFavorite(token, id, nextFavorite);
    } catch {
      setPrompts((current) =>
        current.map((item) =>
          item.id === id ? { ...item, isFavorite: prompt.isFavorite } : item,
        ),
      );
      setToast("Could not update favorite");
    }
  };

  const handleAddPrompt = async (payload) => {
    if (!token) return { ok: false, error: "Please login first." };
    try {
      if (editingPrompt) {
        const data = await updatePrompt(token, editingPrompt.id, payload);
        setPrompts((current) =>
          current.map((item) =>
            item.id === editingPrompt.id
              ? {
                  ...data.prompt,
                  owner: data.prompt.owner || currentUser || undefined,
                }
              : item,
          ),
        );
        setEditingPrompt(null);
        await refreshPublicPrompts();
        setToast("Prompt updated");
        return { ok: true };
      }

      const data = await createPrompt(token, payload);
      setPrompts((current) => [
        { ...data.prompt, owner: data.prompt.owner || currentUser || undefined },
        ...current,
      ]);
      if (data.prompt.visibility === "public") {
        await refreshPublicPrompts();
      }
      setToast("Prompt added");
      return { ok: true };
    } catch (error) {
      setToast(error.message || "Could not add prompt");
      return { ok: false, error: error.message || "Could not add prompt" };
    }
  };

  const handleDeletePrompt = async (prompt) => {
    if (!token) return;
    const confirmed = window.confirm("Delete this prompt?");
    if (!confirmed) return;

    try {
      await deletePrompt(token, prompt.id);
      setPrompts((current) => current.filter((item) => item.id !== prompt.id));
      if (selectedPrompt?.id === prompt.id) {
        closePrompt();
      }
      if (prompt.visibility === "public") {
        await refreshPublicPrompts();
      }
      setToast("Prompt deleted");
    } catch (error) {
      setToast(error.message || "Could not delete prompt");
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccess("");
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async ({
    name,
    email,
    password,
    token: resetTokenValue,
    localError,
  }) => {
    if (localError) {
      setAuthError(localError);
      setAuthSuccess("");
      return;
    }

    try {
      if (authMode === "forgot") {
        const data = await forgotPassword({ email });
        setAuthError("");
        setAuthSuccess(
          data.previewUrl
            ? `Reset link generated for local testing: ${data.previewUrl}`
            : "If an account exists for this email, a reset link has been sent.",
        );
        return;
      }

      if (authMode === "reset") {
        await resetPassword({ token: resetTokenValue, password });
        const url = new URL(window.location.href);
        url.searchParams.delete("resetToken");
        window.history.replaceState({}, "", url.toString());
        setResetToken("");
        setAuthMode("login");
        setAuthError("");
        setAuthSuccess("Password reset successfully. You can login now.");
        return;
      }

      const data =
        authMode === "register"
          ? await register({ name, email, password })
          : await login({ email, password });

      setToken(data.token);
      setCurrentUser(data.user);
      setIsAuthModalOpen(false);
      setAuthError("");
      setAuthSuccess("");
      setToast(authMode === "register" ? "Account created" : "Welcome back");
    } catch (error) {
      setAuthError(error.message || "Authentication failed");
      setAuthSuccess("");
    }
  };

  const handleLogout = () => {
    setToken("");
    setCurrentUser(null);
    setPrompts([]);
    setIsAddModalOpen(false);
    setEditingPrompt(null);
    setToast("Logged out");
  };

  return (
    <div className="min-h-screen bg-[#ececec] text-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-9"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#ff7f1e]">
            The Community & Personal AI Prompt Library
          </p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-[#3a3a3a]">
                PromptVault
              </h1>
              <p className="mt-2 max-w-2xl text-base leading-6 text-[#7b7b7b]">
                Collect, organize, and browse your best prompts with a clean,
                visual workflow.
              </p>
            </div>
            <div className="pt-1">
              <div className="flex flex-wrap items-center justify-end gap-4">
                {currentUser ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={avatarUrl}
                        alt={currentUser.email}
                        className="h-8 w-8 rounded-full border border-[#c9c9c9] bg-white object-cover"
                        loading="lazy"
                      />
                      <p className="text-sm text-[#8a8a8a]">
                        Signed in as {currentUser.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9c9c9] bg-transparent px-4 py-2 text-sm font-semibold text-[#5f5f5f] transition hover:bg-[#e7e7e7]"
                      aria-label="Logout"
                      title={`Logout ${currentUser.email}`}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => openAuthModal("login")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#444444] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#363636]"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuthModal("register")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9c9c9] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#5f5f5f] transition hover:bg-[#e7e7e7]"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {currentUser ? (
          <>
            <FilterBar
              tags={allTags}
              activeFilter={activeFilter}
              activeTag={activeTag}
              onFilterChange={setActiveFilter}
              onTagSelect={setActiveTag}
              onAddPrompt={() => setIsAddModalOpen(true)}
            />

            <section className="mt-6">
              {filteredPrompts.length ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
                >
                  {filteredPrompts.map((prompt, index) => (
                    <motion.div
                      key={prompt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.25) }}
                      className="h-full"
                    >
                      <PromptCard
                        prompt={prompt}
                        onCopy={handleCopy}
                        onShare={handleSharePrompt}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={(item) => {
                          setEditingPrompt(item);
                          setIsAddModalOpen(true);
                        }}
                        onDelete={handleDeletePrompt}
                        onReadMore={openPrompt}
                        onTagClick={(tag) => setActiveTag(tag)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-slate-600">
                  No prompts yet. Add your first prompt to get started.
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mt-6">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-[#3a3a3a]">
                Public Prompts
              </h2>
              {publicPrompts.length ? (
                <>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {publicTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setPublicActiveTag(tag)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium leading-none transition ${
                            publicActiveTag === tag
                              ? "border border-[#666] bg-[#4b4b4b] text-white"
                              : "border border-[#d2d2d2] bg-transparent text-[#666] hover:bg-[#ececec]"
                          }`}
                        >
                          {tag === "All" ? "All Categories" : tag}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={publicSearch}
                      onChange={(event) => setPublicSearch(event.target.value)}
                      placeholder="Search public prompts..."
                      className="w-full rounded-xl border border-[#cfcfcf] bg-white px-4 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 sm:max-w-xs"
                    />
                  </div>

                  {filteredPublicPrompts.length ? (
                    <motion.div
                      layout
                      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
                    >
                      {filteredPublicPrompts.map((prompt, index) => (
                        <motion.div
                          key={prompt.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(index * 0.04, 0.2) }}
                          className="h-full"
                        >
                          <PromptCard
                            prompt={prompt}
                            readOnly
                            onRequireAuth={() => setIsGuestFavoriteModalOpen(true)}
                            onCopy={handleCopy}
                            onShare={handleSharePrompt}
                            onReadMore={openPrompt}
                            onTagClick={setPublicActiveTag}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#cfcfcf] bg-white/60 p-8 text-center text-slate-600">
                      No public prompts match your filters.
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
                >
                  <div className="rounded-2xl border border-dashed border-[#cfcfcf] bg-white/60 p-8 text-center text-slate-600">
                    No public prompts yet.
                  </div>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </main>

      <PromptModal
        prompt={selectedPrompt}
        onClose={closePrompt}
        onCopy={handleCopy}
        onShare={handleSharePrompt}
      />
      <AddPromptModal
        open={(isAddModalOpen || Boolean(editingPrompt)) && Boolean(currentUser)}
        mode={editingPrompt ? "edit" : "create"}
        initialPrompt={editingPrompt}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPrompt(null);
        }}
        onSubmit={handleAddPrompt}
      />
      <AuthModal
        open={isAuthModalOpen}
        mode={authMode}
        error={authError}
        successMessage={authSuccess}
        resetToken={resetToken}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmit={handleAuthSubmit}
        onSwitchMode={(mode) => {
          setAuthMode(mode);
          setAuthError("");
          setAuthSuccess("");
        }}
      />
      <GuestFavoriteModal
        open={isGuestFavoriteModalOpen}
        onClose={() => setIsGuestFavoriteModalOpen(false)}
        onLogin={() => {
          setIsGuestFavoriteModalOpen(false);
          openAuthModal("login");
        }}
        onCreateAccount={() => {
          setIsGuestFavoriteModalOpen(false);
          openAuthModal("register");
        }}
      />
      <Toast message={toast} />
    </div>
  );
}

export default App;
