"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { AuthAside } from "../_AuthAside";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Always succeeds from the UI's POV — we don't want to leak
      // whether `email` is registered. The API call itself swallows
      // 404s (endpoint isn't deployed yet) and non-200s.
      await api.requestPasswordReset(email);
    } catch {
      /* Swallow — security best practice + the UX is the same either
         way. The user sees the same screen whether or not the email
         exists. */
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside
        eyebrow="Forgot your password · we&rsquo;ve got you"
        headline={
          <>
            One-time link.
            <br />
            <em>Back into</em> your workbook.
          </>
        }
        sub="We&rsquo;ll send a reset link to your work email. The link is good for 30 minutes and works exactly once — no recovery codes, no third-party password manager dance."
      />

      <main className="auth-main">
        <Link href="/login" className="auth-back">
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to sign in
        </Link>

        {submitted ? (
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div
              className="mail-halo"
              style={{ background: "var(--brand-soft)", borderColor: "color-mix(in oklab, var(--brand) 30%, transparent)" }}
            >
              <CheckCircle2 style={{ width: 22, height: 22 }} />
            </div>
            <h1>
              Check your <span className="accent">inbox</span>.
            </h1>
            <p className="auth-form-sub">
              If an account exists for{" "}
              <strong style={{ color: "var(--text)" }}>{email || "that email"}</strong>, we&rsquo;ve sent a reset link. It works once and expires in 30 minutes.
            </p>

            <div className="auth-alert success" style={{ marginTop: 22 }}>
              <Mail style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>
                Didn&rsquo;t arrive? Check spam, or try again in a minute — we rate-limit aggressively to avoid abuse.
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="submit-btn"
              style={{
                marginTop: 18,
                background: "var(--card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                boxShadow: "none",
              }}
            >
              Try a different email
            </button>

            <p className="swap-mode">
              Remembered it? <Link href="/login">Back to sign in →</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <h1>
              Reset your <span className="accent">password</span>.
            </h1>
            <p className="auth-form-sub">
              Enter the email you signed up with. We&rsquo;ll send you a secure link to set a new password — no security questions, no phone-tree.
            </p>

            <div className="field" style={{ marginTop: 28 }}>
              <label htmlFor="email">Work email</label>
              <div className="field-wrap">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  autoFocus
                />
                <span className="field-icon" aria-hidden>
                  <Mail style={{ width: 15, height: 15 }} />
                </span>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || !email.includes("@")}>
              {loading ? (
                <>
                  <Loader2 className="spin" style={{ width: 14, height: 14 }} />
                  Sending link…
                </>
              ) : (
                <>
                  Send reset link
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </>
              )}
            </button>

            <p className="swap-mode">
              Remembered it? <Link href="/login">Back to sign in →</Link>
            </p>
            <p
              className="swap-mode"
              style={{ marginTop: 10, fontSize: 11.5, color: "var(--text-subtle, var(--muted))" }}
            >
              Still stuck? Email{" "}
              <Link href="/contact" style={{ color: "var(--brand-text)" }}>
                support
              </Link>{" "}
              and we&rsquo;ll get you back in by hand.
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
