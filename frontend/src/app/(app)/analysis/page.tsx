"use client";

import { useState, useCallback, useRef } from "react";
import AIChatBubble from "@/components/AIChatBubble";
import { useAnalysisStore } from "@/stores/analysisStore";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Shield,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Info,
  XCircle,
  Download,
  Plus,
  Trash2,
  Loader2,
  MessageCircle,
  Send,
  X,
  Sparkles,
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnalysisResult {
  summary: { total_debit: number; total_credit: number; is_balanced: boolean; variance: number };
  financial_statements: { total_assets: number; total_liabilities: number; total_equity: number; total_revenue: number; total_expenses: number; net_income: number };
  ratios: { current_ratio: number; debt_to_equity: number; gross_margin: number; net_margin: number; return_on_equity: number; working_capital: number };
  classified_accounts: { assets: AccountItem[]; liabilities: AccountItem[]; equity: AccountItem[]; revenue: AccountItem[]; expenses: AccountItem[] };
  ind_as_observations: { standard: string; observation: string; severity: string }[];
  ai_questions: { question: string; reason: string }[];
  insights: { category: string; title: string; detail: string; action: string; severity: string }[];
  warnings: { severity: string; title: string; detail: string }[];
}

interface AccountItem {
  name: string; code: string; debit: number; credit: number; net: number; sub_group: string;
}

interface TBRow {
  account_name: string; debit: string; credit: string;
}

const SAMPLE_TB: TBRow[] = [
  { account_name: "Share Capital", debit: "", credit: "5000000" },
  { account_name: "Reserves & Surplus", debit: "", credit: "1200000" },
  { account_name: "Secured Loan - HDFC Bank", debit: "", credit: "3000000" },
  { account_name: "Sundry Creditors", debit: "", credit: "850000" },
  { account_name: "GST Output Payable", debit: "", credit: "180000" },
  { account_name: "TDS Payable", debit: "", credit: "45000" },
  { account_name: "Outstanding Salary", debit: "", credit: "320000" },
  { account_name: "Land & Building", debit: "4500000", credit: "" },
  { account_name: "Plant & Machinery", debit: "2800000", credit: "" },
  { account_name: "Furniture & Fixtures", debit: "350000", credit: "" },
  { account_name: "Computer & Software", debit: "520000", credit: "" },
  { account_name: "Depreciation", debit: "480000", credit: "" },
  { account_name: "Cash in Hand", debit: "125000", credit: "" },
  { account_name: "Bank Account - ICICI", debit: "1850000", credit: "" },
  { account_name: "Sundry Debtors", debit: "1200000", credit: "" },
  { account_name: "Stock-in-Trade", debit: "680000", credit: "" },
  { account_name: "GST Input Credit", debit: "220000", credit: "" },
  { account_name: "TDS Receivable", debit: "95000", credit: "" },
  { account_name: "Prepaid Insurance", debit: "60000", credit: "" },
  { account_name: "Sales Revenue", debit: "", credit: "12500000" },
  { account_name: "Service Income", debit: "", credit: "1800000" },
  { account_name: "Interest Income", debit: "", credit: "45000" },
  { account_name: "Purchase of Goods", debit: "7200000", credit: "" },
  { account_name: "Salary & Wages", debit: "2400000", credit: "" },
  { account_name: "Rent Expense", debit: "600000", credit: "" },
  { account_name: "Electricity Expense", debit: "180000", credit: "" },
  { account_name: "Professional Fees", debit: "240000", credit: "" },
  { account_name: "Advertisement Expense", debit: "350000", credit: "" },
  { account_name: "Travelling Expense", debit: "185000", credit: "" },
  { account_name: "Repair & Maintenance", debit: "120000", credit: "" },
  { account_name: "Office Expense", debit: "95000", credit: "" },
  { account_name: "Bank Charges", debit: "35000", credit: "" },
  { account_name: "Interest on Loan", debit: "270000", credit: "" },
  { account_name: "Insurance Expense", debit: "80000", credit: "" },
  { account_name: "Miscellaneous Expense", debit: "45000", credit: "" },
];

function fmt(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

const PIE_COLORS = ["#10b981", "#14b8a6", "#22c55e", "#34d399", "#2dd4bf", "#06b6d4"];

export default function AnalysisPage() {
  const { setResult: saveToStore } = useAnalysisStore();
  const [mode, setMode] = useState<"upload" | "manual" | "results">("upload");
  const [rows, setRows] = useState<TBRow[]>([{ account_name: "", debit: "", credit: "" }]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary", "questions", "insights", "indas"]));
  const [activeTab, setActiveTab] = useState("overview");

  // Ask AI chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});

  const handleAskAI = async () => {
    if (!chatInput.trim() || !result) return;
    const question = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: question }]);
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/chat/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question,
          analysis_result: result,
          conversation_history: chatMessages.slice(-10),
          user_answers: questionAnswers,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: "ai", text: data.response }]);
    } catch (err) {
      const detail = err instanceof Error && err.message ? err.message : "please try again.";
      setChatMessages(prev => [...prev, { role: "ai", text: `Sorry, I couldn't process that — ${detail}` }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  const handleAnswerQuestion = async (questionIdx: number, questionText: string) => {
    const answer = answerInputs[questionIdx]?.trim();
    if (!answer || !result) return;
    setChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/chat/answer-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: questionText,
          answer,
          analysis_result: result,
          all_answers: questionAnswers,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setQuestionAnswers(data.updated_answers);
      // Show the AI's response to the answer
      setShowChat(true);
      setChatMessages(prev => [
        ...prev,
        { role: "user", text: `Re: "${questionText.substring(0, 80)}..."\n\nAnswer: ${answer}` },
        { role: "ai", text: data.response },
      ]);
      setAnswerInputs(prev => ({ ...prev, [questionIdx]: "" }));
    } catch (err) {
      const detail = err instanceof Error && err.message ? err.message : "please try again.";
      setShowChat(true);
      setChatMessages(prev => [
        ...prev,
        { role: "user", text: `Re: "${questionText.substring(0, 80)}..."\n\nAnswer: ${answer}` },
        { role: "ai", text: `Sorry, I couldn't record that answer — ${detail}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleSection = (s: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/analysis/tb/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      saveToStore(data, file.name.replace(/\.\w+$/, ""));
      setMode("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const entries = rows.filter(r => r.account_name.trim()).map(r => ({
      account_name: r.account_name,
      debit: parseFloat(r.debit) || 0,
      credit: parseFloat(r.credit) || 0,
    }));
    if (entries.length === 0) { setError("Add at least one entry"); return; }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE}/api/analysis/tb/json`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      saveToStore(data, "Manual Entry");
      setMode("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = () => {
    setRows(SAMPLE_TB);
    setMode("manual");
  };

  const addRow = () => setRows([...rows, { account_name: "", debit: "", credit: "" }]);
  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof TBRow, value: string) => {
    const next = [...rows];
    next[i] = { ...next[i], [field]: value };
    setRows(next);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, []);

  // Results view
  if (mode === "results" && result) {
    const { summary, financial_statements: fs, ratios, classified_accounts: ca, ind_as_observations, ai_questions, insights, warnings } = result;

    const pieData = [
      { name: "Assets", value: Math.abs(fs.total_assets) },
      { name: "Liabilities", value: Math.abs(fs.total_liabilities) },
      { name: "Equity", value: Math.abs(fs.total_equity) },
    ].filter(d => d.value > 0);

    const expenseData = ca.expenses.slice(0, 8).map(e => ({
      name: e.name.length > 20 ? e.name.substring(0, 20) + "..." : e.name,
      value: Math.abs(e.net),
    }));

    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Financial Analysis Report</h1>
            <p className="text-sm text-white/30 mt-1">Ind AS compliant review &middot; AI-powered insights</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setMode("upload"); setResult(null); }} className="px-4 py-2 bg-white/3 border border-white/8 rounded-lg text-xs text-white/40 hover:bg-white/5 transition-colors">
              New Analysis
            </button>
            <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5">
              <Download className="w-3 h-3" /> Export PDF
            </button>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${w.severity === "critical" ? "bg-red-500/50/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                {w.severity === "critical" ? <XCircle className="w-5 h-5 text-red-400 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-white">{w.title}</p>
                  <p className="text-xs text-white/30 mt-0.5">{w.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Nav */}
        <div className="flex gap-1 bg-[#111] rounded-lg border border-white/8 p-1 w-fit">
          {[
            { key: "overview", label: "Overview" },
            { key: "questions", label: "AI Questions" },
            { key: "deepdive", label: "Deep Dive" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${activeTab === tab.key ? "bg-white/5 text-white" : "text-white/30 hover:text-white/40"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Revenue", value: fmt(fs.total_revenue, true), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                { label: "Total Expenses", value: fmt(fs.total_expenses, true), icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10" },
                { label: "Net Income", value: fmt(fs.net_income, true), icon: fs.net_income >= 0 ? TrendingUp : TrendingDown, color: fs.net_income >= 0 ? "text-emerald-400" : "text-red-400", bg: fs.net_income >= 0 ? "bg-emerald-400/10" : "bg-red-400/10" },
                { label: "TB Status", value: summary.is_balanced ? "Balanced ✓" : `Var: ${fmt(summary.variance)}`, icon: summary.is_balanced ? CheckCircle2 : AlertTriangle, color: summary.is_balanced ? "text-emerald-400" : "text-red-400", bg: summary.is_balanced ? "bg-emerald-400/10" : "bg-red-400/10" },
              ].map(card => (
                <div key={card.label} className="bg-[#111] rounded-xl p-5 border border-white/8">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="text-xs text-white/30">{card.label}</p>
                  <p className="text-xl font-bold text-white mt-0.5">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Balance Sheet + Ratios */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#111] rounded-xl border border-white/8 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Balance Sheet Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Assets", value: fs.total_assets, color: "bg-emerald-500" },
                    { label: "Total Liabilities", value: fs.total_liabilities, color: "bg-red-500/50" },
                    { label: "Total Equity", value: fs.total_equity, color: "bg-emerald-500" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-white/30">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{fmt(item.value, true)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/8 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/40 font-medium">Assets = L + E</span>
                      <span className={`text-sm font-bold ${Math.abs(fs.total_assets - fs.total_liabilities - fs.total_equity) < 1 ? "text-emerald-400" : "text-amber-400"}`}>
                        {Math.abs(fs.total_assets - fs.total_liabilities - fs.total_equity) < 1 ? "Balanced ✓" : "Check Required"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(value) => fmt(Number(value), true)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111] rounded-xl border border-white/8 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Key Financial Ratios</h3>
                <div className="space-y-4">
                  {[
                    { label: "Current Ratio", value: `${ratios.current_ratio}x`, benchmark: "Ideal: > 1.5x", ok: ratios.current_ratio >= 1.5 },
                    { label: "Debt-to-Equity", value: `${ratios.debt_to_equity}x`, benchmark: "Ideal: < 2.0x", ok: ratios.debt_to_equity <= 2 },
                    { label: "Gross Margin", value: `${ratios.gross_margin}%`, benchmark: "Industry: 30-50%", ok: ratios.gross_margin >= 30 },
                    { label: "Net Margin", value: `${ratios.net_margin}%`, benchmark: "Healthy: > 10%", ok: ratios.net_margin >= 10 },
                    { label: "Return on Equity", value: `${ratios.return_on_equity}%`, benchmark: "Good: > 15%", ok: ratios.return_on_equity >= 15 },
                    { label: "Working Capital", value: fmt(ratios.working_capital, true), benchmark: "Should be positive", ok: ratios.working_capital > 0 },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/40">{r.label}</p>
                        <p className="text-[10px] text-white/40">{r.benchmark}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{r.value}</span>
                        <div className={`w-2 h-2 rounded-full ${r.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            {expenseData.length > 0 && (
              <div className="bg-[#111] rounded-xl border border-white/8 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Expense Breakdown (Top 8)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={expenseData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" tick={{ fill: "#999", fontSize: 11 }} tickFormatter={(v) => fmt(v, true)} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#666", fontSize: 11 }} width={160} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} itemStyle={{ color: "#fff" }} labelStyle={{ color: "#fff" }} formatter={(value) => fmt(Number(value))} />
                    <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* AI Questions Tab */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-6">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">AI Clarifying Questions</h3>
              </div>
              <p className="text-xs text-white/30 mb-6">The AI identified these areas that need clarification for a more accurate analysis. Answering these will improve the quality of the financial review.</p>

              {ai_questions.map((q, i) => {
                const isAnswered = !!questionAnswers[q.question];
                return (
                  <div key={i} className={`mb-4 p-5 rounded-xl border ${isAnswered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-[#111] border-white/8"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isAnswered ? "bg-emerald-500/20" : "bg-emerald-500/10"}`}>
                        {isAnswered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-xs font-bold text-emerald-400">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white leading-relaxed">{q.question}</p>
                        <p className="text-xs text-white/30 mt-2 italic">Why this matters: {q.reason}</p>

                        {/* Answer section */}
                        {isAnswered ? (
                          <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <p className="text-xs text-emerald-400 font-medium mb-1">Your answer:</p>
                            <p className="text-sm text-white/70">{questionAnswers[q.question]}</p>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <input
                              value={answerInputs[i] || ""}
                              onChange={(e) => setAnswerInputs(prev => ({ ...prev, [i]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleAnswerQuestion(i, q.question)}
                              placeholder="Type your answer..."
                              className="flex-1 bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/15 outline-none focus:border-emerald-500/50"
                            />
                            <button
                              onClick={() => handleAnswerQuestion(i, q.question)}
                              disabled={!answerInputs[i]?.trim() || chatLoading}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs text-white font-medium disabled:opacity-30 transition-colors flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" /> Submit
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

        {/* Deep Dive Tab — collapsible accordion for all 3 sections */}
        {activeTab === "deepdive" && (
          <div className="space-y-4">
            {/* Section 1: Ind AS Review */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <button
                onClick={() => toggleSection("indas")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Ind AS Compliance Review</h3>
                  <span className="text-[10px] text-white/20 ml-1">{ind_as_observations.length} observations</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expandedSections.has("indas") ? "rotate-180" : ""}`} />
              </button>
              {expandedSections.has("indas") && (
                <div className="px-6 pb-5 space-y-3">
                  {ind_as_observations.map((obs, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${obs.severity === "high" ? "bg-red-500/5 border-red-500/20" : obs.severity === "medium" ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                      <div className="flex items-start gap-3">
                        {obs.severity === "high" ? <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" /> : obs.severity === "medium" ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />}
                        <div>
                          <p className="text-xs font-semibold text-white mb-1">{obs.standard}</p>
                          <p className="text-sm text-white/40 leading-relaxed">{obs.observation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Insights & Actions */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <button
                onClick={() => toggleSection("insights")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Insights &amp; Actions</h3>
                  <span className="text-[10px] text-white/20 ml-1">{insights.length} findings</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expandedSections.has("insights") ? "rotate-180" : ""}`} />
              </button>
              {expandedSections.has("insights") && (
                <div className="px-6 pb-5 space-y-3">
                  {insights.map((ins, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${ins.severity === "critical" || ins.severity === "high" ? "bg-red-500/5 border-red-500/20" : ins.severity === "warning" || ins.severity === "medium" ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-white/30">{ins.category}</span>
                          <h4 className="text-sm font-semibold text-white mt-0.5">{ins.title}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-white/40 leading-relaxed mb-3">{ins.detail}</p>
                      {ins.action && (
                        <div className="flex items-center gap-2 p-2.5 bg-[#111] rounded-lg border border-white/8">
                          <ArrowRight className="w-3 h-3 text-emerald-400" />
                          <p className="text-xs text-emerald-400 font-medium">{ins.action}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Financial Statements */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <button
                onClick={() => toggleSection("statements")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Financial Statements</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expandedSections.has("statements") ? "rotate-180" : ""}`} />
              </button>
              {expandedSections.has("statements") && (
                <div className="px-6 pb-5">
          <div className="space-y-6">
            {/* Export buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Export classified accounts as CSV
                  const allAccounts = [
                    ...ca.assets.map(a => ({ ...a, category: "Assets" })),
                    ...ca.liabilities.map(a => ({ ...a, category: "Liabilities" })),
                    ...ca.equity.map(a => ({ ...a, category: "Equity" })),
                    ...ca.revenue.map(a => ({ ...a, category: "Revenue" })),
                    ...ca.expenses.map(a => ({ ...a, category: "Expenses" })),
                  ];
                  const csvHeader = "Category,Account Name,Sub Group,Debit,Credit,Net\n";
                  const csvRows = allAccounts.map(a =>
                    `${a.category},"${a.name}","${a.sub_group || ""}",${a.debit},${a.credit},${a.net}`
                  ).join("\n");
                  const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "classified_accounts.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Classified Accounts (CSV)
              </button>
            </div>

            {/* Profit & Loss Statement — Runway-style clean table */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Profit &amp; Loss Statement</h3>
                <span className="text-[10px] text-white/20">Current Period</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium">Driver</th>
                    <th className="text-right px-6 py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium">Amount</th>
                    <th className="text-right px-6 py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium w-32">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/[0.02]">
                    <td className="px-6 py-2 text-[10px] text-white/30 uppercase tracking-wider font-semibold" colSpan={3}>Revenue</td>
                  </tr>
                  {ca.revenue.map((item, i) => (
                    <tr key={`rev-${i}`} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-2.5 text-white/60">{item.name}</td>
                      <td className="px-6 py-2.5 text-right font-medium text-white tabular-nums">{fmt(Math.abs(item.net))}</td>
                      <td className="px-6 py-2.5 text-right text-white/30 tabular-nums text-xs">{fs.total_revenue > 0 ? ((Math.abs(item.net) / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-3 font-semibold text-white">Total Revenue</td>
                    <td className="px-6 py-3 text-right font-bold text-white tabular-nums">{fmt(fs.total_revenue)}</td>
                    <td className="px-6 py-3 text-right text-emerald-400 tabular-nums text-xs">100.0%</td>
                  </tr>

                  <tr className="bg-white/[0.02]">
                    <td className="px-6 py-2 text-[10px] text-white/30 uppercase tracking-wider font-semibold" colSpan={3}>Expenses</td>
                  </tr>
                  {ca.expenses.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                    <tr key={`exp-${i}`} className="border-b border-white/3 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-2.5 text-white/60">{item.name}</td>
                      <td className="px-6 py-2.5 text-right font-medium text-white tabular-nums">{fmt(Math.abs(item.net))}</td>
                      <td className="px-6 py-2.5 text-right text-white/30 tabular-nums text-xs">{fs.total_revenue > 0 ? ((Math.abs(item.net) / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/10 bg-white/[0.03]">
                    <td className="px-6 py-3 font-semibold text-white">Total Expenses</td>
                    <td className="px-6 py-3 text-right font-bold text-white tabular-nums">{fmt(fs.total_expenses)}</td>
                    <td className="px-6 py-3 text-right text-red-400 tabular-nums text-xs">{fs.total_revenue > 0 ? ((fs.total_expenses / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                  </tr>

                  <tr className="border-t-2 border-emerald-500/20 bg-emerald-500/5">
                    <td className="px-6 py-4 font-bold text-white text-base">Net Income</td>
                    <td className={`px-6 py-4 text-right font-bold text-base tabular-nums ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(fs.net_income)}</td>
                    <td className={`px-6 py-4 text-right font-semibold tabular-nums ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fs.total_revenue > 0 ? ((fs.net_income / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Balance Sheet */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 bg-white/3">
                <h3 className="text-sm font-semibold text-white">Balance Sheet</h3>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium" colSpan={2}>Assets</td>
                    </tr>
                    {ca.assets.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`ast-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-white/40">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-white">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-white/8 bg-white/3">
                      <td className="py-3 font-semibold text-white">Total Assets</td>
                      <td className="py-3 text-right font-bold text-white">{fmt(Math.abs(fs.total_assets))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium" colSpan={2}>Liabilities</td>
                    </tr>
                    {ca.liabilities.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`lib-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-white/40">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-white">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-white/8 bg-white/3">
                      <td className="py-3 font-semibold text-white">Total Liabilities</td>
                      <td className="py-3 text-right font-bold text-white">{fmt(Math.abs(fs.total_liabilities))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="border-b border-white/5">
                      <td className="py-3 text-[11px] text-white/30 uppercase tracking-wider font-medium" colSpan={2}>Equity</td>
                    </tr>
                    {ca.equity.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`eq-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-white/40">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-white">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-white/8 bg-white/3">
                      <td className="py-3 font-semibold text-white">Total Equity</td>
                      <td className="py-3 text-right font-bold text-white">{fmt(Math.abs(fs.total_equity))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="bg-blue-50/50 border-t-2 border-blue-200">
                      <td className="py-4 font-bold text-white text-base">Liabilities + Equity</td>
                      <td className="py-4 text-right font-bold text-base text-white">{fmt(Math.abs(fs.total_liabilities) + Math.abs(fs.total_equity))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Indicators */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 bg-white/3">
                <h3 className="text-sm font-semibold text-white">Cash Flow Indicators</h3>
                <p className="text-[10px] text-white/30 mt-0.5">Estimated from Trial Balance data</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-white/40">Net Income</td>
                      <td className={`py-3 text-right font-medium ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-500"}`}>{fmt(fs.net_income)}</td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-white/40">Add: Depreciation (non-cash)</td>
                      <td className="py-3 text-right font-medium text-white">
                        {fmt(ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation") || e.name.toLowerCase().includes("amortisation") || e.name.toLowerCase().includes("amortization")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-white/40">Working Capital</td>
                      <td className={`py-3 text-right font-medium ${ratios.working_capital >= 0 ? "text-white" : "text-red-500"}`}>{fmt(ratios.working_capital)}</td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-white/40">Cash &amp; Bank Balance</td>
                      <td className="py-3 text-right font-medium text-white">
                        {fmt(ca.assets.filter(e => e.name.toLowerCase().includes("cash") || e.name.toLowerCase().includes("bank")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                    <tr className="bg-white/3 border-t border-white/8">
                      <td className="py-4 font-semibold text-white">Estimated Operating Cash Flow</td>
                      <td className={`py-4 text-right font-bold ${fs.net_income + ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation")).reduce((s, e) => s + Math.abs(e.net), 0) >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                        {fmt(fs.net_income + ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation") || e.name.toLowerCase().includes("amortisation")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5 Key Takeaways */}
            <div className="bg-[#111] rounded-xl border border-white/8 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">5 Key Takeaways</h3>
              <div className="space-y-3">
                {(() => {
                  const takeaways: string[] = [];

                  // 1. Profitability
                  if (fs.net_income >= 0) {
                    takeaways.push(`The business is profitable with a net margin of ${ratios.net_margin}%. Revenue of ${fmt(fs.total_revenue, true)} comfortably covers expenses.`);
                  } else {
                    takeaways.push(`The business is running at a loss of ${fmt(Math.abs(fs.net_income), true)}. Expenses exceed revenue by ${fmt(fs.total_expenses - fs.total_revenue, true)}.`);
                  }

                  // 2. Liquidity
                  if (ratios.current_ratio >= 1.5) {
                    takeaways.push(`Liquidity is strong with a current ratio of ${ratios.current_ratio}x. The business can comfortably meet short-term obligations.`);
                  } else if (ratios.current_ratio >= 1) {
                    takeaways.push(`Liquidity is adequate at ${ratios.current_ratio}x current ratio, but there is limited buffer. Keep an eye on receivables and payables timing.`);
                  } else {
                    takeaways.push(`Liquidity is a concern. The current ratio is ${ratios.current_ratio}x (below 1.0), meaning short-term liabilities exceed current assets.`);
                  }

                  // 3. Capital structure
                  if (ratios.debt_to_equity > 1.5) {
                    takeaways.push(`The business is heavily leveraged with a debt-to-equity ratio of ${ratios.debt_to_equity}x. Consider paying down debt to reduce interest burden.`);
                  } else {
                    takeaways.push(`Capital structure is balanced with a debt-to-equity ratio of ${ratios.debt_to_equity}x. Borrowing levels are within acceptable range.`);
                  }

                  // 4. Top expense
                  const topExp = ca.expenses.sort((a, b) => Math.abs(b.net) - Math.abs(a.net))[0];
                  if (topExp) {
                    const expPct = fs.total_revenue > 0 ? ((Math.abs(topExp.net) / fs.total_revenue) * 100).toFixed(1) : "N/A";
                    takeaways.push(`The largest expense is ${topExp.name} at ${fmt(Math.abs(topExp.net), true)}, which is ${expPct}% of revenue. Review if this is aligned with industry benchmarks.`);
                  }

                  // 5. Cash position
                  const cashBalance = ca.assets.filter(e => e.name.toLowerCase().includes("cash") || e.name.toLowerCase().includes("bank")).reduce((s, e) => s + Math.abs(e.net), 0);
                  if (cashBalance > 0) {
                    const months = fs.total_expenses > 0 ? (cashBalance / (fs.total_expenses / 12)).toFixed(1) : "N/A";
                    takeaways.push(`Cash and bank balance is ${fmt(cashBalance, true)}, providing approximately ${months} months of expense coverage at current spend rates.`);
                  } else {
                    takeaways.push("No cash or bank balance was detected in the trial balance. Verify if these accounts are classified under a different name.");
                  }

                  return takeaways.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                      <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-white/70 leading-relaxed">{t}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Common Size Analysis */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-white">Common Size Analysis</h3>
                <p className="text-[10px] text-white/30 mt-0.5">Each line item as a percentage of revenue</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-white/30 uppercase tracking-wider border-b border-white/5">
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                      <th className="text-right py-2 font-medium">% of Revenue</th>
                      <th className="text-right py-2 font-medium">Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Revenue", value: fs.total_revenue, pct: 100 },
                      ...ca.expenses.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).slice(0, 8).map(e => ({
                        name: e.name,
                        value: Math.abs(e.net),
                        pct: fs.total_revenue > 0 ? (Math.abs(e.net) / fs.total_revenue) * 100 : 0,
                      })),
                      { name: "Net Income", value: fs.net_income, pct: fs.total_revenue > 0 ? (fs.net_income / fs.total_revenue) * 100 : 0 },
                    ].map((row) => (
                      <tr key={row.name} className="border-b border-white/3">
                        <td className="py-2.5 text-white/50">{row.name}</td>
                        <td className="py-2.5 text-right text-white font-medium tabular-nums">{fmt(row.value, true)}</td>
                        <td className="py-2.5 text-right text-white/40 tabular-nums">{row.pct.toFixed(1)}%</td>
                        <td className="py-2.5 text-right w-32">
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden ml-auto" style={{ width: "100px" }}>
                            <div
                              className={`h-full rounded-full ${row.name === "Net Income" ? (row.pct >= 0 ? "bg-emerald-500" : "bg-red-500") : "bg-emerald-500/40"}`}
                              style={{ width: `${Math.min(Math.abs(row.pct), 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ratio Analysis with Industry Benchmarks */}
            <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-white">Ratio Analysis vs Industry Benchmarks</h3>
                <p className="text-[10px] text-white/30 mt-0.5">Your metrics compared to industry averages</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-white/30 uppercase tracking-wider border-b border-white/5">
                      <th className="text-left py-2 font-medium">Ratio</th>
                      <th className="text-right py-2 font-medium">Your Value</th>
                      <th className="text-right py-2 font-medium">Industry Avg</th>
                      <th className="text-right py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Current Ratio", yours: `${ratios.current_ratio}x`, benchmark: "1.5x", ok: ratios.current_ratio >= 1.5 },
                      { name: "Debt-to-Equity", yours: `${ratios.debt_to_equity}x`, benchmark: "<2.0x", ok: ratios.debt_to_equity <= 2 },
                      { name: "Gross Margin", yours: `${ratios.gross_margin}%`, benchmark: "30-40%", ok: ratios.gross_margin >= 30 },
                      { name: "Net Margin", yours: `${ratios.net_margin}%`, benchmark: ">10%", ok: ratios.net_margin >= 10 },
                      { name: "ROE", yours: `${ratios.return_on_equity}%`, benchmark: ">15%", ok: ratios.return_on_equity >= 15 },
                      { name: "Working Capital", yours: fmt(ratios.working_capital, true), benchmark: "Positive", ok: ratios.working_capital > 0 },
                    ].map((row) => (
                      <tr key={row.name} className="border-b border-white/3">
                        <td className="py-3 text-white/50">{row.name}</td>
                        <td className="py-3 text-right text-white font-semibold tabular-nums">{row.yours}</td>
                        <td className="py-3 text-right text-white/30 tabular-nums">{row.benchmark}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${row.ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {row.ok ? "Healthy" : "Review"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const rows = [
                    ["Profit & Loss Statement"],
                    [""],
                    ["Revenue"],
                    ...ca.revenue.map(a => [a.name, "", fmt(Math.abs(a.net))]),
                    ["Total Revenue", "", fmt(fs.total_revenue)],
                    [""],
                    ["Expenses"],
                    ...ca.expenses.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map(a => [a.name, "", fmt(Math.abs(a.net))]),
                    ["Total Expenses", "", fmt(fs.total_expenses)],
                    [""],
                    ["Net Income", "", fmt(fs.net_income)],
                  ];
                  const csv = rows.map(r => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url; link.download = "profit_and_loss.csv"; link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download P&L (CSV)
              </button>
              <button
                onClick={() => {
                  const rows = [
                    ["Balance Sheet"],
                    [""],
                    ["Assets"],
                    ...ca.assets.map(a => [a.name, "", fmt(Math.abs(a.net))]),
                    ["Total Assets", "", fmt(Math.abs(fs.total_assets))],
                    [""],
                    ["Liabilities"],
                    ...ca.liabilities.map(a => [a.name, "", fmt(Math.abs(a.net))]),
                    ["Total Liabilities", "", fmt(Math.abs(fs.total_liabilities))],
                    [""],
                    ["Equity"],
                    ...ca.equity.map(a => [a.name, "", fmt(Math.abs(a.net))]),
                    ["Total Equity", "", fmt(Math.abs(fs.total_equity))],
                  ];
                  const csv = rows.map(r => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url; link.download = "balance_sheet.csv"; link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Balance Sheet (CSV)
              </button>
              <button
                onClick={() => {
                  const allAccounts = [
                    ...ca.assets.map(a => ({ ...a, category: "Assets" })),
                    ...ca.liabilities.map(a => ({ ...a, category: "Liabilities" })),
                    ...ca.equity.map(a => ({ ...a, category: "Equity" })),
                    ...ca.revenue.map(a => ({ ...a, category: "Revenue" })),
                    ...ca.expenses.map(a => ({ ...a, category: "Expenses" })),
                  ];
                  const csvHeader = "Category,Account Name,Sub Group,Debit,Credit,Net\n";
                  const csvRows = allAccounts.map(a =>
                    `${a.category},"${a.name}","${a.sub_group || ""}",${a.debit},${a.credit},${a.net}`
                  ).join("\n");
                  const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url; link.download = "classified_accounts.csv"; link.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/8 text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download Classified Ledger (CSV)
              </button>
            </div>

          </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Ask AI Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 transition-all z-50"
        >
          {showChat ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
        </button>

        {/* Ask AI Chat Panel */}
        {showChat && (
          <div className="fixed bottom-24 right-6 w-[420px] max-h-[520px] bg-[#111] rounded-2xl border border-white/8 shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ask CortexCFO AI</p>
                <p className="text-[10px] text-white/15">Ask anything about your financial analysis</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-[#e5e5e5] mx-auto mb-3" />
                  <p className="text-xs text-white/15 mb-4">Try asking:</p>
                  <div className="space-y-2">
                    {["What are my top expenses?", "Explain the suspense account", "How is my financial health?", "Break down employee costs"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="block w-full text-left text-xs text-white/30 hover:text-white/70 bg-[#111] hover:bg-white/[0.06] rounded-lg px-3 py-2 transition-colors"
                      >
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
                  <div className="bg-white/3 rounded-xl px-4 py-3 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/8 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  placeholder="Ask about your financials..."
                  className="flex-1 bg-white/3 border border-white/8 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleAskAI}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-10 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Upload / Manual entry view
  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white">Trial Balance Analysis</h1>
        <p className="text-sm text-white/30 mt-2">
          Upload your Trial Balance and get instant Ind AS review, AI-powered questions, and detailed financial analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/50/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="border-2 border-dashed border-white/8 rounded-2xl p-12 text-center hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv,.json,.xlsx,.xls"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  // For now analyze the first file; multi-file comparison coming soon
                  handleFileUpload(files[0]);
                }
              }}
            />
            {loading ? (
              <Loader2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
            )}
            <p className="text-lg font-medium text-white mb-2">
              {loading ? "Analyzing..." : "Drop your Trial Balance here"}
            </p>
            <p className="text-sm text-white/30">
              Supports CSV, JSON, and Excel (.xlsx) files from Tally, Zoho, or any accounting software.
            </p>
            <p className="text-xs text-white/20 mt-2">You can select multiple files for comparison (coming soon)</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/3" />
            <span className="text-xs text-white/40">OR</span>
            <div className="flex-1 h-px bg-white/3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("manual")}
              className="p-6 rounded-xl border border-white/8 bg-[#111] hover:bg-white/5 hover:border-white/8 transition-all text-left"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-3" />
              <p className="text-sm font-semibold text-white">Enter Manually</p>
              <p className="text-xs text-white/30 mt-1">Type your Trial Balance line by line</p>
            </button>
            <button
              onClick={loadSampleData}
              className="p-6 rounded-xl border border-white/8 bg-[#111] hover:bg-white/5 hover:border-white/8 transition-all text-left"
            >
              <Info className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm font-semibold text-white">Load Sample Data</p>
              <p className="text-xs text-white/30 mt-1">Try with a pre-built Indian company TB</p>
            </button>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Enter Trial Balance</h2>
            <div className="flex gap-2">
              <button onClick={() => setMode("upload")} className="text-xs text-white/30 hover:text-white/40 px-3 py-1.5">
                Back
              </button>
              <button onClick={addRow} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-400 px-3 py-1.5 border border-emerald-500/20 rounded-lg">
                <Plus className="w-3 h-3" /> Add Row
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[1fr_140px_140px_40px] gap-2 text-xs text-white/30 font-medium px-1">
            <span>Account Name</span>
            <span className="text-right">Debit (₹)</span>
            <span className="text-right">Credit (₹)</span>
            <span />
          </div>

          {/* Rows */}
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_140px_40px] gap-2">
                <input
                  value={row.account_name}
                  onChange={(e) => updateRow(i, "account_name", e.target.value)}
                  placeholder="e.g., Sundry Debtors"
                  className="bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-emerald-500/50"
                />
                <input
                  value={row.debit}
                  onChange={(e) => updateRow(i, "debit", e.target.value)}
                  placeholder="0"
                  type="number"
                  className="bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-sm text-white text-right placeholder:text-white/40 outline-none focus:border-emerald-500/50"
                />
                <input
                  value={row.credit}
                  onChange={(e) => updateRow(i, "credit", e.target.value)}
                  placeholder="0"
                  type="number"
                  className="bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-sm text-white text-right placeholder:text-white/40 outline-none focus:border-emerald-500/50"
                />
                <button onClick={() => removeRow(i)} className="flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-[1fr_140px_140px_40px] gap-2 border-t border-white/8 pt-3 px-1">
            <span className="text-sm font-semibold text-white">Total</span>
            <span className="text-sm font-semibold text-white text-right">
              {fmt(rows.reduce((s, r) => s + (parseFloat(r.debit) || 0), 0))}
            </span>
            <span className="text-sm font-semibold text-white text-right">
              {fmt(rows.reduce((s, r) => s + (parseFloat(r.credit) || 0), 0))}
            </span>
            <span />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white font-semibold py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze Trial Balance"}
          </button>
        </div>
      )}
    </div>
  );
}
