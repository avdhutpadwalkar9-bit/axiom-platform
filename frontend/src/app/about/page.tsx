"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, Users, Brain, Shield, Globe } from "lucide-react";

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const team = [
    { name: "Arjun Mehta", title: "Chief Executive Officer", initials: "AM", gradient: "from-indigo-500 to-purple-600" },
    { name: "Kavya Iyer", title: "Chief Technology Officer", initials: "KI", gradient: "from-emerald-500 to-teal-600" },
    { name: "Rohan Kapoor", title: "Chief Product Officer", initials: "RK", gradient: "from-amber-500 to-orange-600" },
    { name: "Neha Sundaram", title: "Head of AI", initials: "NS", gradient: "from-rose-500 to-pink-600" },
  ];

  const values = [
    { icon: Globe, title: "India-first", desc: "Built for Indian accounting standards, Indian tax codes, and Indian business realities. Ind AS, GST, TDS -- native from day one." },
    { icon: Brain, title: "AI-native", desc: "Not AI bolted on. Every workflow, every insight, every recommendation is powered by models trained on Indian financial data." },
    { icon: Shield, title: "Privacy by design", desc: "Your financial data never trains our models. SOC 2 Type II certified, 256-bit encryption, and full data residency in India." },
    { icon: Users, title: "Open by default", desc: "Open APIs, open integrations, open export. Your data is yours. We make it easy to connect, easy to leave, easy to trust." },
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
            <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-[20px] font-bold tracking-[-0.03em]">axiom</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[13.5px] text-[#666] font-medium">
            <Link href="/#platform" className="hover:text-[#1a1a1a] transition-colors duration-300">Platform</Link>
            <Link href="/#customers" className="hover:text-[#1a1a1a] transition-colors duration-300">Customers</Link>
            <Link href="/#pricing" className="hover:text-[#1a1a1a] transition-colors duration-300">Pricing</Link>
            <Link href="/about" className="text-[#1a1a1a] transition-colors duration-300">About</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[13.5px] text-[#666] hover:text-[#1a1a1a] transition-colors font-medium">Log in</Link>
            <Link href="/signup" className="text-[13.5px] bg-[#1a1a1a] text-white font-semibold px-6 py-2.5 rounded-full hover:bg-[#333] transition-all">
              Request access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[60vh] bg-[#1a1a17] text-white flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
        <div className="relative z-10 max-w-[1400px] mx-auto px-8 py-40 w-full">
          <div className="max-w-[700px] mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-semibold tracking-[0.15em] uppercase text-white/50">Our Story</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] font-light tracking-[-0.04em] leading-[1.1] mb-8">
              About <span className="italic font-normal">Axiom</span>
            </h1>
            <p className="text-[18px] text-white/50 max-w-[520px] mx-auto leading-[1.75] font-light">
              We are building the financial intelligence layer for Indian businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Our Mission</p>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-light tracking-[-0.03em] leading-[1.3] mb-8">
            Every Indian business deserves
            <br />
            <span className="italic font-normal text-[#999]">world-class financial intelligence.</span>
          </h2>
          <p className="text-[16px] text-[#666] leading-[1.8] max-w-[600px] mx-auto">
            India has 63 million SMEs and thousands of fast-growing startups, yet most still run on spreadsheets
            and outdated accounting software. We started Axiom because we believe AI can close that gap --
            giving every founder, CFO, and investor the same caliber of financial insight that Fortune 500
            companies take for granted.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-28 px-8 bg-[#f5f4f2]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Leadership</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-light tracking-[-0.03em]">
              Meet the <span className="italic font-normal text-[#999]">team</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map(member => (
              <div key={member.name} className="bg-white rounded-2xl p-8 text-center border border-[#eee] hover:shadow-lg transition-all duration-500">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-[22px] font-bold mx-auto mb-6`}>
                  {member.initials}
                </div>
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-1">{member.name}</h3>
                <p className="text-[13px] text-[#999]">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-28 px-8 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-indigo-600 mb-4">Our Values</p>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-light tracking-[-0.03em]">
              What we <span className="italic font-normal text-[#999]">stand for</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(value => (
              <div key={value.title} className="p-8 rounded-2xl border border-[#eee] hover:shadow-lg hover:border-[#ddd] transition-all duration-500 bg-[#faf9f7]">
                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center mb-5">
                  <value.icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[18px] font-semibold tracking-[-0.01em] mb-3">{value.title}</h3>
                <p className="text-[14px] text-[#888] leading-[1.7]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
            Ready to transform
            <br />
            <span className="italic font-normal text-white/50">your finances?</span>
          </h2>
          <p className="text-[16px] text-white/40 mb-12 leading-[1.7] max-w-md mx-auto">
            Join 200+ finance teams across India that trust Axiom for
            real-time financial intelligence.
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
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-[18px] font-bold tracking-[-0.02em]">axiom</span>
              </div>
              <p className="text-[13px] text-white/30 leading-[1.8] max-w-xs">
                AI-powered financial intelligence platform for Indian businesses.
                Continuous QoE, scenario modeling, and prescriptive insights.
              </p>
            </div>
            {[
              { title: "Product", links: [{ label: "Dashboard", href: "/#platform" }, { label: "TB Analysis", href: "/#platform" }, { label: "Scenarios", href: "/#platform" }, { label: "QoE Center", href: "/#platform" }, { label: "Integrations", href: "/#platform" }] },
              { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Careers", href: "#" }, { label: "Blog", href: "#" }, { label: "Press", href: "#" }, { label: "Contact", href: "#" }] },
              { title: "Legal", links: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }, { label: "Security", href: "#" }, { label: "GDPR", href: "#" }, { label: "DPDP", href: "#" }] },
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
              <a href="#" className="hover:text-white/40">Twitter</a>
              <a href="#" className="hover:text-white/40">LinkedIn</a>
              <a href="#" className="hover:text-white/40">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
