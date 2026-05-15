"use client";

import { TrendingUp, BarChart3, Circle, Sparkles } from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { EmptyState } from "@/components/EmptyState";

interface RatioRow {
  label: string;
  your: number;
  industry: number;
  unit: string;
  /** Higher is better (true) or lower is better (false) */
  higherBetter: boolean;
  /** Absolute scale max for the bar */
  scaleMax: number;
}

const RATIOS: RatioRow[] = [
  { label: "Adj. EBITDA margin", your: 15.0, industry: 11.0, unit: "%", higherBetter: true, scaleMax: 20 },
  { label: "Gross margin", your: 42.5, industry: 38.0, unit: "%", higherBetter: true, scaleMax: 50 },
  { label: "Revenue growth (YoY)", your: 18.0, industry: 12.0, unit: "%", higherBetter: true, scaleMax: 25 },
  { label: "Return on capital", your: 22.0, industry: 17.5, unit: "%", higherBetter: true, scaleMax: 30 },
  { label: "DSO (days)", your: 68, industry: 52, unit: "", higherBetter: false, scaleMax: 100 },
  { label: "DPO (days)", your: 45, industry: 58, unit: "", higherBetter: true, scaleMax: 100 },
  { label: "Customer concentration top-3", your: 58, industry: 38, unit: "%", higherBetter: false, scaleMax: 80 },
  { label: "Working capital cycle", your: 38, industry: 28, unit: "d", higherBetter: false, scaleMax: 60 },
];

interface Peer {
  name: string;
  revenue: string;
  ebitdaPct: string;
  dso: number;
  qoe?: string;
  highlight?: boolean;
}

const PEERS: Peer[] = [
  { name: "Vadodara Chem (you)", revenue: "₹45.2 Cr", ebitdaPct: "15.0%", dso: 68, qoe: "9.0", highlight: true },
  { name: "Anupam Specialty", revenue: "₹118 Cr", ebitdaPct: "16.8%", dso: 55 },
  { name: "Pidilite Specialties", revenue: "₹342 Cr", ebitdaPct: "19.2%", dso: 48 },
  { name: "Aarti Surfactants", revenue: "₹278 Cr", ebitdaPct: "13.5%", dso: 61 },
  { name: "Vinati Organics", revenue: "₹195 Cr", ebitdaPct: "22.4%", dso: 52 },
  { name: "Camlin Fine", revenue: "₹160 Cr", ebitdaPct: "11.2%", dso: 58 },
  { name: "Galaxy Surfactants", revenue: "₹224 Cr", ebitdaPct: "12.8%", dso: 54 },
  { name: "Heubach Colorants", revenue: "₹98 Cr", ebitdaPct: "9.8%", dso: 64 },
];

interface Norm {
  label: string;
  severity: "high" | "med" | "low";
  detail: string;
}

const QOE_NORMS: Norm[] = [
  { label: "Concentration haircut", severity: "high", detail: "Buyers apply 0.5x EBITDA discount when top-3 exceeds 50%" },
  { label: "Inventory write-down", severity: "med", detail: "12-month aging norm — anything older flagged for write-down" },
  { label: "Related-party rent", severity: "med", detail: "FMV certificate must accompany add-back schedule" },
  { label: "Capex normalisation", severity: "low", detail: "5-year average plant capex is the typical normalisation base" },
  { label: "Working capital peg", severity: "med", detail: "Buyers peg WC at 38d trailing 12-month median in this band" },
];

export default function IndustriesPage() {
  const { business } = useOnboardingStore();
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const isDemo = useIsDemoAccount();
  const industry = business.industry || "Specialty Chemicals";
  const companyName = business.companyName || "Vadodara Chem";

  // Industry benchmarks need (a) the user's industry to pick the
  // right peer set and (b) the user's ratios to compare against
  // peer medians. Without either, we can't render anything useful.
  const hasIndustry = !!business.industry?.trim();
  if (!isDemo && (!lastResult || !hasIndustry)) {
    return (
      <>
        <section className="hero">
          <div className="hero-meta">
            <span className="dot" />
            <span>Industry benchmarks · awaiting peer-set anchor</span>
          </div>
          <h1 className="hero-title">
            Where you sit · <span className="name">across your industry</span>.
          </h1>
          <p className="hero-sub" style={{ display: "block", maxWidth: 580 }}>
            We benchmark every ratio against the 40-50 listed peers closest to your company — same revenue band, same product mix, same regional concentration. Two things needed before we can do that.
          </p>
        </section>
        <EmptyState
          title="Industry benchmarks need an industry + your ratios"
          message="Tell us your industry in onboarding so we can pick the right peer set; upload a TB so we have your ratios to compare against peer medians."
          needs={[
            !hasIndustry && "Complete onboarding · set your industry & turnover band",
            !lastResult && "Trial Balance · gives us your DSO, margins, leverage ratios",
            "Optional · audited financials for closest-peer matching",
          ].filter(Boolean) as string[]}
          primary={
            !hasIndustry
              ? { label: "Complete onboarding", href: "/onboarding" }
              : { label: "Upload trial balance", href: "/uploads" }
          }
          secondary={{ label: "See the demo workspace", href: "/billing" }}
        />
      </>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Industry benchmarks · {industry} · 47 listed peers · ₹100–500 Cr band</span>
        </div>
        <h1 className="hero-title">
          You sit in the <span className="name">top quartile</span>.
        </h1>
        <p className="hero-sub" style={{ display: "block", maxWidth: 580 }}>
          We benchmark every ratio against the 47 listed specialty-chemical peers closest to {companyName} — same revenue band, same product mix, same regional concentration.
        </p>
      </section>

      {/* KPIs */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><BarChart3 style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Peer set size</span>
          </div>
          <div className="kpi-value"><span>47</span></div>
          <div className="kpi-foot"><span className="meta">Listed · ₹100–500 Cr revenue band</span></div>
        </div>

        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon"><TrendingUp style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Overall percentile</span>
          </div>
          <div className="kpi-value">
            <span>72</span>
            <span className="unit">th</span>
          </div>
          <div className="kpi-foot">
            <span className="delta up"><TrendingUp />+8</span>
            <span className="meta">vs FY 23-24</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><TrendingUp style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">EBITDA margin rank</span>
          </div>
          <div className="kpi-value">
            <span>12</span>
            <span className="unit">/47</span>
          </div>
          <div className="kpi-foot"><span className="meta">Top quartile · 15.0%</span></div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><Circle style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">QoE multiple</span>
          </div>
          <div className="kpi-value">
            <span>7.8</span>
            <span className="unit">x</span>
          </div>
          <div className="kpi-foot"><span className="meta">Industry median EV/EBITDA</span></div>
        </div>
      </div>

      {/* Ratios vs medians */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Your ratios vs industry medians</div>
            <div className="card-sub">Bar shows your value · marker shows industry median · 47 peers</div>
          </div>
        </div>
        <div style={{ padding: "16px 4px", display: "grid", gap: 22 }}>
          {RATIOS.map((r) => {
            // Position of the user's value as % of scale
            const yourPct = Math.min(100, (r.your / r.scaleMax) * 100);
            // Median marker position
            const medianPct = Math.min(100, (r.industry / r.scaleMax) * 100);
            // Beating median?
            const beating = r.higherBetter ? r.your > r.industry : r.your < r.industry;
            const valueColor = beating ? "var(--positive)" : "var(--warning)";
            const barBg = beating
              ? "linear-gradient(90deg, var(--positive) 0%, color-mix(in oklab, var(--positive) 88%, transparent) 100%)"
              : "linear-gradient(90deg, var(--warning) 0%, color-mix(in oklab, var(--warning) 88%, transparent) 100%)";

            return (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 13 }}>{r.label}</span>
                  <div style={{ display: "flex", gap: 18, alignItems: "baseline" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Industry <span className="mono">{r.industry}{r.unit}</span>
                    </span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: valueColor }}>
                      {r.your}{r.unit}
                    </span>
                  </div>
                </div>
                <div style={{ position: "relative", height: 8, background: "var(--card-2)", borderRadius: 4 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${yourPct}%`,
                      background: barBg,
                      borderRadius: 4,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${medianPct}%`,
                      top: -4,
                      bottom: -4,
                      width: 2,
                      background: "var(--text)",
                      transform: "translateX(-1px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: `${medianPct}%`,
                      top: -14,
                      fontSize: 9,
                      color: "var(--text-muted)",
                      transform: "translateX(-50%)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    median
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split: Peers + QoE norms */}
      <div className="split">
        <div className="card act-card">
          <div className="act-head">
            <div>
              <div className="card-title">Top 8 peers · most comparable</div>
              <div className="card-sub">{industry} · ₹100–500 Cr · India listed</div>
            </div>
            <div className="card-actions">
              <button className="chip">View all 47</button>
            </div>
          </div>
          <table className="activity">
            <thead>
              <tr>
                <th>Company</th>
                <th>Revenue</th>
                <th>EBITDA %</th>
                <th>DSO</th>
                <th>QoE</th>
              </tr>
            </thead>
            <tbody>
              {PEERS.map((p, i) => (
                <tr key={i} style={p.highlight ? { background: "var(--brand-soft)" } : undefined}>
                  <td>{p.highlight ? <strong>{p.name}</strong> : p.name}</td>
                  <td className="mono">{p.revenue}</td>
                  <td className="mono">{p.ebitdaPct}</td>
                  <td className="mono">{p.dso}</td>
                  <td className="mono" style={{ color: p.qoe ? "var(--brand-text)" : "var(--text-muted)" }}>
                    {p.qoe ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Industry-specific QoE norms</div>
              <div className="card-sub">What buyers in chemicals look for</div>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 14 }}>
            {QOE_NORMS.map((n, i) => {
              const dotColor = n.severity === "high" ? "#F87171" : n.severity === "med" ? "#FBBF24" : "#A8B554";
              const sevLabel = n.severity === "high" ? "High" : n.severity === "med" ? "Med" : "Low";
              return (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: dotColor,
                      marginTop: 7,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{n.label}</span>
                      <span
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: dotColor,
                          fontWeight: 600,
                        }}
                      >
                        {sevLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.45 }}>
                      {n.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <span className="lbl">Sourced from</span>
        <span>
          Public filings · 47 listed peers in {industry.toLowerCase()} · ₹100–500 Cr revenue band · last refreshed 18 Apr 2026. Comparable doesn&rsquo;t mean comparable forever; we re-rank peers every quarter.
        </span>
      </div>
    </>
  );
}
