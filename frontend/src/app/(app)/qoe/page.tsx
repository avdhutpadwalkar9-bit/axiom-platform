"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  Users,
  Banknote,
  Building2,
  Clock,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/* ════════════════════════════════════════════════════════════════════
   QoE Workbook · upgraded per US-diligence-report patterns we studied
   (Home Instead, Project Pacers, Guardian FBA, MyOwens, Project Axis,
   SpartanLTC). New on this page vs the prior version:

   1. Multi-period KPI strip · FY23 · FY24 · TTM Mar-26 · 3-yr CAGR
   2. Two-step adjustment ladder · Reported → SDE → QoE (the
      diligence standard: owner-discretionary adjustments come
      FIRST, buyer normalizations second)
   3. Cash Proof Analysis · reconciles reported revenue with bank
      receipts (US QoE staple, missing from Indian MSME engagements)
   4. Customer Concentration deep-dive · top-10 table with revenue
      share + contract type + churn risk
   5. Working capital · DSO / DIO / DPO / CCC + AR aging buckets
   6. GAAP / Ind AS Alignment table

   Existing sections kept: hero, synth ribbon, risk-flags heatmap,
   QoE pillars breakdown, EBITDA bridge waterfall.
   ════════════════════════════════════════════════════════════════════ */

// ──── Number formatting ────
function fmtCompactINR(value: number): { value: string; unit: string } {
  const abs = Math.abs(value);
  if (abs >= 1e7) return { value: `₹${(value / 1e7).toFixed(2)}`, unit: "Cr" };
  if (abs >= 1e5) return { value: `₹${(value / 1e5).toFixed(0)}`, unit: "L" };
  if (abs >= 1e3) return { value: `₹${(value / 1e3).toFixed(0)}`, unit: "K" };
  return { value: `₹${value.toFixed(0)}`, unit: "" };
}
function fmtCrLakh(v: number): string {
  const out = fmtCompactINR(v);
  return `${out.value}${out.unit}`;
}
function fmtPct(curr: number, prior: number): string {
  if (prior === 0) return "—";
  const d = ((curr - prior) / Math.abs(prior)) * 100;
  return `${d >= 0 ? "+" : ""}${d.toFixed(1)}%`;
}

/* ────────────────────────────────────────────────────────────────
   1 · Multi-period EBITDA (FY23 / FY24 / TTM Mar-26 / 3-yr CAGR)
   Sample Vadodara Chem numbers. Real-data wire-up uses lastResult.
   ──────────────────────────────────────────────────────────────── */
const PERIODS = [
  { key: "fy23", label: "FY 22-23", sub: "audited" },
  { key: "fy24", label: "FY 23-24", sub: "audited" },
  { key: "fy25", label: "FY 24-25", sub: "current" },
  { key: "ttm", label: "TTM Mar-26", sub: "rolling 12m" },
] as const;

interface PeriodRow {
  fy23: number;
  fy24: number;
  fy25: number;
  ttm: number;
}

// Headline numbers across periods
const REVENUE: PeriodRow = { fy23: 32_64_00_000, fy24: 38_32_30_000, fy25: 45_21_40_000, ttm: 47_10_00_000 };
const REPORTED_EBITDA: PeriodRow = { fy23: 41_20_000, fy24: 52_40_000, fy25: 68_00_000, ttm: 72_80_000 };
const SDE_ADJ: PeriodRow = { fy23: 7_40_000, fy24: 9_60_000, fy25: 14_20_000, ttm: 15_80_000 };
const QOE_ADJ: PeriodRow = { fy23: 1_20_000, fy24: 1_80_000, fy25: 2_80_000, ttm: 2_60_000 };
const ADJUSTED_EBITDA: PeriodRow = {
  fy23: REPORTED_EBITDA.fy23 + SDE_ADJ.fy23 + QOE_ADJ.fy23,
  fy24: REPORTED_EBITDA.fy24 + SDE_ADJ.fy24 + QOE_ADJ.fy24,
  fy25: REPORTED_EBITDA.fy25 + SDE_ADJ.fy25 + QOE_ADJ.fy25,
  ttm: REPORTED_EBITDA.ttm + SDE_ADJ.ttm + QOE_ADJ.ttm,
};

/* ────────────────────────────────────────────────────────────────
   2 · Two-step adjustment ladder
   ──────────────────────────────────────────────────────────────── */
type Pushback = "low" | "med" | "high";
type AdjStatus = "approved" | "in-review" | "pending";

interface Adjustment {
  label: string;
  rationale: string;
  source: string;
  fy23: number;
  fy24: number;
  fy25: number;
  ttm: number;
  pushback: Pushback;
  status: AdjStatus;
}

// Step 1 · SDE (Owner / Seller's Discretionary) — what a new owner could legitimately stop paying.
const SDE_ITEMS: Adjustment[] = [
  {
    label: "Directors' remuneration · above market",
    rationale: "Promoter pair drew ₹64 L vs FMV benchmark of ₹60 L for an MSME founder-pair this size.",
    source: "L.402 · TB",
    fy23: 2_80_000, fy24: 3_60_000, fy25: 4_00_000, ttm: 4_20_000,
    pushback: "med",
    status: "approved",
  },
  {
    label: "Promoter HUF rent · non-arm's-length",
    rationale: "Premise leased from promoter HUF at ₹96 L vs market rate of ₹80 L for comparable in same locality.",
    source: "L.501 · TB · Ind AS 24",
    fy23: 80_000, fy24: 1_20_000, fy25: 1_60_000, ttm: 1_80_000,
    pushback: "high",
    status: "pending",
  },
  {
    label: "Personal vehicle in company books",
    rationale: "Promoter's personal car run through company on fuel + insurance + driver salary.",
    source: "L.315 · FA register",
    fy23: 1_40_000, fy24: 1_60_000, fy25: 1_80_000, ttm: 1_90_000,
    pushback: "low",
    status: "approved",
  },
  {
    label: "Family member salaries · non-functional roles",
    rationale: "Two family members on payroll without operating responsibilities. Confirmed via HR letter.",
    source: "L.405 · Payroll",
    fy23: 1_40_000, fy24: 1_80_000, fy25: 4_20_000, ttm: 4_60_000,
    pushback: "med",
    status: "approved",
  },
  {
    label: "Owner travel · personal trips",
    rationale: "International travel booked on company card, identified as personal via expense audit.",
    source: "L.504 · Expense ledger",
    fy23: 1_00_000, fy24: 1_40_000, fy25: 2_60_000, ttm: 3_30_000,
    pushback: "low",
    status: "approved",
  },
];

// Step 2 · QoE (Diligence Adjustments) — buyer normalizations independent of owner identity.
const QOE_ITEMS: Adjustment[] = [
  {
    label: "One-time legal · IP dispute settlement",
    rationale: "Non-recurring trademark dispute settled in FY24. Engagement letter confirms one-off scope.",
    source: "L.412 · TB · letter",
    fy23: 0, fy24: 80_000, fy25: 1_40_000, ttm: 60_000,
    pushback: "low",
    status: "approved",
  },
  {
    label: "Trade show · cancelled (FY25 only)",
    rationale: "Specialty Chem India 2024 was cancelled mid-year; ₹1.2 L paid was non-recoverable.",
    source: "L.508 · TB",
    fy23: 0, fy24: 0, fy25: 1_20_000, ttm: 1_20_000,
    pushback: "low",
    status: "approved",
  },
  {
    label: "Doubtful debt provision · reversal",
    rationale: "₹2.8 L provision held against a single customer; full recovery received in May 25.",
    source: "L.207 · TB",
    fy23: 0, fy24: 0, fy25: 0, ttm: -80_000,
    pushback: "high",
    status: "in-review",
  },
  {
    label: "Warehouse lease · arms-length adjustment",
    rationale: "Second lease at ₹2 L below market — reverse the favourable variance for QoE view.",
    source: "L.119 · TB",
    fy23: -1_20_000, fy24: 1_00_000, fy25: 1_00_000, ttm: 1_00_000,
    pushback: "med",
    status: "approved",
  },
  {
    label: "GST input · blocked credits",
    rationale: "₹4.8 L in GSTR-2A mismatch — no recoverable input. Cleaner to expense rather than carry on BS.",
    source: "L.118 · GST Return",
    fy23: 0, fy24: 0, fy25: 0, ttm: 60_000,
    pushback: "med",
    status: "pending",
  },
];

/* ────────────────────────────────────────────────────────────────
   3 · Cash Proof Analysis
   Bank deposits should track reported revenue within a small band.
   ──────────────────────────────────────────────────────────────── */
interface CashProofRow {
  label: string;
  fy24: number;
  fy25: number;
  note?: string;
  highlight?: boolean;
}

const CASH_PROOF: CashProofRow[] = [
  { label: "Reported revenue", fy24: 38_32_30_000, fy25: 45_21_40_000 },
  { label: "Add: Opening receivables", fy24: 6_42_10_000, fy25: 7_18_40_000 },
  { label: "Less: Closing receivables", fy24: 7_18_40_000, fy25: 8_42_60_000 },
  { label: "Less: GST output", fy24: 6_89_80_000, fy25: 8_13_85_000 },
  { label: "Expected bank receipts", fy24: 30_66_20_000, fy25: 35_83_35_000, highlight: true },
  { label: "Actual bank receipts (cited)", fy24: 30_42_40_000, fy25: 35_61_40_000, note: "HDFC OD + ICICI CA · 12 months" },
  { label: "Reconciliation gap", fy24: -23_80_000, fy25: -21_95_000, note: "0.6% of revenue — within tolerance" },
];

/* ────────────────────────────────────────────────────────────────
   4 · Customer Concentration deep-dive
   ──────────────────────────────────────────────────────────────── */
interface CustomerRow {
  rank: number;
  name: string;
  revenue: number;
  share: number;
  contract: "annual" | "po" | "spot";
  vintage: string;
  churnRisk: "low" | "med" | "high";
}

const CUSTOMERS: CustomerRow[] = [
  { rank: 1, name: "Tata Chemicals Ltd · Pune", revenue: 9_84_20_000, share: 21.8, contract: "annual", vintage: "Jan 2020", churnRisk: "low" },
  { rank: 2, name: "Bharat Specialty Polymers · Vapi", revenue: 9_18_40_000, share: 20.3, contract: "annual", vintage: "Apr 2022", churnRisk: "med" },
  { rank: 3, name: "Asian Paints · Mumbai", revenue: 7_24_80_000, share: 16.0, contract: "po", vintage: "Jun 2021", churnRisk: "low" },
  { rank: 4, name: "Hindustan Industries · Mumbai", revenue: 4_82_60_000, share: 10.7, contract: "po", vintage: "Mar 2023", churnRisk: "med" },
  { rank: 5, name: "Pidilite Specialties · Mahad", revenue: 3_84_20_000, share: 8.5, contract: "annual", vintage: "Aug 2023", churnRisk: "low" },
  { rank: 6, name: "Vinati Organics · Mahad", revenue: 2_18_40_000, share: 4.8, contract: "annual", vintage: "Feb 2024", churnRisk: "high" },
  { rank: 7, name: "Galaxy Surfactants · Tarapur", revenue: 1_82_30_000, share: 4.0, contract: "spot", vintage: "Jul 2024", churnRisk: "med" },
  { rank: 8, name: "Aarti Industries · Vapi", revenue: 1_42_60_000, share: 3.2, contract: "po", vintage: "Nov 2023", churnRisk: "low" },
];

/* ────────────────────────────────────────────────────────────────
   5 · Working capital + AR Aging
   ──────────────────────────────────────────────────────────────── */
interface AgingBucket {
  label: string;
  amount: number;
  share: number;
  tone: "ok" | "warn" | "risk";
}

const AR_AGING: AgingBucket[] = [
  { label: "Current (0-30d)", amount: 5_82_00_000, share: 69.1, tone: "ok" },
  { label: "31-60 days", amount: 1_64_00_000, share: 19.5, tone: "ok" },
  { label: "61-90 days", amount: 56_00_000, share: 6.6, tone: "warn" },
  { label: "91-180 days", amount: 28_60_000, share: 3.4, tone: "warn" },
  { label: "Over 180d (suspect)", amount: 11_00_000, share: 1.3, tone: "risk" },
];

/* ────────────────────────────────────────────────────────────────
   6 · GAAP / Ind AS Alignment table
   ──────────────────────────────────────────────────────────────── */
interface GaapRow {
  standard: string;
  topic: string;
  observation: string;
  impact: string;
  severity: "high" | "med" | "low";
}

const GAAP_ROWS: GaapRow[] = [
  {
    standard: "Ind AS 24",
    topic: "Related-party disclosures",
    observation: "Three RP transactions (rent, HUF loan, family salaries) not aggregated in disclosure note.",
    impact: "Buyer counsel will request consolidated RP schedule.",
    severity: "high",
  },
  {
    standard: "Ind AS 115",
    topic: "Revenue from contracts",
    observation: "Performance obligations recognised at dispatch — broadly correct; need point-of-control evidence for 2 export shipments.",
    impact: "Possible ₹18 L revenue timing adjustment.",
    severity: "med",
  },
  {
    standard: "Ind AS 116",
    topic: "Leases",
    observation: "₹2 Cr in operating leases not capitalised on BS; ROU asset and lease liability missing.",
    impact: "Re-stated BS: leverage ratio up by 0.4x.",
    severity: "high",
  },
  {
    standard: "Ind AS 109",
    topic: "ECL on receivables",
    observation: "Provision matrix uses simplified 1% blanket. Buyer will want bucket-by-bucket model.",
    impact: "Provision likely understated by ₹6-9 L.",
    severity: "med",
  },
  {
    standard: "Ind AS 36",
    topic: "Impairment",
    observation: "Plant & Machinery in FY25 — no impairment test despite 6% capacity dip.",
    impact: "Documentation only; immaterial value.",
    severity: "low",
  },
];

const RISK_FLAGS = [
  { label: "Customer concentration · top 3 = 58%", severity: "high" as const, reaction: "Diligence haircut: 0.5x EBITDA" },
  { label: "Related-party rent · no FMV cert", severity: "high" as const, reaction: "Reverse ₹6 L add-back" },
  { label: "Suspense account · ₹4.5 L unreconciled", severity: "med" as const, reaction: "Request supporting docs" },
  { label: "GSTR-2A credit · ₹4.8 L blocked", severity: "med" as const, reaction: "Vendor follow-up required" },
];

const QOE_PILLARS = [
  { label: "Revenue quality", score: 9.2, note: "Recurring contracts · invoice-backed" },
  { label: "Margin sustainability", score: 8.8, note: "Mix shift improving" },
  { label: "Working capital", score: 8.4, note: "DSO trending down · CCC 38d" },
  { label: "Customer concentration", score: 7.5, note: "Top 3 = 58% · diligence flag" },
  { label: "Compliance hygiene", score: 9.6, note: "GST + TDS · CA-clean" },
  { label: "Earnings adjustments", score: 9.5, note: "Documented · two-step ladder" },
];

/* ────────────────────────────────────────────────────────────────
   EBITDA bridge waterfall
   ──────────────────────────────────────────────────────────────── */
function EBITDABridgeFull({
  reported,
  addbacks,
  adjusted,
}: {
  reported: number;
  addbacks: Array<{ label: string; amount: number }>;
  adjusted: number;
}) {
  const w = 920;
  const h = 240;
  const padL = 20;
  const padR = 12;
  const padT = 28;
  const padB = 30;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const maxAbs = Math.max(reported, adjusted, reported + addbacks.reduce((s, a) => s + Math.max(a.amount, 0), 0));
  const yMax = Math.ceil((maxAbs * 1.15) / 1e5) * 1e5;
  const scale = innerH / yMax;
  const colW = innerW / (addbacks.length + 2);
  const barW = Math.min(60, colW * 0.55);

  let running = reported;
  const bars: Array<{ x: number; y: number; barH: number; label: string; value: number; tone: "neutral" | "positive" | "negative" }> = [];

  bars.push({
    x: padL + colW * 0.5 - barW / 2,
    y: padT + innerH - reported * scale,
    barH: reported * scale,
    label: "Reported",
    value: reported,
    tone: "neutral",
  });

  addbacks.forEach((a, idx) => {
    const next = running + a.amount;
    const top = Math.max(running, next);
    const bottom = Math.min(running, next);
    const barH = Math.max(2, (top - bottom) * scale);
    bars.push({
      x: padL + colW * (idx + 1.5) - barW / 2,
      y: padT + innerH - top * scale,
      barH,
      label: a.label,
      value: a.amount,
      tone: a.amount >= 0 ? "positive" : "negative",
    });
    running = next;
  });

  bars.push({
    x: padL + colW * (addbacks.length + 1.5) - barW / 2,
    y: padT + innerH - adjusted * scale,
    barH: adjusted * scale,
    label: "Adjusted",
    value: adjusted,
    tone: "neutral",
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="EBITDA bridge waterfall">
      <defs>
        <linearGradient id="up2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="down2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F87171" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="base2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9AA0A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#62676F" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {bars.map((b, i) => {
        const fill = b.tone === "neutral" ? "url(#base2)" : b.tone === "positive" ? "url(#up2)" : "url(#down2)";
        const v = fmtCompactINR(Math.abs(b.value));
        return (
          <g key={i}>
            <rect x={b.x} y={b.y} width={barW} height={Math.max(2, b.barH)} fill={fill} rx={3} />
            <text x={b.x + barW / 2} y={b.y - 6} fontSize="10.5" fill="#F4F5F7" textAnchor="middle" fontFamily="Geist Mono, monospace">
              {b.tone === "negative" ? "−" : b.tone === "positive" ? "+" : ""}
              {v.value}
              {v.unit}
            </text>
            <text x={b.x + barW / 2} y={padT + innerH + 16} fontSize="10" fill="#9AA0A8" textAnchor="middle">
              {b.label.length > 18 ? b.label.slice(0, 16) + "…" : b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────────────────── */
export default function QoEPage() {
  // Keep these wired in so when a real analysis is loaded we can swap
  // in the live numbers. Sample fallback below preserves first-impression
  // quality of the workbook.
  useAnalysisStore();
  const { business } = useOnboardingStore();

  const [period, setPeriod] = useState<"fy23" | "fy24" | "fy25" | "ttm">("fy25");

  const companyName = business.companyName || "Vadodara Chem Pvt Ltd";

  // Lookup the currently-selected period's numbers
  const periodKey = period;
  const reported = REPORTED_EBITDA[periodKey];
  const sdeAdj = SDE_ITEMS.reduce((s, x) => s + x[periodKey], 0);
  const qoeAdj = QOE_ITEMS.reduce((s, x) => s + x[periodKey], 0);
  const sdeTotal = reported + sdeAdj;
  const adjusted = sdeTotal + qoeAdj;
  const revenue = REVENUE[periodKey];

  const reportedMargin = (reported / revenue) * 100;
  const adjustedMargin = (adjusted / revenue) * 100;
  const upliftPct = (((adjusted - reported) / reported) * 100);

  const score = 9.0;
  const openRisks = RISK_FLAGS.length;

  // 3-year revenue CAGR (FY23 → FY25)
  const revenueCagr = ((Math.pow(REVENUE.fy25 / REVENUE.fy23, 1 / 2) - 1) * 100).toFixed(1);

  // AR aging total
  const arTotal = AR_AGING.reduce((s, b) => s + b.amount, 0);
  const dso = (arTotal / revenue) * 365;

  // Cash conversion cycle inputs (sample)
  const dio = 42;
  const dpo = 51;
  const ccc = dso + dio - dpo;

  // Top-N concentration
  const top3Share = CUSTOMERS.slice(0, 3).reduce((s, c) => s + c.share, 0);
  const top10Share = CUSTOMERS.reduce((s, c) => s + c.share, 0);

  // Pre-computed values for bridge
  const bridgeItems = useMemo(() => {
    const all = [...SDE_ITEMS, ...QOE_ITEMS]
      .map((x) => ({ label: x.label, amount: x[periodKey] }))
      .filter((x) => Math.abs(x.amount) > 0);
    return all;
  }, [periodKey]);

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-period">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              className={`hp-btn${period === p.key ? " active" : ""}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="hero-meta">
          <span className="dot" />
          <span>QoE Workbook v4 · two-step ladder · last refreshed 14 min ago</span>
        </div>

        <h1 className="hero-title">
          Quality of Earnings · <span className="name">{score.toFixed(1)}/10</span>
        </h1>

        <div className="hero-sub">
          <span>
            Reported {fmtCrLakh(reported)} → SDE {fmtCrLakh(sdeTotal)} → Adjusted {fmtCrLakh(adjusted)} · {SDE_ITEMS.length + QOE_ITEMS.length} adjustments · {openRisks} risk flags
          </span>
          <span className="pill">
            <CheckCircle2 />
            High confidence
          </span>
        </div>

        <div className="section-tabs">
          <span className="stab active">
            <Shield />
            Workbook
          </span>
          <span className="stab">
            <CheckCircle2 />
            SDE ({SDE_ITEMS.length})
          </span>
          <span className="stab">
            <CheckCircle2 />
            QoE ({QOE_ITEMS.length})
          </span>
          <span className="stab">
            <AlertTriangle />
            Risk flags ({openRisks})
          </span>
          <span className="stab">
            <FileText />
            Diligence pack
          </span>
        </div>
      </section>

      {/* ─── AI SYNTHESIS RIBBON ─────────────────────────────────── */}
      <div className="synth">
        <div className="synth-icon">
          <Sparkles style={{ width: 14, height: 14 }} />
        </div>
        <div className="synth-body">
          <div className="synth-label">
            CortexAI assessment · <span className="by">CA-tone</span>
          </div>
          <div className="synth-text">
            Reported EBITDA of <mark>{fmtCrLakh(reported)}</mark> normalises to <mark>{fmtCrLakh(adjusted)}</mark> after a two-step ladder — owner adjustments add <mark>{fmtCrLakh(sdeAdj)}</mark> (SDE basis), then diligence normalizations add <mark>{fmtCrLakh(qoeAdj)}</mark>. The expansion is documented and CA-reviewed. Three add-backs totalling <span className="neg">₹{(SDE_ITEMS.filter(x => x.pushback === "high").reduce((s, x) => s + x[periodKey], 0) / 1e5).toFixed(1)} L</span> carry buyer-pushback risk (primarily Ind AS 24 RP rent). Customer concentration of <span className="neg">{top3Share.toFixed(0)}%</span> on top 3 accounts remains the single largest QoE flag. Cash proof gap stays within <mark>0.6%</mark> of revenue across both audited years.
            <Link href="#ladder" className="synth-cta">
              Open adjustment ladder <ArrowRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
          <div className="synth-meta">
            <span>Generated 14 min ago</span>
            <span className="sep">·</span>
            <span>Cited from 11 source documents</span>
            <span className="sep">·</span>
            <span>Editable — not a signed opinion</span>
          </div>
        </div>
      </div>

      {/* ─── MULTI-PERIOD HEADLINE TABLE ──────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Headline metrics · 4-period view</div>
            <div className="card-sub">Buyers want trend, not snapshot. Audited columns sourced from Schedule III.</div>
          </div>
          <div className="card-actions">
            <button className="chip">
              <Calendar />
              FY 22-23 → TTM
            </button>
            <button className="chip">
              <Download />
              Export
            </button>
          </div>
        </div>
        <table className="activity">
          <thead>
            <tr>
              <th>Metric</th>
              {PERIODS.map((p) => (
                <th key={p.key} className="r" style={{ textAlign: "right" }}>
                  {p.label}
                  <div style={{ fontSize: 9.5, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--text-subtle, var(--muted))", marginTop: 1 }}>
                    {p.sub}
                  </div>
                </th>
              ))}
              <th className="r" style={{ textAlign: "right" }}>3-yr CAGR</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Revenue</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REVENUE.fy23)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REVENUE.fy24)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REVENUE.fy25)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REVENUE.ttm)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{revenueCagr}%</td>
            </tr>
            <tr>
              <td>Reported EBITDA</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REPORTED_EBITDA.fy23)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REPORTED_EBITDA.fy24)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REPORTED_EBITDA.fy25)}</td>
              <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(REPORTED_EBITDA.ttm)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{(((REPORTED_EBITDA.fy25 / REPORTED_EBITDA.fy23) ** 0.5 - 1) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><span style={{ paddingLeft: 14, color: "var(--text-muted, var(--muted))" }}>+ SDE adjustments</span></td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{fmtCrLakh(SDE_ADJ.fy23)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{fmtCrLakh(SDE_ADJ.fy24)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{fmtCrLakh(SDE_ADJ.fy25)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{fmtCrLakh(SDE_ADJ.ttm)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>—</td>
            </tr>
            <tr style={{ background: "var(--card-2)" }}>
              <td><strong>SDE</strong> <span style={{ color: "var(--text-muted, var(--muted))" }}>(owner-normalised)</span></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(REPORTED_EBITDA.fy23 + SDE_ADJ.fy23)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(REPORTED_EBITDA.fy24 + SDE_ADJ.fy24)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(REPORTED_EBITDA.fy25 + SDE_ADJ.fy25)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(REPORTED_EBITDA.ttm + SDE_ADJ.ttm)}</strong></td>
              <td></td>
            </tr>
            <tr>
              <td><span style={{ paddingLeft: 14, color: "var(--text-muted, var(--muted))" }}>+ QoE adjustments</span></td>
              <td className="mono" style={{ textAlign: "right", color: QOE_ADJ.fy23 >= 0 ? "var(--positive)" : "var(--negative)" }}>{QOE_ADJ.fy23 >= 0 ? "+" : ""}{fmtCrLakh(QOE_ADJ.fy23)}</td>
              <td className="mono" style={{ textAlign: "right", color: QOE_ADJ.fy24 >= 0 ? "var(--positive)" : "var(--negative)" }}>{QOE_ADJ.fy24 >= 0 ? "+" : ""}{fmtCrLakh(QOE_ADJ.fy24)}</td>
              <td className="mono" style={{ textAlign: "right", color: QOE_ADJ.fy25 >= 0 ? "var(--positive)" : "var(--negative)" }}>{QOE_ADJ.fy25 >= 0 ? "+" : ""}{fmtCrLakh(QOE_ADJ.fy25)}</td>
              <td className="mono" style={{ textAlign: "right", color: QOE_ADJ.ttm >= 0 ? "var(--positive)" : "var(--negative)" }}>{QOE_ADJ.ttm >= 0 ? "+" : ""}{fmtCrLakh(QOE_ADJ.ttm)}</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>—</td>
            </tr>
            <tr style={{ background: "var(--brand-soft)" }}>
              <td><strong>Adjusted EBITDA</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(ADJUSTED_EBITDA.fy23)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(ADJUSTED_EBITDA.fy24)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(ADJUSTED_EBITDA.fy25)}</strong></td>
              <td className="mono" style={{ textAlign: "right" }}><strong>{fmtCrLakh(ADJUSTED_EBITDA.ttm)}</strong></td>
              <td className="mono" style={{ textAlign: "right", color: "var(--positive)" }}>+{(((ADJUSTED_EBITDA.fy25 / ADJUSTED_EBITDA.fy23) ** 0.5 - 1) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><span style={{ color: "var(--text-muted, var(--muted))" }}>Margin (adjusted)</span></td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>{((ADJUSTED_EBITDA.fy23 / REVENUE.fy23) * 100).toFixed(1)}%</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>{((ADJUSTED_EBITDA.fy24 / REVENUE.fy24) * 100).toFixed(1)}%</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>{((ADJUSTED_EBITDA.fy25 / REVENUE.fy25) * 100).toFixed(1)}%</td>
              <td className="mono" style={{ textAlign: "right", color: "var(--text-muted, var(--muted))" }}>{((ADJUSTED_EBITDA.ttm / REVENUE.ttm) * 100).toFixed(1)}%</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── KPI ROW (period-aware) ──────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><TrendingUp style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Reported EBITDA</span>
          </div>
          <div className="kpi-value">
            <span>{fmtCompactINR(reported).value}</span>
            <span className="unit">{fmtCompactINR(reported).unit}</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">{reportedMargin.toFixed(1)}% of revenue · books</span>
          </div>
        </div>

        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon"><TrendingUp style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Adjusted EBITDA</span>
          </div>
          <div className="kpi-value">
            <span>{fmtCompactINR(adjusted).value}</span>
            <span className="unit">{fmtCompactINR(adjusted).unit}</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up"><TrendingUp />+{upliftPct.toFixed(1)}%</span>
            <span className="meta">{adjustedMargin.toFixed(1)}% margin · two-step</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><Shield style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">QoE Score</span>
          </div>
          <div className="kpi-value">
            <span>{score.toFixed(1)}</span>
            <span className="unit">/10</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up"><TrendingUp />+0.4</span>
            <span className="meta">vs v3 · 8.6</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><AlertTriangle style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Risk flags</span>
          </div>
          <div className="kpi-value">
            <span>{openRisks}</span>
            <span className="unit">open</span>
          </div>
          <div className="kpi-foot">
            <span className="delta down"><TrendingDown />−2</span>
            <span className="meta">resolved this week</span>
          </div>
        </div>
      </div>

      {/* ─── STEP 1 · SDE LADDER ─────────────────────────────────── */}
      <div className="card act-card" id="ladder">
        <div className="act-head">
          <div>
            <div className="card-title">
              Step 1 · Reported → SDE
              <span className="pill" style={{ marginLeft: 10 }}>Owner-discretionary</span>
            </div>
            <div className="card-sub">
              What a new owner could legitimately stop paying. {SDE_ITEMS.length} adjustments · CA-reviewed · cited from TB
            </div>
          </div>
          <div className="card-actions">
            <button className="chip"><Download />Export schedule</button>
          </div>
        </div>
        <AdjustmentTable rows={SDE_ITEMS} periodKey={periodKey} />
      </div>

      {/* ─── STEP 2 · QoE LADDER ─────────────────────────────────── */}
      <div className="card act-card">
        <div className="act-head">
          <div>
            <div className="card-title">
              Step 2 · SDE → Adjusted EBITDA
              <span className="pill" style={{ marginLeft: 10, background: "rgba(96,165,250,0.15)", color: "var(--info)" }}>Diligence-driven</span>
            </div>
            <div className="card-sub">
              Buyer normalizations independent of who owns the business. {QOE_ITEMS.length} adjustments · Ind AS aligned
            </div>
          </div>
          <div className="card-actions">
            <button className="chip"><Download />Export schedule</button>
          </div>
        </div>
        <AdjustmentTable rows={QOE_ITEMS} periodKey={periodKey} />
      </div>

      {/* ─── CASH PROOF ANALYSIS ─────────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              Cash Proof Analysis
              <span className="pill" style={{ marginLeft: 10 }}>Diligence-grade</span>
            </div>
            <div className="card-sub">
              Reported revenue reconciled against actual bank receipts · gap shows real revenue quality
            </div>
          </div>
          <div className="card-actions">
            <button className="chip"><Banknote />HDFC + ICICI</button>
          </div>
        </div>
        <table className="activity">
          <thead>
            <tr>
              <th>Line item</th>
              <th className="r" style={{ textAlign: "right" }}>FY 23-24</th>
              <th className="r" style={{ textAlign: "right" }}>FY 24-25</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {CASH_PROOF.map((row, i) => {
              const isGap = row.label === "Reconciliation gap";
              const isExpected = row.highlight;
              return (
                <tr
                  key={i}
                  style={
                    isExpected
                      ? { background: "var(--card-2)" }
                      : isGap
                      ? { background: "var(--brand-soft)" }
                      : undefined
                  }
                >
                  <td>{isExpected || isGap ? <strong>{row.label}</strong> : row.label}</td>
                  <td className="mono" style={{ textAlign: "right", color: row.fy24 < 0 ? "var(--negative)" : undefined }}>
                    {row.fy24 < 0 ? "−" : ""}{fmtCrLakh(Math.abs(row.fy24))}
                  </td>
                  <td className="mono" style={{ textAlign: "right", color: row.fy25 < 0 ? "var(--negative)" : undefined }}>
                    {row.fy25 < 0 ? "−" : ""}{fmtCrLakh(Math.abs(row.fy25))}
                  </td>
                  <td style={{ color: "var(--text-muted, var(--muted))", fontSize: 12 }}>
                    {row.note ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── CUSTOMER CONCENTRATION ──────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              Customer concentration · top 10
              <span className="pill" style={{ marginLeft: 10, background: "rgba(248,113,113,0.10)", color: "var(--negative)" }}>
                Top 3 = {top3Share.toFixed(0)}%
              </span>
            </div>
            <div className="card-sub">
              Top {CUSTOMERS.length} customers = {top10Share.toFixed(1)}% of FY25 revenue · concentration is the largest valuation lever for buyers
            </div>
          </div>
          <div className="card-actions">
            <button className="chip"><Users />All customers</button>
          </div>
        </div>
        <table className="activity">
          <thead>
            <tr>
              <th style={{ width: "34px" }}>#</th>
              <th>Customer</th>
              <th className="r" style={{ textAlign: "right" }}>FY 24-25 revenue</th>
              <th className="r" style={{ textAlign: "right" }}>Share</th>
              <th>Contract</th>
              <th>Vintage</th>
              <th>Churn risk</th>
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c) => {
              const churnClass = c.churnRisk === "low" ? "ok" : c.churnRisk === "med" ? "warn" : "pending";
              const churnLabel = c.churnRisk === "low" ? "Low" : c.churnRisk === "med" ? "Med" : "High";
              const contractLabel = c.contract === "annual" ? "Annual MSA" : c.contract === "po" ? "Recurring POs" : "Spot orders";
              return (
                <tr key={c.rank}>
                  <td className="mono" style={{ color: "var(--text-subtle, var(--muted))" }}>{c.rank}</td>
                  <td>{c.name}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{fmtCrLakh(c.revenue)}</td>
                  <td className="mono" style={{ textAlign: "right" }}>{c.share.toFixed(1)}%</td>
                  <td style={{ color: "var(--text-muted, var(--muted))", fontSize: 12.5 }}>{contractLabel}</td>
                  <td className="mono" style={{ color: "var(--text-muted, var(--muted))", fontSize: 12 }}>{c.vintage}</td>
                  <td>
                    <span className={`status-pill ${churnClass}`}>
                      <span className="sw" />
                      {churnLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: "var(--brand-soft)" }}>
              <td></td>
              <td><strong>Top 10 total</strong></td>
              <td className="mono" style={{ textAlign: "right" }}>
                <strong>{fmtCrLakh(CUSTOMERS.reduce((s, c) => s + c.revenue, 0))}</strong>
              </td>
              <td className="mono" style={{ textAlign: "right" }}>
                <strong>{top10Share.toFixed(1)}%</strong>
              </td>
              <td colSpan={3} style={{ color: "var(--text-muted, var(--muted))" }}>
                Buyer haircut bench: top-3 &gt; 50% → 0.5x EBITDA discount applied · current = {top3Share.toFixed(0)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── WORKING CAPITAL + AR AGING ──────────────────────────── */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Working capital · cash conversion cycle</div>
              <div className="card-sub">DSO + DIO − DPO · normalized against 12-month trailing median</div>
            </div>
            <div className="card-actions">
              <button className="chip"><Clock />TTM Mar-26</button>
            </div>
          </div>
          <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "DSO", value: dso.toFixed(0), unit: "days", note: "vs peer median 55" },
              { label: "DIO", value: String(dio), unit: "days", note: "vs peer median 38" },
              { label: "DPO", value: String(dpo), unit: "days", note: "vs peer median 48" },
              { label: "CCC", value: ccc.toFixed(0), unit: "days", note: "Net cycle", accent: true },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  padding: 14,
                  background: m.accent ? "var(--brand-soft)" : "var(--canvas-2)",
                  border: "1px solid var(--border)",
                  borderColor: m.accent ? "color-mix(in oklab, var(--brand) 30%, transparent)" : undefined,
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 11, color: "var(--text-subtle, var(--muted))", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {m.label}
                </div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 4, color: m.accent ? "var(--brand-text)" : undefined }}>
                  {m.value}
                  <span style={{ fontSize: 12, color: "var(--text-muted, var(--muted))", fontWeight: 400, marginLeft: 4 }}>{m.unit}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-subtle, var(--muted))", marginTop: 6 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">AR aging buckets</div>
              <div className="card-sub">Total receivables {fmtCrLakh(arTotal)} · &gt;90d is the diligence flag</div>
            </div>
          </div>
          <div style={{ padding: "16px 18px", display: "grid", gap: 12 }}>
            {AR_AGING.map((b) => {
              const color =
                b.tone === "ok" ? "var(--positive)" : b.tone === "warn" ? "var(--warning)" : "var(--negative)";
              return (
                <div key={b.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>{b.label}</span>
                    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                      <span className="mono" style={{ fontSize: 12, color: "var(--text-muted, var(--muted))" }}>{fmtCrLakh(b.amount)}</span>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 600, color }}>{b.share.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--canvas-2)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${b.share}%`, background: color, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── GAAP / IND AS ALIGNMENT ─────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              GAAP / Ind AS alignment
              <span className="pill" style={{ marginLeft: 10 }}>Standards-grade</span>
            </div>
            <div className="card-sub">
              Where the books need a touch-up before a buyer&rsquo;s counsel reviews the audit trail
            </div>
          </div>
          <div className="card-actions">
            <button className="chip"><Building2 />Ind AS catalogue</button>
          </div>
        </div>
        <table className="activity">
          <thead>
            <tr>
              <th style={{ width: 110 }}>Standard</th>
              <th>Topic</th>
              <th>Observation</th>
              <th>Likely impact</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {GAAP_ROWS.map((r, i) => {
              const cls = r.severity === "high" ? "pending" : r.severity === "med" ? "warn" : "ok";
              const lbl = r.severity === "high" ? "High" : r.severity === "med" ? "Med" : "Low";
              return (
                <tr key={i}>
                  <td className="mono" style={{ color: "var(--brand-text)" }}>{r.standard}</td>
                  <td>{r.topic}</td>
                  <td style={{ color: "var(--text-muted, var(--muted))", fontSize: 12.5, lineHeight: 1.5, maxWidth: 360 }}>
                    {r.observation}
                  </td>
                  <td style={{ color: "var(--text-muted, var(--muted))", fontSize: 12.5 }}>{r.impact}</td>
                  <td>
                    <span className={`status-pill ${cls}`}>
                      <span className="sw" />
                      {lbl}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── SPLIT: Risk flags + QoE score breakdown ──────────────── */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Risk flags · severity heatmap</div>
              <div className="card-sub">{openRisks} open · 8 resolved this quarter</div>
            </div>
          </div>
          <table className="activity">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>Flag</th>
                <th>Severity</th>
                <th>Likely buyer reaction</th>
              </tr>
            </thead>
            <tbody>
              {RISK_FLAGS.map((f, i) => (
                <tr key={i}>
                  <td>{f.label}</td>
                  <td>
                    <span className={`status-pill ${f.severity === "high" ? "pending" : "warn"}`}>
                      <span className="sw" />
                      {f.severity === "high" ? "High" : "Med"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted, var(--muted))" }}>{f.reaction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">QoE score breakdown</div>
              <div className="card-sub">Six pillars · weighted</div>
            </div>
          </div>
          <div style={{ padding: "8px 18px 14px", display: "grid", gap: 14 }}>
            {QOE_PILLARS.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{p.label}</span>
                  <span className="mono" style={{ fontSize: 14, fontWeight: 600 }}>
                    {p.score.toFixed(1)}
                    <span style={{ color: "var(--text-muted, var(--muted))", fontWeight: 400 }}>/10</span>
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--card-2)", borderRadius: 3, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${p.score * 10}%`,
                      background: "linear-gradient(90deg, var(--brand) 0%, var(--positive) 100%)",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted, var(--muted))", marginTop: 4 }}>{p.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── EBITDA BRIDGE ───────────────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">EBITDA bridge · reported → adjusted</div>
            <div className="card-sub">{period === "fy25" ? "FY 24-25" : period === "ttm" ? "TTM Mar-26" : period === "fy24" ? "FY 23-24" : "FY 22-23"} · walking from books to a sellable number</div>
          </div>
        </div>
        <div style={{ padding: "16px 4px" }}>
          <EBITDABridgeFull reported={reported} addbacks={bridgeItems} adjusted={adjusted} />
        </div>
      </div>

      {/* ─── DISCLAIMER ──────────────────────────────────────────── */}
      <div className="disclaimer">
        <span className="lbl">Advisory, not audit</span>
        <span>
          This QoE workbook supports management&rsquo;s diligence preparation for {companyName}. It is not a statutory audit, nor a substitute for a formal third-party Quality of Earnings engagement. Variance from {fmtPct(adjusted, REPORTED_EBITDA[periodKey])} is the diligence uplift — your underwriters will haircut differently.
        </span>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   Sub-component — adjustment table (used twice, SDE + QoE)
   ──────────────────────────────────────────────────────────────── */
function AdjustmentTable({
  rows,
  periodKey,
}: {
  rows: Adjustment[];
  periodKey: "fy23" | "fy24" | "fy25" | "ttm";
}) {
  const total = rows.reduce((s, r) => s + r[periodKey], 0);

  return (
    <table className="activity">
      <thead>
        <tr>
          <th style={{ width: "30%" }}>Adjustment</th>
          <th>Source</th>
          <th className="r" style={{ textAlign: "right" }}>FY 23-24</th>
          <th className="r" style={{ textAlign: "right" }}>FY 24-25</th>
          <th className="r" style={{ textAlign: "right" }}>TTM</th>
          <th>Pushback</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const statusCls = r.status === "approved" ? "ok" : r.status === "in-review" ? "warn" : "pending";
          const statusLabel = r.status === "approved" ? "Approved" : r.status === "in-review" ? "In review" : "Needs sign-off";
          const pushbackCls = r.pushback === "low" ? "ok" : r.pushback === "med" ? "warn" : "pending";
          const pushbackLabel = r.pushback === "low" ? "Low" : r.pushback === "med" ? "Med" : "High";

          return (
            <tr key={i}>
              <td>
                <div style={{ fontWeight: 500 }}>{r.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted, var(--muted))", lineHeight: 1.4, marginTop: 2, maxWidth: 360 }}>
                  {r.rationale}
                </div>
              </td>
              <td className="mono" style={{ color: "var(--text-muted, var(--muted))", fontSize: 11.5 }}>{r.source}</td>
              <td className="mono" style={{ textAlign: "right", color: r.fy24 < 0 ? "var(--negative)" : undefined }}>
                {r.fy24 < 0 ? "−" : "+"}{fmtCrLakh(Math.abs(r.fy24))}
              </td>
              <td className="mono" style={{ textAlign: "right", color: r.fy25 < 0 ? "var(--negative)" : undefined }}>
                {r.fy25 < 0 ? "−" : "+"}{fmtCrLakh(Math.abs(r.fy25))}
              </td>
              <td className="mono" style={{ textAlign: "right", color: r.ttm < 0 ? "var(--negative)" : undefined }}>
                {r.ttm < 0 ? "−" : "+"}{fmtCrLakh(Math.abs(r.ttm))}
              </td>
              <td>
                <span className={`status-pill ${pushbackCls}`}>
                  <span className="sw" />
                  {pushbackLabel}
                </span>
              </td>
              <td>
                <span className={`status-pill ${statusCls}`}>
                  <span className="sw" />
                  {statusLabel}
                </span>
              </td>
            </tr>
          );
        })}
        <tr style={{ background: "var(--brand-soft)" }}>
          <td colSpan={2}><strong>Total · {periodKey === "fy25" ? "FY 24-25" : periodKey === "fy24" ? "FY 23-24" : periodKey === "ttm" ? "TTM Mar-26" : "FY 22-23"}</strong></td>
          <td className="mono" style={{ textAlign: "right", color: rows.reduce((s, r) => s + r.fy24, 0) >= 0 ? "var(--positive)" : "var(--negative)" }}>
            <strong>{rows.reduce((s, r) => s + r.fy24, 0) >= 0 ? "+" : "−"}{fmtCrLakh(Math.abs(rows.reduce((s, r) => s + r.fy24, 0)))}</strong>
          </td>
          <td className="mono" style={{ textAlign: "right", color: rows.reduce((s, r) => s + r.fy25, 0) >= 0 ? "var(--positive)" : "var(--negative)" }}>
            <strong>{rows.reduce((s, r) => s + r.fy25, 0) >= 0 ? "+" : "−"}{fmtCrLakh(Math.abs(rows.reduce((s, r) => s + r.fy25, 0)))}</strong>
          </td>
          <td className="mono" style={{ textAlign: "right", color: rows.reduce((s, r) => s + r.ttm, 0) >= 0 ? "var(--positive)" : "var(--negative)" }}>
            <strong>{rows.reduce((s, r) => s + r.ttm, 0) >= 0 ? "+" : "−"}{fmtCrLakh(Math.abs(rows.reduce((s, r) => s + r.ttm, 0)))}</strong>
          </td>
          <td colSpan={2} style={{ color: "var(--text-muted, var(--muted))" }}>
            Selected period: {total >= 0 ? "+" : "−"}{fmtCrLakh(Math.abs(total))}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
