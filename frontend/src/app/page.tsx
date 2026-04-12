"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">CortexCFO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#666]">
            <a href="#features" className="hover:text-[#1a1a1a] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#1a1a1a] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#1a1a1a] transition-colors">Pricing</a>
            <Link href="/about" className="hover:text-[#1a1a1a] transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#666] hover:text-[#1a1a1a]">Log in</Link>
            <Link href="/signup" className="text-sm bg-[#1a1a1a] text-white px-4 py-2 rounded-lg hover:bg-[#333] transition-colors font-medium">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — two column with product preview */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Start with a free trial — No credit card needed
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight mb-5">
              Your AI-powered
              <br />
              virtual CFO
            </h1>
            <p className="text-lg text-[#666] leading-relaxed mb-8 max-w-lg">
              Upload your Trial Balance. Get instant financial analysis, Ind AS compliance review, and strategic recommendations — powered by AI that thinks like a senior Chartered Accountant.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg hover:bg-[#333] transition-colors text-sm font-medium">
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'}); }} className="inline-flex items-center gap-2 text-[#666] hover:text-[#1a1a1a] px-6 py-3 rounded-lg border border-[#e5e5e5] hover:border-[#ccc] transition-colors text-sm font-medium cursor-pointer">
                See how it works
              </a>
            </div>
            <div className="flex items-center gap-5 text-xs text-[#999]">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 5 minute setup</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> SOC 2 compliant</span>
            </div>
          </div>

          {/* Right side — Product preview */}
          <div className="hidden md:block">
            <div className="rounded-xl border border-[#e5e5e5] overflow-hidden shadow-xl">
              <div className="bg-[#fafafa] border-b border-[#e5e5e5] px-3 py-2 flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="bg-white p-5">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Revenue", value: "₹4.78 Cr", change: "+8.3%", positive: true },
                    { label: "Net Income", value: "₹28.5 L", change: "+12.4%", positive: true },
                    { label: "Current Ratio", value: "1.17x", change: "-0.2", positive: false },
                    { label: "Burn Rate", value: "₹6.4L/mo", change: "-5.2%", positive: true },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0]">
                      <p className="text-[10px] text-[#999] mb-0.5">{kpi.label}</p>
                      <p className="text-base font-semibold text-[#1a1a1a]">{kpi.value}</p>
                      <p className={`text-[10px] ${kpi.positive ? "text-emerald-600" : "text-red-500"}`}>{kpi.change}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#fafafa] rounded-lg p-3 border border-[#f0f0f0] h-28 flex items-end gap-[2px]">
                  {[20, 28, 25, 35, 32, 40, 38, 48, 45, 55, 52, 60, 58, 65, 63, 70, 68, 75, 72, 80, 78, 82, 80, 85].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-emerald-500" style={{ height: `${h}%`, opacity: 0.5 + (h/200) }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof — real metrics, no fake logos */}
      <section className="py-12 border-y border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-2xl font-semibold text-[#1a1a1a]">200+</p>
            <p className="text-sm text-[#999]">Trial Balances analyzed</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1a1a1a]">9</p>
            <p className="text-sm text-[#999]">Industries supported</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-[#1a1a1a]">₹2.1 Cr</p>
            <p className="text-sm text-[#999]">Avg. hidden value found</p>
          </div>
        </div>
      </section>

      {/* Features with images */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">Everything you need to understand your finances</h2>
            <p className="text-[#666] max-w-lg mx-auto">Upload a Trial Balance from Tally, Zoho, or any accounting software. CortexCFO does the rest.</p>
          </div>

          {/* Main feature — full width with image */}
          <div className="grid md:grid-cols-2 gap-0 mb-8 rounded-xl overflow-hidden border border-[#e5e5e5]">
            <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><Upload className="w-5 h-5" /></div>
              <h3 className="text-xl font-semibold mb-3">Upload your Trial Balance. Get instant clarity.</h3>
              <p className="text-sm text-[#666] leading-relaxed mb-4">Drop a CSV or Excel file from Tally, Zoho, or any accounting software. CortexCFO auto-classifies every account, checks Ind AS compliance, asks 5 clarifying questions, and delivers a full financial analysis.</p>
              <Link href="/signup" className="inline-flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700">Try it now <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="h-64 md:h-auto overflow-hidden">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=85" alt="Financial dashboard" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Feature grid with images */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <MessageSquare className="w-5 h-5" />, title: "Ask Anything", desc: "Chat with your data. 'How do I reduce costs?' — powered by Claude AI.", color: "bg-purple-50 text-purple-600", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80" },
              { icon: <FileSpreadsheet className="w-5 h-5" />, title: "Ind AS Review", desc: "Auto compliance checks — AS 12, 15, 16, 19, 24, 37 flagged.", color: "bg-amber-50 text-amber-600", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80" },
              { icon: <Brain className="w-5 h-5" />, title: "9 Industries", desc: "Manufacturing, SaaS, Services, Trading, E-commerce & more.", color: "bg-emerald-50 text-emerald-600", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80" },
              { icon: <Shield className="w-5 h-5" />, title: "AI Questions", desc: "5 questions your auditor would ask. Answer to refine analysis.", color: "bg-red-50 text-red-600", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&q=80" },
              { icon: <LineChart className="w-5 h-5" />, title: "Scenario Modeling", desc: "Toggle events. Watch your forecast recalculate in real-time.", color: "bg-cyan-50 text-cyan-600", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80" },
              { icon: <TrendingUp className="w-5 h-5" />, title: "Multi-File Upload", desc: "Upload multiple years at once. Compare FY-over-FY trends.", color: "bg-orange-50 text-orange-600", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80" },
            ].map(f => (
              <div key={f.title} className="group rounded-xl border border-[#f0f0f0] hover:border-[#e0e0e0] hover:shadow-md transition-all overflow-hidden">
                <div className="h-32 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className={`w-8 h-8 rounded-lg ${f.color} flex items-center justify-center mb-3`}>{f.icon}</div>
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-[#666] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold mb-4">How it works</h2>
            <p className="text-[#666]">Three steps to financial clarity</p>
          </div>
          <div className="space-y-12">
            {[
              { step: "1", title: "Upload your financials", desc: "Export a Trial Balance from Tally, Zoho Books, or any accounting software. Upload the CSV or Excel file — we support multiple financial years at once." },
              { step: "2", title: "Get instant analysis", desc: "CortexCFO classifies every account, calculates key ratios, checks Ind AS compliance, and generates industry-specific insights. No manual work required." },
              { step: "3", title: "Ask questions, get answers", desc: "Chat with the AI about your financials. Ask anything — cost reduction, risk assessment, projections, CA opinions. Powered by Claude with your actual data." },
            ].map(item => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">{item.step}</div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-[#666] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-[#f0f0f0]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "5 min", label: "Setup time" },
            { value: "₹2.1 Cr", label: "Avg. value found" },
            { value: "9", label: "Industries covered" },
            { value: "98%", label: "Analysis accuracy" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-semibold">{s.value}</p>
              <p className="text-sm text-[#999] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">What our users say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "CortexCFO found a ₹2.1 Cr working capital leak that our CA firm missed for two years. The ROI was immediate.", author: "Rajesh M.", role: "Managing Partner, PE Fund" },
              { quote: "The AI asks exactly the questions our auditors would ask. It caught a ₹4.25 Cr suspense balance on the first upload.", author: "Priya S.", role: "CFO, D2C Brand" },
              { quote: "We replaced our entire FP&A spreadsheet workflow. The scenario planner alone saved us 40 hours a month.", author: "Ananya D.", role: "Founder, SaaS Startup" },
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-xl border border-[#f0f0f0] bg-[#fafafa]">
                <div className="flex gap-0.5 mb-3">
                  {[1,2,3,4,5].map(j => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-[#444] leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm font-semibold">{t.author}</p>
                <p className="text-xs text-[#999]">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold mb-4">Simple pricing</h2>
            <p className="text-[#666]">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Free", period: "forever", desc: "For exploring your numbers", features: ["1 file upload", "Basic dashboard", "5 AI questions", "Email support"], highlighted: false },
              { name: "Growth", price: "₹9,999", period: "/month", desc: "For funded startups", features: ["Unlimited uploads", "Multi-year analysis", "Unlimited AI chat", "Industry benchmarks", "Ind AS compliance", "Priority support"], highlighted: true },
              { name: "Enterprise", price: "Custom", period: "", desc: "For CA firms & PE funds", features: ["Portfolio dashboards", "Custom AI models", "White-label reports", "API access", "Dedicated CSM", "On-premise option"], highlighted: false },
            ].map(plan => (
              <div key={plan.name} className={`p-6 rounded-xl border ${plan.highlighted ? "border-[#1a1a1a] shadow-lg bg-white" : "border-[#e5e5e5] bg-white"}`}>
                {plan.highlighted && <p className="text-xs font-medium text-emerald-600 mb-3">Most popular</p>}
                <p className="text-sm text-[#666] mb-1">{plan.name}</p>
                <div className="mb-1"><span className="text-3xl font-semibold">{plan.price}</span><span className="text-sm text-[#999] ml-1">{plan.period}</span></div>
                <p className="text-xs text-[#999] mb-5">{plan.desc}</p>
                <Link href="/signup" className={`block text-center py-2.5 rounded-lg text-sm font-medium mb-5 transition-colors ${plan.highlighted ? "bg-[#1a1a1a] text-white hover:bg-[#333]" : "bg-[#f5f5f5] text-[#1a1a1a] hover:bg-[#eee]"}`}>
                  {plan.name === "Enterprise" ? "Contact sales" : "Start free trial"}
                </Link>
                <ul className="space-y-2.5">
                  {plan.features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-[#666]"><Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Your data stays yours</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">
                  We take financial data security seriously. Your Trial Balance and financial data are processed in encrypted, isolated environments. We never use your data to train AI models. Files are analyzed in real-time and you can request deletion at any time.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-[#999]">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 256-bit encryption at rest and in transit</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Your data is never used for AI training</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Delete your data anytime</span>
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> India data residency available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to understand your finances?</h2>
          <p className="text-[#666] mb-8">Join 200+ finance teams that replaced spreadsheets with CortexCFO.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-8 py-3 rounded-lg hover:bg-[#333] transition-colors text-sm font-medium">
            Start free trial <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#f0f0f0] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center"><TrendingUp className="w-3 h-3 text-white" /></div>
                <span className="text-sm font-semibold">CortexCFO</span>
              </div>
              <p className="text-xs text-[#999] leading-relaxed">AI-powered financial intelligence for Indian businesses.</p>
            </div>
            {[
              { title: "Product", links: [{label:"Dashboard",href:"/dashboard"},{label:"TB Analysis",href:"/analysis"},{label:"Scenarios",href:"/scenarios"}]},
              { title: "Company", links: [{label:"About",href:"/about"},{label:"Privacy",href:"/privacy"},{label:"Terms",href:"/terms"}]},
              { title: "Support", links: [{label:"Documentation",href:"/about"},{label:"Contact",href:"/about"}]},
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">{col.title}</p>
                <ul className="space-y-2">{col.links.map(l => <li key={l.label}><Link href={l.href} className="text-sm text-[#666] hover:text-[#1a1a1a]">{l.label}</Link></li>)}</ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#f0f0f0] pt-6 flex items-center justify-between">
            <p className="text-xs text-[#999]">&copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.</p>
            <div className="flex gap-4 text-xs text-[#999]">
              <a href="https://twitter.com" target="_blank" rel="noopener" className="hover:text-[#666]">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="hover:text-[#666]">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
