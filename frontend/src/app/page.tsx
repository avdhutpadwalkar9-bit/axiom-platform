"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  Target,
  Layers,
  GitBranch,
  LineChart,
  Shield,
  Zap,
  MessageSquare,
  Send,
  Play,
  Star,
  Quote,
  Settings,
  Plug,
  CalendarCheck,
  Brain,
  Lightbulb,
  LayoutGrid,
  FileText,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in                                          */
/* ------------------------------------------------------------------ */
function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const t: Record<string, string> = {
    up: "translateY(32px)",
    left: "translateX(32px)",
    right: "translateX(-32px)",
    none: "",
  };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : t[direction],
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard mockup data                                             */
/* ------------------------------------------------------------------ */
const sidebarItems = [
  { icon: "📊", label: "Overview", active: false },
  { icon: "📈", label: "Exec Dashboard", active: true },
  { icon: "📋", label: "Q4 Plan", active: false },
  { icon: "🔀", label: "Scenarios", active: false },
  { icon: "👥", label: "People", active: false },
  { icon: "💰", label: "Revenue", active: false },
];

/* ------------------------------------------------------------------ */
/*  Feature showcase data                                             */
/* ------------------------------------------------------------------ */
const showcaseFeatures = [
  {
    tag: "Reviewing Brain",
    title: "Hunt margin leaks automatically",
    desc: "Our AI reads every voucher, isolates one-time expenses, and surfaces add-back opportunities the way a Big-4 due diligence team would\u2014every single month.",
    cta: "See a sample QoE report",
    ctaHref: "/contact",
  },
  {
    tag: null,
    title: "Audit-ready Ind AS models in minutes",
    desc: "Connect Tally or Zoho once. Get a fully normalised P&L, balance sheet, and cash-flow statement aligned to Ind AS 12, 15, 16, 19, 24, 37, 115\u2014without a CA in the loop.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Pressure-test every business decision",
    desc: "Model the new plant, the dealer credit tightening, the e-commerce pivot. See the impact on cash, EBITDA, and working capital before you commit a single rupee.",
    cta: null,
    ctaHref: null,
  },
  {
    tag: null,
    title: "Get growth SOPs, not just dashboards",
    desc: "Each month, the Reviewing Brain ships a board-ready strategy memo: which dealer to drop, which SKU to push, which expense to renegotiate. Actionable. Ranked. CA-reviewed.",
    cta: null,
    ctaHref: null,
  },
];

/* ------------------------------------------------------------------ */
/*  Cross-functional tabs                                             */
/* ------------------------------------------------------------------ */
const crossFuncTabs = [
  {
    icon: DollarSign,
    title: "Sales pipeline & receivables",
    desc: "Track dealer orders, GST-inclusive billing, and receivables aging tied to revenue and working capital.",
    pills: ["Dealer orders", "GST cycle", "Receivables aging", "Closed/Won"],
  },
  {
    icon: Target,
    title: "Marketing spend & ROI",
    desc: "Track spend by channel, align on ROAS, and adjust plans as performance evolves\u2014synced to your books.",
    pills: ["Budget vs. Actuals", "CAC", "ROAS by channel"],
  },
  {
    icon: Users,
    title: "Headcount & promoter comp",
    desc: "Plan roles, salaries, and promoter compensation with auto-flagged add-backs for due diligence readiness.",
    pills: ["Team headcount", "Promoter comp", "Add-back flags", "Variance"],
  },
];

/* ------------------------------------------------------------------ */
/*  Reviews data                                                      */
/* ------------------------------------------------------------------ */
const reviews = [
  {
    quote: "Found ₹17 L of margin leakage in our first month. Paid for itself 14x over.",
    source: "Founder, ₹38 Cr auto-component manufacturer",
    positive: true,
  },
  {
    quote: "We had three CAs reviewing our books quarterly. CortexCFO replaced two of them and made the third 3x sharper.",
    source: "CFO, Pune-based SaaS firm",
    positive: true,
  },
  {
    quote: "Lender asked for an Adjusted EBITDA schedule on a Friday. We sent it Monday morning. The QoE engine had already built it.",
    source: "Promoter, FMCG distribution",
    positive: true,
  },
  {
    quote: "Tally connection was actually 5 minutes. I was waiting for the catch.",
    source: "Director, electrical contractor",
    positive: true,
  },
  {
    quote: "The strategic add-back schedule is what saved us in our PE diligence. Worth ₹2 Cr in valuation alone.",
    source: "Founder, healthcare services chain",
    positive: true,
  },
  {
    quote: "Our working capital cycle dropped from 78 days to 54. The receivables alerts are ruthless.",
    source: "MD, building materials trading",
    positive: true,
  },
  {
    quote: "Took us a few weeks to trust the AI's add-back recommendations. Now we run them past our CA as a sanity check, not the other way around.",
    source: "Founder, D2C food brand",
    positive: false,
  },
  {
    quote: "The monthly growth SOP is the most useful thing my inbox receives. Better than my old retainer CA's quarterly deck.",
    source: "Promoter, textile mill",
    positive: true,
  },
  {
    quote: "Honest gripe: the dashboard sometimes feels too dense for non-finance people. They're working on it.",
    source: "Co-founder, logistics startup",
    positive: false,
  },
  {
    quote: "Support team responds in Hindi-Marathi-English on WhatsApp. That alone is worth more than any other software we use.",
    source: "Founder, 2nd-gen pharma manufacturer",
    positive: true,
  },
  {
    quote: "Initial setup needed help mapping our Tally cost centres correctly. Once done, it just works.",
    source: "CFO, ed-tech firm",
    positive: false,
  },
  {
    quote: "Replaced ₹5.5 Lakh/year of advisory spend. The board sees better numbers, faster.",
    source: "Director, specialty chemicals",
    positive: true,
  },
];

/* ------------------------------------------------------------------ */
/*  FP&A Essentials — per-tab mockups                                 */
/* ------------------------------------------------------------------ */
function EssentialMockup({ index }: { index: number }) {
  // Each mockup is a lightweight preview of what that feature produces
  // in the real product. Same emerald / slate palette as the app.
  switch (index) {
    case 0: // Continuous QoE engine — EBITDA bridge + add-backs
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span className="font-medium uppercase tracking-wider">EBITDA bridge</span>
            <span className="text-emerald-400 font-semibold">+₹48.2L adjusted</span>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {[
              { label: "Reported", v: 60, color: "bg-slate-500/70" },
              { label: "Related-party", v: 72, color: "bg-emerald-500/80" },
              { label: "One-time", v: 80, color: "bg-emerald-500/80" },
              { label: "Revenue cut-off", v: 86, color: "bg-emerald-500/80" },
              { label: "Adjusted", v: 92, color: "bg-emerald-400" },
            ].map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full ${b.color} rounded-t-sm`} style={{ height: `${b.v}%` }} />
                <span className="text-[9px] text-white/40 leading-tight text-center">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {[
              { label: "Promoter car lease", amt: "₹6.8L", tag: "Approved" },
              { label: "Plant relocation (FY25)", amt: "₹14.4L", tag: "Approved" },
              { label: "Deferred revenue cut-off", amt: "₹22.1L", tag: "Flagged" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between text-[11px]">
                <span className="text-white/55">{r.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white tabular-nums">{r.amt}</span>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      r.tag === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {r.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 1: // Audit-ready Ind AS books
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-wider font-medium">
            <span>P&amp;L · year ended 31 Mar 2026</span>
            <span className="ml-auto text-emerald-400 normal-case tracking-normal text-[10px] font-normal">
              ✓ Ind AS compliant
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            {[
              { label: "Revenue from operations", amt: "12.84 Cr", tag: "Ind AS 115" },
              { label: "Cost of materials consumed", amt: "(7.12 Cr)", tag: "Ind AS 2" },
              { label: "Employee benefits expense", amt: "(1.94 Cr)", tag: "Ind AS 19" },
              { label: "Finance costs", amt: "(32.4 L)", tag: "Ind AS 23" },
              { label: "Depreciation & amortisation", amt: "(48.6 L)", tag: "Ind AS 16" },
              { label: "Other expenses", amt: "(39.0 L)", tag: "" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-white/55">{r.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white tabular-nums">₹{r.amt}</span>
                  {r.tag && (
                    <span className="text-[9px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {r.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1.5 border-t border-white/10 font-semibold">
              <span className="text-white">Profit before tax</span>
              <span className="text-emerald-400 tabular-nums">₹2.58 Cr</span>
            </div>
          </div>
        </div>
      );
    case 2: // Strategic scenario planning
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider">
            <span>Scenario comparison</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">3 models</span>
          </div>
          {[
            { name: "Base case", ebitda: "₹2.58 Cr", cash: "₹88L", tone: "slate" },
            { name: "New plant (Kolhapur)", ebitda: "₹3.24 Cr", cash: "-₹1.2 Cr", tone: "amber" },
            { name: "Drop bottom-20 dealers", ebitda: "₹2.94 Cr", cash: "₹1.4 Cr", tone: "emerald" },
          ].map((s) => (
            <div key={s.name} className="bg-white/3 rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] text-white font-medium">{s.name}</span>
                <span
                  className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    s.tone === "emerald"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : s.tone === "amber"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-white/5 text-white/50"
                  }`}
                >
                  {s.tone === "emerald" ? "Recommended" : s.tone === "amber" ? "Cash-negative" : "Baseline"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="text-white/40">
                  EBITDA <span className="text-white tabular-nums ml-1">{s.ebitda}</span>
                </span>
                <span className="text-white/40">
                  Cash <span className="text-white tabular-nums ml-1">{s.cash}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    case 3: // Common-size & ratio benchmarking
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider">
            <span>You vs. peers · auto-component</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">MSME ₹10–50 Cr</span>
          </div>
          {[
            { label: "Gross margin", you: 32, peer: 28, unit: "%" },
            { label: "EBITDA margin", you: 18, peer: 14, unit: "%" },
            { label: "Working capital days", you: 86, peer: 62, unit: "d", inverse: true },
            { label: "Interest coverage", you: 4.2, peer: 5.8, unit: "x", inverse: true },
          ].map((r) => {
            const winning = r.inverse ? r.you < r.peer : r.you > r.peer;
            return (
              <div key={r.label} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/55">{r.label}</span>
                  <div className="flex items-center gap-3 tabular-nums">
                    <span className={winning ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                      {r.you}{r.unit}
                    </span>
                    <span className="text-white/30">
                      {r.peer}{r.unit}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${winning ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${Math.min(100, (r.you / Math.max(r.you, r.peer)) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    case 4: // Working capital intelligence
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "DSO", value: "54d", delta: "+6d" },
              { label: "DPO", value: "42d", delta: "-3d" },
              { label: "DIO", value: "74d", delta: "+12d" },
            ].map((k) => (
              <div key={k.label} className="bg-white/3 border border-white/5 rounded-lg p-2.5">
                <p className="text-[9px] text-white/40 uppercase tracking-wider">{k.label}</p>
                <p className="text-[18px] font-bold text-white tabular-nums">{k.value}</p>
                <p className="text-[10px] text-amber-400 tabular-nums">{k.delta}</p>
              </div>
            ))}
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <p className="text-[11px] text-amber-300 font-medium mb-0.5">₹42L trapped in working capital</p>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Receivables from top-3 dealers aged &gt;90 days. Recommended action: tighten credit terms or factor.
            </p>
          </div>
        </div>
      );
    case 5: // Cash-flow forecasting
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-white/40 font-medium uppercase tracking-wider">13-week cash forecast</span>
            <span className="text-amber-400 text-[10px] normal-case tracking-normal">Shortfall W-9</span>
          </div>
          <div className="flex items-end gap-1 h-24">
            {[78, 82, 76, 88, 84, 72, 68, 64, 48, 58, 66, 72, 80].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm ${i === 8 ? "bg-amber-500" : "bg-emerald-500/70"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>W-1</span>
            <span>W-7</span>
            <span>W-13</span>
          </div>
        </div>
      );
    case 6: // Variance analysis
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider mb-1">
            <span>Top variances · vs. budget</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">5 flagged</span>
          </div>
          {[
            { name: "SKU-042 margin erosion", delta: "-8.4%", neg: true },
            { name: "Power &amp; fuel over-billing", delta: "+₹2.1L", neg: true },
            { name: "Freight vs. budget", delta: "+12%", neg: true },
            { name: "Dealer incentive (South)", delta: "+₹3.8L", neg: true },
            { name: "Raw material price (HDPE)", delta: "-4.2%", neg: false },
          ].map((v) => (
            <div key={v.name} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
              <span className="text-white/60" dangerouslySetInnerHTML={{ __html: v.name }} />
              <span className={`tabular-nums font-semibold ${v.neg ? "text-rose-400" : "text-emerald-400"}`}>
                {v.delta}
              </span>
            </div>
          ))}
        </div>
      );
    case 7: // Monthly close in one click
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider">
            <span>Close checklist · Mar 2026</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">8 / 8 complete</span>
          </div>
          {[
            "Bank reconciliation (ICICI, HDFC)",
            "Vendor invoice matching",
            "GSTR-2B credit reconciliation",
            "TDS certificate matching",
            "Intercompany eliminations",
            "Accruals &amp; prepayments roll-forward",
            "Inventory valuation (moving-avg)",
            "Management pack ready",
          ].map((task) => (
            <div key={task} className="flex items-center gap-2 text-[11px]">
              <div className="w-4 h-4 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span className="text-white/60" dangerouslySetInnerHTML={{ __html: task }} />
            </div>
          ))}
        </div>
      );
    case 8: // Growth SOPs, not dashboards
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider">
            <span>Strategy memo · April 2026</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">3 actions</span>
          </div>
          {[
            { rank: 1, action: "Drop dealers D17, D24, D31", impact: "+₹18L EBITDA", horizon: "60 days" },
            { rank: 2, action: "Push SKU-021 in North region", impact: "+₹11L gross margin", horizon: "90 days" },
            { rank: 3, action: "Renegotiate power contract", impact: "+₹6L/quarter", horizon: "45 days" },
          ].map((m) => (
            <div key={m.rank} className="bg-white/3 border border-white/5 rounded-lg p-3 flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-emerald-400">
                {m.rank}
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-white font-medium leading-tight">{m.action}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px]">
                  <span className="text-emerald-400 tabular-nums font-semibold">{m.impact}</span>
                  <span className="text-white/40">{m.horizon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    case 9: // Native Tally + Zoho integrations
      return (
        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-white/40 font-medium uppercase tracking-wider">
            <span>Connected feeds</span>
            <span className="text-emerald-400 normal-case tracking-normal text-[10px]">6 live</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "Tally Prime", status: "live" },
              { name: "Zoho Books", status: "live" },
              { name: "ICICI Bank", status: "live" },
              { name: "HDFC Bank", status: "live" },
              { name: "GSTN", status: "live" },
              { name: "Razorpay", status: "live" },
            ].map((i) => (
              <div key={i.name} className="bg-white/3 border border-white/5 rounded-lg p-2.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/70 truncate">{i.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed pt-1">
            Two-way OAuth sync. No CSV exports, no IT ticket, no break-glass.
          </p>
        </div>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  FP&A Essentials Tab Data                                          */
/* ------------------------------------------------------------------ */
const essentialsTabs = [
  {
    icon: Brain,
    title: "Continuous QoE engine",
    desc: "Every voucher, every month: hunt for margin leaks, isolate one-time expenses, and ship a defensible add-back schedule\u2014the way a Big-4 due diligence team would.",
    active: true,
    isNew: true,
  },
  {
    icon: FileText,
    title: "Audit-ready Ind AS books",
    desc: "Auto-normalised P&L, balance sheet, and cash-flow statement aligned to Ind AS 12, 15, 16, 19, 24, 37, 115. Ready for your CA, lender, or investor on day one.",
    active: false,
  },
  {
    icon: GitBranch,
    title: "Strategic scenario planning",
    desc: "Model the new plant, the dealer credit tightening, the e-commerce pivot. See impact on cash, EBITDA, and working capital before you commit.",
    active: false,
  },
  {
    icon: BarChart3,
    title: "Common-size & ratio benchmarking",
    desc: "Auto-compare your margins, working capital cycle, and capital efficiency against industry peers in your sector. Spot exactly where you bleed.",
    active: false,
  },
  {
    icon: DollarSign,
    title: "Working capital intelligence",
    desc: "Receivables aging, payables stretching, inventory turns, GST credit cycle\u2014all watched continuously, with action-ready alerts.",
    active: false,
  },
  {
    icon: LineChart,
    title: "Cash-flow forecasting",
    desc: "13-week rolling cash forecast tied to actual books. Flags shortfalls 8 weeks ahead so you negotiate with bankers, not beg.",
    active: false,
  },
  {
    icon: Search,
    title: "Variance analysis",
    desc: "Auto-flag vendor over-billings, SKU margin erosion, and budget vs actual gaps\u2014with the underlying voucher one click away.",
    active: false,
  },
  {
    icon: CalendarCheck,
    title: "Monthly close in one click",
    desc: "Bank reconciliation, vendor matching, GST validation, and management report\u2014done overnight, ready for your morning standup.",
    active: false,
  },
  {
    icon: Sparkles,
    title: "Growth SOPs, not dashboards",
    desc: "Each month, a board-ready strategy memo: which dealer to drop, which SKU to push, which expense to renegotiate. Ranked. Defendable. Done.",
    active: false,
  },
  {
    icon: Plug,
    title: "Native Tally + Zoho integrations",
    desc: "Two-way OAuth sync with Tally, Zoho Books, ICICI/HDFC bank feeds, GSTN, and Razorpay. No CSV exports, no IT ticket, no break-glass.",
    active: false,
  },
];

/* ================================================================== */
export default function LandingPage() {
  const [heroMounted, setHeroMounted] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [activeCrossFunc, setActiveCrossFunc] = useState(0);
  const [activeEssential, setActiveEssential] = useState(0);
  const reviewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeroMounted(true);
  }, []);

  // Auto-rotate showcase
  useEffect(() => {
    const timer = setInterval(
      () => setActiveShowcase((p) => (p + 1) % showcaseFeatures.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  HERO SECTION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="pt-24 md:pt-28 pb-4 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div
            className={`transition-all duration-1000 ${
              heroMounted
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: text content */}
              <div className="pt-4">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full mb-6">
                  <Sparkles className="w-3 h-3" />
                  For MSMEs preparing for PE, M&amp;A, or growth capital
                </div>

                <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-serif-heading font-bold leading-[1.05] tracking-tight text-white mb-6">
                  The continuous
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Quality of Earnings</span>
                  <br />
                  engine.
                </h1>

                <p className="text-[18px] text-white/55 leading-relaxed max-w-lg mb-8">
                  What Big-4 charges you &#8377;6&ndash;15 Lakh for, every time you raise capital. We ship it every month, for &#8377;25K. Powered by Claude, reviewed by a qualified CA.
                </p>

                <div className="flex flex-wrap gap-3 mb-6">
                  <Link href="/signup" className="btn-accent">
                    Start your 14-day trial
                  </Link>
                  <Link href="/contact" className="inline-flex items-center gap-2 text-white/70 hover:text-white px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium transition-all">
                    Book a QoE walkthrough
                  </Link>
                </div>

                <p className="text-[13px] text-white/35 mb-8 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  No card required &middot; Tally &amp; Zoho sync in 5 minutes &middot; Every report CA-signed
                </p>

                {/* Quote */}
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-[15px] text-white/55 italic leading-relaxed">
                      &ldquo;The strategic add-back schedule is what saved us in PE diligence. Worth &#8377;2 Cr in valuation alone.&rdquo;
                    </p>
                    <a
                      href="#reviews"
                      className="inline-flex items-center gap-1 text-[13px] text-emerald-400 font-medium mt-2 hover:underline"
                    >
                      &mdash; Founder, healthcare services chain
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right: Dashboard mockup */}
              <div
                className={`transition-all duration-1000 delay-300 ${
                  heroMounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                }`}
              >
                <div className="product-card">
                  {/* Breadcrumb bar */}
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2.5 flex items-center gap-2 text-[12px] text-white/40">
                    <span>🏠 Overview</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60 font-medium">
                      Adjusted EBITDA &mdash; Q3 FY26
                    </span>
                  </div>

                  <div className="p-5 bg-[#111]">
                    {/* Top Line Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[16px] font-semibold text-white">
                        Reviewing Brain &mdash; QoE Snapshot
                      </h3>
                      <button className="text-[11px] text-white/30 bg-white/5 px-2 py-1 rounded">
                        ₹ / %
                      </button>
                    </div>

                    {/* Data table */}
                    <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden mb-4">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-white/5">
                            <th className="text-left py-2.5 px-3 font-medium text-white/40">
                              Driver
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              ✱ Reported
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              ✱ Adjusted
                            </th>
                            <th className="text-right py-2.5 px-3 font-medium text-white/40">
                              Add-back
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Revenue (TTM)
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹4.2 Cr
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹4.2 Cr
                            </td>
                            <td className="py-2.5 px-3 text-right text-white/30 tabular-nums">
                              &mdash;
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">EBITDA</td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹62 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹81 L
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-500 tabular-nums font-medium">
                              +₹19 L
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              One-time legal
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹8 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              &mdash;
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-500">
                              +₹8 L
                            </td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="py-2.5 px-3 text-white/60">
                              Promoter salary excess
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹14 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              ₹3 L
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-500">
                              +₹11 L
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-white/60">
                              Working capital cycle
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              68 days
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums">
                              52 days
                            </td>
                            <td className="py-2.5 px-3 text-right text-emerald-500 tabular-nums">
                              -16d
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="px-3 py-2 text-[11px] text-white/25 border-t border-white/5">
                        + Add driver
                      </div>
                    </div>

                    {/* AI Chat popup */}
                    <div className="bg-[#111] rounded-xl border border-white/8 p-4 shadow-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] text-white/60 leading-relaxed">
                            Detected ₹19 L of <strong>add-back opportunities</strong> in
                            this quarter&apos;s ledger&mdash;Adjusted EBITDA jumps from
                            14.8% to 19.3% margin.
                          </p>
                        </div>
                      </div>
                      <div className="ml-10">
                        <div className="inline-block bg-white/5 rounded-xl px-3 py-2 text-[12px] text-white/50 mb-3">
                          Show me the strategic add-backs for due diligence
                        </div>
                      </div>
                      <div className="ml-10 flex items-center gap-2 text-[11px] text-white/30">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Thinking</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
                        <input
                          type="text"
                          placeholder="Ask anything"
                          className="flex-1 text-[12px] text-white/40 bg-transparent outline-none placeholder:text-white/25"
                          readOnly
                        />
                        <div className="flex items-center gap-1.5">
                          <button className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                            <Settings className="w-3 h-3 text-white/30" />
                          </button>
                          <button className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                            <ArrowRight className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  TRUST SIGNALS STRIP                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 px-6 border-y border-white/5 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-center text-[11px] font-semibold text-white/35 uppercase tracking-[0.2em] mb-6">
            Built on trust. Backed by standards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              { label: "Every report CA-signed", icon: FileText },
              { label: "SOC 2 Type II in progress", icon: Shield },
              { label: "India data residency", icon: Lock },
              { label: "AES-256 + TLS 1.3", icon: Shield },
              { label: "Certified Tally partner", icon: Plug },
              { label: "Powered by Claude", icon: Sparkles },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-2 text-[12px] text-white/45 font-medium"
                >
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  {badge.label}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  3-STEP: CONNECT -> ANALYSE -> EXPORT                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1100px] mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-[12px] font-semibold text-emerald-400 uppercase tracking-[0.2em] mb-3">
              How it works
            </p>
            <h2 className="text-[30px] md:text-[38px] font-serif-heading font-bold text-white leading-[1.15]">
              From Tally to investor-ready,
              <br />
              with a CA sign-off.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 relative">
            {/* Dotted connector on md+ */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px border-t border-dashed border-white/10 z-0" />
            {[
              {
                step: "01",
                tag: "Connect",
                title: "Plug in Tally or Zoho",
                desc: "Secure OAuth. Auto-sync 3 years of vouchers, ledgers, and bank statements. No CSV, no IT ticket.",
                time: "5 min",
                icon: Plug,
              },
              {
                step: "02",
                tag: "Analyse",
                title: "AI drafts, CA reviews",
                desc: "Our Claude-powered agent classifies entries and builds the Adjusted EBITDA schedule. A qualified Indian CA reviews and signs off before you see it.",
                time: "24&ndash;48 hrs",
                icon: Brain,
              },
              {
                step: "03",
                tag: "Export",
                title: "Ship the CA-signed report",
                desc: "Board-ready P&amp;L, balance sheet, QoE, and add-back schedule. Every output carries the reviewing CA's name, stamp, and membership number.",
                time: "Instant",
                icon: FileText,
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={s.step} delay={i * 120}>
                  <div className="relative bg-[#111] border border-white/8 rounded-2xl p-6 hover:border-emerald-500/30 transition-all h-full z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-bold text-white/30 tabular-nums">
                        {s.step}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.15em] mb-2">
                      {s.tag}
                    </p>
                    <h3 className="text-[17px] font-semibold text-white mb-2">
                      {s.title}
                    </h3>
                    <p className="text-[13px] text-white/50 leading-relaxed mb-4">
                      {s.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <CalendarCheck className="w-3 h-3" />
                      {s.time}
                    </span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CONTINUOUS QoE ENGINE / REVIEWING BRAIN                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-14 text-center max-w-3xl mx-auto">
            <p className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wider mb-3 inline-flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" />
              The Reviewing Brain
            </p>
            <h2 className="text-[36px] md:text-[48px] font-serif-heading font-bold leading-[1.1] tracking-tight text-white mb-4">
              A monthly Quality of Earnings report
            </h2>
            <p className="text-[14px] text-white/40 mb-6 italic">
              Quality of Earnings (QoE) = your real operating profit, with one-time
              items stripped out. It&apos;s the number every investor, lender, and
              acquirer asks for.
            </p>
            <p className="text-[17px] text-white/55 leading-relaxed">
              Big-4 firms charge &#8377;6 Lakh to build this once a year. We build it
              <span className="text-white"> every month, automatically</span>,
              so your business stays audit-ready and fundable at all times.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              {
                icon: Search,
                tag: "Hunt",
                title: "Find the leaks",
                desc: "Scans every voucher, ledger entry, and bank statement to flag duplicate payments, idle inventory, vendor over-billings, and SKU-level margin erosion.",
                stat: "Avg ₹14&nbsp;L of leakage surfaced in month one",
              },
              {
                icon: Layers,
                tag: "Isolate",
                title: "Strip the noise",
                desc: "Auto-classifies one-time legal fees, COVID write-downs, promoter perks, and non-recurring CapEx so your true operating EBITDA stops hiding in the noise.",
                stat: "Adjusted EBITDA delta: +3&ndash;8% on average",
              },
              {
                icon: Lightbulb,
                tag: "Defend",
                title: "Build the add-back schedule",
                desc: "Ships a board-ready add-back schedule with footnotes the way a Big-4 QoE report would&mdash;ready for any investor, lender, or acquirer.",
                stat: "Replaces ₹6&nbsp;L+ of one-time advisory work",
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <FadeIn key={card.title} delay={i * 120}>
                  <div className="bg-[#111] rounded-2xl border border-white/8 p-7 h-full hover:border-emerald-500/30 hover:bg-[#131313] transition-all group">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className="text-[18px] font-semibold text-white mb-2">
                      {card.title}
                    </h3>
                    <p className="text-[13.5px] text-white/50 leading-relaxed mb-5">
                      {card.desc}
                    </p>
                    <p
                      className="text-[12px] text-emerald-400/90 font-medium pt-4 border-t border-white/5"
                      dangerouslySetInnerHTML={{ __html: card.stat }}
                    />
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Comparison strip */}
          <FadeIn delay={300}>
            <div className="bg-[#0d0d0d] rounded-2xl border border-white/8 p-8 grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-1">
                <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  The old way
                </p>
                <p className="text-[14px] text-white/50 leading-relaxed">
                  Hire a Big-4 firm for &#8377;6&ndash;15&nbsp;Lakh. Wait 6&ndash;8 weeks.
                  Get a static QoE deck. Repeat next funding round.
                </p>
              </div>
              <div className="md:col-span-1 flex justify-center">
                <ArrowRight className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="md:col-span-1">
                <p className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  CortexCFO
                </p>
                <p className="text-[14px] text-white leading-relaxed">
                  &#8377;25K/month. Continuous QoE engine, CA-signed monthly pack,
                  and a growth SOP delivered every 30 days.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FEATURE SHOWCASE (Sticky-style tabs)                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left: tabs */}
            <div>
              <div className="space-y-2">
                {showcaseFeatures.map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShowcase(i)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                      i === activeShowcase
                        ? "bg-white/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`text-[18px] font-semibold transition-colors ${
                          i === activeShowcase
                            ? "text-white"
                            : "text-white/30"
                        }`}
                      >
                        {feature.title}
                      </h3>
                      {feature.tag && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                          {feature.tag}
                        </span>
                      )}
                    </div>
                    {i === activeShowcase && (
                      <div className="animate-slide-up">
                        <p className="text-[14px] text-white/50 leading-relaxed mt-2">
                          {feature.desc}
                        </p>
                        {feature.cta && (
                          <Link
                            href={feature.ctaHref || "/contact"}
                            className="inline-flex items-center gap-1 text-[13px] text-emerald-400 font-medium mt-3 hover:underline"
                          >
                            {feature.cta}
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: product mockup */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="product-card">
                  <div className="bg-[#111] p-6">
                    {activeShowcase === 0 && (
                      <div className="animate-scale-in">
                        {/* AI analysis mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4 mb-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-violet-500" />
                            <span className="text-[13px] font-semibold">
                              AI Analyst
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="bg-white/5 rounded-lg p-3 text-[12px] text-white/60">
                              Revenue dipped 12% MoM&mdash;3 dealer orders slipped to next
                              quarter. GST input credit cycle is healthy at 28 days.
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-[12px] text-white/60">
                              Action: Tighten credit terms with North-zone distributors;
                              receivables aging &gt; 90 days is up ₹14 L.
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Revenue", value: "₹4.2 Cr", change: "-12%" },
                            { label: "GP Margin", value: "32%", change: "+1.4%" },
                            { label: "Adj EBITDA", value: "19.3%", change: "+4.5%" },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="bg-[#111] rounded-xl border border-white/8 p-3"
                            >
                              <p className="text-[10px] text-white/35 mb-1">
                                {m.label}
                              </p>
                              <p className="text-[16px] font-semibold tabular-nums">
                                {m.value}
                              </p>
                              <p
                                className={`text-[11px] tabular-nums ${
                                  m.change.startsWith("-")
                                    ? "text-red-500"
                                    : "text-emerald-600"
                                }`}
                              >
                                {m.change}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeShowcase === 1 && (
                      <div className="animate-scale-in">
                        {/* Data modeling mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 overflow-hidden">
                          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[13px] font-semibold">
                              Revenue Model
                            </span>
                            <span className="text-[11px] text-white/30">
                              3 dimensions
                            </span>
                          </div>
                          <div className="p-4 space-y-2">
                            {[
                              { name: "Monthly Revenue", formula: "= Volume × Realisation", value: "₹35 L" },
                              { name: "Active Dealers", formula: "= New + Existing - Churned", value: "126" },
                              { name: "Avg Order Value", formula: "= Revenue / Orders", value: "₹2.8 L" },
                              { name: "Receivable Days", formula: "= AR / (Revenue/Day)", value: "52 days" },
                              { name: "Working Capital", formula: "= AR + Inv - AP", value: "₹1.2 Cr" },
                            ].map((row) => (
                              <div
                                key={row.name}
                                className="flex items-center justify-between py-2 border-b border-white/5"
                              >
                                <div>
                                  <p className="text-[13px] font-medium">
                                    {row.name}
                                  </p>
                                  <p className="text-[11px] text-white/30 font-mono">
                                    {row.formula}
                                  </p>
                                </div>
                                <p className="text-[14px] font-semibold tabular-nums">
                                  {row.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeShowcase === 2 && (
                      <div className="animate-scale-in">
                        {/* Plan testing mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="text-[13px] font-semibold">Plan Comparison</span>
                          </div>
                          <div className="space-y-3">
                            {[
                              { plan: "Conservative", revenue: "₹3.8 Cr", headcount: 28, runway: "28 mo" },
                              { plan: "Base Case", revenue: "₹4.2 Cr", headcount: 32, runway: "22 mo" },
                              { plan: "Aggressive", revenue: "₹5.1 Cr", headcount: 38, runway: "16 mo" },
                            ].map((p) => (
                              <div
                                key={p.plan}
                                className={`rounded-xl p-3 border ${
                                  p.plan === "Base Case"
                                    ? "border-emerald-500/30 bg-emerald-500/5"
                                    : "border-white/8"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[13px] font-medium">{p.plan}</span>
                                  {p.plan === "Base Case" && (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[11px]">
                                  <div>
                                    <p className="text-white/30">Revenue</p>
                                    <p className="font-semibold tabular-nums">{p.revenue}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/30">Headcount</p>
                                    <p className="font-semibold tabular-nums">{p.headcount}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/30">Runway</p>
                                    <p className="font-semibold tabular-nums">{p.runway}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeShowcase === 3 && (
                      <div className="animate-scale-in">
                        {/* Scenarios mockup */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <GitBranch className="w-4 h-4 text-purple-500" />
                            <span className="text-[13px] font-semibold">Scenario Builder</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we delay the &#8377;2 Cr machinery CapEx by 2 quarters?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we tighten dealer credit from 60 to 45 days?</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              <div className="flex-1">
                                <p className="text-[12px] font-medium text-white/80">What if we shift 30% of revenue to e-commerce?</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-white/5 rounded-xl">
                            <p className="text-[11px] text-white/40 mb-2">Impact Preview</p>
                            <div className="grid grid-cols-2 gap-2 text-[12px]">
                              <div className="flex justify-between">
                                <span className="text-white/40">Free cash flow</span>
                                <span className="font-semibold text-emerald-500">+&#8377;42 L/qtr</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Working capital</span>
                                <span className="font-semibold text-emerald-500">-16 days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CROSS-FUNCTIONAL SECTION                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0d0d0d] border-t border-white/5">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-16">
            <h2 className="text-[42px] md:text-[56px] font-serif-heading font-bold leading-[1.1] tracking-tight text-white mb-6">
              One brain across
              <br />
              every function
            </h2>
            <p className="text-[16px] text-white/45 max-w-xl leading-relaxed">
              Sales pipeline, marketing spend, headcount, and inventory&mdash;all
              normalised against your books. The strategy memo your CA never had
              the bandwidth to write.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Cross-func tabs */}
            <FadeIn>
              <div className="space-y-6">
                {crossFuncTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveCrossFunc(i)}
                      className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                        i === activeCrossFunc
                          ? "bg-white/10 shadow-lg"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon
                          className={`w-5 h-5 ${
                            i === activeCrossFunc
                              ? "text-emerald-400"
                              : "text-white/25"
                          }`}
                        />
                        <h3
                          className={`text-[16px] font-semibold ${
                            i === activeCrossFunc
                              ? "text-white"
                              : "text-white/30"
                          }`}
                        >
                          {tab.title}
                        </h3>
                      </div>
                      {i === activeCrossFunc && (
                        <div className="animate-slide-up ml-8">
                          <p className="text-[13px] text-white/45 leading-relaxed mb-3">
                            {tab.desc}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {tab.pills.map((pill) => (
                              <span
                                key={pill}
                                className="text-[11px] font-medium text-white/40 bg-white/5 px-2.5 py-1 rounded-full"
                              >
                                {pill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Right: dashboard mockup */}
            <FadeIn delay={200}>
              <div className="sticky top-24">
                <div className="product-card">
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2.5 flex items-center gap-3 text-[12px]">
                    <span className="text-white/30">🔲 FY26 Base ▾</span>
                  </div>
                  <div className="bg-[#161616] border-b border-white/5 px-4 py-2 flex items-center gap-2 text-[12px] text-white/40">
                    <span>🏠 GTM</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>✱ Cross-functional</span>
                    <span className="text-white/20">|</span>
                    <span>🟢 Tally ⟳</span>
                  </div>
                  <div className="p-5 bg-[#111]">
                    {activeCrossFunc === 0 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Open Orders</p>
                            <p className="text-[20px] font-bold tabular-nums">₹1.8 Cr</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Receivables &gt; 90d</p>
                            <p className="text-[20px] font-bold tabular-nums text-amber-400">₹14 L</p>
                          </div>
                        </div>
                        {/* Mini bar chart */}
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Order pipeline by stage</p>
                          <div className="space-y-2">
                            {[
                              { label: "Quoted", width: "90%", color: "bg-blue-400" },
                              { label: "PO Issued", width: "70%", color: "bg-blue-500" },
                              { label: "Dispatched", width: "45%", color: "bg-blue-600" },
                              { label: "Invoiced", width: "30%", color: "bg-blue-700" },
                              { label: "Collected", width: "20%", color: "bg-emerald-500" },
                            ].map((bar) => (
                              <div key={bar.label} className="flex items-center gap-3">
                                <span className="text-[10px] text-white/35 w-20 text-right">{bar.label}</span>
                                <div className="flex-1 h-4 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${bar.color}`}
                                    style={{ width: bar.width }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeCrossFunc === 1 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Total Spend", value: "₹12.8 L" },
                            { label: "CAC", value: "₹2,800" },
                            { label: "ROAS", value: "4.2x" },
                          ].map((m) => (
                            <div key={m.label} className="bg-[#111] rounded-xl border border-white/8 p-3">
                              <p className="text-[10px] text-white/30 mb-1">{m.label}</p>
                              <p className="text-[18px] font-bold tabular-nums">{m.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Spend by channel</p>
                          <div className="space-y-2">
                            {[
                              { channel: "Google Ads", actual: "₹4.2 L", budget: "₹4.5 L" },
                              { channel: "Meta", actual: "₹3.8 L", budget: "₹3.5 L" },
                              { channel: "LinkedIn", actual: "₹2.8 L", budget: "₹3.0 L" },
                              { channel: "Trade shows", actual: "₹2.0 L", budget: "₹1.8 L" },
                            ].map((c) => (
                              <div key={c.channel} className="flex items-center justify-between py-1.5 border-b border-white/5 text-[12px]">
                                <span className="text-white/50">{c.channel}</span>
                                <div className="flex gap-4">
                                  <span className="tabular-nums">{c.actual}</span>
                                  <span className="text-white/25 tabular-nums">{c.budget}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {activeCrossFunc === 2 && (
                      <div className="animate-scale-in space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Total Headcount</p>
                            <p className="text-[20px] font-bold tabular-nums">32</p>
                          </div>
                          <div className="bg-[#111] rounded-xl border border-white/8 p-3">
                            <p className="text-[10px] text-white/30 mb-1">Promoter add-back</p>
                            <p className="text-[20px] font-bold tabular-nums text-emerald-400">₹11 L</p>
                          </div>
                        </div>
                        <div className="bg-[#111] rounded-xl border border-white/8 p-4">
                          <p className="text-[11px] text-white/30 mb-3">Team breakdown</p>
                          <div className="space-y-2">
                            {[
                              { team: "Production", count: 14, planned: 16 },
                              { team: "Sales", count: 8, planned: 10 },
                              { team: "Procurement", count: 4, planned: 5 },
                              { team: "Operations", count: 4, planned: 4 },
                              { team: "Finance", count: 2, planned: 3 },
                            ].map((t) => (
                              <div key={t.team} className="flex items-center justify-between py-1.5 border-b border-white/5 text-[12px]">
                                <span className="text-white/50">{t.team}</span>
                                <div className="flex items-center gap-2">
                                  <span className="tabular-nums font-medium">{t.count}</span>
                                  <span className="text-white/20">/</span>
                                  <span className="tabular-nums text-white/30">{t.planned}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  CLARITY / ALIGNMENT / BOARD MEETING                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Replace ₹6\u201315 L per QoE",
                desc: "Get the Big-4 diligence rigour every month, not once a year\u2014continuous, CA-signed, at 1/60th the cost.",
              },
              {
                icon: Shield,
                title: "Walk into diligence ready",
                desc: "Ind AS-aligned books, ranked add-backs, and a defensible Adjusted EBITDA schedule\u2014before your next term sheet lands.",
              },
              {
                icon: Star,
                title: "Win your next board meeting",
                desc: "Show up with a CA-signed board pack and a live dashboard. Answer every \u201cwhy\u201d in real time, with the underlying ledger one click away.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 120}>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/5 hover:shadow-lg transition-all duration-300 h-full group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-colors">
                    <item.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-[18px] font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-white/45 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  REVIEWS SECTION                                               */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section id="reviews" className="py-24 px-6 bg-[#0d0d0d] border-t border-white/5 overflow-hidden">
        <div className="max-w-[1200px] mx-auto mb-12">
          <FadeIn>
            <h2 className="text-[32px] md:text-[40px] font-serif-heading font-bold text-white mb-2">
              Honest reviews from Indian MSME founders
            </h2>
            <p className="text-[14px] text-white/40 max-w-xl">
              The good, the constructive, and the things we&apos;re still
              fixing&mdash;straight from the promoters and CFOs running the businesses.
            </p>
          </FadeIn>
        </div>

        {/* Scrolling reviews - Row 1 */}
        <div className="relative mb-4">
          <div className="overflow-hidden">
            <div className="animate-ticker flex gap-5 w-max">
              {[...reviews, ...reviews].map((review, i) => (
                <div
                  key={i}
                  className="w-[360px] flex-shrink-0 bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-1.5 mb-3">
                    <Quote className="w-4 h-4 text-emerald-400" />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        review.positive ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {review.positive ? "Positive" : "Constructive"}
                    </span>
                  </div>
                  <p className="text-[14px] text-white/60 leading-relaxed mb-3">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <p className="text-[11px] text-white/30 font-medium">
                    — {review.source}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 - reverse direction */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="animate-ticker flex gap-5 w-max"
              style={{ animationDirection: "reverse", animationDuration: "35s" }}
            >
              {[...reviews.slice(6), ...reviews.slice(0, 6), ...reviews.slice(6), ...reviews.slice(0, 6)].map(
                (review, i) => (
                  <div
                    key={i}
                    className="w-[360px] flex-shrink-0 bg-[#111] rounded-2xl p-6 border border-white/5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-1.5 mb-3">
                      <Quote className="w-4 h-4 text-emerald-400" />
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider ${
                          review.positive ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {review.positive ? "Positive" : "Constructive"}
                      </span>
                    </div>
                    <p className="text-[14px] text-white/60 leading-relaxed mb-3">
                      &ldquo;{review.quote}&rdquo;
                    </p>
                    <p className="text-[11px] text-white/30 font-medium">
                      — {review.source}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FP&A ESSENTIALS GRID                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-[1200px] mx-auto">
          <FadeIn className="mb-14">
            <h2 className="text-[32px] md:text-[42px] font-serif-heading font-bold text-white">
              Everything your CFO + CA + advisor would do
            </h2>
            <p className="text-[15px] text-white/45 mt-3 max-w-2xl">
              Built for Indian MSMEs scaling past &#8377;5 Cr revenue&mdash;where
              hiring a full-time CFO is too early but spreadsheets and quarterly CA
              reviews are too late.
            </p>
          </FadeIn>

          <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
            {/* Left: tabs list */}
            <FadeIn>
              <div className="space-y-1">
                {essentialsTabs.map((tab, i) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveEssential(i)}
                      className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
                        i === activeEssential
                          ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                          : "border-transparent text-white/35 hover:text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[14px] font-medium">
                        {tab.title}
                      </span>
                      {"isNew" in tab && tab.isNew && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase ml-auto">
                          New
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </FadeIn>

            {/* Right: content area */}
            <FadeIn delay={100}>
              <div className="product-card p-8">
                <div className="animate-scale-in" key={activeEssential}>
                  <div className="flex items-center gap-3 mb-4">
                    {(() => {
                      const Icon = essentialsTabs[activeEssential].icon;
                      return (
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-400" />
                        </div>
                      );
                    })()}
                    <h3 className="text-[20px] font-semibold text-white">
                      {essentialsTabs[activeEssential].title}
                      {"isNew" in essentialsTabs[activeEssential] &&
                        essentialsTabs[activeEssential].isNew && (
                          <span className="ml-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                            New
                          </span>
                        )}
                    </h3>
                  </div>
                  <p className="text-[15px] text-white/50 leading-relaxed mb-6">
                    {essentialsTabs[activeEssential].desc}
                  </p>
                  {/* Live mockup — one per feature tab */}
                  <EssentialMockup index={activeEssential} />
                </div>
              </div>
            </FadeIn>
          </div>

          {/* CTA */}
          <FadeIn delay={200}>
            <div className="text-center mt-12">
              <p className="text-[16px] text-white/45 mb-6">
                Replace the &#8377;6&ndash;15 Lakh Big-4 QoE engagement with a
                &#8377;25K/month continuous review engine&mdash;every report CA-signed,
                every add-back defensible in diligence.
              </p>
              <Link href="/signup" className="btn-accent">
                Start your 14-day trial
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ONBOARDING TIMELINE                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#0d0d0d] border-t border-white/5">
        <div className="max-w-[900px] mx-auto">
          <FadeIn className="text-center mb-16">
            <p className="text-[13px] font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              Near-zero time to value
            </p>
            <h2 className="text-[32px] md:text-[42px] font-serif-heading font-bold text-white">
              From signup to your first Adjusted EBITDA report
              <br />
              <span className="text-emerald-400">in minutes, not weeks</span>
            </h2>
          </FadeIn>

          <div className="space-y-0">
            {[
              {
                step: "01",
                phase: "Connect",
                title: "Plug in Tally or Zoho Books",
                desc: "Secure OAuth connection to your existing books. We auto-pull 3 years of vouchers, ledgers, and bank statements\u2014no CSV exports, no IT ticket.",
                timeline: "5 minutes",
                icon: Plug,
              },
              {
                step: "02",
                phase: "Normalise",
                title: "Reviewing Brain drafts, CA reviews",
                desc: "Our Claude-powered agent classifies vouchers, isolates one-time expenses, and drafts the Ind AS-aligned P&L, balance sheet, and Adjusted EBITDA schedule. A qualified Indian CA then reviews and signs every output before delivery.",
                timeline: "24\u201348 hrs",
                icon: Brain,
              },
              {
                step: "03",
                phase: "Stay ready",
                title: "Receive monthly CA-signed packs",
                desc: "Every month, a board-ready memo lands in your inbox: ranked add-backs, working capital actions, the next strategic move\u2014each pack carrying the reviewing CA's name, stamp, and membership number.",
                timeline: "Ongoing",
                icon: MessageSquare,
              },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 150}>
                <div className="flex gap-8 items-start py-10 relative">
                  {/* Timeline line */}
                  {i < 2 && (
                    <div className="absolute left-[27px] top-[80px] bottom-0 w-[2px] bg-white/8" />
                  )}

                  {/* Step number */}
                  <div className="flex-shrink-0">
                    <div className="w-[56px] h-[56px] rounded-2xl bg-[#111] border border-white/8 flex items-center justify-center shadow-sm relative z-10">
                      <span className="text-[14px] font-bold text-emerald-400">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      {item.phase}
                    </p>
                    <h3 className="text-[20px] font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-white/45 leading-relaxed mb-3">
                      {item.desc}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/30 bg-[#111] border border-white/8 px-3 py-1.5 rounded-full">
                      <CalendarCheck className="w-3 h-3" />
                      {item.timeline}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  ADVISORY DISCLAIMER                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="px-6 py-10 bg-[#0a0a0a] border-t border-white/5">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[12px] text-white/35 leading-relaxed">
              <span className="text-white/55 font-medium">Advisory, not audit.</span>{" "}
              CortexCFO produces investor-grade financial analysis reviewed by a qualified
              Indian Chartered Accountant. Outputs are not a substitute for a statutory
              audit opinion, Big-4 QoE engagement, or independent legal/tax counsel.
              All reports are advisory in nature and carry our standard disclaimer and E&amp;O cover.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  FLOATING CTA                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <Link
        href="/signup"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 hover:bg-emerald-400 active:scale-95 transition-all text-[13px] font-semibold"
      >
        <Plug className="w-4 h-4" />
        Start 14-day trial
      </Link>

      <SiteFooter />
    </div>
  );
}
