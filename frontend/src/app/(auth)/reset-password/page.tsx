"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/lib/api";
import { AuthAside } from "../_AuthAside";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Password strength checks — same rules as signup
  const checks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allChecksPass = checks.length && checks.letter && checks.number && checks.match;

  // Auto-redirect to login a moment after success
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => router.replace("/login"), 1500);
    return () => clearTimeout(t);
  }, [done, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Missing reset token. Open the link from the email we sent — it should look like /reset-password?token=…");
      return;
    }
    if (!allChecksPass) {
      setError("Please meet every password requirement before submitting.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("expired")) {
        setError("This reset link has expired. Request a new one and try again.");
      } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("not found")) {
        setError("Reset link is invalid or already used. Request a new one.");
      } else if (msg) {
        setError(msg);
      } else {
        setError("Couldn't reset password. Please try again or contact support.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside
        eyebrow="Set a new password"
        headline={
          <>
            New password.
            <br />
            <em>Same workbook.</em>
          </>
        }
        sub="Once set, every device signed into this account will be logged out and asked to sign back in — protects you from any session that shouldn't be there."
      />

      <main className="auth-main">
        <Link href="/login" className="auth-back">
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to sign in
        </Link>

        {done ? (
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div
              className="mail-halo"
              style={{
                background: "var(--brand-soft)",
                borderColor: "color-mix(in oklab, var(--brand) 30%, transparent)",
              }}
            >
              <CheckCircle2 style={{ width: 22, height: 22 }} />
            </div>
            <h1>
              Password <span className="accent">updated</span>.
            </h1>
            <p className="auth-form-sub">
              You can sign in with your new password now. Taking you to the sign-in page…
            </p>
            <div className="auth-alert success" style={{ marginTop: 22 }}>
              <Check style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>All other sessions were signed out as a precaution.</span>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1>
              Choose a <span className="accent">new password</span>.
            </h1>
            <p className="auth-form-sub">
              Make it long. We never store the actual password — just a one-way hash — but you do still need to remember it.
            </p>

            {!token && (
              <div className="auth-alert error" role="alert" style={{ marginTop: 18 }}>
                <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>
                  No reset token in this URL. Open the link from the password-reset email — it carries the token as a query
                  parameter.
                </span>
              </div>
            )}

            {error && (
              <div className="auth-alert error" role="alert" style={{ marginTop: 18 }}>
                <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div className="field" style={{ marginTop: error || !token ? 14 : 28 }}>
              <label htmlFor="password">New password</label>
              <div className="field-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="field-icon"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 15, height: 15 }} />
                  ) : (
                    <Eye style={{ width: 15, height: 15 }} />
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm new password</label>
              <div className="field-wrap">
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Same again"
                  autoComplete="new-password"
                  required
                />
                <span className="field-icon" aria-hidden>
                  <Lock style={{ width: 15, height: 15 }} />
                </span>
              </div>
              {password.length > 0 && (
                <ul className="strength">
                  <StrengthLine ok={checks.length} label="At least 8 characters" />
                  <StrengthLine ok={checks.letter} label="Contains a letter" />
                  <StrengthLine ok={checks.number} label="Contains a number" />
                  <StrengthLine ok={checks.match} label="Both fields match" />
                </ul>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !allChecksPass || !token}>
              {loading ? (
                <>
                  <Loader2 className="spin" style={{ width: 14, height: 14 }} />
                  Updating password…
                </>
              ) : (
                <>
                  Update password
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </>
              )}
            </button>

            <p className="swap-mode">
              Remembered the old one? <Link href="/login">Sign in →</Link>
            </p>
          </form>
        )}

        <div className="auth-foot">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Support</Link>
          <span style={{ opacity: 0.6 }}>© {new Date().getFullYear()} CortexCFO</span>
        </div>
      </main>
    </div>
  );
}

function StrengthLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? "ok" : ""}>
      <Check />
      <span>{label}</span>
    </li>
  );
}

export default function ResetPasswordPage() {
  // useSearchParams needs a Suspense boundary in Next 16, same pattern as
  // the /checkout and /billing pages.
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--canvas)",
            color: "var(--text-muted, var(--muted))",
          }}
        >
          Loading…
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
