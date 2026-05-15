"use client";

/* ════════════════════════════════════════════════════════════════
   /billing — Authenticated payment + plan picker.

   This is a UI-only shell — no real gateway is wired yet. The user
   picks a plan and a payment method, billing details auto-fill
   from the authStore + onboarding store (no auto-fill on card
   numbers, per security policy), and submission shows a friendly
   confirmation. When Razorpay (IN) or Stripe (US) goes live, swap
   the submit handler for the real flow.
   ════════════════════════════════════════════════════════════════ */

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  Sparkles,
  Building2,
  Wallet,
  Smartphone,
  Banknote,
  ShieldCheck,
  HardDrive,
  Upload,
  RefreshCw,
  Users,
  Info,
  Loader2,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { PLANS } from "../profile/page";
import type { PlanKey } from "../profile/page";

const GST_PCT = 18;

type PayMethod = "card" | "upi" | "netbanking" | "bank";

function BillingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const requestedPlanKey = (params.get("plan") as PlanKey | null) ?? "growth";
  const isUpgradeFlow = params.get("action") === "upgrade";

  const authUser = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const { business, personal } = useOnboardingStore();
  const isDemo = useIsDemoAccount();

  useEffect(() => {
    if (!authUser) checkAuth();
  }, [authUser, checkAuth]);

  // Active plan tile selection (defaults to ?plan= param, falls back
  // to Growth as the most-likely upgrade target)
  const [selected, setSelected] = useState<PlanKey>(requestedPlanKey);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [method, setMethod] = useState<PayMethod>("card");

  // Auto-filled from auth + onboarding — strict. No fabricated
  // "Vikram Shah / Vadodara Chem" fallbacks. Empty fields show as
  // editable inputs the user can fill in, not made-up data.
  const fullName = (authUser?.name || personal.fullName || "").trim();
  const email = authUser?.email || "";
  const companyName = business.companyName || "";
  const gstin = business.gstin || "";

  // Demo workspace gets a sample billing address so the page looks
  // populated end-to-end for prospects. Real accounts collect it
  // inline (one-time, on first paid checkout).
  const sampleDemoAddress = "Plot 14, GIDC Phase II · Vadodara · Gujarat 390010 · India";
  const [billingAddress, setBillingAddress] = useState(isDemo ? sampleDemoAddress : "");

  // Editable card/UPI/bank fields — we DON'T auto-fill these
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const plan = useMemo(() => PLANS.find((p) => p.key === selected) ?? PLANS[1], [selected]);
  const isCustomPriced = plan.key === "enterprise";

  // Parse the ₹ price to a number for tax math (custom-priced plans
  // bypass this entirely).
  const monthlyAmount = useMemo(() => {
    if (isCustomPriced) return 0;
    const numeric = plan.price.replace(/[^\d.]/g, "");
    return parseFloat(numeric) || 0;
  }, [plan.price, isCustomPriced]);

  // Annual = 12 months billed at 10× (2 months free) — common SaaS pattern
  const subtotal = billingCycle === "annual" ? monthlyAmount * 10 : monthlyAmount;
  const gst = Math.round(subtotal * (GST_PCT / 100));
  const total = subtotal + gst;
  const fmt = (n: number) =>
    n.toLocaleString("en-IN", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomPriced) {
      window.location.href = "/contact";
      return;
    }
    setSubmitting(true);
    // Demo: just show a confirmation. Real gateway lands here.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setDone(true);
  };

  if (done) {
    return (
      <>
        <section className="hero" style={{ textAlign: "center", paddingTop: 40 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "var(--brand-soft)",
              border: "1px solid color-mix(in oklab, var(--brand) 30%, transparent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <CheckCircle2 style={{ width: 28, height: 28, color: "var(--brand-text)" }} />
          </div>
          <h1 className="hero-title">
            You&rsquo;re on the <span className="name">{plan.name}</span> plan.
          </h1>
          <p className="hero-sub" style={{ display: "block", maxWidth: 540, margin: "12px auto 0" }}>
            Thanks for trying the checkout flow. <strong>No payment was processed</strong> — this is a demo shell while we wire up Razorpay. You&rsquo;ll get an invoice the moment live billing goes on.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 22 }}>
            <Link href="/dashboard" className="btn btn-primary" style={{ textDecoration: "none" }}>
              <Sparkles style={{ width: 13, height: 13 }} />
              Go to dashboard
            </Link>
            <Link href="/profile" className="btn" style={{ textDecoration: "none" }}>
              Back to profile
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* PAGE HEAD */}
      <div className="page-head">
        <div className="ph-left">
          <Link
            href="/profile"
            style={{
              fontSize: 12,
              color: "var(--text-muted, var(--muted))",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <ArrowLeft style={{ width: 12, height: 12 }} />
            Back to profile
          </Link>
          <div className="ph-eyebrow">{isUpgradeFlow ? "Upgrade · billing" : "Plan & billing"}</div>
          <div className="ph-title">
            {isUpgradeFlow ? "Upgrade your plan" : "Billing"}
            <span className="e">{plan.name}</span>
          </div>
          <div className="ph-sub">
            <span>Demo gateway · no card charged · live billing arrives with Razorpay launch</span>
          </div>
        </div>
        <div className="ph-actions">
          <button className="btn">
            <ShieldCheck style={{ width: 13, height: 13 }} />
            PCI-DSS · TLS 1.3
          </button>
        </div>
      </div>

      {/* PLAN PICKER */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Choose your plan</div>
            <div className="card-sub">Storage · uploads · QoE regenerations · team seats — scale up or down anytime</div>
          </div>
          <div className="card-actions">
            <div className="seg">
              <button className={billingCycle === "monthly" ? "active" : ""} onClick={() => setBillingCycle("monthly")}>
                Monthly
              </button>
              <button className={billingCycle === "annual" ? "active" : ""} onClick={() => setBillingCycle("annual")}>
                Annual · save 17%
              </button>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            padding: "16px 18px 18px",
          }}
        >
          {PLANS.map((p) => {
            const active = p.key === selected;
            const numericPrice = p.price.replace(/[^\d.]/g, "");
            const periodPrice =
              billingCycle === "annual" && numericPrice
                ? `₹${(parseFloat(numericPrice) * 10).toLocaleString("en-IN")}`
                : p.price;
            const periodLabel = billingCycle === "annual" && numericPrice ? "/year" : p.period;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSelected(p.key)}
                style={{
                  textAlign: "left",
                  padding: 16,
                  borderRadius: 12,
                  background: active ? "var(--brand-soft)" : "var(--card-2)",
                  border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "var(--text)",
                  transition: "all .12s",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: active ? "var(--brand-text)" : "var(--text-muted)" }}>
                    {p.name}
                  </span>
                  {p.highlight && !active && (
                    <span className="pill" style={{ fontSize: 9 }}>
                      Popular
                    </span>
                  )}
                  {active && (
                    <CheckCircle2 style={{ width: 14, height: 14, color: "var(--brand-text)" }} />
                  )}
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                    {periodPrice}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{periodLabel}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{p.tagline}</div>
                <div style={{ height: 1, background: "var(--border)" }} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 4 }}>
                  <PlanStat icon={<HardDrive style={{ width: 11, height: 11 }} />} label={p.storageGB === 0 ? "Unlimited storage" : `${p.storageGB} GB storage`} />
                  <PlanStat icon={<Upload style={{ width: 11, height: 11 }} />} label={p.uploadsPerMonth === -1 ? "Unlimited uploads" : `${p.uploadsPerMonth} uploads / mo`} />
                  <PlanStat icon={<RefreshCw style={{ width: 11, height: 11 }} />} label={p.regenerationsPerMonth === -1 ? "Unlimited regens" : `${p.regenerationsPerMonth} regens / mo`} />
                  <PlanStat icon={<Users style={{ width: 11, height: 11 }} />} label={p.members === -1 ? "Unlimited members" : `${p.members} members`} />
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-COL: PAYMENT FORM + ORDER SUMMARY */}
      <div className="split-3-2">
        {/* LEFT — Billing details + payment method */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">
                <Lock style={{ width: 14, height: 14, color: "var(--brand-text)" }} />
                Complete your {isCustomPriced ? "request" : "subscription"}
              </div>
              <div className="card-sub">
                {isCustomPriced
                  ? "Enterprise is custom-priced — we'll get back within 1 working day"
                  : "We auto-fill your account details. Card / UPI you enter yourself."}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "0 18px 18px", display: "grid", gap: 18 }}>
            {/* ── Account & billing details — auto-filled from sign-up
                + onboarding. Empty fields render as editable inputs so
                the user can complete them at checkout (instead of us
                fabricating a Vadodara Chem address that isn't theirs). ── */}
            <section>
              <SectionLabel>Account & billing</SectionLabel>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AutoOrInputField
                  label="Full name"
                  value={fullName}
                  placeholder="Your full name"
                  icon={<Sparkles style={{ width: 11, height: 11 }} />}
                  href="/onboarding"
                />
                <AutoOrInputField
                  label="Sign-in email"
                  value={email}
                  placeholder="you@company.com"
                  icon={<CreditCard style={{ width: 11, height: 11 }} />}
                  href="/profile"
                />
                <AutoOrInputField
                  label="Company"
                  value={companyName}
                  placeholder="Your company"
                  icon={<Building2 style={{ width: 11, height: 11 }} />}
                  href="/onboarding"
                />
                <AutoOrInputField
                  label="GSTIN"
                  value={gstin}
                  placeholder="22AAAAA0000A1Z5"
                  icon={<ShieldCheck style={{ width: 11, height: 11 }} />}
                  href="/onboarding"
                />
                <FormInput
                  full
                  label="Billing address"
                  value={billingAddress}
                  onChange={setBillingAddress}
                  placeholder="Street, city, state, PIN, country"
                />
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "var(--text-subtle, var(--muted))",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Info style={{ width: 11, height: 11 }} />
                Auto-filled from your sign-up. Missing fields can be completed in <Link href="/onboarding" style={{ color: "var(--brand-text)" }}>onboarding</Link> or <Link href="/profile" style={{ color: "var(--brand-text)" }}>profile</Link>.
              </div>
            </section>

            {!isCustomPriced && (
              <>
                {/* ── Payment method ── */}
                <section>
                  <SectionLabel>Payment method</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    <MethodTile
                      active={method === "card"}
                      onClick={() => setMethod("card")}
                      icon={<CreditCard style={{ width: 14, height: 14 }} />}
                      label="Card"
                      sub="Visa · MC · Rupay"
                    />
                    <MethodTile
                      active={method === "upi"}
                      onClick={() => setMethod("upi")}
                      icon={<Smartphone style={{ width: 14, height: 14 }} />}
                      label="UPI"
                      sub="GPay · PhonePe · BHIM"
                    />
                    <MethodTile
                      active={method === "netbanking"}
                      onClick={() => setMethod("netbanking")}
                      icon={<Wallet style={{ width: 14, height: 14 }} />}
                      label="NetBanking"
                      sub="50+ banks"
                    />
                    <MethodTile
                      active={method === "bank"}
                      onClick={() => setMethod("bank")}
                      icon={<Banknote style={{ width: 14, height: 14 }} />}
                      label="Bank transfer"
                      sub="NEFT / RTGS"
                    />
                  </div>
                </section>

                {/* ── Method-specific fields ── */}
                {method === "card" && (
                  <section>
                    <SectionLabel>Card details</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                      <FormInput
                        full
                        label="Card number"
                        value={cardNumber}
                        onChange={setCardNumber}
                        placeholder="•••• •••• •••• ••••"
                        autoComplete="cc-number"
                      />
                      <FormInput
                        full
                        label="Name on card"
                        value={cardName}
                        onChange={setCardName}
                        placeholder="As printed"
                        autoComplete="cc-name"
                      />
                      <FormInput
                        cols={2}
                        label="Expiry"
                        value={cardExp}
                        onChange={setCardExp}
                        placeholder="MM / YY"
                        autoComplete="cc-exp"
                      />
                      <FormInput
                        cols={2}
                        label="CVC"
                        value={cardCvc}
                        onChange={setCardCvc}
                        placeholder="•••"
                        autoComplete="cc-csc"
                        type="password"
                      />
                    </div>
                  </section>
                )}

                {method === "upi" && (
                  <section>
                    <SectionLabel>UPI</SectionLabel>
                    <FormInput
                      full
                      label="Your UPI ID"
                      value={upiId}
                      onChange={setUpiId}
                      placeholder="yourname@okhdfc"
                    />
                    <div
                      style={{
                        marginTop: 8,
                        padding: 12,
                        background: "var(--canvas-2)",
                        border: "1px dashed var(--border)",
                        borderRadius: 10,
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                      }}
                    >
                      You&rsquo;ll get a collect request in your UPI app — approve within 5 minutes.
                    </div>
                  </section>
                )}

                {method === "netbanking" && (
                  <section>
                    <SectionLabel>Net banking</SectionLabel>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--canvas-2)",
                        border: "1px dashed var(--border)",
                        borderRadius: 10,
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                      }}
                    >
                      Pick your bank on the next screen · HDFC · ICICI · Axis · Kotak · SBI + 45 others.
                    </div>
                  </section>
                )}

                {method === "bank" && (
                  <section>
                    <SectionLabel>Bank transfer</SectionLabel>
                    <div
                      style={{
                        padding: 12,
                        background: "var(--canvas-2)",
                        border: "1px dashed var(--border)",
                        borderRadius: 10,
                        fontSize: 12.5,
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      We&rsquo;ll email NEFT/RTGS details to <strong style={{ color: "var(--text)" }}>{email}</strong> with a 7-day completion window. Activation is automatic on confirmation.
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ── Submit ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-subtle, var(--muted))",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ShieldCheck style={{ width: 12, height: 12, color: "var(--brand-text)" }} />
                PCI-DSS-compliant gateway · TLS 1.3 · encrypted at rest. Cancel anytime from the profile page.
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                    Processing…
                  </>
                ) : isCustomPriced ? (
                  <>
                    <Sparkles style={{ width: 13, height: 13 }} />
                    Talk to sales
                  </>
                ) : (
                  <>
                    <Lock style={{ width: 13, height: 13 }} />
                    Pay ₹{fmt(total)}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT — Order summary */}
        <aside className="detail">
          <div>
            <div className="det-eyebrow">
              <span className="dot" />
              Order summary
            </div>
            <div className="det-title">{plan.name} · {billingCycle === "annual" ? "Annual" : "Monthly"}</div>
            <div className="det-meta">{plan.tagline}</div>
          </div>

          {/* Plan stats compact */}
          <div className="det-section">
            <div className="det-section-label">
              <ShieldCheck />
              What you get
            </div>
            <div
              style={{
                background: "var(--canvas-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 12,
                display: "grid",
                gap: 8,
              }}
            >
              {plan.features.map((f) => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5 }}>
                  <CheckCircle2 style={{ width: 12, height: 12, color: "var(--brand-text)", flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "var(--text)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdown */}
          {!isCustomPriced && (
            <div className="det-section">
              <div className="det-section-label">
                <CreditCard />
                Today&rsquo;s charge
              </div>
              <div
                style={{
                  background: "var(--canvas-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: 14,
                  display: "grid",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>
                    {plan.name} {billingCycle === "annual" ? "× 12 months (2 free)" : "monthly"}
                  </span>
                  <span className="mono">₹{fmt(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>GST · {GST_PCT}%</span>
                  <span className="mono">₹{fmt(gst)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
                    paddingTop: 8,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span>Total due today</span>
                  <span className="mono" style={{ color: "var(--brand-text)" }}>₹{fmt(total)}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-subtle, var(--muted))", marginTop: 2 }}>
                  Billed in INR · 14-day free trial on monthly plans · cancel anytime
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div
            style={{
              fontSize: 11.5,
              color: "var(--text-subtle, var(--muted))",
              lineHeight: 1.6,
            }}
          >
            By subscribing you agree to our{" "}
            <Link href="/terms" style={{ color: "var(--brand-text)" }}>Terms</Link> and{" "}
            <Link href="/privacy" style={{ color: "var(--brand-text)" }}>Privacy Policy</Link>. Invoices land in your sign-in email within 5 minutes of payment.
          </div>
        </aside>
      </div>
    </>
  );
}

/* ────────────────── small helpers ────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-subtle, var(--muted))",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function PlanStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <li
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        color: "var(--text-muted)",
      }}
    >
      <span style={{ color: "var(--text-subtle, var(--muted))" }}>{icon}</span>
      {label}
    </li>
  );
}

function MethodTile({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        padding: 12,
        borderRadius: 10,
        background: active ? "var(--brand-soft)" : "var(--card-2)",
        border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
        color: active ? "var(--brand-text)" : "var(--text)",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "all .12s",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        {icon}
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      </span>
      <span style={{ fontSize: 10.5, color: "var(--text-subtle, var(--muted))" }}>{sub}</span>
    </button>
  );
}

function ReadField({
  label,
  value,
  icon,
  full,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-subtle, var(--muted))",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: "var(--card-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* When the field has a real value, render as read-only (auto-filled
   from sign-up). When empty, render as a clear "missing" pill that
   links the user to the place where they can fill it in. We avoid
   inline-editing here so the user always sees what was captured at
   sign-up and where to change it — keeps the source of truth honest. */
function AutoOrInputField({
  label,
  value,
  placeholder,
  icon,
  href,
  full,
}: {
  label: string;
  value: string;
  placeholder?: string;
  icon?: React.ReactNode;
  href?: string;
  full?: boolean;
}) {
  const empty = !value.trim();
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-subtle, var(--muted))",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          padding: "10px 12px",
          background: empty ? "var(--canvas-2)" : "var(--card-2)",
          border: `1px ${empty ? "dashed" : "solid"} var(--border)`,
          borderRadius: 8,
          fontSize: 13,
          color: empty ? "var(--text-subtle, var(--muted))" : "var(--text)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontStyle: empty ? "italic" : "normal" }}>
          {empty ? placeholder || "Not yet provided" : value}
        </span>
        {empty && href && (
          <Link
            href={href}
            style={{
              fontSize: 11,
              color: "var(--brand-text)",
              textDecoration: "none",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Add →
          </Link>
        )}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  full,
  cols,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  full?: boolean;
  /** 2 = half-width across the 4-col grid */
  cols?: number;
}) {
  const span = full ? "1 / -1" : cols ? `span ${cols}` : undefined;
  return (
    <div style={{ gridColumn: span }}>
      <div
        style={{
          fontSize: 10.5,
          color: "var(--text-subtle, var(--muted))",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: "var(--canvas)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          fontSize: 13,
          color: "var(--text)",
          fontFamily: "inherit",
          outline: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--brand)";
          e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in oklab, var(--brand) 22%, transparent)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "var(--text-muted)" }}>Loading billing…</div>}>
      <BillingInner />
    </Suspense>
  );
}
