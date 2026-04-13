"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Mail, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch user email on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    api.getMe().then((user) => {
      if (user.is_email_verified) {
        router.replace("/onboarding");
        return;
      }
      setEmail(user.email);
    }).catch(() => {
      router.replace("/login");
    });
  }, [router]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newCode = [...code];
      digits.forEach((d, i) => {
        if (index + i < 6) newCode[index + i] = d;
      });
      setCode(newCode);
      const nextIdx = Math.min(index + digits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await api.verifyEmail(fullCode);
      setSuccess(true);
      setTimeout(() => {
        router.push("/onboarding");
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("Invalid or expired")) {
        setError("Invalid or expired code. Please try again or request a new code.");
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when all 6 digits entered
  useEffect(() => {
    if (code.every((d) => d !== "")) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

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
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#1a1a1a]">CortexCFO</span>
          </Link>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Verify your email</h1>
          <p className="text-sm text-[#999] mt-2">
            We sent a 6-digit code to<br />
            <span className="text-[#1a1a1a] font-medium">{email || "..."}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-emerald-600">Email verified! Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
              )}

              {/* 6-digit code input */}
              <div className="flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-13 text-center text-lg font-semibold rounded-lg border border-[#e5e5e5] bg-white text-[#1a1a1a] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.some((d) => d === "")}
                className="w-full bg-[#1a1a1a] text-white font-medium py-2.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                ) : (
                  "Verify email"
                )}
              </button>
            </form>
          )}
        </div>

        {/* Resend */}
        {!success && (
          <p className="text-center text-sm text-[#999] mt-6">
            Didn&apos;t receive a code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-[#bbb]">Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend code"}
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
