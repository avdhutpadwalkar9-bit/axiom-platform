"use client";

/**
 * /us — US-specific landing page.
 *
 * Positioning: M&A Readiness for $1M-$10M US SMBs. Direct lift of the
 * service-tier framework from the founder's prior MARC work (Mangal
 * Analytics), translated from consulting engagement to SaaS tiers.
 *
 * Voice rules (from the content-strategy doc):
 *   - Provocative hook above the fold
 *   - Pain narrative (buyers dig deep; re-trades kill small deals)
 *   - Tier-aligned solution
 *   - Conversational CTA
 *
 * Shares the existing SiteNav + SiteFooter so brand identity + nav
 * stays consistent with /; only the body content is US-tailored.
 */

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  Zap,
  Brain,
  LineChart,
  Lock,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroLiveDemo from "@/components/HeroLiveDemo";

// 5-tier M&A readiness ladder — adapted from the MARC proposal.
// Consulting fees became SaaS tiers; scope items preserved so the
// ladder still reads like a real framework to a CFO or advisor.
const TIERS = [
  {
    name: "Starter — Internal Readiness Check",
    tagline: "Putting your house in order",
    price: "Free",
    priceNote: "forever",
    band: "Early-stage · < $1M revenue",
    duration: "5 days to first report",
    features: [
      "Upload 2 years of audited or provisional P&L and Balance Sheet",
      "Chart-of-Accounts consistency + GAAP classification check",
      "Top-line + top-3 cost anomaly flags",
      "Industry best-practice gap scan",
    ],
    cta: "Start free",
    href: "/signup",
    tone: "neutral" as const,
  },
  {
    name: "Growth — Valuation & Projections",
    tagline: "Normalize EBITDA. Project forward.",
    price: "$99",
    priceNote: "/month",
    band: "$1M–$5M revenue",
    duration: "2 weeks to valuation range",
    features: [
      "Adjusted EBITDA (strip one-time and non-recurring items)",
      "3-statement projection built on management inputs + peer benchmarks",
      "Valuation range via Revenue + EBITDA trading multiples AND DCF",
      "CPA-reviewed scenario models (conservative / base / aggressive)",
    ],
    cta: "Start 30-day trial",
    href: "/signup?tier=growth",
    tone: "neutral" as const,
  },
  {
    name: "Diligence — Basic Assurance",
    tagline: "Light-touch, rapid-delivery pre-diligence.",
    price: "$299",
    priceNote: "/month",
    band: "$1M–$5M revenue",
    duration: "1 week turnaround",
    features: [
      "3 years of P&L, Balance Sheet, Cash Flow — reviewed and reconciled",
      "MIS vs audited accounts: discrepancy log with founder walkthrough",
      "Chart-of-Accounts accuracy + anomaly treatment",
      "One-off income/expense isolation",
      "DSO, DPO, DIO + working-capital liquidity diagnostic",
    ],
    cta: "Book intro",
    href: "/contact?tier=diligence",
    tone: "emerald" as const,
    popular: true,
  },
  {
    name: "Pre-M&A — Advanced Analysis",
    tagline: "Deeper diagnostic insights before you go to market.",
    price: "$599",
    priceNote: "/month",
    band: "$5M–$10M revenue",
    duration: "2-3 weeks deliverable",
    features: [
      "Adjusted EBITDA stripping non-recurring AND discretionary spend",
      "Profitability, liquidity, solvency ratio pack with sector comps",
      "Customer / revenue concentration by geography AND product line",
      "Sector-specific KPI definition + tracking",
      "Capital structure, interest burden, repayment risk review",
      "Seasonality, dependency dynamics, multi-period trend analysis",
    ],
    cta: "Talk to an advisor",
    href: "/contact?tier=pre-ma",
    tone: "neutral" as const,
  },
  {
    name: "QoE-Ready — Comprehensive",
    tagline: "The full QoE workbook. Boardroom-ready.",
    price: "Custom",
    priceNote: "from $2,499/mo",
    band: "$5M+ revenue · seeking offer",
    duration: "4-6 weeks end-to-end",
    features: [
      "3-year QoE + Year-to-Date + Trailing-Twelve-Month",
      "Revenue recognition policy review, ASC 606 compliance",
      "Revenue segmentation: product / customer / geography + A/R aging",
      "Deep expense review (payroll + vendor payables)",
      "Proof-of-Cash: reported income reconciled to bank statements",
      "Full EBITDA bridge: reported → adjusted, driver-by-driver",
      "Contract review: customer, vendor, lease, insurance, debt covenants",
      "Fixed-asset age, utilization, obsolescence analysis",
      "Inventory + working-capital reconciliation with one-time flags",
      "Dedicated CPA review call + investor-shareable export",
    ],
    cta: "Request scoping",
    href: "/contact?tier=qoe",
    tone: "emerald-strong" as const,
  },
];

// Three proof stats — the Libra move, specific to our US pitch.
const STATS = [
  { value: "10 min", label: "To a QoE-ready report" },
  { value: "6 weeks", label: "Typical Big-4 QoE timeline" },
  { value: "80%", label: "Reduction in buyer re-trade exposure" },
];

// Buyer-diligence pain bullets lifted directly from the MARC thesis.
// Small businesses ($1-10M) underestimate what "M&A-ready" means; these
// are the four failure modes.
const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    title: "Financial gaps found late",
    body:
      "Accounting inconsistencies, misclassified line items, or undocumented one-time adjustments. Uncovered in week 6 of diligence after the buyer is already leaning toward a re-trade.",
  },
  {
    icon: FileCheck,
    title: "Contracts that don't hold up",
    body:
      "Customer agreements without assignment clauses. Vendor contracts that lapse at acquisition. Leases with change-of-control triggers. Each one erodes deal confidence.",
  },
  {
    icon: TrendingUp,
    title: "Founder-dependent operations",
    body:
      "\"If you leave, does the business keep running?\" is the single question that kills small-cap deals. If the answer is no, the multiple compresses — or the deal pauses.",
  },
  {
    icon: Sparkles,
    title: "Cultural misalignment",
    body:
      "Post-LOI friction over roles, team retention, and operating cadence. Rarely terminal on its own — but when it compounds with financial surprises, it tanks the close.",
  },
];

export default function UsLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ───── Hero ───── */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-5">
                <Sparkles className="w-3 h-3" /> For US SMBs · $1M – $10M
              </span>
              <h1 className="text-[44px] lg:text-[56px] font-bold tracking-tight leading-[1.05] mb-5">
                M&amp;A-Ready Financials
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  In Minutes. Not Months.
                </span>
              </h1>
              <p className="text-[17px] text-white/60 leading-relaxed mb-7 max-w-[500px]">
                Buyers dig deep. Surprises erode credibility, extend diligence,
                and weaken terms. CortexCFO is the AI FP&amp;A engine that
                shows up to the data room with GAAP-clean statements, a real
                QoE bridge, and every add-back documented — for a fraction of
                the Big-4 bill.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/signup?region=us"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3.5 rounded-full transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)] text-[14px]"
                >
                  Start free — no credit card
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#tiers"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium px-4 py-3.5 text-[14px] transition-colors"
                >
                  See all tiers &rarr;
                </Link>
              </div>
              <p className="text-[11px] text-white/30 mt-4">
                US CPA-reviewed · GAAP-compliant · SOC 2 data handling
              </p>
            </div>

            {/* Live demo panel */}
            <div className="flex justify-center lg:justify-end">
              <HeroLiveDemo
                question="What's eating my margin this year?"
                answer="Materials (**34%**), wages (**21%**), and logistics (**9%**) consume **64%** of your revenue vs the sector median of 52%. That's a **~$180K/yr gap**. Start with your #1 supplier: 5% on $1.5M = **$75K/yr back**. *Next 90 days: RFP the top three.*"
              />
            </div>
          </div>

          {/* Three proof stats */}
          <div className="mt-16 lg:mt-20 grid grid-cols-3 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-[32px] lg:text-[40px] font-bold text-white leading-none mb-1.5 tabular-nums">
                  {s.value}
                </p>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.14em]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pain narrative ───── */}
      <section className="py-20 lg:py-28 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-rose-400 font-semibold mb-3">
              The real deal-driver
            </span>
            <h2 className="text-[36px] lg:text-[44px] font-bold tracking-tight mb-4 leading-[1.1]">
              Why small deals fall apart — and how to stop it early.
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed">
              Most founders in the $1–10M band underestimate what M&amp;A-ready
              actually means. It's not clean statements. It's not even a GAAP
              audit. It's preparation across financial, operational, and
              strategic dimensions — the kind that holds up when a serious
              buyer starts asking the uncomfortable questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:border-rose-500/25 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-4">
                  <p.icon className="w-4 h-4 text-rose-400" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-white/55 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── 5-tier ladder ───── */}
      <section id="tiers" className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-emerald-400 font-semibold mb-3">
              The ladder
            </span>
            <h2 className="text-[36px] lg:text-[44px] font-bold tracking-tight mb-4 leading-[1.1]">
              Where you are today.
              <br />
              <span className="text-white/50">And what it takes to be deal-ready.</span>
            </h2>
            <p className="text-[15px] text-white/50 leading-relaxed">
              Five packaged tiers from a founder's first health check to a full
              QoE workbook. Each tier builds on the last — graduate up as your
              revenue and M&amp;A timeline mature.
            </p>
          </div>

          <div className="space-y-4">
            {TIERS.map((t, i) => {
              const border =
                t.tone === "emerald-strong"
                  ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.06] to-transparent"
                  : t.tone === "emerald"
                  ? "border-emerald-500/25 bg-emerald-500/[0.02]"
                  : "border-white/8 bg-white/[0.02]";
              return (
                <div
                  key={t.name}
                  className={`relative rounded-2xl border p-6 lg:p-8 transition-all hover:border-emerald-500/30 ${border}`}
                >
                  {t.popular && (
                    <span className="absolute top-4 right-4 lg:top-6 lg:right-6 text-[10px] uppercase tracking-[0.14em] font-semibold bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                  <div className="grid lg:grid-cols-[1fr_220px] gap-6 lg:gap-10 items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-400 font-semibold">
                          Tier {i + 1}
                        </span>
                        <span className="text-[10px] text-white/30">·</span>
                        <span className="text-[11px] text-white/40">{t.band}</span>
                      </div>
                      <h3 className="text-[22px] lg:text-[26px] font-semibold text-white mb-1 tracking-tight">
                        {t.name}
                      </h3>
                      <p className="text-[14px] text-white/50 mb-5">{t.tagline}</p>
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {t.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-[13px] text-white/70 leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="lg:text-right lg:pt-2">
                      <div className="flex lg:justify-end items-baseline gap-1.5 mb-1">
                        <span className="text-[32px] font-bold text-white leading-none tabular-nums">
                          {t.price}
                        </span>
                        <span className="text-[12px] text-white/40">{t.priceNote}</span>
                      </div>
                      <p className="text-[11px] text-white/35 mb-4">{t.duration}</p>
                      <Link
                        href={t.href}
                        className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2.5 rounded-full transition-all ${
                          t.tone === "emerald" || t.tone === "emerald-strong"
                            ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        }`}
                      >
                        {t.cta}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[12px] text-white/35 mt-10 max-w-xl mx-auto">
            All tiers include the CortexAI advisor (Claude-powered, Quick +
            Think-Deeper modes), live FX conversion across 5 currencies, and
            exportable GAAP-compliant outputs. Upgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* ───── Security ───── */}
      <section className="py-20 lg:py-24 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-[32px] lg:text-[38px] font-bold tracking-tight mb-3">
              Enterprise-grade privacy.
              <br />
              <span className="text-white/50">For founder-sized fees.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <Lock className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">
                Your data belongs to you
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Never stored beyond what's needed for your analysis. Never used
                to train models. Deleted within 30 days of your request.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <Shield className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">AES-256 + TLS 1.3</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Encryption in transit and at rest. SOC 2 Type II controls. Role-based
                access on every row of every analysis.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <FileCheck className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">Full audit trail</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Every AI action on your data is logged with user, timestamp,
                and input. Exportable for your auditor.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">CPA-reviewed outputs</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Every report at Tier 3 and above goes through a licensed US
                CPA before you see it. AI speed, human judgment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Product pillars ───── */}
      <section className="py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <Zap className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-[15px] font-semibold text-white mb-2">
                Quick + Think-Deeper
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Quick mode answers in ~2s. Think-Deeper streams Claude
                Sonnet 4.5's full chain of reasoning before the answer. Use the
                right one for the question.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <LineChart className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-[15px] font-semibold text-white mb-2">
                Live FX across 5 currencies
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                USD / EUR / GBP / INR / JPY — ECB-sourced rates locked at
                upload time so your QoE report reads the same today as next
                quarter. Reproducible reporting, not tick-chasing.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <Brain className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-[15px] font-semibold text-white mb-2">
                51+ curated FAQs
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Common founder questions answered from a template bank with
                your numbers interpolated in. Falls through to live AI only
                when it needs to — fast answers for the common case.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Closing CTA ───── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-[40px] lg:text-[52px] font-bold tracking-tight leading-[1.05] mb-5">
            Stop guessing.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
              Start modeling.
            </span>
          </h2>
          <p className="text-[17px] text-white/55 leading-relaxed mb-8 max-w-xl mx-auto">
            Ten minutes to a first GAAP-clean analysis. Thirty days to a QoE
            draft that would have cost $30K and six weeks anywhere else.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup?region=us"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-4 rounded-full transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)] text-[14px]"
            >
              Start free — no credit card
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium px-5 py-4 rounded-full border border-white/10 hover:border-white/20 text-[14px] transition-colors"
            >
              Talk to an advisor
            </Link>
          </div>
          <div className="flex items-center justify-center gap-5 mt-8 text-[11px] text-white/30">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> No card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> 30-day trial on paid tiers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
