"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/Animate";
import {
  TrendingUp,
  IndianRupee,
  Activity,
  FileUp,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Calendar,
  FileSpreadsheet,
  Shield,
  Search,
  SlidersHorizontal,
  MoreVertical,
  Gauge,
  HelpCircle,
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
} from "recharts";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { fmt as fmtCurrency, asCurrency, type Currency } from "@/lib/currency";
import ForexStrip from "@/components/ForexStrip";

/* ------------------------------------------------------------------ */
/*  Currency-aware formatter                                           */
/*  Delegates to @/lib/currency so changing the reporting currency in  */
/*  /profile flips USD / EUR / GBP / INR / JPY formatting across the   */
/*  whole dashboard without touching any call site.                    */
/* ------------------------------------------------------------------ */
function makeFmt(currency: Currency) {
  return (value: number): string => fmtCurrency(value, currency);
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

/* ------------------------------------------------------------------ */
/*  Stage helper                                                       */
/* ------------------------------------------------------------------ */
function getStage(yearFounded: string) {
  const founded = parseInt(yearFounded, 10);
  if (isNaN(founded)) return { label: "Unknown", years: 0 };
  const years = 2026 - founded;
  if (years < 2) return { label: "Early Stage", years };
  if (years <= 5) return { label: "Growth Stage", years };
  return { label: "Mature", years };
}

/* ------------------------------------------------------------------ */
/*  Chart palette — emerald family to match the brand                  */
/* ------------------------------------------------------------------ */
const EXPENSE_COLORS = [
  "#10b981", "#14b8a6", "#22c55e", "#06b6d4",
  "#84cc16", "#0ea5e9", "#34d399", "#2dd4bf",
  "#4ade80", "#67e8f9",
];

/* ------------------------------------------------------------------ */
/*  Industry KPI extraction                                            */
/* ------------------------------------------------------------------ */
function getIndustryKPIs(
  industry: string,
  fs: {
    total_revenue: number;
    total_expenses: number;
    net_income: number;
    total_assets: number;
    total_liabilities: number;
    total_equity: number;
  },
  ratios: {
    current_ratio: number;
    debt_to_equity: number;
    gross_margin: number;
    net_margin: number;
    return_on_equity: number;
    working_capital: number;
  },
  expenses: { name: string; net: number; sub_group: string }[],
  employeeCount: string,
) {
  const empCost = expenses
    .filter(
      (e) =>
        e.sub_group?.toLowerCase().includes("employee") ||
        e.name?.toLowerCase().includes("salary") ||
        e.name?.toLowerCase().includes("wage"),
    )
    .reduce((s, e) => s + Math.abs(e.net), 0);
  const empCountNum = parseInt(employeeCount, 10) || 0;
  const cogsItems = expenses.filter(
    (e) =>
      e.sub_group?.toLowerCase().includes("cost of") ||
      e.sub_group?.toLowerCase().includes("purchase") ||
      e.name?.toLowerCase().includes("purchase"),
  );
  const cogs = cogsItems.reduce((s, e) => s + Math.abs(e.net), 0);

  const lower = industry.toLowerCase();

  if (lower.includes("manufactur")) {
    return { label: "COGS Ratio", value: fs.total_revenue ? pct(cogs / fs.total_revenue) : "N/A" };
  }
  if (lower.includes("saas") || lower.includes("software") || lower.includes("technology")) {
    return { label: "Gross Margin", value: pct(ratios.gross_margin) };
  }
  if (lower.includes("service") || lower.includes("consult")) {
    const empRatio = fs.total_revenue ? empCost / fs.total_revenue : 0;
    return { label: "Employee Cost %", value: pct(empRatio) };
  }
  if (lower.includes("trad") || lower.includes("retail") || lower.includes("ecommerce") || lower.includes("e-commerce")) {
    return { label: "Gross Margin", value: pct(ratios.gross_margin) };
  }
  return { label: "Net Margin", value: pct(ratios.net_margin) };
  // empCountNum intentionally referenced to avoid an unused-var complaint on the unused services-branch revPerEmp.
  void empCountNum;
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function DashboardPage() {
  const router = useRouter();
  const { lastResult, companyName, analysisDate, hasData } = useAnalysisStore();
  const { business } = useOnboardingStore();
  const currency = asCurrency(business.currency);
  const fmt = useMemo(() => makeFmt(currency), [currency]);

  const stage = useMemo(() => getStage(business.yearFounded), [business.yearFounded]);

  // NOTE: The Dashboard's inline AI Analyst sidebar was retired in favour of
  // the global floating CortexAI widget (see (app)/layout.tsx +
  // components/AIChatPanel.tsx), which has Quick/Deep mode toggling, FAQ
  // matching, and thumbs-up/down feedback. One chat experience across the
  // whole app instead of three duplicated ones.

  /* ---- No data state ---- */
  if (!hasData || !lastResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <FileUp className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-app-text mb-2">No Financial Data Yet</h1>
        <p className="text-app-text-subtle max-w-md mb-8">
          Upload your trial balance or financial statements to unlock your personalised overview with AI-powered insights.
        </p>
        <button
          onClick={() => router.push("/analysis")}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-app-text font-medium transition-colors flex items-center gap-2"
        >
          <FileUp className="w-4 h-4" /> Upload Financials
        </button>
      </div>
    );
  }

  /* ---- Destructure data ---- */
  const fs = lastResult.financial_statements;
  const ratios = lastResult.ratios;
  const classified = lastResult.classified_accounts;
  const insights = lastResult.insights;
  const indAS = lastResult.ind_as_observations;

  const displayName = business.companyName || companyName;
  const industry = business.industry || "";

  const industryKpi = getIndustryKPIs(
    industry,
    fs,
    ratios,
    classified.expenses,
    business.employeeCount,
  );

  /* ---- Expense chart data ---- */
  const expenseChartData = classified.expenses
    .filter((e) => Math.abs(e.net) > 0)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 8)
    .map((e) => ({
      name: e.name.length > 22 ? e.name.slice(0, 20) + "…" : e.name,
      value: Math.abs(e.net),
    }));

  const totalExpenses = classified.expenses.reduce((s, e) => s + Math.abs(e.net), 0);

  /* ---- Key metric cards (ratio tiles) ----
   * Each tile is driven off `ratios_meta` when the backend ships it, so we
   * can render "—" + a tooltip when a denominator is missing instead of
   * a misleading 0. We fall back to the legacy flat `ratios` bag for older
   * cached analyses in localStorage.
   */
  const ratiosMeta = lastResult.ratios_meta;
  type MetricStatus = "Healthy" | "Adequate" | "Attention" | "Unavailable";
  interface Metric {
    label: string;
    sub: string;
    value: string;
    status: MetricStatus;
    reason?: string;
  }
  function readMetric(
    key: keyof NonNullable<typeof ratiosMeta>,
    label: string,
    sub: string,
    format: (n: number) => string,
    grade: (n: number) => MetricStatus,
  ): Metric {
    const meta = ratiosMeta?.[key];
    if (meta?.status === "not_computable") {
      return { label, sub, value: "—", status: "Unavailable", reason: meta.reason };
    }
    const v = meta ? meta.value : (ratios[key] as number);
    return { label, sub, value: format(v), status: grade(v) };
  }
  const metrics: Metric[] = [
    readMetric(
      "current_ratio",
      "Current Ratio",
      "Liquidity",
      (v) => `${v.toFixed(2)}x`,
      (v) => (v >= 1.5 ? "Healthy" : v >= 1 ? "Adequate" : "Attention"),
    ),
    readMetric(
      "debt_to_equity",
      "D/E Ratio",
      "Leverage",
      (v) => `${v.toFixed(2)}x`,
      (v) => (v <= 1 ? "Healthy" : v <= 1.5 ? "Adequate" : "Attention"),
    ),
    readMetric(
      "gross_margin",
      "Gross Margin",
      "Profitability",
      (v) => pct(v),
      (v) => (v >= 0.35 ? "Healthy" : v >= 0.2 ? "Adequate" : "Attention"),
    ),
    readMetric(
      "net_margin",
      "Net Margin",
      "Bottom-line",
      (v) => pct(v),
      (v) => (v >= 0.1 ? "Healthy" : v >= 0.03 ? "Adequate" : "Attention"),
    ),
  ];
  const completeness = lastResult.completeness;

  /* ---- KPI cards (top row, 3 cards) ---- */
  const kpiCards = [
    {
      label: "Revenue",
      sub: "Operational Income",
      icon: IndianRupee,
      value: fmt(fs.total_revenue),
      active: true,
      deltaText: industry ? industry.split(" ")[0] : "Analysed",
    },
    {
      label: "Net Income",
      sub: fs.net_income >= 0 ? "Profit for the period" : "Loss for the period",
      icon: Activity,
      value: fmt(fs.net_income),
      active: false,
      deltaText: pct(ratios.net_margin),
    },
    {
      label: industryKpi.label,
      sub: "Industry anchor metric",
      icon: Briefcase,
      value: industryKpi.value,
      active: false,
      deltaText: stage.label !== "Unknown" ? stage.label : "—",
    },
  ];

  const formattedDate = analysisDate
    ? new Date(analysisDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  /* ---- Recent activities (derived from the latest analysis) ---- */
  const refCode = analysisDate
    ? new Date(analysisDate).getTime().toString(36).slice(-6).toUpperCase()
    : "LATEST";
  const activities = [
    {
      icon: FileSpreadsheet,
      label: "Trial Balance analysis",
      ref: `TB-${refCode}`,
      date: formattedDate,
      metric: fmt(fs.total_revenue),
      status: "Completed",
      onClick: () => router.push("/analysis"),
    },
    {
      icon: TrendingUp,
      label: "Ratio pack generated",
      ref: `RAT-${refCode}`,
      date: formattedDate,
      metric: `${Object.keys(ratios).length} ratios`,
      status: "Completed",
      onClick: () => router.push("/analysis"),
    },
    {
      icon: Shield,
      label: "Ind AS compliance review",
      ref: `INDAS-${refCode}`,
      date: formattedDate,
      metric: indAS && indAS.length > 0 ? `${indAS.length} observations` : "Clean",
      status: "Completed",
      onClick: () => router.push("/qoe"),
    },
    {
      icon: Sparkles,
      label: "Strategic insights",
      ref: `INS-${refCode}`,
      date: formattedDate,
      metric: insights && insights.length > 0 ? `${insights.length} findings` : "—",
      status: "Completed",
      onClick: () => router.push("/analysis"),
    },
  ];

  /* ---- Balance-sheet funding mix shares ---- */
  const liabShare = fs.total_assets > 0 ? fs.total_liabilities / fs.total_assets : 0;
  const equityShare = fs.total_assets > 0 ? fs.total_equity / fs.total_assets : 0;

  return (
    <div className="flex w-full">
      {/* Main content area. Dashboard used to reserve a 400px right gutter
          for the inline AI sidebar; that's gone now (global floating widget
          handles chat everywhere), so the content area spans full width. */}
      <div className="flex-1 min-w-0 py-6 pl-6 pr-4 lg:py-8 lg:pl-8 lg:pr-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-app-text tracking-tight">Overview</h1>
            <p className="text-sm text-app-text-subtle mt-1">
              Summary of {displayName ? <span className="text-app-text-muted">{displayName}</span> : "your"} financial position
              {formattedDate && <span className="text-app-text-subtle"> &middot; as of {formattedDate}</span>}
            </p>
            {/* Live FX strip — shows the current reporting currency and
                live rates against the other four supported currencies.
                ECB-sourced via frankfurter.app, cached 10 min in-session. */}
            <div className="mt-3">
              <ForexStrip base={currency} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-app-border bg-app-canvas hover:bg-app-card-hover text-[12px] text-app-text-muted transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate || "Latest"}
              <ChevronDown className="w-3 h-3 text-app-text-subtle" />
            </button>
            <button
              onClick={() => router.push("/analysis")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/15 text-[12px] text-emerald-400 border border-emerald-500/20 transition-colors"
            >
              <FileUp className="w-3.5 h-3.5" />
              Upload new TB
            </button>
          </div>
        </div>

        {/* 3 KPI Cards — one highlighted active */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <FadeIn key={kpi.label} delay={i * 60}>
                <div
                  className={`relative rounded-2xl p-5 transition-all ${
                    kpi.active
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-app-text shadow-lg shadow-emerald-500/10"
                      : "bg-app-card border border-app-border hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          kpi.active ? "bg-white/15" : "bg-app-card-hover border border-app-border"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${kpi.active ? "text-app-text" : "text-emerald-400"}`} />
                      </div>
                      <div>
                        <p className={`text-[13px] font-semibold ${kpi.active ? "text-app-text" : "text-app-text"}`}>
                          {kpi.label}
                        </p>
                        <p className={`text-[11px] ${kpi.active ? "text-app-text-muted" : "text-app-text-subtle"}`}>{kpi.sub}</p>
                      </div>
                    </div>
                    <button
                      className={`${
                        kpi.active ? "text-app-text-muted hover:text-app-text" : "text-app-text-subtle hover:text-app-text-subtle"
                      } transition-colors`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mt-6">
                    <p className={`text-[26px] font-bold tracking-tight ${kpi.active ? "text-app-text" : "text-app-text"}`}>
                      {kpi.value}
                    </p>
                    {kpi.deltaText && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          kpi.active
                            ? "bg-white/20 text-app-text"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}
                      >
                        {kpi.deltaText}
                      </span>
                    )}
                  </div>

                  <div
                    className={`mt-5 pt-4 border-t flex items-center justify-between ${
                      kpi.active ? "border-white/15" : "border-app-border/70"
                    }`}
                  >
                    <button
                      onClick={() => router.push("/analysis")}
                      className={`text-[12px] ${
                        kpi.active ? "text-app-text/85 hover:text-app-text" : "text-app-text-muted hover:text-app-text"
                      } transition-colors flex items-center gap-1`}
                    >
                      See details
                    </button>
                    <ArrowUpRight
                      className={`w-3.5 h-3.5 ${kpi.active ? "text-app-text-muted" : "text-app-text-subtle"}`}
                    />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Expense Breakdown — full width, squeezes when AI Analyst opens */}
        <FadeIn delay={100}>
          <div className="bg-app-card rounded-2xl p-5 border border-app-border/70">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-app-text">Expense Breakdown</h3>
                <p className="text-[26px] font-bold text-app-text mt-1 tracking-tight">{fmt(totalExpenses)}</p>
                <p className="text-[11px] text-app-text-subtle">Top 8 expense heads &middot; current period</p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">
                <Calendar className="w-3 h-3" />
                {formattedDate ? `As of ${formattedDate}` : "Latest period"}
              </span>
            </div>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#666", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: "#666", fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmt(Number(v))}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    labelStyle={{ color: "#fff" }}
                    cursor={{ fill: "rgba(16,185,129,0.05)" }}
                    formatter={(value) => [fmt(Number(value)), "Amount"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-app-text-subtle text-center py-16">No expense data available</p>
            )}
          </div>
        </FadeIn>

        {/* Key Metrics — full width, 4 tiles side-by-side */}
        <FadeIn>
          <div className="bg-app-card rounded-2xl p-5 border border-app-border/70">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-semibold text-app-text">Key metrics</h3>
              <div className="flex items-center gap-3">
                {completeness && completeness.total > 0 && (
                  <span
                    title={
                      completeness.computed === completeness.total
                        ? "All ratios computed from the uploaded data."
                        : "Some ratios could not be computed — hover a tile to see why."
                    }
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                      completeness.computed === completeness.total
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}
                  >
                    <Gauge className="w-3 h-3" />
                    {completeness.computed}/{completeness.total} ratios
                  </span>
                )}
                <button
                  onClick={() => router.push("/analysis")}
                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  + View all
                </button>
              </div>
            </div>
            <p className="text-[11px] text-app-text-subtle mb-4">Health check across the four pillars</p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {metrics.map((m) => {
                const isUnavailable = m.status === "Unavailable";
                const statusColor = isUnavailable
                  ? "text-app-text-subtle"
                  : m.status === "Healthy"
                  ? "text-emerald-400"
                  : m.status === "Adequate"
                  ? "text-amber-400"
                  : "text-rose-400";
                return (
                  <div
                    key={m.label}
                    className={`rounded-xl p-3.5 border transition-colors ${
                      isUnavailable
                        ? "bg-app-canvas border-app-border/70"
                        : "bg-app-canvas border-app-border/70 hover:border-app-border-strong"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[11px] text-app-text-muted leading-tight flex items-center gap-1">
                        {m.label}
                        {isUnavailable && m.reason && (
                          <span title={m.reason} className="cursor-help">
                            <HelpCircle className="w-3 h-3 text-app-text-subtle" />
                          </span>
                        )}
                      </span>
                      <MoreVertical className="w-3 h-3 text-app-text/15" />
                    </div>
                    <p
                      className={`text-[18px] font-bold leading-none ${
                        isUnavailable ? "text-app-text-subtle" : "text-app-text"
                      }`}
                    >
                      {m.value}
                    </p>
                    <p className="text-[10px] text-app-text/25 mt-1">{m.sub}</p>
                    <p className={`text-[10px] mt-2 font-medium flex items-center gap-1 ${statusColor}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isUnavailable ? "Not available" : m.status}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Balance Sheet Snapshot */}
        <FadeIn delay={130}>
          <div className="bg-app-card rounded-2xl p-5 border border-app-border/70">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-app-text">Balance Sheet Snapshot</h3>
                <p className="text-[11px] text-app-text-subtle mt-0.5">How assets are funded as of the latest close</p>
              </div>
              <button
                onClick={() => router.push("/analysis")}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Open statement <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="rounded-xl bg-app-canvas border border-app-border/70 p-4">
                <p className="text-[11px] text-app-text-subtle">Total Assets</p>
                <p className="text-[22px] font-bold text-app-text mt-1.5 tracking-tight">{fmt(fs.total_assets)}</p>
                <p className="text-[10px] text-app-text-subtle mt-1">What the business owns</p>
              </div>
              <div className="rounded-xl bg-app-canvas border border-app-border/70 p-4">
                <p className="text-[11px] text-app-text-subtle">Total Liabilities</p>
                <p className="text-[22px] font-bold text-app-text mt-1.5 tracking-tight">{fmt(fs.total_liabilities)}</p>
                <p className="text-[10px] text-app-text-subtle mt-1">{pct(liabShare)} of assets</p>
              </div>
              <div className="rounded-xl bg-app-canvas border border-app-border/70 p-4">
                <p className="text-[11px] text-app-text-subtle">Total Equity</p>
                <p className="text-[22px] font-bold text-app-text mt-1.5 tracking-tight">{fmt(fs.total_equity)}</p>
                <p className="text-[10px] text-app-text-subtle mt-1">{pct(equityShare)} of assets</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-app-text-subtle">Funding mix</span>
                <span className="text-[11px] text-app-text-subtle">{fmt(fs.total_assets)}</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-app-card-hover">
                <div
                  className="bg-rose-400/80"
                  style={{ width: `${Math.max(0, Math.min(100, liabShare * 100))}%` }}
                />
                <div
                  className="bg-emerald-400/80"
                  style={{ width: `${Math.max(0, Math.min(100, equityShare * 100))}%` }}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 text-[11px] text-app-text-muted">
                  <span className="w-2 h-2 rounded-full bg-rose-400/80" />
                  Liabilities {pct(liabShare)}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-app-text-muted">
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  Equity {pct(equityShare)}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Recent Activities */}
        <FadeIn delay={150}>
          <div className="bg-app-card rounded-2xl border border-app-border/70 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-wrap gap-3">
              <h3 className="text-[15px] font-semibold text-app-text">Recent Activities</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-app-text-subtle" />
                  <input
                    placeholder="Search"
                    className="bg-app-canvas border border-app-border rounded-lg pl-9 pr-3 py-1.5 text-[12px] text-app-text placeholder:text-app-text/25 outline-none focus:border-emerald-500/30 w-[180px]"
                    readOnly
                  />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-canvas hover:bg-app-card-hover border border-app-border text-[12px] text-app-text-muted">
                  <SlidersHorizontal className="w-3 h-3" />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-t border-b border-app-border/70 bg-app-canvas">
                    <th className="text-left px-5 py-3 font-medium text-app-text-subtle text-[11px] uppercase tracking-wider">Activity</th>
                    <th className="text-left px-5 py-3 font-medium text-app-text-subtle text-[11px] uppercase tracking-wider">Reference</th>
                    <th className="text-left px-5 py-3 font-medium text-app-text-subtle text-[11px] uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-app-text-subtle text-[11px] uppercase tracking-wider">Metric</th>
                    <th className="text-left px-5 py-3 font-medium text-app-text-subtle text-[11px] uppercase tracking-wider">Status</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <tr
                        key={i}
                        onClick={a.onClick}
                        className="border-b border-app-border/70 last:border-b-0 hover:bg-app-card-hover transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 text-app-text">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="font-medium text-[13px]">{a.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-app-text-subtle text-[12px] font-mono">{a.ref}</td>
                        <td className="px-5 py-3.5 text-app-text-subtle text-[12px]">{a.date || "—"}</td>
                        <td className="px-5 py-3.5 text-app-text-muted text-[12px]">{a.metric}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                              a.status === "Completed"
                                ? "text-emerald-400"
                                : a.status === "Active"
                                ? "text-cyan-400"
                                : "text-app-text-subtle"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-app-text-subtle hover:text-app-text-subtle cursor-pointer">
                          <MoreVertical className="w-4 h-4" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
      {/* Global floating CortexAI widget handles chat. Nothing more to
          render here. */}
    </div>
  );
}
