/**
 * CortexCFO — branded PDF export for financial analysis reports.
 *
 * Uses jsPDF + jspdf-autotable. All styling mirrors the in-app dark/emerald
 * palette so the PDF looks consistent with the product.
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

// ── Types (mirrors the app's AnalysisResult) ───────────────────────────────
interface AccountItem {
  name: string;
  code: string;
  debit: number;
  credit: number;
  net: number;
  sub_group: string;
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
  classified_accounts: {
    assets: AccountItem[]; liabilities: AccountItem[]; equity: AccountItem[];
    revenue: AccountItem[]; expenses: AccountItem[];
  };
  ind_as_observations: { standard: string; observation: string; severity: string }[];
  ai_questions: { question: string; reason: string }[];
  insights: { category: string; title: string; detail: string; action: string; severity: string }[];
  warnings: { severity: string; title: string; detail: string }[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function fmt(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 10000000) return `Rs.${(value / 10000000).toFixed(2)} Cr`;
    if (Math.abs(value) >= 100000) return `Rs.${(value / 100000).toFixed(2)} L`;
    if (Math.abs(value) >= 1000) return `Rs.${(value / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(value).replace("₹", "Rs.");
}

function pct(num: number, denom: number): string {
  if (!denom) return "0.0%";
  return ((num / denom) * 100).toFixed(1) + "%";
}

// ── Logo helper (draws the emerald square + trending icon) ──────────────────
function drawLogo(doc: jsPDF, x: number, y: number, size = 8) {
  doc.setFillColor(...EMERALD);
  doc.roundedRect(x, y, size, size, 1.5, 1.5, "F");
  // Small upward-trending arrow
  doc.setDrawColor(...WHITE);
  doc.setLineWidth(0.4);
  doc.line(x + 2, y + size - 2, x + size / 2, y + 2);
  doc.line(x + size / 2, y + 2, x + size - 2, y + size - 2.5);
}

// ── Main export function ────────────────────────────────────────────────────
export function exportAnalysisPdf(
  result: AnalysisResult,
  companyName: string,
  comparisonResult?: AnalysisResult | null,
  comparisonLabel?: string,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  const { financial_statements: fs, ratios, classified_accounts: ca, ind_as_observations, insights, warnings } = result;

  // ── Helper: add page footer ────────────────────────────────────────────
  function addFooter() {
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text("CortexCFO | Confidential", margin, pageH - 4);
    doc.text(`Page ${doc.getNumberOfPages()}`, pageW - margin, pageH - 4, { align: "right" });
  }

  // ── Helper: check space, add new page if needed ────────────────────────
  function ensureSpace(needed: number) {
    if (y + needed > doc.internal.pageSize.getHeight() - 16) {
      addFooter();
      doc.addPage();
      y = 14;
    }
  }

  // ── Helper: section header ─────────────────────────────────────────────
  function sectionHeader(title: string) {
    ensureSpace(16);
    doc.setFillColor(...EMERALD);
    doc.rect(margin, y, 2, 6, "F");
    doc.setFontSize(12);
    doc.setTextColor(...WHITE);
    doc.text(title, margin + 5, y + 5);
    y += 10;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1: COVER
  // ════════════════════════════════════════════════════════════════════════
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");

  // Logo + brand
  drawLogo(doc, margin, 14, 10);
  doc.setFontSize(16);
  doc.setTextColor(...WHITE);
  doc.text("CortexCFO", margin + 14, 22);

  // Title block
  y = 60;
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text("Financial Analysis Report", margin, y);
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(...EMERALD);
  doc.text(companyName, margin, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, margin, y);
  y += 4;
  doc.text("Ind AS Compliant Review | AI-Powered Insights", margin, y);

  // Summary cards on cover
  y += 20;
  const cardW = (contentW - 6) / 4;
  const cards = [
    { label: "Total Revenue", value: fmt(fs.total_revenue, true) },
    { label: "Total Expenses", value: fmt(fs.total_expenses, true) },
    { label: "Net Income", value: fmt(fs.net_income, true) },
    { label: "TB Status", value: result.summary.is_balanced ? "Balanced" : `Var: ${fmt(result.summary.variance)}` },
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

  // Key ratios summary
  doc.setFillColor(...DARK_BG);
  doc.roundedRect(margin, y, contentW, 30, 2, 2, "F");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("KEY RATIOS", margin + 4, y + 7);
  const ratioItems = [
    { label: "Current Ratio", value: `${ratios.current_ratio}x`, ok: ratios.current_ratio >= 1.5 },
    { label: "Debt/Equity", value: `${ratios.debt_to_equity}x`, ok: ratios.debt_to_equity <= 2 },
    { label: "Gross Margin", value: `${ratios.gross_margin}%`, ok: ratios.gross_margin >= 30 },
    { label: "Net Margin", value: `${ratios.net_margin}%`, ok: ratios.net_margin >= 10 },
    { label: "ROE", value: `${ratios.return_on_equity}%`, ok: ratios.return_on_equity >= 15 },
  ];
  const rw = contentW / ratioItems.length;
  ratioItems.forEach((r, i) => {
    const rx = margin + i * rw;
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(r.label, rx + 4, y + 16);
    doc.setFontSize(10);
    const rgb = r.ok ? EMERALD : RED;
    doc.setTextColor(rgb[0], rgb[1], rgb[2]);
    doc.text(r.value, rx + 4, y + 23);
  });
  y += 36;

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2: P&L STATEMENT
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");
  y = 14;

  sectionHeader("Profit & Loss Statement");

  const plRows: (string | number)[][] = [];
  plRows.push(["REVENUE", "", "", ""]);
  ca.revenue.forEach(item => {
    plRows.push([`  ${item.name}`, fmt(Math.abs(item.net)), pct(Math.abs(item.net), fs.total_revenue), ""]);
  });
  plRows.push(["Total Revenue", fmt(fs.total_revenue), "100.0%", ""]);
  plRows.push(["", "", "", ""]);
  plRows.push(["EXPENSES", "", "", ""]);
  [...ca.expenses].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(item => {
    plRows.push([`  ${item.name}`, fmt(Math.abs(item.net)), pct(Math.abs(item.net), fs.total_revenue), ""]);
  });
  plRows.push(["Total Expenses", fmt(fs.total_expenses), pct(fs.total_expenses, fs.total_revenue), ""]);
  plRows.push(["", "", "", ""]);
  plRows.push(["NET INCOME", fmt(fs.net_income), pct(fs.net_income, fs.total_revenue), ""]);

  autoTable(doc, {
    startY: y,
    head: [["Particulars", "Amount", "% of Revenue", ""]],
    body: plRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fillColor: PAGE_BG,
      textColor: MUTED,
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: DARK_BG,
      textColor: EMERALD,
      fontSize: 7,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { halign: "right", cellWidth: 35, textColor: WHITE },
      2: { halign: "right", cellWidth: 25 },
    },
    didParseCell: (data) => {
      const text = String(data.cell.raw || "");
      // Bold section headers and totals
      if (text === "REVENUE" || text === "EXPENSES" || text.startsWith("Total") || text === "NET INCOME") {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
      }
      if (text === "NET INCOME") {
        data.cell.styles.textColor = (fs.net_income >= 0 ? EMERALD : RED);
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;
  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 3: BALANCE SHEET
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");
  y = 14;

  sectionHeader("Balance Sheet");

  const bsRows: (string | number)[][] = [];
  bsRows.push(["ASSETS", "", ""]);
  [...ca.assets].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(item => {
    bsRows.push([`  ${item.name}`, item.sub_group || "", fmt(Math.abs(item.net))]);
  });
  bsRows.push(["Total Assets", "", fmt(Math.abs(fs.total_assets))]);
  bsRows.push(["", "", ""]);
  bsRows.push(["LIABILITIES", "", ""]);
  [...ca.liabilities].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(item => {
    bsRows.push([`  ${item.name}`, item.sub_group || "", fmt(Math.abs(item.net))]);
  });
  bsRows.push(["Total Liabilities", "", fmt(Math.abs(fs.total_liabilities))]);
  bsRows.push(["", "", ""]);
  bsRows.push(["EQUITY", "", ""]);
  [...ca.equity].sort((a, b) => Math.abs(b.net) - Math.abs(a.net)).forEach(item => {
    bsRows.push([`  ${item.name}`, item.sub_group || "", fmt(Math.abs(item.net))]);
  });
  bsRows.push(["Total Equity", "", fmt(Math.abs(fs.total_equity))]);
  bsRows.push(["", "", ""]);
  bsRows.push(["Liabilities + Equity", "", fmt(Math.abs(fs.total_liabilities) + Math.abs(fs.total_equity))]);

  autoTable(doc, {
    startY: y,
    head: [["Particulars", "Sub Group", "Amount"]],
    body: bsRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fillColor: PAGE_BG,
      textColor: MUTED,
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: DARK_BG,
      textColor: EMERALD,
      fontSize: 7,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, textColor: MUTED },
      2: { halign: "right", cellWidth: 40, textColor: WHITE },
    },
    didParseCell: (data) => {
      const text = String(data.cell.raw || "");
      if (text === "ASSETS" || text === "LIABILITIES" || text === "EQUITY" || text.startsWith("Total") || text.startsWith("Liabilities +")) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = WHITE;
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;
  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 4: RATIO ANALYSIS + IND AS COMPLIANCE
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");
  y = 14;

  sectionHeader("Ratio Analysis vs Industry Benchmarks");

  const ratioRows = [
    ["Current Ratio", `${ratios.current_ratio}x`, "1.5x", ratios.current_ratio >= 1.5 ? "Healthy" : "Review"],
    ["Debt-to-Equity", `${ratios.debt_to_equity}x`, "<2.0x", ratios.debt_to_equity <= 2 ? "Healthy" : "Review"],
    ["Gross Margin", `${ratios.gross_margin}%`, "30-40%", ratios.gross_margin >= 30 ? "Healthy" : "Review"],
    ["Net Margin", `${ratios.net_margin}%`, ">10%", ratios.net_margin >= 10 ? "Healthy" : "Review"],
    ["Return on Equity", `${ratios.return_on_equity}%`, ">15%", ratios.return_on_equity >= 15 ? "Healthy" : "Review"],
    ["Working Capital", fmt(ratios.working_capital, true), "Positive", ratios.working_capital > 0 ? "Healthy" : "Review"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Ratio", "Your Value", "Benchmark", "Status"]],
    body: ratioRows,
    margin: { left: margin, right: margin },
    theme: "plain",
    styles: {
      fillColor: PAGE_BG,
      textColor: MUTED,
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: DARK_BG,
      textColor: EMERALD,
      fontSize: 7,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 45, textColor: WHITE },
      1: { halign: "right", cellWidth: 30, fontStyle: "bold", textColor: WHITE },
      2: { halign: "right", cellWidth: 25 },
      3: { halign: "center", cellWidth: 25 },
    },
    didParseCell: (data) => {
      if (data.column.index === 3) {
        const text = String(data.cell.raw || "");
        data.cell.styles.textColor = (text === "Healthy" ? EMERALD : RED);
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 10;

  // Ind AS Observations
  if (ind_as_observations.length > 0) {
    sectionHeader("Ind AS Compliance Observations");

    const indRows = ind_as_observations.map(obs => [obs.standard, obs.observation, obs.severity.toUpperCase()]);

    autoTable(doc, {
      startY: y,
      head: [["Standard", "Observation", "Severity"]],
      body: indRows,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: {
        fillColor: PAGE_BG,
        textColor: MUTED,
        fontSize: 7.5,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: DARK_BG,
        textColor: EMERALD,
        fontSize: 7,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30, textColor: WHITE, fontStyle: "bold" },
        1: { cellWidth: contentW - 55 },
        2: { cellWidth: 20, halign: "center" },
      },
      didParseCell: (data) => {
        if (data.column.index === 2) {
          const text = String(data.cell.raw || "");
          if (text === "HIGH") data.cell.styles.textColor = RED;
          else if (text === "MEDIUM") data.cell.styles.textColor = AMBER;
          else data.cell.styles.textColor = EMERALD;
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 5: INSIGHTS + WARNINGS
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  doc.setFillColor(...PAGE_BG);
  doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");
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
      styles: {
        fillColor: PAGE_BG,
        textColor: MUTED,
        fontSize: 7.5,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: DARK_BG,
        textColor: EMERALD,
        fontSize: 7,
        fontStyle: "bold",
      },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 45, textColor: WHITE } },
      didParseCell: (data) => {
        if (data.column.index === 0) {
          const text = String(data.cell.raw || "");
          data.cell.styles.textColor = (text === "CRITICAL" ? RED : AMBER);
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
      styles: {
        fillColor: PAGE_BG,
        textColor: MUTED,
        fontSize: 7,
        cellPadding: 2.5,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: DARK_BG,
        textColor: EMERALD,
        fontSize: 7,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35, textColor: WHITE, fontStyle: "bold" },
        2: { cellWidth: 60 },
        3: { cellWidth: contentW - 122, textColor: EMERALD },
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 6;
  }

  addFooter();

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 6 (optional): VARIANCE ANALYSIS — only when comparisonResult given
  // ════════════════════════════════════════════════════════════════════════
  if (comparisonResult) {
    doc.addPage();
    doc.setFillColor(...PAGE_BG);
    doc.rect(0, 0, pageW, doc.internal.pageSize.getHeight(), "F");
    y = 14;

    sectionHeader(`Variance Analysis — ${comparisonLabel || "Year-on-Year"}`);

    const cfs = comparisonResult.financial_statements;
    const cr = comparisonResult.ratios;

    // P&L variance
    const varianceItems = [
      { label: "Total Revenue", curr: fs.total_revenue, prev: cfs.total_revenue },
      { label: "Total Expenses", curr: fs.total_expenses, prev: cfs.total_expenses },
      { label: "Net Income", curr: fs.net_income, prev: cfs.net_income },
      { label: "Total Assets", curr: fs.total_assets, prev: cfs.total_assets },
      { label: "Total Liabilities", curr: fs.total_liabilities, prev: cfs.total_liabilities },
      { label: "Total Equity", curr: fs.total_equity, prev: cfs.total_equity },
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
      styles: {
        fillColor: PAGE_BG,
        textColor: MUTED,
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: DARK_BG,
        textColor: EMERALD,
        fontSize: 7,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 35, textColor: WHITE },
        1: { halign: "right", cellWidth: 30 },
        2: { halign: "right", cellWidth: 30, textColor: WHITE },
        3: { halign: "right", cellWidth: 30 },
        4: { halign: "right", cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && (data.column.index === 3 || data.column.index === 4)) {
          const rowIdx = data.row.index;
          const change = varianceItems[rowIdx].curr - varianceItems[rowIdx].prev;
          // For expenses, increase is bad; for everything else increase is good
          const isExpense = varianceItems[rowIdx].label.includes("Expense") || varianceItems[rowIdx].label.includes("Liabilit");
          const isPositive = isExpense ? change <= 0 : change >= 0;
          data.cell.styles.textColor = (isPositive ? EMERALD : RED);
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 10;

    // Ratio comparison
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
      styles: {
        fillColor: PAGE_BG,
        textColor: MUTED,
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: DARK_BG,
        textColor: EMERALD,
        fontSize: 7,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 40, textColor: WHITE },
        1: { halign: "right", cellWidth: 35 },
        2: { halign: "right", cellWidth: 35, textColor: WHITE, fontStyle: "bold" },
      },
    });

    addFooter();
  }

  // ── Save ────────────────────────────────────────────────────────────────
  const safeName = companyName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`CortexCFO_${safeName}_Analysis.pdf`);
}
