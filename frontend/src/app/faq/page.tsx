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
    a: "Upload your Trial Balance in Excel or CSV format from any accounting software such as QuickBooks, Xero, or QuickBooks. CortexCFO automatically classifies your accounts, calculates financial ratios, checks GAAP compliance, and generates a detailed analysis report. You can then ask our AI consultant follow-up questions about your data.",
  },
  {
    category: "General",
    q: "What file formats does CortexCFO accept?",
    a: "CortexCFO accepts Trial Balance data in .xlsx, .xls, and .csv formats. The system is designed to work with exports from popular accounting software including QuickBooks Online, QuickBooks Desktop, Xero, QuickBooks, Sage, and FreshBooks. You can also use our standard template for manual uploads.",
  },
  {
    category: "General",
    q: "What industries does CortexCFO support?",
    a: "CortexCFO supports a wide range of industries including Manufacturing, IT Services, Retail and E-commerce, Healthcare, Real Estate, NBFC and Financial Services, Education, and Hospitality. Each analysis is benchmarked against industry-specific standards and ratios relevant to Indian markets.",
  },
  {
    category: "General",
    q: "Which GAAP standards does CortexCFO cover?",
    a: "CortexCFO currently reviews compliance against six key Indian Accounting Standards: GAAP 12 (Income Taxes / Deferred Tax), GAAP 15 (Employee Benefits), GAAP 16 (Property, Plant and Equipment), ASC 715 (Retirement Benefits) (Provisions and Contingencies), ASC 850 (Related Party) (Related Party Disclosures), and ASC 450 (Contingencies) (Revenue Recognition). Each review includes severity levels and specific remediation steps.",
  },
  {
    category: "Pricing",
    q: "Is there a free trial available?",
    a: "Yes. CortexCFO is currently in beta and is free for all early users. You can sign up, upload your Trial Balance, and get a full analysis at no cost. Once we exit beta, early users will receive preferential pricing and a generous free tier.",
  },
  {
    category: "Pricing",
    q: "What are the pricing plans?",
    a: "During beta, CortexCFO is completely free. Post-launch, we will offer a Free tier with limited analyses per month, a Pro tier for growing businesses with unlimited analyses and advanced features, and an Enterprise tier with custom integrations, priority support, and dedicated account management. Pricing will be announced before beta ends.",
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
    a: "Currently, CortexCFO works with exported Trial Balance files from QuickBooks and Xero. Direct API integrations with QuickBooks Online, Xero, and other popular accounting software are on our roadmap and expected within the next quarter. This will enable automatic syncing and real-time analysis.",
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
              Everything you need to know about CortexCFO. Can not find what you are looking for? Reach out to our team.
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
              Our team is happy to help. Reach out and we will get back to you within 24 hours.
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
