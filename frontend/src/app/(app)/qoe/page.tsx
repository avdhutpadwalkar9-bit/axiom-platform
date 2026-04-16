"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Info,
  BadgeCheck,
  Upload,
  Loader2,
  Users,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { exportQoEPdf } from "@/lib/exportPdf";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CustomerConcentrationRow {
  customer: string;
  revenue: number;
  share_pct: number;
}

interface GLUploadMeta {
  parser?: string;
  source_format?: string;
  transaction_count?: number;
  parser_warnings?: string[];
  customer_concentration?: CustomerConcentrationRow[];
  file_name?: string;
}

function fmt(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`;
  return `${sign}₹${abs.toFixed(0)}`;
}

type Status = "approved" | "flagged" | "pending";

interface AddBack {
  id: string;
  category: string;
  description: string;
  amount: number;
  rationale: string;
  status: Status;
  indAs?: string;
}

const DEFAULT_ADDBACKS: AddBack[] = [
  {
    id: "ab-1",
    category: "Related-party",
    description: "Director's remuneration in excess of market",
    amount: 2400000,
    rationale: "Benchmarked against comparable roles at similar-size firms (₹18–24 L p.a.); excess is a non-recurring add-back.",
    status: "approved",
    indAs: "Ind AS 24",
  },
  {
    id: "ab-2",
    category: "Related-party",
    description: "Rent paid to promoter HUF above market rate",
    amount: 600000,
    rationale: "Lease is 22% above the independent valuer benchmark for the same locality; excess is normalised.",
    status: "flagged",
    indAs: "Ind AS 24",
  },
  {
    id: "ab-3",
    category: "One-time",
    description: "Legal & professional fees — IP filings",
    amount: 1800000,
    rationale: "IP prosecution costs for three patent applications; will not recur.",
    status: "approved",
    indAs: "Ind AS 37",
  },
  {
    id: "ab-4",
    category: "One-time",
    description: "Restructuring & severance",
    amount: 850000,
    rationale: "Head-count rationalisation in Q3; severance cost is non-recurring.",
    status: "approved",
  },
  {
    id: "ab-5",
    category: "Revenue",
    description: "One-off government grant income",
    amount: -450000,
    rationale: "PLI scheme disbursement recognised in this year only; removed from run-rate EBITDA.",
    status: "approved",
    indAs: "Ind AS 20",
  },
  {
    id: "ab-6",
    category: "Accounting",
    description: "Unbilled revenue reclassification",
    amount: -320000,
    rationale: "Service milestones not yet achieved; recognition deferred to match Ind AS 115.",
    status: "pending",
    indAs: "Ind AS 115",
  },
  {
    id: "ab-7",
    category: "Accounting",
    description: "Excess provision for doubtful debts reversed",
    amount: 280000,
    rationale: "Aged receivables recovered post-balance-sheet date; provision was over-stated.",
    status: "approved",
    indAs: "Ind AS 109",
  },
];

const COMPLIANCE_CHECKS = [
  { label: "GSTR-3B vs Books (last 12 mo)", status: "ok" as const, detail: "All periods reconciled" },
  { label: "GSTR-2A / 2B credit match", status: "warn" as const, detail: "₹4.8L blocked on vendor non-compliance" },
  { label: "TDS deduction — professional fees", status: "warn" as const, detail: "Short deduction of ₹12K in Q3" },
  { label: "Ind AS 115 revenue cut-off", status: "ok" as const, detail: "Deferred revenue schedule reviewed" },
  { label: "Ind AS 24 related-party disclosure", status: "ok" as const, detail: "5 parties disclosed, 4 transactions" },
  { label: "PF / ESI deposits", status: "warn" as const, detail: "Late deposit in Nov 2025; penalty risk low" },
  { label: "MCA annual filings (MGT-7, AOC-4)", status: "ok" as const, detail: "Filed within due date" },
  { label: "ROC charges register", status: "ok" as const, detail: "All 3 charges on record" },
];

export default function QoEPage() {
  const { lastResult } = useAnalysisStore();
  const { business } = useOnboardingStore();
  const qoeCompanyName = business?.companyName?.trim() || "Your Company";

  const derived = useMemo(() => {
    const fs = lastResult?.financial_statements;
    if (fs && fs.net_income !== undefined) {
      return { reported: fs.net_income, isLive: true };
    }
    return { reported: 3_850_000, isLive: false };
  }, [lastResult]);

  // --- GL upload + customer concentration -------------------------------
  //
  // Two sources for GL insights:
  //   1. If the user already uploaded a GL on /analysis, the analysis page
  //      stashes upload_meta under 'cortexcfo-last-gl-meta' in
  //      sessionStorage. We read it here on mount.
  //   2. The user can also upload a GL directly on this page via the
  //      Customer Concentration panel — useful when the primary analysis
  //      was run off a TB or audited PDF.
  const [glMeta, setGlMeta] = useState<GLUploadMeta | null>(null);
  const [glLoading, setGlLoading] = useState(false);
  const [glError, setGlError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("cortexcfo-last-gl-meta");
      if (raw) setGlMeta(JSON.parse(raw) as GLUploadMeta);
    } catch {
      // Corrupted storage — ignore.
    }
  }, []);

  const handleGlUpload = useCallback(async (file: File) => {
    setGlLoading(true);
    setGlError("");
    try {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("input_mode", "GL");
      const res = await fetch(`${API_BASE}/api/analysis/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const meta: GLUploadMeta | undefined = data?.upload_meta;
      if (!meta) throw new Error("Backend did not return GL metadata.");
      setGlMeta(meta);
      try {
        sessionStorage.setItem("cortexcfo-last-gl-meta", JSON.stringify(meta));
      } catch {
        // Non-fatal.
      }
    } catch (err: unknown) {
      setGlError(err instanceof Error ? err.message : "GL upload failed");
    } finally {
      setGlLoading(false);
    }
  }, []);

  const topCustomers = glMeta?.customer_concentration ?? [];
  const topConcentration = topCustomers.reduce((s, c) => s + c.share_pct, 0);
  const top3 = topCustomers.slice(0, 3);
  const top3Share = top3.reduce((s, c) => s + c.share_pct, 0);

  const totalAddbacks = DEFAULT_ADDBACKS.reduce((s, a) => s + (a.status !== "pending" ? a.amount : 0), 0);
  const pendingAddbacks = DEFAULT_ADDBACKS.filter((a) => a.status === "pending").reduce((s, a) => s + a.amount, 0);
  const adjustedEbitda = derived.reported + totalAddbacks;

  const bridgeData = useMemo(() => {
    const rows: Array<{ name: string; value: number; fill: string; isTotal?: boolean }> = [
      { name: "Reported EBITDA", value: derived.reported, fill: "#64748b", isTotal: true },
    ];
    const categories = ["Related-party", "One-time", "Revenue", "Accounting"];
    for (const cat of categories) {
      const catTotal = DEFAULT_ADDBACKS.filter((a) => a.category === cat && a.status !== "pending").reduce((s, a) => s + a.amount, 0);
      if (catTotal !== 0) {
        rows.push({
          name: cat,
          value: catTotal,
          fill: catTotal > 0 ? "#10b981" : "#f43f5e",
        });
      }
    }
    rows.push({ name: "Adjusted EBITDA", value: adjustedEbitda, fill: "#10b981", isTotal: true });
    return rows;
  }, [derived.reported, adjustedEbitda]);

  const [expandedCat, setExpandedCat] = useState<string | null>("Related-party");

  const catSummary = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    for (const a of DEFAULT_ADDBACKS) {
      map[a.category] = map[a.category] || { count: 0, amount: 0 };
      map[a.category].count += 1;
      map[a.category].amount += a.amount;
    }
    return map;
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400">Quality of Earnings</p>
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
              <BadgeCheck className="w-2.5 h-2.5" /> CA-reviewed
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">Quality of Earnings</h1>
          <p className="text-sm text-white/40 mt-1">
            Continuous audit-readiness &middot; Adjusted EBITDA with full add-back schedule &middot; Ind AS aligned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors">
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            onClick={() => exportQoEPdf(derived.reported, DEFAULT_ADDBACKS, COMPLIANCE_CHECKS, qoeCompanyName)}
            className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Download report (PDF)
          </button>
        </div>
      </div>

      {!derived.isLive && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="text-amber-200 font-medium">Showing sample QoE workbook.</span>{" "}
            <span className="text-white/60">
              Upload a Trial Balance on the{" "}
              <Link href="/analysis" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">TB Analysis</Link>{" "}
              page to populate the bridge with your own numbers.
            </span>
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111] rounded-xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Reported EBITDA</p>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">{fmt(derived.reported)}</p>
          <p className="text-[11px] text-white/30 mt-1">Per books &middot; pre-adjustment</p>
        </div>

        <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/20 p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs text-emerald-300">Adjusted EBITDA</p>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">{fmt(adjustedEbitda)}</p>
          <p className="text-[11px] text-emerald-400/70 mt-1">
            {totalAddbacks >= 0 ? "+" : ""}{fmt(totalAddbacks)} net adjustments
          </p>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Add-backs identified</p>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">{DEFAULT_ADDBACKS.length}</p>
          <p className="text-[11px] text-white/30 mt-1">
            {DEFAULT_ADDBACKS.filter((a) => a.status === "approved").length} approved &middot;{" "}
            {DEFAULT_ADDBACKS.filter((a) => a.status === "pending").length} pending
          </p>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-white/30" />
            <p className="text-xs text-white/40">Compliance health</p>
          </div>
          <p className="text-2xl font-bold text-white tabular-nums">
            {COMPLIANCE_CHECKS.filter((c) => c.status === "ok").length}
            <span className="text-white/30 text-base">/{COMPLIANCE_CHECKS.length}</span>
          </p>
          <p className="text-[11px] text-white/30 mt-1">
            {COMPLIANCE_CHECKS.filter((c) => c.status === "warn").length} items need attention
          </p>
        </div>
      </div>

      {/* EBITDA Bridge */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">EBITDA bridge</h3>
            <p className="text-xs text-white/40 mt-0.5">Reported → Adjusted, by adjustment category</p>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-sm bg-slate-500" /> Baseline</span>
            <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Positive</span>
            <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Negative</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={bridgeData} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#999", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#999", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value) => [fmt(Number(value)), "Impact"]}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {bridgeData.map((row, i) => (
                <Cell key={i} fill={row.fill} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add-back schedule */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Add-back schedule</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Every adjustment, with rationale and Ind AS reference &middot; reviewable line by line
            </p>
          </div>
          {pendingAddbacks !== 0 && (
            <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {fmt(pendingAddbacks)} pending review
            </span>
          )}
        </div>

        <div className="space-y-2">
          {Object.entries(catSummary).map(([cat, s]) => {
            const isOpen = expandedCat === cat;
            const items = DEFAULT_ADDBACKS.filter((a) => a.category === cat);
            return (
              <div key={cat} className="rounded-lg border border-white/8 bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setExpandedCat(isOpen ? null : cat)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight className={`w-3.5 h-3.5 text-white/30 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    <span className="text-sm font-medium text-white">{cat}</span>
                    <span className="text-[11px] text-white/30">{s.count} items</span>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${s.amount > 0 ? "text-emerald-400" : s.amount < 0 ? "text-rose-400" : "text-white/50"}`}>
                    {s.amount > 0 ? "+" : ""}{fmt(s.amount)}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.015]">
                          <th className="text-left px-4 py-2 font-medium">Description</th>
                          <th className="text-left px-3 py-2 font-medium">Ind AS</th>
                          <th className="text-right px-3 py-2 font-medium">Amount</th>
                          <th className="text-center px-3 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((a) => (
                          <tr key={a.id} className="border-t border-white/3">
                            <td className="px-4 py-3 align-top">
                              <p className="text-white text-sm">{a.description}</p>
                              <p className="text-[11px] text-white/35 mt-1 leading-relaxed max-w-xl">{a.rationale}</p>
                            </td>
                            <td className="px-3 py-3 align-top text-[11px] text-white/50 whitespace-nowrap">{a.indAs ?? "—"}</td>
                            <td className={`px-3 py-3 align-top text-right tabular-nums font-medium ${a.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {a.amount > 0 ? "+" : ""}{fmt(a.amount)}
                            </td>
                            <td className="px-3 py-3 align-top text-center">
                              <StatusPill status={a.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer concentration — derived from GL upload */}
      <div className="bg-[#111] rounded-xl border border-white/8 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Customer concentration</h3>
              {glMeta?.transaction_count ? (
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-2.5 h-2.5" />
                  Live &middot; {glMeta.transaction_count.toLocaleString("en-IN")} txns
                </span>
              ) : null}
            </div>
            <p className="text-xs text-white/40">
              Top revenue-producing parties from your General Ledger &middot; flags customer concentration risk for QoE
            </p>
          </div>
          <label
            htmlFor="qoe-gl-upload"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors cursor-pointer"
          >
            {glLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {glLoading ? "Uploading…" : topCustomers.length ? "Re-upload GL" : "Upload GL"}
          </label>
          <input
            id="qoe-gl-upload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleGlUpload(f);
            }}
          />
        </div>

        {glError && (
          <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" /> {glError}
          </div>
        )}

        {topCustomers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.015] px-5 py-8 text-center">
            <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/50">No GL uploaded yet.</p>
            <p className="text-[11px] text-white/35 mt-1">
              Upload a Zoho / Tally / QuickBooks General Ledger Excel to see the top 10 customers by revenue.
            </p>
          </div>
        ) : (
          <>
            {/* KPI strip: top-3 concentration + notable risk banner */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Top customer</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {top3[0]?.customer || "—"}
                </p>
                <p className="text-xs text-emerald-400 mt-0.5 tabular-nums">
                  {(top3[0]?.share_pct ?? 0).toFixed(1)}% of tracked revenue
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Top-3 share</p>
                <p className={`text-sm font-semibold tabular-nums mt-1 ${top3Share >= 50 ? "text-amber-300" : "text-white"}`}>
                  {top3Share.toFixed(1)}%
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  {top3Share >= 50 ? "Concentration risk — diligence flag" : "Well-diversified"}
                </p>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 col-span-2 md:col-span-1">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Top-10 tracked</p>
                <p className="text-sm font-semibold text-white tabular-nums mt-1">
                  {topConcentration.toFixed(1)}%
                </p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  of sales-side GL transactions
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-white/30 bg-white/[0.015]">
                    <th className="text-left px-4 py-2 font-medium">#</th>
                    <th className="text-left px-4 py-2 font-medium">Customer</th>
                    <th className="text-right px-4 py-2 font-medium">Revenue</th>
                    <th className="text-right px-4 py-2 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, i) => (
                    <tr key={c.customer + i} className="border-t border-white/3">
                      <td className="px-4 py-3 text-white/40 tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3 text-white truncate max-w-[300px]">{c.customer}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-white">{fmt(c.revenue)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{c.share_pct.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
              Aggregated from sales-side entries in your General Ledger; party names are shown here for your own
              review only — redaction applies before any LLM-based analysis.
              {glMeta?.source_format ? <> Source: <span className="text-white/50">{glMeta.source_format}</span>.</> : null}
            </p>
          </>
        )}
      </div>

      {/* Compliance matrix + workflow */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111] rounded-xl border border-white/8 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Compliance &amp; regulatory health</h3>
          <p className="text-xs text-white/40 mb-5">Continuous GST, TDS and MCA reconciliations</p>
          <div className="space-y-2.5">
            {COMPLIANCE_CHECKS.map((c) => (
              <div key={c.label} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                {c.status === "ok" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{c.label}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111] rounded-xl border border-white/8 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Review &amp; sign-off workflow</h3>
          <p className="text-xs text-white/40 mb-5">Every number traceable to ledger &middot; UDIN captured on export</p>

          <div className="space-y-3">
            <WorkflowStep step={1} title="AI prepares first draft" detail="Add-back candidates surfaced, rationale drafted, Ind AS tags applied" done />
            <WorkflowStep step={2} title="Preparer confirms ledger-level tie-out" detail="Each line item back-linked to Tally/Zoho transaction ID" done />
            <WorkflowStep
              step={3}
              title="CA reviews &amp; approves add-backs"
              detail={`${DEFAULT_ADDBACKS.filter((a) => a.status === "approved").length} approved &middot; ${DEFAULT_ADDBACKS.filter((a) => a.status === "pending").length} pending`}
              done={false}
              active
            />
            <WorkflowStep step={4} title="UDIN captured, PDF signed" detail="Report exported with CA's UDIN, firm seal, and advisory disclaimer" done={false} />
          </div>

          <div className="mt-6 pt-5 border-t border-white/5 text-[11px] text-white/40 leading-relaxed">
            <span className="text-white/60 font-medium">Advisory, not audit.</span> This workbook is produced for
            internal review and transaction support. It is not a substitute for a statutory audit opinion or a
            Big-4 QoE engagement.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-2.5 h-2.5" /> Approved
      </span>
    );
  if (status === "flagged")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">
        <AlertTriangle className="w-2.5 h-2.5" /> Flagged
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
      <Info className="w-2.5 h-2.5" /> Pending
    </span>
  );
}

function WorkflowStep({
  step,
  title,
  detail,
  done,
  active,
}: {
  step: number;
  title: string;
  detail: string;
  done: boolean;
  active?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${active ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5 bg-white/[0.02]"}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-semibold ${
          done
            ? "bg-emerald-500 text-white"
            : active
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            : "bg-white/5 text-white/30 border border-white/10"
        }`}
      >
        {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-white" dangerouslySetInnerHTML={{ __html: title }} />
          {active && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded-full">
              <ArrowUpRight className="w-2.5 h-2.5" /> In progress
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/40 mt-0.5" dangerouslySetInnerHTML={{ __html: detail }} />
      </div>
    </div>
  );
}
