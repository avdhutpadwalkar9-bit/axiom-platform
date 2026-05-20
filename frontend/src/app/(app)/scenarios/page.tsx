"use client";

import { useMemo, useState } from "react";
import { Save, RotateCcw, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { EmptyState } from "@/components/EmptyState";

/* ════════════════════════════════════════════════════════════════════
   Scenarios · 2026-05-20 reworked per friend feedback.

   Previously: case cards switched the label but didn't change slider
   values; sliders were visual-only divs that didn't update the case
   cards on move. Both broken.

   Now: each case carries its own driver values. Clicking Bear/Base/
   Bull pre-populates the slider panel. Moving any slider updates the
   active case's headline numbers (Revenue · EBITDA · Margin · Cash)
   in real time via a small forward model.

   The forward model is intentionally simple — Revenue scales linearly
   with revenue-growth, EBITDA blends gross-margin and a headcount-
   driven opex penalty, Cash nets EBITDA against DSO drag and capex.
   This isn't a Tableau-grade financial planner; it's a vibes-correct
   live simulator that lets a founder feel the relationships without
   us shipping a real model engine (that's a Q3 build).
   ════════════════════════════════════════════════════════════════════ */

type CaseKey = "bear" | "base" | "bull";

interface CaseDrivers {
  revenueGrowth: number;  // %
  grossMargin: number;    // %
  volumeGrowth: number;   // %
  priceIncrease: number;  // %
  dsoDays: number;        // days
  headcountAdd: number;   // people
  capexL: number;         // ₹ Lakhs
}

// Pre-set driver values for each case · clicking the case card loads
// these into the slider panel. Anchored on Vadodara Chem FY 24-25
// run-rate of ₹45.2 Cr revenue · 18% adj EBITDA margin.
const CASE_PRESETS: Record<CaseKey, CaseDrivers> = {
  bear: { revenueGrowth: -15, grossMargin: 38, volumeGrowth: -10, priceIncrease: 0, dsoDays: 78, headcountAdd: 0, capexL: 60 },
  base: { revenueGrowth: 15, grossMargin: 42.5, volumeGrowth: 12, priceIncrease: 3, dsoDays: 55, headcountAdd: 6, capexL: 120 },
  bull: { revenueGrowth: 35, grossMargin: 46, volumeGrowth: 28, priceIncrease: 5, dsoDays: 50, headcountAdd: 12, capexL: 200 },
};

// Slider ranges · [min, max] for each driver. Bounds the user's
// stress-tests so the model stays in believable territory.
const DRIVER_RANGES: Record<keyof CaseDrivers, [number, number]> = {
  revenueGrowth: [-30, 50],
  grossMargin: [32, 50],
  volumeGrowth: [-30, 40],
  priceIncrease: [-5, 10],
  dsoDays: [35, 110],
  headcountAdd: [-5, 25],
  capexL: [0, 350],
};

// Forward model · drivers → headline KPIs.
const BASE_REVENUE_CR = 45.2;       // FY 24-25 actual
const BASE_OPEX_PCT = 24.5;          // ex-COGS opex as % of revenue
const HEADCOUNT_OPEX_PER_HEAD = 0.4; // % points added per net hire
const OPENING_CASH_CR = 4.85;        // FY 24-25 closing cash

function computeCase(d: CaseDrivers) {
  const revenue = BASE_REVENUE_CR * (1 + d.revenueGrowth / 100);
  // Opex penalty for hiring above baseline (6 hires at base).
  const opexPct = BASE_OPEX_PCT + Math.max(0, d.headcountAdd - 6) * HEADCOUNT_OPEX_PER_HEAD;
  const ebitdaMarginPct = d.grossMargin - opexPct;
  const ebitdaCr = revenue * (ebitdaMarginPct / 100);
  // DSO drag · every 10 extra days of DSO ≈ 2.7% of revenue locked in WC
  const wcDragCr = ((d.dsoDays - 45) / 10) * revenue * 0.027;
  const capexCr = d.capexL / 100;
  // Cash flow to closing = opening + EBITDA × 0.78 (tax/interest leakage) − WC drag − capex
  const closingCashCr = Math.max(0.2, OPENING_CASH_CR + ebitdaCr * 0.78 - wcDragCr - capexCr);
  return {
    revenue,
    ebitdaL: ebitdaCr * 100,
    marginPct: ebitdaMarginPct,
    cashCr: closingCashCr,
  };
}

function fmtCr(v: number) { return `₹${v.toFixed(1)} Cr`; }
function fmtL(v: number) { return `₹${Math.round(v)} L`; }
function fmtPct(v: number) { return `${v.toFixed(1)}%`; }
function fmtCashCr(v: number) { return `₹${v.toFixed(1)} Cr`; }

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

/* Per-case visual metadata · label + colour for the three case cards. */
const CASE_META: Record<CaseKey, { label: string; delta: string; deltaColor: string; dot: string; note: string }> = {
  bear: { label: "Bear case", delta: "−15%", deltaColor: "#F87171", dot: "#F87171", note: "Top customer loss + GST credit reversal" },
  base: { label: "Base case", delta: "+15%", deltaColor: "#A8B554", dot: "#A8B554", note: "Current run-rate · normalised" },
  bull: { label: "Bull case", delta: "+35%", deltaColor: "#34D399", dot: "#34D399", note: "Win 2 named accounts · mix shift" },
};

export default function ScenariosPage() {
  const { business } = useOnboardingStore();
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const isDemo = useIsDemoAccount();
  const [activeCase, setActiveCase] = useState<CaseKey>("base");
  // Per-case driver values · each case carries its own slider state.
  // Clicking a case card loads its preset; moving a slider only
  // mutates the ACTIVE case's drivers so Bear stays Bear.
  const [caseDrivers, setCaseDrivers] = useState<Record<CaseKey, CaseDrivers>>({
    bear: { ...CASE_PRESETS.bear },
    base: { ...CASE_PRESETS.base },
    bull: { ...CASE_PRESETS.bull },
  });
  const companyName = business.companyName || "Vadodara Chem";

  // Live-computed KPIs for each case · re-runs the forward model
  // every render. Cheap enough; ~6 multiplications per case.
  const cases = useMemo(() => ({
    bear: { ...CASE_META.bear, ...computeCase(caseDrivers.bear), key: "bear" as CaseKey },
    base: { ...CASE_META.base, ...computeCase(caseDrivers.base), key: "base" as CaseKey },
    bull: { ...CASE_META.bull, ...computeCase(caseDrivers.bull), key: "bull" as CaseKey },
  }), [caseDrivers]);

  // Slider mutation · only affects the active case.
  const updateDriver = (driver: keyof CaseDrivers, value: number) => {
    setCaseDrivers((prev) => ({
      ...prev,
      [activeCase]: { ...prev[activeCase], [driver]: value },
    }));
  };

  // Reset · snap the active case's drivers back to their preset.
  const resetActiveCase = () => {
    setCaseDrivers((prev) => ({
      ...prev,
      [activeCase]: { ...CASE_PRESETS[activeCase] },
    }));
  };

  const activeDrivers = caseDrivers[activeCase];

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
        {(["bear", "base", "bull"] as const).map((k) => {
          const c = cases[k];
          const active = activeCase === k;
          // Live-edit indicator · shows if the user has nudged this case
          // away from its preset (so they know which cases are vanilla
          // and which carry their own modifications).
          const isEdited =
            JSON.stringify(caseDrivers[k]) !== JSON.stringify(CASE_PRESETS[k]);
          const cardStyle: React.CSSProperties = active
            ? {
                padding: 20,
                background: "linear-gradient(180deg, var(--brand-soft) 0%, var(--card) 100%)",
                borderColor: "var(--brand)",
              }
            : { padding: 20 };
          return (
            <button
              key={k}
              onClick={() => setActiveCase(k)}
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
                {isEdited && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: "var(--brand-text)",
                      background: "var(--brand-soft)",
                      padding: "1px 5px",
                      borderRadius: 100,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    edited
                  </span>
                )}
                <span
                  className="mono"
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: c.deltaColor,
                    fontWeight: 600,
                  }}
                >
                  {c.revenue > BASE_REVENUE_CR ? "+" : ""}
                  {(((c.revenue - BASE_REVENUE_CR) / BASE_REVENUE_CR) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>
                {fmtCr(c.revenue)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Revenue · FY 25-26</div>
              <div style={{ height: 1, background: "var(--border)", margin: "14px 0" }} />
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { l: "Adj. EBITDA", v: fmtL(c.ebitdaL) },
                  { l: "Margin", v: fmtPct(c.marginPct) },
                  { l: "Closing cash", v: fmtCashCr(c.cashCr) },
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
                Driver controls · {CASE_META[activeCase].label.toLowerCase()}
              </div>
              <div className="card-sub">
                Move any slider — the {CASE_META[activeCase].label.split(" ")[0]} card recomputes live.
              </div>
            </div>
            <div className="card-actions">
              <button
                className="chip"
                onClick={resetActiveCase}
                title={`Snap ${CASE_META[activeCase].label} drivers back to preset`}
              >
                <RotateCcw style={{ width: 11, height: 11 }} />
                Reset {CASE_META[activeCase].label.split(" ")[0]}
              </button>
              <button
                className="chip"
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="Named/saved scenarios ship Q3 2026"
              >
                <Save style={{ width: 11, height: 11 }} />
                Save scenario
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 18 }}>
            {(
              [
                { key: "revenueGrowth", label: "Revenue growth", unit: "%", step: 1, color: "var(--brand)" },
                { key: "grossMargin", label: "Gross margin", unit: "%", step: 0.5, color: "var(--positive)" },
                { key: "volumeGrowth", label: "Volume growth", unit: "%", step: 1, color: "var(--brand)" },
                { key: "priceIncrease", label: "Price increase", unit: "%", step: 0.5, color: "var(--brand)" },
                { key: "dsoDays", label: "DSO days", unit: "d", step: 1, color: "var(--warning)" },
                { key: "headcountAdd", label: "Headcount add", unit: "", step: 1, color: "var(--text-muted)" },
                { key: "capexL", label: "Capex", unit: "L", step: 5, color: "var(--text-muted)" },
              ] as const
            ).map((d) => {
              const [min, max] = DRIVER_RANGES[d.key];
              const value = activeDrivers[d.key];
              const pct = ((value - min) / (max - min)) * 100;
              return (
                <div key={d.key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{d.label}</span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                      {d.key === "capexL"
                        ? `₹${value} L`
                        : d.unit === "%"
                        ? `${value > 0 && (d.key === "revenueGrowth" || d.key === "volumeGrowth" || d.key === "priceIncrease") ? "+" : ""}${value}%`
                        : `${value}${d.unit}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={d.step}
                    value={value}
                    onChange={(e) => updateDriver(d.key, parseFloat(e.target.value))}
                    style={{
                      width: "100%",
                      accentColor: d.color,
                      cursor: "pointer",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    <span>
                      {d.key === "capexL" ? `₹${min} L` : `${min}${d.unit}`}
                    </span>
                    <span style={{ opacity: 0.4 }}>{pct.toFixed(0)}%</span>
                    <span>
                      {d.key === "capexL" ? `₹${max} L` : `${max}${d.unit}`}
                    </span>
                  </div>
                </div>
              );
            })}
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
