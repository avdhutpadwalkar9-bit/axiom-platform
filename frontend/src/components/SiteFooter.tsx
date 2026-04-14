"use client";

import Link from "next/link";
import { TrendingUp, ArrowRight } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-20 pb-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* CTA */}
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-sm text-white/30 mb-8 max-w-md mx-auto">
            The modern way to plan, model, and align your business.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold btn-magnetic">
              Talk to us <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/product" className="inline-flex items-center gap-2 text-white/50 hover:text-white px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium transition-all">
              See it in action
            </Link>
          </div>
        </div>

        {/* Footer columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { label: "Book a demo", href: "/contact" },
                { label: "Planning", href: "/product" },
                { label: "Reporting", href: "/product" },
                { label: "Modeling", href: "/product" },
                { label: "Security", href: "/privacy" },
              ].map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Industries</p>
            <ul className="space-y-2.5">
              {["Manufacturing", "SaaS & Tech", "Services", "Trading", "Healthcare", "FMCG"].map((name) => (
                <li key={name}><Link href="/industries" className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Customers</p>
            <ul className="space-y-2.5">
              {[
                { label: "Success Stories", href: "/about" },
                { label: "Case Studies", href: "/blog" },
              ].map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Resources</p>
            <ul className="space-y-2.5">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Glossary", href: "/glossary" },
                { label: "Pricing", href: "/pricing" },
                { label: "FAQ", href: "/faq" },
              ].map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                { label: "About CortexCFO", href: "/about" },
                { label: "Contact us", href: "/contact" },
                { label: "Login", href: "/login" },
              ].map((l) => (
                <li key={l.label}><Link href={l.href} className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">Social</p>
            <ul className="space-y-2.5">
              {[
                { label: "LinkedIn", href: "https://linkedin.com" },
                { label: "Twitter / X", href: "https://x.com" },
                { label: "YouTube", href: "https://youtube.com" },
              ].map((l) => (
                <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/25 hover:text-white/50 transition-colors">{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-white" />
            </div>
            <p className="text-[12px] text-white/20">&copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">Security</Link>
            <Link href="/terms" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[12px] text-white/20 hover:text-white/40 transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
