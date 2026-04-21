"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, TrendingUp, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import ThemeToggle from "@/components/ThemeToggle";

// useLayoutEffect warns during SSR. Swap to useEffect on the server so we
// don't get console noise — the difference is irrelevant there.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const productLinks = [
  { label: "Planning", desc: "Plan together with clarity and control.", href: "/product" },
  { label: "Reporting", desc: "Transform data into story-driven reports.", href: "/product" },
  { label: "Modeling", desc: "Scalable financial simulations.", href: "/product" },
];

const resourceLinks = [
  { label: "Knowledge Base", href: "/knowledge-base" },
  { label: "Blog", href: "/blog" },
  { label: "Glossary", href: "/glossary" },
  { label: "FAQ", href: "/faq" },
  { label: "Careers", href: "/careers" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // mounted: toggles to true on the client after first render so we can
  // safely display auth state pulled from localStorage without a hydration
  // mismatch. Pre-mount we render a neutral ghost that matches SSR.
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, hydrate, checkAuth, logout } = useAuthStore();

  // Pull the cached user out of localStorage before the browser paints, so
  // a returning user on landing sees their profile chip immediately instead
  // of "Sign in / Get started free" flashing first.
  useIsomorphicLayoutEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Validate the token in the background — confirms the optimistic seed
    // and refreshes the cached user object.
    checkAuth();
  }, [checkAuth]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  // Derive initials for the avatar chip.
  const initials = (user?.name || user?.email || "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  const openDropdown = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };
  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              CortexCFO
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/about"
              className={`px-3 py-2 text-[13px] rounded-lg transition-colors ${
                isActive("/about") ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              About
            </Link>

            {/* Product dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("product")}
              onMouseLeave={closeDropdown}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-[13px] text-white/50 hover:text-white/80 transition-colors rounded-lg">
                Product <ChevronDown className="w-3 h-3" />
              </button>
              {activeDropdown === "product" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-[#111] rounded-xl border border-white/[0.08] overflow-hidden w-[300px] animate-scale-in shadow-2xl">
                    <div className="p-3">
                      {productLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <p className="text-[13px] font-medium text-white">{item.label}</p>
                          <p className="text-[11px] text-white/35 mt-0.5">{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className={`px-3 py-2 text-[13px] rounded-lg transition-colors ${
                isActive("/pricing") ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Pricing
            </Link>

            {/* Resources dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("resources")}
              onMouseLeave={closeDropdown}
            >
              <button className="flex items-center gap-1 px-3 py-2 text-[13px] text-white/50 hover:text-white/80 transition-colors rounded-lg">
                Resources <ChevronDown className="w-3 h-3" />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-[#111] rounded-xl border border-white/[0.08] overflow-hidden w-[200px] animate-scale-in shadow-2xl">
                    <div className="p-2">
                      {resourceLinks.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`px-3 py-2 text-[13px] rounded-lg transition-colors ${
                isActive("/contact") ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            {/* Region toggle — one-click jump to the region-tailored
                landing. Shown on all non-app pages. */}
            <div
              role="group"
              aria-label="Choose region"
              className="hidden md:inline-flex items-center bg-white/[0.04] border border-white/10 rounded-full p-0.5"
            >
              <Link
                href="/us"
                className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                  pathname === "/us"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                🇺🇸 US
              </Link>
              <Link
                href="/in"
                className={`px-2.5 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                  pathname === "/in"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                🇮🇳 IN
              </Link>
            </div>
            <ThemeToggle compact />
            {!mounted ? (
              /* SSR + first client render: show a neutral ghost that matches
                 the guest-state width. After mount we swap to either the
                 profile chip or the guest CTAs based on localStorage. */
              <div
                className="hidden sm:block w-[180px] h-9"
                aria-hidden="true"
              />
            ) : isAuthenticated ? (
              /* Signed-in chip + dropdown: dashboard / log out */
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-[13px] bg-white/5 hover:bg-white/10 border border-white/10 text-white pl-1 pr-3 py-1 rounded-full transition-all"
                  aria-label="Account menu"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-semibold text-emerald-300">
                    {initials}
                  </div>
                  <span className="text-white/70 max-w-[120px] truncate">
                    {user?.name || user?.email?.split("@")[0] || "Account"}
                  </span>
                  <ChevronDown className="w-3 h-3 text-white/40" />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-[#111] rounded-xl border border-white/[0.08] overflow-hidden animate-scale-in shadow-2xl">
                    {user?.email && (
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-[11px] text-white/30 uppercase tracking-wider">Signed in as</p>
                        <p className="text-[13px] text-white/80 truncate">{user.email}</p>
                      </div>
                    )}
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Go to dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Two paired CTAs — Log in reads as an actual choice
                    alongside Get started, not a whisper next to a button.
                    Stitch audit flagged the previous text-link version as
                    sparse navigation; this is the paired-button fix. */}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex items-center gap-2 text-[13px] font-medium text-white/80 hover:text-white border border-white/[0.12] hover:border-white/[0.24] hover:bg-white/[0.04] px-4 py-2 rounded-xl transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex items-center gap-2 text-[13px] bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-400 transition-all font-medium btn-magnetic"
                >
                  Get started free
                </Link>
              </>
            )}
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a]/98 backdrop-blur-xl lg:hidden">
          <div className="pt-20 px-6 pb-8 flex flex-col gap-2">
            {[
              { label: "About", href: "/about" },
              { label: "Product", href: "/product" },
              { label: "Pricing", href: "/pricing" },
              { label: "Knowledge Base", href: "/knowledge-base" },
              { label: "Blog", href: "/blog" },
              { label: "FAQ", href: "/faq" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-white bg-white/[0.05]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-white/[0.06] mt-4 pt-4 flex items-center gap-3">
              <Link
                href="/us"
                className={`flex-1 text-center px-3 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                  pathname === "/us"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                🇺🇸 US
              </Link>
              <Link
                href="/in"
                className={`flex-1 text-center px-3 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                  pathname === "/in"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                🇮🇳 IN
              </Link>
              <ThemeToggle />
            </div>
            <div className="border-t border-white/[0.06] mt-2 pt-4 flex flex-col gap-3">
              {!mounted ? (
                // Match the pre-hydration state on the desktop side.
                <div className="h-[52px]" aria-hidden="true" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block text-center px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-all"
                  >
                    Go to dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/[0.08] transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block text-center px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white border border-white/[0.08] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="block text-center px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-all"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
