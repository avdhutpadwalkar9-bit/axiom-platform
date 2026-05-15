"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { AuthAside } from "../_AuthAside";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resolve current user / route guard
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    api
      .getMe()
      .then((user) => {
        if (user.is_email_verified) {
          router.replace("/onboarding");
          return;
        }
        setEmail(user.email);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((p) => p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const submitCode = useCallback(
    async (fullCode: string) => {
      setError("");
      setLoading(true);
      try {
        await api.verifyEmail(fullCode);
        setSuccess(true);
        setTimeout(() => router.push("/onboarding"), 900);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(
          msg.includes("Invalid or expired")
            ? "Invalid or expired code. Please try again or request a new one."
            : "Verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const next = [...code];
      digits.forEach((d, i) => {
        if (index + i < 6) next[index + i] = d;
      });
      setCode(next);
      const targetIdx = Math.min(index + digits.length, 5);
      inputRefs.current[targetIdx]?.focus();
      if (next.every((d) => d !== "")) submitCode(next.join(""));
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) submitCode(next.join(""));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const full = code.join("");
    if (full.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }
    submitCode(full);
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError("");
    try {
      await api.resendVerification();
      setResendCooldown(60);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("wait")) {
        setResendCooldown(60);
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <AuthAside
        eyebrow="One last step · we promise"
        headline={
          <>
            Verify your <em>inbox</em>.
            <br />
            Unlock your workspace.
          </>
        }
        sub="Email verification keeps your QoE workbook secure — only you can see the add-back schedules and underlying ledger references."
      />

      <main className="auth-main">
        <Link href="/login" className="auth-back">
          <ArrowLeft style={{ width: 12, height: 12 }} />
          Back to sign in
        </Link>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mail-halo">
            <Mail style={{ width: 22, height: 22 }} />
          </div>
          <h1>
            Verify your <span className="accent">email</span>.
          </h1>
          <p className="auth-form-sub">
            We sent a 6-digit code to{" "}
            <span style={{ color: "var(--text)", fontWeight: 500 }}>{email || "your inbox"}</span>
            . Paste or type it in — we&rsquo;ll auto-submit when it&rsquo;s complete.
          </p>

          {success ? (
            <div className="auth-alert success" style={{ marginTop: 22 }}>
              <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span>Email verified! Taking you to onboarding…</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="auth-alert error" role="alert" style={{ marginTop: 22 }}>
                  {error}
                </div>
              )}

              <div className="code-row" style={{ marginTop: error ? 14 : 22 }}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    autoFocus={i === 0}
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || code.some((d) => d === "")}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" style={{ width: 14, height: 14 }} />
                    Verifying…
                  </>
                ) : (
                  <>
                    Verify and continue
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </>
                )}
              </button>

              <p className="swap-mode">
                Didn&rsquo;t receive a code?{" "}
                {resendCooldown > 0 ? (
                  <span style={{ color: "var(--text-subtle, var(--muted))" }}>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "var(--brand-text)",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      padding: 0,
                    }}
                  >
                    {resendLoading ? "Sending…" : "Resend code"}
                  </button>
                )}
              </p>
            </>
          )}
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
