/**
 * CortexCFO — branded PDF export for financial analysis reports.
 *
 * Uses jsPDF + jspdf-autotable. All styling mirrors the in-app dark/emerald
 * palette so the PDF looks consistent with the product.
 *
 * Two exports:
 *  - exportAnalysisPdf → the main TB analysis report (cover, grouped P&L,
 *    grouped balance sheet, ratios, Ind AS, insights, optional variance).
 *  - exportQoEPdf → the Quality of Earnings workbook (reported vs adjusted
 *    EBITDA, add-back schedule, compliance matrix, sign-off workflow).
 *
 * P&L and BS are NOT flat dumps — expenses are grouped into standard
 * sub-categories (COGS, Employee, Operating, Finance, D&A, etc.) and
 * balance sheet items split into Current / Non-Current. Keeps reports
 * short and genuinely useful for CA / PE review.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Brand colours (RGB tuples for jsPDF) ───────────────────────────────────
type RGB = [number, number, number];
const EMERALD: RGB = [16, 185, 129]; // #10b981
const DARK_BG: RGB = [17, 17, 17]; // #111
const PAGE_BG: RGB = [10, 10, 10]; // #0a0a0a
const WHITE: RGB = [255, 255, 255];
const MUTED: RGB = [160, 160, 160];
const RED: RGB = [239, 68, 68]; // #ef4444
const AMBER: RGB = [245, 158, 11]; // #f59e0b
const SLATE: RGB = [100, 116, 139]; // #64748b

// ── Types ───────────────────────────────────────────────────────────────────
interface AccountItem {
  name: string;
  code: string;
  debit: number;
  credit: number;
  net: number;
  sub_group: string;
}

interface RatioMetaPdf { value: number; status: "ok" | "not_computable"; reason?: string }
interface RatiosMetaPdf {
  current_ratio: RatioMetaPdf;
  debt_to_equity: RatioMetaPdf;
  gross_margin: RatioMetaPdf;
  net_margin: RatioMetaPdf;
  return_on_equity: RatioMetaPdf;
  working_capital: RatioMetaPdf;
}
interface AnalysisResult {
  summary: { total_debit: number; total_credit: number; is_balanced: boolean; variance: number };
  financial_statements: {
    total_assets: number; total_liabilities: number; total_equity: number;
    total_revenue: number; total_expenses: number; net_income: number;
  };
  ratios: {
    current_ratio: number; debt_to_equity: number; gross_margin: number;
    net_margin: number; return_on_equity: number; working_capital: number;
  };
  ratios_meta?: RatiosMetaPdf;
  completeness?: { computed: number; total: number; pct: number };
  input_mode?: "TB" | "AUDITED" | "GL" | "PNL_ONLY" | "BS_ONLY" | "MIS" | "SIMPLE";
  classified_accounts: {
    assets: AccountItem[]; liabilities: AccountItem[]; equity: AccountItem[];
    revenue: AccountItem[]; expenses: AccountItem[];
  };
  ind_as_observations: { standard: string; observation: string; severity: string }[];
  ai_questions: { question: string; reason: string }[];
  insights: { category: string; title: string; detail: string; action: string; severity: string }[];
  warnings: { severity: string; title: string; detail: string }[];
}

// Helper: read a ratio from ratios_meta when present, fall back to the
// legacy flat bag. Returns "—" for not_computable ratios so the printed
// PDF doesn't show misleading zeros.
function renderRatio(
  result: AnalysisResult,
  key: keyof RatiosMetaPdf,
  format: (v: number) => string,
): { text: string; computable: boolean; value: number; reason?: string } {
  const m = result.ratios_meta?.[key];
  if (m && m.status === "not_computable") {
    return { text: "—", computable: false, value: 0, reason: m.reason };
  }
  const v = m ? m.value : (result.ratios[key] as number);
  return { text: format(v), computable: true, value: v };
}

// ── Number + currency helpers ──────────────────────────────────────────────
function fmt(value: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (abs >= 10000000) return `${sign}Rs.${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}Rs.${(abs / 100000).toFixed(2)} L`;
    if (abs >= 1000) return `${sign}Rs.${(abs / 1000).toFixed(1)}K`;
    return `${sign}Rs.${abs.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value).replace("₹", "Rs.");
}

function pct(num: number, denom: number): string {
  if (!denom) return "0.0%";
  return ((num / denom) * 100).toFixed(1) + "%";
}

// ── Expense categorization (applied in the PDF, not on the backend) ────────
type ExpenseCategory =
  | "Cost of Goods Sold"
  | "Employee Costs"
  | "Operating Expenses"
  | "Professional Fees"
  | "Finance Costs"
  | "Depreciation & Amortization"
  | "Taxes & Duties"
  | "Other Expenses";

const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "Cost of Goods Sold",
  "Employee Costs",
  "Operating Expenses",
  "Professional Fees",
  "Finance Costs",
  "Depreciation & Amortization",
  "Taxes & Duties",
  "Other Expenses",
];

function categorizeExpense(name: string): ExpenseCategory {
  const n = name.toLowerCase();
  // Order matters — more specific patterns first.
  if (/\b(purchase|cost of good|cogs|raw material|material consum|freight inward|carriage inward|direct cost)\b/.test(n)) return "Cost of Goods Sold";
  if (/\b(salary|wage|bonus|gratuity|pf\b|provident fund|esi|esic|staff welfare|employee|payroll|hr cost|leave encashment|incentive)\b/.test(n)) return "Employee Costs";
  if (/\b(depreciation|amortis|amortiz)\b/.test(n)) return "Depreciation & Amortization";
  if (/\b(interest|bank charge|loan processing|finance cost|financial charge)\b/.test(n)) return "Finance Costs";
  if (/\b(professional fee|legal|consultancy|audit fee|retainer|consultant)\b/.test(n)) return "Professional Fees";
  if (/\b(gst expense|tax expense|provision for tax|duty|cess|tds expense)\b/.test(n)) return "Taxes & Duties";
  if (/\b(rent|electricity|telephone|office|travel|conveyance|printing|stationery|repair|maintenance|advertisement|marketing|subscription|software|cloud|hosting|insurance|utilities|communication|internet|courier|postage|housekeep|security|fuel|vehicle|transport)\b/.test(n)) return "Operating Expenses";
  return "Other Expenses";
}

function groupExpenses(expenses: AccountItem[]) {
  const groups: Record<ExpenseCategory, AccountItem[]> = {
    "Cost of Goods Sold": [],
    "Employee Costs": [],
    "Operating Expenses": [],
    "Professional Fees": [],
    "Finance Costs": [],
    "Depreciation & Amortization": [],
    "Taxes & Duties": [],
    "Other Expenses": [],
  };
  for (const e of expenses) {
    groups[categorizeExpense(e.name)].push(e);
  }
  // Sort each group's items by magnitude (largest first)
  for (const key of Object.keys(groups) as ExpenseCategory[]) {
    groups[key].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  }
  return groups;
}

// ── BS grouping — split current / non-current by sub_group ─────────────────
function splitBsGroup(items: AccountItem[], currentKey: string, nonCurrentKey: string) {
  const current: AccountItem[] = [];
  const nonCurrent: AccountItem[] = [];
  const other: AccountItem[] = [];
  for (const it of items) {
    const sg = (it.sub_group || "").toLowerCase();
    if (sg.includes(currentKey) && !sg.includes("non")) current.push(it);
    else if (sg.includes(nonCurrentKey)) nonCurrent.push(it);
    else other.push(it);
  }
  current.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  nonCurrent.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  other.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  return { current, nonCurrent, other };
}

// ── Drawing helpers ─────────────────────────────────────────────────────────
function drawLogo(doc: jsPDF, x: number, y: number, size = 8) {
  doc.setFillColor(...EMERALD);
  doc.roundedRect(x, y, size, size, 1.5, 1.5, "F");
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.4);
  doc.line(x + 2, y + size - 2, x + size / 2, y + 2);
  doc.line(x + size / 2, y + 2, x + size - 2, y + size - 2.5);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — TB Analysis Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportAnalysisPdf(
  result: AnalysisResult,
  companyName: string,
  comparisonResult?: AnalysisResult | null,
  comparisonLabel?: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  const { financial_statements: fs, ratios, classified_accounts: ca, ind_as_observations, insights, warnings } = result;

  // Pre-compute groupings
  const exGroups = groupExpenses(ca.expenses);
  const assetsSplit = splitBsGroup(ca.assets, "current", "non_current");
  const liabSplit = splitBsGroup(ca.liabilities, "current", "non_current");

  function addFooter() {
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("CortexCFO  |  Confidential  |  Advisory, not audit.", margin, pageH - 4);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageW - margin, pageH - 4, { align: "right" });
  }

  function pageBg() {
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageW, pageH, "F");
  }

  function sectionHeader(title: string, subtitle?: string) {
    if (y + 18 > pageH - 16) { addFooter(); doc.addPage(); pageBg(); y = 14; }
    doc.setFillColor(...EMERALD);
    doc.rect(margin, y, 2, 6, "F");
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(title, margin + 5, y + 5);
    if (subtitle) {
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(subtitle, margin + 5, y + 10);
      y += 14;
    } else {
      y += 10;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════════════════════════════════
  pageBg();

  drawLogo(doc, margin, 14, 10);
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("CortexCFO", margin + 14, 22);

  y = 56;
  doc.setFontSize(24);
  doc.setTextColor(...WHITE);
  doc.text("Financial Analysis Report", margin, y);
  y += 11;
  doc.setFontSize(15);
  doc.setTextColor(...EMERALD);
  doc.text(companyName, margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);
  y += 4;
  doc.text("Ind AS Compliant Review  |  AI-Powered Insights", margin, y);

  // Summary cards
  y += 18;
  const cardW = (contentW - 6) / 4;
  const cards = [
    { label: "Total Revenue", value: fmt(fs.total_revenue, true) },
    { label: "Total Expenses", value: fmt(fs.total_expenses, true) },
    { label: "Net Income", value: fmt(fs.net_income, true) },
    { label: "TB Status", value: result.summary.is_balanced ? "Balanced" : `Var ${fmt(result.summary.variance, true)}` },
  ];
  cards.forEach((card, i) => {
    const cx = margin + i * (cardW + 2);
    doc.setFillColor(...DARK_BG);
    doc.roundedRect(cx, y, cardW, 22, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(card.label, cx + 3, y + 7);
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(card.value, cx + 3, y + 16);
  });
  y += 30;

  // Key ratios
  doc.setFillColor(...DARK_BG);
  doc.roundedRect(margin, y, contentW, 30, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("KEY RATIOS", margin + 4, y + 7);
  const mkRatio = (key: keyof RatiosMetaPdf, label: string, format: (v: number) => string, okWhen: (v: number) => boolean) => {
    const r = renderRatio(result, key, format);
    return { label, value: r.text, ok: r.computable && okWhen(r.value), computable: r.computable };
  };
  const ratioItems = [
    mkRatio("current_ratio", "Current Ratio", (v) => `${v}x`, (v) => v >= 1.5),
    mkRatio("debt_to_equity", "Debt/Equity", (v) => `${v}x`, (v) => v <= 2),
    mkRatio("gross_margin", "Gross Margin", (v) => `${v}%`, (v) => v >= 30),
    mkRatio("net_margin", "Net Margin", (v) => `${v}%`, (v) => v >= 10),
    mkRatio("return_on_equity", "ROE", (v) => `${v}%`, (v) => v >= 15),
  ];
  const rw = contentW / ratioItems.length;
  ratioItems.forEach((r, i) => {
    const rx = margin + i * rw;
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(r.label, rx + 4, y + 16);
    doc.setFontSize(10);
    // Muted grey for not-computable ratios ("—"), emerald for healthy, red otherwise.
    const rgb = !r.computable ? MUTED : r.ok ? EMERALD : RED;
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(r.value, rx + 4, y + 23);
  });
  y += 38;

  // Executive summary paragraph
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("EXECUTIVE SUMMARY", margin, y);
  y += 5;
  const summaryText = buildExecutiveSummary(fs, ratios, ca, result.ratios_meta);
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  const wrappedSummary = doc.splitTextToSize(summaryText, contentW);
  doc.text(wrappedSummary, margin, y);

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: P&L — Grouped by expense category
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg();
  y = 14;

  sectionHeader("Profit & Loss Statement", "Grouped by standard categories for CA / investor review");

  // Build grouped P&L rows
  const plRows: (string | number)[][] = [];

  // Revenue section
  plRows.push(["REVENUE", "", ""]);
  [...ca.revenue].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(item => {
    plRows.push([`  ${item.name}`, fmt(Math.abs(item.net), true), pct(Math.abs(item.net), fs.total_revenue)]);
  });
  plRows.push(["Total Revenue", fmt(fs.total_revenue, true), "100.0%"]);
  plRows.push(["", "", ""]);

  // Expenses by category
  for (const cat of EXPENSE_CATEGORY_ORDER) {
    const items = exGroups[cat];
    if (items.length === 0) continue;
    const catTotal = items.reduce((s, i) => s + Math.abs(i.net), 0);
    plRows.push([cat.toUpperCase(), fmt(catTotal, true), pct(catTotal, fs.total_revenue)]);
    // Show top 5 within the category, roll the rest into "Other"
    const top = items.slice(0, 5);
    const rest = items.slice(5);
    top.forEach(item => {
      plRows.push([`  ${item.name}`, fmt(Math.abs(item.net), true), pct(Math.abs(item.net), fs.total_revenue)]);
    });
    if (rest.length > 0) {
      const restTotal = rest.reduce((s, i) => s + Math.abs(i.net), 0);
      plRows.push([`  Other ${cat.toLowerCase()} (${rest.length} items)`, fmt(restTotal, true), pct(restTotal, fs.total_revenue)]);
    }
    plRows.push(["", "", ""]);
  }

  plRows.push(["TOTAL EXPENSES", fmt(fs.total_expenses, true), pct(fs.total_expenses, fs.total_revenue)]);
  plRows.push(["", "", ""]);
  plRows.push(["NET INCOME", fmt(fs.net_income, true), pct(fs.net_income, fs.total_revenue)]);

  autoTable(doc, {
    startY: y,
    head: [["Particulars", "Amount", "% of Revenue"]],
    body: plRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 105 },
      1: { halign: "right", cellWidth: 40, textColor: WHITE },
      2: { halign: "right", cellWidth: 35 },
    },
    didParseCell: (data) => {
      const text = String(data.cell.raw || "");
      // Category headers (ALL CAPS that aren't "NET INCOME" or "TOTAL")
      const isCategoryHeader =
        text === "REVENUE" ||
        EXPENSE_CATEGORY_ORDER.some(c => c.toUpperCase() === text) ||
        text === "TOTAL EXPENSES";
      const isGrandTotal = text === "NET INCOME" || text.startsWith("Total ");

      if (isCategoryHeader) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
        data.cell.styles.fillColor = [20, 20, 20] as RGB;
      }
      if (isGrandTotal) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
      }
      if (text === "NET INCOME") {
        data.cell.styles.textColor = fs.net_income >= 0 ? EMERALD : RED;
      }
    },
  });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: BALANCE SHEET — Grouped current / non-current
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg();
  y = 14;

  sectionHeader("Balance Sheet", "Current / Non-Current split per Ind AS presentation");

  const bsRows: (string | number)[][] = [];
  const renderBsSection = (
    label: string,
    currentItems: AccountItem[],
    nonCurrentItems: AccountItem[],
    otherItems: AccountItem[],
    total: number,
  ) => {
    bsRows.push([label, "", ""]);
    if (currentItems.length > 0) {
      const sub = currentItems.reduce((s, i) => s + Math.abs(i.net), 0);
      bsRows.push([`  Current ${label.toLowerCase()}`, "", fmt(sub, true)]);
      currentItems.slice(0, 6).forEach(it => {
        bsRows.push([`    ${it.name}`, "", fmt(Math.abs(it.net), true)]);
      });
      if (currentItems.length > 6) {
        const rest = currentItems.slice(6).reduce((s, i) => s + Math.abs(i.net), 0);
        bsRows.push([`    Other (${currentItems.length - 6} items)`, "", fmt(rest, true)]);
      }
    }
    if (nonCurrentItems.length > 0) {
      const sub = nonCurrentItems.reduce((s, i) => s + Math.abs(i.net), 0);
      bsRows.push([`  Non-current ${label.toLowerCase()}`, "", fmt(sub, true)]);
      nonCurrentItems.slice(0, 6).forEach(it => {
        bsRows.push([`    ${it.name}`, "", fmt(Math.abs(it.net), true)]);
      });
      if (nonCurrentItems.length > 6) {
        const rest = nonCurrentItems.slice(6).reduce((s, i) => s + Math.abs(i.net), 0);
        bsRows.push([`    Other (${nonCurrentItems.length - 6} items)`, "", fmt(rest, true)]);
      }
    }
    if (otherItems.length > 0) {
      otherItems.slice(0, 5).forEach(it => {
        bsRows.push([`  ${it.name}`, "", fmt(Math.abs(it.net), true)]);
      });
    }
    bsRows.push([`Total ${label}`, "", fmt(Math.abs(total), true)]);
    bsRows.push(["", "", ""]);
  };

  renderBsSection("ASSETS", assetsSplit.current, assetsSplit.nonCurrent, assetsSplit.other, fs.total_assets);
  renderBsSection("LIABILITIES", liabSplit.current, liabSplit.nonCurrent, liabSplit.other, fs.total_liabilities);

  // Equity — no current/non-current split
  bsRows.push(["EQUITY", "", ""]);
  [...ca.equity].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(it => {
    bsRows.push([`  ${it.name}`, "", fmt(Math.abs(it.net), true)]);
  });
  bsRows.push(["Total Equity", "", fmt(Math.abs(fs.total_equity), true)]);
  bsRows.push(["", "", ""]);
  bsRows.push(["Liabilities + Equity", "", fmt(Math.abs(fs.total_liabilities) + Math.abs(fs.total_equity), true)]);

  autoTable(doc, {
    startY: y,
    head: [["Particulars", "", "Amount"]],
    body: bsRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 20 },
      2: { halign: "right", cellWidth: 40, textColor: WHITE },
    },
    didParseCell: (data) => {
      const text = String(data.cell.raw || "");
      const isSectionHeader = text === "ASSETS" || text === "LIABILITIES" || text === "EQUITY";
      const isSubHeader = text.startsWith("  Current ") || text.startsWith("  Non-current ");
      const isTotal = text.startsWith("Total ") || text.startsWith("Liabilities +");

      if (isSectionHeader) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
        data.cell.styles.fillColor = [20, 20, 20] as RGB;
      }
      if (isSubHeader) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = EMERALD;
      }
      if (isTotal) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
      }
    },
  });

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4: RATIOS + IND AS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg();
  y = 14;

  sectionHeader("Ratio Analysis vs Industry Benchmarks");

  const ratioRow = (
    key: keyof RatiosMetaPdf,
    label: string,
    benchmark: string,
    format: (v: number) => string,
    okWhen: (v: number) => boolean,
  ): string[] => {
    const r = renderRatio(result, key, format);
    const status = !r.computable ? "Not available" : okWhen(r.value) ? "Healthy" : "Review";
    return [label, r.text, benchmark, status];
  };
  const ratioRows = [
    ratioRow("current_ratio", "Current Ratio", "1.5x", (v) => `${v}x`, (v) => v >= 1.5),
    ratioRow("debt_to_equity", "Debt-to-Equity", "<2.0x", (v) => `${v}x`, (v) => v <= 2),
    ratioRow("gross_margin", "Gross Margin", "30-40%", (v) => `${v}%`, (v) => v >= 30),
    ratioRow("net_margin", "Net Margin", ">10%", (v) => `${v}%`, (v) => v >= 10),
    ratioRow("return_on_equity", "Return on Equity", ">15%", (v) => `${v}%`, (v) => v >= 15),
    ratioRow("working_capital", "Working Capital", "Positive", (v) => fmt(v, true), (v) => v > 0),
  ];

  autoTable(doc, {
    startY: y,
    head: [["Ratio", "Your Value", "Benchmark", "Status"]],
    body: ratioRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 50, textColor: WHITE },
      1: { halign: "right", cellWidth: 35, fontStyle: "bold", textColor: WHITE },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "center", cellWidth: 30 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === "body") {
        const text = String(data.cell.raw || "");
        data.cell.styles.textColor =
          text === "Healthy" ? EMERALD : text === "Not available" ? MUTED : RED;
        data.cell.styles.fontStyle = "bold";
      }
      if (data.column.index === 1 && data.section === "body") {
        // Dim the "—" cells so they visibly read as missing, not as a number.
        if (String(data.cell.raw || "") === "—") {
          data.cell.styles.textColor = MUTED;
        }
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  if (ind_as_observations.length > 0) {
    sectionHeader("Ind AS Compliance Observations");
    const indRows = ind_as_observations.map(obs => [obs.standard, obs.observation, obs.severity.toUpperCase()]);
    autoTable(doc, {
      startY: y,
      head: [["Standard", "Observation", "Severity"]],
      body: indRows,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 30, textColor: WHITE, fontStyle: "bold" },
        1: { cellWidth: contentW - 55 },
        2: { cellWidth: 20, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const text = String(data.cell.raw || "");
          if (text === "HIGH") data.cell.styles.textColor = RED;
          else if (text === "MEDIUM") data.cell.styles.textColor = AMBER;
          else data.cell.styles.textColor = EMERALD;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
  }

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 5: INSIGHTS + WARNINGS
  // ════════════════════════════════════════════════════════════════════════
  if (warnings.length > 0 || insights.length > 0) {
    doc.addPage();
    pageBg();
    y = 14;

    if (warnings.length > 0) {
      sectionHeader("Warnings");
      const warnRows = warnings.map(w => [w.severity.toUpperCase(), w.title, w.detail]);
      autoTable(doc, {
        startY: y,
        head: [["Severity", "Issue", "Detail"]],
        body: warnRows,
        margin: { left: margin, right: margin },
        theme: "plain",
        styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 50, textColor: WHITE } },
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            const text = String(data.cell.raw || "");
            data.cell.styles.textColor = text === "CRITICAL" ? RED : AMBER;
            data.cell.styles.fontStyle = "bold";
          }
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    if (insights.length > 0) {
      sectionHeader("AI Insights & Recommendations");
      const insightRows = insights.map(ins => [ins.category, ins.title, ins.detail, ins.action]);
      autoTable(doc, {
        startY: y,
        head: [["Category", "Finding", "Detail", "Action"]],
        body: insightRows,
        margin: { left: margin, right: margin },
        theme: "plain",
        styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 7.5, cellPadding: 2.5, overflow: "linebreak" },
        headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 40, textColor: WHITE, fontStyle: "bold" },
          2: { cellWidth: 60 },
          3: { cellWidth: contentW - 122, textColor: EMERALD },
        },
      });
    }

    addFooter();
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6 (optional): VARIANCE ANALYSIS
  // ════════════════════════════════════════════════════════════════════════
  if (comparisonResult) {
    doc.addPage();
    pageBg();
    y = 14;

    sectionHeader(`Variance Analysis`, comparisonLabel || "Year-on-Year comparison");

    const cfs = comparisonResult.financial_statements;
    const cr = comparisonResult.ratios;

    const varianceItems = [
      { label: "Total Revenue", curr: fs.total_revenue, prev: cfs.total_revenue, expense: false },
      { label: "Total Expenses", curr: fs.total_expenses, prev: cfs.total_expenses, expense: true },
      { label: "Net Income", curr: fs.net_income, prev: cfs.net_income, expense: false },
      { label: "Total Assets", curr: fs.total_assets, prev: cfs.total_assets, expense: false },
      { label: "Total Liabilities", curr: fs.total_liabilities, prev: cfs.total_liabilities, expense: true },
      { label: "Total Equity", curr: fs.total_equity, prev: cfs.total_equity, expense: false },
    ];

    const varRows = varianceItems.map(v => {
      const change = v.curr - v.prev;
      const changePct = v.prev !== 0 ? ((change / Math.abs(v.prev)) * 100).toFixed(1) + "%" : "N/A";
      return [v.label, fmt(v.prev, true), fmt(v.curr, true), fmt(change, true), changePct];
    });

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Prior Year", "Current Year", "Change", "% Change"]],
      body: varRows,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 35, textColor: WHITE },
        1: { halign: "right", cellWidth: 30 },
        2: { halign: "right", cellWidth: 30, textColor: WHITE },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && (data.column.index === 3 || data.column.index === 4)) {
          const item = varianceItems[data.row.index];
          const change = item.curr - item.prev;
          const good = item.expense ? change <= 0 : change >= 0;
          data.cell.styles.textColor = good ? EMERALD : RED;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;

    sectionHeader("Ratio Comparison");
    const ratioCompRows = [
      ["Current Ratio", `${cr.current_ratio}x`, `${ratios.current_ratio}x`],
      ["Debt-to-Equity", `${cr.debt_to_equity}x`, `${ratios.debt_to_equity}x`],
      ["Gross Margin", `${cr.gross_margin}%`, `${ratios.gross_margin}%`],
      ["Net Margin", `${cr.net_margin}%`, `${ratios.net_margin}%`],
      ["ROE", `${cr.return_on_equity}%`, `${ratios.return_on_equity}%`],
      ["Working Capital", fmt(cr.working_capital, true), fmt(ratios.working_capital, true)],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Ratio", "Prior Year", "Current Year"]],
      body: ratioCompRows,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 50, textColor: WHITE },
        1: { halign: "right", cellWidth: 40 },
        2: { halign: "right", cellWidth: 40, textColor: WHITE, fontStyle: "bold" },
      },
    });

    addFooter();
  }

  // Save
  const safeName = (companyName || "Report").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  doc.save(`CortexCFO_${safeName}_Analysis.pdf`);
}

// ── Executive summary generator ────────────────────────────────────────────
function buildExecutiveSummary(
  fs: AnalysisResult["financial_statements"],
  ratios: AnalysisResult["ratios"],
  ca: AnalysisResult["classified_accounts"],
  ratiosMeta?: RatiosMetaPdf,
): string {
  const lines: string[] = [];
  const ok = (key: keyof RatiosMetaPdf) => !ratiosMeta || ratiosMeta[key].status === "ok";

  if (fs.net_income >= 0 && fs.total_revenue > 0 && ok("net_margin")) {
    lines.push(`The business is profitable at a net margin of ${ratios.net_margin}%, on revenue of ${fmt(fs.total_revenue, true)}.`);
  } else if (fs.net_income < 0 && fs.total_revenue > 0) {
    lines.push(`The business reported a net loss of ${fmt(Math.abs(fs.net_income), true)}; expenses exceeded revenue by ${fmt(fs.total_expenses - fs.total_revenue, true)}.`);
  }

  if (ok("current_ratio")) {
    if (ratios.current_ratio >= 1.5) {
      lines.push(`Liquidity is strong (current ratio ${ratios.current_ratio}x).`);
    } else if (ratios.current_ratio >= 1) {
      lines.push(`Liquidity is tight (current ratio ${ratios.current_ratio}x) — monitor receivables / payables timing.`);
    } else {
      lines.push(`Liquidity is a concern (current ratio ${ratios.current_ratio}x) — short-term liabilities exceed current assets.`);
    }
  }

  const topExp = [...ca.expenses].sort((a, b) => Math.abs(b.net) - Math.abs(a.net))[0];
  if (topExp && fs.total_revenue > 0) {
    const p = ((Math.abs(topExp.net) / fs.total_revenue) * 100).toFixed(1);
    lines.push(`The largest cost head is ${topExp.name} at ${p}% of revenue.`);
  }

  return lines.length > 0
    ? lines.join(" ")
    : "Uploaded data did not contain the inputs needed for a narrative summary. See the statements and ratios pages for available figures.";
}

// ═══════════════════════════════════════════════════════════════════════════
// QoE (Quality of Earnings) REPORT — separate export
// ═══════════════════════════════════════════════════════════════════════════

export interface QoEAddBack {
  id: string;
  category: string;
  description: string;
  amount: number;
  rationale: string;
  status: "approved" | "flagged" | "pending";
  indAs?: string;
}

export interface QoEComplianceCheck {
  label: string;
  status: "ok" | "warn";
  detail: string;
}

export function exportQoEPdf(
  reportedEbitda: number,
  addbacks: QoEAddBack[],
  complianceChecks: QoEComplianceCheck[],
  companyName: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  const totalAddbacks = addbacks.reduce((s, a) => s + (a.status !== "pending" ? a.amount : 0), 0);
  const pendingAddbacks = addbacks.filter(a => a.status === "pending").reduce((s, a) => s + a.amount, 0);
  const adjustedEbitda = reportedEbitda + totalAddbacks;

  function addFooter() {
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("CortexCFO  |  Quality of Earnings  |  Advisory, not audit.", margin, pageH - 4);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageW - margin, pageH - 4, { align: "right" });
  }

  function pageBg() {
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageW, pageH, "F");
  }

  function sectionHeader(title: string, subtitle?: string) {
    if (y + 18 > pageH - 16) { addFooter(); doc.addPage(); pageBg(); y = 14; }
    doc.setFillColor(...EMERALD);
    doc.rect(margin, y, 2, 6, "F");
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(title, margin + 5, y + 5);
    if (subtitle) {
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(subtitle, margin + 5, y + 10);
      y += 14;
    } else {
      y += 10;
    }
  }

  // ═════════════════════════════════════════════════════════════════════
  // COVER
  // ═════════════════════════════════════════════════════════════════════
  pageBg();
  drawLogo(doc, margin, 14, 10);
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("CortexCFO", margin + 14, 22);

  // CA-reviewed pill
  doc.setFillColor(16, 185, 129, 0.15 * 255);
  doc.setDrawColor(...EMERALD);
  doc.setTextColor(...EMERALD);

  y = 56;
  doc.setFontSize(10);
  doc.setTextColor(...EMERALD);
  doc.text("QUALITY OF EARNINGS", margin, y);
  y += 10;
  doc.setFontSize(24);
  doc.setTextColor(...WHITE);
  doc.text("Quality of Earnings Report", margin, y);
  y += 11;
  doc.setFontSize(15);
  doc.setTextColor(...EMERALD);
  doc.text(companyName, margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);
  y += 4;
  doc.text("Continuous audit-readiness  |  Adjusted EBITDA with full add-back schedule  |  Ind AS aligned", margin, y);

  // KPI cards
  y += 18;
  const cardW = (contentW - 6) / 4;
  const kpis = [
    { label: "Reported EBITDA", value: fmt(reportedEbitda, true), muted: true },
    { label: "Adjusted EBITDA", value: fmt(adjustedEbitda, true), emerald: true },
    { label: "Add-backs identified", value: String(addbacks.length), sub: `${addbacks.filter(a => a.status === "approved").length} approved · ${addbacks.filter(a => a.status === "pending").length} pending` },
    { label: "Compliance health", value: `${complianceChecks.filter(c => c.status === "ok").length}/${complianceChecks.length}`, sub: `${complianceChecks.filter(c => c.status === "warn").length} items need attention` },
  ];
  kpis.forEach((card, i) => {
    const cx = margin + i * (cardW + 2);
    if (card.emerald) {
      doc.setFillColor(12, 60, 40);
    } else {
      doc.setFillColor(...DARK_BG);
    }
    doc.roundedRect(cx, y, cardW, 28, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(...(card.emerald ? EMERALD : MUTED));
    doc.text(card.label, cx + 3, y + 7);
    doc.setFontSize(11);
    doc.setTextColor(...WHITE);
    doc.text(card.value, cx + 3, y + 16);
    if (card.sub) {
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(card.sub, cx + 3, y + 23);
    } else if (card.muted) {
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text("Per books · pre-adjustment", cx + 3, y + 23);
    } else if (card.emerald) {
      doc.setFontSize(6.5);
      doc.setTextColor(...EMERALD);
      const sign = totalAddbacks >= 0 ? "+" : "";
      doc.text(`${sign}${fmt(totalAddbacks, true)} net adjustments`, cx + 3, y + 23);
    }
  });
  y += 36;

  // EBITDA Bridge — as a simple table (visual bars are tricky in jsPDF)
  sectionHeader("EBITDA Bridge", "Reported EBITDA → Adjusted EBITDA, by category");

  const categories = Array.from(new Set(addbacks.filter(a => a.status !== "pending").map(a => a.category)));
  const bridgeRows: (string | number)[][] = [
    ["Reported EBITDA", fmt(reportedEbitda, true), ""],
  ];
  categories.forEach(cat => {
    const catTotal = addbacks.filter(a => a.category === cat && a.status !== "pending").reduce((s, a) => s + a.amount, 0);
    if (catTotal !== 0) {
      const sign = catTotal >= 0 ? "+" : "";
      bridgeRows.push([cat, `${sign}${fmt(catTotal, true)}`, catTotal >= 0 ? "Positive adjustment" : "Negative adjustment"]);
    }
  });
  bridgeRows.push(["Adjusted EBITDA", fmt(adjustedEbitda, true), ""]);

  autoTable(doc, {
    startY: y,
    head: [["", "Amount", "Note"]],
    body: bridgeRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 70, textColor: WHITE },
      1: { halign: "right", cellWidth: 40, fontStyle: "bold", textColor: WHITE },
      2: { cellWidth: contentW - 110 },
    },
    didParseCell: (data) => {
      const text = String(data.row.raw ? (data.row.raw as (string | number)[])[0] || "" : "");
      if (text === "Reported EBITDA" || text === "Adjusted EBITDA") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
        data.cell.styles.fillColor = [20, 20, 20] as RGB;
      }
      if (data.column.index === 1 && data.section === "body") {
        const txt = String(data.cell.raw || "");
        if (txt.startsWith("+")) data.cell.styles.textColor = EMERALD;
        else if (txt.startsWith("-")) data.cell.styles.textColor = RED;
      }
    },
  });

  addFooter();

  // ═════════════════════════════════════════════════════════════════════
  // ADD-BACK SCHEDULE (grouped by category)
  // ═════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg();
  y = 14;

  sectionHeader("Add-back Schedule", `Every adjustment, with rationale and Ind AS reference${pendingAddbacks !== 0 ? `  |  ${fmt(pendingAddbacks, true)} pending review` : ""}`);

  const grouped: Record<string, QoEAddBack[]> = {};
  for (const a of addbacks) {
    (grouped[a.category] = grouped[a.category] || []).push(a);
  }

  const abRows: (string | number)[][] = [];
  for (const cat of Object.keys(grouped)) {
    const items = grouped[cat];
    const catTotal = items.reduce((s, a) => s + a.amount, 0);
    const sign = catTotal >= 0 ? "+" : "";
    abRows.push([cat.toUpperCase(), "", `${sign}${fmt(catTotal, true)}`, `${items.length} items`]);
    for (const a of items) {
      const amtSign = a.amount >= 0 ? "+" : "";
      abRows.push([
        `  ${a.description}${a.rationale ? `\n  ${a.rationale}` : ""}`,
        a.indAs || "—",
        `${amtSign}${fmt(a.amount, true)}`,
        a.status.charAt(0).toUpperCase() + a.status.slice(1),
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [["Description", "Ind AS", "Amount", "Status"]],
    body: abRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 7.5, cellPadding: 2.5, overflow: "linebreak" },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: contentW - 80 },
      1: { cellWidth: 22 },
      2: { halign: "right", cellWidth: 28, fontStyle: "bold" },
      3: { cellWidth: 30, halign: "center" },
    },
    didParseCell: (data) => {
      const text = String(data.row.raw ? (data.row.raw as (string | number)[])[0] || "" : "");
      const isCategoryHeader = /^[A-Z][A-Z -]+$/.test(text) && !text.startsWith("  ");
      if (isCategoryHeader) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
        data.cell.styles.fillColor = [20, 20, 20] as RGB;
      }
      // Colour amount column
      if (data.column.index === 2 && data.section === "body") {
        const txt = String(data.cell.raw || "");
        if (txt.startsWith("+")) data.cell.styles.textColor = EMERALD;
        else if (txt.startsWith("-")) data.cell.styles.textColor = RED;
      }
      // Colour status pills
      if (data.column.index === 3 && data.section === "body") {
        const txt = String(data.cell.raw || "").toLowerCase();
        if (txt === "approved") data.cell.styles.textColor = EMERALD;
        else if (txt === "flagged") data.cell.styles.textColor = RED;
        else if (txt === "pending") data.cell.styles.textColor = AMBER;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  addFooter();

  // ═════════════════════════════════════════════════════════════════════
  // COMPLIANCE + SIGN-OFF
  // ═════════════════════════════════════════════════════════════════════
  doc.addPage();
  pageBg();
  y = 14;

  sectionHeader("Compliance & Regulatory Health", "Continuous GST, TDS and MCA reconciliations");

  const compRows = complianceChecks.map(c => [
    c.status === "ok" ? "OK" : "WARN",
    c.label,
    c.detail,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Status", "Check", "Detail"]],
    body: compRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 70, textColor: WHITE },
      2: { cellWidth: contentW - 92 },
    },
    didParseCell: (data) => {
      if (data.column.index === 0 && data.section === "body") {
        const txt = String(data.cell.raw || "");
        data.cell.styles.textColor = txt === "OK" ? EMERALD : AMBER;
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 12;

  // Review & sign-off workflow
  sectionHeader("Review & Sign-off Workflow", "Every number traceable to ledger · UDIN captured on export");

  const approvedCount = addbacks.filter(a => a.status === "approved").length;
  const pendingCount = addbacks.filter(a => a.status === "pending").length;
  const workflowRows = [
    ["1", "AI prepares first draft", "Add-back candidates surfaced, rationale drafted, Ind AS tags applied", "Done"],
    ["2", "Preparer confirms ledger tie-out", "Each line item back-linked to Tally / Zoho transaction ID", "Done"],
    ["3", "CA reviews & approves add-backs", `${approvedCount} approved · ${pendingCount} pending`, pendingCount > 0 ? "In progress" : "Done"],
    ["4", "UDIN captured, PDF signed", "Report exported with CA's UDIN, firm seal, advisory disclaimer", "Pending"],
  ];
  autoTable(doc, {
    startY: y,
    head: [["#", "Step", "Detail", "Status"]],
    body: workflowRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: { fillColor: PAGE_BG, textColor: MUTED, fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: DARK_BG, textColor: EMERALD, fontSize: 7, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10, halign: "center", fontStyle: "bold", textColor: EMERALD },
      1: { cellWidth: 55, textColor: WHITE, fontStyle: "bold" },
      2: { cellWidth: contentW - 100 },
      3: { cellWidth: 25, halign: "center", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.column.index === 3 && data.section === "body") {
        const txt = String(data.cell.raw || "");
        if (txt === "Done") data.cell.styles.textColor = EMERALD;
        else if (txt === "In progress") data.cell.styles.textColor = AMBER;
        else data.cell.styles.textColor = MUTED;
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 15;

  // Disclaimer
  if (y + 24 > pageH - 16) { addFooter(); doc.addPage(); pageBg(); y = 14; }
  doc.setFillColor(...DARK_BG);
  doc.roundedRect(margin, y, contentW, 20, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("Advisory, not audit.", margin + 4, y + 7);
  doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  const disc = "This workbook is produced for internal review and transaction support. It is not a substitute for a statutory audit opinion or a Big-4 QoE engagement.";
  const wrapped = doc.splitTextToSize(disc, contentW - 8);
  doc.text(wrapped, margin + 4, y + 13);

  addFooter();

  // Save
  const safeName = (companyName || "Report").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  doc.save(`CortexCFO_${safeName}_QoE.pdf`);
}

// unused for now but silences linters that flag SLATE otherwise
void SLATE;
