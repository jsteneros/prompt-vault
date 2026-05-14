import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  KeyRound,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

function SettingsPanel({
  user,
  avatarUrl,
  onBack,
  onSaveProfile,
  onChangePassword,
  onResendVerification,
}) {
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const isVerified = Boolean(user?.emailVerifiedAt);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    setProfileMessage("");

    const result = await onSaveProfile(profileForm);

    if (result.ok) {
      setProfileMessage(result.message || "Profile updated.");
    } else {
      setProfileError(result.error || "Could not update profile.");
    }

    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    const result = await onChangePassword(passwordForm);

    if (result.ok) {
      setPasswordMessage(result.message || "Password updated.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordError(result.error || "Could not update password.");
    }

    setIsSavingPassword(false);
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setVerificationError("");
    setVerificationMessage("");

    const result = await onResendVerification();

    if (result.ok) {
      setVerificationMessage(result.message || "Verification email sent.");
    } else {
      setVerificationError(result.error || "Could not send verification email.");
    }

    setIsResendingVerification(false);
  };

  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[28px] border border-[#d5d5d5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-[#d4d4d4] px-3 py-2 text-sm font-medium text-[#5f5f5f] transition hover:bg-[#f4f4f4]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </button>

        <div className="mt-6 flex flex-col items-center text-center">
          <img
            src={avatarUrl}
            alt={user.email}
            className="h-20 w-20 rounded-full border border-[#d3d3d3] bg-white object-cover shadow-sm"
          />
          <h2 className="mt-4 text-2xl font-semibold text-[#3a3a3a]">
            {user.name}
          </h2>
          <p className="mt-1 text-sm text-[#808080]">{user.email}</p>
          <span
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              isVerified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isVerified ? (
              <BadgeCheck className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {isVerified ? "Email verified" : "Email not verified"}
          </span>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-[#f6f6f6] p-4 text-sm text-[#666]">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-4 w-4 text-[#8b8b8b]" />
            <span>Manage your account details</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-[#8b8b8b]" />
            <span>Keep your login secure</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[#8b8b8b]" />
            <span>Control your email verification status</span>
          </div>
        </div>
      </aside>

      <div className="space-y-5">
        <div className="rounded-[28px] border border-[#d5d5d5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7f1e]">
                Profile
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-[#3a3a3a]">
                Account details
              </h3>
            </div>
          </div>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleProfileSubmit}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(event) =>
                  setProfileForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#444444] px-4 text-sm font-semibold text-white transition hover:bg-[#363636] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSavingProfile ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>

          {profileError ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {profileError}
            </p>
          ) : null}
          {profileMessage ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {profileMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[#d5d5d5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7f1e]">
                Verification
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-[#3a3a3a]">
                Email status
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-[#6f6f6f]">
                {isVerified
                  ? "Your email is verified. You are all set."
                  : "Verify your email to confirm account ownership and keep recovery flows reliable."}
              </p>
            </div>

            {!isVerified ? (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d3d3d3] px-4 text-sm font-semibold text-[#5f5f5f] transition hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                {isResendingVerification ? "Sending..." : "Resend verification"}
              </button>
            ) : null}
          </div>

          {verificationError ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {verificationError}
            </p>
          ) : null}
          {verificationMessage ? (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {verificationMessage}
            </p>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-[#d5d5d5] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7f1e]">
              Security
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-[#3a3a3a]">
              Change password
            </h3>
          </div>

          <form className="grid gap-4 md:grid-cols-3" onSubmit={handlePasswordSubmit}>
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Current password
              </span>
              <input
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                New password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    newPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Confirm new password
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((current) => ({
                    ...current,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-[#d3d3d3] bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400"
              />
            </label>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#444444] px-4 text-sm font-semibold text-white transition hover:bg-[#363636] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {isSavingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>

          {passwordError ? (
            <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {passwordError}
            </p>
          ) : null}
          {passwordMessage ? (
            <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {passwordMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SettingsPanel;
