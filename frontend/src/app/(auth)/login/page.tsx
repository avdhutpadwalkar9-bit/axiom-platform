"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(email, password);
      // Populate the auth store + user cache before navigating so SiteNav (and
      // anything else listening) paints the signed-in state without waiting
      // for its own checkAuth() to fire on mount.
      await checkAuth();
      // Respect email verification — unverified users go through /verify-email first.
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
    <div className="flex min-h-screen items-center justify-center bg-app-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-app-text" />
            </div>
            <span className="text-lg font-semibold text-app-text">CortexCFO</span>
          </Link>
          <h1 className="text-2xl font-semibold text-app-text">Welcome back</h1>
          <p className="text-sm text-app-text-subtle mt-1">Sign in to your account</p>
        </div>

        <div className="bg-app-card rounded-xl border border-app-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-app-border-strong bg-app-card-hover px-4 py-2.5 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 text-app-text font-medium py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-app-text-subtle mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
