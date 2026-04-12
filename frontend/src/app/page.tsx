"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import AIChatBubble from "@/components/AIChatBubble";
import {
  ArrowRight,
  Check,
  Upload,
  MessageSquare,
  FileSpreadsheet,
  Brain,
  Shield,
  LineChart,
  Star,
  TrendingUp,
  ChevronRight,
  Zap,
  BarChart3,
  Play,
  Sparkles,
  Send,
  X,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in animation hook                            */
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateMap = {
    up: "translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${translateMap[direction]}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab content data                                                    */
/* ------------------------------------------------------------------ */
const tabsData = [
  {
    label: "Upload & Analyze",
    icon: Upload,
    title: "Upload your Trial Balance in seconds",
    desc: "Drag-and-drop a CSV or Excel file from Tally, Zoho, or any accounting software. CortexCFO auto-detects the format, classifies 100+ account types, and generates your financial report instantly.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
    badge: "Step 1",
    color: "bg-blue-500",
  },
  {
    label: "AI Chat",
    icon: MessageSquare,
    title: "Ask anything about your financials",
    desc: "Powered by Claude AI with your actual data. Ask 'How do I reduce costs?', 'What would a CA say about this suspense account?', or 'Build me a projection'. Open-ended, no restrictions.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
    badge: "AI Chat",
    color: "bg-purple-500",
  },
  {
    label: "Ind AS Review",
    icon: Shield,
    title: "Automatic Ind AS compliance review",
    desc: "Every upload is checked against AS 12, 15, 16, 19, 24, 37. The AI flags deferred tax gaps, revenue recognition issues, and missing provisions — with severity levels and specific remediation steps.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=85",
    badge: "Compliance",
    color: "bg-amber-500",
  },
  {
    label: "Industry KPIs",
    icon: BarChart3,
    title: "Industry-specific KPIs and benchmarks",
    desc: "Manufacturing? We track COGS ratio, inventory turnover, WC cycle. SaaS? MRR, CAC, LTV, churn. Services? Utilization rate, revenue per employee. 9 industries with tailored analysis.",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=85",
    badge: "9 Industries",
    color: "bg-emerald-500",
  },
  {
    label: "Scenario Planning",
    icon: LineChart,
    title: "Pressure-test every decision",
    desc: "What if you hire 3 people? Raise prices 10%? Delay fundraising by 3 months? Toggle event blocks and watch your cash forecast, runway, and breakeven date recalculate in real-time.",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=85",
    badge: "What-If",
    color: "bg-red-500",
  },
];

/* ================================================================== */
/*  LANDING PAGE COMPONENT                                             */
/* ================================================================== */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [heroMounted, setHeroMounted] = useState(false);

  // AI Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          conversation_history: chatMessages.slice(-6).map(m => ({ role: m.role, text: m.text })),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "ai", text: data.response || "I can help better once you upload your Trial Balance. Sign up to get started!" }]);
      } else {
        setChatMessages((prev) => [...prev, { role: "ai", text: "I can answer detailed questions once you upload your financials. Sign up free to get started!" }]);
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", text: "I can answer detailed questions once you upload your financials. Sign up free to get started!" }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    setHeroMounted(true);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate tabs every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % tabsData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeContent = tabsData[activeTab];

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* ─── Navigation ─── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">CortexCFO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#666]">
            <a href="#product" className="hover:text-[#1a1a1a] transition-colors">
              Product
            </a>
            <a href="#features" className="hover:text-[#1a1a1a] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1a1a1a] transition-colors">
              How it works
            </a>
            <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${
              heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Now in beta — Free for early users
            </div>
            <h1 className="text-4xl md:text-[3.25rem] font-semibold leading-[1.15] tracking-tight mb-5">
              Your AI-powered
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                virtual CFO
              </span>
            </h1>
            <p className="text-lg text-[#666] leading-relaxed mb-8 max-w-lg">
              Upload your Trial Balance. Get instant financial analysis, Ind AS compliance review,
              and strategic recommendations — powered by AI that thinks like a senior Chartered
              Accountant.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3.5 rounded-xl hover:bg-[#333] transition-all text-sm font-medium shadow-[0_1px_2px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] active:scale-[0.98]"
              >
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#product"
                className="inline-flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] px-6 py-3.5 rounded-xl border border-[#e5e5e5] hover:border-[#ccc] transition-all text-sm font-medium hover:shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> See it in action
              </a>
            </div>
            <div className="flex items-center gap-5 text-xs text-[#999]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> 5 min setup
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> India-first
              </span>
            </div>
          </div>

          {/* Right side — Product preview */}
          <div
            className={`hidden md:block transition-all duration-1000 delay-300 ${
              heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="rounded-2xl border border-[#e5e5e5] overflow-hidden shadow-2xl shadow-black/5">
              <div className="bg-[#fafafa] border-b border-[#e5e5e5] px-4 py-2.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="text-[10px] text-[#bbb] ml-2">CortexCFO — Executive Dashboard</span>
              </div>
              <div className="bg-white p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Revenue", value: "\u20B94.78 Cr", change: "+8.3%", positive: true },
                    { label: "Net Income", value: "\u20B928.5 L", change: "+12.4%", positive: true },
                    { label: "Current Ratio", value: "1.17x", change: "-0.2", positive: false },
                    { label: "Burn Rate", value: "\u20B96.4L/mo", change: "-5.2%", positive: true },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0]">
                      <p className="text-[10px] text-[#999] mb-0.5">{kpi.label}</p>
                      <p className="text-base font-semibold text-[#1a1a1a]">{kpi.value}</p>
                      <p className={`text-[10px] ${kpi.positive ? "text-emerald-600" : "text-red-500"}`}>
                        {kpi.change}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0] h-28 flex items-end gap-[2px]">
                  {[20, 28, 25, 35, 32, 40, 38, 48, 45, 55, 52, 60, 58, 65, 63, 70, 68, 75, 72, 80, 78, 82, 80, 85].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-emerald-500 transition-all duration-500"
                        style={{ height: `${h}%`, opacity: 0.5 + h / 200 }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social proof ─── */}
      <FadeIn>
        <section className="py-12 border-y border-[#f0f0f0]">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            {[
              { value: "200+", label: "Trial Balances analyzed" },
              { value: "9", label: "Industries supported" },
              { value: "\u20B92.1 Cr", label: "Avg. hidden value found" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-semibold text-[#1a1a1a]">{stat.value}</p>
                <p className="text-sm text-[#999]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── Interactive Product Showcase (Runway-style) ─── */}
      <section id="product" className="py-24 px-6 bg-[#f8f6f3]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-3">
              Product Tour
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-3">See CortexCFO in action</h2>
            <p className="text-[#666] max-w-md mx-auto">
              Click each tab to explore how we transform raw financial data into strategic intelligence
            </p>
          </FadeIn>

          {/* Tab buttons */}
          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {tabsData.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = i === activeTab;
                return (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-[#1a1a1a] text-white shadow-lg shadow-black/10"
                        : "bg-white text-[#666] hover:bg-white hover:text-[#1a1a1a] shadow-sm hover:shadow"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </FadeIn>

          {/* Progress bar for auto-rotation */}
          <div className="flex justify-center gap-1.5 mb-8">
            {tabsData.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === activeTab ? "w-8 bg-[#1a1a1a]" : "w-2 bg-[#d4d0ca]"
                }`}
              />
            ))}
          </div>

          {/* Tab content panel */}
          <div className="rounded-2xl overflow-hidden border border-[#e5e5e5] shadow-xl shadow-black/5 bg-white">
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span
                  className={`inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-5 ${
                    activeContent.color
                  } bg-opacity-10 text-white`}
                  style={{
                    backgroundColor: `${activeContent.color.replace("bg-", "").replace("-500", "")}`,
                  }}
                >
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    {activeContent.badge}
                  </span>
                </span>
                <h3 className="text-2xl font-semibold mb-4 text-[#1a1a1a] leading-snug">
                  {activeContent.title}
                </h3>
                <p className="text-sm text-[#666] leading-relaxed mb-8">{activeContent.desc}</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#1a1a1a] bg-[#f5f5f5] hover:bg-[#eee] px-5 py-2.5 rounded-lg w-fit transition-colors"
                >
                  Try it free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="h-80 md:h-[420px] overflow-hidden relative">
                <img
                  src={activeContent.img}
                  alt={activeContent.title}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  key={activeTab}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Everything you need to understand your finances
            </h2>
            <p className="text-[#666] max-w-lg mx-auto">
              Upload a Trial Balance from Tally, Zoho, or any accounting software. CortexCFO does
              the rest.
            </p>
          </FadeIn>

          {/* Hero feature — full width */}
          <FadeIn delay={100}>
            <div className="grid md:grid-cols-2 gap-0 mb-8 rounded-2xl overflow-hidden border border-[#e5e5e5] hover:shadow-lg transition-shadow">
              <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Upload your Trial Balance. Get instant clarity.
                </h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">
                  Drop a CSV or Excel file from Tally, Zoho, or any accounting software. CortexCFO
                  auto-classifies every account, checks Ind AS compliance, asks 5 clarifying
                  questions, and delivers a full financial analysis.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700"
                >
                  Try it now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="h-64 md:h-auto overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=85"
                  alt="Financial dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </FadeIn>

          {/* Feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="w-5 h-5" />,
                title: "Ask Anything",
                desc: "Chat with your data. 'How do I reduce costs?' — powered by Claude AI.",
                color: "bg-purple-50 text-purple-600",
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
              },
              {
                icon: <FileSpreadsheet className="w-5 h-5" />,
                title: "Ind AS Review",
                desc: "Auto compliance checks — AS 12, 15, 16, 19, 24, 37 flagged.",
                color: "bg-amber-50 text-amber-600",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
              },
              {
                icon: <Brain className="w-5 h-5" />,
                title: "9 Industries",
                desc: "Manufacturing, SaaS, Services, Trading, E-commerce & more.",
                color: "bg-emerald-50 text-emerald-600",
                img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "AI Questions",
                desc: "5 questions your auditor would ask. Answer to refine analysis.",
                color: "bg-red-50 text-red-600",
                img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80",
              },
              {
                icon: <LineChart className="w-5 h-5" />,
                title: "Scenario Modeling",
                desc: "Toggle events. Watch your forecast recalculate in real-time.",
                color: "bg-cyan-50 text-cyan-600",
                img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Multi-File Upload",
                desc: "Upload multiple years at once. Compare FY-over-FY trends.",
                color: "bg-orange-50 text-orange-600",
                img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
              },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="group rounded-2xl border border-[#f0f0f0] hover:border-[#e0e0e0] hover:shadow-lg transition-all overflow-hidden h-full">
                  <div className="h-36 overflow-hidden">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div
                      className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center mb-3`}
                    >
                      {f.icon}
                    </div>
                    <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                    <p className="text-xs text-[#666] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">Three steps to financial clarity</h2>
            <p className="text-[#666]">From upload to insight in under five minutes</p>
          </FadeIn>

          <div className="space-y-0">
            {[
              {
                step: "1",
                title: "Upload your financials",
                desc: "Export a Trial Balance from Tally, Zoho Books, or any accounting software. Upload the CSV or Excel file — we support multiple financial years at once.",
                color: "bg-blue-600",
              },
              {
                step: "2",
                title: "Get instant analysis",
                desc: "CortexCFO classifies every account, calculates key ratios, checks Ind AS compliance, and generates industry-specific insights. No manual work required.",
                color: "bg-purple-600",
              },
              {
                step: "3",
                title: "Ask questions, get answers",
                desc: "Chat with the AI about your financials. Ask anything — cost reduction, risk assessment, projections, CA opinions. Powered by Claude with your actual data.",
                color: "bg-emerald-600",
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 120}>
                <div className="flex gap-6 items-start py-8">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-full ${item.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg`}
                    >
                      {item.step}
                    </div>
                    {i < 2 && <div className="w-px h-full bg-[#e5e5e5] mt-3" />}
                  </div>
                  <div className="pb-4">
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-[#666] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <FadeIn>
        <section className="py-16 px-6 border-y border-[#f0f0f0]">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5 min", label: "Setup time" },
              { value: "\u20B92.1 Cr", label: "Avg. value found" },
              { value: "9", label: "Industries covered" },
              { value: "98%", label: "Analysis accuracy" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold">{s.value}</p>
                <p className="text-sm text-[#999] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl font-semibold">What our users say</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "CortexCFO found a working capital leak that our CA firm missed for two years. The ROI was immediate.",
                author: "Rajesh M.",
                role: "Managing Partner, PE Fund",
              },
              {
                quote:
                  "The AI asks exactly the questions our auditors would ask. It caught a suspense balance issue on the first upload.",
                author: "Priya S.",
                role: "CFO, D2C Brand",
              },
              {
                quote:
                  "We replaced our entire FP&A spreadsheet workflow. The scenario planner alone saved us significant time each month.",
                author: "Ananya D.",
                role: "Founder, SaaS Startup",
              },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-6 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] hover:shadow-md transition-shadow h-full">
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#444] leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-[#999]">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 px-6 bg-[#f8f6f3]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-emerald-600 mb-3">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold mb-4">Simple, transparent pricing</h2>
            <p className="text-[#666]">Start free. Upgrade when you need more.</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Starter",
                price: "Free",
                period: "forever",
                desc: "For exploring your numbers",
                features: ["1 file upload", "Basic dashboard", "5 AI questions", "Email support"],
                highlighted: false,
              },
              {
                name: "Growth",
                price: "\u20B99,999",
                period: "/month",
                desc: "For funded startups",
                features: [
                  "Unlimited uploads",
                  "Multi-year analysis",
                  "Unlimited AI chat",
                  "Industry benchmarks",
                  "Ind AS compliance",
                  "Priority support",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                desc: "For CA firms & PE funds",
                features: [
                  "Portfolio dashboards",
                  "Custom AI models",
                  "White-label reports",
                  "API access",
                  "Dedicated CSM",
                  "On-premise option",
                ],
                highlighted: false,
              },
            ].map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 80}>
                <div
                  className={`p-6 rounded-2xl border ${
                    plan.highlighted
                      ? "border-[#1a1a1a] shadow-xl bg-white ring-1 ring-[#1a1a1a]"
                      : "border-[#e5e5e5] bg-white hover:shadow-md"
                  } transition-shadow h-full`}
                >
                  {plan.highlighted && (
                    <p className="text-xs font-semibold text-emerald-600 mb-3">Most popular</p>
                  )}
                  <p className="text-sm text-[#666] mb-1">{plan.name}</p>
                  <div className="mb-1">
                    <span className="text-3xl font-semibold">{plan.price}</span>
                    <span className="text-sm text-[#999] ml-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-[#999] mb-5">{plan.desc}</p>
                  <Link
                    href="/signup"
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium mb-5 transition-all ${
                      plan.highlighted
                        ? "bg-[#1a1a1a] text-white hover:bg-[#333] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        : "bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#eee]"
                    }`}
                  >
                    {plan.name === "Enterprise" ? "Contact sales" : "Start free trial"}
                  </Link>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#666]">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Data Security ─── */}
      <FadeIn>
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#e5e5e5] bg-[#fafafa] p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Your data stays yours</h3>
                  <p className="text-sm text-[#666] leading-relaxed mb-4">
                    We take financial data security seriously. Your Trial Balance and financial data
                    are processed in encrypted, isolated environments. We never use your data to
                    train AI models. Files are analyzed in real-time and you can request deletion at
                    any time.
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#999]">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> 256-bit encryption
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Never used for AI training
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Delete anytime
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> India data residency
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 bg-[#1a1a1a]">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-4 text-white">
              Ready to understand your finances?
            </h2>
            <p className="text-[#999] mb-8">
              Join 200+ finance teams that replaced spreadsheets with CortexCFO.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-500 transition-all text-sm font-medium shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 active:scale-[0.98]"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ─── Floating AI Chat ─── */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" /> Ask AI
        </button>
      )}

      {showChat && (
        <div className="fixed bottom-6 right-6 w-[400px] max-h-[520px] bg-white rounded-2xl border border-[#e5e5e5] shadow-2xl shadow-black/10 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#e5e5e5]">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1a1a1a]">CortexCFO AI</p>
              <p className="text-[10px] text-[#999]">Ask anything about business finance</p>
            </div>
            <button onClick={() => setShowChat(false)} className="w-7 h-7 rounded-lg hover:bg-[#f5f5f5] flex items-center justify-center">
              <X className="w-4 h-4 text-[#999]" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
            {chatMessages.length === 0 && (
              <div className="py-4">
                <p className="text-xs text-[#999] mb-3">Try asking:</p>
                <div className="space-y-1.5">
                  {[
                    "What is a good current ratio?",
                    "How do I read a Trial Balance?",
                    "What does Ind AS 115 cover?",
                    "How to improve cash flow?",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="block w-full text-left text-xs text-[#666] hover:text-[#1a1a1a] bg-[#fafafa] hover:bg-[#f0f0f0] rounded-lg px-3 py-2 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <AIChatBubble key={i} role={msg.role} text={msg.text} />
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f5f5f5] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#e5e5e5] p-3">
            <div className="flex items-center gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="Ask about finance, ratios, Ind AS..."
                className="flex-1 bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-3.5 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#bbb] outline-none focus:border-emerald-300"
              />
              <button
                onClick={handleChat}
                disabled={!chatInput.trim() || chatLoading}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors disabled:opacity-30"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-[10px] text-[#ccc] mt-2 text-center">
              Upload your TB for personalized analysis &middot; <Link href="/signup" className="text-emerald-600 hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#f0f0f0] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-semibold">CortexCFO</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed">
                AI-powered financial intelligence for Indian businesses.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: [
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "TB Analysis", href: "/analysis" },
                  { label: "Scenarios", href: "/scenarios" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "About", href: "/about" },
                  { label: "Privacy", href: "/privacy" },
                  { label: "Terms", href: "/terms" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Documentation", href: "/about" },
                  { label: "Contact", href: "/about" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-[#666] hover:text-[#1a1a1a]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#f0f0f0] pt-6 flex items-center justify-between">
            <p className="text-xs text-[#999]">
              &copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.
            </p>
            <div className="flex gap-4 text-xs text-[#999]">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-[#666]">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-[#666]">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
