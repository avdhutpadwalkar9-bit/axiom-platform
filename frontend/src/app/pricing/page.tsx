"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, Check, Minus, Sparkles, LayoutDashboard, ChevronDown } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

/*
 * Pricing model \u00B7 2026-05-20 redesign per friend feedback round 3.
 *
 * Each plan carries BOTH monthly and annual INR prices. Annual = 10x
 * monthly (2 months free, ~17% off) \u2014 standard SaaS commitment lever.
 * The "Diligence Report" tier is a one-time deliverable, no monthly/
 * annual variant \u2014 it's now listed LAST so it doesn't sit between
 * Free and Growth and confuse buyers about whether the monthly sub
 * costs less than a one-off report. Currency is INR throughout
 * (primary market = Indian MSMEs per project_cortexcfo.md memory).
 */

type Plan = {
  name: string;
  monthly: string;
  annual: string;
  period: string;
  oneTime?: boolean;
  desc: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Growth",
    monthly: "\u20B924,999",
    annual: "\u20B92,49,990",
    period: "/month",
    desc: "For MSMEs at \u20B910\u201350 Cr revenue",
    features: [
      "Monthly QoE report \u00B7 CA-signed",
      "Unlimited QuickBooks / Xero / Tally syncs",
      "Continuous QoE engine",
      "Multi-year Ind AS reports",
      "Unlimited AI chat on your ledger",
      "Industry benchmarks \u00B7 47 peers",
      "Monthly growth SOPs",
      "Priority WhatsApp support",
    ],
    highlighted: true,
    cta: "Start free trial",
  },
  {
    name: "Portfolio",
    monthly: "\u20B91,50,000",
    annual: "\u20B915,00,000",
    period: "/month per fund",
    desc: "PE / VC firms \u00B7 10+ portfolio cos",
    features: [
      "Everything in Growth \u00B7 all portfolio cos",
      "Cross-portfolio dashboard",
      "White-label reports in your brand",
      "Quarterly rollup for LPs",
      "API + webhook access",
      "Dedicated partner success lead",
    ],
    cta: "Talk to partnerships",
  },
  {
    name: "Enterprise",
    monthly: "Custom",
    annual: "Custom",
    period: "",
    desc: "CA firms \u00B7 family offices \u00B7 holdcos",
    features: [
      "Custom AI models trained on your ledger",
      "On-premise / VPC deployment",
      "SSO + role-based access",
      "Audit trail + compliance controls",
      "99.9% SLA + dedicated CSM",
      "GAAP \u00B7 Ind AS \u00B7 IFRS",
    ],
    cta: "Contact sales",
  },
  {
    name: "Diligence Report",
    monthly: "\u20B949,000",
    annual: "\u20B949,000",
    period: "one-time",
    oneTime: true,
    desc: "One specific deal or board meeting",
    features: [
      "One full QoE report",
      "Adjusted EBITDA with add-back schedule",
      "Ind AS-aligned P&L, BS, CFS",
      "CA sign-off on the report",
      "30-day dashboard access",
      "Delivered in 48 hours",
    ],
    cta: "Buy one report",
  },
];

/* FAQs added 2026-05-20 \u2014 every pricing page for a CFO tool needs to
   answer these before a buyer hits Talk-to-sales. Friend feedback
   correctly flagged their absence. */
const PRICING_FAQS = [
  {
    q: "Do you store my trial balance?",
    a: "Yes \u2014 encrypted at rest (AES-256), in a database located in India. Your TB powers the analysis you see in the dashboard; nothing in it ever leaves CortexCFO except outputs you explicitly export. We never train AI models on customer data.",
  },
  {
    q: "Who actually signs off the QoE report?",
    a: "A qualified Chartered Accountant on our review panel \u2014 not the AI, not the founders. Every report carries the reviewer's name and ICAI membership number. The founders themselves are management consultants, not CAs; we are intentionally upfront about this.",
  },
  {
    q: "What accounting software do you support?",
    a: "Tally Prime \u00B7 Zoho Books \u00B7 QuickBooks \u00B7 Xero \u00B7 Excel / CSV trial balance \u00B7 Audited financials PDF. We're adding Marg ERP, Busy, and SAP Business One on the Growth + Enterprise tiers.",
  },
  {
    q: "Can I cancel mid-cycle?",
    a: "Yes \u2014 cancel any time in /billing. Monthly plans bill until the end of the current month; annual plans are pro-rated for the months unused. No retention call, no exit fee.",
  },
  {
    q: "How long does the first QoE report take?",
    a: "If you've uploaded a trial balance + last 12 months of bank statements, the first draft is ready within 48 hours. CA sign-off + revisions add 2-3 business days. Most customers go from sign-up to investor-ready in under a week.",
  },
  {
    q: "What if my numbers change after the report ships?",
    a: "Growth plan customers re-generate any time \u2014 the engine refreshes against the latest TB and the CA reviews the diff. No additional charge. Diligence-Report (one-time) customers get 30 days of free regenerations to handle revisions.",
  },
];

// Separate component so we can wrap useSearchParams in Suspense — Next 16
// requires it to avoid the "useSearchParams() should be wrapped in a
// suspense boundary" error at build time.
function PricingPageInner() {
  const searchParams = useSearchParams();
  const region = searchParams.get("region"); // "us" | "in" | null
  const fromOnboarding = searchParams.get("source") === "onboarding";
  const regionQuery = region ? `&region=${region}` : "";

  // Monthly / Annual toggle · 2026-05-20. Annual = 10x monthly (2 months
  // free, ~17% off). Diligence Report is unaffected (one-off).
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Onboarding celebration banner — only shows when the user has
              just completed upload + analysis. Keeps the moment positive
              and sets context for why they're on pricing. */}
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
                      Your first report is already in the dashboard. Paid plans
                      add live QuickBooks/Xero/Tally sync, monthly CPA-signed
                      packs, and unlimited AI chat on your ledger.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/80 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Skip for now — open dashboard
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
              Big-4 charges ₹6–15 Lakh per QoE.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">We ship one every month for ₹24,999.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Every report CA-signed. No per-seat surprises. Cancel anytime.
            </p>
          </FadeIn>

          {/* Anchor strip · currency unified to INR after friend feedback —
              page previously mixed $ + ₹ + L (lakhs) which was confusing. */}
          <FadeIn delay={100}>
            <div className="max-w-3xl mx-auto mb-10 bg-white/[0.02] border border-white/8 rounded-2xl p-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[13px]">
              <div className="flex items-center gap-2">
                <span className="text-white/40">Big-4 QoE engagement</span>
                <span className="text-white/60 font-semibold tabular-nums">₹6–15 L</span>
                <span className="text-white/30">&middot; 6–8 weeks</span>
              </div>
              <span className="text-white/20">vs.</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">CortexCFO Growth</span>
                <span className="text-white tabular-nums">₹25K/mo</span>
                <span className="text-white/30">&middot; continuous</span>
              </div>
            </div>
          </FadeIn>

          {/* Monthly / Annual toggle · 2026-05-20 · annual = 17% off */}
          <FadeIn delay={140}>
            <div className="flex justify-center mb-8">
              <div
                role="group"
                aria-label="Billing cycle"
                className="inline-flex items-center bg-white/[0.04] border border-white/10 rounded-full p-1"
              >
                <button
                  onClick={() => setCycle("monthly")}
                  className={`px-5 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors ${
                    cycle === "monthly"
                      ? "bg-emerald-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setCycle("annual")}
                  className={`px-5 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors ${
                    cycle === "annual"
                      ? "bg-emerald-500 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Annual
                  <span className="ml-1.5 text-[10.5px] opacity-75">save 17%</span>
                </button>
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
                    <span className="text-3xl font-bold">
                      {plan.oneTime || plan.monthly === "Custom"
                        ? plan.monthly
                        : cycle === "annual"
                        ? plan.annual
                        : plan.monthly}
                    </span>
                    <span className="text-sm text-white/30 ml-1">
                      {plan.oneTime
                        ? plan.period
                        : plan.monthly === "Custom"
                        ? plan.period
                        : cycle === "annual"
                        ? "/year"
                        : plan.period}
                    </span>
                  </div>
                  {/* Annual savings sub-line when toggle is on */}
                  {cycle === "annual" && !plan.oneTime && plan.monthly !== "Custom" && (
                    <p className="text-[11px] text-emerald-400/80 mb-2">
                      ≈ 2 months free
                    </p>
                  )}
                  <p className="text-xs text-white/40 mb-6 min-h-[32px]">{plan.desc}</p>
                  <Link
                    href={
                      plan.name === "Enterprise" || plan.name === "Portfolio"
                        ? "/contact"
                        : `/checkout?plan=${encodeURIComponent(plan.name.toLowerCase().replace(/\s+/g, "-"))}${regionQuery}`
                    }
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium mb-6 transition-all ${plan.highlighted ? "bg-emerald-500 text-white hover:bg-emerald-400 btn-magnetic hover:shadow-lg hover:shadow-emerald-500/30" : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 hover:border-white/25"}`}
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
                    {/* Header contrast bumped 2026-05-20 — friend flagged
                        white/30 text on near-black as a WCAG fail. */}
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left px-5 py-4 text-white/80 font-semibold">Feature</th>
                      <th className="text-center px-3 py-4 text-white/75 font-semibold">Diligence</th>
                      <th className="text-center px-3 py-4 text-emerald-400 font-bold">Growth</th>
                      <th className="text-center px-3 py-4 text-white/75 font-semibold">Portfolio</th>
                      <th className="text-center px-3 py-4 text-white/75 font-semibold">Enterprise</th>
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

      {/* FAQs · added 2026-05-20 — every pricing page for a finance
          product needs these. Friend flagged absence. */}
      <section className="px-6 pb-10">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-3">Pricing questions, answered</h2>
            <p className="text-center text-white/45 text-sm mb-8">
              What every CFO asks before they hit "Talk to sales".
            </p>
            <div className="space-y-3">
              {PRICING_FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={i}
                    className="bg-[#111] rounded-2xl border border-white/8 overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="text-[15px] font-semibold text-white">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-[13.5px] text-white/65 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Not sure which tier fits?</h2>
            <p className="text-white/40 mb-8">
              Start with a one-time Diligence Report at ₹49,000. Upgrade to Growth anytime and we&rsquo;ll credit it toward your first month.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {/* CTA unified across pages · "Start free trial" everywhere */}
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl btn-magnetic text-sm font-semibold"
              >
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 px-8 py-3.5 rounded-xl border border-white/10 text-sm font-semibold transition-all"
              >
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
