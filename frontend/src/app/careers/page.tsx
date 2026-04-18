"use client";

import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  Mail,
  ArrowRight,
  Code2,
  Rocket,
  Shield,
  Users,
  IndianRupee,
  Briefcase,
  MapPin,
  Sparkles,
} from "lucide-react";

// Founding-team roles. Kept deliberately short — applicants email directly,
// we don't run an ATS yet. Tweak as hiring needs shift.
const openRoles = [
  {
    title: "Founding Engineer — Full-stack",
    team: "Engineering",
    stack: "TypeScript · Next.js · FastAPI · PostgreSQL",
    location: "Remote (India) · Hybrid Pune/Mumbai",
    blurb:
      "Own end-to-end product surfaces from Trial Balance upload to the QoE report PDF. You care about finance, not just code — you'll be reading ASC 606 (Revenue) alongside React components.",
  },
  {
    title: "Founding Engineer — AI / LLM evals",
    team: "Engineering",
    stack: "Python · Claude · Gemini · LLM evals · RAG",
    location: "Remote (India) · Hybrid Pune/Mumbai",
    blurb:
      "Build the layer that turns a Trial Balance into a defensible add-back schedule. Design evals, prompt scaffolds, and the guardrails that keep outputs CA-defensible.",
  },
  {
    title: "Founding CA — Financial Analyst",
    team: "Finance / Product",
    stack: "CA · GAAP · QoE · SMB audit experience",
    location: "Remote (India) · Hybrid Pune/Mumbai",
    blurb:
      "Sit between product and customer. Review model output, author the GAAP rule base, sign off QoE reports, and translate what you see in books into product backlog.",
  },
  {
    title: "Founding GTM Lead",
    team: "Go-to-market",
    stack: "B2B SaaS · SMB distribution · CA channel partners",
    location: "Remote (India) · Hybrid Pune/Mumbai",
    blurb:
      "Take CortexCFO to the $1-10M SMB segment. Build the CPA partner channel, run founder-led sales, and tell our story to banks, PE, and acquirers.",
  },
];

const whyJoin = [
  {
    icon: Rocket,
    title: "Real problem, real urgency",
    desc: "63 million Indian SMEs, most running on spreadsheets, most paying $10-25K for a Big-4 QoE they can't afford. We're closing that gap every month.",
  },
  {
    icon: Shield,
    title: "Defensible product moat",
    desc: "GAAP coverage, QoE add-back library, and CA sign-off workflow compound with every engagement. No competitor in India has this stack today.",
  },
  {
    icon: Users,
    title: "Founders who ship",
    desc: "Small team. Short cycles. No corporate meeting culture. You own your surface, from spec to production, with the founder one Slack message away.",
  },
  {
    icon: IndianRupee,
    title: "Meaningful equity",
    desc: "Real founding-team equity with a transparent cap table. You benefit when SMBs benefit. We'll walk you through the numbers on our first call.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400">
                We&apos;re hiring
              </p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
              Build the financial<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                intelligence layer
              </span>
              <br />for SMBs
            </h1>
            <p className="text-lg text-white/40 leading-relaxed max-w-xl mx-auto">
              CortexCFO is a small founding team, shipping weekly, serving $1-10M
              Indian businesses. If the mission speaks to you, we&apos;d love to chat.
            </p>
            <div className="mt-8">
              <a
                href="mailto:careers@cortexcfo.ai?subject=Founding%20team%20application"
                className="btn-accent"
              >
                <Mail className="w-4 h-4" /> careers@cortexcfo.ai
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why join */}
      <section className="py-16 px-6 bg-[#080808] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              Why join
            </p>
            <h2 className="text-3xl font-bold">What founding team gets you</h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            {whyJoin.map((w, i) => (
              <FadeIn key={w.title} delay={i * 80}>
                <div className="bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <w.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{w.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{w.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-12">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              Open roles
            </p>
            <h2 className="text-3xl font-bold">Come build with us</h2>
            <p className="text-sm text-white/40 mt-4 max-w-lg mx-auto">
              Don&apos;t see your role? Write to us anyway. If you&apos;re the right
              fit, we&apos;ll find a way to work together.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {openRoles.map((r, i) => (
              <FadeIn key={r.title} delay={i * 80}>
                <div className="bg-[#111] rounded-2xl border border-white/8 hover:border-emerald-500/20 transition-all p-6 md:p-7">
                  <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-emerald-400">
                          {r.team}
                        </p>
                      </div>
                      <h3 className="text-xl font-semibold text-white">{r.title}</h3>
                    </div>
                    <a
                      href={`mailto:careers@cortexcfo.ai?subject=Application%3A%20${encodeURIComponent(
                        r.title,
                      )}`}
                      className="inline-flex items-center gap-2 text-[12px] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg transition-all font-medium"
                    >
                      Apply <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-sm text-white/50 leading-relaxed mb-4">{r.blurb}</p>

                  <div className="flex items-center gap-4 flex-wrap text-[11px] text-white/40">
                    <span className="inline-flex items-center gap-1.5">
                      <Code2 className="w-3 h-3" /> {r.stack}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> {r.location}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Generic apply */}
      <section className="py-20 px-6 bg-[#080808] border-t border-white/5">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Want to join but don&apos;t see a role?
            </h2>
            <p className="text-white/45 mb-8 text-[15px] leading-relaxed">
              If you&apos;re a senior operator in finance, audit, AI or product and
              the mission resonates &mdash; drop us a note. We hire for trajectory and
              fit, not just open reqs.
            </p>
            <a
              href="mailto:careers@cortexcfo.ai?subject=Open%20application"
              className="btn-accent"
            >
              <Mail className="w-4 h-4" /> Write to careers@cortexcfo.ai
            </a>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
