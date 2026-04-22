"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Check, ArrowUpRight, Sparkles, BarChart3, Shield, Brain, LineChart, Upload, Star } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  HeroDashboardIllustration,
  DataToAnalysisIllustration,
  AskAnythingIllustration,
} from "@/components/ProductIllustrations";

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                  */
/* ------------------------------------------------------------------ */
// Feature cards. `img` is either a URL (for the two blocks the user
// explicitly asked us to keep) or a React component for the two blocks
// we're replacing with custom SVG illustrations.
type FeatureImg = string | React.ComponentType<{ className?: string }>;

const features: {
  tag: string;
  title: string;
  desc: string;
  img: FeatureImg;
  icon: typeof Upload;
}[] = [
  {
    tag: "Instant Analysis",
    title: "From raw data to boardroom-ready analysis",
    desc: "Upload a Trial Balance from QuickBooks, Xero, or Excel. CortexCFO auto-classifies 100+ account types, builds your P&L, Balance Sheet, and Cash Flow indicators. No manual mapping. No templates.",
    img: DataToAnalysisIllustration,
    icon: Upload,
  },
  {
    tag: "AI Variance Analysis",
    title: "Surface what matters. Automatically.",
    desc: "The AI identifies unusual balances, flags suspense accounts, detects revenue recognition issues, and highlights expense anomalies. Each finding includes severity levels and specific next steps.",
    // Kept by user request — this image reads as a neural/connected grid
    // rather than a stock-market photo.
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=85",
    icon: Brain,
  },
  {
    tag: "GAAP Compliance",
    title: "Compliance checks that never sleep",
    desc: "Every upload is reviewed against AS 12, 15, 16, 19, 24, and 37. Deferred tax gaps, employee benefit provisions, related party disclosures, and revenue recognition under ASC 606 (Revenue) are all covered.",
    // Kept by user request.
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=85",
    icon: Shield,
  },
  {
    tag: "Real-time AI Chat",
    title: "Ask anything. Get answers with your actual numbers.",
    desc: "Our multi-model Cognitive Engine with your financial data loaded — not generic advice from the internet. Ask about cost reduction, runway projections, hiring impact, or what your auditor would flag. Every answer references your specific accounts.",
    img: AskAnythingIllustration,
    icon: Sparkles,
  },
];

/* ------------------------------------------------------------------ */
/*  Use cases                                                           */
/* ------------------------------------------------------------------ */
const useCases = [
  "Board and investor updates",
  "Monthly close reviews",
  "Department budget analysis",
  "Fundraising due diligence",
  "KPI tracking and benchmarking",
];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                 */
/* ------------------------------------------------------------------ */
const faqs = [
  { q: "What file formats does CortexCFO support?", a: "CSV, Excel (.xlsx), and JSON files exported from QuickBooks, Xero, QuickBooks, or any accounting software that produces a Trial Balance." },
  { q: "How does the AI know about Indian accounting standards?", a: "Our AI is configured with deep knowledge of GAAP standards (12, 15, 16, 19, 24, 37, 115), sales tax compliance, withholding tax regulations, and SMB-specific financial patterns. It references your actual data, not generic information." },
  { q: "Is my financial data secure?", a: "Yes. All data is encrypted with 256-bit encryption at rest and in transit. We never use your data to train AI models. You can request deletion at any time. Data residency is in India." },
  { q: "Can I use this for multiple companies?", a: "Yes. Each workspace holds a different company. CA firms and PE funds use this to manage portfolios from a single account." },
];

/* ================================================================== */
export default function ProductPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none orb-pulse" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Product</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-6">
              Turn data into powerful<br />
              <span className="gradient-text-animated">storytelling</span>
            </h1>
            <p className="text-lg text-white/40 leading-relaxed max-w-2xl mx-auto mb-10">
              Skip the spreadsheets. Skip the manual analysis. CortexCFO reads your Trial Balance
              and delivers real-time dashboards, AI-generated narratives, and GAAP compliance
              checks that update as your data changes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl btn-magnetic text-sm font-semibold shadow-lg shadow-emerald-500/20">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-white/50 hover:text-white px-7 py-3.5 rounded-xl glass glass-hover text-sm font-medium">
                Talk to us
              </Link>
            </div>
            {/* Architecture badge — points at the How It Works page */}
            <div className="flex items-center justify-center gap-6 text-xs text-white/30">
              <Link href="/how-it-works" className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Multi-model Cognitive Engine — see how it works
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Product screenshot — custom SVG dashboard illustration in
            a faux browser chrome. Theme-aware via currentColor. */}
        <FadeIn delay={300}>
          <div className="max-w-5xl mx-auto mt-16">
            <div className="rounded-2xl overflow-hidden glass glow-border shadow-2xl">
              <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="text-[10px] text-white/20 ml-3">CortexCFO — Financial Analysis</span>
              </div>
              <div className="w-full h-[400px] bg-[#0d0d0d]">
                <HeroDashboardIllustration className="w-full h-full text-white" />
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── Value Proposition ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop building reports.<br />Start telling stories.
            </h2>
            <p className="text-white/40 max-w-xl mx-auto text-[15px]">
              Your stakeholders do not want spreadsheets. They want insight, context, and clarity.
              CortexCFO generates the analysis that used to take days, in under a minute.
            </p>
          </FadeIn>

          {/* Feature cards — alternating layout */}
          <div className="space-y-20">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <FadeIn key={i} delay={100}>
                  <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "" : ""}`}>
                    <div className={i % 2 === 1 ? "md:order-2" : ""}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-emerald-400" />
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{f.tag}</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 leading-snug">{f.title}</h3>
                      <p className="text-white/40 leading-relaxed text-[15px] mb-6">{f.desc}</p>
                      <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors group">
                        Try it free <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                    <div className={i % 2 === 1 ? "md:order-1" : ""}>
                      <div className="rounded-2xl overflow-hidden glass card-shine bg-[#0d0d0d]">
                        {typeof f.img === "string" ? (
                          <img
                            src={f.img}
                            alt={f.title}
                            className="w-full h-[300px] object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-[300px] text-white">
                            {/* Custom SVG illustration — inherits theme via currentColor */}
                            <f.img className="w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── "Tell the right story" use cases ─── */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <FadeIn>
              <div className="md:sticky md:top-24">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Use Cases</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  Tell the right story,<br />every time
                </h2>
                <p className="text-white/40 text-[15px] leading-relaxed mb-8">
                  Whether you are presenting to investors, reviewing with your team, or preparing for a fundraise,
                  CortexCFO adapts the analysis to your audience and context.
                </p>
                <ul className="space-y-3">
                  {useCases.map((uc, i) => (
                    <li key={i} className="flex items-center gap-3 text-[15px]">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-white/60">{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="rounded-2xl overflow-hidden glass glow-border">
                <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  <span className="text-[10px] text-white/20 ml-3">Board Update — Q4 FY26</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">Executive Summary</p>
                    <p className="text-sm text-white/50 leading-relaxed">Revenue came in at <strong className="text-white">$575KM</strong> against a target of Rs 4.2M, a <strong className="text-emerald-400">+13.8%</strong> beat driven by Q4 enterprise deals...</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Revenue", value: "$575K", change: "+13.8%", up: true },
                      { label: "Net Margin", value: "18.2%", change: "+2.1%", up: true },
                      { label: "Burn Rate", value: "Rs 6.4L/mo", change: "-5.2%", up: true },
                    ].map((kpi) => (
                      <div key={kpi.label} className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                        <p className="text-[10px] text-white/30">{kpi.label}</p>
                        <p className="text-sm font-bold text-white">{kpi.value}</p>
                        <p className={`text-[10px] ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>{kpi.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                    <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">AI Insight</p>
                    <p className="text-sm text-white/50 leading-relaxed">Working capital improved by 12% due to better receivable collection. However, employee costs grew 8% faster than revenue, suggesting headcount efficiency should be reviewed before next hiring cycle.</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Social Proof Quote ─── */}
      <FadeIn>
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-0.5 mb-6">
              {[1, 2, 3, 4, 5].map((j) => <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-white/70 mb-6">
              &ldquo;CortexCFO gives us clean, real-time metrics that anyone on the team can access. We stopped wasting time building reports and started making decisions.&rdquo;
            </blockquote>
            <div>
              <p className="text-sm font-semibold">Rajesh Mehta</p>
              <p className="text-xs text-white/30">VP Finance, Growth-Stage SaaS Company</p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── Stats ─── */}
      <FadeIn>
        <section className="py-16 px-6 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "60s", label: "Upload to insight" },
              { value: "95%+", label: "Classification accuracy" },
              { value: "11", label: "Industries benchmarked" },
              { value: "6", label: "GAAP standards checked" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── FAQ ─── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          </FadeIn>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/30 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tell the story behind<br />your numbers
            </h2>
            <p className="text-white/40 mb-10 text-[15px]">
              Your data has a narrative. CortexCFO helps you find it, understand it, and communicate it
              to the people who make decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl btn-magnetic text-sm font-semibold shadow-lg shadow-emerald-500/20">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-white/50 hover:text-white px-8 py-3.5 rounded-xl glass glass-hover text-sm font-medium">
                Talk to us
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
