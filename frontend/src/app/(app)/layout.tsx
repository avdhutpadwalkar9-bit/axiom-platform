"use client";

import "./app-shell.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  GitBranch,
  Shield,
  Plug,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  FolderOpen,
  TrendingUp,
  Loader2,
  Search,
  Settings,
  FileText,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import AIChatPanel from "@/components/AIChatPanel";
import { FxProvider } from "@/context/FxContext";
import {
  isDemoEmail,
  isDemoAlreadySeeded,
  seedDemoOnboarding,
  clearDemoOnboarding,
} from "@/lib/demoMode";

// Top-level workspace navigation
const workspaceNav: { label: string; href: string; icon: typeof Home; badge?: string }[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Analysis", href: "/analysis", icon: BarChart3 },
  { label: "QoE Workbook", href: "/qoe", icon: Shield, badge: "9.0" },
  { label: "Scenarios", href: "/scenarios", icon: GitBranch },
  { label: "Industry", href: "/industries", icon: TrendingUp },
];

// Data + integrations section
// "Reports" renamed to "AI Feedback" 2026-05-20 — the page is an
// internal AI feedback analytics dashboard, not a generated-reports
// surface. CFOs clicking "Reports" expected board packs / P&L
// exports / diligence PDFs, then landed on thumbs-up/down stats —
// misleading. Real Reports page ships Phase 2.
const dataNav: { label: string; href: string; icon: typeof Home }[] = [
  { label: "Uploads", href: "/uploads", icon: FolderOpen },
  { label: "AI Feedback", href: "/feedback", icon: FileText },
  { label: "Integrations", href: "/integrations", icon: Plug },
];

// Breadcrumb segment builder — derives "Vadodara Chem / Dashboard / FY 2024-25"
function buildBreadcrumb(pathname: string, workspaceName: string) {
  const segs: { label: string; href?: string }[] = [{ label: workspaceName }];
  const pageMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/analysis": "Analysis",
    "/qoe": "QoE Workbook",
    "/scenarios": "Scenarios",
    "/industries": "Industry",
    "/integrations": "Integrations",
    "/uploads": "Uploads",
    "/feedback": "AI Feedback",
    "/profile": "Profile",
    "/billing": "Billing",
  };
  for (const [path, label] of Object.entries(pageMap)) {
    if (pathname.startsWith(path)) {
      segs.push({ label });
      break;
    }
  }
  return segs;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hasAiAccess, setHasAiAccess] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { business, personal } = useOnboardingStore();
  const authUser = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;

    async function gate() {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const me = await api.getMe();
        if (cancelled) return;
        if (!me.is_email_verified) {
          router.replace("/verify-email");
          return;
        }

        // Two-class demo-account handling. See lib/demoMode.ts for
        // the full rationale. tl;dr — demo email autoseeds Vadodara
        // Chem showcase data so prospects see a populated workspace;
        // real email sweeps any stale demo data so users don't see
        // a previous demo session bleeding into their own pages.
        if (isDemoEmail(me.email)) {
          if (!isDemoAlreadySeeded()) seedDemoOnboarding();
        } else {
          clearDemoOnboarding();
        }

        // Cache the user in the auth store so /profile, /billing,
        // SiteNav etc. all read from one source. Without this,
        // pages have to wait for their own getMe() round-trip.
        useAuthStore.setState({
          user: { id: me.id, email: me.email, name: me.name ?? null },
          isAuthenticated: true,
          isLoading: false,
        });
        try {
          localStorage.setItem("cortexcfo:user", JSON.stringify(me));
        } catch {
          /* quota — non-fatal */
        }

        setHasAiAccess(me.has_ai_access !== false);
        setMounted(true);
      } catch {
        if (cancelled) return;
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
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "var(--canvas)", color: "var(--text-subtle)" }}>
        <Loader2 className="animate-spin" style={{ width: 18, height: 18 }} />
      </div>
    );
  }

  // Sidebar identity — prefer the actual sign-in user, then any
  // onboarding-captured name, then a graceful default. Email-prefix
  // (the bit before "@") is a far better fallback than the word
  // "User" when a brand-new account has no name yet.
  const workspaceName =
    business.companyName ||
    (authUser?.email ? authUser.email.split("@")[1]?.split(".")[0] || "Workspace" : "My Workspace");
  const userName =
    (authUser?.name?.trim()) ||
    personal.fullName ||
    (authUser?.email ? authUser.email.split("@")[0] : "") ||
    "User";
  const userInitials = userName
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "U";

  const crumbs = buildBreadcrumb(pathname, workspaceName);

  // Active highlighting — same logic across both nav blocks.
  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <FxProvider>
      {/* style override: the design's .app uses 3-column grid (220 | 1fr | 44px)
          for a static chat dock. We removed the dock to avoid showing the AI
          twice, so drop the 3rd column and reclaim those 44px for the main
          content area. */}
      <div
        className={`app${sidebarCollapsed ? " sidebar-collapsed" : ""}`}
        style={{ gridTemplateColumns: sidebarCollapsed ? "64px 1fr" : "220px 1fr" }}
      >
        {/* ─── SIDEBAR ─────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-mark">C</div>
            <div className="sb-wordmark">
              Cortex<span>CFO</span>
            </div>
          </div>

          <div className="sb-section">Workspace</div>
          <nav className="sb-nav">
            {workspaceNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sb-item${active ? " active" : ""}`}
                >
                  <Icon className="sb-icon" />
                  <span>{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="sb-section">Data</div>
          <nav className="sb-nav">
            {dataNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sb-item${active ? " active" : ""}`}
                >
                  <Icon className="sb-icon" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sb-spacer" />

          <div className="sb-foot">
            <div className="sb-avatar">{userInitials}</div>
            <div className="sb-user">
              <div className="sb-user-name" title={userName}>{userName}</div>
              <div className="sb-user-org" title={workspaceName}>{workspaceName}</div>
            </div>
            <button
              className="sb-toggle"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronsRight style={{ width: 14, height: 14 }} /> : <ChevronsLeft style={{ width: 14, height: 14 }} />}
            </button>
          </div>
        </aside>

        {/* ─── MAIN COLUMN ─────────────────────────────────────── */}
        <main className="main">
          {/* Top bar — breadcrumb, search, action icons */}
          <div className="topbar">
            <div className="crumb">
              {crumbs.map((seg, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  {i > 0 && <span className="crumb-sep">/</span>}
                  <span className="crumb-seg">{seg.label}</span>
                </span>
              ))}
            </div>

            <div className="search-pill" role="button" tabIndex={0}>
              <Search style={{ width: 13, height: 13 }} />
              <input placeholder="Search uploads, reports, accounts…" />
              <span className="kbd">⌘K</span>
            </div>

            <div className="top-actions">
              {/* Topbar deliberately minimal — only the two icons that actually
                  do something today (settings + logout). Notifications, help
                  and other affordances will return when there's real plumbing
                  behind them. */}
              <button
                className="icon-btn"
                aria-label="Profile & settings"
                title="Profile & settings"
                onClick={() => router.push("/profile")}
              >
                <Settings style={{ width: 15, height: 15 }} />
              </button>
              <button
                className="icon-btn"
                aria-label="Log out"
                title="Log out"
                onClick={handleLogout}
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>

          {/* Page content */}
          <div className="content">{children}</div>
        </main>

        {/* AI chat — single surface. The AIChatPanel component owns its
            own floating button (bottom-right) and full expand state, so
            we don't need the chat-dock aside too. */}
        {hasAiAccess && <AIChatPanel />}
      </div>
    </FxProvider>
  );
}
