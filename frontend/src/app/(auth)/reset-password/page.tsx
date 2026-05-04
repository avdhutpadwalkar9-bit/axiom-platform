"use client";

/**
 * /reset-password?token=...
 *
 * Public — no auth required. The user lands here from the email link;
 * the token rides in the query string. They type a new password (twice)
 * and submit.
 *
 * UX rules:
 *  - Read the token from searchParams via useSearchParams(). The page is
 *    "use client" because the form needs to manage state, so reading
 *    searchParams via the hook is fine — no Suspense boundary worry
 *    here since we're already a client component AND wrap appropriately.
 *  - If the token is missing, show a clear "this link is invalid" state
 *    with a way to request a new one. Don't render the password form.
 *  - On success, route to /login with a friendly toast-style banner.
 *  - All token-validation failures (expired/used/unknown) collapse to
 *    the same banner — backend mirrors this.
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { api } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const tokenMissing = token.trim().length === 0;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    if (password.length < 8) {
      setStatus("error");
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setErrorMessage("Passwords don't match.");
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    try {
      await api.resetPassword(token, password);
      setStatus("success");
      // Give the user a moment to read the success state, then route
      // them to login pre-loaded for the new password.
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "We couldn't reset your password. The link may have expired — request a new one.",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-app-text" />
            </div>
            <span className="text-lg font-semibold text-app-text">CortexCFO</span>
          </Link>
          <h1 className="text-2xl font-semibold text-app-text">
            {status === "success"
              ? "Password reset"
              : tokenMissing
                ? "Reset link missing"
                : "Choose a new password"}
          </h1>
          <p className="text-sm text-app-text-subtle mt-1">
            {status === "success"
              ? "Sending you to sign in…"
              : tokenMissing
                ? "We couldn't find a reset token in this URL."
                : "Pick something memorable — 8 characters or more."}
          </p>
        </div>

        <div className="bg-app-card rounded-xl border border-app-border p-6">
          {status === "success" ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-app-text-muted leading-relaxed">
                You can now sign in with your new password.
              </p>
            </div>
          ) : tokenMissing ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-sm text-app-text-muted leading-relaxed mb-6">
                This reset link is incomplete. Try opening the link from
                your email again, or request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block bg-emerald-500 text-app-text font-medium py-2.5 px-5 rounded-lg hover:bg-emerald-400 transition-colors text-sm"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {status === "error" && errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm text-app-text-muted mb-1.5 font-medium">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    disabled={status === "submitting"}
                    className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 pr-10 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-subtle hover:text-app-text-muted transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-app-text-muted mb-1.5 font-medium">
                  Confirm password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Type it again"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={status === "submitting"}
                  className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={
                  status === "submitting" ||
                  password.length < 8 ||
                  !confirm
                }
                className="w-full bg-emerald-500 text-app-text font-medium py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Resetting…
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-app-text-subtle mt-6">
          <Link
            href="/login"
            className="text-app-text-muted hover:text-app-text font-medium"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// Wrap useSearchParams in Suspense to satisfy Next.js 16's static export
// rules — the build will fail without it.
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-app-canvas px-4">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      }
    >
      <ResetPasswordPageInner />
    </Suspense>
  );
}
