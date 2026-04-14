"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/5 py-12 px-6 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">CortexCFO</span>
            </div>
            <p className="text-xs text-white/25 leading-relaxed">
              AI-powered financial intelligence for Indian businesses.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: [
                { label: "Overview", href: "/product" },
                { label: "Pricing", href: "/pricing" },
                { label: "Industries", href: "/industries" },
                { label: "Glossary", href: "/glossary" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "FAQ", href: "/faq" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-6 flex items-center justify-between">
          <p className="text-xs text-white/20">
            &copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.
          </p>
          <div className="flex gap-4 text-xs text-white/20">
            <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white/40">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-white/40">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
