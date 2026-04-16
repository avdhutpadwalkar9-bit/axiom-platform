"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AIChatBubble from "@/components/AIChatBubble";
import ModelSelector from "@/components/ModelSelector";
import { FadeIn } from "@/components/Animate";
import {
  TrendingUp,
  IndianRupee,
  Activity,
  FileUp,
  Briefcase,
  Sparkles,
  Send,
  X,
  ArrowUpRight,
  ChevronDown,
  Calendar,
  FileSpreadsheet,
  MessageSquare,
  Shield,
  Search,
  SlidersHorizontal,
  MoreVertical,
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/* ------------------------------------------------------------------ */
/*  Indian currency formatter                                          */
/* ------------------------------------------------------------------ */
function fmt(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}\u20B9${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}\u20B9${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}\u20B9${(abs / 1_000).toFixed(1)}K`;
  return `${sign}\u20B9${abs.toFixed(0)}`;
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

  const stage = useMemo(() => getStage(business.yearFounded), [business.yearFounded]);

  // AI Analyst sidebar state
  const [showAnalyst, setShowAnalyst] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatProvider, setChatProvider] = useState<"claude" | "gemini" | "groq">("claude");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleAskAI = async () => {
    if (!chatInput.trim() || !lastResult) return;
    const question = chatInput.trim();
    const updatedHistory: { role: "user" | "ai"; text: string }[] = [
      ...chatMessages,
      { role: "user", text: question },
    ];
    setChatInput("");
    setChatMessages(updatedHistory);
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          analysis_result: lastResult,
          conversation_history: updatedHistory.slice(-10),
          provider: chatProvider,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: data.response || data.answer || "I couldn't generate a response." },
      ]);
    } catch (err) {
      const detail = err instanceof Error && err.message ? err.message : "please try again.";
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: `Sorry, I couldn't reach the AI service — ${detail}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ---- No data state ---- */
  if (!hasData || !lastResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <FileUp className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">No Financial Data Yet</h1>
        <p className="text-white/40 max-w-md mb-8">
          Upload your trial balance or financial statements to unlock your personalised overview with AI-powered insights.
        </p>
        <button
          onClick={() => router.push("/analysis")}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-medium transition-colors flex items-center gap-2"
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

  /* ---- Key metric cards (ratio tiles) ---- */
  const metrics = [
    {
      label: "Current Ratio",
      value: `${ratios.current_ratio.toFixed(2)}x`,
      sub: "Liquidity",
      status: ratios.current_ratio >= 1.5 ? "Healthy" : ratios.current_ratio >= 1 ? "Adequate" : "Attention",
    },
    {
      label: "D/E Ratio",
      value: `${ratios.debt_to_equity.toFixed(2)}x`,
      sub: "Leverage",
      status: ratios.debt_to_equity <= 1 ? "Healthy" : ratios.debt_to_equity <= 1.5 ? "Adequate" : "Attention",
    },
    {
      label: "Gross Margin",
      value: pct(ratios.gross_margin),
      sub: "Profitability",
      status: ratios.gross_margin >= 0.35 ? "Healthy" : ratios.gross_margin >= 0.2 ? "Adequate" : "Attention",
    },
    {
      label: "Net Margin",
      value: pct(ratios.net_margin),
      sub: "Bottom-line",
      status: ratios.net_margin >= 0.1 ? "Healthy" : ratios.net_margin >= 0.03 ? "Adequate" : "Attention",
    },
  ];

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
      icon: MessageSquare,
      label: "AI Analyst session",
      ref: `AI-${refCode}`,
      date: formattedDate,
      metric: chatMessages.length > 0 ? `${chatMessages.length} messages` : "Ready",
      status: chatMessages.length > 0 ? "Active" : "Idle",
      onClick: () => setShowAnalyst(true),
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
    <div className="flex">
      {/* Main content area */}
      <div
        className={`flex-1 min-w-0 p-6 lg:p-8 space-y-6 transition-all duration-300 ${
          showAnalyst ? "mr-[400px]" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-white tracking-tight">Overview</h1>
            <p className="text-sm text-white/40 mt-1">
              Summary of {displayName ? <span className="text-white/60">{displayName}</span> : "your"} financial position
              {formattedDate && <span className="text-white/30"> &middot; as of {formattedDate}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/8 bg-white/3 hover:bg-white/5 text-[12px] text-white/60 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate || "Latest"}
              <ChevronDown className="w-3 h-3 text-white/30" />
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
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-[#111] border border-white/8 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          kpi.active ? "bg-white/15" : "bg-white/5 border border-white/8"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${kpi.active ? "text-white" : "text-emerald-400"}`} />
                      </div>
                      <div>
                        <p className={`text-[13px] font-semibold ${kpi.active ? "text-white" : "text-white"}`}>
                          {kpi.label}
                        </p>
                        <p className={`text-[11px] ${kpi.active ? "text-white/70" : "text-white/35"}`}>{kpi.sub}</p>
                      </div>
                    </div>
                    <button
                      className={`${
                        kpi.active ? "text-white/60 hover:text-white" : "text-white/20 hover:text-white/40"
                      } transition-colors`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-baseline gap-2 mt-6">
                    <p className={`text-[26px] font-bold tracking-tight ${kpi.active ? "text-white" : "text-white"}`}>
                      {kpi.value}
                    </p>
                    {kpi.deltaText && (
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          kpi.active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                        }`}
                      >
                        {kpi.deltaText}
                      </span>
                    )}
                  </div>

                  <div
                    className={`mt-5 pt-4 border-t flex items-center justify-between ${
                      kpi.active ? "border-white/15" : "border-white/5"
                    }`}
                  >
                    <button
                      onClick={() => router.push("/analysis")}
                      className={`text-[12px] ${
                        kpi.active ? "text-white/85 hover:text-white" : "text-white/50 hover:text-white"
                      } transition-colors flex items-center gap-1`}
                    >
                      See details
                    </button>
                    <ArrowUpRight
                      className={`w-3.5 h-3.5 ${kpi.active ? "text-white/70" : "text-white/30"}`}
                    />
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Split row: Key Metrics (left) + Expense Chart (right) */}
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Key Metrics — mirrors the "My Wallet" section in the reference */}
          <FadeIn>
            <div className="bg-[#111] rounded-2xl p-5 border border-white/5 h-full">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[15px] font-semibold text-white">Key metrics</h3>
                <button
                  onClick={() => router.push("/analysis")}
                  className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  + View all
                </button>
              </div>
              <p className="text-[11px] text-white/30 mb-4">Health check across the four pillars</p>

              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => {
                  const statusColor =
                    m.status === "Healthy"
                      ? "text-emerald-400"
                      : m.status === "Adequate"
                      ? "text-amber-400"
                      : "text-rose-400";
                  return (
                    <div
                      key={m.label}
                      className="bg-white/3 rounded-xl p-3.5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-[11px] text-white/50 leading-tight">{m.label}</span>
                        <MoreVertical className="w-3 h-3 text-white/15" />
                      </div>
                      <p className="text-[18px] font-bold text-white leading-none">{m.value}</p>
                      <p className="text-[10px] text-white/25 mt-1">{m.sub}</p>
                      <p className={`text-[10px] mt-2 font-medium flex items-center gap-1 ${statusColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {m.status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Right: Expense Breakdown chart — mirrors the "Cash Flow" block */}
          <FadeIn delay={100}>
            <div className="lg:col-span-2 bg-[#111] rounded-2xl p-5 border border-white/5 h-full">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[15px] font-semibold text-white">Expense Breakdown</h3>
                  <p className="text-[26px] font-bold text-white mt-1 tracking-tight">{fmt(totalExpenses)}</p>
                  <p className="text-[11px] text-white/30">Top 8 expense heads &middot; current period</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-500/20">
                  <Calendar className="w-3 h-3" />
                  {formattedDate ? `As of ${formattedDate}` : "Latest period"}
                </span>
              </div>
              {expenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
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
                <p className="text-sm text-white/20 text-center py-16">No expense data available</p>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Balance Sheet Snapshot */}
        <FadeIn delay={130}>
          <div className="bg-[#111] rounded-2xl p-5 border border-white/5">
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-[15px] font-semibold text-white">Balance Sheet Snapshot</h3>
                <p className="text-[11px] text-white/30 mt-0.5">How assets are funded as of the latest close</p>
              </div>
              <button
                onClick={() => router.push("/analysis")}
                className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Open statement <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                <p className="text-[11px] text-white/40">Total Assets</p>
                <p className="text-[22px] font-bold text-white mt-1.5 tracking-tight">{fmt(fs.total_assets)}</p>
                <p className="text-[10px] text-white/30 mt-1">What the business owns</p>
              </div>
              <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                <p className="text-[11px] text-white/40">Total Liabilities</p>
                <p className="text-[22px] font-bold text-white mt-1.5 tracking-tight">{fmt(fs.total_liabilities)}</p>
                <p className="text-[10px] text-white/30 mt-1">{pct(liabShare)} of assets</p>
              </div>
              <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                <p className="text-[11px] text-white/40">Total Equity</p>
                <p className="text-[22px] font-bold text-white mt-1.5 tracking-tight">{fmt(fs.total_equity)}</p>
                <p className="text-[10px] text-white/30 mt-1">{pct(equityShare)} of assets</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-white/40">Funding mix</span>
                <span className="text-[11px] text-white/40">{fmt(fs.total_assets)}</span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-white/5">
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
                <span className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <span className="w-2 h-2 rounded-full bg-rose-400/80" />
                  Liabilities {pct(liabShare)}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-white/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  Equity {pct(equityShare)}
                </span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Recent Activities */}
        <FadeIn delay={150}>
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-wrap gap-3">
              <h3 className="text-[15px] font-semibold text-white">Recent Activities</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                  <input
                    placeholder="Search"
                    className="bg-white/3 border border-white/8 rounded-lg pl-9 pr-3 py-1.5 text-[12px] text-white placeholder:text-white/25 outline-none focus:border-emerald-500/30 w-[180px]"
                    readOnly
                  />
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/3 hover:bg-white/5 border border-white/8 text-[12px] text-white/50">
                  <SlidersHorizontal className="w-3 h-3" />
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-t border-b border-white/5 bg-white/3">
                    <th className="text-left px-5 py-3 font-medium text-white/40 text-[11px] uppercase tracking-wider">Activity</th>
                    <th className="text-left px-5 py-3 font-medium text-white/40 text-[11px] uppercase tracking-wider">Reference</th>
                    <th className="text-left px-5 py-3 font-medium text-white/40 text-[11px] uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3 font-medium text-white/40 text-[11px] uppercase tracking-wider">Metric</th>
                    <th className="text-left px-5 py-3 font-medium text-white/40 text-[11px] uppercase tracking-wider">Status</th>
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
                        className="border-b border-white/5 last:border-b-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            <span className="font-medium text-[13px]">{a.label}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-white/40 text-[12px] font-mono">{a.ref}</td>
                        <td className="px-5 py-3.5 text-white/40 text-[12px]">{a.date || "—"}</td>
                        <td className="px-5 py-3.5 text-white/70 text-[12px]">{a.metric}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                              a.status === "Completed"
                                ? "text-emerald-400"
                                : a.status === "Active"
                                ? "text-cyan-400"
                                : "text-white/40"
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {a.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-white/20 hover:text-white/40 cursor-pointer">
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

      {/* ── AI Analyst floating button ── */}
      {!showAnalyst && (
        <button
          onClick={() => setShowAnalyst(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" /> AI Analyst
        </button>
      )}

      {/* ── AI Analyst Sidebar ── */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-[#111] border-l border-white/8 shadow-2xl shadow-black/30 z-40 flex flex-col transition-transform duration-300 ease-out ${
          showAnalyst ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">AI Analyst</p>
            <p className="text-[10px] text-white/30">Ask anything about your financials</p>
          </div>
          <button
            onClick={() => setShowAnalyst(false)}
            className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white/30" />
          </button>
        </div>

        <div className="px-6 py-3 border-b border-white/5 bg-white/3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">Analysing</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/60">
              {displayName}
            </span>
            {industry && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/60">
                {industry}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.length === 0 && (
            <div className="py-6">
              <p className="text-xs text-white/30 mb-4">Try asking:</p>
              <div className="space-y-2">
                {[
                  "Summarise my financial health",
                  "What are the biggest risks?",
                  "How can I improve profitability?",
                  "Explain the Ind AS issues",
                  "Build me a 12-month projection",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="flex w-full items-center gap-2 text-left text-sm text-white/40 hover:text-white bg-white/3 hover:bg-white/5 rounded-lg px-3.5 py-2.5 transition-colors border border-transparent hover:border-white/8"
                  >
                    <ArrowUpRight className="w-3 h-3 flex-shrink-0 text-white/15" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <AIChatBubble key={i} role={msg.role} text={msg.text} dark />
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-white/8 p-4">
          <div className="mb-2">
            <ModelSelector value={chatProvider} onChange={setChatProvider} />
          </div>
          <div className="flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskAI()}
              placeholder="Ask about your financials..."
              className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30 transition-colors"
            />
            <button
              onClick={handleAskAI}
              disabled={!chatInput.trim() || chatLoading}
              className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
