"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  GitBranch,
  Shield,
  Plug,
  LogOut,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  User,
  FolderOpen,
  TrendingUp,
  Loader2,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";
import AIChatPanel from "@/components/AIChatPanel";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Analysis", href: "/analysis", icon: FileSpreadsheet },
  { label: "Industry Expertise", href: "/industries", icon: TrendingUp },
  { label: "Scenarios", href: "/scenarios", icon: GitBranch },
  { label: "QoE Center", href: "/qoe", icon: Shield },
  { label: "AI Feedback", href: "/feedback", icon: MessageSquare },
  { label: "Integrations", href: "/integrations", icon: Plug },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const { business, personal } = useOnboardingStore();

  useEffect(() => {
    let cancelled = false;

    async function gate() {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.replace("/login");
        return;
      }
      // Validate the token + enforce email verification via /auth/me.
      try {
        const me = await api.getMe();
        if (cancelled) return;
        if (!me.is_email_verified) {
          router.replace("/verify-email");
          return;
        }
        setMounted(true);
      } catch {
        if (cancelled) return;
        // api.request() already redirects on 401; this covers transient errors.
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
      }
    }

    gate();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.replace("/login");
  };

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-canvas text-app-text-subtle">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  const workspaceName = business.companyName || "My Workspace";
  const userName = personal.fullName || "User";
  const wsActive = pathname === "/profile" || pathname === "/uploads";

  return (
    <div className="flex h-screen bg-app-canvas text-app-text overflow-hidden">
      {/* Dark sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-app-border/70 bg-app-card">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-4 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-app-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-app-text">CortexCFO</span>
        </Link>

        {/* Workspace */}
        <div className="mx-4 mb-5">
          <button
            onClick={() => setWsOpen(!wsOpen)}
            className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
              wsOpen || wsActive ? "border-emerald-500/20 bg-emerald-500/5" : "border-app-border bg-app-canvas hover:bg-app-card-hover"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-app-text truncate">{workspaceName}</p>
              <p className="text-[10px] text-app-text-subtle">{userName}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-app-text-subtle transition-transform ${wsOpen ? "rotate-180" : ""}`} />
          </button>

          {wsOpen && (
            <div className="mt-1 ml-1 space-y-0.5">
              {[
                { label: "Profile & Business", href: "/profile", icon: User },
                { label: "Uploads", href: "/uploads", icon: FolderOpen },
              ].map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors ${
                      isActive ? "bg-emerald-500/10 text-emerald-400" : "text-app-text-subtle hover:bg-app-card-hover hover:text-app-text-muted"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-app-text-subtle">
            Platform
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const comingSoon = (item as { comingSoon?: boolean }).comingSoon;

            return (
              <button
                key={item.href}
                onClick={() => !comingSoon && router.push(item.href)}
                className={`relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors ${
                  comingSoon
                    ? "text-app-text/15 cursor-default"
                    : isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-app-text-subtle hover:bg-app-card-hover hover:text-app-text-muted"
                }`}
              >
                {isActive && !comingSoon && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-emerald-500" />
                )}
                <Icon className={`h-[18px] w-[18px] ${isActive && !comingSoon ? "text-emerald-400" : ""}`} />
                <span>{item.label}</span>
                {comingSoon && (
                  <span className="ml-auto text-[9px] bg-app-card-hover text-app-text-subtle px-1.5 py-0.5 rounded-full font-normal">Soon</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Subscription upgrade card */}
        <div className="px-3 pb-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/8 to-transparent border border-emerald-500/20 p-4">
            <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-app-text" />
                </div>
                <p className="text-[13px] font-semibold text-app-text">Upgrade to Pro</p>
              </div>
              <p className="text-[11px] text-app-text-muted leading-relaxed mb-3">
                Unlimited analyses, multi-entity workspaces and priority AI models.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/pricing")}
                  className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-app-text text-[11px] font-semibold py-1.5 transition-colors"
                >
                  Upgrade
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() => router.push("/pricing")}
                  className="text-[11px] text-app-text-subtle hover:text-app-text-muted font-medium transition-colors"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-app-border/70 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-app-text-subtle transition-colors hover:bg-app-card-hover hover:text-app-text-muted"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto page-enter bg-app-canvas">
        {children}
      </main>

      {/* Floating CFO advisor — visible on every authenticated page.
          The widget manages its own open/collapsed state and uses the
          live onboarding + analysis stores so it always sees what the
          user sees. */}
      <AIChatPanel />
    </div>
  );
}
