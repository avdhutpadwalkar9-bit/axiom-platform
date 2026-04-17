"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Loader2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function SignupPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password-strength checks
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
      // Populate the auth store + user cache so a later return to landing
      // paints the signed-in state without a cold round-trip to /auth/me.
      await checkAuth();
      // Backend sends verification code on signup; route user to the code-entry page.
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
    <div className="flex min-h-screen items-center justify-center bg-app-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-app-text" />
            </div>
            <span className="text-lg font-semibold text-app-text">CortexCFO</span>
          </Link>
          <h1 className="text-2xl font-semibold text-app-text">Create your account</h1>
          <p className="text-sm text-app-text-subtle mt-1">Start your 14-day trial. No card required.</p>
        </div>

        <div className="bg-app-card rounded-xl border border-app-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-app-text-muted mb-1.5 font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-app-text-muted mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-app-text-muted mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
              {password.length > 0 && (
                <ul className="mt-2 space-y-1 text-[11px]">
                  <StrengthLine ok={checks.length} label="At least 8 characters" />
                  <StrengthLine ok={checks.letter} label="Contains a letter" />
                  <StrengthLine ok={checks.number} label="Contains a number" />
                </ul>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !allChecksPass}
              className="w-full bg-emerald-500 text-app-text font-medium py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-app-text-subtle mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function StrengthLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-400" : "text-app-text-subtle"}`}>
      <Check className={`w-3 h-3 ${ok ? "opacity-100" : "opacity-30"}`} />
      <span>{label}</span>
    </li>
  );
}
