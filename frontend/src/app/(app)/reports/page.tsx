"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Share2,
  Eye,
  Calendar,
  CheckCircle2,
  Sparkles,
  Lock,
  Mail,
  Copy,
  FileBarChart,
  TrendingUp,
  Shield,
  GitBranch,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { EmptyState } from "@/components/EmptyState";

/* ════════════════════════════════════════════════════════════════════
   Reports · 2026-05-20 Wave 9.

   The original "Reports" nav item routed to /feedback (AI-feedback
   analytics) — a naming mismatch friend feedback specifically called
   out. We renamed the nav in Wave 1 ("Reports" → "AI Feedback") and
   left the actual Reports page as Phase 2 work. This file is that
   build.

   Scope: a catalogue of the workspace's generated reports + how to
   share / export each one. Demo workspace shows the full set of
   live deliverables; real accounts with no data see an empty state.

   Real PDF generation is window.print() for now — every report
   page is print-styled to render cleanly to PDF via browser. When
   we ship a real PDF service (puppeteer + branded headers / page
   numbers), only the download-handler changes; the report list
   stays the same.
   ════════════════════════════════════════════════════════════════════ */

interface ReportDef {
  key: string;
  title: string;
  description: string;
  icon: typeof FileText;
  href: string;
  category: "qoe" | "analysis" | "scenarios" | "industry" | "compliance";
  status: "ready" | "needs-data" | "in-build";
  refreshedAt?: string;
  cited?: number;
  fileSizeKb?: number;
}

const REPORTS: ReportDef[] = [
  {
    key: "qoe-workbook",
    title: "QoE Workbook · FY 2024-25",
    description: "Two-step SDE → QoE adjustment ladder · EBITDA bridge · risk flags · CA sign-off. The headline deliverable for diligence prep.",
    icon: Shield,
    href: "/qoe",
    category: "qoe",
    status: "ready",
    refreshedAt: "14 min ago",
    cited: 11,
    fileSizeKb: 480,
  },
  {
    key: "pnl-pack",
    title: "P&L Pack · FY 2024-25",
    description: "Hierarchical income statement · Schedule III / Ind AS classification · Variance waterfall · Top movers. Cited line-by-line.",
    icon: FileBarChart,
    href: "/analysis",
    category: "analysis",
    status: "ready",
    refreshedAt: "14 min ago",
    cited: 47,
    fileSizeKb: 320,
  },
  {
    key: "industry-benchmark",
    title: "Industry Benchmark Report",
    description: "Closest-size peer comparison + category benchmarks · 8 ratios vs peer median · QoE multiple band · sector-specific norms.",
    icon: TrendingUp,
    href: "/industries",
    category: "industry",
    status: "ready",
    refreshedAt: "Refreshed 18 Apr",
    cited: 9,
    fileSizeKb: 240,
  },
  {
    key: "scenarios-pack",
    title: "Scenarios · Bear / Base / Bull",
    description: "FY 25-26 projections · driver-by-driver sensitivity · top EBITDA-impact items ranked. For board reviews and PE pitches.",
    icon: GitBranch,
    href: "/scenarios",
    category: "scenarios",
    status: "ready",
    refreshedAt: "2 hr ago",
    cited: 7,
    fileSizeKb: 360,
  },
  {
    key: "diligence-pack",
    title: "Diligence Pack · investor-ready",
    description: "Bundle: QoE Workbook + P&L Pack + Cash Proof + Customer Concentration + Working Capital. The full pack a buyer's CA asks for.",
    icon: FileText,
    href: "/qoe",
    category: "qoe",
    status: "in-build",
    refreshedAt: "Ships Q3 2026",
    fileSizeKb: 1240,
  },
  {
    key: "compliance-pack",
    title: "Compliance · Ind AS + GST + TDS",
    description: "Ind AS alignment table · GSTR-2A reconciliation status · TDS deposit ledger · related-party disclosure summary.",
    icon: CheckCircle2,
    href: "/qoe",
    category: "compliance",
    status: "in-build",
    refreshedAt: "Ships Q3 2026",
  },
];

const CATEGORY_LABEL: Record<ReportDef["category"], string> = {
  qoe: "QoE",
  analysis: "Analysis",
  scenarios: "Scenarios",
  industry: "Benchmark",
  compliance: "Compliance",
};

export default function ReportsPage() {
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const { business } = useOnboardingStore();
  const isDemo = useIsDemoAccount();
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReportDef["category"]>("all");
  const [shareToast, setShareToast] = useState<string | null>(null);

  const companyName = business.companyName || "Vadodara Chem";

  // Empty-state gate · same pattern as the financial pages. Real
  // accounts with no data see a CTA pointing at /uploads; demo
  // bypasses (always sees the full catalogue).
  if (!isDemo && !lastResult) {
    return (
      <>
        <section className="hero">
          <div className="hero-meta">
            <span className="dot" />
            <span>Reports · awaiting your first upload</span>
          </div>
          <h1 className="hero-title">
            Board packs · diligence packs · <span className="name">PDF-ready</span>.
          </h1>
          <p className="hero-sub" style={{ display: "block", maxWidth: 600 }}>
            Every QoE workbook, P&amp;L pack, industry benchmark and scenario model gets a downloadable PDF and a shareable link. Upload your trial balance to generate the first set.
          </p>
        </section>
        <EmptyState
          title="Upload your TB to start generating reports"
          message="Reports here are auto-generated from your data — QoE workbook, P&L pack, industry benchmark, scenarios. Each one is CA-reviewed before it ships."
          needs={[
            "Trial Balance · unlocks P&L Pack + QoE Workbook + Scenarios",
            "Industry + revenue band in onboarding · unlocks Benchmark Report",
            "Audited financials (optional) · unlocks Compliance Pack",
          ]}
          primary={{ label: "Upload trial balance", href: "/uploads" }}
          secondary={{ label: "See the demo workspace", href: "/billing" }}
        />
      </>
    );
  }

  const filtered = useMemo(
    () => REPORTS.filter((r) => categoryFilter === "all" || r.category === categoryFilter),
    [categoryFilter]
  );

  const handleDownload = (report: ReportDef) => {
    // Real PDF generation is Q3 work (puppeteer / pdf-lib server-side).
    // For now we open the underlying page in a new tab and trigger
    // window.print() — every page is print-styled. Users save as PDF.
    const printWindow = window.open(report.href, "_blank");
    if (printWindow) {
      // Wait for the page to load, then trigger print. Same-origin so
      // we have access. Window.print blocks until user dismisses.
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          /* popup blocked or closed before timer fired — fine */
        }
      }, 1500);
    }
  };

  const handleShare = async (report: ReportDef) => {
    const url = `${window.location.origin}${report.href}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(`Link copied · ${report.title.split(" · ")[0]}`);
      setTimeout(() => setShareToast(null), 2400);
    } catch {
      // Older browsers without clipboard API
      setShareToast("Unable to copy · select the URL manually");
      setTimeout(() => setShareToast(null), 2400);
    }
  };

  const totalReports = filtered.filter((r) => r.status === "ready").length;
  const totalSizeKb = filtered
    .filter((r) => r.status === "ready" && r.fileSizeKb)
    .reduce((s, r) => s + (r.fileSizeKb ?? 0), 0);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Reports · {companyName} · ready to ship</span>
        </div>
        <h1 className="hero-title">
          Board packs · diligence packs · <span className="name">always current</span>.
        </h1>
        <p className="hero-sub" style={{ display: "block", maxWidth: 620 }}>
          Every report regenerates against your latest trial balance — no manual rework when a number changes. Download as PDF or share a live link with your CA or buyer.
        </p>
      </section>

      {/* KPI ROW */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><FileText style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Reports ready</span>
          </div>
          <div className="kpi-value">
            <span>{totalReports}</span>
            <span className="unit">of {REPORTS.length}</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">2 more ship Q3</span>
          </div>
        </div>
        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon"><Sparkles style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Total pack size</span>
          </div>
          <div className="kpi-value">
            <span>{(totalSizeKb / 1024).toFixed(1)}</span>
            <span className="unit">MB</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">PDF · uncompressed</span>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><CheckCircle2 style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">Last refresh</span>
          </div>
          <div className="kpi-value">
            <span>14</span>
            <span className="unit">min ago</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">All ready reports</span>
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon"><Lock style={{ width: 13, height: 13 }} /></div>
            <span className="kpi-label">CA sign-off</span>
          </div>
          <div className="kpi-value">
            <span>4</span>
            <span className="unit">of 4</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">Rajan Nagaraju · 18 Apr</span>
          </div>
        </div>
      </div>

      {/* FILTER PILLS */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "10px 14px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-subtle, var(--muted))",
            marginRight: 4,
            alignSelf: "center",
          }}
        >
          Filter
        </span>
        {(
          [
            { key: "all" as const, label: "All", count: REPORTS.length },
            { key: "qoe" as const, label: "QoE", count: REPORTS.filter((r) => r.category === "qoe").length },
            { key: "analysis" as const, label: "Analysis", count: REPORTS.filter((r) => r.category === "analysis").length },
            { key: "scenarios" as const, label: "Scenarios", count: REPORTS.filter((r) => r.category === "scenarios").length },
            { key: "industry" as const, label: "Benchmark", count: REPORTS.filter((r) => r.category === "industry").length },
            { key: "compliance" as const, label: "Compliance", count: REPORTS.filter((r) => r.category === "compliance").length },
          ] as const
        ).map((f) => {
          const active = categoryFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setCategoryFilter(f.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 500,
                background: active ? "var(--brand-soft)" : "var(--canvas-2)",
                border: `1px solid ${active ? "var(--brand)" : "var(--border)"}`,
                color: active ? "var(--brand-text)" : "var(--text)",
                borderRadius: 100,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {f.label}
              <span
                style={{
                  fontSize: 10.5,
                  opacity: 0.6,
                  background: active ? "var(--brand)" : "var(--card-2)",
                  color: active ? "#0A0B0D" : "var(--text-muted)",
                  padding: "0 6px",
                  borderRadius: 100,
                  fontWeight: 700,
                }}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* REPORT CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((r) => {
          const Icon = r.icon;
          const isReady = r.status === "ready";
          return (
            <div
              key={r.key}
              className="card"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                opacity: isReady ? 1 : 0.7,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: isReady ? "var(--brand-soft)" : "var(--card-2)",
                    border: `1px solid ${isReady ? "color-mix(in oklab, var(--brand) 30%, transparent)" : "var(--border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: isReady ? "var(--brand-text)" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: 16, height: 16 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                    <span
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text-subtle, var(--muted))",
                      }}
                    >
                      {CATEGORY_LABEL[r.category]}
                    </span>
                    {isReady ? (
                      <span
                        className="status-pill ok"
                        style={{ fontSize: 9, padding: "1px 6px" }}
                      >
                        <span className="sw" />
                        Ready
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--warning, #FBBF24)",
                          background: "color-mix(in oklab, var(--warning) 12%, transparent)",
                          padding: "1px 6px",
                          borderRadius: 100,
                        }}
                      >
                        Coming Q3
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", margin: 0 }}>
                    {r.title}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.55, margin: 0, flex: 1 }}>
                {r.description}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 11,
                  color: "var(--text-subtle, var(--muted))",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Calendar style={{ width: 11, height: 11 }} />
                  {r.refreshedAt}
                </span>
                {r.cited != null && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <CheckCircle2 style={{ width: 11, height: 11 }} />
                    Cited from {r.cited} sources
                  </span>
                )}
                {r.fileSizeKb && isReady && (
                  <span className="mono">
                    {r.fileSizeKb < 1024 ? `${r.fileSizeKb} KB` : `${(r.fileSizeKb / 1024).toFixed(1)} MB`}
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
                <Link
                  href={r.href}
                  className="btn"
                  style={{
                    flex: 1,
                    textDecoration: "none",
                    fontSize: 12,
                    padding: "7px 10px",
                    opacity: isReady ? 1 : 0.5,
                    pointerEvents: isReady ? "auto" : "none",
                  }}
                >
                  <Eye style={{ width: 12, height: 12 }} />
                  Preview
                </Link>
                <button
                  className="btn"
                  onClick={() => handleDownload(r)}
                  disabled={!isReady}
                  style={{
                    fontSize: 12,
                    padding: "7px 10px",
                    opacity: isReady ? 1 : 0.5,
                    cursor: isReady ? "pointer" : "not-allowed",
                  }}
                  title="Opens the report in a new tab and triggers Print → Save as PDF"
                >
                  <Download style={{ width: 12, height: 12 }} />
                  PDF
                </button>
                <button
                  className="btn"
                  onClick={() => handleShare(r)}
                  disabled={!isReady}
                  style={{
                    fontSize: 12,
                    padding: "7px 10px",
                    opacity: isReady ? 1 : 0.5,
                    cursor: isReady ? "pointer" : "not-allowed",
                  }}
                  title="Copy a shareable link"
                >
                  <Share2 style={{ width: 12, height: 12 }} />
                  Share
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HOW-TO STRIP */}
      <div
        style={{
          padding: 16,
          background: "var(--card-2)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        {[
          {
            icon: <Download style={{ width: 14, height: 14 }} />,
            title: "Download as PDF",
            body: "Opens the report in a new tab and triggers Print → Save as PDF. Every page is print-styled. Real server-side PDF (with branded headers, page numbers) ships Q3.",
          },
          {
            icon: <Copy style={{ width: 14, height: 14 }} />,
            title: "Share a live link",
            body: "Copies the report URL. Anyone signed into your workspace sees the latest version — no stale PDFs floating in inboxes. Cross-workspace sharing ships Q3.",
          },
          {
            icon: <Mail style={{ width: 14, height: 14 }} />,
            title: "Email to your CA",
            body: "Send the link from your own inbox — Subject auto-suggests 'CortexCFO · QoE Workbook · [Company] · FY 24-25'. We never email on your behalf.",
          },
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 7,
                background: "var(--brand-soft)",
                color: "var(--brand-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {tip.icon}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{tip.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{tip.body}</div>
            </div>
          </div>
        ))}
      </div>

      {/* DISCLAIMER */}
      <div className="disclaimer">
        <span className="lbl">Advisory, not audit</span>
        <span>
          Reports are auto-generated from your trial balance and CA-reviewed before they ship. They support diligence preparation — not a substitute for a statutory audit, a Big-4 QoE engagement, or formal legal/tax counsel.
        </span>
      </div>

      {/* Share toast */}
      {shareToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--brand)",
            color: "#0A0B0D",
            padding: "10px 16px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 style={{ width: 14, height: 14 }} />
          {shareToast}
        </div>
      )}
    </>
  );
}
