"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Mail, Eye, EyeOff, Check, User } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthAside } from "../_AuthAside";

export default function SignupPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength checks
  const checks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /\d/.test(password),
  };
  const allChecksPass = checks.length && checks.letter && checks.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allChecksPass) {
      setError("Password must be at least 8 characters and include a letter and a number.");
      return;
    }

    setLoading(true);
    try {
      await api.signup(email, password, name);
      await api.login(email, password);
      await checkAuth();
      router.push("/verify-email");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("email already")) {
        setError("This email is already registered. Try signing in instead.");
      } else if (msg) {
        setError(msg);
      } else {
        setError("We couldn't create your account. Please check your details and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside
        eyebrow="QoE-ready in two weeks · not two months"
        headline={
          <>
            Start your <em>QoE workbook</em>.
            <br />
            We&rsquo;ll do the joining.
          </>
        }
        sub="14-day trial · no card · upload one trial balance to see your reported and adjusted EBITDA side-by-side within the hour."
        cite={{
          text: "Two clicks and we had a defensible add-back schedule the buyer's diligence team accepted as-is.",
          who: "Ravi M · Promoter-CFO · Auto-components MSME",
        }}
      />

      <main className="auth-main">
        <Link href="/" className="auth-back">
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to home
        </Link>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h1>
            Create your <span className="accent">workspace</span>.
            <br />
            Free for 14 days.
          </h1>
          <p className="auth-form-sub">
            We&rsquo;ll auto-classify your TB, flag QoE adjustments, and have a draft workbook ready before your first coffee.
          </p>

          {error && (
            <div className="auth-alert error" role="alert" style={{ marginTop: 18 }}>
              {error}
            </div>
          )}

          <div className="field" style={{ marginTop: error ? 14 : 28 }}>
            <label htmlFor="name">Your name</label>
            <div className="field-wrap">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vikram Shah"
                autoComplete="name"
              />
              <span className="field-icon" aria-hidden>
                <User style={{ width: 15, height: 15 }} />
              </span>
            </div>
          </div>

          <div className="field">
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
              />
              <span className="field-icon" aria-hidden>
                <Mail style={{ width: 15, height: 15 }} />
              </span>
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
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
            {password.length > 0 && (
              <ul className="strength">
                <StrengthLine ok={checks.length} label="At least 8 characters" />
                <StrengthLine ok={checks.letter} label="Contains a letter" />
                <StrengthLine ok={checks.number} label="Contains a number" />
              </ul>
            )}
          </div>

          <button type="submit" className="submit-btn" disabled={loading || !allChecksPass}>
            {loading ? (
              <>
                <Loader2 className="spin" style={{ width: 14, height: 14 }} />
                Creating account…
              </>
            ) : (
              <>
                Create my workspace
                <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            )}
          </button>

          <p className="swap-mode">
            Already have an account? <Link href="/login">Sign in →</Link>
          </p>
        </form>

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
