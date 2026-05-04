"use client";

/**
 * /forgot-password
 *
 * Public — no auth required. User enters their email; we POST to
 * /api/auth/forgot-password and the backend sends the reset email if
 * the address matches a registered user.
 *
 * UX rules:
 *  - On success we ALWAYS show the same neutral "check your inbox"
 *    message regardless of whether the email exists. The backend already
 *    enforces this server-side; mirroring it on the client keeps the
 *    enumeration defense honest end-to-end.
 *  - Cooldown errors (429) DO surface — they tell honest users to slow
 *    down without revealing registration state.
 *  - "Send another link" reset returns to the form so the user can fix
 *    a typo without page reload.
 */

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Loader2, MailCheck, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

type Status = "idle" | "submitting" | "success" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMessage(null);
    try {
      await api.forgotPassword(email);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      // The api.request() helper throws Error(serverDetail) so the
      // 429 cooldown / 422 validation message lands in err.message.
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again in a moment.",
      );
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
    setEmail("");
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
            {status === "success" ? "Check your inbox" : "Forgot your password?"}
          </h1>
          <p className="text-sm text-app-text-subtle mt-1">
            {status === "success"
              ? "If an account exists for that email, we've sent a reset link."
              : "Enter the email on your account and we'll email you a reset link."}
          </p>
        </div>

        <div className="bg-app-card rounded-xl border border-app-border p-6">
          {status === "success" ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <MailCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-sm text-app-text-muted leading-relaxed mb-1">
                Reset link sent to{" "}
                <span className="text-app-text font-medium break-all">{email}</span>
              </p>
              <p className="text-xs text-app-text-subtle leading-relaxed mb-6">
                The link expires in 60 minutes. If you don&rsquo;t see the email,
                check spam — or wait 60 seconds and{" "}
                <button
                  type="button"
                  onClick={reset}
                  className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                >
                  send another
                </button>
                .
              </p>
              <Link
                href="/login"
                className="inline-block text-sm text-app-text-muted hover:text-app-text font-medium underline underline-offset-4"
              >
                Back to sign in
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
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                  disabled={status === "submitting"}
                  className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={status === "submitting" || !email.trim()}
                className="w-full bg-emerald-500 text-app-text font-medium py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending link…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-app-text-subtle mt-6">
          Remembered it?{" "}
          <Link
            href="/login"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
