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
  Info,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/* ------------------------------------------------------------------ */
/*  Number formatting                                                  */
/* ------------------------------------------------------------------ */
function fmtCompactINR(value: number): { value: string; unit: string } {
  const abs = Math.abs(value);
  if (abs >= 1e7) return { value: `₹${(value / 1e7).toFixed(1)}`, unit: "Cr" };
  if (abs >= 1e5) return { value: `₹${(value / 1e5).toFixed(0)}`, unit: "L" };
  if (abs >= 1e3) return { value: `₹${(value / 1e3).toFixed(0)}`, unit: "K" };
  return { value: `₹${value.toFixed(0)}`, unit: "" };
}

/* ------------------------------------------------------------------ */
/*  Sample add-back schedule (used when no live add-backs are stored)  */
/* ------------------------------------------------------------------ */
type Addback = {
  label: string;
  category: string;
  source: string;
  amount: number;
  positive: boolean;
  pushback: "low" | "med" | "high";
  status: "approved" | "in-review" | "pending";
};

const SAMPLE_ADDBACKS: Addback[] = [
  { label: "One-time legal fees · IP dispute settlement", category: "Non-recurring", source: "L.412 · TB", amount: 320_000, positive: true, pushback: "low", status: "approved" },
  { label: "Director remuneration · above market", category: "Owner-related", source: "L.201 · TB", amount: 400_000, positive: true, pushback: "med", status: "approved" },
  { label: "Promoter HUF rent · Ind AS 24 related party", category: "Related party", source: "L.118 · TB", amount: 600_000, positive: true, pushback: "high", status: "pending" },
  { label: "Doubtful debts · suspense reversal", category: "Accounting", source: "L.207 · TB", amount: 280_000, positive: true, pushback: "high", status: "in-review" },
  { label: "Personal vehicle in company books", category: "Owner-related", source: "L.315 · FA", amount: 180_000, positive: true, pushback: "low", status: "approved" },
  { label: "Trade show · cancelled (one-off)", category: "Non-recurring", source: "L.508 · TB", amount: 120_000, positive: true, pushback: "low", status: "approved" },
  { label: "Warehouse lease · arms-length adj.", category: "Related party", source: "L.119 · TB", amount: -200_000, positive: false, pushback: "med", status: "approved" },
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
  { label: "Working capital", score: 8.4, note: "DSO trending down" },
  { label: "Customer concentration", score: 7.5, note: "Top 3 = 58%" },
  { label: "Compliance hygiene", score: 9.6, note: "GST + TDS clean" },
  { label: "Earnings adjustments", score: 9.5, note: "Documented · CA-signed" },
];

/* ------------------------------------------------------------------ */
/*  EBITDA waterfall — same as Dashboard but extended for all addbacks */
/* ------------------------------------------------------------------ */
function EBITDABridgeFull({ reported, addbacks, adjusted }: { reported: number; addbacks: Array<{ label: string; amount: number }>; adjusted: number }) {
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
  const barW = Math.min(64, colW * 0.55);

  let running = reported;
  const bars: Array<{ x: number; y: number; barH: number; label: string; value: number; tone: "neutral" | "positive" | "negative" | "result" }> = [];

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
              {b.tone === "negative" ? "−" : b.tone === "positive" ? "+" : ""}{v.value}{v.unit}
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

/* ------------------------------------------------------------------ */
/*  Main QoE page                                                      */
/* ------------------------------------------------------------------ */
export default function QoEPage() {
  const { lastResult } = useAnalysisStore();
  const { business } = useOnboardingStore();
  const [period, setPeriod] = useState<"quarter" | "fy" | "custom">("fy");

  const fy = "FY 2024-25";
  const companyName = business.companyName || "Vadodara Chem Pvt Ltd";

  const reported = 68_00_000;
  const totalAddbacks = SAMPLE_ADDBACKS.reduce((s, a) => s + a.amount, 0);
  const adjusted = reported + totalAddbacks;
  const upliftPct = (totalAddbacks / reported) * 100;

  const score = 9.0;
  const openRisks = RISK_FLAGS.length;

  const reportedFmt = fmtCompactINR(reported);
  const adjustedFmt = fmtCompactINR(adjusted);
  const netFmt = fmtCompactINR(totalAddbacks);

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-period">
          <button className={`hp-btn${period === "quarter" ? " active" : ""}`} onClick={() => setPeriod("quarter")}>
            Last quarter
          </button>
          <button className={`hp-btn${period === "fy" ? " active" : ""}`} onClick={() => setPeriod("fy")}>
            {fy}
          </button>
          <button className={`hp-btn${period === "custom" ? " active" : ""}`} onClick={() => setPeriod("custom")}>
            Custom
          </button>
        </div>

        <div className="hero-meta">
          <span className="dot" />
          <span>QoE v3 · last updated 14 min ago</span>
        </div>

        <h1 className="hero-title">
          Quality of Earnings · <span className="name">{score.toFixed(1)}/10</span>
        </h1>

        <div className="hero-sub">
          <span>
            Reported EBITDA {reportedFmt.value}{reportedFmt.unit} → Adjusted EBITDA {adjustedFmt.value}{adjustedFmt.unit} · {SAMPLE_ADDBACKS.length} add-backs · {openRisks} risk flags
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
            Add-backs ({SAMPLE_ADDBACKS.length})
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
            Reported EBITDA of <mark>{reportedFmt.value}{reportedFmt.unit}</mark> normalises to <mark>{adjustedFmt.value}{adjustedFmt.unit}</mark> after {SAMPLE_ADDBACKS.length} add-backs (net <mark>+{netFmt.value}{netFmt.unit}</mark>). Three add-backs totalling <span className="neg">₹12.8 L</span> carry buyer-pushback risk — primarily related-party rent under Ind AS 24. Customer concentration of <span className="neg">58%</span> on top 3 accounts is the single largest QoE flag. Recommend obtaining FMV rent certificate before sharing v4 with prospective buyers.
            <Link href="#schedule" className="synth-cta">
              Open add-back schedule <ArrowRight style={{ width: 11, height: 11 }} />
            </Link>
          </div>
          <div className="synth-meta">
            <span>Generated 14 min ago</span>
            <span className="sep">·</span>
            <span>Cited from 11 sources</span>
            <span className="sep">·</span>
            <span>Editable — not a signed opinion</span>
          </div>
        </div>
      </div>

      {/* ─── KPI ROW ─────────────────────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <TrendingUp style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Reported EBITDA</span>
          </div>
          <div className="kpi-value">
            <span>{reportedFmt.value}</span>
            <span className="unit">{reportedFmt.unit}</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">15.0% of revenue · books</span>
          </div>
        </div>

        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon">
              <TrendingUp style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Adjusted EBITDA</span>
          </div>
          <div className="kpi-value">
            <span>{adjustedFmt.value}</span>
            <span className="unit">{adjustedFmt.unit}</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up">
              <TrendingUp />
              +{upliftPct.toFixed(1)}%
            </span>
            <span className="meta">+{netFmt.value}{netFmt.unit} net add-backs</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Shield style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">QoE Score</span>
          </div>
          <div className="kpi-value">
            <span>{score.toFixed(1)}</span>
            <span className="unit">/10</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up">
              <TrendingUp />
              +0.4
            </span>
            <span className="meta">vs v2 · 8.6</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <AlertTriangle style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Risk flags</span>
          </div>
          <div className="kpi-value">
            <span>{openRisks}</span>
            <span className="unit">open</span>
          </div>
          <div className="kpi-foot">
            <span className="delta down">
              <TrendingDown />
              −2
            </span>
            <span className="meta">resolved this week</span>
          </div>
        </div>
      </div>

      {/* ─── ADD-BACK SCHEDULE ───────────────────────────────────── */}
      <div className="card act-card" id="schedule">
        <div className="act-head">
          <div>
            <div className="card-title">Add-back schedule · {fy}</div>
            <div className="card-sub">{SAMPLE_ADDBACKS.length} adjustments · sourced from TB · CA-reviewed · Ind AS aligned</div>
          </div>
          <div className="card-actions">
            <button className="chip">
              All add-backs
              <ChevronDown />
            </button>
            <button className="chip">
              <Download />
              Export PDF
            </button>
          </div>
        </div>

        <table className="activity">
          <thead>
            <tr>
              <th style={{ width: "32%" }}>Add-back</th>
              <th>Category</th>
              <th>Source</th>
              <th>Amount</th>
              <th>Pushback</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_ADDBACKS.map((a, i) => {
              const amt = fmtCompactINR(Math.abs(a.amount));
              const statusCls = a.status === "approved" ? "ok" : a.status === "in-review" ? "warn" : "pending";
              const statusLabel = a.status === "approved" ? "Approved" : a.status === "in-review" ? "In review" : "Needs FMV cert";
              const pushbackCls = a.pushback === "low" ? "ok" : a.pushback === "med" ? "warn" : "pending";
              const pushbackLabel = a.pushback === "low" ? "Low" : a.pushback === "med" ? "Med" : "High";
              return (
                <tr key={i}>
                  <td>{a.label}</td>
                  <td className="mono" style={{ color: "var(--text-muted)" }}>{a.category}</td>
                  <td className="mono" style={{ color: "var(--text-muted)" }}>{a.source}</td>
                  <td className="mono" style={{ color: a.positive ? undefined : "var(--negative)" }}>
                    {a.positive ? "+ " : "− "}{amt.value}{amt.unit}
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
              <td colSpan={3}>
                <strong>Net adjustments</strong>
              </td>
              <td className="mono">
                <strong>+ {netFmt.value}{netFmt.unit}</strong>
              </td>
              <td colSpan={2} style={{ color: "var(--text-muted)" }}>
                {SAMPLE_ADDBACKS.length} of {SAMPLE_ADDBACKS.length} reviewed · 3 pending sign-off
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── SPLIT: Risk flags + QoE score breakdown ─────────────── */}
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
                  <td style={{ color: "var(--text-muted)" }}>{f.reaction}</td>
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
          <div style={{ padding: "8px 4px 0", display: "grid", gap: 14 }}>
            {QOE_PILLARS.map((p, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{p.label}</span>
                  <span className="tnum" style={{ fontSize: 14, fontWeight: 600 }}>
                    {p.score.toFixed(1)}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>/10</span>
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
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{p.note}</div>
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
            <div className="card-sub">Walking from books to a sellable number</div>
          </div>
        </div>
        <div style={{ padding: "16px 4px" }}>
          <EBITDABridgeFull
            reported={reported}
            addbacks={SAMPLE_ADDBACKS.map((a) => ({ label: a.label, amount: a.amount }))}
            adjusted={adjusted}
          />
        </div>
      </div>

      {/* ─── DISCLAIMER ──────────────────────────────────────────── */}
      <div className="disclaimer">
        <span className="lbl">Advisory, not audit</span>
        <span>
          This QoE workbook supports management&rsquo;s diligence preparation for {companyName}. It is not a statutory audit, nor a substitute for a formal third-party Quality of Earnings engagement.
        </span>
      </div>
    </>
  );
}
