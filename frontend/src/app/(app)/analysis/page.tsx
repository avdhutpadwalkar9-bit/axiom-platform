"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import AIChatBubble from "@/components/AIChatBubble";
import ModelSelector from "@/components/ModelSelector";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { exportAnalysisPdf } from "@/lib/exportPdf";
import { asCurrency } from "@/lib/currency";
import { useFormat } from "@/hooks/useFormat";
import { useFx } from "@/context/FxContext";
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
  GitCompareArrows,
  Calendar,
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

interface RatioMetaEntry { value: number; status: "ok" | "not_computable"; reason?: string }
interface RatiosMetaBag {
  current_ratio: RatioMetaEntry;
  debt_to_equity: RatioMetaEntry;
  gross_margin: RatioMetaEntry;
  net_margin: RatioMetaEntry;
  return_on_equity: RatioMetaEntry;
  working_capital: RatioMetaEntry;
}
interface UploadMeta {
  file_name?: string;
  declared_mode?: string;
  parser?: string;
  source_format?: string;
  pages_parsed?: number;
  unit_multiplier?: number;
  raw_text_length?: number;
  transaction_count?: number;
  parser_warnings?: string[];
  customer_concentration?: { customer: string; revenue: number; share_pct: number }[];
}
interface AnalysisResult {
  summary: { total_debit: number; total_credit: number; is_balanced: boolean; variance: number };
  financial_statements: { total_assets: number; total_liabilities: number; total_equity: number; total_revenue: number; total_expenses: number; net_income: number };
  ratios: { current_ratio: number; debt_to_equity: number; gross_margin: number; net_margin: number; return_on_equity: number; working_capital: number };
  ratios_meta?: RatiosMetaBag;
  completeness?: { computed: number; total: number; pct: number };
  input_mode?: "TB" | "AUDITED" | "GL" | "PNL_ONLY" | "BS_ONLY" | "MIS" | "SIMPLE";
  upload_meta?: UploadMeta;
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


const PIE_COLORS = ["#10b981", "#14b8a6", "#22c55e", "#34d399", "#2dd4bf", "#06b6d4"];

// Supported upload types. Keeps the picker honest about what the backend
// will actually do — GL / AUDITED have dedicated parsers; the rest still
// route through the TB pipeline today (the analyzer copes with partial
// inputs thanks to ratios_meta) but are tagged so downstream UI can
// render the correct banner.
type InputMode = "TB" | "AUDITED" | "GL" | "PNL_ONLY" | "BS_ONLY" | "MIS" | "SIMPLE";
const INPUT_MODE_OPTIONS: {
  value: InputMode;
  label: string;
  sub: string;
  accept: string;
}[] = [
  { value: "TB", label: "Trial Balance", sub: "CSV / Excel / JSON", accept: ".csv,.json,.xlsx,.xls" },
  { value: "AUDITED", label: "Audited Financials", sub: "Schedule III PDF or Excel", accept: ".pdf,.xlsx,.xls" },
  { value: "GL", label: "General Ledger", sub: "Zoho / Tally / QuickBooks Excel", accept: ".xlsx,.xls" },
  { value: "PNL_ONLY", label: "P&L Only", sub: "Income statement extract", accept: ".csv,.xlsx,.xls" },
  { value: "BS_ONLY", label: "Balance Sheet Only", sub: "Position statement extract", accept: ".csv,.xlsx,.xls" },
  { value: "MIS", label: "MIS Report", sub: "Monthly management pack", accept: ".csv,.xlsx,.xls" },
  { value: "SIMPLE", label: "Simple Excel", sub: "Ad-hoc summary sheet", accept: ".csv,.xlsx,.xls" },
];

export default function AnalysisPage() {
  const { setResult: saveToStore, lastResult: storedResult, companyName: storedCompanyName } = useAnalysisStore();
  const { business } = useOnboardingStore();
  // `currency` stays in scope because the upload handlers below stamp
  // it onto the new analysis as its source currency.
  const currency = asCurrency(business?.currency);
  // Snapshot rates at upload time so the analysis locks to the FX rate
  // on the day it was uploaded. Reproducible reporting.
  const { rates: liveRates } = useFx();
  // Unified formatter: converts source → display currency + formats.
  // Uniform-adapter API so the existing `fmt(value, compact)` call sites
  // keep working.
  const { fmt: fmtConv, fmtFull: fmtFullConv } = useFormat();
  const fmt = (value: number, compact = false): string =>
    compact ? fmtConv(value) : fmtFullConv(value);
  // Initialize from the persisted analysis store — so navigating back to
  // this tab shows the last analysis instead of a fresh upload zone.
  // If the user wants to run a new analysis, the "New Analysis" button
  // in the results header resets this back to upload mode.
  const [mode, setMode] = useState<"upload" | "manual" | "results">(
    storedResult ? "results" : "upload",
  );
  const [rows, setRows] = useState<TBRow[]>([{ account_name: "", debit: "", credit: "" }]);
  const [result, setResult] = useState<AnalysisResult | null>(
    (storedResult as AnalysisResult | null) ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Which input kind the user is uploading. Drives both the Accept filter
  // on the file input and the input_mode form field posted to the backend
  // dispatcher at /api/analysis/upload.
  const [inputMode, setInputMode] = useState<InputMode>("TB");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary", "questions", "insights", "indas"]));
  const [activeTab, setActiveTab] = useState("overview");
  const [companyLabel, setCompanyLabel] = useState<string>(
    storedCompanyName || "Your Company",
  );

  // Real company name for exports — prefer onboarding profile, fall back to
  // filename-derived companyLabel, then a safe generic.
  const reportCompanyName = business?.companyName?.trim() || companyLabel || "Your Company";

  // Multi-year comparison state. When a second file is uploaded as the
  // "prior year", we unlock the Comparison tab with variance analysis.
  const [priorResult, setPriorResult] = useState<AnalysisResult | null>(null);
  const [currentYearLabel, setCurrentYearLabel] = useState<string>("Current Year");
  const [priorYearLabel, setPriorYearLabel] = useState<string>("Prior Year");
  const [priorLoading, setPriorLoading] = useState(false);

  // Ask AI chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  // Model selector — Claude default, Gemini/Groq are free-tier fallbacks.
  const [chatProvider, setChatProvider] = useState<"claude" | "gemini" | "groq">("claude");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [answerInputs, setAnswerInputs] = useState<Record<number, string>>({});

  const handleAskAI = async () => {
    if (!chatInput.trim() || !result) return;
    const question = chatInput.trim();

    // Capture full history INCLUDING the new user message BEFORE the async
    // state update — setChatMessages is batched by React, so `chatMessages`
    // still holds the OLD array after the setter call.
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
          analysis_result: result,
          conversation_history: updatedHistory.slice(-10),
          user_answers: questionAnswers,
          provider: chatProvider,
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

  const handleFileUpload = async (file: File, forcedMode?: InputMode) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("input_mode", forcedMode ?? inputMode);
      const res = await fetch(`${API_BASE}/api/analysis/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // Stash GL upload_meta.customer_concentration into sessionStorage so
      // the QoE page can read it without re-uploading.
      try {
        if (data?.upload_meta?.customer_concentration) {
          sessionStorage.setItem(
            "cortexcfo-last-gl-meta",
            JSON.stringify(data.upload_meta),
          );
        }
      } catch {
        // sessionStorage quota / SSR — non-fatal.
      }
      setResult(data);
      const label = file.name.replace(/\.\w+$/, "");
      setCompanyLabel(label);
      // Stamp the user's CURRENT reporting currency as the source
      // currency AND snapshot the live FX rate table so the analysis
      // locks to today's rate — reproducible across sessions.
      saveToStore(data, label, currency, liveRates);
      setMode("results");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /** Upload a second file for year-on-year comparison (prior year). Reuses
   *  the currently selected input_mode so a TB-vs-TB comparison stays a
   *  TB analysis, and GL-vs-GL stays a GL analysis. */
  const handlePriorYearUpload = async (file: File) => {
    setPriorLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("input_mode", inputMode);
      const res = await fetch(`${API_BASE}/api/analysis/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPriorResult(data);
      setActiveTab("comparison");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Prior year upload failed");
    } finally {
      setPriorLoading(false);
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
      // Same source-currency + FX snapshot as the upload path.
      saveToStore(data, "Manual Entry", currency, liveRates);
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

    const um = result.upload_meta;
    const parserLabel = (() => {
      const im = result.input_mode ?? "TB";
      if (im === "AUDITED") return "Audited Financial Statements";
      if (im === "GL") return "General Ledger";
      if (im === "PNL_ONLY") return "P&L Extract";
      if (im === "BS_ONLY") return "Balance Sheet Extract";
      if (im === "MIS") return "MIS Report";
      if (im === "SIMPLE") return "Simple Excel";
      return "Trial Balance";
    })();
    const unitLabel = (() => {
      const u = um?.unit_multiplier;
      if (!u || u === 1) return null;
      if (u >= 1_00_00_000) return "in crores";
      if (u >= 1_00_000) return "in lakhs";
      if (u >= 1_000_000) return "in millions";
      if (u >= 1_000) return "in thousands";
      return null;
    })();

    return (
      <div className="p-6 lg:p-8 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-app-text">Financial Analysis Report</h1>
            <p className="text-sm text-app-text-subtle mt-1">Financial review &middot; AI-powered insights</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setMode("upload"); setResult(null); setPriorResult(null); }} className="px-4 py-2 bg-app-canvas border border-app-border rounded-lg text-xs text-app-text-subtle hover:bg-app-card-hover transition-colors">
              New Analysis
            </button>
            <button
              onClick={() => exportAnalysisPdf(result, reportCompanyName, priorResult, priorResult ? `${priorYearLabel} vs ${currentYearLabel}` : undefined)}
              className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" /> Export PDF
            </button>
          </div>
        </div>

        {/* Parser feedback banner — shows which input mode was used plus any
            parser warnings (scanned PDF, no customer-id column, etc.). Only
            renders when upload_meta is present, so manual entries stay clean. */}
        {um && (
          <div className="bg-app-card rounded-xl border border-app-border p-4 flex items-start gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-app-text">{parserLabel}</p>
                {result.input_mode && result.input_mode !== "TB" && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {result.input_mode}
                  </span>
                )}
                {unitLabel && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-app-card-hover border border-app-border-strong text-app-text-muted px-2 py-0.5 rounded-full">
                    Amounts {unitLabel}
                  </span>
                )}
                {typeof um.transaction_count === "number" && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-app-card-hover border border-app-border-strong text-app-text-muted px-2 py-0.5 rounded-full">
                    {um.transaction_count.toLocaleString("en-IN")} transactions
                  </span>
                )}
                {typeof um.pages_parsed === "number" && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-app-card-hover border border-app-border-strong text-app-text-muted px-2 py-0.5 rounded-full">
                    {um.pages_parsed} pages parsed
                  </span>
                )}
              </div>
              <p className="text-xs text-app-text-subtle mt-1">
                {um.file_name ?? "Uploaded file"}
                {um.source_format ? <> &middot; Source detected: <span className="text-app-text-muted">{um.source_format}</span></> : null}
              </p>
              {um.parser_warnings && um.parser_warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {um.parser_warnings.map((w, i) => (
                    <p key={i} className="text-[11px] text-amber-300/80 leading-relaxed">
                      <AlertTriangle className="w-3 h-3 inline-block mr-1 align-text-top text-amber-400" />
                      {w}
                    </p>
                  ))}
                </div>
              )}
              {result.input_mode === "AUDITED" && (
                <p className="text-[11px] text-app-text-subtle mt-2 leading-relaxed">
                  Numbers were extracted directly from the audited PDF. For precision-critical analysis, upload the underlying Trial Balance or General Ledger as well.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Prior-year upload strip — shown when we have a current-year result
            but no prior year yet. Lets user unlock variance analysis. */}
        {!priorResult && (
          <div className="bg-app-card rounded-xl border border-app-border p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <GitCompareArrows className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-app-text">Compare with another year</p>
              <p className="text-xs text-app-text-subtle mt-0.5">Upload a second trial balance to unlock variance and common-size comparison.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={priorYearLabel}
                onChange={(e) => setPriorYearLabel(e.target.value)}
                placeholder="e.g., FY 2023-24"
                className="w-32 bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-xs text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50"
              />
              <input
                id="prior-file-input"
                type="file"
                accept=".csv,.tsv,.json,.xlsx,.xls,.xlsm,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePriorYearUpload(f);
                }}
              />
              <button
                onClick={() => document.getElementById("prior-file-input")?.click()}
                disabled={priorLoading}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {priorLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                {priorLoading ? "Analyzing..." : "Upload Prior Year"}
              </button>
            </div>
          </div>
        )}

        {/* Year labels strip — shown when comparison is active. */}
        {priorResult && (
          <div className="bg-app-card rounded-xl border border-emerald-500/20 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-app-text-subtle">Prior</p>
                <input
                  value={priorYearLabel}
                  onChange={(e) => setPriorYearLabel(e.target.value)}
                  className="bg-transparent border-none text-sm text-app-text font-medium outline-none w-28 mt-0.5"
                />
              </div>
              <ChevronRight className="w-4 h-4 text-app-text-subtle" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-app-text-subtle">Current</p>
                <input
                  value={currentYearLabel}
                  onChange={(e) => setCurrentYearLabel(e.target.value)}
                  className="bg-transparent border-none text-sm text-app-text font-medium outline-none w-28 mt-0.5"
                />
              </div>
            </div>
            <button
              onClick={() => { setPriorResult(null); setActiveTab("overview"); }}
              className="px-3 py-1.5 rounded-lg text-xs text-app-text-subtle hover:text-app-text hover:bg-app-card-hover transition-colors"
            >
              Remove comparison
            </button>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-2">
            {warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${w.severity === "critical" ? "bg-red-500/50/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                {w.severity === "critical" ? <XCircle className="w-5 h-5 text-red-400 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium text-app-text">{w.title}</p>
                  <p className="text-xs text-app-text-subtle mt-0.5">{w.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Nav */}
        <div className="flex gap-1 bg-app-card rounded-lg border border-app-border p-1 w-fit">
          {[
            { key: "overview", label: "Overview" },
            { key: "questions", label: "AI Questions" },
            { key: "deepdive", label: "Deep Dive" },
            ...(priorResult ? [{ key: "comparison", label: "Comparison" }] : []),
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${activeTab === tab.key ? "bg-app-card-hover text-app-text" : "text-app-text-subtle hover:text-app-text-subtle"}`}>
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
                <div key={card.label} className="bg-app-card rounded-xl p-5 border border-app-border">
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <p className="text-xs text-app-text-subtle">{card.label}</p>
                  <p className="text-xl font-bold text-app-text mt-0.5">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Balance Sheet + Ratios */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-app-card rounded-xl border border-app-border p-6">
                <h3 className="text-sm font-semibold text-app-text mb-4">Balance Sheet Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Assets", value: fs.total_assets, color: "bg-emerald-500" },
                    { label: "Total Liabilities", value: fs.total_liabilities, color: "bg-red-500/50" },
                    { label: "Total Equity", value: fs.total_equity, color: "bg-emerald-500" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm text-app-text-subtle">{item.label}</span>
                      </div>
                      <span className="text-sm font-medium text-app-text">{fmt(item.value, true)}</span>
                    </div>
                  ))}
                  <div className="border-t border-app-border pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-app-text-subtle font-medium">Assets = L + E</span>
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

              <div className="bg-app-card rounded-xl border border-app-border p-6">
                <h3 className="text-sm font-semibold text-app-text mb-4">Key Financial Ratios</h3>
                <div className="space-y-4">
                  {(() => {
                    const rm = result.ratios_meta;
                    const row = (
                      key: keyof RatiosMetaBag,
                      label: string,
                      benchmark: string,
                      format: (v: number) => string,
                      okWhen: (v: number) => boolean,
                    ) => {
                      const m = rm?.[key];
                      const legacy = ratios[key] as number;
                      const computable = !m || m.status === "ok";
                      const value = computable ? format(m ? m.value : legacy) : "—";
                      const ok = computable && okWhen(m ? m.value : legacy);
                      return { label, benchmark, value, ok, computable, reason: m?.reason };
                    };
                    const ratioRows = [
                      row("current_ratio", "Current Ratio", "Ideal: > 1.5x", (v) => `${v}x`, (v) => v >= 1.5),
                      row("debt_to_equity", "Debt-to-Equity", "Ideal: < 2.0x", (v) => `${v}x`, (v) => v <= 2),
                      row("gross_margin", "Gross Margin", "Industry: 30-50%", (v) => `${v}%`, (v) => v >= 30),
                      row("net_margin", "Net Margin", "Healthy: > 10%", (v) => `${v}%`, (v) => v >= 10),
                      row("return_on_equity", "Return on Equity", "Good: > 15%", (v) => `${v}%`, (v) => v >= 15),
                      row("working_capital", "Working Capital", "Should be positive", (v) => fmt(v, true), (v) => v > 0),
                    ];
                    return ratioRows.map((r) => (
                      <div key={r.label} className="flex items-center justify-between" title={!r.computable ? r.reason : undefined}>
                        <div>
                          <p className="text-sm text-app-text-subtle">{r.label}</p>
                          <p className="text-[10px] text-app-text-subtle">{r.computable ? r.benchmark : (r.reason ?? "Not available")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${r.computable ? "text-app-text" : "text-app-text-subtle"}`}>{r.value}</span>
                          <div className={`w-2 h-2 rounded-full ${!r.computable ? "bg-white/20" : r.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Expense Breakdown */}
            {expenseData.length > 0 && (
              <div className="bg-app-card rounded-xl border border-app-border p-6">
                <h3 className="text-sm font-semibold text-app-text mb-4">Expense Breakdown (Top 8)</h3>
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
                <h3 className="text-sm font-semibold text-app-text">AI Clarifying Questions</h3>
              </div>
              <p className="text-xs text-app-text-subtle mb-6">The AI identified these areas that need clarification for a more accurate analysis. Answering these will improve the quality of the financial review.</p>

              {ai_questions.map((q, i) => {
                const isAnswered = !!questionAnswers[q.question];
                return (
                  <div key={i} className={`mb-4 p-5 rounded-xl border ${isAnswered ? "bg-emerald-500/5 border-emerald-500/20" : "bg-app-card border-app-border"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isAnswered ? "bg-emerald-500/20" : "bg-emerald-500/10"}`}>
                        {isAnswered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-xs font-bold text-emerald-400">{i + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-app-text leading-relaxed">{q.question}</p>
                        <p className="text-xs text-app-text-subtle mt-2 italic">Why this matters: {q.reason}</p>

                        {/* Answer section */}
                        {isAnswered ? (
                          <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <p className="text-xs text-emerald-400 font-medium mb-1">Your answer:</p>
                            <p className="text-sm text-app-text-muted">{questionAnswers[q.question]}</p>
                          </div>
                        ) : (
                          <div className="mt-3 flex gap-2">
                            <input
                              value={answerInputs[i] || ""}
                              onChange={(e) => setAnswerInputs(prev => ({ ...prev, [i]: e.target.value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleAnswerQuestion(i, q.question)}
                              placeholder="Type your answer..."
                              className="flex-1 bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/50"
                            />
                            <button
                              onClick={() => handleAnswerQuestion(i, q.question)}
                              disabled={!answerInputs[i]?.trim() || chatLoading}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-xs text-app-text font-medium disabled:opacity-30 transition-colors flex items-center gap-1"
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
            {/* Compliance placeholder. The underlying ind_as_observations
                data is still computed + stored — we just hide the
                surface until our in-house experts complete the
                region-specific compliance engine (US GAAP + Ind AS +
                tax authority reconciliation). Keeps the promise
                honest without discarding backend work. */}
            <div className="bg-app-card rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-6 py-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-app-text mb-1">
                    Compliance review &mdash; coming soon
                  </p>
                  <p className="text-xs text-app-text-subtle leading-relaxed">
                    Regulatory callouts (Ind AS / US GAAP, GST, TDS, ITC,
                    IRS, Schedule III, ASC 606) will be reviewed by our
                    in-house experts before publication. Your analysis is
                    captured and versioned; we&rsquo;ll surface the
                    per-region compliance panel here once it&rsquo;s
                    reviewer-approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Insights & Actions */}
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <button
                onClick={() => toggleSection("insights")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-app-canvas transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-app-text">Insights &amp; Actions</h3>
                  <span className="text-[10px] text-app-text-subtle ml-1">{insights.length} findings</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-app-text-subtle transition-transform ${expandedSections.has("insights") ? "rotate-180" : ""}`} />
              </button>
              {expandedSections.has("insights") && (
                <div className="px-6 pb-5 space-y-3">
                  {insights.map((ins, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${ins.severity === "critical" || ins.severity === "high" ? "bg-red-500/5 border-red-500/20" : ins.severity === "warning" || ins.severity === "medium" ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-app-text-subtle">{ins.category}</span>
                          <h4 className="text-sm font-semibold text-app-text mt-0.5">{ins.title}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-app-text-subtle leading-relaxed mb-3">{ins.detail}</p>
                      {ins.action && (
                        <div className="flex items-center gap-2 p-2.5 bg-app-card rounded-lg border border-app-border">
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
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <button
                onClick={() => toggleSection("statements")}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-app-canvas transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-app-text">Financial Statements</h3>
                </div>
                <ChevronDown className={`w-4 h-4 text-app-text-subtle transition-transform ${expandedSections.has("statements") ? "rotate-180" : ""}`} />
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-app-border text-xs font-medium text-app-text-subtle hover:bg-app-card-hover transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export Classified Accounts (CSV)
              </button>
            </div>

            {/* Profit & Loss Statement — Runway-style clean table */}
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border/70 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-app-text">Profit &amp; Loss Statement</h3>
                <span className="text-[10px] text-app-text-subtle">Current Period</span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app-border/70">
                    <th className="text-left px-6 py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium">Driver</th>
                    <th className="text-right px-6 py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium">Amount</th>
                    <th className="text-right px-6 py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium w-32">% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-app-canvas">
                    <td className="px-6 py-2 text-[10px] text-app-text-subtle uppercase tracking-wider font-semibold" colSpan={3}>Revenue</td>
                  </tr>
                  {ca.revenue.map((item, i) => (
                    <tr key={`rev-${i}`} className="border-b border-white/3 hover:bg-app-canvas transition-colors">
                      <td className="px-6 py-2.5 text-app-text-muted">{item.name}</td>
                      <td className="px-6 py-2.5 text-right font-medium text-app-text tabular-nums">{fmt(Math.abs(item.net))}</td>
                      <td className="px-6 py-2.5 text-right text-app-text-subtle tabular-nums text-xs">{fs.total_revenue > 0 ? ((Math.abs(item.net) / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  ))}
                  <tr className="border-t border-app-border-strong bg-app-card-hover">
                    <td className="px-6 py-3 font-semibold text-app-text">Total Revenue</td>
                    <td className="px-6 py-3 text-right font-bold text-app-text tabular-nums">{fmt(fs.total_revenue)}</td>
                    <td className="px-6 py-3 text-right text-emerald-400 tabular-nums text-xs">100.0%</td>
                  </tr>

                  <tr className="bg-app-canvas">
                    <td className="px-6 py-2 text-[10px] text-app-text-subtle uppercase tracking-wider font-semibold" colSpan={3}>Expenses</td>
                  </tr>
                  {ca.expenses.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                    <tr key={`exp-${i}`} className="border-b border-white/3 hover:bg-app-canvas transition-colors">
                      <td className="px-6 py-2.5 text-app-text-muted">{item.name}</td>
                      <td className="px-6 py-2.5 text-right font-medium text-app-text tabular-nums">{fmt(Math.abs(item.net))}</td>
                      <td className="px-6 py-2.5 text-right text-app-text-subtle tabular-nums text-xs">{fs.total_revenue > 0 ? ((Math.abs(item.net) / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                    </tr>
                  ))}
                  <tr className="border-t border-app-border-strong bg-app-card-hover">
                    <td className="px-6 py-3 font-semibold text-app-text">Total Expenses</td>
                    <td className="px-6 py-3 text-right font-bold text-app-text tabular-nums">{fmt(fs.total_expenses)}</td>
                    <td className="px-6 py-3 text-right text-red-400 tabular-nums text-xs">{fs.total_revenue > 0 ? ((fs.total_expenses / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                  </tr>

                  <tr className="border-t-2 border-emerald-500/20 bg-emerald-500/5">
                    <td className="px-6 py-4 font-bold text-app-text text-base">Net Income</td>
                    <td className={`px-6 py-4 text-right font-bold text-base tabular-nums ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fmt(fs.net_income)}</td>
                    <td className={`px-6 py-4 text-right font-semibold tabular-nums ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>{fs.total_revenue > 0 ? ((fs.net_income / fs.total_revenue) * 100).toFixed(1) : "0"}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Balance Sheet */}
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border bg-app-canvas">
                <h3 className="text-sm font-semibold text-app-text">Balance Sheet</h3>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-app-border/70">
                      <td className="py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium" colSpan={2}>Assets</td>
                    </tr>
                    {ca.assets.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`ast-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-app-text-subtle">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-app-text">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-app-border bg-app-canvas">
                      <td className="py-3 font-semibold text-app-text">Total Assets</td>
                      <td className="py-3 text-right font-bold text-app-text">{fmt(Math.abs(fs.total_assets))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="border-b border-app-border/70">
                      <td className="py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium" colSpan={2}>Liabilities</td>
                    </tr>
                    {ca.liabilities.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`lib-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-app-text-subtle">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-app-text">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-app-border bg-app-canvas">
                      <td className="py-3 font-semibold text-app-text">Total Liabilities</td>
                      <td className="py-3 text-right font-bold text-app-text">{fmt(Math.abs(fs.total_liabilities))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="border-b border-app-border/70">
                      <td className="py-3 text-[11px] text-app-text-subtle uppercase tracking-wider font-medium" colSpan={2}>Equity</td>
                    </tr>
                    {ca.equity.sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).map((item, i) => (
                      <tr key={`eq-${i}`} className="border-b border-white/3">
                        <td className="py-2.5 pl-4 text-app-text-subtle">{item.name}</td>
                        <td className="py-2.5 text-right font-medium text-app-text">{fmt(Math.abs(item.net))}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-app-border bg-app-canvas">
                      <td className="py-3 font-semibold text-app-text">Total Equity</td>
                      <td className="py-3 text-right font-bold text-app-text">{fmt(Math.abs(fs.total_equity))}</td>
                    </tr>

                    <tr><td className="py-2" colSpan={2}></td></tr>
                    <tr className="bg-blue-50/50 border-t-2 border-blue-200">
                      <td className="py-4 font-bold text-app-text text-base">Liabilities + Equity</td>
                      <td className="py-4 text-right font-bold text-base text-app-text">{fmt(Math.abs(fs.total_liabilities) + Math.abs(fs.total_equity))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cash Flow Indicators */}
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border bg-app-canvas">
                <h3 className="text-sm font-semibold text-app-text">Cash Flow Indicators</h3>
                <p className="text-[10px] text-app-text-subtle mt-0.5">Estimated from Trial Balance data</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-app-text-subtle">Net Income</td>
                      <td className={`py-3 text-right font-medium ${fs.net_income >= 0 ? "text-emerald-400" : "text-red-500"}`}>{fmt(fs.net_income)}</td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-app-text-subtle">Add: Depreciation (non-cash)</td>
                      <td className="py-3 text-right font-medium text-app-text">
                        {fmt(ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation") || e.name.toLowerCase().includes("amortisation") || e.name.toLowerCase().includes("amortization")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-app-text-subtle">Working Capital</td>
                      <td className={`py-3 text-right font-medium ${ratios.working_capital >= 0 ? "text-app-text" : "text-red-500"}`}>{fmt(ratios.working_capital)}</td>
                    </tr>
                    <tr className="border-b border-white/3">
                      <td className="py-3 text-app-text-subtle">Cash &amp; Bank Balance</td>
                      <td className="py-3 text-right font-medium text-app-text">
                        {fmt(ca.assets.filter(e => e.name.toLowerCase().includes("cash") || e.name.toLowerCase().includes("bank")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                    <tr className="bg-app-canvas border-t border-app-border">
                      <td className="py-4 font-semibold text-app-text">Estimated Operating Cash Flow</td>
                      <td className={`py-4 text-right font-bold ${fs.net_income + ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation")).reduce((s, e) => s + Math.abs(e.net), 0) >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                        {fmt(fs.net_income + ca.expenses.filter(e => e.name.toLowerCase().includes("depreciation") || e.name.toLowerCase().includes("amortisation")).reduce((s, e) => s + Math.abs(e.net), 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5 Key Takeaways */}
            <div className="bg-app-card rounded-xl border border-app-border p-6">
              <h3 className="text-sm font-semibold text-app-text mb-4">5 Key Takeaways</h3>
              <div className="space-y-3">
                {(() => {
                  const takeaways: string[] = [];

                  const rm = result.ratios_meta;
                  const isComputed = (k: keyof RatiosMetaBag) => !rm || rm[k].status === "ok";

                  // 1. Profitability — skip if no revenue (net margin not computable)
                  if (fs.net_income >= 0 && isComputed("net_margin")) {
                    takeaways.push(`The business is profitable with a net margin of ${ratios.net_margin}%. Revenue of ${fmt(fs.total_revenue, true)} comfortably covers expenses.`);
                  } else if (fs.net_income < 0 && fs.total_revenue > 0) {
                    takeaways.push(`The business is running at a loss of ${fmt(Math.abs(fs.net_income), true)}. Expenses exceed revenue by ${fmt(fs.total_expenses - fs.total_revenue, true)}.`);
                  }

                  // 2. Liquidity — only if current ratio was computable
                  if (isComputed("current_ratio")) {
                    if (ratios.current_ratio >= 1.5) {
                      takeaways.push(`Liquidity is strong with a current ratio of ${ratios.current_ratio}x. The business can comfortably meet short-term obligations.`);
                    } else if (ratios.current_ratio >= 1) {
                      takeaways.push(`Liquidity is adequate at ${ratios.current_ratio}x current ratio, but there is limited buffer. Keep an eye on receivables and payables timing.`);
                    } else {
                      takeaways.push(`Liquidity is a concern. The current ratio is ${ratios.current_ratio}x (below 1.0), meaning short-term liabilities exceed current assets.`);
                    }
                  }

                  // 3. Capital structure — only if D/E was computable
                  if (isComputed("debt_to_equity")) {
                    if (ratios.debt_to_equity > 1.5) {
                      takeaways.push(`The business is heavily leveraged with a debt-to-equity ratio of ${ratios.debt_to_equity}x. Consider paying down debt to reduce interest burden.`);
                    } else {
                      takeaways.push(`Capital structure is balanced with a debt-to-equity ratio of ${ratios.debt_to_equity}x. Borrowing levels are within acceptable range.`);
                    }
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
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-app-canvas border border-app-border/70">
                      <span className="w-6 h-6 rounded-full bg-[#1a1a1a] text-app-text flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm text-app-text-muted leading-relaxed">{t}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Common Size Analysis */}
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border/70 bg-app-canvas">
                <h3 className="text-sm font-semibold text-app-text">Common Size Analysis</h3>
                <p className="text-[10px] text-app-text-subtle mt-0.5">Each line item as a percentage of revenue</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-app-text-subtle uppercase tracking-wider border-b border-app-border/70">
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
                        <td className="py-2.5 text-app-text-muted">{row.name}</td>
                        <td className="py-2.5 text-right text-app-text font-medium tabular-nums">{fmt(row.value, true)}</td>
                        <td className="py-2.5 text-right text-app-text-subtle tabular-nums">{row.pct.toFixed(1)}%</td>
                        <td className="py-2.5 text-right w-32">
                          <div className="h-2 bg-app-card-hover rounded-full overflow-hidden ml-auto" style={{ width: "100px" }}>
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
            <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
              <div className="px-6 py-4 border-b border-app-border/70 bg-app-canvas">
                <h3 className="text-sm font-semibold text-app-text">Ratio Analysis vs Industry Benchmarks</h3>
                <p className="text-[10px] text-app-text-subtle mt-0.5">Your metrics compared to industry averages</p>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-app-text-subtle uppercase tracking-wider border-b border-app-border/70">
                      <th className="text-left py-2 font-medium">Ratio</th>
                      <th className="text-right py-2 font-medium">Your Value</th>
                      <th className="text-right py-2 font-medium">Industry Avg</th>
                      <th className="text-right py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const rm = result.ratios_meta;
                      type Row = { name: string; yours: string; benchmark: string; status: "Healthy" | "Review" | "N/A"; reason?: string };
                      const row = (
                        key: keyof RatiosMetaBag,
                        name: string,
                        benchmark: string,
                        format: (v: number) => string,
                        okWhen: (v: number) => boolean,
                      ): Row => {
                        const m = rm?.[key];
                        const legacy = ratios[key] as number;
                        if (m && m.status === "not_computable") {
                          return { name, yours: "—", benchmark, status: "N/A", reason: m.reason };
                        }
                        const v = m ? m.value : legacy;
                        return { name, yours: format(v), benchmark, status: okWhen(v) ? "Healthy" : "Review" };
                      };
                      return [
                        row("current_ratio", "Current Ratio", "1.5x", (v) => `${v}x`, (v) => v >= 1.5),
                        row("debt_to_equity", "Debt-to-Equity", "<2.0x", (v) => `${v}x`, (v) => v <= 2),
                        row("gross_margin", "Gross Margin", "30-40%", (v) => `${v}%`, (v) => v >= 30),
                        row("net_margin", "Net Margin", ">10%", (v) => `${v}%`, (v) => v >= 10),
                        row("return_on_equity", "ROE", ">15%", (v) => `${v}%`, (v) => v >= 15),
                        row("working_capital", "Working Capital", "Positive", (v) => fmt(v, true), (v) => v > 0),
                      ].map((r) => (
                        <tr key={r.name} className="border-b border-white/3" title={r.status === "N/A" ? r.reason : undefined}>
                          <td className="py-3 text-app-text-muted">{r.name}</td>
                          <td className={`py-3 text-right font-semibold tabular-nums ${r.status === "N/A" ? "text-app-text-subtle" : "text-app-text"}`}>{r.yours}</td>
                          <td className="py-3 text-right text-app-text-subtle tabular-nums">{r.benchmark}</td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              r.status === "Healthy"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : r.status === "Review"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-app-card-hover text-app-text-subtle"
                            }`}>
                              {r.status === "N/A" ? "Not available" : r.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-app-border text-xs font-medium text-app-text-subtle hover:bg-app-card-hover transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-app-border text-xs font-medium text-app-text-subtle hover:bg-app-card-hover transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-app-border text-xs font-medium text-app-text-subtle hover:bg-app-card-hover transition-colors"
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

        {/* Comparison Tab — variance + common-size vs prior year */}
        {activeTab === "comparison" && priorResult && (
          <div className="space-y-6">
            {(() => {
              const curr = result;
              const prev = priorResult;
              const cfs = curr.financial_statements;
              const pfs = prev.financial_statements;
              const cr = curr.ratios;
              const pr = prev.ratios;

              const varianceRow = (label: string, currVal: number, prevVal: number, expenseLike = false) => {
                const change = currVal - prevVal;
                const pctChange = prevVal !== 0 ? (change / Math.abs(prevVal)) * 100 : 0;
                const isGood = expenseLike ? change <= 0 : change >= 0;
                return { label, currVal, prevVal, change, pctChange, isGood };
              };

              const headlineRows = [
                varianceRow("Total Revenue", cfs.total_revenue, pfs.total_revenue),
                varianceRow("Total Expenses", cfs.total_expenses, pfs.total_expenses, true),
                varianceRow("Net Income", cfs.net_income, pfs.net_income),
                varianceRow("Total Assets", cfs.total_assets, pfs.total_assets),
                varianceRow("Total Liabilities", cfs.total_liabilities, pfs.total_liabilities, true),
                varianceRow("Total Equity", cfs.total_equity, pfs.total_equity),
              ];

              // Build P&L expense variance by matching account names
              const expenseMap: Record<string, { curr: number; prev: number }> = {};
              curr.classified_accounts.expenses.forEach(e => {
                expenseMap[e.name] = { curr: Math.abs(e.net), prev: 0 };
              });
              prev.classified_accounts.expenses.forEach(e => {
                if (expenseMap[e.name]) expenseMap[e.name].prev = Math.abs(e.net);
                else expenseMap[e.name] = { curr: 0, prev: Math.abs(e.net) };
              });
              const expenseVarianceList = Object.entries(expenseMap)
                .map(([name, v]) => ({ name, ...v, change: v.curr - v.prev, pctChange: v.prev !== 0 ? ((v.curr - v.prev) / v.prev) * 100 : (v.curr > 0 ? 100 : 0) }))
                .sort((a, b) => Math.abs(b.curr) - Math.abs(a.curr));

              return (
                <>
                  {/* Headline Variance Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {headlineRows.map(row => (
                      <div key={row.label} className="bg-app-card rounded-xl border border-app-border p-5">
                        <p className="text-xs text-app-text-subtle">{row.label}</p>
                        <div className="flex items-baseline gap-2 mt-2">
                          <p className="text-xl font-bold text-app-text">{fmt(row.currVal, true)}</p>
                          <p className="text-xs text-app-text-subtle">vs {fmt(row.prevVal, true)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          {row.change >= 0 ? (
                            <TrendingUp className={`w-3.5 h-3.5 ${row.isGood ? "text-emerald-400" : "text-red-400"}`} />
                          ) : (
                            <TrendingDown className={`w-3.5 h-3.5 ${row.isGood ? "text-emerald-400" : "text-red-400"}`} />
                          )}
                          <span className={`text-xs font-semibold ${row.isGood ? "text-emerald-400" : "text-red-400"}`}>
                            {row.change >= 0 ? "+" : ""}{fmt(row.change, true)} ({row.pctChange >= 0 ? "+" : ""}{row.pctChange.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Variance Analysis Table — P&L line items */}
                  <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-app-border/70 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-app-text">Variance Analysis — Expenses</h3>
                        <p className="text-[10px] text-app-text-subtle mt-0.5">{priorYearLabel} vs {currentYearLabel}</p>
                      </div>
                      <span className="text-[10px] text-app-text-subtle">{expenseVarianceList.length} line items</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-app-border/70 text-[11px] text-app-text-subtle uppercase tracking-wider">
                            <th className="text-left px-6 py-3 font-medium">Account</th>
                            <th className="text-right px-6 py-3 font-medium">{priorYearLabel}</th>
                            <th className="text-right px-6 py-3 font-medium">{currentYearLabel}</th>
                            <th className="text-right px-6 py-3 font-medium">Change</th>
                            <th className="text-right px-6 py-3 font-medium">% Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseVarianceList.map((row, i) => {
                            const isBad = row.change > 0; // For expenses: increase is bad
                            return (
                              <tr key={i} className="border-b border-white/3 hover:bg-app-canvas">
                                <td className="px-6 py-2.5 text-app-text-muted">{row.name}</td>
                                <td className="px-6 py-2.5 text-right text-app-text-subtle tabular-nums">{fmt(row.prev, true)}</td>
                                <td className="px-6 py-2.5 text-right text-app-text font-medium tabular-nums">{fmt(row.curr, true)}</td>
                                <td className={`px-6 py-2.5 text-right font-medium tabular-nums ${isBad ? "text-red-400" : "text-emerald-400"}`}>
                                  {row.change >= 0 ? "+" : ""}{fmt(row.change, true)}
                                </td>
                                <td className={`px-6 py-2.5 text-right font-medium tabular-nums ${isBad ? "text-red-400" : "text-emerald-400"}`}>
                                  {row.pctChange >= 0 ? "+" : ""}{row.pctChange.toFixed(1)}%
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Ratio Comparison */}
                  <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-app-border/70">
                      <h3 className="text-sm font-semibold text-app-text">Ratio Comparison</h3>
                      <p className="text-[10px] text-app-text-subtle mt-0.5">Year-on-year health check</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-app-border/70 text-[11px] text-app-text-subtle uppercase tracking-wider">
                          <th className="text-left px-6 py-3 font-medium">Ratio</th>
                          <th className="text-right px-6 py-3 font-medium">{priorYearLabel}</th>
                          <th className="text-right px-6 py-3 font-medium">{currentYearLabel}</th>
                          <th className="text-right px-6 py-3 font-medium">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Current Ratio", prev: pr.current_ratio, curr: cr.current_ratio, suffix: "x", higherBetter: true },
                          { label: "Debt-to-Equity", prev: pr.debt_to_equity, curr: cr.debt_to_equity, suffix: "x", higherBetter: false },
                          { label: "Gross Margin", prev: pr.gross_margin, curr: cr.gross_margin, suffix: "%", higherBetter: true },
                          { label: "Net Margin", prev: pr.net_margin, curr: cr.net_margin, suffix: "%", higherBetter: true },
                          { label: "Return on Equity", prev: pr.return_on_equity, curr: cr.return_on_equity, suffix: "%", higherBetter: true },
                        ].map((r, i) => {
                            const delta = r.curr - r.prev;
                            const isGood = r.higherBetter ? delta >= 0 : delta <= 0;
                            return (
                              <tr key={i} className="border-b border-white/3">
                                <td className="px-6 py-3 text-app-text-muted">{r.label}</td>
                                <td className="px-6 py-3 text-right text-app-text-subtle tabular-nums">{r.prev}{r.suffix}</td>
                                <td className="px-6 py-3 text-right text-app-text font-semibold tabular-nums">{r.curr}{r.suffix}</td>
                                <td className={`px-6 py-3 text-right font-medium tabular-nums ${isGood ? "text-emerald-400" : "text-red-400"}`}>
                                  {delta >= 0 ? "+" : ""}{delta.toFixed(2)}{r.suffix}
                                </td>
                              </tr>
                            );
                          })}
                        <tr className="border-b border-white/3">
                          <td className="px-6 py-3 text-app-text-muted">Working Capital</td>
                          <td className="px-6 py-3 text-right text-app-text-subtle tabular-nums">{fmt(pr.working_capital, true)}</td>
                          <td className="px-6 py-3 text-right text-app-text font-semibold tabular-nums">{fmt(cr.working_capital, true)}</td>
                          <td className={`px-6 py-3 text-right font-medium tabular-nums ${(cr.working_capital - pr.working_capital) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {(cr.working_capital - pr.working_capital) >= 0 ? "+" : ""}{fmt(cr.working_capital - pr.working_capital, true)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Common-Size Comparison */}
                  <div className="bg-app-card rounded-xl border border-app-border overflow-hidden">
                    <div className="px-6 py-4 border-b border-app-border/70">
                      <h3 className="text-sm font-semibold text-app-text">Common-Size P&amp;L Comparison</h3>
                      <p className="text-[10px] text-app-text-subtle mt-0.5">Each line as % of revenue — reveals structural shifts</p>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-app-border/70 text-[11px] text-app-text-subtle uppercase tracking-wider">
                          <th className="text-left px-6 py-3 font-medium">Item</th>
                          <th className="text-right px-6 py-3 font-medium">{priorYearLabel}</th>
                          <th className="text-right px-6 py-3 font-medium">{currentYearLabel}</th>
                          <th className="text-right px-6 py-3 font-medium">Shift (pp)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/3 bg-app-canvas">
                          <td className="px-6 py-3 text-app-text font-semibold">Revenue</td>
                          <td className="px-6 py-3 text-right text-app-text-subtle tabular-nums">100.0%</td>
                          <td className="px-6 py-3 text-right text-app-text font-semibold tabular-nums">100.0%</td>
                          <td className="px-6 py-3 text-right text-app-text-subtle tabular-nums">—</td>
                        </tr>
                        {expenseVarianceList.slice(0, 8).map((row, i) => {
                          const prevPct = pfs.total_revenue > 0 ? (row.prev / pfs.total_revenue) * 100 : 0;
                          const currPct = cfs.total_revenue > 0 ? (row.curr / cfs.total_revenue) * 100 : 0;
                          const shift = currPct - prevPct;
                          return (
                            <tr key={i} className="border-b border-white/3">
                              <td className="px-6 py-2.5 text-app-text-muted">{row.name}</td>
                              <td className="px-6 py-2.5 text-right text-app-text-subtle tabular-nums">{prevPct.toFixed(1)}%</td>
                              <td className="px-6 py-2.5 text-right text-app-text font-medium tabular-nums">{currPct.toFixed(1)}%</td>
                              <td className={`px-6 py-2.5 text-right font-medium tabular-nums ${shift > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {shift >= 0 ? "+" : ""}{shift.toFixed(2)} pp
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="border-t border-app-border-strong bg-emerald-500/5">
                          <td className="px-6 py-3 text-app-text font-semibold">Net Income</td>
                          <td className="px-6 py-3 text-right text-app-text-muted tabular-nums">{(pfs.total_revenue > 0 ? (pfs.net_income / pfs.total_revenue) * 100 : 0).toFixed(1)}%</td>
                          <td className={`px-6 py-3 text-right font-bold tabular-nums ${cfs.net_income >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {(cfs.total_revenue > 0 ? (cfs.net_income / cfs.total_revenue) * 100 : 0).toFixed(1)}%
                          </td>
                          <td className="px-6 py-3 text-right text-app-text-subtle tabular-nums">
                            {((cfs.total_revenue > 0 ? (cfs.net_income / cfs.total_revenue) * 100 : 0) - (pfs.total_revenue > 0 ? (pfs.net_income / pfs.total_revenue) * 100 : 0)).toFixed(2)} pp
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Floating Ask AI Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-105 transition-all z-50"
        >
          {showChat ? <X className="w-5 h-5 text-app-text" /> : <MessageCircle className="w-5 h-5 text-app-text" />}
        </button>

        {/* Ask AI Chat Panel */}
        {showChat && (
          <div className="fixed bottom-24 right-6 w-[420px] max-h-[520px] bg-app-card rounded-2xl border border-app-border shadow-2xl shadow-black/50 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-app-border">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-app-text" />
              </div>
              <div>
                <p className="text-sm font-semibold text-app-text">Ask CortexCFO AI</p>
                <p className="text-[10px] text-app-text/15">Ask anything about your financial analysis</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[350px]">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-[#e5e5e5] mx-auto mb-3" />
                  <p className="text-xs text-app-text/15 mb-4">Try asking:</p>
                  <div className="space-y-2">
                    {["What are my top expenses?", "Explain the suspense account", "How is my financial health?", "Break down employee costs"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setChatInput(q); }}
                        className="block w-full text-left text-xs text-app-text-subtle hover:text-app-text-muted bg-app-card hover:bg-white/[0.06] rounded-lg px-3 py-2 transition-colors"
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
                  <div className="bg-app-canvas rounded-xl px-4 py-3 rounded-bl-none">
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
            <div className="border-t border-app-border p-3">
              {/* Provider selector — compact dropdown (Perplexity-style) */}
              <div className="mb-2">
                <ModelSelector value={chatProvider} onChange={setChatProvider} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                  placeholder="Ask about your financials..."
                  className="flex-1 bg-app-canvas border border-app-border rounded-lg px-3 py-2.5 text-sm text-app-text placeholder:text-app-text/15 outline-none focus:border-emerald-500/50"
                />
                <button
                  onClick={handleAskAI}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-10 h-10 rounded-lg bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors disabled:opacity-30"
                >
                  <Send className="w-4 h-4 text-app-text" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Upload / Manual entry view
  const activeMode = INPUT_MODE_OPTIONS.find((o) => o.value === inputMode) ?? INPUT_MODE_OPTIONS[0];
  return (
    <div className="p-6 lg:p-8 max-w-[1000px] mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-app-text">Financial Analysis</h1>
        <p className="text-sm text-app-text-subtle mt-2">
          Upload a Trial Balance, Audited Financials, General Ledger, or MIS — we&apos;ll deliver an instant Ind AS review, AI-powered questions, and detailed ratio analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/50/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {mode === "upload" && (
        <div className="space-y-6">
          {/* File-type picker — drives both the <input accept="..."> filter
              and the `input_mode` form field sent to the dispatcher. */}
          <div>
            <p className="text-xs uppercase tracking-wider text-app-text-subtle mb-3">What are you uploading?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {INPUT_MODE_OPTIONS.map((opt) => {
                const isActive = inputMode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setInputMode(opt.value)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? "border-emerald-500/60 bg-emerald-500/10 text-app-text"
                        : "border-app-border bg-app-card text-app-text-muted hover:border-white/20 hover:bg-app-card-hover"
                    }`}
                  >
                    <p className="text-sm font-semibold">{opt.label}</p>
                    <p className="text-xs text-app-text-subtle mt-0.5">{opt.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="border-2 border-dashed border-app-border rounded-2xl p-12 text-center hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept={activeMode.accept}
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
              <Upload className="w-12 h-12 text-app-text-subtle mx-auto mb-4" />
            )}
            <p className="text-lg font-medium text-app-text mb-2">
              {loading ? "Analyzing..." : `Drop your ${activeMode.label} here`}
            </p>
            <p className="text-sm text-app-text-subtle">
              Accepted formats: {activeMode.accept.replace(/\./g, "").toUpperCase().replace(/,/g, ", ")}
            </p>
            <p className="text-xs text-emerald-400/70 mt-2">
              {inputMode === "AUDITED"
                ? "Tip: works best on digitally generated PDFs. Scanned or image-only PDFs will need OCR (coming soon)."
                : inputMode === "GL"
                ? "Tip: export the complete ledger from Zoho / Tally — we'll aggregate it and surface top customers automatically."
                : "Tip: upload the current year first. Once analyzed, you can add a prior year for variance analysis."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-app-canvas" />
            <span className="text-xs text-app-text-subtle">OR</span>
            <div className="flex-1 h-px bg-app-canvas" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMode("manual")}
              className="p-6 rounded-xl border border-app-border bg-app-card hover:bg-app-card-hover hover:border-app-border transition-all text-left"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-400 mb-3" />
              <p className="text-sm font-semibold text-app-text">Enter Manually</p>
              <p className="text-xs text-app-text-subtle mt-1">Type your Trial Balance line by line</p>
            </button>
            <button
              onClick={loadSampleData}
              className="p-6 rounded-xl border border-app-border bg-app-card hover:bg-app-card-hover hover:border-app-border transition-all text-left"
            >
              <Info className="w-8 h-8 text-emerald-500 mb-3" />
              <p className="text-sm font-semibold text-app-text">Load Sample Data</p>
              <p className="text-xs text-app-text-subtle mt-1">Try with a pre-built Indian company TB</p>
            </button>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-app-text">Enter Trial Balance</h2>
            <div className="flex gap-2">
              <button onClick={() => setMode("upload")} className="text-xs text-app-text-subtle hover:text-app-text-subtle px-3 py-1.5">
                Back
              </button>
              <button onClick={addRow} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-400 px-3 py-1.5 border border-emerald-500/20 rounded-lg">
                <Plus className="w-3 h-3" /> Add Row
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-[1fr_140px_140px_40px] gap-2 text-xs text-app-text-subtle font-medium px-1">
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
                  className="bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50"
                />
                <input
                  value={row.debit}
                  onChange={(e) => updateRow(i, "debit", e.target.value)}
                  placeholder="0"
                  type="number"
                  className="bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-sm text-app-text text-right placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50"
                />
                <input
                  value={row.credit}
                  onChange={(e) => updateRow(i, "credit", e.target.value)}
                  placeholder="0"
                  type="number"
                  className="bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-sm text-app-text text-right placeholder:text-app-text-subtle outline-none focus:border-emerald-500/50"
                />
                <button onClick={() => removeRow(i)} className="flex items-center justify-center text-app-text-subtle hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="grid grid-cols-[1fr_140px_140px_40px] gap-2 border-t border-app-border pt-3 px-1">
            <span className="text-sm font-semibold text-app-text">Total</span>
            <span className="text-sm font-semibold text-app-text text-right">
              {fmt(rows.reduce((s, r) => s + (parseFloat(r.debit) || 0), 0))}
            </span>
            <span className="text-sm font-semibold text-app-text text-right">
              {fmt(rows.reduce((s, r) => s + (parseFloat(r.credit) || 0), 0))}
            </span>
            <span />
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-app-text font-semibold py-3 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze Trial Balance"}
          </button>
        </div>
      )}
    </div>
  );
}
