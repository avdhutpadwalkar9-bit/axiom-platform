"use client";

import Link from "next/link";
import { ArrowRight, Users, Brain, Shield, Globe } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

export default function AboutPage() {

  const team = [
    { name: "Avdhut Padwalkar", title: "Founder & CEO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
    { name: "AI Engineering Team", title: "Building the future of FP&A", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop" },
  ];

  const values = [
    { icon: Globe, title: "India-first", desc: "Built for Indian accounting standards, Indian tax codes, and Indian business realities. Ind AS, GST, TDS native from day one." },
    { icon: Brain, title: "AI-native", desc: "Every workflow, every insight, every recommendation is powered by AI trained on Indian financial data patterns." },
    { icon: Shield, title: "Privacy by design", desc: "Your financial data never trains our models. 256-bit encryption, and full data residency in India." },
    { icon: Users, title: "Open by default", desc: "Open APIs, open integrations, open export. Your data is yours. Easy to connect, easy to leave, easy to trust." },
  ];

  const milestones = [
    { year: "2024", title: "The idea", desc: "Founded with a vision to democratize financial intelligence for Indian MSMEs." },
    { year: "2025", title: "First product", desc: "Launched Trial Balance analyzer with AI-powered insights and Ind AS compliance." },
    { year: "2026", title: "Scaling up", desc: "11 industry verticals, Claude AI integration, and 200+ businesses onboarded." },
    { year: "Next", title: "The future", desc: "Real-time accounting integrations, predictive analytics, and white-label for CA firms." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">About CortexCFO</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Building the financial<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">intelligence layer</span>
              <br />for Indian businesses
            </h1>
            <p className="text-lg text-white/40 leading-relaxed max-w-xl mx-auto">
              India has 63 million SMEs. Most still rely on spreadsheets and manual accounting.
              We started CortexCFO to change that.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission */}
      <FadeIn>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#111] rounded-2xl border border-white/8 p-10 md:p-14">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-4">Our Mission</p>
              <h2 className="text-2xl md:text-3xl font-bold leading-snug mb-6">
                Every Indian business deserves world-class financial intelligence.
              </h2>
              <p className="text-white/40 leading-relaxed text-[15px]">
                CortexCFO exists because we believe AI can close the gap between what Fortune 500 companies
                have access to and what Indian MSMEs and startups can afford. We are building the tools that
                give every founder, CFO, and investor the caliber of financial insight that was previously
                reserved for those who could afford top-tier consulting firms.
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Timeline */}
      <section className="py-20 px-6 bg-[#080808]">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Our Journey</p>
            <h2 className="text-3xl font-bold">From idea to impact</h2>
          </FadeIn>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <FadeIn key={m.year} delay={i * 100}>
                <div className="flex gap-6 items-start py-8 border-b border-white/5 last:border-0">
                  <div className="w-16 text-right flex-shrink-0">
                    <span className="text-emerald-400 font-bold text-lg">{m.year}</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{m.title}</h3>
                    <p className="text-white/40 text-[15px]">{m.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Leadership</p>
            <h2 className="text-3xl font-bold">Meet the team</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {team.map((member, i) => (
              <FadeIn key={member.name} delay={i * 80}>
                <div className="bg-[#111] rounded-2xl p-8 text-center border border-white/5 hover:border-white/10 transition-all">
                  <img src={member.img} alt={member.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-5 border-2 border-white/10" />
                  <h3 className="text-base font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-white/30">{member.title}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Our Values</p>
            <h2 className="text-3xl font-bold">What we stand for</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 80}>
                <div className="bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-emerald-500/20 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-5">
                    <v.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <FadeIn>
        <section className="py-16 px-6 border-y border-white/5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "200+", label: "Businesses analyzed" },
              { value: "11", label: "Industries covered" },
              { value: "6", label: "Ind AS standards" },
              { value: "60s", label: "Time to insight" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to get started?
            </h2>
            <p className="text-white/40 mb-10">
              Join the growing community of Indian businesses using AI-powered financial intelligence.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/20">
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
