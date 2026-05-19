"use client";

import { useState } from "react";
import { Save, RotateCcw, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { EmptyState } from "@/components/EmptyState";

interface CaseCard {
  key: "bear" | "base" | "bull";
  label: string;
  delta: string;
  deltaColor: string;
  revenue: string;
  ebitda: string;
  margin: string;
  cash: string;
  note: string;
  dot: string;
}

const CASES: CaseCard[] = [
  { key: "bear", label: "Bear case", delta: "−15%", deltaColor: "#F87171", revenue: "₹38.5 Cr", ebitda: "₹52 L", margin: "13.5%", cash: "₹2.8 Cr", note: "Top customer loss + GST credit reversal", dot: "#F87171" },
  { key: "base", label: "Base case", delta: "+15%", deltaColor: "#A8B554", revenue: "₹52.0 Cr", ebitda: "₹94 L", margin: "18.1%", cash: "₹5.4 Cr", note: "Current run-rate · normalised", dot: "#A8B554" },
  { key: "bull", label: "Bull case", delta: "+35%", deltaColor: "#34D399", revenue: "₹61.2 Cr", ebitda: "₹118 L", margin: "19.3%", cash: "₹7.2 Cr", note: "Win 2 named accounts · mix shift", dot: "#34D399" },
];

interface Driver {
  label: string;
  value: string;
  position: number;
  color: string;
  fromLabel: string;
  toLabel: string;
}

const DRIVERS: Driver[] = [
  { label: "Revenue growth", value: "+15%", position: 55, color: "var(--brand)", fromLabel: "from 0%", toLabel: "to +35%" },
  { label: "Gross margin", value: "42.5%", position: 65, color: "var(--positive)", fromLabel: "from 38%", toLabel: "to 48%" },
  { label: "Volume growth", value: "+12%", position: 40, color: "var(--brand)", fromLabel: "from 0%", toLabel: "to +30%" },
  { label: "Price increase", value: "+3%", position: 35, color: "var(--brand)", fromLabel: "from 0%", toLabel: "to +8%" },
  { label: "DSO days", value: "55", position: 35, color: "var(--warning)", fromLabel: "from 45", toLabel: "to 90" },
  { label: "Headcount add", value: "+6", position: 30, color: "var(--text-muted)", fromLabel: "from 0", toLabel: "to +20" },
  { label: "Capex", value: "₹1.2 Cr", position: 40, color: "var(--text-muted)", fromLabel: "from 0", toLabel: "to ₹3 Cr" },
];

interface Sensitivity {
  label: string;
  impact: string;
  severity: "high" | "med" | "low";
  barWidth: number;
}

const SENSITIVITIES: Sensitivity[] = [
  { label: "Top-3 customer retention", impact: "±₹42 L", severity: "high", barWidth: 100 },
  { label: "Volume", impact: "±₹24 L", severity: "high", barWidth: 57 },
  { label: "Price", impact: "±₹18 L", severity: "med", barWidth: 43 },
  { label: "Gross margin (input cost)", impact: "±₹15 L", severity: "med", barWidth: 36 },
  { label: "DSO · working capital", impact: "±₹9 L", severity: "low", barWidth: 21 },
  { label: "Opex efficiency", impact: "±₹7 L", severity: "low", barWidth: 17 },
];

const sevColor = (s: Sensitivity["severity"]) => (s === "high" ? "#F87171" : s === "med" ? "#FBBF24" : "#A8B554");
const sevLabel = (s: Sensitivity["severity"]) => (s === "high" ? "High" : s === "med" ? "Med" : "Low");

export default function ScenariosPage() {
  const { business } = useOnboardingStore();
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const isDemo = useIsDemoAccount();
  const [activeCase, setActiveCase] = useState<"bear" | "base" | "bull">("base");
  const companyName = business.companyName || "Vadodara Chem";

  // Gate TIGHTENED 2026-05-20. Previously: empty state only when
  // BOTH lastResult missing AND not demo — meaning a real account
  // with a TB uploaded would see Vadodara Chem hardcoded Bear/Base/
  // Bull. That's the same Vadodara-bleed bug we fixed on QoE.
  //
  // New rule: only the demo account sees populated scenarios. Real
  // accounts (regardless of whether they have a TB) get the empty
  // state until we build scenario modelling against user data
  // (Phase 2 — needs the analyzer to compute revenue/margin/cash
  // sensitivities from the user's own historical TBs).
  if (!isDemo) {
    const hasTbButNoScenariosYet = !!lastResult;
    return (
      <>
        <section className="hero">
          <div className="hero-meta">
            <span className="dot" />
            <span>
              Scenarios · {hasTbButNoScenariosYet ? "Coming Q3 for your own data" : "awaiting your run-rate"}
            </span>
          </div>
          <h1 className="hero-title">
            Model the <span className="name">future</span> · {hasTbButNoScenariosYet ? "for your own books" : "once we have your present"}.
          </h1>
          <p className="hero-sub" style={{ display: "block", maxWidth: 580 }}>
            {hasTbButNoScenariosYet
              ? "Your trial balance is loaded — Analysis is live. Scenario modelling against your own run-rate (Bear / Base / Bull, driver sliders, sensitivity) ships Q3 2026. Want to see what it looks like? Sign into the demo workspace."
              : "Bear, Base and Bull cases are stress-tested against your own run-rate — revenue, EBITDA, working capital. Upload the trial balance first and we'll anchor every assumption against it."}
          </p>
        </section>
        <EmptyState
          title={hasTbButNoScenariosYet ? "Scenarios on your data · Coming Q3 2026" : "Upload your TB to unlock scenario modelling"}
          message={
            hasTbButNoScenariosYet
              ? "The scenario engine against real customer data ships Q3 2026. Until then, the live preview lives on the demo workspace."
              : "The three pre-built cases (Bear · Base · Bull) are anchored on your actual numbers — current revenue, margins, customer mix, working capital. Until that base is in, the scenarios are just abstractions."
          }
          needs={[
            "Trial Balance · anchors the Base case",
            "Optional · prior 2-3 year TBs to pick up trend",
            "Optional · sales register · enables top-customer churn stress test",
          ]}
          primary={{ label: "Upload trial balance", href: "/uploads" }}
          secondary={{ label: "See the demo workspace", href: "/billing" }}
        />
      </>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Scenarios · FY 25-26 · cited from FY 24-25 books</span>
        </div>
        <h1 className="hero-title">
          Model what your <span className="name">future</span> looks like.
        </h1>
        <p className="hero-sub" style={{ display: "block", maxWidth: 580 }}>
          Three pre-built cases anchored on the {companyName} run-rate, plus a driver panel that lets you stress every assumption. Every output is cited back to the underlying line item.
        </p>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {CASES.map((c) => {
          const active = activeCase === c.key;
          const cardStyle: React.CSSProperties = active
            ? {
                padding: 20,
                background: "linear-gradient(180deg, var(--brand-soft) 0%, var(--card) 100%)",
                borderColor: "var(--brand)",
              }
            : { padding: 20 };
          return (
            <button
              key={c.key}
              onClick={() => setActiveCase(c.key)}
              className="card"
              style={{ ...cardStyle, textAlign: "left", cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot }} />
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {c.label}
                </div>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: c.deltaColor, fontWeight: 600 }}>
                  {c.delta}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>
                {c.revenue}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Revenue · FY 25-26</div>
              <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { l: "Adj. EBITDA", v: c.ebitda },
                  { l: "Margin", v: c.margin },
                  { l: "Closing cash", v: c.cash },
                ].map((row) => (
                  <div key={row.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>{row.l}</span>
                    <span className="mono" style={{ fontWeight: 500 }}>{row.v}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--text-muted)",
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px dashed var(--border)",
                  fontStyle: "italic",
                }}
              >
                {c.note}
              </div>
            </button>
          );
        })}
      </section>

      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">
                Driver controls · {CASES.find((c) => c.key === activeCase)?.label.toLowerCase()}
              </div>
              <div className="card-sub">Edit any value · model recalculates · cited from books</div>
            </div>
            <div className="card-actions">
              {/* Save / Reset disabled · feedback 2026-05-20 — were
                  non-functional. Scenario persistence ships Phase 2. */}
              <button
                className="chip"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="Scenario reset ships Q3 2026"
              >
                <RotateCcw style={{ width: 11, height: 11 }} />
                Reset to books
              </button>
              <button
                className="chip"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="Saved scenarios ship Q3 2026"
              >
                <Save style={{ width: 11, height: 11 }} />
                Save scenario
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 18 }}>
            {DRIVERS.map((d) => (
              <div key={d.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{d.label}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</span>
                </div>
                <div style={{ position: "relative", height: 6, background: "var(--card-2)", borderRadius: 3 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${d.position}%`,
                      background: d.color,
                      borderRadius: 3,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${d.position}%`,
                      top: -4,
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: d.color,
                      transform: "translateX(-7px)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                  <span>{d.fromLabel}</span>
                  <span>{d.toLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Sensitivity · EBITDA impact</div>
              <div className="card-sub">±10% move in each driver · ranked by leverage</div>
            </div>
          </div>
          <div style={{ padding: "12px 4px", display: "grid", gap: 12 }}>
            {SENSITIVITIES.map((s) => {
              const c = sevColor(s.severity);
              return (
                <div key={s.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{s.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: c }}>
                        {s.impact}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: "var(--text-muted)",
                          width: 32,
                          textAlign: "right",
                        }}
                      >
                        {sevLabel(s.severity)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 5, background: "var(--card-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.barWidth}%`, background: c, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="synth">
        <div className="synth-icon">
          <Sparkles style={{ width: 14, height: 14 }} />
        </div>
        <div className="synth-body">
          <div className="synth-label">
            CortexAI scenario read · <span className="by">CA-tone</span>
          </div>
          <div className="synth-text">
            The single biggest lever on next-year EBITDA is <mark>top-3 customer retention</mark> — a ±10% move there is worth ±₹42 L versus your current adjusted EBITDA of ₹94 L. Volume and pricing follow next. Drop top-3 concentration below 45% before the next raise and you de-risk roughly half the bear case.
          </div>
        </div>
      </div>
    </>
  );
}
