"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#f5f3ef] pt-20 pb-12 px-6 relative overflow-hidden">
      {/* Massive watermark text */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none select-none overflow-hidden">
        <span className="watermark-text whitespace-nowrap">
          CORTEXCFO
        </span>
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Final CTA */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-serif-heading font-bold text-[#1a1a1a] mb-4">
            Ready to get started?
          </h2>
          <p className="text-[15px] text-black/40 mb-8 max-w-md mx-auto">
            CortexCFO is the modern and intuitive way to model, plan, and align your business for everyone on your team.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="btn-accent">
              Talk to a human
            </Link>
            <Link href="/product" className="btn-secondary">
              See it in action
            </Link>
          </div>
        </div>

        {/* Footer columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Product */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Product</p>
            <ul className="space-y-2.5">
              {[
                { label: "Book a demo", href: "/contact" },
                { label: "Planning", href: "/product" },
                { label: "Modeling", href: "/product" },
                { label: "Reporting", href: "/product" },
                { label: "Security", href: "/privacy" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-black/40 hover:text-black/70 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparisons */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Comparisons</p>
            <ul className="space-y-2.5">
              {[
                "Excel", "Anaplan", "Workday", "Drivetrain", "Aleph", "Datarails", "Mosaic", "Pigment",
              ].map((name) => (
                <li key={name}>
                  <Link href="/product" className="text-[13px] text-black/40 hover:text-black/70 transition-colors">
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customers */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Customers</p>
            <ul className="space-y-2.5">
              {[
                { label: "Success Stories", href: "/about" },
                { label: "Zerodha", href: "/about" },
                { label: "Razorpay", href: "/about" },
                { label: "CRED", href: "/about" },
                { label: "Meesho", href: "/about" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-black/40 hover:text-black/70 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Resources</p>
            <ul className="space-y-2.5">
              {[
                { label: "Blog", href: "/blog" },
                { label: "Glossary", href: "/glossary" },
                { label: "Pricing", href: "/pricing" },
                { label: "Docs", href: "/blog" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-black/40 hover:text-black/70 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                { label: "About CortexCFO", href: "/about" },
                { label: "Careers", href: "/about", badge: "Hiring!" },
                { label: "Contact us", href: "/contact" },
                { label: "Login", href: "/login" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-black/40 hover:text-black/70 transition-colors inline-flex items-center gap-1.5">
                    {l.label}
                    {"badge" in l && l.badge && (
                      <span className="text-[10px] font-semibold text-[#f2a60c] bg-[#f2a60c]/10 px-1.5 py-0.5 rounded-full">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Social</p>
            <ul className="space-y-2.5">
              {[
                { label: "YouTube", href: "https://youtube.com" },
                { label: "LinkedIn", href: "https://linkedin.com" },
                { label: "X", href: "https://x.com" },
                { label: "Instagram", href: "https://instagram.com" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-black/40 hover:text-black/70 transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.06] pt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] text-black/30">
            © 2026 CortexCFO / Reject all substitutes
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[12px] text-black/30 hover:text-black/50 transition-colors">
              Security
            </Link>
            <Link href="/terms" className="text-[12px] text-black/30 hover:text-black/50 transition-colors">
              Terms of service
            </Link>
            <Link href="/privacy" className="text-[12px] text-black/30 hover:text-black/50 transition-colors">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
