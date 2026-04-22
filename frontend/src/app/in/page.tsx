"use client";

/**
 * /in — India-specific landing page.
 *
 * Positioning: QoE + FP&A for ₹10–50 Cr Indian MSMEs preparing for PE,
 * strategic M&A, or a credit line with a bank / NBFC. Same packaged
 * ladder as /us, but with INR pricing, Ind AS + Companies Act
 * references, Tally/Zoho integrations, and promoter-flavoured add-back
 * language (which is where most Indian diligence actually breaks).
 *
 * Voice (from founder memory + content strategy):
 *   - Indian-business-polite register — "Namaste", "sir/ma'am" OK in
 *     copy; avoid American folksiness.
 *   - Concrete on the numbers a promoter actually cares about:
 *     working-capital cycle, TDS mismatches, related-party comp, ITC.
 *   - Credibility anchors: CA-reviewed, CARO compliance, GST/MCA
 *     audit-trail friendly.
 *
 * Shares SiteNav + SiteFooter with / and /us so the navigation never
 * changes underneath the visitor — only the body positioning does.
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
  Building2,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroLiveDemo from "@/components/HeroLiveDemo";

// 5-tier M&A readiness ladder — mirror of /us but with INR pricing
// calibrated to Indian MSME ability-to-pay (a ₹50 Cr promoter does not
// pay ₹2 L/mo casually; a ₹10 Cr one certainly doesn't). Rupee tiers
// undercut equivalent USD tiers roughly 3-4x on purpose — this is a
// different market, not a translation.
const TIERS = [
  {
    name: "Starter — Books Health Check",
    tagline: "Putting your Tally in order.",
    price: "Free",
    priceNote: "forever",
    band: "Revenue < ₹10 Cr · Early-stage",
    duration: "5 days to first report",
    features: [
      "Upload 2 years of P&L + Balance Sheet (Tally / Zoho / Excel)",
      "Ind AS + Schedule III classification check",
      "Top-line + top-3 cost anomaly flags",
      "GST 2A/2B vs books: first-pass reconciliation",
    ],
    cta: "Start free",
    href: "/signup",
    tone: "neutral" as const,
  },
  {
    name: "Growth — Valuation & Projections",
    tagline: "Adjusted EBITDA. Projections that lenders accept.",
    price: "₹7,999",
    priceNote: "/month",
    band: "Revenue ₹10 – 25 Cr",
    duration: "2 weeks to valuation band",
    features: [
      "Adjusted EBITDA — strip promoter perks, one-offs, related-party",
      "3-statement projection with Indian MSME peer benchmarks",
      "Valuation band using EV/Revenue, EV/EBITDA, DCF",
      "CA-reviewed scenarios (conservative / base / aggressive)",
    ],
    cta: "Start 30-day trial",
    href: "/signup?tier=growth",
    tone: "neutral" as const,
  },
  {
    name: "Diligence — Light Touch",
    tagline: "Pre-diligence for investor or lender meetings.",
    price: "₹24,999",
    priceNote: "/month",
    band: "Revenue ₹10 – 25 Cr",
    duration: "1 week turnaround",
    features: [
      "3 years of P&L, BS, Cash Flow — reviewed and reconciled",
      "MIS vs audited accounts: discrepancy log with promoter walkthrough",
      "Chart-of-accounts accuracy + anomaly treatment",
      "One-off income / expense isolation",
      "DSO, DPO, DIO + working-capital liquidity diagnostic",
    ],
    cta: "Book intro",
    href: "/contact?tier=diligence&region=in",
    tone: "emerald" as const,
    popular: true,
  },
  {
    name: "Pre-M&A — Advanced Analysis",
    tagline: "Deeper diagnostic before you talk to investors.",
    price: "₹49,999",
    priceNote: "/month",
    band: "Revenue ₹25 – 50 Cr",
    duration: "2–3 weeks deliverable",
    features: [
      "Adjusted EBITDA stripping discretionary + related-party spend",
      "Profitability, liquidity, solvency ratio pack with sector comps",
      "Revenue concentration by geography AND SKU / product line",
      "Sector KPI definition + tracking (manufacturing, services, D2C)",
      "Capital structure, interest burden, repayment-risk review",
      "Seasonality + dependency dynamics, multi-period trend analysis",
    ],
    cta: "Talk to an advisor",
    href: "/contact?tier=pre-ma&region=in",
    tone: "neutral" as const,
  },
  {
    name: "QoE-Ready — Comprehensive",
    tagline: "Full QoE workbook. Boardroom-ready for PE / strategic buyer.",
    price: "Custom",
    priceNote: "from ₹2 L/month",
    band: "Revenue ₹25 Cr+ · In-market for an offer",
    duration: "4–6 weeks end-to-end",
    features: [
      "3-year QoE + YTD + Trailing-Twelve-Month",
      "Revenue recognition policy review (Ind AS 115)",
      "Revenue segmentation: product / customer / geography + A/R aging",
      "Deep expense review (payroll + vendor payables)",
      "Proof-of-Cash: reported income reconciled to bank statements",
      "Full EBITDA bridge: reported → adjusted, driver-by-driver",
      "Contract review: customer, vendor, lease, debt covenants",
      "Fixed-asset age, utilisation, obsolescence analysis",
      "Inventory + working-capital reconciliation with one-time flags",
      "Dedicated CA review call + investor-shareable export",
    ],
    cta: "Request scoping",
    href: "/contact?tier=qoe&region=in",
    tone: "emerald-strong" as const,
  },
];

// Three proof stats — India-flavoured: what a promoter recognises
// against what the consultancy route actually costs/takes.
const STATS = [
  { value: "10 min", label: "To a QoE-ready report" },
  { value: "6 weeks", label: "Typical Big-4 QoE timeline" },
  { value: "₹15 L", label: "Typical Big-4 QoE fee" },
];

// Pain narrative — reframed for Indian diligence patterns. PE and
// strategic buyers in India dig harder on related-party, cash sales,
// and GST/TDS hygiene than anywhere else. These are the four
// fault-lines that kill small-cap Indian deals.
const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    title: "Promoter-led add-backs that don't defend",
    body:
      "Promoter salary, related-party rent, family-office travel, personal vehicle costs. Every Indian SMB has them. Very few have them documented, receipt-matched, and ring-fenced for a QoE schedule.",
  },
  {
    icon: FileCheck,
    title: "MIS ≠ audited accounts",
    body:
      "The internal MIS the promoter runs on shows one picture. The audited financials (Schedule III, Ind AS) show another. Buyers read both. The gap is where trust erodes.",
  },
  {
    icon: TrendingUp,
    title: "Working capital that lies",
    body:
      "Receivables aged at year-end, inventory stacked to hit the lender covenant, payables stretched past 90 days. Normalised working capital reveals the real cash cycle — and whether the business needs a ₹ bridge or a ₹₹₹ one.",
  },
  {
    icon: Sparkles,
    title: "GST / TDS hygiene",
    body:
      "ITC mismatches on GST 2A/2B, TDS certificate mismatches against the books, PAN-AADHAR linkage gaps. Each one a diligence question. Each one an answerable question if the data-room is built right.",
  },
];

// Trust strip — names and categories the audience recognises as
// endorsement. Kept deliberately generic (sector, not firm) until we
// have signed permission; swap for logos + named references when ready.
const TRUST_ROWS = [
  "FMCG distributors in North & West India",
  "Specialty-chemical manufacturers (export + domestic)",
  "D2C & modern-trade food brands",
  "Industrial-parts OEMs supplying tier-1 auto",
  "Healthcare-services chains (mid-India)",
  "Ed-tech and vertical SaaS founders",
];

export default function InLandingPage() {
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
                <Sparkles className="w-3 h-3" /> For Indian MSMEs · ₹10 – 50 Cr
              </span>
              <h1 className="text-[44px] lg:text-[56px] font-bold tracking-tight leading-[1.05] mb-5">
                PE-Ready Financials.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
                  In Minutes. Not Months.
                </span>
              </h1>
              <p className="text-[17px] text-white/60 leading-relaxed mb-7 max-w-[520px]">
                PE funds and strategic buyers dig deep into Indian MSME
                books — related-party, promoter comp, GST, TDS, ITC,
                working-capital cycles. CortexCFO arrives to the data
                room with Ind AS-clean statements, a defensible QoE
                bridge, and every add-back documented — for a fraction
                of the Big-4 fee.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/signup?region=in"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3.5 rounded-full transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)] text-[14px]"
                >
                  Start free — no card required
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
                CA-reviewed · Ind AS + Schedule III compliant · Tally /
                Zoho native
              </p>
            </div>

            {/* Live demo panel */}
            <div className="flex justify-center lg:justify-end">
              <HeroLiveDemo
                question="Why is my working capital ₹1.2 Cr higher than last year?"
                answer="Receivables > 90 days grew to **₹78 L** (vs ₹42 L last year). Top 3 dealers — **D17, D24, D31** — account for **₹52 L** of that. Inventory stacked **₹38 L** ahead of Q3 festive orders that partly didn't land. *Recommended: tighten D17/D31 credit to 45 days, factor D24.*"
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
              Where Indian diligence breaks
            </span>
            <h2 className="text-[36px] lg:text-[44px] font-bold tracking-tight mb-4 leading-[1.1]">
              Four fault-lines that kill ₹10–50 Cr deals.
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed">
              PE, family offices, and strategic buyers in India have
              seen every tricks-of-the-trade — three-CA structures,
              promoter salary optimisation, inventory
              window-dressing. They expect you to be ready. Most
              founders learn this mid-diligence. By then terms have
              softened.
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

      {/* ───── Trust strip ───── */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block text-[11px] uppercase tracking-[0.18em] text-emerald-400 font-semibold">
              Who we work with
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            {TRUST_ROWS.map((r) => (
              <div
                key={r}
                className="flex items-center gap-2.5 bg-white/[0.02] border border-white/8 rounded-xl px-4 py-3"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-[12px] text-white/70 leading-tight">{r}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[12px] text-white/35 mt-6">
            Named reference list available under NDA for Diligence tier and above.
          </p>
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
              Five packaged tiers — from a promoter's first books
              health-check to a full QoE workbook PE funds accept.
              Upgrade as your revenue and deal timeline mature.
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
                  className={`group relative rounded-2xl border p-6 lg:p-8 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 ${border}`}
                >
                  <div className="grid lg:grid-cols-[1fr_220px] gap-6 lg:gap-10 items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[11px] uppercase tracking-[0.14em] text-emerald-400 font-semibold">
                          Tier {i + 1}
                        </span>
                        <span className="text-[11px] text-white/30">·</span>
                        <span className="text-[12px] text-white/50">{t.band}</span>
                        {t.popular && (
                          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full ml-1">
                            Most popular
                          </span>
                        )}
                      </div>
                      <h3 className="text-[22px] lg:text-[26px] font-semibold text-white mb-1 tracking-tight">
                        {t.name}
                      </h3>
                      <p className="text-[15px] text-white/60 mb-5">{t.tagline}</p>
                      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                        {t.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-[14px] text-white/75 leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                        <span className="text-[13px] text-white/50">{t.priceNote}</span>
                      </div>
                      <p className="text-[12px] text-white/45 mb-4">{t.duration}</p>
                      <Link
                        href={t.href}
                        className={`inline-flex items-center gap-1.5 text-[14px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:scale-[1.03] hover:shadow-lg ${
                          t.tone === "emerald" || t.tone === "emerald-strong"
                            ? "bg-emerald-500 hover:bg-emerald-400 text-white hover:shadow-emerald-500/40"
                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/25"
                        }`}
                      >
                        {t.cta}
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-[14px] text-white/55 mt-10 max-w-2xl mx-auto leading-relaxed">
            All tiers include the CortexAI advisor (our multi-model Cognitive
            Engine with Quick + Think-Deeper modes), live FX across 5
            currencies, and exportable compliance-ready outputs. Upgrade or
            cancel anytime.
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
              <span className="text-white/50">For promoter-sized fees.</span>
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
                Encryption in transit and at rest. DPDP-compliant
                handling. Role-based access on every row of every analysis.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <FileCheck className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">Full audit trail</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Every AI action on your data is logged with user, timestamp,
                and input. Exportable for your auditor, CA, or QRB review.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-3" />
              <h3 className="text-[14px] font-semibold text-white mb-1">CA-reviewed outputs</h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Every report at Tier 3 and above goes through a qualified
                Indian CA before you see it. AI speed, human judgment.
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
              <p className="text-[14px] text-white/65 leading-relaxed">
                Quick mode answers in ~2s via our Quick-Match retriever.
                Think-Deeper routes to the Strategist with extended
                reasoning, streaming the chain of thought live. Use the
                right one for the question.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <LineChart className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-[15px] font-semibold text-white mb-2">
                Native Tally + Zoho
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Two-way sync with Tally Prime and Zoho Books. Pull the
                voucher-level detail investors actually ask for, without
                flat CSV dumps or IT tickets.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6">
              <Brain className="w-5 h-5 text-emerald-400 mb-3" />
              <h3 className="text-[15px] font-semibold text-white mb-2">
                51+ curated FAQs — India
              </h3>
              <p className="text-[13px] text-white/55 leading-relaxed">
                Common promoter questions — adjusted EBITDA, GST ITC,
                TDS reconciliation, Section 44AB, CARO — answered from
                a template bank with your numbers interpolated in.
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
              Start modelling.
            </span>
          </h2>
          <p className="text-[19px] lg:text-[20px] text-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
            Ten minutes to a first compliance-clean analysis. Thirty days
            to a QoE draft that would have cost ₹15 L and six weeks
            anywhere else.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/signup?region=in"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-4 rounded-full transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)] text-[14px]"
            >
              Start free — no card required
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium px-5 py-4 rounded-full border border-white/10 hover:border-white/20 text-[14px] transition-colors"
            >
              Talk to an advisor
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-[13px] text-white/55 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 30-day trial on paid tiers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Cancel anytime
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
