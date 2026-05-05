"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Check, Minus, Sparkles, LayoutDashboard, Compass } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

const plans = [
  {
    name: "Free Diagnostic",
    price: "₹0",
    period: "one report",
    desc: "See what we find before you commit",
    features: [
      "One sample QoE pass on your trial balance",
      "Adjusted EBITDA preview",
      "Top 5 add-back flags",
      "Compliance scan (GST, TDS, related-party)",
      "Read-only dashboard for 14 days",
      "No card required",
    ],
    highlighted: false,
    cta: "Upload sample financials",
  },
  {
    name: "Investor Readiness",
    price: "₹24,999",
    period: "/month",
    desc: "Pre-diligence prep — for founders 3–9 months from a raise",
    features: [
      "Continuous QoE engine, monthly",
      "Adjusted EBITDA + ranked add-backs",
      "GAAP-aligned P&L, BS, CFS",
      "CA-reviewed every month",
      "QuickBooks / Xero / Tally / Zoho sync",
      "Multi-year analysis + benchmarks",
      "Unlimited AI chat on your ledger",
      "Priority WhatsApp support",
    ],
    highlighted: true,
    cta: "Start subscription",
  },
  {
    name: "Diligence Pack",
    price: "₹1,49,000",
    period: "one-time",
    desc: "For an active deal, term sheet, or board meeting",
    features: [
      "One full QoE report, CA-reviewed",
      "Adjusted EBITDA with full add-back schedule",
      "Working-capital + debt-like items review",
      "Compliance + related-party flags",
      "90-day dashboard access",
      "Delivered in 5 business days",
      "Upgrade credit toward Investor Readiness",
    ],
    highlighted: false,
    cta: "Buy diligence pack",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "PE/VC portfolios, family offices, CA firms",
    features: [
      "Multi-entity rollup dashboard",
      "White-label / co-brand reports",
      "API + webhook access",
      "SSO + role-based access",
      "Audit trail + compliance controls",
      "Dedicated CSM + 99.9% SLA",
    ],
    highlighted: false,
    cta: "Contact sales",
  },
];

function PricingPageInner() {
  const searchParams = useSearchParams();
  const region = searchParams.get("region");
  const fromOnboarding = searchParams.get("source") === "onboarding";
  const regionQuery = region ? `&region=${region}` : "";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {fromOnboarding && (
            <FadeIn className="max-w-3xl mx-auto mb-10">
              <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-5 lg:p-6">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-400 mb-1">
                      Your analysis is ready
                    </p>
                    <h2 className="text-[19px] lg:text-[22px] font-semibold text-white tracking-tight mb-1">
                      Pick a plan to unlock continuous monitoring.
                    </h2>
                    <p className="text-[14px] text-white/65 leading-relaxed">
                      Your first report is in the dashboard. Paid plans add live
                      QuickBooks / Xero / Tally sync, monthly CA-reviewed packs,
                      and unlimited AI chat on your ledger.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Skip for now &mdash; open dashboard
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          <FadeIn className="text-center mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Pre-diligence prep, before you raise.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Investor-ready, every month.</span>
            </h1>
            <p className="text-white/65 text-lg max-w-2xl mx-auto">
              Every report is CA-reviewed. Start free, upgrade when you&rsquo;re ready, cancel anytime.
            </p>
          </FadeIn>

          {/* Anchor strip — pre-diligence prep vs full diligence */}
          <FadeIn delay={100}>
            <div className="max-w-3xl mx-auto mb-14 bg-white/[0.02] border border-white/8 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-white/45">Full diligence engagement</span>
                <span className="text-white/65 font-semibold tabular-nums">&#8377;6&ndash;20 L</span>
                <span className="text-white/30">&middot; 6&ndash;8 weeks</span>
              </div>
              <span className="text-white/20">vs.</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">Investor Readiness</span>
                <span className="text-white tabular-nums">&#8377;24,999/mo</span>
                <span className="text-white/30">&middot; continuous</span>
              </div>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 80}>
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
                    <p className="text-xs text-white/45 mb-6 min-h-[32px]">{plan.desc}</p>
                    <Link
                      href={
                        plan.name === "Enterprise"
                          ? "/contact"
                          : plan.name === "Free Diagnostic"
                            ? `/signup${region ? `?region=${region}` : ""}`
                            : `/checkout?plan=${encodeURIComponent(plan.name.toLowerCase().replace(/\s+/g, "-"))}${regionQuery}`
                      }
                      className={`block text-center py-2.5 rounded-xl text-sm font-medium mb-6 transition-all ${plan.highlighted ? "bg-emerald-500 text-white hover:bg-emerald-400 btn-magnetic hover:shadow-lg hover:shadow-emerald-500/30" : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/25"}`}
                    >
                      {plan.cta}
                    </Link>
                    <ul className="space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-white/60">
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
              <p className="text-center text-white/45 text-sm mb-10">
                Every tier, every report, reviewed and signed off by a qualified CA.
              </p>
              <div className="bg-[#111] rounded-2xl border border-white/8 overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-4 text-white/30 font-medium">Feature</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Free Diagnostic</th>
                      <th className="text-center px-3 py-4 text-emerald-400 font-semibold">Investor Readiness</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Diligence Pack</th>
                      <th className="text-center px-3 py-4 text-white/50 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "QoE reports", free: "1 sample", growth: "Monthly", diligence: "1 full report", enterprise: "Unlimited" },
                      { feature: "CA review on every report", free: false, growth: true, diligence: true, enterprise: true },
                      { feature: "Adjusted EBITDA + add-back schedule", free: "Top 5 only", growth: true, diligence: true, enterprise: true },
                      { feature: "QuickBooks / Xero / Tally / Zoho sync", free: "One-time", growth: "Continuous", diligence: "One-time", enterprise: "Continuous" },
                      { feature: "GAAP-aligned P&L, BS, CFS", free: false, growth: true, diligence: true, enterprise: true },
                      { feature: "Working-capital + debt-like items review", free: false, growth: true, diligence: true, enterprise: true },
                      { feature: "Compliance + related-party flags", free: true, growth: true, diligence: true, enterprise: true },
                      { feature: "Multi-year analysis + benchmarks", free: false, growth: true, diligence: true, enterprise: true },
                      { feature: "AI chat on your ledger", free: "Read-only 14d", growth: "Unlimited", diligence: "90-day access", enterprise: "Unlimited" },
                      { feature: "Multi-entity rollup", free: false, growth: false, diligence: false, enterprise: true },
                      { feature: "White-label / co-brand", free: false, growth: false, diligence: false, enterprise: true },
                      { feature: "API + webhook access", free: false, growth: false, diligence: false, enterprise: true },
                      { feature: "Support", free: "Community", growth: "Priority WhatsApp", diligence: "Email + WhatsApp", enterprise: "Dedicated CSM + SLA" },
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
                          <td className="text-center px-3 py-3.5">{renderCell(row.free)}</td>
                          <td className="text-center px-3 py-3.5 bg-emerald-500/[0.03]">{renderCell(row.growth, true)}</td>
                          <td className="text-center px-3 py-3.5">{renderCell(row.diligence)}</td>
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

      {/* Where we're NOT the right fit — honesty as trust signal.
          Explicitly names alternatives instead of pretending to fit
          everyone, which is the play every other FP&A vendor makes. */}
      <section className="px-6 pb-12">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/8 rounded-2xl p-7 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-white/50" />
              </div>
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-white mb-2">
                  Where CortexCFO isn&rsquo;t the right fit
                </h3>
                <p className="text-[14px] text-white/65 leading-relaxed mb-3">
                  We&rsquo;re built for ₹10–50 Cr / $1–10M founders running a single
                  business toward their next raise or sale. We&rsquo;re honest about
                  where the fit breaks:
                </p>
                <ul className="space-y-1.5 text-[13.5px] text-white/55 leading-relaxed">
                  <li>
                    &mdash; Group revenue past <span className="text-white/75">₹500 Cr / $50M</span>{" "}
                    or 10+ entities needing real-time consolidation? Look at{" "}
                    <span className="text-white/75">Anaplan, Workday Adaptive, or Pigment</span>.
                  </li>
                  <li>
                    &mdash; Need a statutory audit opinion or signed SAS-100 report?{" "}
                    Engage your statutory auditor or a registered CA firm directly.
                  </li>
                  <li>
                    &mdash; Active sell-side process with a signed LOI?{" "}
                    Buy the Diligence Pack from us, but also engage a transaction
                    advisor (BDO, Grant Thornton, Nexdigm, or similar) to sit alongside.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Disclaimer */}
      <section className="px-6 pb-6">
        <FadeIn>
          <div className="max-w-4xl mx-auto bg-white/[0.02] border border-white/8 rounded-2xl p-6 text-center">
            <p className="text-[13px] text-white/55 leading-relaxed">
              <span className="text-white/75 font-medium">Advisory, not audit.</span>{" "}
              CortexCFO produces investor-grade financial analysis reviewed by a qualified CA.
              Reports are not a substitute for a statutory audit opinion, a formal third-party
              Quality-of-Earnings engagement, or independent legal/tax counsel. All outputs are
              advisory in nature and carry our standard disclaimer and E&amp;O cover.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Not sure which tier fits?</h2>
            <p className="text-white/55 mb-8">
              Start with the Free Diagnostic. If the report earns your trust, upgrade to
              Investor Readiness and we&rsquo;ll credit the diagnostic toward your first month.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl btn-magnetic text-sm font-semibold">
                Upload sample financials <ArrowRight className="w-4 h-4" />
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

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <SiteNav />
        </div>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
