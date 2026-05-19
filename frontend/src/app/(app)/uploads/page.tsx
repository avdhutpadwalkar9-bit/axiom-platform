"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Eye,
  MoreVertical,
  Filter,
  Trash2,
  Lock,
  Cloud,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

type UploadStatus = "ok-linked" | "ok-locked" | "ok-reconciled" | "warn-untagged" | "warn-action" | "processing";
type FileType = "csv" | "xlsx" | "pdf" | "zip";

interface SampleUpload {
  type: FileType;
  name: string;
  meta: string;
  category: "TB" | "STMT" | "BUNDLE";
  progress: number;
  status: UploadStatus;
  statusLabel: string;
  hash: string;
}

const SAMPLE_UPLOADS: SampleUpload[] = [
  { type: "xlsx", name: "Trial Balance · FY 25-26 Q1.xlsx", meta: "2.4 MB · uploaded by VS · you · 12 min ago", category: "TB", progress: 82, status: "processing", statusLabel: "Mapping accounts…", hash: "81835" },
  { type: "csv", name: "GSTR-3B · April 2026.csv", meta: "340 KB · uploaded by GST Portal · auto · 18 min ago", category: "TB", progress: 100, status: "ok-linked", statusLabel: "Linked", hash: "248ed" },
  { type: "pdf", name: "HDFC Bank · March 2026.pdf", meta: "1.8 MB · uploaded by HDFC sync · 1 hr ago", category: "STMT", progress: 100, status: "ok-reconciled", statusLabel: "Reconciled", hash: "945f" },
  { type: "xlsx", name: "TB · FY 24-25 Audited.xlsx", meta: "3.1 MB · uploaded by RN · CA · 5 hr ago", category: "TB", progress: 100, status: "ok-locked", statusLabel: "Locked", hash: "71f82" },
  { type: "zip", name: "Vendor contracts · FY 24-25.zip", meta: "24 MB · uploaded by PM · controller · Yesterday", category: "BUNDLE", progress: 100, status: "warn-untagged", statusLabel: "3 untagged", hash: "4a12e" },
  { type: "pdf", name: "GST Notice · ASMT-10 (₹4.2L).pdf", meta: "512 KB · uploaded by VS · you · 2 days ago", category: "STMT", progress: 100, status: "warn-action", statusLabel: "Action req", hash: "49318" },
  { type: "csv", name: "Inventory snapshot · 31-Mar.csv", meta: "188 KB · uploaded by QuickBooks · 3 days ago", category: "TB", progress: 100, status: "ok-linked", statusLabel: "Linked", hash: "698a2" },
  { type: "xlsx", name: "Payroll register · March.xlsx", meta: "740 KB · uploaded by PM · controller · 3 days ago", category: "TB", progress: 100, status: "ok-linked", statusLabel: "Linked", hash: "1b660" },
];

function statusPillClass(s: UploadStatus): string {
  if (s.startsWith("ok")) return "ok";
  if (s === "processing") return "info";
  return "warn";
}

export default function UploadsPage() {
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const analysisCompany = useAnalysisStore((s) => s.companyName);
  const analysisDate = useAnalysisStore((s) => s.analysisDate);
  const { business } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState<"all" | "tb" | "bank" | "gst" | "contracts">("all");
  // activeSource state removed 2026-05-20 — its UI consumers (source filter
  // tabs) were dead controls. Re-add when real per-source filtering ships.

  const companyName = business.companyName || "Vadodara Chem";
  const hasRealUpload = !!lastResult;
  // We don't have a real upload history in the store today — there's only
  // the latest result. If one exists, prepend it to the sample list so the
  // user sees their real upload at the top; otherwise show pure samples.
  const realRow: SampleUpload | null = hasRealUpload
    ? {
        type: "xlsx",
        name: `${analysisCompany || companyName} · Trial Balance`,
        meta: `Uploaded · ${analysisDate ? new Date(analysisDate).toLocaleDateString("en-IN") : "recently"}`,
        category: "TB",
        progress: 100,
        status: "ok-linked",
        statusLabel: "Analysed",
        hash: "live",
      }
    : null;
  const items: SampleUpload[] = realRow ? [realRow, ...SAMPLE_UPLOADS.slice(0, 7)] : SAMPLE_UPLOADS;

  return (
    <>
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Uploads · {companyName} · 21 months of data</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>•</span>
          <span>Last sync · 12 min ago</span>
        </div>

        <h1 className="hero-title">
          Bring your <span className="name">books</span> to Cortex.
        </h1>

        <p className="hero-sub" style={{ display: "block", maxWidth: 560 }}>
          Drop a trial balance, sync QuickBooks, or invite your CA to upload. Every file is hashed, encrypted at rest, and traced to the figures it produces.
        </p>

        <div className="section-tabs" style={{ marginTop: 20 }}>
          {[
            { key: "all" as const, label: "All files", icon: Upload },
            { key: "tb" as const, label: "Trial balance", icon: FileText },
            { key: "bank" as const, label: "Bank", icon: Cloud },
            { key: "gst" as const, label: "GST returns", icon: FileSpreadsheet },
            { key: "contracts" as const, label: "Contracts", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`stab${activeTab === tab.key ? " active" : ""}`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
        <div
          style={{
            border: "2px dashed var(--border-strong)",
            borderRadius: 18,
            padding: 36,
            textAlign: "center",
            background: "linear-gradient(180deg, var(--card) 0%, var(--card-2) 100%)",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "var(--brand-soft)",
              color: "var(--brand-text)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Upload style={{ width: 28, height: 28 }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em" }}>
            Drop trial balance, bank statements, or GST returns
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
            Or{" "}
            <Link href="/analysis" style={{ color: "var(--brand-text)", textDecoration: "none", borderBottom: "1px dashed var(--brand-ring)" }}>
              browse files
            </Link>{" "}
            · CSV, XLSX, PDF, ZIP · up to 200 MB · AES-256 encrypted
          </div>
          <div style={{ marginTop: 18, display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <span className="chip" style={{ background: "var(--brand-soft)", color: "var(--brand-text)", borderColor: "var(--brand-ring)" }}>
              Auto-detect period
            </span>
            <span className="chip">Smart-map accounts</span>
            <span className="chip">Hash & audit-log</span>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ padding: "14px 16px", background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
              Files this month
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
              {hasRealUpload ? items.length : 23}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
              <span style={{ color: "var(--positive)" }}>+8</span> vs last month
            </div>
          </div>

          <div style={{ padding: "14px 16px", background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
              Storage used
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>
              412 <span style={{ fontSize: 14, color: "var(--text-muted)" }}>MB</span>
            </div>
            <div style={{ height: 4, background: "var(--card)", borderRadius: 2, overflow: "hidden", marginTop: 8 }}>
              <div style={{ height: "100%", width: "8.2%", background: "linear-gradient(90deg, var(--brand), var(--positive))", borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>of 5 GB · Growth plan</div>
          </div>

          <div style={{ padding: "14px 16px", background: "var(--brand-soft)", border: "1px solid var(--brand-ring)", borderRadius: 10 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-text)" }}>
              Auto-sync active
            </div>
            <div className="mono" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4, color: "var(--text)" }}>
              3 <span style={{ fontSize: 14, color: "var(--text-muted)" }}>sources</span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>QuickBooks · GSTN · HDFC Bank</div>
          </div>
        </div>
      </section>

      {/* Source filter tabs removed 2026-05-20 — clicking them didn't
          filter the list. Wiring a real per-source filter needs a
          source field on each upload row + matching ingest tagging;
          ships Phase 2. Until then, removed rather than mislead. */}

      <section className="card act-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="act-head" style={{ padding: "16px 20px 12px" }}>
          <div>
            <div className="card-title">Recent uploads</div>
            {/* "hover for preview" claim removed — feedback 2026-05-20
                noted no preview triggers on hover. */}
            <div className="card-sub">Sorted newest · {items.length} files</div>
          </div>
          <div className="card-actions">
            {/* Bulk delete + Filter buttons removed — neither was wired.
                Bulk delete especially has no place without a confirmation
                step on a finance product. Adds back in Phase 2. */}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)" }}>
          {items.map((f, i) => {
            const pill = statusPillClass(f.status);
            const fileIconBg =
              f.type === "csv" ? { bg: "#1F2A1F", color: "#86EFAC", border: "rgba(134,239,172,0.2)" } :
              f.type === "xlsx" ? { bg: "#1F2A20", color: "#4ADE80", border: "rgba(74,222,128,0.2)" } :
              f.type === "pdf" ? { bg: "#2A1F1F", color: "#FB7185", border: "rgba(251,113,133,0.2)" } :
              { bg: "#262A1F", color: "#FBBF24", border: "rgba(251,191,36,0.2)" };

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 90px 110px 120px 100px 80px",
                  gap: 14,
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Geist Mono, monospace",
                    fontSize: 9,
                    fontWeight: 600,
                    background: fileIconBg.bg,
                    color: fileIconBg.color,
                    border: `1px solid ${fileIconBg.border}`,
                  }}
                >
                  {f.type.toUpperCase()}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{f.meta}</div>
                </div>

                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-subtle)" }}>
                  {f.category}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ height: 4, background: "var(--card-2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${f.progress}%`, background: "linear-gradient(90deg, var(--brand), var(--positive))", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{f.progress}%</span>
                </div>

                <span className={`status-pill ${pill}`}>
                  <span className="sw" />
                  {f.statusLabel}
                </span>

                <span className="mono" style={{ fontSize: 11, color: "var(--text-subtle)" }}>{f.hash}</span>

                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="Preview">
                    <Eye style={{ width: 13, height: 13 }} />
                  </button>
                  <button className="icon-btn" style={{ width: 26, height: 26 }} aria-label="More">
                    <MoreVertical style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status legend · feedback 2026-05-20 — labels weren't
            self-documenting. Now explicit beneath the list. */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            padding: "10px 20px 16px",
            borderTop: "1px solid var(--border)",
            fontSize: 11.5,
            color: "var(--text-muted)",
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--text-subtle, var(--muted))", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 10.5 }}>
            Status legend
          </span>
          {[
            { dot: "var(--positive)", label: "Linked / Reconciled / Locked", help: "ingested + connected to figures" },
            { dot: "var(--info)", label: "Mapping accounts…", help: "in-progress · auto-classifying" },
            { dot: "var(--warning)", label: "Action req · Untagged", help: "needs you · click row to see what" },
          ].map((s) => (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: s.dot, display: "inline-block" }} />
              <span style={{ color: "var(--text)" }}>{s.label}</span>
              <span style={{ opacity: 0.7 }}>· {s.help}</span>
            </span>
          ))}
        </div>
      </section>

      <div
        style={{
          display: "flex",
          gap: 14,
          padding: "16px 18px",
          background: "var(--card-2)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          fontSize: 12.5,
          color: "var(--text-muted)",
        }}
      >
        <Lock style={{ width: 16, height: 16, color: "var(--brand-text)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>Encrypted in transit & at rest.</strong> Every figure traced from upload → mapping → output. Auto-deleted after 7 years per Ind AS retention.{" "}
          <Link href="/profile" style={{ color: "var(--brand-text)" }}>
            Audit log →
          </Link>
        </div>
      </div>
    </>
  );
}
