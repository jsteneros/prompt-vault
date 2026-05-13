import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Mail, User, X } from "lucide-react";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function AuthModal({
  open,
  mode,
  onClose,
  onSubmit,
  onSwitchMode,
  error,
  successMessage,
  resetToken = "",
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!open) return;
    setForm(initialForm);
  }, [open, mode]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const isRegister = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isResetPassword = mode === "reset";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isResetPassword && form.password !== form.confirmPassword) {
      onSubmit({
        localError: "Passwords do not match.",
      });
      return;
    }
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      token: resetToken,
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl md:p-7"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  PromptVault Account
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {isRegister
                    ? "Create Account"
                    : isForgotPassword
                      ? "Forgot Password"
                      : isResetPassword
                        ? "Reset Password"
                        : "Login"}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                aria-label="Close auth form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {isRegister ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Name
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                    <User className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                </label>
              ) : null}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none"
                    placeholder="you@email.com"
                  />
                </div>
              </label>

              {!isForgotPassword ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Password
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none"
                      placeholder="At least 6 characters"
                    />
                  </div>
                </label>
              ) : null}

              {isResetPassword ? (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    Confirm Password
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
                    <Lock className="h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={form.confirmPassword}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      className="w-full border-0 bg-transparent text-sm text-slate-800 outline-none"
                      placeholder="Repeat your new password"
                    />
                  </div>
                </label>
              ) : null}
            </div>

            {error ? (
              <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            {successMessage ? (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {isRegister
                ? "Create account"
                : isForgotPassword
                  ? "Send reset link"
                  : isResetPassword
                    ? "Reset password"
                    : "Login"}
            </button>

            {!isResetPassword ? (
              <div className="mt-4 space-y-2 text-center text-sm text-slate-600">
                <p>
                  {isRegister ? "Already have an account?" : "No account yet?"}{" "}
                  <button
                    type="button"
                    onClick={() => onSwitchMode(isRegister ? "login" : "register")}
                    className="font-medium text-cyan-700 transition hover:text-cyan-800"
                  >
                    {isRegister ? "Login" : "Create one"}
                  </button>
                </p>
                {!isRegister && !isForgotPassword ? (
                  <p>
                    <button
                      type="button"
                      onClick={() => onSwitchMode("forgot")}
                      className="font-medium text-cyan-700 transition hover:text-cyan-800"
                    >
                      Forgot password?
                    </button>
                  </p>
                ) : null}
                {isForgotPassword ? (
                  <p>
                    Remembered it?{" "}
                    <button
                      type="button"
                      onClick={() => onSwitchMode("login")}
                      className="font-medium text-cyan-700 transition hover:text-cyan-800"
                    >
                      Back to login
                    </button>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-center text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => onSwitchMode("login")}
                  className="font-medium text-cyan-700 transition hover:text-cyan-800"
                >
                  Back to login
                </button>
              </p>
            )}
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default AuthModal;
