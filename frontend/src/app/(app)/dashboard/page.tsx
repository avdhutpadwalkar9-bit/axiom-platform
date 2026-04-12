"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  IndianRupee,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  ArrowUpRight,
  FileUp,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  MessageCircleQuestion,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

/* ------------------------------------------------------------------ */
/*  Indian currency formatter: L (lakhs) and Cr (crores)              */
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
  if (years < 2) return { label: "Early Stage", years, focus: "Burn rate & runway" };
  if (years <= 5) return { label: "Growth Stage", years, focus: "Scaling efficiency" };
  return { label: "Mature", years, focus: "Profitability & returns" };
}

/* ------------------------------------------------------------------ */
/*  Severity configs                                                   */
/* ------------------------------------------------------------------ */
const severityConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  high: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  medium: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  low: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
};

function getSevConfig(severity: string) {
  return severityConfig[severity.toLowerCase()] ?? severityConfig.info;
}

/* ------------------------------------------------------------------ */
/*  Chart colours                                                      */
/* ------------------------------------------------------------------ */
const EXPENSE_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa", "#c084fc",
  "#818cf8", "#7c3aed", "#6d28d9", "#4f46e5",
  "#4338ca", "#5b21b6",
];
const PIE_COLORS = ["#6366f1", "#ef4444", "#22c55e"];

/* ------------------------------------------------------------------ */
/*  Industry KPI extraction                                            */
/* ------------------------------------------------------------------ */
function getIndustryKPIs(
  industry: string,
  fs: { total_revenue: number; total_expenses: number; net_income: number; total_assets: number; total_liabilities: number; total_equity: number },
  ratios: { current_ratio: number; debt_to_equity: number; gross_margin: number; net_margin: number; return_on_equity: number; working_capital: number },
  expenses: { name: string; net: number; sub_group: string }[],
  employeeCount: string,
) {
  const empCost = expenses.filter(
    (e) => e.sub_group?.toLowerCase().includes("employee") || e.name?.toLowerCase().includes("salary") || e.name?.toLowerCase().includes("wage"),
  ).reduce((s, e) => s + Math.abs(e.net), 0);
  const empCountNum = parseInt(employeeCount, 10) || 0;
  const cogsItems = expenses.filter(
    (e) => e.sub_group?.toLowerCase().includes("cost of") || e.sub_group?.toLowerCase().includes("purchase") || e.name?.toLowerCase().includes("purchase"),
  );
  const cogs = cogsItems.reduce((s, e) => s + Math.abs(e.net), 0);
  const stockItems = expenses.filter(
    (e) => e.name?.toLowerCase().includes("stock") || e.name?.toLowerCase().includes("inventory"),
  );
  const stockVal = stockItems.reduce((s, e) => s + Math.abs(e.net), 0);

  const lower = industry.toLowerCase();

  if (lower.includes("manufactur")) {
    return {
      label: "Manufacturing",
      kpis: [
        { label: "COGS Ratio", value: fs.total_revenue ? pct(cogs / fs.total_revenue) : "N/A" },
        { label: "Inventory Turnover", value: stockVal > 0 ? `${(cogs / stockVal).toFixed(1)}x` : "N/A" },
        { label: "Working Capital", value: fmt(ratios.working_capital) },
        { label: "Raw Material %", value: fs.total_expenses ? pct(cogs / fs.total_expenses) : "N/A" },
      ],
      mainKpi: { label: "COGS Ratio", value: fs.total_revenue ? pct(cogs / fs.total_revenue) : "N/A" },
    };
  }

  if (lower.includes("saas") || lower.includes("software") || lower.includes("technology")) {
    const empRatio = fs.total_revenue ? empCost / fs.total_revenue : 0;
    return {
      label: "SaaS / Tech",
      kpis: [
        { label: "Employee Cost Ratio", value: pct(empRatio) },
        { label: "Gross Margin", value: pct(ratios.gross_margin) },
        { label: "Net Margin", value: pct(ratios.net_margin) },
        { label: "Operating Leverage", value: fs.total_expenses > 0 ? `${(fs.total_revenue / fs.total_expenses).toFixed(2)}x` : "N/A" },
      ],
      mainKpi: { label: "Gross Margin", value: pct(ratios.gross_margin) },
    };
  }

  if (lower.includes("service") || lower.includes("consult")) {
    const empRatio = fs.total_revenue ? empCost / fs.total_revenue : 0;
    const revPerEmp = empCountNum > 0 ? fs.total_revenue / empCountNum : 0;
    return {
      label: "Services",
      kpis: [
        { label: "Employee Cost Ratio", value: pct(empRatio) },
        { label: "Revenue / Employee", value: revPerEmp > 0 ? fmt(revPerEmp) : "N/A" },
        { label: "Operating Margin", value: pct((fs.total_revenue - fs.total_expenses) / (fs.total_revenue || 1)) },
        { label: "Net Margin", value: pct(ratios.net_margin) },
      ],
      mainKpi: { label: "Employee Cost %", value: pct(empRatio) },
    };
  }

  if (lower.includes("trad") || lower.includes("retail") || lower.includes("ecommerce") || lower.includes("e-commerce")) {
    return {
      label: "Trading",
      kpis: [
        { label: "Gross Margin", value: pct(ratios.gross_margin) },
        { label: "Stock Turnover", value: stockVal > 0 ? `${(cogs / stockVal).toFixed(1)}x` : "N/A" },
        { label: "Net Margin", value: pct(ratios.net_margin) },
        { label: "Working Capital", value: fmt(ratios.working_capital) },
      ],
      mainKpi: { label: "Gross Margin", value: pct(ratios.gross_margin) },
    };
  }

  // Default
  return {
    label: "General",
    kpis: [
      { label: "Current Ratio", value: `${ratios.current_ratio.toFixed(2)}x` },
      { label: "D/E Ratio", value: `${ratios.debt_to_equity.toFixed(2)}x` },
      { label: "Gross Margin", value: pct(ratios.gross_margin) },
      { label: "Net Margin", value: pct(ratios.net_margin) },
      { label: "ROE", value: pct(ratios.return_on_equity) },
      { label: "Working Capital", value: fmt(ratios.working_capital) },
    ],
    mainKpi: { label: "Net Margin", value: pct(ratios.net_margin) },
  };
}

/* ------------------------------------------------------------------ */
/*  AI Summary generator                                               */
/* ------------------------------------------------------------------ */
function buildSummary(
  companyName: string,
  industry: string,
  entityType: string,
  stage: { label: string; years: number; focus?: string },
  fs: { total_revenue: number; total_expenses: number; net_income: number; total_assets: number; total_liabilities: number; total_equity: number },
  ratios: { gross_margin: number; net_margin: number; debt_to_equity: number; return_on_equity: number },
): string {
  const profitable = fs.net_income > 0;
  const highMargin = ratios.gross_margin > 0.4;
  const leveraged = ratios.debt_to_equity > 1.5;

  let s = `${companyName} is a ${stage.label.toLowerCase()} ${entityType || "business"} in the ${industry || "general"} space. `;

  if (profitable) {
    s += `The company is currently profitable with a net margin of ${pct(ratios.net_margin)}${highMargin ? " and healthy gross margins" : ""}. `;
  } else {
    s += `The company is currently operating at a loss of ${fmt(Math.abs(fs.net_income))}, which ${stage.label === "Early Stage" ? "is typical at this stage but should be monitored for runway" : "needs immediate attention"}. `;
  }

  if (leveraged) {
    s += `Debt-to-equity of ${ratios.debt_to_equity.toFixed(2)}x suggests the business is significantly leveraged, which may pressure cash flows during tighter quarters. `;
  } else {
    s += `The capital structure looks ${ratios.debt_to_equity < 0.5 ? "conservatively financed" : "reasonably balanced"} with a D/E of ${ratios.debt_to_equity.toFixed(2)}x. `;
  }

  if (stage.focus) {
    s += `Given the ${stage.label.toLowerCase()} profile, the primary focus should be on ${stage.focus.toLowerCase()}.`;
  }

  return s;
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function DashboardPage() {
  const router = useRouter();
  const { lastResult, companyName, analysisDate, hasData } = useAnalysisStore();
  const { business } = useOnboardingStore();

  const stage = useMemo(() => getStage(business.yearFounded), [business.yearFounded]);

  /* ---- No data state ---- */
  if (!hasData || !lastResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
          <FileUp className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">No Financial Data Yet</h1>
        <p className="text-white/50 max-w-md mb-8">
          Upload your trial balance or financial statements to unlock your personalised executive dashboard with AI-powered insights.
        </p>
        <button
          onClick={() => router.push("/analysis")}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors flex items-center gap-2"
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
  const aiQuestions = lastResult.ai_questions;

  const displayName = business.companyName || companyName;
  const industry = business.industry || "";
  const entityType = business.entityType || "";

  const industryData = getIndustryKPIs(industry, fs, ratios, classified.expenses, business.employeeCount);
  const summary = buildSummary(displayName, industry, entityType, stage, fs, ratios);

  /* ---- Expense chart data ---- */
  const expenseChartData = classified.expenses
    .filter((e) => Math.abs(e.net) > 0)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 10)
    .map((e) => ({ name: e.name.length > 28 ? e.name.slice(0, 25) + "..." : e.name, value: Math.abs(e.net) }));

  const totalExpenses = classified.expenses.reduce((s, e) => s + Math.abs(e.net), 0);

  /* ---- Balance sheet pie data ---- */
  const bsPieData = [
    { name: "Assets", value: Math.abs(fs.total_assets) },
    { name: "Liabilities", value: Math.abs(fs.total_liabilities) },
    { name: "Equity", value: Math.abs(fs.total_equity) },
  ];

  /* ---- KPI cards ---- */
  const kpiCards = [
    { label: "Revenue", value: fmt(fs.total_revenue), icon: IndianRupee, color: "from-emerald-500 to-teal-500" },
    { label: "Expenses", value: fmt(fs.total_expenses), icon: TrendingUp, color: "from-red-500 to-orange-500" },
    { label: "Net Income", value: fmt(fs.net_income), icon: Activity, color: fs.net_income >= 0 ? "from-indigo-500 to-purple-500" : "from-red-600 to-red-400" },
    { label: industryData.mainKpi.label, value: industryData.mainKpi.value, icon: Briefcase, color: "from-amber-500 to-yellow-500" },
  ];

  const formattedDate = analysisDate ? new Date(analysisDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-sm text-white/50 mt-1">
            {displayName} &middot; {formattedDate}
            {stage.label !== "Unknown" && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {stage.label}{stage.years > 0 ? ` (${stage.years}y)` : ""}
              </span>
            )}
            {industry && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40 border border-white/10">
                {industry}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-white">AI Summary</h2>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">{summary}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white/[0.03] rounded-xl p-5 border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center opacity-80`}>
                <kpi.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-xs text-white/50 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Industry KPIs */}
      <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            {industryData.label} KPIs
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industryData.kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-1">{kpi.label}</p>
              <p className="text-lg font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Expense Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white">Expense Breakdown</h3>
              <p className="text-xs text-white/50 mt-0.5">Top 10 expense heads &middot; Total: {fmt(totalExpenses)}</p>
            </div>
          </div>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  type="number"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => fmt(Number(v))}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={160}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#9ca3af" }}
                  formatter={(value) => [fmt(Number(value)), "Amount"]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {expenseChartData.map((_, i) => (
                    <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-white/30 text-center py-12">No expense data available</p>
          )}
        </div>

        {/* Balance Sheet Pie Chart */}
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Balance Sheet</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={bsPieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {bsPieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} opacity={0.8} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value) => [fmt(Number(value)), ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {bsPieData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className="text-white/50">{item.name}</span>
                </span>
                <span className="text-white font-medium">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      {insights && insights.length > 0 && (
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            <span className="text-xs text-white/30 ml-auto">{insights.length} findings</span>
          </div>
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const config = getSevConfig(insight.severity);
              const Icon = config.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-4 p-4 rounded-xl ${config.bg} border ${config.border}`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                      <span className="text-xs text-white/30 capitalize">{insight.category}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{insight.detail}</p>
                    {insight.action && (
                      <button className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        {insight.action} <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ind AS Observations */}
      {indAS && indAS.length > 0 && (
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Ind AS Observations</h3>
            <span className="text-xs text-white/30 ml-auto">{indAS.length} observations</span>
          </div>
          <div className="space-y-3">
            {indAS.map((obs, idx) => {
              const config = getSevConfig(obs.severity);
              const Icon = config.icon;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-4 rounded-xl ${config.bg} border ${config.border}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded">
                        {obs.standard}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 leading-relaxed">{obs.observation}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Questions */}
      {aiQuestions && aiQuestions.length > 0 && (
        <div className="bg-white/[0.03] rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageCircleQuestion className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Questions for Management</h3>
            <span className="text-xs text-white/30 ml-auto">{aiQuestions.length} questions</span>
          </div>
          <div className="space-y-3">
            {aiQuestions.map((q, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-amber-400/5 border border-amber-400/10"
              >
                <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium mb-1">{q.question}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{q.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
