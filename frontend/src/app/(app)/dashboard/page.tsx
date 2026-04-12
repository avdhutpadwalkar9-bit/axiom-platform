"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  TrendingUp,
  IndianRupee,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  ChevronRight,
  FileUp,
  HelpCircle,
  ShieldCheck,
  Briefcase,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  Send,
  X,
  Check,
  ArrowUpRight,
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
/*  Highlighted term component (like Runway's colored links)           */
/* ------------------------------------------------------------------ */
function Hl({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "red" | "amber" }) {
  const colors = {
    blue: "text-blue-600 font-semibold",
    green: "text-emerald-600 font-semibold",
    red: "text-red-500 font-semibold",
    amber: "text-amber-600 font-semibold",
  };
  return <span className={colors[color]}>{children}</span>;
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
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleAskAI = async () => {
    if (!chatInput.trim() || !lastResult) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          analysis_result: lastResult,
          conversation_history: chatMessages.slice(-10),
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "ai", text: data.response || data.answer || "I couldn't generate a response." }]);
    } catch {
      setChatMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't connect to the AI service. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* ---- No data state ---- */
  if (!hasData || !lastResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-600/10 border border-emerald-200 flex items-center justify-center mb-6">
          <FileUp className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">No Financial Data Yet</h1>
        <p className="text-[#666] max-w-md mb-8">
          Upload your trial balance or financial statements to unlock your personalised executive dashboard with AI-powered insights.
        </p>
        <button
          onClick={() => router.push("/analysis")}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center gap-2"
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
    { label: "Net Income", value: fmt(fs.net_income), icon: Activity, color: fs.net_income >= 0 ? "from-emerald-500 to-emerald-600" : "from-red-600 to-red-400" },
    { label: industryData.mainKpi.label, value: industryData.mainKpi.value, icon: Briefcase, color: "from-amber-500 to-yellow-500" },
  ];

  const formattedDate = analysisDate ? new Date(analysisDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  /* ---- Identify top expenses ---- */
  const topExpenses = classified.expenses
    .filter((e) => Math.abs(e.net) > 0)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 3);

  const empCost = classified.expenses
    .filter((e) => e.sub_group?.toLowerCase().includes("employee") || e.name?.toLowerCase().includes("salary") || e.name?.toLowerCase().includes("wage"))
    .reduce((s, e) => s + Math.abs(e.net), 0);

  return (
    <div className="flex">
      {/* Main content area */}
      <div className={`flex-1 p-6 lg:p-8 space-y-6 max-w-[1400px] transition-all duration-300 ${showAnalyst ? "mr-[400px]" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1a1a1a]">Executive Dashboard</h1>
            </div>
            <p className="text-sm text-[#666] mt-1">
              {displayName} &middot; {formattedDate}
              {stage.label !== "Unknown" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {stage.label}{stage.years > 0 ? ` (${stage.years}y)` : ""}
                </span>
              )}
              {industry && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-[#fafafa] text-[#999] border border-[#e5e5e5]">
                  {industry}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl p-5 border border-[#e5e5e5] hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-[#666] mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* ── Narrative Insights Section (Runway BvA style) ── */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-[#1a1a1a]">Financial Analysis</h2>
            <span className="text-xs text-[#ccc] ml-auto">{formattedDate}</span>
          </div>

          <p className="text-xs text-[#999] uppercase tracking-widest font-semibold mb-4">
            Overview
          </p>

          {/* Executive summary — narrative paragraph */}
          <p className="text-[15px] text-[#333] leading-[1.8] mb-6">
            <Hl color="green">Revenue</Hl> came in at {fmt(fs.total_revenue)} with{" "}
            <Hl color="red">Total Expenses</Hl> of {fmt(fs.total_expenses)}, resulting in a{" "}
            {fs.net_income >= 0 ? (
              <>net income of <Hl color="green">{fmt(fs.net_income)}</Hl></>
            ) : (
              <>net loss of <Hl color="red">{fmt(Math.abs(fs.net_income))}</Hl></>
            )}
            . The <Hl color="blue">Gross Margin</Hl> stands at {pct(ratios.gross_margin)} and{" "}
            <Hl color="blue">Net Margin</Hl> at {pct(ratios.net_margin)}
            {ratios.gross_margin > 0.4
              ? ", both indicating healthy profitability."
              : ratios.gross_margin > 0.2
              ? "."
              : ", which warrants attention."}
          </p>

          {/* Liquidity & leverage paragraph */}
          <p className="text-xs text-[#999] uppercase tracking-widest font-semibold mb-4 mt-8">
            Liquidity & Capital Structure
          </p>
          <p className="text-[15px] text-[#333] leading-[1.8] mb-6">
            The <Hl color="blue">Current Ratio</Hl> is {ratios.current_ratio.toFixed(2)}x
            {ratios.current_ratio < 1
              ? ", which is below 1.0 — this signals potential short-term liquidity stress and may require attention on working capital management"
              : ratios.current_ratio < 1.5
              ? ", which is adequate but leaves limited buffer for unexpected cash demands"
              : ", indicating a comfortable liquidity position"}
            . <Hl color="blue">Working Capital</Hl> stands at {fmt(ratios.working_capital)}.
            The <Hl color="blue">Debt-to-Equity</Hl> ratio is {ratios.debt_to_equity.toFixed(2)}x
            {ratios.debt_to_equity > 1.5
              ? " — the business is significantly leveraged, which may pressure cash flows during tighter quarters"
              : ratios.debt_to_equity > 0.5
              ? ", reflecting a balanced capital structure"
              : ", suggesting conservative financing with low leverage"}
            .
          </p>

          {/* Top expenses paragraph */}
          {topExpenses.length > 0 && (
            <>
              <p className="text-xs text-[#999] uppercase tracking-widest font-semibold mb-4 mt-8">
                Cost Highlights
              </p>
              <p className="text-[15px] text-[#333] leading-[1.8] mb-6">
                The largest expense head is{" "}
                <Hl color="red">{topExpenses[0].name}</Hl> at {fmt(Math.abs(topExpenses[0].net))}
                {topExpenses.length > 1 && (
                  <>, followed by <Hl color="red">{topExpenses[1].name}</Hl> at {fmt(Math.abs(topExpenses[1].net))}</>
                )}
                {topExpenses.length > 2 && (
                  <> and <Hl color="amber">{topExpenses[2].name}</Hl> at {fmt(Math.abs(topExpenses[2].net))}</>
                )}
                .{" "}
                {empCost > 0 && (
                  <>
                    <Hl color="blue">Employee Costs</Hl> total {fmt(empCost)}, representing{" "}
                    {fs.total_expenses > 0 ? pct(empCost / fs.total_expenses) : "N/A"} of total expenses
                    {fs.total_revenue > 0 && empCost / fs.total_revenue > 0.4
                      ? " — this is on the higher side and worth reviewing for efficiency."
                      : "."}
                  </>
                )}
              </p>
            </>
          )}

          {/* AI-generated insights as narrative */}
          {insights && insights.length > 0 && (
            <>
              <p className="text-xs text-[#999] uppercase tracking-widest font-semibold mb-4 mt-8">
                Key Findings
              </p>
              {insights.map((insight, idx) => {
                const isWarning = insight.severity === "high" || insight.severity === "warning";
                const isSuccess = insight.severity === "success";
                return (
                  <p key={idx} className="text-[15px] text-[#333] leading-[1.8] mb-4">
                    <Hl color={isWarning ? "red" : isSuccess ? "green" : "blue"}>{insight.title}</Hl>
                    {" — "}
                    {insight.detail}
                    {insight.action && (
                      <span className="text-emerald-600 font-medium cursor-pointer hover:underline ml-1">
                        {insight.action} &rarr;
                      </span>
                    )}
                  </p>
                );
              })}
            </>
          )}

          {/* Ind AS observations as narrative */}
          {indAS && indAS.length > 0 && (
            <>
              <p className="text-xs text-[#999] uppercase tracking-widest font-semibold mb-4 mt-8">
                Ind AS Compliance
              </p>
              {indAS.map((obs, idx) => (
                <p key={idx} className="text-[15px] text-[#333] leading-[1.8] mb-4">
                  <Hl color={obs.severity === "high" ? "red" : obs.severity === "warning" || obs.severity === "medium" ? "amber" : "blue"}>
                    {obs.standard}
                  </Hl>
                  {" — "}
                  {obs.observation}
                </p>
              ))}
            </>
          )}
        </div>

        {/* Industry KPIs */}
        <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-[#1a1a1a]">{industryData.label} KPIs</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industryData.kpis.map((kpi) => (
              <div key={kpi.label} className="bg-[#fafafa] rounded-lg p-4 border border-[#f0f0f0]">
                <p className="text-xs text-[#666] mb-1">{kpi.label}</p>
                <p className="text-lg font-bold text-[#1a1a1a]">{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Expense Breakdown */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e5e5] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-[#1a1a1a]">Expense Breakdown</h3>
                <p className="text-xs text-[#666] mt-0.5">Top 10 expense heads &middot; Total: {fmt(totalExpenses)}</p>
              </div>
            </div>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fill: "#999", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#666", fontSize: 10 }} tickLine={false} axisLine={false} width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "white", border: "1px solid #e5e5e5", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: "8px", fontSize: "12px" }}
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
              <p className="text-sm text-[#ccc] text-center py-12">No expense data available</p>
            )}
          </div>

          {/* Balance Sheet Pie */}
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Balance Sheet</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bsPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {bsPieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid #e5e5e5", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value) => [fmt(Number(value)), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {bsPieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-[#666]">{item.name}</span>
                  </span>
                  <span className="text-[#1a1a1a] font-medium">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Questions */}
        {aiQuestions && aiQuestions.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e5e5e5] p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircleQuestion className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-[#1a1a1a]">Questions for Management</h3>
              <span className="text-xs text-[#ccc] ml-auto">{aiQuestions.length} questions</span>
            </div>
            <div className="space-y-3">
              {aiQuestions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                  <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1a1a1a] font-medium mb-1">{q.question}</p>
                    <p className="text-xs text-[#999] leading-relaxed">{q.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating AI Analyst Button ── */}
      <button
        onClick={() => setShowAnalyst(!showAnalyst)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 ${
          showAnalyst
            ? "bg-[#333] text-white"
            : "bg-emerald-600 text-white shadow-emerald-500/30"
        }`}
      >
        {showAnalyst ? (
          <><X className="w-4 h-4" /> Close</>
        ) : (
          <><Sparkles className="w-4 h-4" /> AI Analyst</>
        )}
      </button>

      {/* ── AI Analyst Sidebar Panel (Runway-style) ── */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-[#e5e5e5] shadow-2xl shadow-black/5 z-40 flex flex-col transition-transform duration-300 ease-out ${
          showAnalyst ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#e5e5e5]">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a1a1a]">AI Analyst</p>
            <p className="text-[10px] text-[#999]">Ask anything about your financials</p>
          </div>
          <button
            onClick={() => setShowAnalyst(false)}
            className="w-7 h-7 rounded-lg hover:bg-[#f5f5f5] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[#999]" />
          </button>
        </div>

        {/* Context badges */}
        <div className="px-6 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <p className="text-[10px] text-[#999] uppercase tracking-wider font-semibold mb-2">Analyzing</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#e5e5e5] text-[#666]">
              {displayName}
            </span>
            {industry && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#e5e5e5] text-[#666]">
                {industry}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.length === 0 && (
            <div className="py-6">
              <p className="text-xs text-[#999] mb-4">Try asking:</p>
              <div className="space-y-2">
                {[
                  "Summarize my financial health",
                  "What are the biggest risks?",
                  "How can I improve profitability?",
                  "Explain the Ind AS issues",
                  "Build me a 12-month projection",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="flex w-full items-center gap-2 text-left text-sm text-[#666] hover:text-[#1a1a1a] bg-[#fafafa] hover:bg-[#f0f0f0] rounded-lg px-3.5 py-2.5 transition-colors border border-transparent hover:border-[#e5e5e5]"
                  >
                    <ArrowUpRight className="w-3 h-3 flex-shrink-0 text-[#ccc]" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-50 text-[#1a1a1a] rounded-br-sm"
                    : "bg-[#f5f5f5] text-[#333] rounded-bl-sm prose prose-sm prose-neutral max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_li]:text-[#333] [&_strong]:text-[#1a1a1a] [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_table]:text-xs [&_table]:w-full [&_th]:bg-[#fafafa] [&_th]:p-2 [&_th]:text-left [&_th]:border [&_th]:border-[#e5e5e5] [&_td]:p-2 [&_td]:border [&_td]:border-[#e5e5e5]"
                }`}
              >
                {msg.role === "user" ? msg.text : <ReactMarkdown>{msg.text}</ReactMarkdown>}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-[#f5f5f5] rounded-2xl rounded-bl-sm px-4 py-3">
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

        {/* Input */}
        <div className="border-t border-[#e5e5e5] p-4">
          <div className="flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskAI()}
              placeholder="Ask about your financials..."
              className="flex-1 bg-[#fafafa] border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#bbb] outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 transition-all"
            />
            <button
              onClick={handleAskAI}
              disabled={!chatInput.trim() || chatLoading}
              className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center transition-colors disabled:opacity-30"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
