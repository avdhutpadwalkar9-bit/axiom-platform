"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "TB Analysis", href: "/analysis", icon: FileSpreadsheet },
  { label: "Industry Expertise", href: "/industries", icon: TrendingUp },
  { label: "Scenarios", href: "/scenarios", icon: GitBranch },
  { label: "QoE Center", href: "/qoe", icon: Shield, comingSoon: true },
  { label: "Integrations", href: "/integrations", icon: Plug },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const { business, personal } = useOnboardingStore();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setMounted(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  if (!mounted) return null;

  const workspaceName = business.companyName || "My Workspace";
  const userName = personal.fullName || "User";
  const wsActive = pathname === "/profile" || pathname === "/uploads";

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Dark sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#111]">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 px-5 py-4 hover:opacity-80 transition-opacity">
          <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">CortexCFO</span>
        </a>

        {/* Workspace */}
        <div className="mx-4 mb-5">
          <button
            onClick={() => setWsOpen(!wsOpen)}
            className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors ${
              wsOpen || wsActive ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/8 bg-white/3 hover:bg-white/5"
            }`}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-white truncate">{workspaceName}</p>
              <p className="text-[10px] text-white/30">{userName}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-white/20 transition-transform ${wsOpen ? "rotate-180" : ""}`} />
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
                      isActive ? "bg-emerald-500/10 text-emerald-400" : "text-white/30 hover:bg-white/5 hover:text-white/60"
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
          <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-white/20">
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
                    ? "text-white/15 cursor-default"
                    : isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70"
                }`}
              >
                {isActive && !comingSoon && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-emerald-500" />
                )}
                <Icon className={`h-[18px] w-[18px] ${isActive && !comingSoon ? "text-emerald-400" : ""}`} />
                <span>{item.label}</span>
                {comingSoon && (
                  <span className="ml-auto text-[9px] bg-white/5 text-white/20 px-1.5 py-0.5 rounded-full font-normal">Soon</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-white/30 transition-colors hover:bg-white/5 hover:text-white/50"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto page-enter bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
