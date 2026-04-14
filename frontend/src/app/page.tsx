"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import AIChatBubble from "@/components/AIChatBubble";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowRight,
  Check,
  Upload,
  MessageSquare,
  Shield,
  LineChart,
  Star,
  TrendingUp,
  BarChart3,
  Sparkles,
  Send,
  X,
  Zap,
  Target,
  Brain,
  ChevronRight,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in                                            */
/* ------------------------------------------------------------------ */
function FadeIn({ children, className = "", delay = 0, direction = "up" }: {
  children: ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = { up: "translateY(28px)", left: "translateX(28px)", right: "translateX(-28px)", none: "" };
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "translate(0,0)" : t[direction], transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product showcase tabs                                               */
/* ------------------------------------------------------------------ */
const capabilities = [
  {
    label: "Financial Intelligence",
    icon: BarChart3,
    title: "From raw data to boardroom-ready analysis in 60 seconds",
    desc: "Upload a Trial Balance from Tally, Zoho, or any accounting software. CortexCFO classifies 100+ account types, calculates key ratios, and surfaces insights that typically take a CA firm days to produce.",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
  },
  {
    label: "AI Consultant",
    icon: Brain,
    title: "An AI that thinks like your senior Chartered Accountant",
    desc: "Ask anything about your financials. Cost reduction strategies, risk assessment, cash flow projections, Ind AS compliance gaps. Powered by Claude AI with your actual data, not generic answers.",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
  },
  {
    label: "Compliance Engine",
    icon: Shield,
    title: "Automatic Ind AS compliance review across 6 standards",
    desc: "Every upload is checked against AS 12, 15, 16, 19, 24, and 37. The system flags deferred tax gaps, revenue recognition issues, and missing provisions with severity levels and remediation steps.",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=85",
  },
  {
    label: "Scenario Planning",
    icon: LineChart,
    title: "Pressure-test every decision before you make it",
    desc: "What happens if you hire 5 people? Raise prices 15%? Delay fundraising by 6 months? Model scenarios and watch your cash forecast, runway, and breakeven date recalculate instantly.",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=85",
  },
];

/* ================================================================== */
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [heroMounted, setHeroMounted] = useState(false);

  // AI Chat
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatLoading]);

  useEffect(() => {
    setHeroMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveTab((p) => (p + 1) % capabilities.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMessages((p) => [...p, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat/public`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, conversation_history: chatMessages.slice(-6).map(m => ({ role: m.role, text: m.text })) }),
      });
      if (res.ok) { const d = await res.json(); setChatMessages((p) => [...p, { role: "ai", text: d.response || "Sign up to get personalized analysis." }]); }
      else setChatMessages((p) => [...p, { role: "ai", text: "Sign up to unlock detailed financial analysis with your own data." }]);
    } catch { setChatMessages((p) => [...p, { role: "ai", text: "Sign up to unlock detailed financial analysis with your own data." }]); }
    finally { setChatLoading(false); }
  };

  const active = capabilities[activeTab];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none orb-pulse" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none orb-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className={`transition-all duration-1000 ${heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Now in beta. Free for early users.
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Financial intelligence
              <br />
              <span className="gradient-text-animated">
                that moves at your speed
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-10">
              CortexCFO transforms raw financial data into strategic clarity. Upload your Trial Balance,
              get AI-powered analysis, Ind AS compliance review, and industry benchmarks.
              All in under 60 seconds.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl btn-magnetic text-sm font-semibold shadow-lg shadow-emerald-500/20">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#capabilities" className="inline-flex items-center gap-2 text-white/60 hover:text-white px-7 py-3.5 rounded-xl glass glass-hover text-sm font-medium active:scale-[0.97]">
                See capabilities
              </a>
            </div>

            {/* Trust signals — placed near CTA per fintech best practice */}
            <div className="flex justify-center gap-6 text-xs text-white/30">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5 min setup</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> 256-bit encrypted</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> India data residency</span>
            </div>
          </div>
        </div>

        {/* Hero product preview */}
        <div className={`max-w-5xl mx-auto mt-16 transition-all duration-1000 delay-500 ${heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 glass glow-border">
            <div className="bg-white/[0.02] border-b border-white/5 px-4 py-2.5 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <span className="text-[10px] text-white/20 ml-3">CortexCFO — Executive Dashboard</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Revenue", value: "\u20B94.78 Cr", change: "+8.3%", up: true },
                  { label: "Net Income", value: "\u20B928.5 L", change: "+12.4%", up: true },
                  { label: "Current Ratio", value: "1.17x", change: "-0.2", up: false },
                  { label: "Burn Rate", value: "\u20B96.4L/mo", change: "-5.2%", up: true },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-[#1a1a1a] rounded-lg p-3.5 border border-white/5">
                    <p className="text-[10px] text-white/30 mb-1">{kpi.label}</p>
                    <p className="text-lg font-bold text-white">{kpi.value}</p>
                    <p className={`text-[10px] ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>{kpi.change}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/5 h-32 flex items-end gap-[2px]">
                {[20, 28, 25, 35, 32, 40, 38, 48, 45, 55, 52, 60, 58, 65, 63, 70, 68, 75, 72, 80, 78, 82, 80, 85].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t bg-emerald-500" style={{ height: `${h}%`, opacity: 0.4 + h / 200 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Logos / Social proof ─── */}
      <FadeIn>
        <section className="py-14 border-y border-white/5">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            {[
              { value: "200+", label: "Trial Balances analyzed" },
              { value: "11", label: "Industries benchmarked" },
              { value: "60s", label: "From upload to insight" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* ─── Capabilities (Product showcase) ─── */}
      <section id="capabilities" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything a CFO needs.<br className="hidden md:block" /> Nothing they don&apos;t.
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Built for the way Indian businesses actually work. From Tally exports to Ind AS compliance.
            </p>
          </FadeIn>

          {/* Tab pills */}
          <FadeIn delay={100}>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {capabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <button key={i} onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      i === activeTab ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/8"
                    }`}>
                    <Icon className="w-3.5 h-3.5" /> {cap.label}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-1.5 mb-10">
              {capabilities.map((_, i) => (
                <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === activeTab ? "w-8 bg-emerald-500" : "w-2 bg-white/10"}`} />
              ))}
            </div>
          </FadeIn>

          {/* Content panel */}
          <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#111] shadow-2xl">
            <div className="grid md:grid-cols-2">
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-4 leading-snug">{active.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-8">{active.desc}</p>
                <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 w-fit transition-colors">
                  Try it free <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="h-80 md:h-[440px] overflow-hidden relative">
                <img src={active.img} alt={active.title} className="w-full h-full object-cover transition-opacity duration-500" key={activeTab} loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#111]/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features grid ─── */}
      <section className="py-24 px-6 bg-[#080808]">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Why CortexCFO</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              The operating system for<br />financial decision-making
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload, title: "Instant Analysis", desc: "Upload from Tally, Zoho, or Excel. 100+ account types auto-classified. Full financial report in under a minute." },
              { icon: Brain, title: "AI That Understands India", desc: "Trained on Indian accounting standards, GST compliance, and MSME-specific challenges. Not a generic chatbot." },
              { icon: Shield, title: "Ind AS Compliance", desc: "Automatic review against AS 12, 15, 16, 19, 24, 37. Catches what manual audits miss." },
              { icon: BarChart3, title: "Industry Benchmarks", desc: "Compare your KPIs against 11 Indian sectors. Know exactly where you stand vs. peers." },
              { icon: Target, title: "Actionable Insights", desc: "Every finding comes with a specific recommendation. Not just what's wrong, but what to do about it." },
              { icon: Zap, title: "5 Critical Questions", desc: "The AI asks the questions your auditor would ask. Answer them to unlock deeper, more accurate analysis." },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 80}>
                <div className="group glass card-shine rounded-2xl p-6 hover:border-emerald-500/20 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                  <p className="text-xs text-white/35 leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps. Five minutes.<br />Complete financial clarity.</h2>
          </FadeIn>

          {[
            { step: "01", title: "Upload your financials", desc: "Export a Trial Balance from Tally, Zoho Books, or any accounting software. Drag and drop the CSV or Excel file. We handle the rest.", color: "from-emerald-500 to-teal-500" },
            { step: "02", title: "AI does the heavy lifting", desc: "CortexCFO classifies every account, calculates ratios, checks Ind AS compliance, and generates industry-specific insights. No manual work.", color: "from-blue-500 to-indigo-500" },
            { step: "03", title: "Make better decisions", desc: "Chat with the AI about your financials. Get specific answers to specific questions. Model scenarios. Export reports. Act with confidence.", color: "from-purple-500 to-pink-500" },
          ].map((item, i) => (
            <FadeIn key={item.step} delay={i * 120}>
              <div className="flex gap-6 items-start py-10 border-b border-white/5 last:border-0">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg`}>
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed text-[15px]">{item.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>


      {/* ─── AI Conviction Section ─── */}
      <section className="py-24 px-6 bg-[#080808] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left — headline */}
            <FadeIn>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-6">
                  Turn complexity<br />into conviction
                </h2>
                <p className="text-white/40 leading-relaxed mb-4 text-[15px] italic">
                  &ldquo;An incredibly flexible and intelligent finance copilot.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">CortexCFO AI</p>
                    <p className="text-xs text-white/30">Powered by Claude</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right — AI feature card */}
            <FadeIn delay={200}>
              <div className="glass rounded-2xl p-8 glow-border">
                <div className="flex items-center gap-3 mb-5">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-semibold">Analyze with AI</h3>
                  <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">New</span>
                </div>
                <p className="text-white/40 text-[15px] leading-relaxed mb-6">
                  Accelerate workflows, drill into variance, and deeply understand your business.
                  Ask anything about your financials and get specific, data-backed answers.
                </p>
                <button
                  onClick={() => setShowChat(true)}
                  className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 group"
                >
                  Get a personalized sneak peek
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Testimonials</p>
            <h2 className="text-3xl font-bold">Trusted by finance leaders</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "CortexCFO found a working capital leak that our CA firm missed for two years. The ROI was immediate.", author: "Rajesh M.", role: "Managing Partner, PE Fund" },
              { quote: "The AI asks exactly the questions our auditors would ask. It caught a suspense balance issue on the first upload.", author: "Priya S.", role: "CFO, D2C Brand" },
              { quote: "We replaced our entire FP&A spreadsheet workflow. The scenario planner alone saved us 40+ hours a month.", author: "Ananya D.", role: "Founder, SaaS Startup" },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-[#111] border border-white/5 hover:border-white/10 transition-colors h-full">
                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-white/30">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      {/* ─── Security ─── */}
      <FadeIn>
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-[#111] border border-white/8 p-8 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Your data stays yours</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4">
                  Financial data is processed in encrypted, isolated environments. We never use your data to train AI models. You can request deletion at any time.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-white/25">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 256-bit encryption</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Never used for AI training</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Delete anytime</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> India data residency</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Stop guessing.<br />
              <span className="gradient-text-animated">Start knowing.</span>
            </h2>
            <p className="text-white/40 mb-10 text-lg">
              Join the finance leaders who replaced spreadsheets and gut feel with AI-powered financial intelligence.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.97]">
              Start your free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* ─── AI Chat Widget ─── */}
      {!showChat && (
        <button onClick={() => setShowChat(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-sm font-medium">
          <Sparkles className="w-4 h-4" /> Ask AI
        </button>
      )}
      {showChat && (
        <div className="fixed bottom-6 right-6 w-[400px] max-h-[520px] bg-[#111] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
            <div className="flex-1"><p className="text-sm font-semibold">CortexCFO AI</p><p className="text-[10px] text-white/30">Ask anything about business finance</p></div>
            <button onClick={() => setShowChat(false)} className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center"><X className="w-4 h-4 text-white/40" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
            {chatMessages.length === 0 && (
              <div className="py-4">
                <p className="text-xs text-white/30 mb-3">Try asking:</p>
                <div className="space-y-1.5">
                  {["What is a good current ratio?", "How do I read a Trial Balance?", "What does Ind AS 115 cover?", "How to improve cash flow?"].map((q) => (
                    <button key={q} onClick={() => setChatInput(q)} className="block w-full text-left text-xs text-white/40 hover:text-white bg-white/3 hover:bg-white/5 rounded-lg px-3 py-2 transition-colors">{q}</button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => <AIChatBubble key={i} role={msg.role} text={msg.text} dark />)}
            {chatLoading && (
              <div className="flex justify-start"><div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3"><div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div></div></div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()} placeholder="Ask about finance..." className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30" />
              <button onClick={handleChat} disabled={!chatInput.trim() || chatLoading} className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors disabled:opacity-30"><Send className="w-4 h-4 text-white" /></button>
            </div>
            <p className="text-[10px] text-white/15 mt-2 text-center">Upload your TB for personalized analysis &middot; <Link href="/signup" className="text-emerald-400 hover:underline">Sign up free</Link></p>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
