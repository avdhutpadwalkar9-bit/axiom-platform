"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Sparkles, TrendingUp } from "lucide-react";

const productLinks = [
  { label: "Planning", desc: "Plan together with clarity and control.", href: "/product" },
  { label: "Reporting", desc: "Transform data into story-driven reports.", href: "/product" },
  { label: "Modeling", desc: "Scalable financial simulations.", href: "/product" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Glossary", href: "/glossary" },
  { label: "FAQ", href: "/faq" },
];

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

  const navLink = (label: string, href: string) => (
    <Link
      key={href}
      href={href}
      className={`px-3 py-2 text-[13px] rounded-lg transition-colors ${
        pathname === href ? "text-white" : "text-white/40 hover:text-white/70"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
    }`}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">CortexCFO</span>
        </Link>

        {/* Nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLink("Customers", "/about")}

          {/* Product dropdown */}
          <div className="relative" onMouseEnter={() => openDropdown("product")} onMouseLeave={closeDropdown}>
            <button className="flex items-center gap-1 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 transition-colors rounded-lg">
              Product <ChevronDown className="w-3 h-3" />
            </button>
            {activeDropdown === "product" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="bg-[#161616] rounded-xl border border-white/10 overflow-hidden w-[300px] animate-scale-in shadow-2xl">
                  <div className="p-3">
                    {productLinks.map((item) => (
                      <Link key={item.label} href={item.href} className="block px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors">
                        <p className="text-[13px] font-medium text-white">{item.label}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLink("Pricing", "/pricing")}

          {/* Resources dropdown */}
          <div className="relative" onMouseEnter={() => openDropdown("resources")} onMouseLeave={closeDropdown}>
            <button className="flex items-center gap-1 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 transition-colors rounded-lg">
              Resources <ChevronDown className="w-3 h-3" />
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                <div className="bg-[#161616] rounded-xl border border-white/10 overflow-hidden w-[200px] animate-scale-in shadow-2xl">
                  <div className="p-2">
                    {resourceLinks.map((item) => (
                      <Link key={item.label} href={item.href} className="block px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {navLink("Contact", "/contact")}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-white/40 hover:text-white transition-colors">Log in</Link>
          <Link href="/signup" className="text-[13px] bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 transition-all font-medium btn-magnetic">
            Get started free
          </Link>
        </div>
      </div>
    </nav>
  );
}
