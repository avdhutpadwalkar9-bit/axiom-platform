"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Upload,
  CreditCard,
  Edit3,
  Plus,
  Loader2,
  X,
  Check,
  Mail,
  Phone,
  Building2,
  Globe,
  Users,
  HardDrive,
  RefreshCw,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Sparkle,
} from "lucide-react";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { api } from "@/lib/api";

// The exact literal the backend requires. Kept in sync with
// DELETE_ACCOUNT_CONFIRMATION in backend/app/routers/auth.py.
const DELETE_CONFIRMATION_TEXT = "DELETE MY ACCOUNT";

/* ────────────────────────────────────────────────────────────────
   Plan catalogue — single source of truth, also imported by
   /billing. Each plan declares its hard limits so the UI can decide
   whether to disable invite / upload / regenerate CTAs without a
   round-trip.
   ──────────────────────────────────────────────────────────────── */
export type PlanKey = "starter" | "growth" | "scale" | "enterprise";

export interface PlanDef {
  key: PlanKey;
  name: string;
  price: string;
  period: string;
  tagline: string;
  storageGB: number; // 0 = unlimited
  uploadsPerMonth: number; // -1 = unlimited
  regenerationsPerMonth: number; // -1 = unlimited
  members: number; // -1 = unlimited
  industries: string;
  highlight?: boolean;
  features: string[];
}

export const PLANS: PlanDef[] = [
  {
    key: "starter",
    name: "Starter",
    price: "₹0",
    period: "free · 14-day trial",
    tagline: "Solo founder + your CA",
    storageGB: 1,
    uploadsPerMonth: 5,
    regenerationsPerMonth: 3,
    // Bumped 1 → 2 on 2026-05-20: feedback noted that a trial user
    // can't invite their CA without an extra slot, which kills the
    // strongest activation event for this product category.
    members: 2,
    industries: "Single sector benchmark",
    features: [
      "1 GB document storage",
      "5 uploads / month",
      "3 QoE regenerations / month",
      "2 workspace members · invite your CA",
      "Single-industry benchmarks",
      "Email support",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: "₹9,000",
    period: "/month",
    tagline: "MSMEs at ₹10–50 Cr revenue",
    storageGB: 5,
    uploadsPerMonth: -1,
    regenerationsPerMonth: -1,
    members: 5,
    industries: "All sector benchmarks",
    highlight: true,
    features: [
      "5 GB document storage",
      "Unlimited TB / GST / contract uploads",
      "Unlimited QoE regenerations",
      "5 workspace members",
      "All industries · 47 peers",
      "CA-signed monthly report",
      "Priority WhatsApp support",
    ],
  },
  {
    key: "scale",
    name: "Scale",
    price: "₹24,999",
    period: "/month",
    tagline: "Multi-entity groups · pre-IPO",
    storageGB: 25,
    uploadsPerMonth: -1,
    regenerationsPerMonth: -1,
    members: 15,
    industries: "All sector benchmarks · custom peers",
    features: [
      "25 GB document storage",
      "Unlimited uploads + regens",
      "15 workspace members",
      "Consolidated multi-entity view",
      "Custom peer-set curation",
      "Quarterly diligence pack",
      "Dedicated CA reviewer",
      "SLA · 4-hour response",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "talk to sales",
    tagline: "CA firms, family offices, PE portcos",
    storageGB: 0,
    uploadsPerMonth: -1,
    regenerationsPerMonth: -1,
    members: -1,
    industries: "Custom benchmarks · APIs",
    features: [
      "Unlimited storage + uploads",
      "Unlimited workspace members",
      "SSO + RBAC + audit trail",
      "White-label reports",
      "REST + Webhooks API",
      "VPC / on-prem deployment",
      "99.9% SLA + dedicated CSM",
    ],
  },
];

const lim = (v: number) => (v === -1 ? "Unlimited" : v.toLocaleString("en-IN"));
const storageLabel = (gb: number) => (gb === 0 ? "Unlimited" : `${gb} GB`);

/* ────────────────────────────────────────────────────────────────
   Empty-state helper — render "—" with a tiny "Add in onboarding"
   link instead of fake data. Keeps the row visible so users know
   what they could fill in.
   ──────────────────────────────────────────────────────────────── */
function FieldValue({
  value,
  fallback,
  cta,
}: {
  value: string | undefined | null;
  fallback?: string;
  cta?: { label: string; href: string };
}) {
  const v = (value ?? "").trim();
  if (v) {
    // title= tooltip on hover · 2026-05-20 friend feedback noted that
    // long legal names + URLs got truncated mid-string with no recovery
    // path. Tooltip surfaces the full value on hover.
    return (
      <span
        title={v}
        style={{
          fontSize: 13.5,
          fontWeight: 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          display: "block",
          minWidth: 0,
        }}
      >
        {v}
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 13.5,
        fontWeight: 500,
        color: "var(--text-subtle, var(--muted))",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ opacity: 0.5 }}>{fallback ?? "—"}</span>
      {cta && (
        <Link
          href={cta.href}
          style={{
            fontSize: 11,
            color: "var(--brand-text)",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {cta.label} →
        </Link>
      )}
    </span>
  );
}

/* ──────────── component ──────────── */

export default function ProfilePage() {
  const router = useRouter();
  const { personal, business } = useOnboardingStore();
  const authUser = useAuthStore((s) => s.user);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const lastResult = useAnalysisStore((s) => s.lastResult);
  const isDemo = useIsDemoAccount();

  useEffect(() => {
    if (!authUser) checkAuth();
  }, [authUser, checkAuth]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");

  // Plan defaults — Starter (free trial) for everyone except the
  // demo workspace, which is on Growth so the UI shows what a
  // paid customer sees. When real subscriptions ship, sub this for
  // an api.getSubscription() call.
  const currentPlanKey: PlanKey = isDemo ? "growth" : "starter";
  const currentPlan = PLANS.find((p) => p.key === currentPlanKey)!;

  // Usage — only the demo workspace has fabricated activity. A real
  // brand-new account starts at zero.
  const usageReports = isDemo ? 14 : 0;
  const usageStorageMB = isDemo ? 412 : lastResult ? 8 : 0;
  const usageUploadsMonth = isDemo ? 22 : lastResult ? 1 : 0;
  const usageRegensMonth = isDemo ? 7 : lastResult ? 1 : 0;

  // Identity — strictly real data, no fake fillers
  const email = authUser?.email ?? "";
  const fallbackNameFromEmail = email ? email.split("@")[0] : "";
  const fullName = (authUser?.name?.trim() || personal.fullName || "").trim();
  const displayName = fullName || fallbackNameFromEmail || "Your name";
  const role = personal.role;
  const phone = personal.phone;
  const companyName = business.companyName;
  const currency = business.currency || "INR";
  const industry = business.industry;
  const website = business.websiteUrl;
  const gstin = business.gstin;
  const pan = business.pan;
  const entityType = business.entityType;
  const turnoverRange = business.turnoverRange;

  // Initials — only from real data
  const initials =
    (fullName || fallbackNameFromEmail)
      .split(/\s+|\./)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "•";

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

  // Teammates — start with just the signed-in user. Demo workspace
  // shows the Vadodara Chem sample team to demonstrate the look of
  // a populated workspace.
  const teammates: {
    name: string;
    role: string;
    email: string;
    initials: string;
    bg: string;
    status: "ok" | "info" | "warn";
    label: string;
  }[] = isDemo
    ? [
        { name: displayName, role: `${role || "CFO"} · you`, email, initials, bg: "#4A5526", status: "ok", label: "Owner" },
        { name: "Priya Mehta", role: "Controller", email: "priya@vadodarachem.com", initials: "PM", bg: "#2A4A6E", status: "info", label: "Admin" },
        { name: "Rajan Nagaraju", role: "CA · advisor", email: "rajan@cortexcfo.in", initials: "RN", bg: "#6E2A4A", status: "warn", label: "Reviewer" },
        { name: "Aman Doshi", role: "FP&A analyst", email: "aman@vadodarachem.com", initials: "AD", bg: "#4A2A6E", status: "warn", label: "Member" },
      ]
    : [
        {
          name: displayName,
          role: role ? `${role} · you` : "Workspace owner · you",
          email,
          initials,
          bg: "#4A5526",
          status: "ok",
          label: "Owner",
        },
      ];

  // Member slot logic
  const memberLimit = currentPlan.members;
  const membersUsed = teammates.length;
  const atMemberLimit = memberLimit !== -1 && membersUsed >= memberLimit;
  const memberSlotsLeft = memberLimit === -1 ? "∞" : Math.max(0, memberLimit - membersUsed);

  // Storage / upload / regen usage percentages
  const storagePct = currentPlan.storageGB === 0 ? 0 : (usageStorageMB / (currentPlan.storageGB * 1024)) * 100;
  const uploadsPct =
    currentPlan.uploadsPerMonth === -1 ? 0 : (usageUploadsMonth / currentPlan.uploadsPerMonth) * 100;
  const regensPct =
    currentPlan.regenerationsPerMonth === -1 ? 0 : (usageRegensMonth / currentPlan.regenerationsPerMonth) * 100;

  return (
    <>
      {/* ─── HERO ────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>
            Profile · {isDemo ? "demo workspace" : "your workspace"}
            {isDemo && <span style={{ marginLeft: 8, opacity: 0.7 }}>· seeded sample data</span>}
          </span>
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
              {displayName}
            </h1>
            <div className="hero-sub" style={{ marginTop: 0 }}>
              <span>
                {role || "Workspace owner"} {companyName && `· ${companyName}`}
              </span>
              {/* Plan naming consistency · 2026-05-20 — was "Starter plan"
                  in hero, "Your plan · Starter · Trial" below. Unify to
                  "Starter · trial" everywhere for non-paid accounts. */}
              <span className="pill">
                <Sparkles />
                {currentPlan.name}
                {currentPlanKey === "starter" && !isDemo ? " · trial" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROFILE-COMPLETION BANNER (real account only, missing data) ─── */}
      {!isDemo && (!fullName || !companyName || !phone || !gstin) && (
        <div
          className="card"
          style={{
            padding: 16,
            background: "var(--brand-soft)",
            border: "1px dashed color-mix(in oklab, var(--brand) 35%, transparent)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <Sparkle style={{ width: 16, height: 16, color: "var(--brand-text)" }} />
          <div style={{ flex: 1, minWidth: 240, fontSize: 13, lineHeight: 1.5 }}>
            <strong>Finish your profile</strong> so reports, exports and invoices carry your real name and company details.
            <span style={{ display: "block", color: "var(--text-muted)", fontSize: 12 }}>
              Missing: {[
                !fullName && "full name",
                !phone && "phone",
                !companyName && "company name",
                !gstin && "GSTIN",
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <Link href="/onboarding" className="chip" style={{ textDecoration: "none" }}>
            <Edit3 style={{ width: 11, height: 11 }} />
            Complete onboarding
          </Link>
        </div>
      )}

      {/* ─── KPI ROW ─────────────────────────────────────────────── */}
      <div className="kpi-row">
        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <HardDrive style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Storage</span>
          </div>
          <div className="kpi-value">
            <span>{usageStorageMB}</span>
            <span className="unit">MB</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">
              of {storageLabel(currentPlan.storageGB)} · {Math.round(storagePct)}% used
            </span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Upload style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Uploads this month</span>
          </div>
          <div className="kpi-value">
            <span>{usageUploadsMonth}</span>
            <span className="unit">files</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">of {lim(currentPlan.uploadsPerMonth)}</span>
          </div>
        </div>

        <div className="kpi accent">
          <div className="kpi-head">
            <div className="kpi-icon">
              <RefreshCw style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">QoE regenerations</span>
          </div>
          <div className="kpi-value">
            <span>{usageRegensMonth}</span>
            <span className="unit">runs</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">of {lim(currentPlan.regenerationsPerMonth)} this cycle</span>
          </div>
        </div>

        <div className="kpi">
          <div className="kpi-head">
            <div className="kpi-icon">
              <Users style={{ width: 13, height: 13 }} />
            </div>
            <span className="kpi-label">Team members</span>
          </div>
          <div className="kpi-value">
            <span>{membersUsed}</span>
            <span className="unit">of {lim(currentPlan.members)}</span>
          </div>
          <div className="kpi-foot">
            <span className="meta">
              {memberLimit === -1 ? "Unlimited seats" : `${memberSlotsLeft} slots left`}
            </span>
          </div>
        </div>
      </div>

      {/* ─── SPLIT: Personal + Business ──────────────────────────── */}
      <div className="split">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Personal details</div>
              <div className="card-sub">Captured at sign-up · editable from onboarding</div>
            </div>
            <div className="card-actions">
              <Link href="/onboarding" className="chip" style={{ textDecoration: "none" }}>
                <Edit3 style={{ width: 11, height: 11 }} />
                Edit
              </Link>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 14 }}>
            {[
              {
                icon: <Sparkles style={{ width: 13, height: 13 }} />,
                label: "Full name",
                value: fullName,
                cta: { label: "Add", href: "/onboarding" },
              },
              {
                icon: <Building2 style={{ width: 13, height: 13 }} />,
                label: "Designation",
                value: role,
                cta: { label: "Add", href: "/onboarding" },
              },
              {
                icon: <Mail style={{ width: 13, height: 13 }} />,
                label: "Sign-in email",
                value: email,
              },
              {
                icon: <Phone style={{ width: 13, height: 13 }} />,
                label: "Phone",
                value: phone,
                cta: { label: "Add", href: "/onboarding" },
              },
              {
                icon: <Globe style={{ width: 13, height: 13 }} />,
                label: "Default currency",
                value: `${currency}`,
              },
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
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "var(--text-subtle, var(--muted))" }}>{row.icon}</span>
                  {row.label}
                </span>
                <FieldValue value={row.value} cta={row.cta} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Business profile</div>
              <div className="card-sub">From onboarding · used across reports & invoices</div>
            </div>
            <div className="card-actions">
              <Link href="/onboarding" className="chip" style={{ textDecoration: "none" }}>
                <Edit3 style={{ width: 11, height: 11 }} />
                Edit
              </Link>
            </div>
          </div>
          <div style={{ padding: "8px 4px", display: "grid", gap: 14 }}>
            {[
              { label: "Legal name", value: companyName },
              { label: "Industry", value: industry },
              { label: "Website", value: website },
              { label: "GSTIN", value: gstin },
              { label: "PAN", value: pan },
              { label: "Entity type", value: entityType },
              { label: "Turnover band", value: turnoverRange },
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
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {row.label}
                </span>
                <FieldValue value={row.value} cta={{ label: "Add", href: "/onboarding" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── CURRENT PLAN + USAGE ────────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              Your plan · {currentPlan.name}
              <span className="pill" style={{ marginLeft: 10 }}>
                {currentPlanKey === "starter" ? "Trial" : "Active"}
              </span>
            </div>
            <div className="card-sub">
              {currentPlan.price}
              {currentPlan.period === "/month" ? currentPlan.period : ` · ${currentPlan.period}`}
              {!isDemo && currentPlanKey === "starter" && " · upgrade anytime"}
            </div>
          </div>
          <div className="card-actions">
            <Link href="/billing" className="chip" style={{ textDecoration: "none" }}>
              <CreditCard style={{ width: 11, height: 11 }} />
              Manage billing
            </Link>
            <Link
              href="/billing?action=upgrade"
              className="chip"
              style={{
                textDecoration: "none",
                background: "var(--brand)",
                color: "#0A0B0D",
                borderColor: "var(--brand)",
              }}
            >
              <ArrowUpRight style={{ width: 11, height: 11 }} />
              Upgrade
            </Link>
          </div>
        </div>

        <div
          style={{
            padding: "16px 4px 8px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <UsageBar
            icon={<HardDrive style={{ width: 12, height: 12 }} />}
            label="Storage"
            used={`${usageStorageMB} MB`}
            max={storageLabel(currentPlan.storageGB)}
            pct={storagePct}
          />
          <UsageBar
            icon={<Upload style={{ width: 12, height: 12 }} />}
            label="Uploads (cycle)"
            used={String(usageUploadsMonth)}
            max={lim(currentPlan.uploadsPerMonth)}
            pct={uploadsPct}
          />
          <UsageBar
            icon={<RefreshCw style={{ width: 12, height: 12 }} />}
            label="QoE regens (cycle)"
            used={String(usageRegensMonth)}
            max={lim(currentPlan.regenerationsPerMonth)}
            pct={regensPct}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            padding: "0 4px 4px",
          }}
        >
          {/* Reports tile · feedback 2026-05-20 — for a brand-new account
              "0 reports · lifetime" reads as discouraging. Turn it into
              a "Run your first QoE report →" CTA for non-demo zero state. */}
          {usageReports === 0 && !isDemo ? (
            <Link
              href="/uploads"
              style={{
                padding: 12,
                background: "var(--brand-soft)",
                border: "1px dashed color-mix(in oklab, var(--brand) 40%, transparent)",
                borderRadius: 10,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
                transition: "border-color .12s",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--brand-text)",
                  fontWeight: 600,
                }}
              >
                First QoE
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>
                Run your first report →
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>upload your TB · 60 sec</div>
            </Link>
          ) : (
            <div
              style={{
                padding: 12,
                background: "var(--card-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                Reports run
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
                {usageReports}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>lifetime</div>
            </div>
          )}

          {[
            { label: "Members", value: `${membersUsed}`, sub: `of ${lim(currentPlan.members)}` },
            { label: "Cycle", value: isDemo ? "18 days" : "—", sub: isDemo ? "until renewal" : "no active sub" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: 12,
                background: "var(--card-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-muted)",
                }}
              >
                {s.label}
              </div>
              <div className="mono" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PLAN COMPARISON TABLE ───────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">Compare plans</div>
            <div className="card-sub">
              Storage · uploads · QoE regenerations · team seats — pick what your workspace needs
            </div>
          </div>
        </div>
        <div style={{ padding: "0 0 4px" }}>
          <table className="activity">
            <thead>
              <tr>
                <th style={{ width: 180 }}>Limits</th>
                {PLANS.map((p) => (
                  <th key={p.key} style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ color: p.highlight ? "var(--brand-text)" : "var(--text)" }}>{p.name}</span>
                      <span
                        style={{
                          textTransform: "none",
                          letterSpacing: 0,
                          fontWeight: 400,
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {p.price}
                        <span style={{ opacity: 0.6 }}> {p.period === "/month" ? p.period : ""}</span>
                      </span>
                      {p.key === currentPlanKey && (
                        <span className="status-pill ok" style={{ marginTop: 2 }}>
                          <span className="sw" />
                          Current
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                icon={<HardDrive style={{ width: 12, height: 12 }} />}
                label="Storage"
                values={PLANS.map((p) => storageLabel(p.storageGB))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<Upload style={{ width: 12, height: 12 }} />}
                label="Uploads / month"
                values={PLANS.map((p) => lim(p.uploadsPerMonth))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<RefreshCw style={{ width: 12, height: 12 }} />}
                label="QoE regenerations / month"
                values={PLANS.map((p) => lim(p.regenerationsPerMonth))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<Users style={{ width: 12, height: 12 }} />}
                label="Workspace members"
                values={PLANS.map((p) => lim(p.members))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<Sparkles style={{ width: 12, height: 12 }} />}
                label="Industries / peers"
                values={PLANS.map((p) => p.industries)}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<ShieldCheck style={{ width: 12, height: 12 }} />}
                label="CA-signed monthly pack"
                values={PLANS.map((p) => (p.key === "starter" ? "—" : "Included"))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <ComparisonRow
                icon={<Lock style={{ width: 12, height: 12 }} />}
                label="SSO + RBAC"
                values={PLANS.map((p) => (p.key === "enterprise" ? "Included" : "—"))}
                current={currentPlanKey}
                plans={PLANS}
              />
              <tr>
                <td></td>
                {PLANS.map((p) => {
                  const sameAsCurrent = p.key === currentPlanKey;
                  const isUpgrade =
                    PLANS.findIndex((x) => x.key === p.key) > PLANS.findIndex((x) => x.key === currentPlanKey);
                  return (
                    <td key={p.key} style={{ textAlign: "center", padding: "12px 8px" }}>
                      {sameAsCurrent ? (
                        <span className="status-pill ok">
                          <span className="sw" />
                          Active
                        </span>
                      ) : (
                        <Link
                          href={`/billing?plan=${p.key}`}
                          className="chip"
                          style={{
                            textDecoration: "none",
                            background: p.highlight ? "var(--brand)" : undefined,
                            color: p.highlight ? "#0A0B0D" : undefined,
                            borderColor: p.highlight ? "var(--brand)" : undefined,
                          }}
                        >
                          {p.key === "enterprise" ? "Talk to sales" : isUpgrade ? "Upgrade" : "Switch"}
                        </Link>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── WORKSPACE MEMBERS ───────────────────────────────────── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              Workspace members
              <span className="pill" style={{ marginLeft: 10 }}>
                {membersUsed} / {lim(currentPlan.members)}
              </span>
            </div>
            <div className="card-sub">
              {companyName || "Your workspace"} ·{" "}
              {atMemberLimit
                ? "Member limit reached for your plan — upgrade to invite more"
                : `${memberSlotsLeft} ${memberSlotsLeft === 1 ? "seat" : "seats"} left on ${currentPlan.name}`}
            </div>
          </div>
          <div className="card-actions">
            <button
              className="chip"
              onClick={() => !atMemberLimit && setInviteOpen(true)}
              disabled={atMemberLimit}
              style={
                atMemberLimit
                  ? { opacity: 0.5, cursor: "not-allowed" }
                  : { background: "var(--brand-soft)", color: "var(--brand-text)", borderColor: "var(--brand)" }
              }
            >
              <Plus style={{ width: 11, height: 11 }} />
              Invite teammate
            </button>
          </div>
        </div>

        <div style={{ padding: "8px 4px", display: "grid", gap: 10 }}>
          {teammates.map((m) => (
            <div
              key={m.email || m.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
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
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  {m.role}
                  {m.email && ` · ${m.email}`}
                </div>
              </div>
              <span className={`status-pill ${m.status}`}>
                <span className="sw" />
                {m.label}
              </span>
            </div>
          ))}

          {!isDemo && teammates.length === 1 && (
            <div
              style={{
                marginTop: 4,
                padding: 14,
                background: "var(--canvas-2)",
                border: "1px dashed var(--border)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Users style={{ width: 14, height: 14, color: "var(--text-muted)" }} />
              <div style={{ flex: 1, fontSize: 13, color: "var(--text-muted)" }}>
                It&rsquo;s just you so far. Invite a controller, CA, or analyst to share the QoE workbook and add-back schedule.
              </div>
              <button
                className="chip"
                onClick={() => setInviteOpen(true)}
                style={{
                  background: "var(--brand-soft)",
                  color: "var(--brand-text)",
                  borderColor: "var(--brand)",
                }}
              >
                <Plus style={{ width: 11, height: 11 }} />
                Invite teammate
              </button>
            </div>
          )}

          {atMemberLimit && (
            <div
              style={{
                marginTop: 4,
                padding: 12,
                background: "var(--brand-soft)",
                border: "1px dashed color-mix(in oklab, var(--brand) 40%, transparent)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Sparkles style={{ width: 14, height: 14, color: "var(--brand-text)" }} />
              <div style={{ flex: 1, fontSize: 13 }}>
                You&rsquo;re at the {currentPlan.name} seat limit. <strong>Scale</strong> unlocks {lim(PLANS[2].members)} members and unlimited regenerations.
              </div>
              <Link
                href="/billing?plan=scale"
                className="chip"
                style={{
                  textDecoration: "none",
                  background: "var(--brand)",
                  color: "#0A0B0D",
                  borderColor: "var(--brand)",
                }}
              >
                See Scale
              </Link>
            </div>
          )}
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

      {/* ─── INVITE MODAL ────────────────────────────────────────── */}
      {inviteOpen && (
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
          onClick={() => setInviteOpen(false)}
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
                <h2 style={{ fontSize: 18, fontWeight: 600 }}>Invite a teammate</h2>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  {memberSlotsLeft === "∞"
                    ? "Unlimited seats on your plan."
                    : `${memberSlotsLeft} ${memberSlotsLeft === 1 ? "seat" : "seats"} left on ${currentPlan.name}.`}{" "}
                  They&rsquo;ll get an email invite and can sign in with this workspace.
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setInviteOpen(false)}
                aria-label="Close"
                style={{ width: 28, height: 28 }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Work email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
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

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Role
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {(["admin", "member", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  style={{
                    padding: "10px 12px",
                    background: inviteRole === r ? "var(--brand-soft)" : "var(--canvas)",
                    border: `1px solid ${inviteRole === r ? "var(--brand)" : "var(--border-strong)"}`,
                    borderRadius: 8,
                    color: inviteRole === r ? "var(--brand-text)" : "var(--text)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    fontFamily: "inherit",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost" onClick={() => setInviteOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setInviteOpen(false);
                  setInviteEmail("");
                }}
                disabled={!inviteEmail.includes("@")}
              >
                <Mail style={{ width: 13, height: 13 }} />
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

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

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
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

            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
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
              <button className="btn btn-ghost" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
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

/* ──────────── helpers ──────────── */

function UsageBar({
  icon,
  label,
  used,
  max,
  pct,
}: {
  icon: React.ReactNode;
  label: string;
  used: string;
  max: string;
  pct: number;
}) {
  const tone = pct >= 90 ? "var(--negative)" : pct >= 70 ? "var(--warning)" : "var(--brand)";
  const safePct = Math.min(100, Math.max(2, pct || 2));
  return (
    <div
      style={{
        padding: 14,
        background: "var(--card-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--text-subtle, var(--muted))",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        <span style={{ color: "var(--text-muted)" }}>{icon}</span>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 6 }}>
        <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>
          {used}
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>of {max}</span>
      </div>
      <div style={{ height: 6, background: "var(--canvas-2)", borderRadius: 3, marginTop: 8, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${safePct}%`,
            background: max === "Unlimited" ? "var(--positive)" : tone,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

function ComparisonRow({
  icon,
  label,
  values,
  current,
  plans,
}: {
  icon: React.ReactNode;
  label: string;
  values: string[];
  current: PlanKey;
  plans: PlanDef[];
}) {
  return (
    <tr>
      <td>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "var(--text-muted, var(--muted))",
            fontWeight: 500,
          }}
        >
          <span style={{ color: "var(--text-subtle, var(--muted))" }}>{icon}</span>
          {label}
        </span>
      </td>
      {plans.map((p, i) => {
        const isCurrent = p.key === current;
        const v = values[i];
        const isUnlimited = v === "Unlimited";
        const isDash = v === "—";
        return (
          <td
            key={p.key}
            className={isUnlimited || /^\d/.test(v) ? "mono" : undefined}
            style={{
              textAlign: "center",
              background: isCurrent ? "var(--brand-soft)" : undefined,
              color: isDash
                ? "var(--text-subtle, var(--muted))"
                : isCurrent
                ? "var(--brand-text)"
                : "var(--text)",
              fontWeight: isUnlimited || isCurrent ? 500 : 400,
            }}
          >
            {isDash ? (
              <span style={{ opacity: 0.5 }}>—</span>
            ) : v === "Included" ? (
              <Check style={{ width: 14, height: 14, color: "var(--positive)" }} />
            ) : (
              v
            )}
          </td>
        );
      })}
    </tr>
  );
}
