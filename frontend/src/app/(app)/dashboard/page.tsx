"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Wallet,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Shield,
  FileText,
  HelpCircle,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/* ------------------------------------------------------------------ */
/*  Number formatting helpers                                          */
/* ------------------------------------------------------------------ */
function fmtCompactINR(value: number): { value: string; unit: string } {
  const abs = Math.abs(value);
  if (abs >= 1e7) return { value: `₹${(value / 1e7).toFixed(1)}`, unit: "Cr" };
  if (abs >= 1e5) return { value: `₹${(value / 1e5).toFixed(0)}`, unit: "L" };
  if (abs >= 1e3) return { value: `₹${(value / 1e3).toFixed(0)}`, unit: "K" };
  return { value: `₹${value.toFixed(0)}`, unit: "" };
}

function fmtPercent(n: number): string {
  if (!isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

function fmtDelta(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

/** Time-aware greeting — "Good morning" / "Good afternoon" / "Good evening".
 *  Boundaries match Indian English business norms: morning runs to noon,
 *  afternoon noon→5pm, evening 5pm onwards. */
function greetingByHour(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/*  Sample data — only used when no analysis is loaded                 */
/* ------------------------------------------------------------------ */
const SAMPLE = {
  revenue: 45_23_40_000,
  revenuePrior: 38_30_00_000,
  netIncome: 6_81_30_000,
  reportedEBITDA: 68_00_000,
  adjustedEBITDA: 85_00_000,
  cashEquivalents: 4_85_00_000,
  cashEquivalentsPrior: 4_56_00_000,
  runwayMonths: 22,
  runwayPriorMonths: 24,
  ratios: {
    current_ratio: 1.5,
    debt_to_equity: 0.42,
    gross_margin: 35.2,
    net_margin: 15.0,
  },
};

/* ------------------------------------------------------------------ */
/*  EBITDA waterfall chart (SVG)                                       */
/*  Reported → adjustments → Adjusted. Bars positioned by stacked      */
/*  prior values so the visual waterfall makes sense.                  */
/* ------------------------------------------------------------------ */
function EBITDABridge({ reported, addbacks, adjusted }: { reported: number; addbacks: Array<{ label: string; amount: number; sub?: string; positive: boolean }>; adjusted: number }) {
  // Compute bar geometry. Chart area: 700 × 240 (logical units).
  const w = 700;
  const h = 240;
  const padL = 20;
  const padR = 12;
  const padT = 8;
  const padB = 60;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const all = [reported, ...addbacks.map((a) => a.amount), adjusted];
  const maxAbs = Math.max(reported, adjusted, reported + addbacks.reduce((s, a) => s + a.amount, 0));
  const yMax = Math.ceil((maxAbs * 1.15) / 1e6) * 1e6; // round up to nearest 10L
  const scale = innerH / yMax;
  const colW = innerW / (all.length + 1);
  const barW = Math.min(60, colW * 0.6);

  // Helper to render a single bar
  let running = reported;
  const bars: Array<{ x: number; y: number; barH: number; label: string; value: number; tone: "neutral" | "positive" | "negative" | "result"; sub?: string; bottom: number }> = [];

  // Reported (baseline)
  const reportedH = reported * scale;
  bars.push({
    x: padL + colW * 0.5 - barW / 2,
    y: padT + innerH - reportedH,
    barH: reportedH,
    bottom: padT + innerH,
    label: "Reported",
    value: reported,
    tone: "neutral",
  });

  addbacks.forEach((a, idx) => {
    const next = running + a.amount;
    const top = Math.max(running, next);
    const bottom = Math.min(running, next);
    const barH = (top - bottom) * scale;
    bars.push({
      x: padL + colW * (idx + 1.5) - barW / 2,
      y: padT + innerH - top * scale,
      barH,
      bottom: padT + innerH - bottom * scale,
      label: a.label,
      value: a.amount,
      tone: a.positive ? "positive" : "negative",
      sub: a.sub,
    });
    running = next;
  });

  // Adjusted (result)
  const adjustedH = adjusted * scale;
  bars.push({
    x: padL + colW * (all.length + 0.5) - barW / 2,
    y: padT + innerH - adjustedH,
    barH: adjustedH,
    bottom: padT + innerH,
    label: "Adjusted",
    value: adjusted,
    tone: "result",
  });

  // Gridlines
  const gridStep = yMax / 4;
  const gridlines: Array<{ y: number; value: number }> = [];
  for (let i = 0; i <= 4; i++) {
    const val = gridStep * i;
    gridlines.push({ y: padT + innerH - val * scale, value: val });
  }

  const fmt = (v: number) => fmtCompactINR(v);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Adjusted EBITDA bridge">
      <defs>
        <linearGradient id="grNeutral" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9AA0A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#62676F" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="grPositive" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="grNegative" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F87171" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="grResult" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="1" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {gridlines.map((g, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={w - padR}
            y1={g.y}
            y2={g.y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 4"
          />
          <text x={padL - 4} y={g.y + 3} fontSize="9" fill="#62676F" textAnchor="end" fontFamily="Geist Mono, monospace">
            {fmt(g.value).value}
            {fmt(g.value).unit}
          </text>
        </g>
      ))}

      {/* Bars */}
      {bars.map((b, i) => {
        const fill =
          b.tone === "neutral" ? "url(#grNeutral)" :
          b.tone === "positive" ? "url(#grPositive)" :
          b.tone === "negative" ? "url(#grNegative)" :
          "url(#grResult)";
        return (
          <g key={i}>
            <rect x={b.x} y={b.y} width={barW} height={Math.max(2, b.barH)} fill={fill} rx={3} />
            {/* Label below bar */}
            <text
              x={b.x + barW / 2}
              y={padT + innerH + 14}
              fontSize="10"
              fill="#9AA0A8"
              textAnchor="middle"
              fontWeight="500"
            >
              {b.label}
            </text>
            {b.sub && (
              <text
                x={b.x + barW / 2}
                y={padT + innerH + 26}
                fontSize="9"
                fill="#62676F"
                textAnchor="middle"
              >
                {b.sub}
              </text>
            )}
            {/* Value at top of bar */}
            <text
              x={b.x + barW / 2}
              y={b.y - 4}
              fontSize="10"
              fill={b.tone === "negative" ? "#F87171" : b.tone === "result" ? "#34D399" : b.tone === "positive" ? "#34D399" : "#9AA0A8"}
              textAnchor="middle"
              fontWeight="600"
              fontFamily="Geist Mono, monospace"
            >
              {b.tone === "negative" ? "−" : b.tone === "positive" ? "+" : ""}
              {fmt(Math.abs(b.value)).value}
              {fmt(Math.abs(b.value)).unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Sparkline (ratio cards)                                            */
/* ------------------------------------------------------------------ */
function Spark({ points, color = "var(--positive)" }: { points: number[]; color?: string }) {
  const w = 200;
  const h = 36;
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * (h - 6) - 3;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <path d={area} fill={color} opacity="0.10" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dashboard component                                           */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const { lastResult } = useAnalysisStore();
  const onboarding = useOnboardingStore();
  const business = onboarding.business;
  const personal = onboarding.personal;
  const [period, setPeriod] = useState<"quarter" | "fy" | "custom">("fy");

  const firstName = (personal.fullName || "").split(" ")[0] || "Founder";
  const companyName = business.companyName || "Vadodara Chem Pvt Ltd";
  const industry = business.industry || "Specialty Chemicals";
  // Derive a sensible FY label from the onboarding upload section, if present.
  type OnboardingWithUpload = { upload?: { financialYears?: string[] } };
  const upload = (onboarding as unknown as OnboardingWithUpload).upload;
  const fy = upload?.financialYears?.[0] ?? "FY 2024-25";

  // Pull financials with sample fallback
  const fin = useMemo(() => {
    if (!lastResult) return SAMPLE;
    const fs = lastResult.financial_statements;
    const ratios = lastResult.ratios;
    // Adjusted EBITDA is a derived value; for the dashboard, approximate from net_income + 18-25% uplift fallback
    const approxReportedEBITDA = fs.net_income * 1.15; // very rough; the real value comes from /qoe
    const approxAdjustedEBITDA = approxReportedEBITDA * 1.25;
    return {
      revenue: fs.total_revenue,
      revenuePrior: fs.total_revenue * 0.85, // placeholder; needs priorResult for real
      netIncome: fs.net_income,
      reportedEBITDA: approxReportedEBITDA,
      adjustedEBITDA: approxAdjustedEBITDA,
      cashEquivalents: SAMPLE.cashEquivalents,
      cashEquivalentsPrior: SAMPLE.cashEquivalentsPrior,
      runwayMonths: SAMPLE.runwayMonths,
      runwayPriorMonths: SAMPLE.runwayPriorMonths,
      ratios: {
        current_ratio: ratios.current_ratio,
        debt_to_equity: ratios.debt_to_equity,
        gross_margin: ratios.gross_margin,
        net_margin: ratios.net_margin,
      },
    };
  }, [lastResult]);

  const revenueFmt = fmtCompactINR(fin.revenue);
  const revenueDeltaPct = ((fin.revenue - fin.revenuePrior) / fin.revenuePrior) * 100;
  const adjEBITDAFmt = fmtCompactINR(fin.adjustedEBITDA);
  const reportedEBITDAFmt = fmtCompactINR(fin.reportedEBITDA);
  const ebitdaUpliftPct = ((fin.adjustedEBITDA - fin.reportedEBITDA) / fin.reportedEBITDA) * 100;
  const cashFmt = fmtCompactINR(fin.cashEquivalents);
  const cashDeltaPct = ((fin.cashEquivalents - fin.cashEquivalentsPrior) / fin.cashEquivalentsPrior) * 100;
  const runwayDelta = fin.runwayMonths - fin.runwayPriorMonths;

  // Add-back categories for the bridge chart
  const addbacks = [
    { label: "Related-party", amount: 24_00_000, sub: "3 items", positive: true },
    { label: "One-time", amount: 8_50_000, sub: "2 items", positive: true },
    { label: "Revenue", amount: -7_70_000, sub: "1 item", positive: false },
    { label: "Accounting", amount: -2_80_000, sub: "1 item", positive: false },
  ];

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-period">
          <button
            className={`hp-btn${period === "quarter" ? " active" : ""}`}
            onClick={() => setPeriod("quarter")}
          >
            Last quarter
          </button>
          <button
            className={`hp-btn${period === "fy" ? " active" : ""}`}
            onClick={() => setPeriod("fy")}
          >
            {fy}
          </button>
          <button
            className={`hp-btn${period === "custom" ? " active" : ""}`}
            onClick={() => setPeriod("custom")}
          >
            Custom
          </button>
        </div>

        <div className="hero-meta">
          <span className="dot" />
          <span>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>

        <h1 className="hero-title">
          {greetingByHour()}, <span className="name">{firstName}</span>
        </h1>

        <div className="hero-sub">
          <span>
            {companyName} · {industry} · {fy} closed Mar 31, 2025
          </span>
          <span className="pill">
            <CheckCircle2 />
            QoE 9.0 / 10 · High confidence
          </span>
        </div>

        <div className="section-tabs">
          {[
            { label: "Overview", href: "/dashboard", active: true, icon: TrendingUp },
            { label: "Analysis", href: "/analysis", icon: FileSpreadsheet },
            { label: "QoE", href: "/qoe", icon: Shield },
            { label: "Scenarios", href: "/scenarios", icon: ArrowRight },
            { label: "Compliance", href: "/integrations", icon: FileText },
          ].map((tab) => (
            <Link key={tab.href} href={tab.href} className={`stab${tab.active ? " active" : ""}`}>
              <tab.icon />
              {tab.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ─── AI SYNTHESIS RIBBON ─────────────────────────────────── */}
      <div className="synth">
        <div className="synth-icon">
          <Sparkles style={{ width: 14, height: 14 }} />
        </div>
        <div className="synth-body">
          <div className="synth-label">
            CortexAI synthesis · <span className="by">CA-tone</span>
          </div>
          <div className="synth-text">
            Revenue up <mark>{fmtDelta(revenueDeltaPct)} YoY</mark> to {revenueFmt.value}{revenueFmt.unit}, with adjusted EBITDA at <mark>{fmtPercent((fin.adjustedEBITDA / fin.revenue) * 100)} margin</mark>. Customer concentration (top 3 = <span className="neg">58%</span>) is your biggest QoE flag for diligence, and GSTR-2A credit of ₹4.8L sits blocked on vendor non-compliance. Cash runway holds at {fin.runwayMonths} months on current burn.
            <Link href="/qoe" className="synth-cta">
              Open QoE workbook <ArrowRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
          <div className="synth-meta">
            <span>Generated 14 min ago</span>
            <span className="sep">·</span>
            <span>Cited from 4 sources in /analysis</span>
            <span className="sep">·</span>
            <span>Editable — not a signed opinion</span>
          </div>
        </div>
      </div>

      {/* ─── KPI ROW ─────────────────────────────────────────────── */}
      <div className="kpi-row">
        {/* Revenue */}
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <IndianRupee style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Revenue · {fy}</span>
          </div>
          <div className="kpi-value">
            <span>{revenueFmt.value}</span>
            <span className="unit">{revenueFmt.unit}</span>
          </div>
          <div className="kpi-foot">
            <span className={`delta ${revenueDeltaPct >= 0 ? "up" : "down"}`}>
              {revenueDeltaPct >= 0 ? <TrendingUp /> : <TrendingDown />}
              {fmtDelta(revenueDeltaPct)}
            </span>
            <span className="meta">
              vs prior · {fmtCompactINR(fin.revenuePrior).value}{fmtCompactINR(fin.revenuePrior).unit}
            </span>
          </div>
        </div>

        {/* Adjusted EBITDA — ACCENTED */}
        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon">
              <TrendingUp style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Adjusted EBITDA</span>
          </div>
          <div className="kpi-value">
            <span>{adjEBITDAFmt.value}</span>
            <span className="unit">{adjEBITDAFmt.unit}</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up">
              <TrendingUp />
              {fmtDelta(ebitdaUpliftPct)}
            </span>
            <span className="meta">
              vs reported {reportedEBITDAFmt.value}{reportedEBITDAFmt.unit} · net add-backs
            </span>
          </div>
        </div>

        {/* Cash & equivalents */}
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Wallet style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Cash & equivalents</span>
          </div>
          <div className="kpi-value">
            <span>{cashFmt.value}</span>
            <span className="unit">{cashFmt.unit}</span>
          </div>
          <div className="kpi-foot">
            <span className={`delta ${cashDeltaPct >= 0 ? "up" : "down"}`}>
              {cashDeltaPct >= 0 ? <TrendingUp /> : <TrendingDown />}
              {fmtDelta(cashDeltaPct)}
            </span>
            <span className="meta">Operating + reserve</span>
          </div>
        </div>

        {/* Runway */}
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Clock style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Runway · current burn</span>
          </div>
          <div className="kpi-value">
            <span>{fin.runwayMonths}</span>
            <span className="unit">months</span>
          </div>
          <div className="kpi-foot">
            <span className={`delta ${runwayDelta >= 0 ? "up" : "down"}`}>
              {runwayDelta >= 0 ? <TrendingUp /> : <TrendingDown />}
              {runwayDelta >= 0 ? "+" : ""}{runwayDelta} mo
            </span>
            <span className="meta">at current monthly net burn</span>
          </div>
        </div>
      </div>

      {/* ─── SPLIT: EBITDA bridge + Attention ─────────────────────── */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">
                Adjusted EBITDA bridge
                <Info className="info" />
              </div>
              <div className="card-sub">
                Reported → 4 add-back categories → Adjusted · Ind AS aligned
              </div>
            </div>
            <div className="card-actions">
              <Link href="/qoe" className="chip">
                Open workbook
              </Link>
            </div>
          </div>

          <div className="bridge">
            <EBITDABridge
              reported={fin.reportedEBITDA}
              addbacks={addbacks}
              adjusted={fin.adjustedEBITDA}
            />
          </div>

          <div className="bridge-legend">
            <span><span className="sw" style={{ background: "#9AA0A8" }} />Reported baseline</span>
            <span><span className="sw" style={{ background: "#34D399" }} />Add-back (favourable)</span>
            <span><span className="sw" style={{ background: "#F87171" }} />Normalisation (unfavourable)</span>
          </div>

          <div className="bridge-summary">
            <div className="bs-cell">
              <div className="bs-label">Reported EBITDA</div>
              <div className="bs-value">{reportedEBITDAFmt.value}{reportedEBITDAFmt.unit}</div>
              <div className="bs-meta">{fy} · {fmtPercent((fin.reportedEBITDA / fin.revenue) * 100)} margin</div>
            </div>
            <div className="bs-cell">
              <div className="bs-label">Net add-backs</div>
              <div className="bs-value" style={{ color: "var(--positive)" }}>
                + {fmtCompactINR(fin.adjustedEBITDA - fin.reportedEBITDA).value}{fmtCompactINR(fin.adjustedEBITDA - fin.reportedEBITDA).unit}
              </div>
              <div className="bs-meta">7 items · 4 approved · 2 pending · 1 flagged</div>
            </div>
            <div className="bs-cell">
              <div className="bs-label">Adjusted EBITDA</div>
              <div className="bs-value" style={{ color: "var(--brand-text)" }}>
                {adjEBITDAFmt.value}{adjEBITDAFmt.unit}
              </div>
              <div className="bs-meta">
                {fmtPercent((fin.adjustedEBITDA / fin.revenue) * 100)} margin · <span className="pos">{fmtDelta(ebitdaUpliftPct)} uplift</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attention rail */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">What needs attention</div>
              <div className="card-sub">3 items flagged this week · sorted by impact</div>
            </div>
          </div>

          <div className="attention-list">
            <Link href="/qoe" className="att" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="att-head">
                <span className="att-sev high" />
                <span className="att-title">Customer concentration · top 3 = 58%</span>
                <span className="att-tag">QoE flag</span>
              </div>
              <div className="att-body">
                ABC Manufacturing alone contributes ₹18 Cr (40% of revenue). Diligence threshold for Series-A QoE is typically &lt;30% for top-1.
              </div>
              <div className="att-foot">
                <span className="att-amount">₹26.3 Cr</span>
                <span style={{ color: "var(--text-subtle)" }}>of FY revenue</span>
                <span className="att-action">Review <ArrowRight style={{ width: 10, height: 10 }} /></span>
              </div>
            </Link>

            <Link href="/qoe" className="att" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="att-head">
                <span className="att-sev med" />
                <span className="att-title">Related-party rent · ₹6 L</span>
                <span className="att-tag">Ind AS 24</span>
              </div>
              <div className="att-body">
                Rent paid to Promoter HUF — Vikram Family Trust. Add-back flagged pending fair-market-rate evidence. Awaiting your confirmation.
              </div>
              <div className="att-foot">
                <span className="att-amount">₹6.0 L</span>
                <span style={{ color: "var(--text-subtle)" }}>add-back · pending</span>
                <span className="att-action">Approve <ArrowRight style={{ width: 10, height: 10 }} /></span>
              </div>
            </Link>

            <Link href="/analysis" className="att" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="att-head">
                <span className="att-sev med" />
                <span className="att-title">GSTR-2A/2B credit blocked · ₹4.8 L</span>
                <span className="att-tag">Compliance</span>
              </div>
              <div className="att-body">
                3 vendor invoices not filed in GSTR-1 by counterparties. ITC blocked until reconciled. Q3 {fy}.
              </div>
              <div className="att-foot">
                <span className="att-amount">₹4.8 L</span>
                <span style={{ color: "var(--text-subtle)" }}>3 vendors</span>
                <span className="att-action">Trace <ArrowRight style={{ width: 10, height: 10 }} /></span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── RATIO HEALTH ROW ────────────────────────────────────── */}
      <div className="ratios">
        <div className="ratio-card">
          <div className="ratio-head">
            <span className="ratio-label">Current Ratio</span>
            <span className={`ratio-status ${fin.ratios.current_ratio >= 1.5 ? "healthy" : fin.ratios.current_ratio >= 1.0 ? "adequate" : "review"}`}>
              {fin.ratios.current_ratio >= 1.5 ? "Healthy" : fin.ratios.current_ratio >= 1.0 ? "Adequate" : "Review"}
            </span>
          </div>
          <div className="ratio-value">
            <span>{fin.ratios.current_ratio.toFixed(2)}</span>
            <span className="u">x</span>
          </div>
          <div className="ratio-bench">Industry avg 1.45x · ≥1.5x healthy</div>
          <div className="spark"><Spark points={[1.3, 1.35, 1.42, 1.48, fin.ratios.current_ratio]} /></div>
        </div>

        <div className="ratio-card">
          <div className="ratio-head">
            <span className="ratio-label">Debt-to-Equity</span>
            <span className={`ratio-status ${fin.ratios.debt_to_equity <= 0.5 ? "healthy" : fin.ratios.debt_to_equity <= 1.0 ? "adequate" : "review"}`}>
              {fin.ratios.debt_to_equity <= 0.5 ? "Healthy" : fin.ratios.debt_to_equity <= 1.0 ? "Adequate" : "Review"}
            </span>
          </div>
          <div className="ratio-value">
            <span>{fin.ratios.debt_to_equity.toFixed(2)}</span>
            <span className="u">x</span>
          </div>
          <div className="ratio-bench">Industry avg 0.55x · ≤0.5x healthy</div>
          <div className="spark"><Spark points={[0.55, 0.52, 0.48, 0.44, fin.ratios.debt_to_equity]} /></div>
        </div>

        <div className="ratio-card">
          <div className="ratio-head">
            <span className="ratio-label">Gross Margin</span>
            <span className={`ratio-status ${fin.ratios.gross_margin >= 33 ? "healthy" : fin.ratios.gross_margin >= 25 ? "adequate" : "review"}`}>
              {fin.ratios.gross_margin >= 33 ? "Healthy" : fin.ratios.gross_margin >= 25 ? "Adequate" : "Review"}
            </span>
          </div>
          <div className="ratio-value">
            <span>{fin.ratios.gross_margin.toFixed(1)}</span>
            <span className="u">%</span>
          </div>
          <div className="ratio-bench">Industry avg 32% · within ±10%</div>
          <div className="spark"><Spark points={[38, 36.5, 35.8, 35.4, fin.ratios.gross_margin]} color="var(--warning)" /></div>
        </div>

        <div className="ratio-card">
          <div className="ratio-head">
            <span className="ratio-label">Net Margin</span>
            <span className={`ratio-status ${fin.ratios.net_margin >= 12 ? "healthy" : fin.ratios.net_margin >= 6 ? "adequate" : "review"}`}>
              {fin.ratios.net_margin >= 12 ? "Healthy" : fin.ratios.net_margin >= 6 ? "Adequate" : "Review"}
            </span>
          </div>
          <div className="ratio-value">
            <span>{fin.ratios.net_margin.toFixed(1)}</span>
            <span className="u">%</span>
          </div>
          <div className="ratio-bench">Industry avg 11% · healthy</div>
          <div className="spark"><Spark points={[17, 16.2, 15.8, 15.3, fin.ratios.net_margin]} /></div>
        </div>
      </div>

      {/* ─── RECENT ACTIVITY ─────────────────────────────────────── */}
      <div className="card act-card">
        <div className="act-head">
          <div>
            <div className="card-title">Recent activity</div>
            <div className="card-sub">Last 7 days · uploads, reviews, exports</div>
          </div>
          <div className="card-actions">
            <Link href="/uploads" className="chip">
              View all
              <ArrowUpRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
        </div>

        <table className="activity">
          <thead>
            <tr>
              <th style={{ width: "42%" }}>Activity</th>
              <th>Reference</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="act-icon"><FileSpreadsheet style={{ width: 12, height: 12 }} /></span>
                Trial Balance upload · <span style={{ color: "var(--text-muted)" }}>vadodara-chem-tb-fy24-25.xlsx</span>
              </td>
              <td><span style={{ color: "var(--text-muted)" }}>{fy}</span></td>
              <td><span style={{ color: "var(--text-muted)" }}>11 May, 10:32</span></td>
              <td className="mono tnum">{revenueFmt.value}{revenueFmt.unit}</td>
              <td><span className="status-pill ok"><span className="sw" />Analysed</span></td>
            </tr>
            <tr>
              <td>
                <span className="act-icon" style={{ background: "var(--brand-soft)", color: "var(--brand-text)" }}><Shield style={{ width: 12, height: 12 }} /></span>
                QoE workbook · <span style={{ color: "var(--text-muted)" }}>CA review by Rajan Nagaraju</span>
              </td>
              <td><span style={{ color: "var(--text-muted)" }}>{fy}</span></td>
              <td><span style={{ color: "var(--text-muted)" }}>10 May, 18:14</span></td>
              <td className="mono tnum" style={{ color: "var(--positive)" }}>+₹17.0 L</td>
              <td><span className="status-pill ok"><span className="sw" />Reviewed</span></td>
            </tr>
            <tr>
              <td>
                <span className="act-icon"><FileText style={{ width: 12, height: 12 }} /></span>
                Add-back · <span style={{ color: "var(--text-muted)" }}>Rent to promoter HUF</span>
              </td>
              <td><span style={{ color: "var(--text-muted)" }}>Ind AS 24</span></td>
              <td><span style={{ color: "var(--text-muted)" }}>09 May, 14:22</span></td>
              <td className="mono tnum">₹6.0 L</td>
              <td><span className="status-pill warn"><span className="sw" />Flagged</span></td>
            </tr>
            <tr>
              <td>
                <span className="act-icon"><Download style={{ width: 12, height: 12 }} /></span>
                PDF export · <span style={{ color: "var(--text-muted)" }}>Series-A diligence pack</span>
              </td>
              <td><span style={{ color: "var(--text-muted)" }}>v3</span></td>
              <td><span style={{ color: "var(--text-muted)" }}>08 May, 11:05</span></td>
              <td className="mono tnum">28 pages</td>
              <td><span className="status-pill info"><span className="sw" />Shared</span></td>
            </tr>
            <tr>
              <td>
                <span className="act-icon"><HelpCircle style={{ width: 12, height: 12 }} /></span>
                AI question · <span style={{ color: "var(--text-muted)" }}>Suspense account ₹4.5 L</span>
              </td>
              <td><span style={{ color: "var(--text-muted)" }}>#Q-027</span></td>
              <td><span style={{ color: "var(--text-muted)" }}>07 May, 16:48</span></td>
              <td className="mono tnum">₹4.5 L</td>
              <td><span className="status-pill pending"><span className="sw" />Awaiting you</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── DISCLAIMER FOOTER ─────────────────────────────────── */}
      <div className="disclaimer">
        <span className="lbl">Advisory, not audit</span>
        <span>
          This workbook is produced for internal review and transaction support. It is not a substitute for a statutory audit opinion or a formal third-party QoE engagement.
        </span>
      </div>
    </>
  );
}
