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
    tag: "New",
    title: "Analyze with AI",
    desc: "Accelerate workflows, drill into variance, and deeply understand your business.",
    cta: "Get a personalized sneak peek",
    ctaHref: "/contact",
  },
  {
    tag: null,
    title: "Shape data to your business logic",
    desc: "Create flexible, structured models built to scale. Define custom inputs, tie in dimensions, and reuse inputs across plans.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Pressure test every plan",
    desc: "Create dimension-rich plans, drag and drop to explore outcomes, and make instant decisions.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Answer every \"what-if?\"",
    desc: "Build and compare multiple scenarios, tweak assumptions, and see the impact—without ever duplicating a model.",
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
    title: "Sales forecasts",
    desc: "Track CRM deals, ARR, win rates, and contract value—all tied to revenue goals.",
    pills: ["CRM deals", "ARR", "Churn", "Closed/Won"],
  },
  {
    icon: Target,
    title: "Marketing spend and performance",
    desc: "Track spend by channel and campaign, align on ROI, and adjust plans as performance evolves.",
    pills: ["Budget vs. Actuals", "CAC", "ROI by channel"],
  },
  {
    icon: Users,
    title: "Headcount plans",
    desc: "Plan roles, start dates, and salaries across teams while staying within budget and business constraints.",
    pills: ["Team headcount", "Start dates", "Total comp", "Variance vs. Plans"],
  },
];

/* ------------------------------------------------------------------ */
/*  Reviews data                                                      */
/* ------------------------------------------------------------------ */
const reviews = [
  {
    quote: "CortexCFO is what Excel should have always been",
    source: "LinkedIn",
    positive: true,
  },
  {
    quote: "CortexCFO has allowed me to immediately reference any part of our model with ease, and to segment in any way I can imagine.",
    source: "G2 Review",
    positive: true,
  },
  {
    quote: "Even quicker setup than Excel/Sheets with AI prompting",
    source: "LinkedIn",
    positive: true,
  },
  {
    quote: "CortexCFO makes complex modeling a lot easier. It's just better than an Excel spreadsheet.",
    source: "YouTube",
    positive: true,
  },
  {
    quote: "CortexCFO works like magic",
    source: "LinkedIn",
    positive: true,
  },
  {
    quote: "The system is incredibly powerful, easy to use, easy to implement and learn, and they have a very responsive team.",
    source: "G2 Review",
    positive: true,
  },
  {
    quote: "There's somewhat of a learning curve but not as steep as other FP&A software.",
    source: "G2 Review",
    positive: false,
  },
  {
    quote: "The options are limitless on the dimensions that you can create and link within your various models.",
    source: "G2 Review",
    positive: true,
  },
  {
    quote: "Some bugs here and there, but support is so fast it barely matters.",
    source: "G2 Review",
    positive: false,
  },
  {
    quote: "The onboarding specialist listens to feedback and actually implements improvements.",
    source: "G2 Review",
    positive: true,
  },
  {
    quote: "Many up front hours required for implementation. But this is easier than competitors like Anaplan.",
    source: "G2 Review",
    positive: false,
  },
  {
    quote: "CortexCFO helps me plan for any \"what if\" scenario, compare simultaneously, and easily update as decisions are made.",
    source: "G2 Review",
    positive: true,
  },
];

/* ------------------------------------------------------------------ */
/*  FP&A Essentials Tab Data                                          */
/* ------------------------------------------------------------------ */
const essentialsTabs = [
  {
    icon: GitBranch,
    title: "Scenario planning",
    desc: "Create drafts and quickly simulate changes—like a new marketing campaign, funding delay, or new hiring strategy.",
    active: true,
  },
  {
    icon: Users,
    title: "Collaborative budgeting",
    desc: "Align teams on budget goals and hold them accountable—without chasing updates or merging spreadsheets.",
    active: false,
  },
  {
    icon: Sparkles,
    title: "AI hover mode",
    desc: "Get instant AI-powered insights as you hover over any cell, metric, or variance in your model.",
    active: false,
    isNew: true,
  },
  {
    icon: BarChart3,
    title: "Interactive reporting",
    desc: "Build and share interactive dashboards that tell the story behind the numbers.",
    active: false,
  },
  {
    icon: DollarSign,
    title: "Revenue planning",
    desc: "Create pipeline-based revenue models tied to CRM data. Model upsell, churn, new bookings, and show the full financial impact.",
    active: false,
  },
  {
    icon: LineChart,
    title: "Forecasting",
    desc: "Build forecasts that update automatically with real-time actuals. Easily adjust assumptions and compare outcomes.",
    active: false,
  },
  {
    icon: Search,
    title: "Variance analysis",
    desc: "Easily spot vendor-level budget gaps with auto-synced actuals from every source.",
    active: false,
  },
  {
    icon: CalendarCheck,
    title: "One-click financial close",
    desc: "Accelerate your monthly close with automated reconciliation and one-click report generation.",
    active: false,
  },
  {
    icon: Play,
    title: "How it works",
    desc: "See a 2-minute walkthrough of how CortexCFO transforms your financial planning workflow.",
    active: false,
  },
  {
    icon: Plug,
    title: "750 integrations",
    desc: "Connect with your existing tools—ERP, HRIS, CRM, bank feeds, and more. Data flows in automatically.",
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
                  Turn complexity
                  <br />
                  into conviction
                </h1>

                <p className="text-[18px] text-white/50 leading-relaxed max-w-lg mb-8">
                  Collaborative planning, reporting, and forecasting powered by an
                  agent that knows your model as well as you do.
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  <Link href="/contact" className="btn-accent">
                    Talk to a human
                  </Link>
                </div>

                {/* Quote */}
                <div className="flex items-start gap-3 mt-10">
                  <div className="flex-1">
                    <p className="text-[15px] text-white/50 italic leading-relaxed">
                      &ldquo;Incredibly flexible and fun finance copilot&rdquo;
                    </p>
                    <a
                      href="#reviews"
                      className="inline-flex items-center gap-1 text-[13px] text-[#f2a60c] font-medium mt-2 hover:underline"
                    >
                      Get a personalized sneak peek
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
                      Exec Dashboard
                    </span>
                  </div>

                  <div className="p-5 bg-[#111]">
                    {/* Top Line Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] font-semibold text-white">
                        Top Line
                      </h3>
                      <button className="text-[11px] text-white/30 bg-white/5 px-2 py-1 rounded">
                        %
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
                              ✱ Base
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              ✱ Dec Close
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              Variance
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Months of Runway
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              20
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              24
                            </td>
                            <td className="py-2.5 px-3 text-right text-red-500 tabular-nums">
                              -4
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">Burn</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              $1.4M
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              $1.2M
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-600 tabular-nums font-medium">
                              $200K
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Cash Balance
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600">
                              $2M
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Gross Margin
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-white/60">
                              Operating Margin
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              —
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
                            Forecasted 📈 <strong>Burn</strong> for January is up
                            $20k because Revenue is expected to drop $30k.
                          </p>
                        </div>
                      </div>
                      <div className="ml-10">
                        <div className="inline-block bg-white/5 rounded-xl px-3 py-2 text-[12px] text-white/50 mb-3">
                          Why is revenue expected to decrease?
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
                              Revenue decreased 12% MoM primarily due to 3 enterprise
                              contracts moving to Q2. Pipeline coverage remains strong at 3.2x.
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-[12px] text-white/60">
                              Recommendation: Accelerate mid-market deals to offset enterprise timing risk.
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Revenue", value: "$4.2M", change: "-12%" },
                            { label: "Pipeline", value: "3.2x", change: "+0.4x" },
                            { label: "Win Rate", value: "34%", change: "+2%" },
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
                              { name: "MRR", formula: "= Customers × ARPU", value: "$420K" },
                              { name: "Customers", formula: "= New + Existing - Churned", value: "1,240" },
                              { name: "ARPU", formula: "= Revenue / Customers", value: "$339" },
                              { name: "Churn Rate", formula: "= Churned / Previous", value: "2.1%" },
                              { name: "Net Revenue Retention", formula: "= (Expansion + Contraction) / Start", value: "118%" },
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
                              { plan: "Conservative", revenue: "$3.8M", headcount: 42, runway: "28 mo" },
                              { plan: "Base Case", revenue: "$4.2M", headcount: 48, runway: "22 mo" },
                              { plan: "Aggressive", revenue: "$5.1M", headcount: 56, runway: "16 mo" },
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
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium">What if we delay Series B by 6 months?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium">What if we hire 10 more engineers in Q2?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium">What if churn drops to 1.5%?</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/5 rounded-xl">
                            <p className="text-[11px] text-white/40 mb-2">Impact Preview</p>
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                              <div className="flex justify-between">
                                <span className="text-white/40">Cash runway</span>
                                <span className="font-semibold text-emerald-600">+8 months</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Burn rate</span>
                                <span className="font-semibold text-emerald-600">-$180K/mo</span>
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
              Act on shared
              <br />
              intuition
            </h2>
            <p className="text-[16px] text-white/45 max-w-xl leading-relaxed">
              Drive aligned, data-informed decisions with unified inputs from
              other teams, like sales, marketing, and ops.
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
                    <span className="text-white/30">🔲 Base Scenario ▾</span>
                  </div>
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2 flex items-center gap-2 text-[12px] text-white/40">
                    <span>🏠 Marketing</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>✱ Marketing Dashboard</span>
                    <span className="text-white/20">|</span>
                    <span>🟠 Hubspot ⟳</span>
                  </div>
                  <div className="p-5 bg-[#111]">
                    {activeCrossFunc === 0 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">MQLs</p>
                            <p className="text-[20px] font-bold tabular-nums">648</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">SQLs</p>
                            <p className="text-[20px] font-bold tabular-nums">182</p>
                          </div>
                        </div>
                        {/* Mini bar chart */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Pipeline by Stage</p>
                          <div className="space-y-2">
                            {[
                              { label: "Discovery", width: "90%", color: "bg-blue-400" },
                              { label: "Demo", width: "70%", color: "bg-blue-500" },
                              { label: "Proposal", width: "45%", color: "bg-blue-600" },
                              { label: "Negotiation", width: "30%", color: "bg-blue-700" },
                              { label: "Closed Won", width: "20%", color: "bg-emerald-500" },
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
                            { label: "Total Spend", value: "$128K" },
                            { label: "CAC", value: "$342" },
                            { label: "ROAS", value: "4.2x" },
                          ].map((m) => (
                            <div key={m.label} className="bg-[#111] rounded-xl border border-white/8 p-3">
                              <p className="text-[10px] text-white/30 mb-1">{m.label}</p>
                              <p className="text-[18px] font-bold tabular-nums">{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Spend by Channel</p>
                          <div className="space-y-2">
                            {[
                              { channel: "Google Ads", actual: "$42K", budget: "$45K" },
                              { channel: "Meta", actual: "$38K", budget: "$35K" },
                              { channel: "LinkedIn", actual: "$28K", budget: "$30K" },
                              { channel: "Content", actual: "$20K", budget: "$18K" },
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
                            <p className="text-[20px] font-bold tabular-nums">48</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Open Roles</p>
                            <p className="text-[20px] font-bold tabular-nums">12</p>
                          </div>
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Team Breakdown</p>
                          <div className="space-y-2">
                            {[
                              { team: "Engineering", count: 18, planned: 22 },
                              { team: "Sales", count: 12, planned: 14 },
                              { team: "Marketing", count: 6, planned: 8 },
                              { team: "Operations", count: 8, planned: 8 },
                              { team: "Finance", count: 4, planned: 4 },
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
                title: "Create clarity",
                desc: "Build a structured, living model with human-readable formulas your entire team can understand.",
              },
              {
                icon: Users,
                title: "Align every team",
                desc: "Provide cross-functional visibility without sacrificing control.",
              },
              {
                icon: Star,
                title: "Win your next board meeting",
                desc: "Easily send and present clean, interactive forecasts and dashboards.",
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
              Honest reviews—The good and the bad
            </h2>
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
              All the FP&A essentials
            </h2>
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
                Start building a unified model you can trust as the source of
                truth for planning and forecasting.
              </p>
              <Link href="/contact" className="btn-accent">
                Talk to a human
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
            <p className="text-[13px] font-semibold text-[#f2a60c] uppercase tracking-wider mb-3">
              Implementation
            </p>
            <h2 className="text-[32px] md:text-[42px] font-serif-heading font-bold text-white">
              From signup to strategy in weeks, not months
            </h2>
          </FadeIn>

          <div className="space-y-0">
            {[
              {
                step: "01",
                phase: "Kickoff",
                title: "Integrate all your sources",
                desc: "Connect data from our 750+ integrations. Including your HRIS, ERP, CRM, and more.",
                timeline: "1-week average",
                icon: Plug,
              },
              {
                step: "02",
                phase: "Model",
                title: "Build your model",
                desc: "Create your P&L, cashflow, headcount model, and more. Build out your projections, scenarios, and plans.",
                timeline: "4-week average",
                icon: Layers,
              },
              {
                step: "03",
                phase: "Strategize",
                title: "Get continuous support",
                desc: "Stay aligned with our team through strategic check-ins and real-time support in a dedicated Slack channel.",
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
        href="/contact"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-[#f2a60c] text-white shadow-lg shadow-[#f2a60c]/20 hover:scale-105 active:scale-95 transition-all text-[13px] font-semibold"
      >
        <MessageSquare className="w-4 h-4" />
        Talk to a Human
      </Link>

      <SiteFooter />
    </div>
  );
}
