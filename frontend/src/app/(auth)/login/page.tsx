"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Welcome back</h1>
          <p className="text-sm text-[#999] mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="block text-sm text-[#666] mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#ccc] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-[#666] mb-1.5 font-medium">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#ccc] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#1a1a1a] text-white font-medium py-2.5 rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50 text-sm">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#999] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
