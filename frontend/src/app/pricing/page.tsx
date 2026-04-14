"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    desc: "For exploring the platform",
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
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Start free. Scale when ready.</h1>
            <p className="text-white/40 text-lg">No surprises. No hidden fees. Cancel anytime.</p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <FadeIn key={plan.name} delay={i * 80}>
                <div className={`p-6 rounded-2xl border h-full card-shine ${plan.highlighted ? "border-emerald-500/30 bg-emerald-500/5 glow-border" : "border-white/8 bg-[#111]"}`}>
                  {plan.highlighted && <p className="text-xs font-semibold text-emerald-400 mb-3">Most popular</p>}
                  <p className="text-sm text-white/50 mb-1">{plan.name}</p>
                  <div className="mb-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-white/30 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-xs text-white/30 mb-6">{plan.desc}</p>
                  <Link
                    href="/signup"
                    className={`block text-center py-2.5 rounded-xl text-sm font-medium mb-6 transition-all ${plan.highlighted ? "bg-emerald-500 text-white hover:bg-emerald-400 btn-magnetic" : "bg-white/5 text-white/70 hover:bg-white/10"}`}
                  >
                    {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
                  </Link>
                  <ul className="space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-white/40">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Comparison table */}
          <FadeIn delay={200}>
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center mb-10">Compare plans</h2>
              <div className="bg-[#111] rounded-2xl border border-white/8 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-6 py-4 text-white/30 font-medium">Feature</th>
                      <th className="text-center px-4 py-4 text-white/50 font-medium">Starter</th>
                      <th className="text-center px-4 py-4 text-emerald-400 font-semibold">Growth</th>
                      <th className="text-center px-4 py-4 text-white/50 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "File uploads", starter: "1", growth: "Unlimited", enterprise: "Unlimited" },
                      { feature: "AI chat questions", starter: "5", growth: "Unlimited", enterprise: "Unlimited" },
                      { feature: "Industry benchmarks", starter: "-", growth: "\u2713", enterprise: "\u2713" },
                      { feature: "Ind AS compliance", starter: "-", growth: "\u2713", enterprise: "\u2713" },
                      { feature: "Multi-year analysis", starter: "-", growth: "\u2713", enterprise: "\u2713" },
                      { feature: "Export reports", starter: "CSV", growth: "CSV + PDF", enterprise: "All formats" },
                      { feature: "API access", starter: "-", growth: "-", enterprise: "\u2713" },
                      { feature: "White-label", starter: "-", growth: "-", enterprise: "\u2713" },
                      { feature: "Support", starter: "Email", growth: "Priority", enterprise: "Dedicated CSM" },
                    ].map((row) => (
                      <tr key={row.feature} className="border-b border-white/3">
                        <td className="px-6 py-3 text-white/50">{row.feature}</td>
                        <td className="text-center px-4 py-3 text-white/30">{row.starter}</td>
                        <td className="text-center px-4 py-3 text-white/60">{row.growth}</td>
                        <td className="text-center px-4 py-3 text-white/30">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-white/40 mb-8">Join 200+ businesses using CortexCFO for financial intelligence.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-8 py-3.5 rounded-xl btn-magnetic text-sm font-semibold">
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
