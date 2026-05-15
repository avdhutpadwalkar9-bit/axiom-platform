"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Sparkles,
  Upload,
  CreditCard,
  Edit3,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { api } from "@/lib/api";

// The exact literal the backend requires. Kept in sync with
// DELETE_ACCOUNT_CONFIRMATION in backend/app/routers/auth.py.
const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

export default function ProfilePage() {
  const router = useRouter();
  const { personal, business } = useOnboardingStore();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fullName = personal.fullName || "Vikram Shah";
  const role = personal.role || "Chief Financial Officer";
  const companyName = business.companyName || "Vadodara Chem";
  const currency = business.currency || "INR";

  // Initials for the avatar
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "U";

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirm !== DELETE_CONFIRMATION_TEXT) {
      setDeleteError(`Type "${DELETE_CONFIRMATION_TEXT}" exactly to confirm.`);
      return;
    }
    setDeleteLoading(true);
    try {
      await api.deleteAccount(deletePassword, deleteConfirm);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      router.replace("/login");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not delete account.";
      setDeleteError(msg);
      setDeleteLoading(false);
    }
  };

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Profile · workspace owner · joined 14 months ago</span>
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center", marginTop: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--brand) 0%, #047857 100%)",
              color: "#0A0B0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <h1 className="hero-title" style={{ marginBottom: 4 }}>
              {fullName}
            </h1>
            <div className="hero-sub" style={{ marginTop: 0 }}>
              <span>
                {role} · {companyName}
              </span>
              <span className="pill">
                <Sparkles />
                Workspace owner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── KPI ROW ─────────────────────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <TrendingUp style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">QoE reports run</span>
          </div>
          <div className="kpi-value">
            <span>14</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">3 this month · avg score 8.7</span>
          </div>
        </div>

        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Sparkles style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">AI conversations</span>
          </div>
          <div className="kpi-value">
            <span>2,847</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">All cited · 94% useful rating</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Upload style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Uploads</span>
          </div>
          <div className="kpi-value">
            <span>186</span>
            <span className="unit">files</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">412 MB · TB, FA, GST returns</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <CreditCard style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Plan · Growth</span>
          </div>
          <div className="kpi-value">
            <span>₹9k</span>
            <span className="unit">/mo</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">Renews 12 Dec 2026</span>
          </div>
        </div>
      </div>

      {/* ─── SPLIT: Personal details + Workspace ──────────────────── */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Personal details</div>
              <div className="card-sub">Visible to your workspace</div>
            </div>
            <div className="card-actions">
              <button className="chip">
                <Edit3 style={{ width: 11, height: 11 }} />
                Edit
              </button>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 14 }}>
            {[
              { label: "Full name", value: fullName },
              { label: "Designation", value: role },
              { label: "Email (work)", value: "vikram@vadodarachem.com" },
              { label: "Phone", value: personal.phone || "+91 98•••• 4521" },
              { label: "Time zone", value: "Asia/Kolkata · IST (UTC +5:30)" },
              { label: "Default currency", value: `${currency} · ₹` },
              { label: "Language", value: "English (India)" },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  gap: 16,
                  alignItems: "center",
                  padding: "6px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <span style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {row.label}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Workspace</div>
              <div className="card-sub">{companyName} · 4 members</div>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 10 }}>
            {[
              { name: fullName, role: `${role} · you`, initials, bg: "#4A5526", status: "ok" as const, label: "Owner" },
              { name: "Priya Mehta", role: "Controller", initials: "PM", bg: "#2A4A6E", status: "info" as const, label: "Admin" },
              { name: "Rajan Nagaraju", role: "CA · advisor", initials: "RN", bg: "#6E2A4A", status: "warn" as const, label: "Reviewer" },
              { name: "Aman Doshi", role: "FP&A analyst", initials: "AD", bg: "#4A2A6E", status: "warn" as const, label: "Member" },
            ].map((m) => (
              <div
                key={m.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 10,
                  background: "var(--card-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: m.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#fff",
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{m.role}</div>
                </div>
                <span className={`status-pill ${m.status}`}>
                  <span className="sw" />
                  {m.label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 4px 0" }}>
            <button className="btn btn-ghost" style={{ width: "100%" }}>
              <Plus style={{ width: 14, height: 14 }} />
              Invite teammate
            </button>
          </div>
        </div>
      </div>

      {/* ─── PLAN + BILLING ──────────────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Plan & billing</div>
            <div className="card-sub">Growth · ₹9,000 / month · INR</div>
          </div>
          <div className="card-actions">
            <button className="chip" onClick={() => router.push("/pricing")}>
              Upgrade
            </button>
          </div>
        </div>
        <div style={{ padding: "12px 4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Usage this cycle · 18 days left</span>
            <span className="mono" style={{ fontSize: 13, fontWeight: 500 }}>68% used</span>
          </div>
          <div style={{ height: 8, background: "var(--card-2)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "68%", background: "linear-gradient(90deg, var(--brand) 0%, var(--positive) 100%)", borderRadius: 4 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 18 }}>
            {[
              { label: "Reports", value: "14", sub: "of 25" },
              { label: "Members", value: "4", sub: "of 8" },
              { label: "Storage", value: "412 MB", sub: "of 5 GB" },
            ].map((s) => (
              <div key={s.label} style={{ padding: 12, background: "var(--card-2)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                  {s.label}
                </div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DANGER ZONE ─────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          borderColor: "color-mix(in oklab, var(--negative, #C44030) 30%, var(--border))",
          background: "color-mix(in oklab, var(--negative, #C44030) 4%, var(--card))",
        }}
      >
        <div className="card-head">
          <div>
            <div className="card-title" style={{ color: "var(--negative, #C44030)" }}>
              Danger zone
            </div>
            <div className="card-sub">Irreversible action · requires password and exact confirmation</div>
          </div>
        </div>
        <div style={{ padding: "8px 4px", display: "grid", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 12,
              background: "var(--card-2)",
              border: "1px solid var(--border)",
              borderRadius: 10,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Delete account and all data</div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                Permanently removes your profile, every uploaded financial file, every analysis, every QoE workbook, every chat thread. Cannot be undone.
              </div>
            </div>
            <button
              className="btn"
              onClick={() => setDeleteOpen(true)}
              style={{
                borderColor: "color-mix(in oklab, var(--negative, #C44030) 30%, var(--border))",
                color: "var(--negative, #C44030)",
              }}
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* ─── DELETE MODAL ────────────────────────────────────────── */}
      {deleteOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => !deleteLoading && setDeleteOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "var(--card)",
              border: "1px solid var(--border-strong)",
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--negative, #C44030)" }}>Delete account</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  This cannot be undone. We will erase every piece of data tied to your account within 24 hours.
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => !deleteLoading && setDeleteOpen(false)}
                aria-label="Close"
                style={{ width: 28, height: 28 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {deleteError && (
              <div
                style={{
                  background: "rgba(196,64,48,0.10)",
                  border: "1px solid rgba(196,64,48,0.3)",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12.5,
                  color: "var(--negative, #C44030)",
                  marginBottom: 12,
                }}
              >
                {deleteError}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Your password
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              disabled={deleteLoading}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--canvas)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
                marginBottom: 14,
              }}
            />

            <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Type <strong style={{ color: "var(--text)" }}>{DELETE_CONFIRMATION_TEXT}</strong> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              disabled={deleteLoading}
              placeholder={DELETE_CONFIRMATION_TEXT}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "var(--canvas)",
                border: "1px solid var(--border-strong)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
                marginBottom: 16,
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteOpen(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || !deletePassword || deleteConfirm !== DELETE_CONFIRMATION_TEXT}
                style={{
                  background: "var(--negative, #C44030)",
                  border: "1px solid var(--negative, #C44030)",
                  color: "#fff",
                }}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} />
                    Deleting…
                  </>
                ) : (
                  "Delete forever"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
