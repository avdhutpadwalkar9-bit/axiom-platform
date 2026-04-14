"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  Target,
  Layers,
  GitBranch,
  LineChart,
  Shield,
  Zap,
  MessageSquare,
  Send,
  Play,
  Star,
  Quote,
  Settings,
  Plug,
  CalendarCheck,
  Brain,
  Lightbulb,
  LayoutGrid,
  FileText,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in                                          */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = {
    up: "translateY(32px)",
    left: "translateX(32px)",
    right: "translateX(-32px)",
    none: "",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : t[direction],
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard mockup data                                             */
/* ------------------------------------------------------------------ */
const sidebarItems = [
  { icon: "📊", label: "Overview", active: false },
  { icon: "📈", label: "Exec Dashboard", active: true },
  { icon: "📋", label: "Q4 Plan", active: false },
  { icon: "🔀", label: "Scenarios", active: false },
  { icon: "👥", label: "People", active: false },
  { icon: "💰", label: "Revenue", active: false },
];

/* ------------------------------------------------------------------ */
/*  Feature showcase data                                             */
/* ------------------------------------------------------------------ */
const showcaseFeatures = [
  {
    tag: "Reviewing Brain",
    title: "Hunt margin leaks automatically",
    desc: "Our AI reads every voucher, isolates one-time expenses, and surfaces add-back opportunities the way a Big-4 due diligence team would\u2014every single month.",
    cta: "See a sample QoE report",
    ctaHref: "/contact",
  },
  {
    tag: null,
    title: "Audit-ready Ind AS models in minutes",
    desc: "Connect Tally or Zoho once. Get a fully normalised P&L, balance sheet, and cash-flow statement aligned to Ind AS 12, 15, 16, 19, 24, 37, 115\u2014without a CA in the loop.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Pressure-test every business decision",
    desc: "Model the new plant, the dealer credit tightening, the e-commerce pivot. See the impact on cash, EBITDA, and working capital before you commit a single rupee.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Get growth SOPs, not just dashboards",
    desc: "Each month, your AI CFO ships a board-ready strategy memo: which dealer to drop, which SKU to push, which expense to renegotiate. Actionable. Ranked. Done.",
    cta: null,
    ctaHref: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Cross-functional tabs                                             */
/* ------------------------------------------------------------------ */
const crossFuncTabs = [
  {
    icon: DollarSign,
    title: "Sales pipeline & receivables",
    desc: "Track dealer orders, GST-inclusive billing, and receivables aging tied to revenue and working capital.",
    pills: ["Dealer orders", "GST cycle", "Receivables aging", "Closed/Won"],
  },
  {
    icon: Target,
    title: "Marketing spend & ROI",
    desc: "Track spend by channel, align on ROAS, and adjust plans as performance evolves\u2014synced to your books.",
    pills: ["Budget vs. Actuals", "CAC", "ROAS by channel"],
  },
  {
    icon: Users,
    title: "Headcount & promoter comp",
    desc: "Plan roles, salaries, and promoter compensation with auto-flagged add-backs for due diligence readiness.",
    pills: ["Team headcount", "Promoter comp", "Add-back flags", "Variance"],
  },
];

/* ------------------------------------------------------------------ */
/*  Reviews data                                                      */
/* ------------------------------------------------------------------ */
const reviews = [
  {
    quote: "Found ₹17 L of margin leakage in our first month. Paid for itself 14x over.",
    source: "Founder, ₹38 Cr auto-component manufacturer",
    positive: true,
  },
  {
    quote: "We had three CAs reviewing our books quarterly. CortexCFO replaced two of them and made the third 3x sharper.",
    source: "CFO, Pune-based SaaS firm",
    positive: true,
  },
  {
    quote: "Lender asked for an Adjusted EBITDA schedule on a Friday. We sent it Monday morning. The QoE engine had already built it.",
    source: "Promoter, FMCG distribution",
    positive: true,
  },
  {
    quote: "Tally connection was actually 5 minutes. I was waiting for the catch.",
    source: "Director, electrical contractor",
    positive: true,
  },
  {
    quote: "The strategic add-back schedule is what saved us in our PE diligence. Worth ₹2 Cr in valuation alone.",
    source: "Founder, healthcare services chain",
    positive: true,
  },
  {
    quote: "Our working capital cycle dropped from 78 days to 54. The receivables alerts are ruthless.",
    source: "MD, building materials trading",
    positive: true,
  },
  {
    quote: "Took us a few weeks to trust the AI's add-back recommendations. Now we run them past our CA as a sanity check, not the other way around.",
    source: "Founder, D2C food brand",
    positive: false,
  },
  {
    quote: "The monthly growth SOP is the most useful thing my inbox receives. Better than my old retainer CA's quarterly deck.",
    source: "Promoter, textile mill",
    positive: true,
  },
  {
    quote: "Honest gripe: the dashboard sometimes feels too dense for non-finance people. They're working on it.",
    source: "Co-founder, logistics startup",
    positive: false,
  },
  {
    quote: "Support team responds in Hindi-Marathi-English on WhatsApp. That alone is worth more than any other software we use.",
    source: "Founder, 2nd-gen pharma manufacturer",
    positive: true,
  },
  {
    quote: "Initial setup needed help mapping our Tally cost centres correctly. Once done, it just works.",
    source: "CFO, ed-tech firm",
    positive: false,
  },
  {
    quote: "Replaced ₹5.5 Lakh/year of advisory spend. The board sees better numbers, faster.",
    source: "Director, specialty chemicals",
    positive: true,
  },
];

/* ------------------------------------------------------------------ */
/*  FP&A Essentials Tab Data                                          */
/* ------------------------------------------------------------------ */
const essentialsTabs = [
  {
    icon: Brain,
    title: "Continuous QoE engine",
    desc: "Every voucher, every month: hunt for margin leaks, isolate one-time expenses, and ship a defensible add-back schedule\u2014the way a Big-4 due diligence team would.",
    active: true,
    isNew: true,
  },
  {
    icon: FileText,
    title: "Audit-ready Ind AS books",
    desc: "Auto-normalised P&L, balance sheet, and cash-flow statement aligned to Ind AS 12, 15, 16, 19, 24, 37, 115. Ready for your CA, lender, or investor on day one.",
    active: false,
  },
  {
    icon: GitBranch,
    title: "Strategic scenario planning",
    desc: "Model the new plant, the dealer credit tightening, the e-commerce pivot. See impact on cash, EBITDA, and working capital before you commit.",
    active: false,
  },
  {
    icon: BarChart3,
    title: "Common-size & ratio benchmarking",
    desc: "Auto-compare your margins, working capital cycle, and capital efficiency against industry peers in your sector. Spot exactly where you bleed.",
    active: false,
  },
  {
    icon: DollarSign,
    title: "Working capital intelligence",
    desc: "Receivables aging, payables stretching, inventory turns, GST credit cycle\u2014all watched continuously, with action-ready alerts.",
    active: false,
  },
  {
    icon: LineChart,
    title: "Cash-flow forecasting",
    desc: "13-week rolling cash forecast tied to actual books. Flags shortfalls 8 weeks ahead so you negotiate with bankers, not beg.",
    active: false,
  },
  {
    icon: Search,
    title: "Variance analysis",
    desc: "Auto-flag vendor over-billings, SKU margin erosion, and budget vs actual gaps\u2014with the underlying voucher one click away.",
    active: false,
  },
  {
    icon: CalendarCheck,
    title: "Monthly close in one click",
    desc: "Bank reconciliation, vendor matching, GST validation, and management report\u2014done overnight, ready for your morning standup.",
    active: false,
  },
  {
    icon: Sparkles,
    title: "Growth SOPs, not dashboards",
    desc: "Each month, a board-ready strategy memo: which dealer to drop, which SKU to push, which expense to renegotiate. Ranked. Defendable. Done.",
    active: false,
  },
  {
    icon: Plug,
    title: "Native Tally + Zoho integrations",
    desc: "Two-way OAuth sync with Tally, Zoho Books, ICICI/HDFC bank feeds, GSTN, and Razorpay. No CSV exports, no IT ticket, no break-glass.",
    active: false,
  },
];

/* ================================================================== */
export default function LandingPage() {
  const [heroMounted, setHeroMounted] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [activeCrossFunc, setActiveCrossFunc] = useState(0);
  const [activeEssential, setActiveEssential] = useState(0);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeroMounted(true);
  }, []);

  // Auto-rotate showcase
  useEffect(() => {
    const timer = setInterval(
      () => setActiveShowcase((p) => (p + 1) % showcaseFeatures.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO SECTION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-12 pb-4 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div
            className={`transition-all duration-1000 ${
              heroMounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* G2 badge */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#111] border border-white/8 px-3.5 py-1.5 rounded-full">
                <div className="w-5 h-5 rounded-full bg-[#ff492c] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">G2</span>
                </div>
                <span className="text-[13px] font-medium text-white">
                  G2.com 4.8/5 stars
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: text content */}
              <div className="pt-4">
                <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-serif-heading font-bold leading-[1.05] tracking-tight text-white mb-8">
                  Your Automated
                  <br />
                  CFO &amp; Strategy Partner
                </h1>

                <p className="text-[18px] text-white/50 leading-relaxed max-w-lg mb-8">
                  We turn messy bookkeeping into audit-ready financial models,
                  continuous QoE, and actionable growth SOPs&mdash;in minutes, not
                  months. Built for Indian MSMEs.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href="/signup" className="btn-accent">
                    Connect Tally in 5 minutes
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 text-white/70 hover:text-white px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium transition-all">
                    Talk to a human
                  </Link>
                </div>

                {/* Quote */}
                <div className="flex items-start gap-3 mt-10">
                  <div className="flex-1">
                    <p className="text-[15px] text-white/50 italic leading-relaxed">
                      &ldquo;Replaced our &#8377;6 Lakh/year CA retainer with a
                      &#8377;10K/month AI advisor that never sleeps.&rdquo;
                    </p>
                    <a
                      href="#reviews"
                      className="inline-flex items-center gap-1 text-[13px] text-[#f2a60c] font-medium mt-2 hover:underline"
                    >
                      See how MSMEs are switching
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Dashboard mockup */}
              <div
                className={`transition-all duration-1000 delay-300 ${
                  heroMounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="product-card">
                  {/* Breadcrumb bar */}
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2.5 flex items-center gap-2 text-[12px] text-white/40">
                    <span>🏠 Overview</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60 font-medium">
                      Adjusted EBITDA &mdash; Q3 FY26
                    </span>
                  </div>

                  <div className="p-5 bg-[#111]">
                    {/* Top Line Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] font-semibold text-white">
                        Reviewing Brain &mdash; QoE Snapshot
                      </h3>
                      <button className="text-[11px] text-white/30 bg-white/5 px-2 py-1 rounded">
                        ₹ / %
                      </button>
                    </div>

                    {/* Data table */}
                    <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden mb-4">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left py-2.5 px-3 font-medium text-white/40">
                              Driver
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              ✱ Reported
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              ✱ Adjusted
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              Add-back
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Revenue (TTM)
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹4.2 Cr
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹4.2 Cr
                            </td>
                            <td className="py-2.5 px-3 text-right text-white/30 tabular-nums">
                              &mdash;
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">EBITDA</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹62 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹81 L
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-500 tabular-nums font-medium">
                              +₹19 L
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              One-time legal
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹8 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              &mdash;
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-500">
                              +₹8 L
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Promoter salary excess
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹14 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹3 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-500">
                              +₹11 L
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-white/60">
                              Working capital cycle
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              68 days
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              52 days
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-500 tabular-nums">
                              -16d
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="px-3 py-2 text-[11px] text-white/25 border-t border-white/5">
                        + Add driver
                      </div>
                    </div>

                    {/* AI Chat popup */}
                    <div className="bg-[#111] rounded-xl border border-white/8 p-4 shadow-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] text-white/60 leading-relaxed">
                            Detected ₹19 L of <strong>add-back opportunities</strong> in
                            this quarter&apos;s ledger&mdash;Adjusted EBITDA jumps from
                            14.8% to 19.3% margin.
                          </p>
                        </div>
                      </div>
                      <div className="ml-10">
                        <div className="inline-block bg-white/5 rounded-xl px-3 py-2 text-[12px] text-white/50 mb-3">
                          Show me the strategic add-backs for due diligence
                        </div>
                      </div>
                      <div className="ml-10 flex items-center gap-2 text-[11px] text-white/30">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Thinking</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
                        <input
                          type="text"
                          placeholder="Ask anything"
                          className="flex-1 text-[12px] text-white/40 bg-transparent outline-none placeholder:text-white/25"
                          readOnly
                        />
                        <div className="flex items-center gap-1.5">
                          <button className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                            <Settings className="w-3 h-3 text-white/30" />
                          </button>
                          <button className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CONTINUOUS QoE ENGINE / REVIEWING BRAIN                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-14 text-center max-w-3xl mx-auto">
            <p className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wider mb-3 inline-flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" />
              The Reviewing Brain
            </p>
            <h2 className="text-[36px] md:text-[48px] font-serif-heading font-bold leading-[1.1] tracking-tight text-white mb-6">
              Continuous QoE Engine
            </h2>
            <p className="text-[17px] text-white/55 leading-relaxed">
              What a Big-4 advisory firm does once during due diligence, our AI does
              <span className="text-white"> every single month</span>. We hunt margin
              leaks, isolate one-time expenses, and build the strategic add-back
              schedule that makes your business audit-ready and fundable&mdash;always.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: Search,
                tag: "Hunt",
                title: "Find the leaks",
                desc: "Scans every voucher, ledger entry, and bank statement to flag duplicate payments, idle inventory, vendor over-billings, and SKU-level margin erosion.",
                stat: "Avg ₹14&nbsp;L of leakage surfaced in month one",
              },
              {
                icon: Layers,
                tag: "Isolate",
                title: "Strip the noise",
                desc: "Auto-classifies one-time legal fees, COVID write-downs, promoter perks, and non-recurring CapEx so your true operating EBITDA stops hiding in the noise.",
                stat: "Adjusted EBITDA delta: +3&ndash;8% on average",
              },
              {
                icon: Lightbulb,
                tag: "Defend",
                title: "Build the add-back schedule",
                desc: "Ships a board-ready add-back schedule with footnotes the way a Big-4 QoE report would&mdash;ready for any investor, lender, or acquirer.",
                stat: "Replaces ₹6&nbsp;L+ of one-time advisory work",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <FadeIn key={card.title} delay={i * 120}>
                  <div className="bg-[#111] rounded-2xl border border-white/8 p-7 h-full hover:border-emerald-500/30 hover:bg-[#131313] transition-all group">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-semibold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-[13.5px] text-white/50 leading-relaxed mb-5">
                      {card.desc}
                    </p>
                    <p
                      className="text-[12px] text-emerald-400/90 font-medium pt-4 border-t border-white/5"
                      dangerouslySetInnerHTML={{ __html: card.stat }}
                    />
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Comparison strip */}
          <FadeIn delay={300}>
            <div className="bg-[#0d0d0d] rounded-2xl border border-white/8 p-8 grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1">
                <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  The old way
                </p>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  Hire a Big-4 firm for &#8377;6&nbsp;Lakh+. Wait 6&ndash;8 weeks.
                  Get a static QoE deck. Repeat next year.
                </p>
              </div>
              <div className="md:col-span-1 flex justify-center">
                <ArrowRight className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="md:col-span-1">
                <p className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  CortexCFO
                </p>
                <p className="text-[14px] text-white leading-relaxed">
                  &#8377;10K/month. Live dashboard, refreshed every night, with a
                  growth SOP delivered to your inbox.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE SHOWCASE (Sticky-style tabs)                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: tabs */}
            <div>
              <div className="space-y-2">
                {showcaseFeatures.map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShowcase(i)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                      i === activeShowcase
                        ? "bg-white/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-[18px] font-semibold transition-colors ${
                          i === activeShowcase
                            ? "text-white"
                            : "text-white/30"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      {feature.tag && (
                        <span className="text-[10px] font-bold text-[#f2a60c] bg-[#f2a60c]/10 px-2 py-0.5 rounded-full uppercase">
                          {feature.tag}
                        </span>
                      )}
                    </div>
                    {i === activeShowcase && (
                      <div className="animate-slide-up">
                        <p className="text-[14px] text-white/50 leading-relaxed mt-2">
                          {feature.desc}
                        </p>
                        {feature.cta && (
                          <Link
                            href={feature.ctaHref || "/contact"}
                            className="inline-flex items-center gap-1 text-[13px] text-[#f2a60c] font-medium mt-3 hover:underline"
                          >
                            {feature.cta}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="product-card">
                  <div className="bg-[#111] p-6">
                    {activeShowcase === 0 && (
                      <div className="animate-scale-in">
                        {/* AI analysis mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <span className="text-[13px] font-semibold">
                              AI Analyst
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-white/5 rounded-lg p-3 text-[12px] text-white/60">
                              Revenue dipped 12% MoM&mdash;3 dealer orders slipped to next
                              quarter. GST input credit cycle is healthy at 28 days.
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-[12px] text-white/60">
                              Action: Tighten credit terms with North-zone distributors;
                              receivables aging &gt; 90 days is up ₹14 L.
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Revenue", value: "₹4.2 Cr", change: "-12%" },
                            { label: "GP Margin", value: "32%", change: "+1.4%" },
                            { label: "Adj EBITDA", value: "19.3%", change: "+4.5%" },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="bg-[#111] rounded-xl border border-white/8 p-3"
                            >
                              <p className="text-[10px] text-white/35 mb-1">
                                {m.label}
                              </p>
                              <p className="text-[16px] font-semibold tabular-nums">
                                {m.value}
                              </p>
                              <p
                                className={`text-[11px] tabular-nums ${
                                  m.change.startsWith("-")
                                    ? "text-red-500"
                                    : "text-emerald-600"
                                }`}
                              >
                                {m.change}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeShowcase === 1 && (
                      <div className="animate-scale-in">
                        {/* Data modeling mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
                          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[13px] font-semibold">
                              Revenue Model
                            </span>
                            <span className="text-[11px] text-white/30">
                              3 dimensions
                            </span>
                          </div>
                          <div className="p-4 space-y-2">
                            {[
                              { name: "Monthly Revenue", formula: "= Volume × Realisation", value: "₹35 L" },
                              { name: "Active Dealers", formula: "= New + Existing - Churned", value: "126" },
                              { name: "Avg Order Value", formula: "= Revenue / Orders", value: "₹2.8 L" },
                              { name: "Receivable Days", formula: "= AR / (Revenue/Day)", value: "52 days" },
                              { name: "Working Capital", formula: "= AR + Inv - AP", value: "₹1.2 Cr" },
                            ].map((row) => (
                              <div
                                key={row.name}
                                className="flex items-center justify-between py-2 border-b border-white/5"
                              >
                                <div>
                                  <p className="text-[13px] font-medium">
                                    {row.name}
                                  </p>
                                  <p className="text-[11px] text-white/30 font-mono">
                                    {row.formula}
                                  </p>
                                </div>
                                <p className="text-[14px] font-semibold tabular-nums">
                                  {row.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeShowcase === 2 && (
                      <div className="animate-scale-in">
                        {/* Plan testing mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="text-[13px] font-semibold">Plan Comparison</span>
                          </div>
                          <div className="space-y-3">
                            {[
                              { plan: "Conservative", revenue: "₹3.8 Cr", headcount: 28, runway: "28 mo" },
                              { plan: "Base Case", revenue: "₹4.2 Cr", headcount: 32, runway: "22 mo" },
                              { plan: "Aggressive", revenue: "₹5.1 Cr", headcount: 38, runway: "16 mo" },
                            ].map((p) => (
                              <div
                                key={p.plan}
                                className={`rounded-xl p-3 border ${
                                  p.plan === "Base Case"
                                    ? "border-[#f2a60c]/30 bg-[#f2a60c]/5"
                                    : "border-white/8"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[13px] font-medium">{p.plan}</span>
                                  {p.plan === "Base Case" && (
                                    <span className="text-[10px] font-bold text-[#f2a60c] bg-[#f2a60c]/10 px-2 py-0.5 rounded-full">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                  <div>
                                    <p className="text-white/30">Revenue</p>
                                    <p className="font-semibold tabular-nums">{p.revenue}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/30">Headcount</p>
                                    <p className="font-semibold tabular-nums">{p.headcount}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/30">Runway</p>
                                    <p className="font-semibold tabular-nums">{p.runway}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeShowcase === 3 && (
                      <div className="animate-scale-in">
                        {/* Scenarios mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <GitBranch className="w-4 h-4 text-purple-500" />
                            <span className="text-[13px] font-semibold">Scenario Builder</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we delay the &#8377;2 Cr machinery CapEx by 2 quarters?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we tighten dealer credit from 60 to 45 days?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we shift 30% of revenue to e-commerce?</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/5 rounded-xl">
                            <p className="text-[11px] text-white/40 mb-2">Impact Preview</p>
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                              <div className="flex justify-between">
                                <span className="text-white/40">Free cash flow</span>
                                <span className="font-semibold text-emerald-500">+&#8377;42 L/qtr</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Working capital</span>
                                <span className="font-semibold text-emerald-500">-16 days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CROSS-FUNCTIONAL SECTION                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#eae8e3]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-16">
            <h2 className="text-[42px] md:text-[56px] font-serif-heading font-bold leading-[1.1] tracking-tight text-white mb-6">
              One brain across
              <br />
              every function
            </h2>
            <p className="text-[16px] text-white/45 max-w-xl leading-relaxed">
              Sales pipeline, marketing spend, headcount, and inventory&mdash;all
              normalised against your books. The strategy memo your CA never had
              the bandwidth to write.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Cross-func tabs */}
            <FadeIn>
              <div className="space-y-6">
                {crossFuncTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveCrossFunc(i)}
                      className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                        i === activeCrossFunc
                          ? "bg-white/10 shadow-lg"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon
                          className={`w-5 h-5 ${
                            i === activeCrossFunc
                              ? "text-[#f2a60c]"
                              : "text-white/25"
                          }`}
                        />
                        <h3
                          className={`text-[16px] font-semibold ${
                            i === activeCrossFunc
                              ? "text-white"
                              : "text-white/30"
                          }`}
                        >
                          {tab.title}
                        </h3>
                      </div>
                      {i === activeCrossFunc && (
                        <div className="animate-slide-up ml-8">
                          <p className="text-[13px] text-white/45 leading-relaxed mb-3">
                            {tab.desc}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {tab.pills.map((pill) => (
                              <span
                                key={pill}
                                className="text-[11px] font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Right: dashboard mockup */}
            <FadeIn delay={200}>
              <div className="sticky top-24">
                <div className="product-card">
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2.5 flex items-center gap-3 text-[12px]">
                    <span className="text-white/30">🔲 FY26 Base ▾</span>
                  </div>
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2 flex items-center gap-2 text-[12px] text-white/40">
                    <span>🏠 GTM</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>✱ Cross-functional</span>
                    <span className="text-white/20">|</span>
                    <span>🟢 Tally ⟳</span>
                  </div>
                  <div className="p-5 bg-[#111]">
                    {activeCrossFunc === 0 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Open Orders</p>
                            <p className="text-[20px] font-bold tabular-nums">₹1.8 Cr</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Receivables &gt; 90d</p>
                            <p className="text-[20px] font-bold tabular-nums text-amber-400">₹14 L</p>
                          </div>
                        </div>
                        {/* Mini bar chart */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Order pipeline by stage</p>
                          <div className="space-y-2">
                            {[
                              { label: "Quoted", width: "90%", color: "bg-blue-400" },
                              { label: "PO Issued", width: "70%", color: "bg-blue-500" },
                              { label: "Dispatched", width: "45%", color: "bg-blue-600" },
                              { label: "Invoiced", width: "30%", color: "bg-blue-700" },
                              { label: "Collected", width: "20%", color: "bg-emerald-500" },
                            ].map((bar) => (
                              <div key={bar.label} className="flex items-center gap-3">
                                <span className="text-[10px] text-white/35 w-20 text-right">{bar.label}</span>
                                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${bar.color}`}
                                    style={{ width: bar.width }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeCrossFunc === 1 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Total Spend", value: "₹12.8 L" },
                            { label: "CAC", value: "₹2,800" },
                            { label: "ROAS", value: "4.2x" },
                          ].map((m) => (
                            <div key={m.label} className="bg-[#111] rounded-xl border border-white/8 p-3">
                              <p className="text-[10px] text-white/30 mb-1">{m.label}</p>
                              <p className="text-[18px] font-bold tabular-nums">{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Spend by channel</p>
                          <div className="space-y-2">
                            {[
                              { channel: "Google Ads", actual: "₹4.2 L", budget: "₹4.5 L" },
                              { channel: "Meta", actual: "₹3.8 L", budget: "₹3.5 L" },
                              { channel: "LinkedIn", actual: "₹2.8 L", budget: "₹3.0 L" },
                              { channel: "Trade shows", actual: "₹2.0 L", budget: "₹1.8 L" },
                            ].map((c) => (
                              <div key={c.channel} className="flex items-center justify-between py-1.5 border-b border-white/5 text-[12px]">
                                <span className="text-white/50">{c.channel}</span>
                                <div className="flex gap-4">
                                  <span className="tabular-nums">{c.actual}</span>
                                  <span className="text-white/25 tabular-nums">{c.budget}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeCrossFunc === 2 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Total Headcount</p>
                            <p className="text-[20px] font-bold tabular-nums">32</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Promoter add-back</p>
                            <p className="text-[20px] font-bold tabular-nums text-emerald-400">₹11 L</p>
                          </div>
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Team breakdown</p>
                          <div className="space-y-2">
                            {[
                              { team: "Production", count: 14, planned: 16 },
                              { team: "Sales", count: 8, planned: 10 },
                              { team: "Procurement", count: 4, planned: 5 },
                              { team: "Operations", count: 4, planned: 4 },
                              { team: "Finance", count: 2, planned: 3 },
                            ].map((t) => (
                              <div key={t.team} className="flex items-center justify-between py-1.5 border-b border-white/5 text-[12px]">
                                <span className="text-white/50">{t.team}</span>
                                <div className="flex items-center gap-2">
                                  <span className="tabular-nums font-medium">{t.count}</span>
                                  <span className="text-white/20">/</span>
                                  <span className="tabular-nums text-white/30">{t.planned}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CLARITY / ALIGNMENT / BOARD MEETING                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Replace ₹6 L of consulting",
                desc: "Get the QoE rigour of a Big-4 advisory firm at a fraction of the cost\u2014every month, not once a year.",
              },
              {
                icon: Shield,
                title: "Stay investor-ready",
                desc: "Audit-ready Ind AS books, ranked add-backs, and a defensible adjusted EBITDA story\u2014for any lender, PE, or strategic acquirer.",
              },
              {
                icon: Star,
                title: "Win your next board meeting",
                desc: "Walk in with a board-ready memo and live dashboard. Answer every \u201cwhy\u201d in real time, with the underlying ledger one click away.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:shadow-lg transition-all duration-300 h-full group">
                  <div className="w-12 h-12 rounded-2xl bg-[#f2a60c]/10 flex items-center justify-center mb-5 group-hover:bg-[#f2a60c]/20 transition-colors">
                    <item.icon className="w-6 h-6 text-[#f2a60c]" />
                  </div>
                  <h3 className="text-[18px] font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-white/45 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  REVIEWS SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="py-24 px-6 bg-[#0a0a0a]/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto mb-12">
          <FadeIn>
            <h2 className="text-[32px] md:text-[40px] font-serif-heading font-bold text-white mb-2">
              Honest reviews from Indian MSME founders
            </h2>
            <p className="text-[14px] text-white/40 max-w-xl">
              The good, the constructive, and the things we&apos;re still
              fixing&mdash;straight from the promoters and CFOs running the businesses.
            </p>
          </FadeIn>
        </div>

        {/* Scrolling reviews - Row 1 */}
        <div className="relative mb-4">
          <div className="overflow-hidden">
            <div className="animate-ticker flex gap-5 w-max">
              {[...reviews, ...reviews].map((review, i) => (
                <div
                  key={i}
                  className="w-[360px] flex-shrink-0 bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <Quote className="w-4 h-4 text-[#f2a60c]" />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        review.positive ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {review.positive ? "Positive" : "Constructive"}
                    </span>
                  </div>
                  <p className="text-[14px] text-white/60 leading-relaxed mb-3">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p className="text-[11px] text-white/30 font-medium">
                    — {review.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 - reverse direction */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="animate-ticker flex gap-5 w-max"
              style={{ animationDirection: "reverse", animationDuration: "35s" }}
            >
              {[...reviews.slice(6), ...reviews.slice(0, 6), ...reviews.slice(6), ...reviews.slice(0, 6)].map(
                (review, i) => (
                  <div
                    key={i}
                    className="w-[360px] flex-shrink-0 bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <Quote className="w-4 h-4 text-[#f2a60c]" />
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          review.positive ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {review.positive ? "Positive" : "Constructive"}
                      </span>
                    </div>
                    <p className="text-[14px] text-white/60 leading-relaxed mb-3">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <p className="text-[11px] text-white/30 font-medium">
                      — {review.source}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FP&A ESSENTIALS GRID                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-14">
            <h2 className="text-[32px] md:text-[42px] font-serif-heading font-bold text-white">
              Everything your CFO + CA + advisor would do
            </h2>
            <p className="text-[15px] text-white/45 mt-3 max-w-2xl">
              Built for Indian MSMEs scaling past &#8377;5 Cr revenue&mdash;where
              hiring a full-time CFO is too early but spreadsheets and quarterly CA
              reviews are too late.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            {/* Left: tabs list */}
            <FadeIn>
              <div className="space-y-1">
                {essentialsTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveEssential(i)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        i === activeEssential
                          ? "bg-[#0a0a0a] text-white"
                          : "text-white/35 hover:text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[14px] font-medium">
                        {tab.title}
                      </span>
                      {"isNew" in tab && tab.isNew && (
                        <span className="text-[9px] font-bold text-[#f2a60c] bg-[#f2a60c]/10 px-1.5 py-0.5 rounded-full uppercase ml-auto">
                          New
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Right: content area */}
            <FadeIn delay={100}>
              <div className="product-card p-8">
                <div className="animate-scale-in" key={activeEssential}>
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = essentialsTabs[activeEssential].icon;
                      return (
                        <div className="w-10 h-10 rounded-xl bg-[#f2a60c]/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-[#f2a60c]" />
                        </div>
                      );
                    })()}
                    <h3 className="text-[20px] font-semibold">
                      {essentialsTabs[activeEssential].title}
                      {"isNew" in essentialsTabs[activeEssential] &&
                        essentialsTabs[activeEssential].isNew && (
                          <span className="ml-2 text-[10px] font-bold text-[#f2a60c] bg-[#f2a60c]/10 px-2 py-0.5 rounded-full uppercase">
                            New
                          </span>
                        )}
                    </h3>
                  </div>
                  <p className="text-[15px] text-white/50 leading-relaxed mb-6">
                    {essentialsTabs[activeEssential].desc}
                  </p>
                  {/* Placeholder visual */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-8 bg-white/5 rounded-lg"
                          style={{ width: `${100 - j * 10}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* CTA */}
          <FadeIn delay={200}>
            <div className="text-center mt-12">
              <p className="text-[16px] text-white/45 mb-6">
                Replace your &#8377;6 Lakh annual advisory retainer with a
                &#8377;10K/month AI CFO that never sleeps&mdash;and ships actionable
                growth SOPs every month.
              </p>
              <Link href="/signup" className="btn-accent">
                Start free with Tally
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ONBOARDING TIMELINE                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]/5">
        <div className="max-w-[900px] mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Near-zero time to value
            </p>
            <h2 className="text-[32px] md:text-[42px] font-serif-heading font-bold text-white">
              From signup to your first Adjusted EBITDA report
              <br />
              <span className="text-emerald-400">in minutes, not weeks</span>
            </h2>
          </FadeIn>

          <div className="space-y-0">
            {[
              {
                step: "01",
                phase: "Connect",
                title: "Plug in Tally or Zoho Books",
                desc: "Secure OAuth connection to your existing books. We auto-pull 3 years of vouchers, ledgers, and bank statements\u2014no CSV exports, no IT ticket.",
                timeline: "5 minutes",
                icon: Plug,
              },
              {
                step: "02",
                phase: "Normalise",
                title: "Reviewing Brain reads everything",
                desc: "Our agent classifies vouchers, isolates one-time expenses, and ships your first audit-ready P&L, balance sheet, and Adjusted EBITDA report\u2014done before your chai gets cold.",
                timeline: "Instant",
                icon: Brain,
              },
              {
                step: "03",
                phase: "Strategise",
                title: "Receive monthly growth SOPs",
                desc: "Every month, your AI CFO ships a board-ready memo: ranked add-backs, working capital actions, and the next strategic move\u2014plus chat-anytime answers.",
                timeline: "Ongoing",
                icon: MessageSquare,
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 150}>
                <div className="flex gap-8 items-start py-10 relative">
                  {/* Timeline line */}
                  {i < 2 && (
                    <div className="absolute left-[27px] top-[80px] bottom-0 w-[2px] bg-white/8" />
                  )}

                  {/* Step number */}
                  <div className="flex-shrink-0">
                    <div className="w-[56px] h-[56px] rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center shadow-sm relative z-10">
                      <span className="text-[14px] font-bold text-[#f2a60c]">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-[#f2a60c] uppercase tracking-wider mb-1">
                      {item.phase}
                    </p>
                    <h3 className="text-[20px] font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-white/45 leading-relaxed mb-3">
                      {item.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/30 bg-[#111] border border-white/8 px-3 py-1.5 rounded-full">
                      <CalendarCheck className="w-3 h-3" />
                      {item.timeline}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FLOATING "TALK TO A HUMAN" BUTTON                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Link
        href="/signup"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-400 active:scale-95 transition-all text-[13px] font-semibold"
      >
        <Plug className="w-4 h-4" />
        Connect Tally Free
      </Link>

      <SiteFooter />
    </div>
  );
}
