"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  GitBranch,
  Shield,
  Plug,
  LogOut,
  ChevronRight,
  Building2,
  FileSpreadsheet,
  User,
  FolderOpen,
  Lock,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "TB Analysis", href: "/analysis", icon: FileSpreadsheet },
  { label: "Scenarios", href: "/scenarios", icon: GitBranch },
  { label: "QoE Center", href: "/qoe", icon: Shield, comingSoon: true },
  { label: "Integrations", href: "/integrations", icon: Plug },
];

const bottomNavItems = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Uploads", href: "/uploads", icon: FolderOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-white/5 bg-[#0c0c14]">
        {/* Logo — clickable to home */}
        <a href="/" className="flex items-center gap-3 px-6 py-6 hover:opacity-80 transition-opacity">
          <img src="/axiom-logo.png" alt="CortexCFO" className="h-9 w-9 rounded-lg object-cover shadow-lg shadow-indigo-500/20" />
          <span className="text-lg font-semibold tracking-tight">CortexCFO</span>
        </a>

        {/* Workspace */}
        <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10">
            <Building2 className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              TechFlow Solutions
            </p>
            <p className="text-[10px] text-white/40">Active workspace</p>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-white/20" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Platform
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const comingSoon = (item as { comingSoon?: boolean }).comingSoon;

            return (
              <motion.button
                key={item.href}
                onClick={() => !comingSoon && router.push(item.href)}
                whileHover={{ x: comingSoon ? 0 : 2 }}
                whileTap={{ scale: comingSoon ? 1 : 0.98 }}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  comingSoon
                    ? "text-white/20 cursor-default"
                    : isActive
                    ? "bg-indigo-500/10 text-white"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                {isActive && !comingSoon && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-500"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`h-4.5 w-4.5 ${isActive && !comingSoon ? "text-indigo-400" : "text-white/25"}`} />
                <span>{item.label}</span>
                {comingSoon && (
                  <span className="ml-auto text-[9px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded-full">Soon</span>
                )}
              </motion.button>
            );
          })}

          {/* Bottom nav items */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/20">Account</p>
            {bottomNavItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "bg-indigo-500/10 text-white" : "text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-white/5 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/80"
          >
            <LogOut className="h-4 w-4 text-white/40" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
