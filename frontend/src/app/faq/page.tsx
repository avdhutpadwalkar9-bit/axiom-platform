"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, HelpCircle, Shield, CreditCard, Code } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

type Category = "General" | "Pricing" | "Security" | "Technical";

const categories: { label: Category; icon: React.ElementType }[] = [
  { label: "General", icon: HelpCircle },
  { label: "Pricing", icon: CreditCard },
  { label: "Security", icon: Shield },
  { label: "Technical", icon: Code },
];

const faqData: { category: Category; q: string; a: string }[] = [
  {
    category: "General",
    q: "What is CortexCFO?",
    a: "CortexCFO is an AI-powered financial intelligence platform built for Indian businesses. It transforms raw financial data like Trial Balances into boardroom-ready analysis, GAAP compliance reviews, ratio analysis, and strategic insights in under 60 seconds.",
  },
  {
    category: "General",
    q: "How does CortexCFO work?",
    a: "Upload your Trial Balance in Excel or CSV format from any accounting software such as QuickBooks, Xero, Tally, or Zoho Books. CortexCFO automatically classifies your accounts, calculates financial ratios, checks compliance, and generates a detailed QoE-style analysis report. You can then ask our AI consultant follow-up questions about your data.",
  },
  {
    category: "General",
    q: "What file formats does CortexCFO accept?",
    a: "CortexCFO accepts Trial Balance data in .xlsx, .xls, and .csv formats. The system is designed to work with exports from popular accounting software including QuickBooks Online, QuickBooks Desktop, Xero, Tally, Zoho Books, Sage, and FreshBooks. You can also use our standard template for manual uploads.",
  },
  {
    category: "General",
    q: "What industries does CortexCFO support?",
    a: "CortexCFO supports a wide range of industries including Manufacturing, IT Services, Retail and E-commerce, Healthcare, Real Estate, NBFC and Financial Services, Education, and Hospitality. Each analysis is benchmarked against industry-specific standards and ratios relevant to Indian markets.",
  },
  {
    category: "General",
    q: "Which accounting standards does CortexCFO cover?",
    a: "CortexCFO reviews compliance against the Indian Accounting Standards (Ind AS) most relevant to MSMEs and pre-diligence prep: Ind AS 12 (Income Taxes / Deferred Tax), Ind AS 19 (Employee Benefits), Ind AS 16 (Property, Plant & Equipment), Ind AS 37 (Provisions & Contingencies), Ind AS 24 (Related Party Disclosures), and Ind AS 115 (Revenue Recognition). For US-aligned engagements, CortexCFO also covers ASC 606 (Revenue), ASC 842 (Leases), and ASC 718 (Stock Compensation). Each review includes severity levels and specific remediation steps.",
  },
  {
    category: "Pricing",
    q: "Is there a free way to try CortexCFO?",
    a: "Yes. The Free Diagnostic gives you one sample QoE pass on your trial balance, an Adjusted EBITDA preview, and the top 5 add-back flags — at no cost and with no card required. If the report earns your trust, you can upgrade to Investor Readiness or buy a one-time Diligence Pack.",
  },
  {
    category: "Pricing",
    q: "What are the pricing plans?",
    a: "Three tiers plus Enterprise. Free Diagnostic (₹0) for a one-time sample report. Investor Readiness (₹24,999/month) for continuous QoE monitoring — the pre-diligence prep tier for founders 3–9 months from a raise. Diligence Pack (₹1,49,000 one-time) for a specific deal, term sheet, or board meeting, delivered in 5 business days. Enterprise is custom-priced for PE/VC portfolios, family offices, and CA firms. Full breakdown is on the pricing page.",
  },
  {
    category: "Pricing",
    q: "If I start with the Free Diagnostic, can I upgrade?",
    a: "Yes. The Free Diagnostic is designed as the on-ramp. If you upgrade to Investor Readiness or buy a Diligence Pack within 30 days, we credit the value of the diagnostic toward your first month or first report.",
  },
  {
    category: "Security",
    q: "Is my financial data secure?",
    a: "Absolutely. All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We follow SOC 2 Type II controls. Your data is never shared with third parties, never used for model training, and is stored on servers in India. Access is restricted with role-based controls and audit logging.",
  },
  {
    category: "Security",
    q: "Can I delete my data from CortexCFO?",
    a: "Yes. You can delete any uploaded document or your entire account at any time from your dashboard settings. When you delete data, it is permanently removed from our servers within 30 days, including all backups. We provide a data export option before deletion.",
  },
  {
    category: "Technical",
    q: "How accurate is the AI analysis?",
    a: "CortexCFO runs a multi-model Cognitive Engine — a pipeline of specialized models (Classifier, Reasoner, Strategist, Verifier, Synthesizer) combined with deterministic financial formulae. Account classification accuracy exceeds 95% across standard chart-of-account formats. All ratio calculations and compliance checks use established formulae. The AI advisor draws insights from your actual data, not generic responses, and cites specific numbers from your financials. See our How It Works page for the full architecture.",
  },
  {
    category: "Technical",
    q: "Does CortexCFO integrate with QuickBooks and Xero?",
    a: "Currently, CortexCFO works with exported Trial Balance files from QuickBooks, Xero, Tally, and Zoho Books — the four formats that cover the vast majority of Indian MSMEs. Direct API integrations are on our roadmap; we prioritise the connector by request volume and partner readiness. If a specific integration matters to your timeline, write to us and we'll tell you exactly where it sits in the queue.",
  },
  {
    category: "Technical",
    q: "Can I analyze multiple years of data?",
    a: "Yes. CortexCFO supports multi-year analysis. Upload Trial Balances from different financial years and the platform will generate year-over-year comparisons, trend analysis, growth trajectories, and multi-period ratio analysis. This is especially useful for identifying patterns in revenue, expenses, and working capital cycles.",
  },
];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = faqData.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <HelpCircle className="w-3.5 h-3.5" />
              Help center
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Frequently asked questions
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto">
              Everything you need to know about CortexCFO. Can&rsquo;t find what you&rsquo;re looking for? Reach out to our team.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Category tabs ─── */}
      <section className="px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn delay={100}>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => { setActiveCategory(cat.label); setOpenIndex(null); }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-white/5 text-white/40 border border-white/8 hover:text-white/70 hover:border-white/15"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ accordion ─── */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.map((faq, i) => (
            <FadeIn key={`${activeCategory}-${i}`} delay={i * 60}>
              <div className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left group"
                >
                  <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180 text-emerald-400" : ""}`} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openIndex === i ? "500px" : "0px", opacity: openIndex === i ? 1 : 0 }}
                >
                  <div className="px-6 pb-5">
                    <p className="text-sm text-white/40 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 pb-24">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center bg-white/[0.02] border border-white/8 rounded-2xl p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
            <p className="text-white/40 mb-8 max-w-md mx-auto text-sm">
              Our team is happy to help. Reach out and we&rsquo;ll get back to you within 24 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30"
            >
              Contact us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
