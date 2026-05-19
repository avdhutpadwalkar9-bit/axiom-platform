"use client";

import { useState } from "react";

type Connected = {
  name: string;
  logo: string;
  logoBg: string;
  category: string;
  desc: string;
  meta: string;
  status: "synced" | "active" | "warn";
  statusLabel: string;
};

type Available = {
  name: string;
  logo: string;
  logoBg: string;
  category: string;
  desc: string;
};

const CONNECTED: Connected[] = [
  { name: "QuickBooks Online", logo: "QB", logoBg: "linear-gradient(135deg, #2CA01C 0%, #1F7314 100%)", category: "Accounting", desc: "Trial balance, P&L, GL · auto-mapped", meta: "2,431 records · synced 12 min ago", status: "synced", statusLabel: "Synced" },
  { name: "HDFC Bank", logo: "H", logoBg: "linear-gradient(135deg, #DC2626 0%, #991B1B 100%)", category: "Banking · OD account", desc: "Statement, reconciliation · daily 2:00 IST", meta: "94 txns this week", status: "synced", statusLabel: "Synced" },
  { name: "GST Portal", logo: "G", logoBg: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)", category: "Compliance", desc: "GSTR-1, 3B, 2A · auto-import on filing", meta: "April 2026 filed · 18d ago", status: "synced", statusLabel: "Up to date" },
  { name: "Razorpay", logo: "R", logoBg: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", category: "Payments", desc: "Customer invoices, receipts, MDR", meta: "₹38L this month · 412 txns", status: "synced", statusLabel: "Synced" },
  { name: "Slack", logo: "Sl", logoBg: "linear-gradient(135deg, #4A154B 0%, #36013F 100%)", category: "Comms · #finance", desc: "Daily KPI digest, anomaly alerts", meta: "Last alert · 2 hr ago", status: "active", statusLabel: "Active" },
];

const AVAILABLE: Available[] = [
  { name: "Zoho Books", logo: "Z", logoBg: "linear-gradient(135deg, #E11D48 0%, #9F1239 100%)", category: "Accounting", desc: "Trial balance, invoices, expense" },
  { name: "Tally Prime", logo: "T", logoBg: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)", category: "Accounting", desc: "XML import, day-book, ledgers" },
  { name: "ICICI Bank", logo: "I", logoBg: "linear-gradient(135deg, #F59E0B 0%, #B45309 100%)", category: "Banking · CC account", desc: "Statement, reconciliation" },
  { name: "Stripe", logo: "S", logoBg: "linear-gradient(135deg, #635BFF 0%, #4338CA 100%)", category: "Payments · international", desc: "Invoices, payouts, fees" },
  { name: "Shopify", logo: "Sh", logoBg: "linear-gradient(135deg, #95BF47 0%, #5E8E3E 100%)", category: "Commerce · DTC store", desc: "Orders, COGS, GST" },
  { name: "Google Drive", logo: "D", logoBg: "linear-gradient(135deg, #FBBC04 0%, #F57C00 100%)", category: "Storage", desc: "Auto-attach contracts to reports" },
  { name: "REST API & Webhooks", logo: "</>", logoBg: "linear-gradient(135deg, #1F2937 0%, #0F172A 100%)", category: "Developer", desc: "Build your own integration" },
];

const SYNC_LOG = [
  { at: "12 min ago", who: "QuickBooks", text: "Pulled 31 new transactions · TB updated", status: "ok" as const, label: "Synced" },
  { at: "1 hr ago", who: "HDFC Bank", text: "Statement reconciled · 94 entries matched", status: "ok" as const, label: "Synced" },
  { at: "3 hr ago", who: "Razorpay", text: "MDR adjustments imported · ₹14,200", status: "ok" as const, label: "Synced" },
  { at: "6 hr ago", who: "GSTN", text: "GSTR-2A refresh complete · 47 invoices reconciled", status: "ok" as const, label: "Synced" },
  { at: "Yesterday", who: "Slack", text: "Anomaly alert delivered · #finance · HUF rent flag", status: "info" as const, label: "Delivered" },
  { at: "2 days ago", who: "QuickBooks", text: "Sync paused 14 min · auth token refresh", status: "warn" as const, label: "Recovered" },
];

const CATEGORIES = [
  { key: "all", label: "All", count: 12 },
  { key: "accounting", label: "Accounting", count: 3 },
  { key: "banking", label: "Banking", count: 2 },
  { key: "compliance", label: "Compliance", count: 1 },
  { key: "payments", label: "Payments", count: 2 },
  { key: "commerce", label: "Commerce", count: 1 },
  { key: "comms", label: "Comms", count: 1 },
  { key: "storage", label: "Storage", count: 1 },
  { key: "developer", label: "Developer", count: 1 },
];

export default function IntegrationsPage() {
  const [activeCat, setActiveCat] = useState("all");

  return (
    <>
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Integrations · 5 connected · 7 available</span>
        </div>
        <h1 className="hero-title">
          One thread to <span className="name">every system</span>.
        </h1>
        <p className="hero-sub" style={{ display: "block", maxWidth: 560 }}>
          Pull your trial balance from QuickBooks. Reconcile HDFC overnight. Auto-import GSTR-2A. Push Slack alerts when the numbers shift. We sit at the centre, every figure traceable to its source.
        </p>
      </section>

      <section
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          padding: 4,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          width: "fit-content",
        }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCat(c.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 7,
              background: activeCat === c.key ? "var(--brand-soft)" : "transparent",
              border: "none",
              color: activeCat === c.key ? "var(--brand-text)" : "var(--text-muted)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {c.label}
            <span style={{ fontSize: 10.5, color: activeCat === c.key ? "var(--brand-text)" : "var(--text-subtle)" }}>{c.count}</span>
          </button>
        ))}
      </section>

      <section>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-subtle)", marginBottom: 10 }}>
          Connected · {CONNECTED.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {CONNECTED.map((it) => (
            <div
              key={it.name}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
                transition: "border-color .15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: it.logoBg,
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {it.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{it.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{it.category}</div>
                </div>
                <span className={`status-pill ${it.status === "active" ? "info" : it.status === "warn" ? "warn" : "ok"}`}>
                  <span className="sw" />
                  {it.statusLabel}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>{it.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {it.meta}
                </span>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "6px 12px", fontSize: 12, opacity: 0.5, cursor: "not-allowed" }}
                  disabled
                  title="Per-connection settings ship Q3 2026"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-subtle)", marginBottom: 10 }}>
          Available · {AVAILABLE.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {AVAILABLE.map((it) => (
            <div
              key={it.name}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: it.logoBg,
                    color: "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {it.logo}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{it.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{it.category}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 14 }}>{it.desc}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-subtle)" }}>
                  Not connected
                </span>
                <button
                  className="btn btn-primary"
                  style={{ padding: "6px 12px", fontSize: 12, opacity: 0.5, cursor: "not-allowed" }}
                  disabled
                  title="Live connectors ship Q3 2026"
                >
                  Connect →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Sync activity</div>
            <div className="card-sub">Last 24 hours · all sources</div>
          </div>
        </div>
        <div style={{ marginTop: 14, display: "grid", gap: 8, fontSize: 12.5 }}>
          {SYNC_LOG.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                background: "var(--card-2)",
                borderRadius: 8,
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: "var(--text-subtle)", minWidth: 80 }}>
                {row.at}
              </span>
              <span style={{ fontWeight: 500, minWidth: 120 }}>{row.who}</span>
              <span style={{ color: "var(--text-muted)", flex: 1 }}>{row.text}</span>
              <span className={`status-pill ${row.status}`}>
                <span className="sw" />
                {row.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
