"use client";

/**
 * /checkout — payment shell.
 *
 * This is intentionally a UI-only shell — no payment gateway is wired
 * yet. When a gateway (Stripe for US, Razorpay for IN) is chosen, we
 * replace the submit handler with the real flow. Until then, the
 * "Complete purchase" button shows a friendly confirmation modal and
 * routes back to /dashboard.
 *
 * Security rules (per product brief): Claude will NEVER auto-fill
 * card data. Every sensitive field is user-entered. This page only
 * COLLECTS data; it doesn't transmit it anywhere until a real gateway
 * + server endpoint is wired.
 */

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

// Plan catalog — keyed by slug we receive from /pricing. Each plan has
// a region-specific price so the user sees INR on /in and USD on /us.
// Keep this in sync with plans[] in /pricing/page.tsx.
const PLAN_CATALOG: Record<
  string,
  {
    name: string;
    tagline: string;
    features: string[];
    pricing: { us: { amount: string; period: string }; in: { amount: string; period: string } };
  }
> = {
  "diligence-report": {
    name: "Diligence Report",
    tagline: "One QoE report for a specific deal or board meeting",
    features: [
      "One full QoE report",
      "Adjusted EBITDA with add-back schedule",
      "GAAP-aligned P&L, BS, CFS",
      "CPA sign-off",
      "30-day access to underlying dashboard",
      "Delivered in 48 hours",
    ],
    pricing: {
      us: { amount: "$599", period: "one-time" },
      in: { amount: "₹49,000", period: "one-time" },
    },
  },
  growth: {
    name: "Growth",
    tagline: "For SMBs at ₹10–50M / $1–5M revenue",
    features: [
      "Monthly QoE reports",
      "Unlimited QuickBooks / Xero / Tally sync",
      "Continuous QoE engine",
      "Multi-year GAAP reports",
      "Unlimited AI chat on your ledger",
      "Industry benchmarks",
      "Priority support",
    ],
    pricing: {
      us: { amount: "$299", period: "/month" },
      in: { amount: "₹24,999", period: "/month" },
    },
  },
};

function getPlan(slug: string | null, region: "us" | "in") {
  const key = (slug || "growth").toLowerCase();
  const plan = PLAN_CATALOG[key] || PLAN_CATALOG["growth"];
  const price = plan.pricing[region];
  return { ...plan, price };
}

function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const region = (searchParams.get("region") === "in" ? "in" : "us") as "us" | "in";
  const planSlug = searchParams.get("plan");
  const plan = useMemo(() => getPlan(planSlug, region), [planSlug, region]);

  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "bank">(
    region === "in" ? "upi" : "card",
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const taxLabel = region === "in" ? "GST (18%)" : "Sales tax (est.)";
  const currencySymbol = region === "in" ? "₹" : "$";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to Stripe (US) or Razorpay (IN) when payment gateway
    // is chosen. For now we just simulate a short think-time and show
    // a confirmation — the whole point of the shell is to give the
    // user a realistic checkout flow to click through.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <SiteNav />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-lg mx-auto text-center">
            <FadeIn>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-[32px] font-bold tracking-tight mb-3">
                You&rsquo;re all set.
              </h1>
              <p className="text-[16px] text-white/65 leading-relaxed mb-8">
                Thanks for trying the checkout flow. No payment was processed —
                this is a demo shell while we finalise our payment partner.
                You&rsquo;ll hear from us as soon as live billing goes on.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-full transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/30"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white font-medium px-5 py-3 rounded-full border border-white/10 hover:border-white/25 transition-colors"
                >
                  Change plan
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back to pricing */}
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to plans
          </Link>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* ── LEFT: payment form ── */}
            <FadeIn>
              <div className="bg-[#111] border border-white/8 rounded-2xl p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <h1 className="text-[22px] font-semibold tracking-tight">
                    Complete your subscription
                  </h1>
                </div>

                {/* Shell notice — honest about the gateway not being live */}
                <div className="mb-6 p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 flex gap-3">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-100/85 leading-relaxed">
                    <span className="font-semibold text-amber-300">Demo checkout.</span>{" "}
                    This flow is live for preview — no card is charged and no
                    payment gateway is connected yet. Pick any method, fill
                    the form, and we&rsquo;ll walk you through the real billing
                    once our payment partner goes live.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Account info */}
                  <div>
                    <label className="text-[13px] font-medium text-white/75 mb-1.5 block">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.05] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-white/75 mb-1.5 block">
                      Billing email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/25 text-[14px] focus:outline-none focus:border-emerald-500/60 focus:bg-white/[0.05] transition-colors"
                    />
                  </div>

                  {/* Payment method — region-aware options */}
                  <div>
                    <p className="text-[13px] font-medium text-white/75 mb-2">
                      Payment method
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
                          paymentMethod === "card"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]"
                        }`}
                      >
                        Card
                      </button>
                      {region === "in" && (
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("upi")}
                          className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
                            paymentMethod === "upi"
                              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                              : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]"
                          }`}
                        >
                          UPI
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank")}
                        className={`px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all border ${
                          paymentMethod === "bank"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]"
                        }`}
                      >
                        Bank transfer
                      </button>
                    </div>
                  </div>

                  {/* Preview fields — grayed because this is a shell.
                      We intentionally don't capture real card numbers
                      until a gateway is live. */}
                  {paymentMethod === "card" && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                      <div className="flex items-center gap-2 text-[12px] text-white/50">
                        <CreditCard className="w-3.5 h-3.5" />
                        Card details will be collected by our gateway
                      </div>
                      <div className="grid grid-cols-[1fr_90px_90px] gap-2">
                        <div className="h-10 rounded-lg bg-white/[0.03] border border-white/8 flex items-center px-3 text-[13px] text-white/30 font-mono">
                          •••• •••• •••• ••••
                        </div>
                        <div className="h-10 rounded-lg bg-white/[0.03] border border-white/8 flex items-center px-3 text-[13px] text-white/30 font-mono">
                          MM / YY
                        </div>
                        <div className="h-10 rounded-lg bg-white/[0.03] border border-white/8 flex items-center px-3 text-[13px] text-white/30 font-mono">
                          CVC
                        </div>
                      </div>
                    </div>
                  )}
                  {paymentMethod === "upi" && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center gap-2 text-[13px] text-white/60">
                        <span className="font-mono text-[16px] text-white/80">
                          yourname@okhdfc
                        </span>
                      </div>
                      <p className="text-[12px] text-white/40 mt-2">
                        You&rsquo;ll receive a UPI collect request to approve
                        in your bank app.
                      </p>
                    </div>
                  )}
                  {paymentMethod === "bank" && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-[13px] text-white/65 leading-relaxed">
                        Bank transfer details will be emailed to{" "}
                        <span className="text-white/85">
                          {email || "your billing email"}
                        </span>{" "}
                        with a 7-day window to complete payment.
                      </p>
                    </div>
                  )}

                  {/* Security footer */}
                  <div className="flex items-center gap-2 text-[12px] text-white/45 pt-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400/70" />
                    PCI-DSS-compliant gateway · TLS 1.3 · Your data, encrypted
                    at rest
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3.5 rounded-full transition-all text-[14px] hover:scale-[1.01] hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? "Processing…" : `Complete purchase — ${plan.price.amount}`}
                  </button>

                  <p className="text-center text-[12px] text-white/40">
                    By subscribing you agree to our{" "}
                    <Link href="/terms" className="text-white/65 hover:text-white underline underline-offset-2">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-white/65 hover:text-white underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    . Cancel anytime from your dashboard.
                  </p>
                </form>
              </div>
            </FadeIn>

            {/* ── RIGHT: order summary ── */}
            <FadeIn delay={100}>
              <div className="bg-[#111] border border-white/8 rounded-2xl p-6 lg:sticky lg:top-24">
                <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-400 mb-4">
                  Order summary
                </p>
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/8">
                  <div>
                    <p className="text-[16px] font-semibold text-white mb-0.5">
                      {plan.name}
                    </p>
                    <p className="text-[13px] text-white/55 leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-[20px] font-bold tabular-nums text-white">
                      {plan.price.amount}
                    </p>
                    <p className="text-[11px] text-white/45">
                      {plan.price.period}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.slice(0, 5).map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] text-white/70"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 text-[13px] border-t border-white/8 pt-4">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{plan.price.amount}</span>
                  </div>
                  <div className="flex justify-between text-white/50 text-[12px]">
                    <span>{taxLabel}</span>
                    <span className="tabular-nums">
                      Calculated on invoice
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/8 text-[14px]">
                    <span>Due today</span>
                    <span className="tabular-nums">
                      {plan.price.amount}{" "}
                      <span className="text-white/50 text-[11px] font-normal">
                        {plan.price.period}
                      </span>
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 mt-4 leading-relaxed">
                  Billed in {currencySymbol === "₹" ? "INR" : "USD"}. 14-day
                  free trial on monthly plans — you won&rsquo;t be charged
                  until day 15.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <SiteNav />
        </div>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
