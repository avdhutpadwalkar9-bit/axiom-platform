"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, ArrowRight, ChevronDown, Check, BarChart3, Brain, Shield, LineChart, Upload, Zap, Target, Users } from "lucide-react";
import { FadeIn } from "@/components/Animate";

const features = [
  {
    tag: "Analysis",
    title: "From upload to insight in 60 seconds",
    desc: "Drop a Trial Balance from Tally, Zoho, or Excel. CortexCFO auto-classifies 100+ account types, builds your P&L, Balance Sheet, and Cash Flow indicators. No manual mapping. No templates. Just answers.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=85",
  },
  {
    tag: "AI Consultant",
    title: "Ask anything. Get specific answers.",
    desc: "Powered by Claude AI with your actual financial data. Not generic answers from the internet. Ask about cost reduction, risk assessment, cash flow projections, or Ind AS compliance gaps. The AI references your specific account names and numbers.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=85",
  },
  {
    tag: "Compliance",
    title: "Automatic Ind AS compliance review",
    desc: "Every upload is checked against AS 12, 15, 16, 19, 24, and 37. The system flags deferred tax gaps, revenue recognition issues under Ind AS 115, and missing provisions. Each finding includes severity level and specific remediation steps.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=85",
  },
  {
    tag: "Scenarios",
    title: "Pressure-test every decision before you make it",
    desc: "What happens if you hire 5 people? Raise prices 15%? Delay fundraising? Model scenarios and watch your cash forecast, runway, and breakeven date recalculate instantly. Make decisions with data, not gut feel.",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=85",
  },
];

const useCases = [
  { title: "Board & Investor Updates", desc: "Generate board-ready financial summaries with KPIs, variance analysis, and AI commentary. No more building decks from scratch." },
  { title: "Monthly Close Review", desc: "Auto-reconcile your Trial Balance, flag anomalies, and generate the analysis your team used to spend days on." },
  { title: "Fundraising Due Diligence", desc: "Produce Quality of Earnings analysis, Adjusted EBITDA bridges, and compliance reports that investors expect." },
  { title: "CA Firm Client Reports", desc: "White-label financial intelligence for your clients. Analyze multiple businesses from one dashboard." },
  { title: "Department Budget Reviews", desc: "Break down expenses by department, track against budgets, and identify where money is going." },
];

const faqs = [
  { q: "What file formats does CortexCFO support?", a: "We support CSV, Excel (.xlsx), and JSON files. You can export from Tally, Zoho Books, QuickBooks, or any accounting software that produces a Trial Balance." },
  { q: "How does the AI know about Indian accounting standards?", a: "Our AI is specifically configured with knowledge of Ind AS standards (12, 15, 16, 19, 24, 37, 115), GST compliance, TDS regulations, and MSME-specific financial patterns. It references your actual data, not generic information." },
  { q: "Is my financial data secure?", a: "Yes. All data is encrypted with 256-bit encryption at rest and in transit. We never use your data to train AI models. You can request deletion at any time. Data residency is in India." },
  { q: "Can I use CortexCFO for multiple companies?", a: "Yes. Each workspace can hold a different company. CA firms and PE funds use this to manage portfolios of companies from a single account." },
  { q: "How accurate is the AI analysis?", a: "The account classification achieves 95%+ accuracy for standard Indian Chart of Accounts. The AI generates insights from your actual data, never fabricated numbers. We always recommend human review for critical decisions." },
  { q: "What happens after the free trial?", a: "The Starter plan is free forever with 1 file upload and basic features. Growth plan at Rs 9,999 per month unlocks unlimited uploads, AI chat, and industry benchmarks. Enterprise pricing is custom." },
];

export default function ProductPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
            <span className="text-[15px] font-semibold tracking-tight">CortexCFO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
            <Link href="/product" className="text-white transition-colors">Product</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Resources</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-white/50 hover:text-white">Log in</Link>
            <Link href="/signup" className="text-[13px] bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 font-medium">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Product</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Turn raw data into
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">strategic clarity</span>
            </h1>
            <p className="text-lg text-white/40 leading-relaxed max-w-2xl mx-auto mb-10">
              Skip the spreadsheets. Skip the manual analysis. CortexCFO reads your Trial Balance
              and delivers the financial intelligence your business needs to make better decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-white/50 hover:text-white px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium hover:bg-white/5">
                Talk to us
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Product screenshot */}
        <FadeIn delay={300}>
          <div className="max-w-5xl mx-auto mt-16">
            <div className="rounded-2xl border border-white/8 overflow-hidden bg-[#111] shadow-2xl">
              <div className="bg-[#161616] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="text-[10px] text-white/20 ml-3">CortexCFO Dashboard</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85"
                alt="CortexCFO Dashboard"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Feature blocks — alternating layout */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-20">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Stop building reports.<br />Start making decisions.
            </h2>
          </FadeIn>

          <div className="space-y-24">
            {features.map((f, i) => (
              <FadeIn key={i} delay={100}>
                <div className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                  <div className={i % 2 === 1 ? "md:order-2" : ""}>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">{f.tag}</span>
                    <h3 className="text-2xl font-bold mb-4 leading-snug">{f.title}</h3>
                    <p className="text-white/40 leading-relaxed text-[15px] mb-6">{f.desc}</p>
                    <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300">
                      Try it free <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className={i % 2 === 1 ? "md:order-1" : ""}>
                    <div className="rounded-2xl border border-white/8 overflow-hidden bg-[#111]">
                      <img src={f.img} alt={f.title} className="w-full h-[300px] object-cover" loading="lazy" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases — "Tell the right story" */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Use Cases</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tell the right story,<br />every time
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Whether you are reporting to investors, reviewing with your team, or preparing for a fundraise,
              CortexCFO adapts to your audience.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-4">
            {useCases.map((uc, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all h-full group">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                      <span className="text-emerald-400 text-xs font-bold">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2">{uc.title}</h3>
                      <p className="text-xs text-white/35 leading-relaxed">{uc.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <FadeIn>
        <section className="py-16 px-6 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "60s", label: "Upload to insight" },
              { value: "95%+", label: "Classification accuracy" },
              { value: "11", label: "Industries benchmarked" },
              { value: "6", label: "Ind AS standards checked" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">FAQ</p>
            <h2 className="text-3xl font-bold">Common questions</h2>
          </FadeIn>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 40}>
                <div className="border border-white/8 rounded-xl overflow-hidden">
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
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 relative overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Tell the story behind<br />your numbers
            </h2>
            <p className="text-white/40 mb-10">
              Join finance leaders who replaced spreadsheets and gut feel with AI-powered clarity.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 text-white/50 hover:text-white px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium">
                Talk to us
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                <span className="text-sm font-semibold">CortexCFO</span>
              </div>
              <p className="text-xs text-white/25 leading-relaxed">AI-powered financial intelligence for Indian businesses.</p>
            </div>
            {[
              { title: "Product", links: [{ label: "Overview", href: "/product" }, { label: "Industries", href: "/industries" }, { label: "Glossary", href: "/glossary" }] },
              { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Blog", href: "/blog" }, { label: "Contact", href: "/contact" }] },
              { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "FAQ", href: "/faq" }] },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-3">{col.title}</p>
                <ul className="space-y-2">{col.links.map((l) => <li key={l.label}><Link href={l.href} className="text-sm text-white/30 hover:text-white/60 transition-colors">{l.label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-6 flex items-center justify-between">
            <p className="text-xs text-white/20">&copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.</p>
            <div className="flex gap-4 text-xs text-white/20">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white/40">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-white/40">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
