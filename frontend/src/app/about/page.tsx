"use client";

import Link from "next/link";
import { Users, Brain, Shield, Globe, Mail } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

export default function AboutPage() {

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

      {/* Co-founders */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Co-founders</p>
            <h2 className="text-3xl font-bold">The people behind the product</h2>
            <p className="text-white/40 text-[15px] leading-relaxed max-w-xl mx-auto mt-4">
              Built by two management consultants on a mission to arm every
              ambitious Indian MSME with the financial intelligence layer their
              growth deserves.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Avdhut */}
            <FadeIn>
              <div className="bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all h-full flex flex-col">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      AP
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold">Avdhut Padwalkar</h3>
                    <p className="text-sm text-emerald-400 font-medium">Co-founder &amp; CEO</p>
                    <p className="text-[12px] text-white/35 mt-1">Finance, product, AI &middot; Goa</p>
                  </div>
                </div>

                <div className="space-y-3 text-[14px] text-white/55 leading-relaxed flex-1">
                  <p>
                    A management consultant by training and an operator by
                    practice. Avdhut has spent his career inside Indian MSMEs
                    &mdash; helping promoters tighten their books, pressure-test
                    their numbers, and roll out the accounting, ERP and
                    reporting software stacks that turn messy operations into
                    investor-ready businesses.
                  </p>
                  <p>
                    He also teaches financial modeling and capital markets to
                    the next generation of finance professionals. At CortexCFO
                    he leads product, finance and AI &mdash; shipping the tool
                    he kept wishing his clients had: PE-grade financial
                    intelligence, every month, at a fraction of the cost.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {["Management Consulting", "FP&A", "Software Implementation", "Teaching", "Product & AI"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-white/5">
                  <a
                    href="https://www.linkedin.com/in/avdhut09/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Avdhut on LinkedIn"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 transition-all group"
                  >
                    <LinkedinIcon className="w-4 h-4 text-white/60 group-hover:text-emerald-400" />
                  </a>
                  <a
                    href="mailto:avdhut@cortexcfo.ai"
                    aria-label="Email Avdhut"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 transition-all group"
                  >
                    <Mail className="w-4 h-4 text-white/60 group-hover:text-emerald-400" />
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Rajan */}
            <FadeIn delay={100}>
              <div className="bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all h-full flex flex-col">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold bg-gradient-to-br from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      RN
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold">Rajan Nagaraju</h3>
                    <p className="text-sm text-emerald-400 font-medium">Co-founder &mdash; Growth &amp; Automation</p>
                    <p className="text-[12px] text-white/35 mt-1">AI, automation, growth &middot; Goa</p>
                  </div>
                </div>

                <div className="space-y-3 text-[14px] text-white/55 leading-relaxed flex-1">
                  <p>
                    A management consultant obsessed with making complicated
                    things simple. Rajan designs AI-first workflows and
                    automation pipelines that turn manual drudgery into crisp,
                    repeatable systems &mdash; across research, partnerships,
                    GTM and the back-office plumbing that keeps a startup
                    honest.
                  </p>
                  <p>
                    At CortexCFO he owns growth, go-to-market and the
                    automation spine that lets a small team punch far above
                    its weight. His bet: the Indian MSMEs that win the next
                    decade will be the ones that wire AI and automation into
                    every function &mdash; not just into the marketing deck.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                  {["Management Consulting", "AI & Automation", "Process Design", "Go-to-Market", "Indian MSMEs"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-white/5">
                  <a
                    href="https://www.linkedin.com/in/rajan1705"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Rajan on LinkedIn"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 transition-all group"
                  >
                    <LinkedinIcon className="w-4 h-4 text-white/60 group-hover:text-emerald-400" />
                  </a>
                  <a
                    href="mailto:rajan@cortexcfo.ai"
                    aria-label="Email Rajan"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 transition-all group"
                  >
                    <Mail className="w-4 h-4 text-white/60 group-hover:text-emerald-400" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={200}>
            <div className="mt-6 bg-white/[0.02] rounded-2xl p-6 border border-white/5">
              <p className="text-[13px] text-white/50 leading-relaxed">
                <span className="text-emerald-400 font-semibold">Building the team.</span>{" "}
                We&apos;re hiring founding engineers, CAs and a founding GTM
                associate to build the financial intelligence layer for Indian
                MSMEs.{" "}
                <Link href="/careers" className="text-emerald-400 hover:underline font-medium">
                  See open roles &rarr;
                </Link>
              </p>
            </div>
          </FadeIn>
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

      <SiteFooter />
    </div>
  );
}
