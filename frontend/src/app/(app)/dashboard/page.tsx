"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import AIChatBubble from "@/components/AIChatBubble";
import { FadeIn, StaggerChildren } from "@/components/Animate";
import {
  TrendingUp,
  IndianRupee,
  Activity,
  FileUp,
  HelpCircle,
  Briefcase,
  BarChart3,
  PieChart as PieChartIcon,
  Lightbulb,
  MessageCircleQuestion,
  Sparkles,
  Send,
  X,
  ArrowUpRight,
  CheckCircle2,
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
  "#10b981", "#14b8a6", "#22c55e", "#06b6d4",
  "#84cc16", "#0ea5e9", "#34d399", "#2dd4bf",
  "#4ade80", "#67e8f9",
];
const PIE_COLORS = ["#10b981", "#f43f5e", "#22c55e"];

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
      label: "Manufacturing", kpis: [
        { label: "COGS Ratio", value: fs.total_revenue ? pct(cogs / fs.total_revenue) : "N/A" },
        { label: "Inventory Turnover", value: stockVal > 0 ? `${(cogs / stockVal).toFixed(1)}x` : "N/A" },
        { label: "Working Capital", value: fmt(ratios.working_capital) },
        { label: "Raw Material %", value: fs.total_expenses ? pct(cogs / fs.total_expenses) : "N/A" },
      ], mainKpi: { label: "COGS Ratio", value: fs.total_revenue ? pct(cogs / fs.total_revenue) : "N/A" },
    };
  }
  if (lower.includes("saas") || lower.includes("software") || lower.includes("technology")) {
    const empRatio = fs.total_revenue ? empCost / fs.total_revenue : 0;
    return {
      label: "SaaS / Tech", kpis: [
        { label: "Employee Cost Ratio", value: pct(empRatio) },
        { label: "Gross Margin", value: pct(ratios.gross_margin) },
        { label: "Net Margin", value: pct(ratios.net_margin) },
        { label: "Operating Leverage", value: fs.total_expenses > 0 ? `${(fs.total_revenue / fs.total_expenses).toFixed(2)}x` : "N/A" },
      ], mainKpi: { label: "Gross Margin", value: pct(ratios.gross_margin) },
    };
  }
  if (lower.includes("service") || lower.includes("consult")) {
    const empRatio = fs.total_revenue ? empCost / fs.total_revenue : 0;
    const revPerEmp = empCountNum > 0 ? fs.total_revenue / empCountNum : 0;
    return {
      label: "Services", kpis: [
        { label: "Employee Cost Ratio", value: pct(empRatio) },
        { label: "Revenue / Employee", value: revPerEmp > 0 ? fmt(revPerEmp) : "N/A" },
        { label: "Operating Margin", value: pct((fs.total_revenue - fs.total_expenses) / (fs.total_revenue || 1)) },
        { label: "Net Margin", value: pct(ratios.net_margin) },
      ], mainKpi: { label: "Employee Cost %", value: pct(empRatio) },
    };
  }
  if (lower.includes("trad") || lower.includes("retail") || lower.includes("ecommerce") || lower.includes("e-commerce")) {
    return {
      label: "Trading", kpis: [
        { label: "Gross Margin", value: pct(ratios.gross_margin) },
        { label: "Stock Turnover", value: stockVal > 0 ? `${(cogs / stockVal).toFixed(1)}x` : "N/A" },
        { label: "Net Margin", value: pct(ratios.net_margin) },
        { label: "Working Capital", value: fmt(ratios.working_capital) },
      ], mainKpi: { label: "Gross Margin", value: pct(ratios.gross_margin) },
    };
  }
  return {
    label: "General", kpis: [
      { label: "Current Ratio", value: `${ratios.current_ratio.toFixed(2)}x` },
      { label: "D/E Ratio", value: `${ratios.debt_to_equity.toFixed(2)}x` },
      { label: "Gross Margin", value: pct(ratios.gross_margin) },
      { label: "Net Margin", value: pct(ratios.net_margin) },
      { label: "ROE", value: pct(ratios.return_on_equity) },
      { label: "Working Capital", value: fmt(ratios.working_capital) },
    ], mainKpi: { label: "Net Margin", value: pct(ratios.net_margin) },
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
  // "claude" (default, highest quality) | "gemini" (fast, free tier) | "groq" (fastest).
  // Backend falls back automatically if the chosen one is unconfigured.
  const [chatProvider, setChatProvider] = useState<"claude" | "gemini" | "groq">("claude");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Question answer state
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleAskAI = async () => {
    if (!chatInput.trim() || !lastResult) return;
    const question = chatInput.trim();

    // Capture the full history INCLUDING the new user message BEFORE the
    // async state update — setChatMessages is batched by React, so reading
    // `chatMessages` after the setter still gives the OLD array.
    const updatedHistory: { role: "user" | "ai"; text: string }[] = [
      ...chatMessages,
      { role: "user", text: question },
    ];

    setChatInput("");
    setChatMessages(updatedHistory);
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      // Build user_answers from answered questions
      const userAnswers: Record<string, string> = {};
      if (lastResult?.ai_questions) {
        answeredQuestions.forEach((idx) => {
          if (lastResult.ai_questions[idx] && questionAnswers[idx]) {
            userAnswers[lastResult.ai_questions[idx].question] = questionAnswers[idx];
          }
        });
      }

      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          analysis_result: lastResult,
          conversation_history: updatedHistory.slice(-10),
          user_answers: Object.keys(userAnswers).length > 0 ? userAnswers : undefined,
          provider: chatProvider,
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "ai", text: data.response || data.answer || "I couldn't generate a response." }]);
    } catch (err) {
      const detail = err instanceof Error && err.message ? err.message : "please try again.";
      setChatMessages((prev) => [...prev, { role: "ai", text: `Sorry, I couldn't reach the AI service — ${detail}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSubmitAnswer = async (idx: number) => {
    if (!questionAnswers[idx]?.trim() || !lastResult) return;
    setAnsweredQuestions((prev) => new Set(prev).add(idx));

    // Send to AI for incorporation and get updated analysis commentary
    try {
      const token = localStorage.getItem("access_token");
      const q = lastResult.ai_questions[idx];
      const res = await fetch(`${API_BASE}/api/chat/answer-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: q.question,
          answer: questionAnswers[idx],
          analysis_result: lastResult,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        // Show the AI's response in the analyst sidebar
        if (data.response) {
          setShowAnalyst(true);
          setChatMessages((prev) => [
            ...prev,
            { role: "user", text: `Regarding: "${q.question.substring(0, 60)}..."\n\nAnswer: ${questionAnswers[idx]}` },
            { role: "ai", text: data.response },
          ]);
        }
      }
    } catch {
      // Silently fail - answer is still saved locally
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
          Upload your trial balance or financial statements to unlock your personalised executive dashboard with AI-powered insights.
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
  const aiQuestions = lastResult.ai_questions;

  const displayName = business.companyName || companyName;
  const industry = business.industry || "";

  const industryData = getIndustryKPIs(industry, fs, ratios, classified.expenses, business.employeeCount);

  /* ---- Expense chart data ---- */
  const expenseChartData = classified.expenses
    .filter((e) => Math.abs(e.net) > 0)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 10)
    .map((e) => ({ name: e.name.length > 28 ? e.name.slice(0, 25) + "..." : e.name, value: Math.abs(e.net) }));

  const totalExpenses = classified.expenses.reduce((s, e) => s + Math.abs(e.net), 0);

  const bsPieData = [
    { name: "Assets", value: Math.abs(fs.total_assets) },
    { name: "Liabilities", value: Math.abs(fs.total_liabilities) },
    { name: "Equity", value: Math.abs(fs.total_equity) },
  ];

  const kpiCards = [
    { label: "Revenue", value: fmt(fs.total_revenue), icon: IndianRupee, color: "from-emerald-500 to-teal-500" },
    { label: "Expenses", value: fmt(fs.total_expenses), icon: TrendingUp, color: "from-red-500 to-orange-500" },
    { label: "Net Income", value: fmt(fs.net_income), icon: Activity, color: fs.net_income >= 0 ? "from-emerald-500 to-emerald-600" : "from-red-600 to-red-400" },
    { label: industryData.mainKpi.label, value: industryData.mainKpi.value, icon: Briefcase, color: "from-amber-500 to-yellow-500" },
  ];

  const formattedDate = analysisDate ? new Date(analysisDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

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
            <h1 className="text-2xl font-bold text-white">Executive Dashboard</h1>
            <p className="text-sm text-white/40 mt-1">
              {displayName} &middot; {formattedDate}
              {stage.label !== "Unknown" && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {stage.label}{stage.years > 0 ? ` (${stage.years}y)` : ""}
                </span>
              )}
              {industry && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-white/3 text-white/30 border border-white/8">
                  {industry}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => (
            <FadeIn key={kpi.label} delay={i * 80} direction="up">
            <div className="bg-[#111] rounded-xl p-5 border border-white/8 hover:border-white/12">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                  <kpi.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-white/40 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
            </FadeIn>
          ))}
        </div>

        {/* ── Financial Analysis (formal, clean narrative) ── */}
        <FadeIn delay={100}>
        <div className="bg-[#111] rounded-xl border border-white/8 p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-white/40" />
            <h2 className="text-base font-semibold text-white">Financial Analysis</h2>
            <span className="text-xs text-white/20 ml-auto">{formattedDate}</span>
          </div>

          <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium mb-3">
            Overview
          </p>
          <p className="text-[15px] text-white/70 leading-[1.85] mb-6">
            Revenue came in at <strong>{fmt(fs.total_revenue)}</strong> with total expenses of <strong>{fmt(fs.total_expenses)}</strong>, resulting in a{" "}
            {fs.net_income >= 0
              ? <>net income of <strong>{fmt(fs.net_income)}</strong></>
              : <>net loss of <strong>{fmt(Math.abs(fs.net_income))}</strong></>
            }.
            Gross margin stands at <strong>{pct(ratios.gross_margin)}</strong> and net margin at <strong>{pct(ratios.net_margin)}</strong>
            {ratios.gross_margin > 0.4
              ? ", both indicating healthy profitability."
              : ratios.gross_margin > 0.2
              ? "."
              : ", which warrants attention."}
          </p>

          <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium mb-3 mt-8">
            Liquidity &amp; Capital Structure
          </p>
          <p className="text-[15px] text-white/70 leading-[1.85] mb-6">
            The current ratio is <strong>{ratios.current_ratio.toFixed(2)}x</strong>
            {ratios.current_ratio < 1
              ? ", which is below 1.0. This signals potential short-term liquidity stress and may require attention on working capital management"
              : ratios.current_ratio < 1.5
              ? ", which is adequate but leaves limited buffer for unexpected cash demands"
              : ", indicating a comfortable liquidity position"}
            . Working capital stands at <strong>{fmt(ratios.working_capital)}</strong>.
            The debt-to-equity ratio is <strong>{ratios.debt_to_equity.toFixed(2)}x</strong>
            {ratios.debt_to_equity > 1.5
              ? ". The business is significantly leveraged, which may pressure cash flows during tighter quarters"
              : ratios.debt_to_equity > 0.5
              ? ", reflecting a balanced capital structure"
              : ", suggesting conservative financing with low leverage"}
            .
          </p>

          {topExpenses.length > 0 && (
            <>
              <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium mb-3 mt-8">
                Cost Highlights
              </p>
              <p className="text-[15px] text-white/70 leading-[1.85] mb-6">
                The largest expense head is <strong>{topExpenses[0].name}</strong> at {fmt(Math.abs(topExpenses[0].net))}
                {topExpenses.length > 1 && (
                  <>, followed by <strong>{topExpenses[1].name}</strong> at {fmt(Math.abs(topExpenses[1].net))}</>
                )}
                {topExpenses.length > 2 && (
                  <> and <strong>{topExpenses[2].name}</strong> at {fmt(Math.abs(topExpenses[2].net))}</>
                )}
                .{" "}
                {empCost > 0 && (
                  <>
                    Employee costs total <strong>{fmt(empCost)}</strong>, representing{" "}
                    {fs.total_expenses > 0 ? pct(empCost / fs.total_expenses) : "N/A"} of total expenses
                    {fs.total_revenue > 0 && empCost / fs.total_revenue > 0.4
                      ? ". This is on the higher side and worth reviewing for efficiency."
                      : "."}
                  </>
                )}
              </p>
            </>
          )}

          {insights && insights.length > 0 && (
            <>
              <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium mb-3 mt-8">
                Key Findings
              </p>
              {insights.map((insight, idx) => (
                <p key={idx} className="text-[15px] text-white/70 leading-[1.85] mb-4">
                  <strong>{insight.title}</strong> &mdash; {insight.detail}
                  {insight.action && (
                    <span className="text-white/40 ml-1 cursor-pointer hover:underline">
                      {insight.action} &rarr;
                    </span>
                  )}
                </p>
              ))}
            </>
          )}

          {indAS && indAS.length > 0 && (
            <>
              <p className="text-[11px] text-white/30 uppercase tracking-widest font-medium mb-3 mt-8">
                Ind AS Compliance
              </p>
              {indAS.map((obs, idx) => (
                <p key={idx} className="text-[15px] text-white/70 leading-[1.85] mb-4">
                  <strong>{obs.standard}</strong> &mdash; {obs.observation}
                </p>
              ))}
            </>
          )}
        </div>
        </FadeIn>

        {/* Industry KPIs */}
        <FadeIn delay={150}>
        <div className="bg-[#111] rounded-xl border border-white/8 p-6 hover:border-white/12">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-white/40" />
            <h3 className="text-sm font-semibold text-white">{industryData.label} KPIs</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {industryData.kpis.map((kpi) => (
              <div key={kpi.label} className="bg-white/3 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-white/40 mb-1">{kpi.label}</p>
                <p className="text-lg font-bold text-white">{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
        </FadeIn>

        {/* Charts */}
        <FadeIn delay={200}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#111] rounded-xl border border-white/8 p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Expense Breakdown</h3>
              <p className="text-xs text-white/40 mt-0.5">Top 10 expense heads &middot; Total: {fmt(totalExpenses)}</p>
            </div>
            {expenseChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "#999", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#666", fontSize: 10 }} tickLine={false} axisLine={false} width={160} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(value) => [fmt(Number(value)), "Amount"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} opacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-white/15 text-center py-12">No expense data available</p>
            )}
          </div>

          <div className="bg-[#111] rounded-xl border border-white/8 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-white/40" />
              <h3 className="text-sm font-semibold text-white">Balance Sheet</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bsPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {bsPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} opacity={0.8} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(value) => [fmt(Number(value)), ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {bsPieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-white/40">{item.name}</span>
                  </span>
                  <span className="text-white font-medium">{fmt(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </FadeIn>

        {/* Questions for Management WITH answer inputs */}
        {aiQuestions && aiQuestions.length > 0 && (
          <div className="bg-[#111] rounded-xl border border-white/8 p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageCircleQuestion className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Questions for Management</h3>
              <span className="text-xs text-white/20 ml-auto">{aiQuestions.length} questions</span>
            </div>
            <div className="space-y-4">
              {aiQuestions.map((q, idx) => {
                const isAnswered = answeredQuestions.has(idx);
                return (
                  <div key={idx} className={`rounded-xl border ${isAnswered ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/5"} p-5`}>
                    <div className="flex items-start gap-3">
                      {isAnswered ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                      ) : (
                        <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium mb-1">{q.question}</p>
                        <p className="text-xs text-white/30 leading-relaxed mb-3">{q.reason}</p>

                        {isAnswered ? (
                          <div className="bg-[#111] rounded-lg border border-emerald-500/20 p-3">
                            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-1">Your answer</p>
                            <p className="text-sm text-white/70">{questionAnswers[idx]}</p>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              value={questionAnswers[idx] || ""}
                              onChange={(e) => setQuestionAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer(idx)}
                              placeholder="Type your answer..."
                              className="flex-1 bg-white border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 outline-none focus:border-amber-300"
                            />
                            <button
                              onClick={() => handleSubmitAnswer(idx)}
                              disabled={!questionAnswers[idx]?.trim()}
                              className="px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#333] transition-colors disabled:opacity-30"
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── AI Analyst Button (single, no duplicate close) ── */}
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
        {/* Header */}
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

        {/* Context */}
        <div className="px-6 py-3 border-b border-white/5 bg-white/3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium mb-2">Analyzing</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-white/8 text-white/40">{displayName}</span>
            {industry && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-white/8 text-white/40">{industry}</span>}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/10 text-emerald-400">{formattedDate}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {chatMessages.length === 0 && (
            <div className="py-6">
              <p className="text-xs text-white/30 mb-4">Try asking:</p>
              <div className="space-y-2">
                {[
                  "Summarize my financial health",
                  "What are the biggest risks?",
                  "How can I improve profitability?",
                  "Explain the Ind AS issues",
                  "Build me a 12-month projection",
                ].map((q) => (
                  <button key={q} onClick={() => setChatInput(q)} className="flex w-full items-center gap-2 text-left text-sm text-white/40 hover:text-white bg-white/3 hover:bg-white/5 rounded-lg px-3.5 py-2.5 transition-colors border border-transparent hover:border-white/8">
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

        {/* Input */}
        <div className="border-t border-white/8 p-4">
          {/* Provider selector — three pills. Claude is default. */}
          <div className="mb-2 flex items-center gap-1">
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/30 mr-1">Model</span>
            {([
              { id: "claude", label: "Claude", hint: "Anthropic Sonnet 4" },
              { id: "gemini", label: "Gemini", hint: "Google 2.0 Flash" },
              { id: "groq", label: "Groq", hint: "Llama 3.3 70B" },
            ] as const).map((p) => {
              const active = chatProvider === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setChatProvider(p.id)}
                  title={p.hint}
                  className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "text-white/40 border border-white/5 hover:bg-white/5 hover:text-white/70"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAskAI()}
              placeholder="Ask about your financials..."
              className="flex-1 bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-100 transition-all"
            />
            <button onClick={handleAskAI} disabled={!chatInput.trim() || chatLoading} className="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors disabled:opacity-30">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
