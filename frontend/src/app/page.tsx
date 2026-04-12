"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Activity,
  BarChart3,
  Shield,
  LineChart,
  Brain,
  Globe,
  Layers,
  FileSpreadsheet,
  Play,
  Star,
  Quote,
  ChevronLeft,
  ChevronRight,
  Zap,
  Lock,
  Users,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      quote: "Axiom replaced our entire FP&A team's spreadsheet workflow in a week. The AI questions it asks are exactly what our auditors would ask.",
      author: "Priya Sharma",
      role: "CFO, TechFlow Solutions",
      avatar: "PS",
      company: "Series B SaaS",
    },
    {
      quote: "We found 2.1 crore in hidden value through the QoE analysis that our CA firm had missed for two years. The ROI was immediate.",
      author: "Rajesh Menon",
      role: "Managing Partner, Meridian Capital",
      avatar: "RM",
      company: "PE Fund",
    },
    {
      quote: "The scenario canvas let our board see exactly what happens if we delay the fundraise by 3 months. That clarity changed our strategy.",
      author: "Ananya Desai",
      role: "Founder & CEO, NovaPay",
      avatar: "AD",
      company: "Fintech Startup",
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a] overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50
          ? "bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}>
        <div className="max-w-[1400px] mx-auto px-8 h-[72px] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/axiom-logo.png" alt="Axiom" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-[20px] font-bold tracking-[-0.03em]">axiom</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[13.5px] text-[#666] font-medium">
            <a href="#platform" className="hover:text-[#1a1a1a] transition-colors duration-300" onClick={(e)=>{e.preventDefault();document.getElementById('platform')?.scrollIntoView({behavior:'smooth'})}}>Platform</a>
            <a href="#customers" className="hover:text-[#1a1a1a] transition-colors duration-300" onClick={(e)=>{e.preventDefault();document.getElementById('customers')?.scrollIntoView({behavior:'smooth'})}}>Customers</a>
            <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors duration-300" onClick={(e)=>{e.preventDefault();document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})}}>Pricing</a>
            <Link href="/about" className="hover:text-[#1a1a1a] transition-colors duration-300">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13.5px] text-[#666] hover:text-[#1a1a1a] transition-colors font-medium">Log in</Link>
            <Link href="/signup" className="text-[13.5px] bg-[#1a1a1a] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#333] transition-all">
              Request access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Dark section with visual depth */}
      <section className="relative min-h-[100vh] bg-[#1a1a17] text-white flex items-center overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a17] via-[#1a1a17]/80 to-[#1a1a17]" />
        </div>

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />

        <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-32 w-full">
          <div className="max-w-[720px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-white/50">Now in Private Beta</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(3rem,6.5vw,5.5rem)] font-light tracking-[-0.04em] leading-[1.05] mb-8">
              Financial
              <br />
              intelligence that
              <br />
              <span className="italic font-normal">thinks ahead.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[18px] text-white/50 max-w-[460px] leading-[1.75] mb-12 font-light">
              Axiom is the AI-powered command center for your finances.
              Upload a Trial Balance. Get instant Ind AS review, scenario
              modeling, and prescriptive insights.
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-5 mb-16">
              <Link href="/signup" className="group inline-flex items-center gap-3 bg-white text-[#1a1a1a] font-semibold pl-7 pr-5 py-4 rounded-full hover:bg-white/90 transition-all text-[14px]">
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-3 text-white/50 hover:text-white/80 transition-colors text-[14px] font-medium">
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-white/40 transition-colors">
                  <Play className="w-3.5 h-3.5 ml-0.5" />
                </div>
                Watch demo
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-8 text-[12px] text-white/30">
              <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500/60" /> SOC 2 Type II</span>
              <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500/60" /> Bank-grade encryption</span>
              <span className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500/60" /> GDPR compliant</span>
            </div>
          </div>

          {/* Floating product preview — right side */}
          <div className="absolute top-1/2 -translate-y-1/2 right-8 w-[45%] hidden lg:block">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50 bg-[#0f0f14]">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-white/30 font-medium">Live Dashboard — TechFlow Solutions</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "Cash Runway", value: "18.2 mo" },
                      { label: "Net Revenue", value: "₹1.19 Cr" },
                      { label: "Burn Rate", value: "₹6.4L/mo" },
                      { label: "Net Margin", value: "19.8%" },
                    ].map(k => (
                      <div key={k.label} className="bg-white/[0.04] rounded-lg p-3.5 border border-white/[0.05]">
                        <p className="text-[10px] text-white/25 mb-1">{k.label}</p>
                        <p className="text-[18px] font-semibold text-white tracking-[-0.02em]">{k.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Mini chart */}
                  <div className="bg-white/[0.02] rounded-lg p-4 border border-white/[0.04] h-32 flex items-end gap-[2px]">
                    {[20, 28, 25, 35, 32, 40, 38, 48, 45, 55, 52, 60, 58, 65, 63, 70, 68, 75, 72, 80].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-600/30 to-emerald-400/50" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/5 to-emerald-500/5 rounded-3xl blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Logo carousel — Light section */}
      <section className="py-14 bg-white border-b border-[#eee]">
        <div className="max-w-[1200px] mx-auto px-8">
          <p className="text-[11px] tracking-[0.15em] uppercase text-[#999] text-center mb-8 font-semibold">
            Trusted by leading finance teams across India
          </p>
          <div className="flex items-center justify-between gap-12 overflow-hidden">
            {["Razorpay", "Zerodha", "CRED", "Groww", "Chargebee", "Freshworks", "Zoho"].map(name => (
              <span key={name} className="text-[17px] font-bold text-[#ccc] tracking-wide whitespace-nowrap flex-shrink-0">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Impact numbers — with background image */}
      <section className="relative py-24 bg-[#f5f4f2]">
        <div className="max-w-[1100px] mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: "5 min", label: "Average setup time", icon: Zap },
            { value: "₹2.1 Cr", label: "Avg. hidden value found", icon: TrendingUp },
            { value: "40 hrs", label: "Saved per team monthly", icon: Users },
            { value: "98%", label: "Accuracy vs. manual QoE", icon: Shield },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#eee] flex items-center justify-center mx-auto mb-5">
                <stat.icon className="w-5 h-5 text-[#666]" />
              </div>
              <p className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.03em] text-[#1a1a1a]">{stat.value}</p>
              <p className="text-[13px] text-[#999] mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform section — with product screenshots */}
      <section id="platform" className="py-28 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Platform</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-light tracking-[-0.03em] leading-[1.15] mb-5">
              One platform. Every financial
              <br />
              <span className="italic font-normal text-[#999]">decision, covered.</span>
            </h2>
          </div>

          {/* Feature 1 — Large card with image */}
          <div className="grid lg:grid-cols-2 gap-0 mb-6 rounded-3xl overflow-hidden bg-[#1a1a17] text-white">
            <div className="p-12 lg:p-16 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-[28px] font-light tracking-[-0.02em] mb-4 leading-[1.25]">
                Upload your Trial Balance.
                <br />
                <span className="italic">Get instant clarity.</span>
              </h3>
              <p className="text-[15px] text-white/50 leading-[1.8] mb-8 max-w-sm">
                Drop a CSV from Tally or Zoho. Axiom auto-classifies every account,
                checks Ind AS compliance, asks the 5 questions your auditor would ask,
                and delivers a full financial analysis with actionable insights.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white transition-colors font-medium w-fit">
                Try it now <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="relative h-[400px] lg:h-auto">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=90"
                alt="Financial dashboard"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a17] to-transparent" />
            </div>
          </div>

          {/* Feature grid — 2x2 */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: "Executive Dashboard",
                desc: "Live KPIs, waterfall charts, AI insights feed. See Cash Runway, EBITDA, and Burn Rate at a glance with real-time anomaly detection.",
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=90",
                color: "bg-gradient-to-br from-blue-50 to-indigo-50",
              },
              {
                icon: <LineChart className="w-5 h-5" />,
                title: "Scenario Canvas",
                desc: "Toggle event blocks — hire, raise prices, fundraise. Compare Base vs. Best vs. Worst case in real-time with dynamic charts.",
                img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=90",
                color: "bg-gradient-to-br from-emerald-50 to-teal-50",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Continuous QoE",
                desc: "Automated Quality of Earnings. EBITDA bridge, add-back tracking, GST/TDS compliance health — always audit-ready.",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=90",
                color: "bg-gradient-to-br from-amber-50 to-orange-50",
              },
              {
                icon: <Brain className="w-5 h-5" />,
                title: "AI Insights Engine",
                desc: "Not just alerts — prescriptive SOPs. When CAC rises, Axiom tells you exactly which channel to cut and projects the impact.",
                img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1600&q=90",
                color: "bg-gradient-to-br from-purple-50 to-pink-50",
              },
            ].map(feature => (
              <div key={feature.title} className={`${feature.color} rounded-3xl overflow-hidden group hover:shadow-lg transition-all duration-500`}>
                <div className="p-8 pb-0">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-[20px] font-semibold tracking-[-0.02em] mb-3">{feature.title}</h3>
                  <p className="text-[14px] text-[#666] leading-[1.7] mb-6">{feature.desc}</p>
                </div>
                <div className="h-48 mx-4 mb-4 rounded-xl overflow-hidden shadow-lg shadow-black/5">
                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — with visuals */}
      <section className="py-28 px-8 bg-[#f5f4f2]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-20">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">How it works</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-light tracking-[-0.03em]">
              Three steps to <span className="italic font-normal text-[#999]">financial clarity</span>
            </h2>
          </div>

          <div className="space-y-20">
            {[
              { step: "01", title: "Connect your data", desc: "Link Tally, Zoho, Razorpay, or any bank feed. Or simply upload a Trial Balance CSV. Our AI auto-maps your entire chart of accounts in seconds.", icon: Layers },
              { step: "02", title: "Get instant analysis", desc: "Within 5 minutes, see your complete financial model — P&L, balance sheet, cash flow, ratios, Ind AS compliance review, and AI-generated insights. No manual work.", icon: Zap },
              { step: "03", title: "Decide with confidence", desc: "Model scenarios, review QoE adjustments, and act on prescriptive recommendations. Every strategic decision backed by real-time data, not gut feel.", icon: TrendingUp },
            ].map((item, i) => (
              <div key={item.step} className={`flex gap-12 items-center ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[56px] font-extralight text-[#ddd] tracking-[-0.04em] leading-none">{item.step}</span>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#eee] flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-[24px] font-semibold tracking-[-0.02em] mb-3">{item.title}</h3>
                  <p className="text-[15px] text-[#666] leading-[1.8] max-w-md">{item.desc}</p>
                </div>
                <div className="flex-1 h-[280px] rounded-2xl overflow-hidden shadow-lg shadow-black/5">
                  <img
                    src={[
                      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=90",
                      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=90",
                      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1600&q=90",
                    ][i]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — Dark section */}
      <section id="customers" className="py-28 px-8 bg-[#1a1a17] text-white">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/30 mb-4">What our customers say</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-light tracking-[-0.02em] mb-16">
            Trusted by finance leaders
            <br />
            <span className="italic font-normal text-white/40">across India</span>
          </h2>

          {/* Testimonial card */}
          <div className="relative">
            <div className="bg-white/[0.04] rounded-3xl p-10 lg:p-14 border border-white/[0.06] transition-all duration-500">
              <Quote className="w-8 h-8 text-white/10 mb-6 mx-auto" />
              <p className="text-[20px] lg:text-[24px] font-light leading-[1.6] text-white/80 mb-10 max-w-[600px] mx-auto italic">
                &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[14px] font-bold">
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="text-[14px] font-semibold">{testimonials[activeTestimonial].author}</p>
                  <p className="text-[12px] text-white/40">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? "bg-white w-6" : "bg-white/20 hover:bg-white/40"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security — Light section */}
      <section className="py-24 px-8 bg-white border-t border-[#eee]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Security</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-light tracking-[-0.02em]">
              Enterprise-grade <span className="italic font-normal text-[#999]">security</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: "SOC 2 Type II", desc: "Independently audited security controls. Your financial data is protected by the same standards used by banks." },
              { icon: Shield, title: "256-bit Encryption", desc: "All data encrypted at rest and in transit. We never store raw credentials — only encrypted tokens." },
              { icon: Globe, title: "GDPR & India DPDP", desc: "Full compliance with global and Indian data protection regulations. Data residency in India available." },
            ].map(item => (
              <div key={item.title} className="p-8 rounded-2xl border border-[#eee] hover:shadow-lg hover:border-[#ddd] transition-all duration-500 bg-[#faf9f7]">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-5">
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[16px] font-semibold mb-2">{item.title}</h3>
                <p className="text-[14px] text-[#888] leading-[1.7]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 px-8 bg-[#f5f4f2]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Pricing</p>
            <h2 className="text-[clamp(2rem,3.5vw,2.8rem)] font-light tracking-[-0.02em]">
              Start free. <span className="italic font-normal text-[#999]">Scale as you grow.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Free", period: "forever", desc: "For early-stage startups exploring their numbers.", features: ["1 data source", "TB Analysis engine", "Basic dashboard", "Monthly QoE snapshot", "Community support"], highlighted: false },
              { name: "Growth", price: "₹14,999", period: "/month", desc: "For funded startups scaling with confidence.", features: ["Unlimited data sources", "Scenario Canvas", "Continuous QoE engine", "AI Insights & SOPs", "GST/TDS compliance", "5 team seats", "Priority support"], highlighted: true },
              { name: "Enterprise", price: "Custom", period: "", desc: "For PE firms and multi-entity portfolios.", features: ["Portfolio-wide dashboards", "Custom AI models", "White-label reports", "API access", "Dedicated CSM", "On-premise option", "Unlimited seats"], highlighted: false },
            ].map(plan => (
              <div key={plan.name} className={`rounded-3xl p-8 lg:p-10 transition-all ${
                plan.highlighted
                  ? "bg-[#1a1a17] text-white shadow-2xl shadow-black/20 scale-[1.02] relative z-10"
                  : "bg-white border border-[#eee] hover:shadow-lg"
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-[11px] font-semibold px-4 py-1 rounded-full">Most Popular</span>
                  </div>
                )}
                <p className={`text-[13px] font-medium mb-5 ${plan.highlighted ? "text-white/50" : "text-[#999]"}`}>{plan.name}</p>
                <div className="mb-2">
                  <span className="text-[36px] font-light tracking-[-0.03em]">{plan.price}</span>
                  <span className={`text-[14px] ml-1 ${plan.highlighted ? "text-white/40" : "text-[#999]"}`}>{plan.period}</span>
                </div>
                <p className={`text-[13px] mb-8 ${plan.highlighted ? "text-white/40" : "text-[#999]"}`}>{plan.desc}</p>
                <Link href="/signup" className={`block text-center py-3 rounded-full text-[14px] font-semibold mb-8 transition-all ${
                  plan.highlighted
                    ? "bg-white text-[#1a1a1a] hover:bg-white/90"
                    : "bg-[#1a1a1a] text-white hover:bg-[#333]"
                }`}>
                  {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
                </Link>
                <ul className="space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-3 text-[13px] ${plan.highlighted ? "text-white/60" : "text-[#888]"}`}>
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-emerald-400" : "text-indigo-500"}`} />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — with background image */}
      <section className="relative py-32 px-8 bg-[#1a1a17] text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
        </div>
        <div className="relative z-10 max-w-[700px] mx-auto text-center">
          <h2 className="text-[clamp(2.2rem,5vw,3.5rem)] font-light tracking-[-0.03em] leading-[1.15] mb-6">
            Stop guessing.
            <br />
            <span className="italic font-normal text-white/50">Start knowing.</span>
          </h2>
          <p className="text-[16px] text-white/40 mb-12 leading-[1.7] max-w-md mx-auto">
            Join 200+ finance teams that replaced 47-tab spreadsheets
            with a single source of truth.
          </p>
          <Link href="/signup" className="group inline-flex items-center gap-3 bg-white text-[#1a1a1a] font-semibold pl-8 pr-6 py-4 rounded-full hover:bg-white/90 transition-all text-[15px]">
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a17] text-white border-t border-white/[0.06] py-16 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/axiom-logo.png" alt="Axiom" className="w-8 h-8 rounded-xl object-cover" />
                <span className="text-[18px] font-bold tracking-[-0.02em]">axiom</span>
              </div>
              <p className="text-[13px] text-white/30 leading-[1.8] max-w-xs">
                AI-powered financial intelligence platform for Indian businesses.
                Continuous QoE, scenario modeling, and prescriptive insights.
              </p>
            </div>
            {[
              { title: "Product", links: [
                { label: "Dashboard", href: "/dashboard" },
                { label: "TB Analysis", href: "/analysis" },
                { label: "Scenarios", href: "/scenarios" },
                { label: "QoE Center", href: "/qoe" },
                { label: "Integrations", href: "/integrations" },
              ]},
              { title: "Company", links: [
                { label: "About", href: "/about" },
                { label: "Careers", href: "/about" },
                { label: "Blog", href: "/about" },
                { label: "Press", href: "/about" },
                { label: "Contact", href: "/about" },
              ]},
              { title: "Legal", links: [
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Security", href: "/about" },
                { label: "GDPR", href: "/privacy" },
                { label: "DPDP", href: "/privacy" },
              ]},
            ].map(col => (
              <div key={col.title}>
                <p className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-[13px] text-white/30 hover:text-white/60 transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/20">&copy; 2026 Axiom Financial Intelligence Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6 text-[12px] text-white/20">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-white/40">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-white/40">LinkedIn</a>
              <a href="https://github.com" target="_blank" rel="noopener" className="hover:text-white/40">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
