"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthAside } from "../_AuthAside";

export default function LoginPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email, password);
      await checkAuth();
      try {
        const me = await api.getMe();
        if (!me.is_email_verified) {
          router.push("/verify-email");
          return;
        }
      } catch {
        // If /auth/me fails we still try the dashboard; (app)/layout has its own gate.
      }
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside
        eyebrow="The continuous QoE engine"
        headline={
          <>
            Books in.
            <br />
            <em>Quality of Earnings</em> out.
          </>
        }
        sub="Every figure cited. Every add-back documented. CA-reviewed, buyer-ready, recalculated the moment your trial balance changes."
        cite={{
          text: "It cut three weeks off our diligence and the buyer signed without a single rework cycle.",
          who: "Ashish K · CFO · ₹120 Cr specialty chem rollup",
        }}
      />

      <main className="auth-main">
        <Link href="/" className="auth-back">
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to home
        </Link>

        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>
            Welcome back.
            <br />
            <span className="accent">Pick up where you left off.</span>
          </h1>
          <p className="auth-form-sub">
            Sign in to your workspace. We&rsquo;ll get you back to the QoE workbook in two clicks.
          </p>

          {error && (
            <div className="auth-alert error" role="alert" style={{ marginTop: 18 }}>
              {error}
            </div>
          )}

          <div className="field" style={{ marginTop: error ? 14 : 28 }}>
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
            <label htmlFor="password">
              Password
              <Link href="/forgot-password">Forgot?</Link>
            </label>
            <div className="field-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
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

          <div className="remember-row">
            <label className="check">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="box" />
              <span>Keep me signed in for 30 days</span>
            </label>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="spin" style={{ width: 14, height: 14 }} />
                Signing in…
              </>
            ) : (
              <>
                Sign in to workspace
                <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            )}
          </button>

          <p className="swap-mode">
            New to CortexCFO? <Link href="/signup">Start your free trial →</Link>
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
