"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.signup(email, password, name);
      await api.login(email, password);
      router.push("/onboarding");
    } catch {
      setError("Failed to create account. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">CortexCFO</span>
          </Link>
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="text-sm text-white/40 mt-1">Start your free trial</p>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/8 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
            )}
            <div>
              <label className="block text-sm text-white/50 mb-1.5 font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1.5 font-medium">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-500 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
