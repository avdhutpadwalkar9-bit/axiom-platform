"use client";

import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

const plans = [
  {
    name: "Diligence Report",
    price: "\u20B949,000",
    period: "one-time",
    desc: "For a specific deal or board meeting",
    features: [
      "One full QoE report",
      "Adjusted EBITDA with add-back schedule",
      "GAAP-aligned P&L, BS, CFS",
      "CA sign-off on every report",
      "30-day access to underlying dashboard",
      "Delivered in 48 hours",
    ],
    highlighted: false,
    cta: "Buy one report",
  },
  {
    name: "Growth",
    price: "\u20B924,999",
    period: "/month",
    desc: "For SMBs at \u20B910\u201350M revenue",
    features: [
      "Everything in Diligence Report, monthly",
      "Unlimited QuickBooks/Xero syncs",
      "Continuous QoE engine",
      "Multi-year GAAP reports",
      "Unlimited AI chat",
      "Industry benchmarks",
      "Monthly growth SOPs",
      "Priority WhatsApp support",
    ],
    highlighted: true,
    cta: "Start 14-day trial",
  },
  {
    name: "Portfolio",
    price: "\u20B91.5 L",
    period: "/month per fund",
    desc: "For PE/VC firms with 10+ portfolio cos",
    features: [
      "Everything in Growth, all portfolio cos",
      "Cross-portfolio dashboard",
      "White-label reports in your brand",
      "Quarterly rollup for LPs",
      "API + webhook access",
      "Dedicated partner success lead",
    ],
    highlighted: false,
    cta: "Talk to partnerships",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For CA firms, family offices, holdcos",
    features: [
      "Custom AI models trained on your ledger",
      "On-premise / VPC deployment",
      "SSO + role-based access",
      "Audit trail + compliance controls",
      "99.9% SLA + dedicated CSM",
      "GAAP, IFRS, US GAAP",
    ],
    highlighted: false,
    cta: "Contact sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Big-4 charges $10-25K per QoE.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">We ship one every month for $299.</span>
            </h1>
            <p className="text-white/45 text-lg max-w-2xl mx-auto">
              Every report is CPA-signed. No per-seat surprises. Cancel anytime.
            </p>
          </FadeIn>

          {/* Anchor strip */}
          <FadeIn delay={100}>
            <div className="max-w-3xl mx-auto mb-14 bg-white/[0.02] border border-white/8 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-white/40">Big-4 QoE engagement</span>
                <span className="text-white/60 font-semibold tabular-nums">$6–15 L</span>
                <span className="text-white/30">&middot; 6–8 weeks</span>
              </div>
              <span className="text-white/20">vs.</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">CortexCFO Growth</span>
                <span className="text-white tabular-nums">$299/mo</span>
                <span className="text-white/30">&middot; continuous</span>
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 80}>
                {/* Relative wrapper lives OUTSIDE card-shine so the "Most popular"
                    ribbon can sit above the card without being clipped by
                    card-shine's overflow: hidden. */}
                <div className="relative h-full">
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30 whitespace-nowrap">
                      &#9733; Most popular
                    </div>
                  )}
                <div className={`relative p-6 rounded-2xl border h-full card-shine ${plan.highlighted ? "border-emerald-500/40 bg-emerald-500/5 glow-border shadow-xl shadow-emerald-500/10" : "border-white/8 bg-[#111]"}`}>
                  <p className="text-sm text-white/50 mb-1 mt-1">{plan.name}</p>
                  <div className="mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-white/30 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-white/40 mb-6 min-h-[32px]">{plan.desc}</p>
                  <Link
                    href={plan.name === "Enterprise" || plan.name === "Portfolio" ? "/contact" : "/signup"}
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium mb-6 transition-all ${plan.highlighted ? "bg-emerald-500 text-white hover:bg-emerald-400 btn-magnetic" : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"}`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-white/55">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Comparison table */}
          <FadeIn delay={200}>
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center mb-3">Compare plans</h2>
              <p className="text-center text-white/40 text-sm mb-10">Every tier, every report, reviewed and signed off by a qualified licensed CPA.</p>
              <div className="bg-[#111] rounded-2xl border border-white/8 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-4 text-white/30 font-medium">Feature</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Diligence</th>
                      <th className="text-center px-3 py-4 text-emerald-400 font-semibold">Growth</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Portfolio</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "QoE reports", diligence: "1 report", growth: "Monthly", portfolio: "Monthly x all cos", enterprise: "Unlimited" },
                      { feature: "CA sign-off on every report", diligence: true, growth: true, portfolio: true, enterprise: true },
                      { feature: "Adjusted EBITDA + add-back schedule", diligence: true, growth: true, portfolio: true, enterprise: true },
                      { feature: "QuickBooks / Xero sync", diligence: "One-time", growth: "Continuous", portfolio: "Continuous", enterprise: "Continuous" },
                      { feature: "GAAP-aligned P&L, BS, CFS", diligence: true, growth: true, portfolio: true, enterprise: true },
                      { feature: "Industry benchmarks", diligence: false, growth: true, portfolio: true, enterprise: true },
                      { feature: "Multi-year analysis", diligence: false, growth: true, portfolio: true, enterprise: true },
                      { feature: "AI chat on your ledger", diligence: "30-day access", growth: "Unlimited", portfolio: "Unlimited", enterprise: "Unlimited" },
                      { feature: "Portfolio rollup dashboard", diligence: false, growth: false, portfolio: true, enterprise: true },
                      { feature: "White-label / co-brand", diligence: false, growth: false, portfolio: true, enterprise: true },
                      { feature: "API + webhook access", diligence: false, growth: false, portfolio: true, enterprise: true },
                      { feature: "On-premise / VPC", diligence: false, growth: false, portfolio: false, enterprise: true },
                      { feature: "Support", diligence: "Email", growth: "Priority WhatsApp", portfolio: "Dedicated partner lead", enterprise: "Dedicated CSM + SLA" },
                    ].map((row) => {
                      const renderCell = (val: string | boolean, highlight = false) => {
                        if (val === true) {
                          return (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              <Check className={`w-3.5 h-3.5 ${highlight ? "text-emerald-400" : "text-emerald-500"}`} />
                            </span>
                          );
                        }
                        if (val === false) {
                          return (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10">
                              <Minus className="w-3.5 h-3.5 text-white/30" />
                            </span>
                          );
                        }
                        return <span className={`text-[13px] ${highlight ? "text-white font-medium" : "text-white/60"}`}>{val}</span>;
                      };
                      return (
                        <tr key={row.feature} className="border-b border-white/3">
                          <td className="px-5 py-3.5 text-white/55">{row.feature}</td>
                          <td className="text-center px-3 py-3.5">{renderCell(row.diligence)}</td>
                          <td className="text-center px-3 py-3.5 bg-emerald-500/[0.03]">{renderCell(row.growth, true)}</td>
                          <td className="text-center px-3 py-3.5">{renderCell(row.portfolio)}</td>
                          <td className="text-center px-3 py-3.5">{renderCell(row.enterprise)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 pb-6">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/8 rounded-2xl p-6 text-center">
            <p className="text-[13px] text-white/45 leading-relaxed">
              <span className="text-white/70 font-medium">Advisory, not audit.</span>{" "}
              CortexCFO produces investor-grade financial analysis reviewed by a qualified licensed CPA.
              Reports are not a substitute for a statutory audit opinion, a Big-4 Quality-of-Earnings engagement,
              or independent legal/tax counsel. All outputs are advisory in nature and carry our standard disclaimer and E&amp;O cover.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Not sure which tier fits?</h2>
            <p className="text-white/40 mb-8">Start with a one-time Diligence Report for $49K. Upgrade to Growth anytime and we&rsquo;ll credit it toward your first month.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl btn-magnetic text-sm font-semibold">
                Start 14-day trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-8 py-3.5 rounded-xl border border-white/10 text-sm font-semibold transition-all">
                Talk to sales
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
