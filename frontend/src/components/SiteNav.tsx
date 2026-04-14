"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Play, ArrowUpRight, Sparkles } from "lucide-react";

/* ─── Dropdown data ─── */
const productLinks = [
  {
    section: "Product",
    items: [
      { label: "Planning", desc: "Enable teams to plan together with clarity, speed, and control.", href: "/product" },
      { label: "Reporting", desc: "Transform financial data into compelling story-driven reports.", href: "/product" },
      { label: "Modeling", desc: "Turn complex business logic into clear, scalable simulations.", href: "/product" },
    ],
  },
  {
    section: "Knowledge",
    items: [
      { label: "Changelog", desc: null, href: "/blog" },
      { label: "Product docs", desc: null, href: "/blog" },
      { label: "Integrations", desc: null, href: "/blog" },
    ],
  },
];

const resourceLinks = [
  { label: "Customer stories", href: "/about" },
  { label: "Changelog", href: "/blog" },
  { label: "Glossary", href: "/glossary" },
  { label: "Blog", href: "/blog" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Careers", href: "/about" },
  { label: "Security", href: "/privacy" },
];

function Dropdown({
  children,
  show,
  onEnter,
  onLeave,
}: {
  children: React.ReactNode;
  show: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {show && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50"
          style={{ minWidth: 280 }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-black/[0.06] overflow-hidden animate-scale-in" />
        </div>
      )}
    </div>
  );
}

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDropdown = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(name);
  };

  const closeDropdown = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <>
      {/* Top banner */}
      <div className="bg-[#1a1a1a] text-white text-center py-2.5 px-4 text-[13px] font-medium z-[60] relative">
        <Link href="/blog" className="inline-flex items-center gap-2 hover:underline">
          <span className="text-[#f2a60c] font-semibold">Free playbook</span>
          <span className="text-white/70">Before you spend $50K on AI, run this audit</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-white/40" />
        </Link>
      </div>

      <nav
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-black/[0.04]"
            : "bg-[#f5f3ef]"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <span className="text-[22px] font-black tracking-tight text-[#1a1a1a] font-serif-heading italic">
              cortexcfo
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              href="/about"
              className="px-4 py-2 text-[14px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors rounded-lg"
            >
              Customers
            </Link>

            {/* Product dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("product")}
              onMouseLeave={closeDropdown}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-[14px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors rounded-lg">
                Product <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === "product" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden w-[520px] animate-scale-in">
                    <div className="grid grid-cols-2 divide-x divide-black/[0.04]">
                      {productLinks.map((section) => (
                        <div key={section.section} className="p-4">
                          <p className="text-[11px] font-semibold text-black/30 uppercase tracking-wider mb-2 px-2">
                            {section.section}
                          </p>
                          {section.items.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="block px-3 py-2.5 rounded-xl hover:bg-[#f5f3ef] transition-colors"
                            >
                              <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.label}</p>
                              {item.desc && (
                                <p className="text-[12px] text-black/40 mt-0.5 leading-snug">{item.desc}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#faf9f7] border-t border-black/[0.04] px-5 py-3">
                      <Link href="/blog" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-[#f2a60c]/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-[#f2a60c]" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-[#1a1a1a] group-hover:text-[#f2a60c] transition-colors">
                            Latest: AI-Powered Variance Analysis
                          </p>
                          <p className="text-[11px] text-black/35">See what&apos;s new</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/pricing"
              className="px-4 py-2 text-[14px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors rounded-lg"
            >
              Pricing
            </Link>

            {/* Resources dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("resources")}
              onMouseLeave={closeDropdown}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-[14px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors rounded-lg">
                Resources <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden w-[240px] p-2 animate-scale-in">
                    {resourceLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-3 py-2 rounded-xl text-[13px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#f5f3ef] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Company dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openDropdown("company")}
              onMouseLeave={closeDropdown}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-[14px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors rounded-lg">
                Company <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {activeDropdown === "company" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden w-[220px] p-2 animate-scale-in">
                    {companyLinks.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block px-3 py-2 rounded-xl text-[13px] text-[#1a1a1a]/70 hover:text-[#1a1a1a] hover:bg-[#f5f3ef] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[14px] text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link
              href="/contact"
              className="btn-accent text-[13px] !py-2.5 !px-5"
            >
              Talk to a human
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
