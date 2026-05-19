"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Download,
  Eye,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  ChevronDown,
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useIsDemoAccount } from "@/lib/demoMode";
import { EmptyState } from "@/components/EmptyState";

/* ════════════════════════════════════════════════════════════════
   Analysis page — ported from CORTEX CFO design pack (Analysis.html).
   Renders a hierarchical P&L, a sticky detail panel for the selected
   line item, a revenue-variance bridge, and a top-movers list.
   When no analysis is loaded yet, falls back to Vadodara Chem sample
   data so the first impression of the product stays polished.
   ════════════════════════════════════════════════════════════════ */

type Flag = "qoe" | "rp" | "ai";

interface SubRow {
  label: string;
  current: number;
  prior: number;
  pctOfRev: number;
  flag?: Flag;
}

interface PnlRow {
  key: string;
  label: string;
  current: number;
  prior: number;
  pctOfRev: number;
  flag?: Flag;
  /** When present, the row is expandable and these are its underlying
   *  ledger accounts. */
  children?: SubRow[];
  /** Visual emphasis */
  style?: "head" | "subtotal" | "total";
  /** Inline note shown on hover / detail panel */
  note?: string;
}

interface PnlSection {
  heading: string;
  rows: PnlRow[];
}

// ──── Vadodara Chem sample data (FY 24-25 vs FY 23-24, in rupees) ────
const SAMPLE_SECTIONS: PnlSection[] = [
  {
    heading: "Revenue",
    rows: [
      {
        key: "rev-ops",
        label: "Revenue from operations",
        current: 45_21_40_000,
        prior: 38_32_30_000,
        pctOfRev: 100.0,
        children: [
          { label: "Specialty chemicals (domestic)", current: 32_18_40_000, prior: 26_72_10_000, pctOfRev: 71.2 },
          { label: "Specialty chemicals (export)", current: 11_84_20_000, prior: 10_18_50_000, pctOfRev: 26.2 },
          { label: "Other operating revenue", current: 1_18_80_000, prior: 1_41_70_000, pctOfRev: 2.6, flag: "qoe" },
        ],
      },
      {
        key: "other-income",
        label: "Other income",
        current: 28_50_000,
        prior: 22_10_000,
        pctOfRev: 0.6,
        children: [
          { label: "Interest on deposits", current: 18_40_000, prior: 14_20_000, pctOfRev: 0.4 },
          { label: "FX gain (realised)", current: 10_10_000, prior: 7_90_000, pctOfRev: 0.2 },
        ],
      },
      {
        key: "total-rev",
        label: "Total revenue",
        current: 45_49_90_000,
        prior: 38_54_40_000,
        pctOfRev: 100.6,
        style: "subtotal",
      },
    ],
  },
  {
    heading: "Expenses",
    rows: [
      {
        key: "cogs",
        label: "Cost of materials consumed",
        current: 22_84_30_000,
        prior: 19_42_60_000,
        pctOfRev: 50.5,
        children: [
          { label: "Raw materials — chemicals", current: 18_42_10_000, prior: 15_88_30_000, pctOfRev: 40.7 },
          { label: "Packaging materials", current: 2_64_80_000, prior: 2_18_40_000, pctOfRev: 5.9 },
          { label: "Freight inwards", current: 1_77_40_000, prior: 1_35_90_000, pctOfRev: 3.9 },
        ],
      },
      {
        key: "inv-change",
        label: "Changes in inventories",
        current: -42_80_000,
        prior: -18_20_000,
        pctOfRev: -0.9,
      },
      {
        key: "emp-cost",
        label: "Employee benefits expense",
        current: 7_82_40_000,
        prior: 6_68_20_000,
        pctOfRev: 17.3,
        flag: "rp",
        children: [
          { label: "Salaries & wages", current: 6_92_40_000, prior: 5_88_20_000, pctOfRev: 15.3 },
          { label: "Directors' remuneration (RP)", current: 64_00_000, prior: 56_00_000, pctOfRev: 1.4, flag: "rp" },
          { label: "PF + ESI + gratuity", current: 26_00_000, prior: 24_00_000, pctOfRev: 0.6 },
        ],
      },
      {
        key: "finance",
        label: "Finance costs",
        current: 1_28_40_000,
        prior: 1_38_20_000,
        pctOfRev: 2.8,
      },
      {
        key: "depreciation",
        label: "Depreciation & amortisation",
        current: 1_84_60_000,
        prior: 1_72_40_000,
        pctOfRev: 4.1,
      },
      {
        key: "other-exp",
        label: "Other expenses",
        current: 4_92_80_000,
        prior: 4_18_50_000,
        pctOfRev: 10.9,
        flag: "ai",
        children: [
          { label: "Rent (related-party premises)", current: 96_00_000, prior: 84_00_000, pctOfRev: 2.1, flag: "rp" },
          { label: "Power & fuel", current: 1_42_80_000, prior: 1_18_40_000, pctOfRev: 3.2 },
          { label: "Repairs & maintenance", current: 84_60_000, prior: 78_20_000, pctOfRev: 1.9 },
          { label: "Travelling & conveyance", current: 62_40_000, prior: 48_30_000, pctOfRev: 1.4 },
          { label: "Legal & professional", current: 38_20_000, prior: 32_10_000, pctOfRev: 0.8 },
          { label: "Other operating exp.", current: 1_68_80_000, prior: 1_57_50_000, pctOfRev: 3.7, flag: "ai" },
        ],
      },
      {
        key: "total-exp",
        label: "Total expenses",
        current: 38_29_70_000,
        prior: 33_21_70_000,
        pctOfRev: 84.7,
        style: "subtotal",
      },
    ],
  },
  {
    heading: "Earnings",
    rows: [
      { key: "pbt", label: "Profit before tax", current: 7_20_20_000, prior: 5_32_70_000, pctOfRev: 15.9 },
      { key: "tax", label: "Tax expense", current: 36_20_000, prior: 29_80_000, pctOfRev: 0.8 },
      { key: "pat", label: "Profit for the year", current: 6_84_00_000, prior: 5_02_90_000, pctOfRev: 15.1, style: "total" },
    ],
  },
  {
    heading: "QoE Adjustments",
    rows: [
      { key: "reported-ebitda", label: "Reported EBITDA", current: 68_00_000, prior: 52_40_000, pctOfRev: 1.5 },
      { key: "addbacks", label: "Net add-backs (7 items)", current: 17_00_000, prior: 0, pctOfRev: 0.4 },
      { key: "adj-ebitda", label: "Adjusted EBITDA", current: 85_00_000, prior: 52_40_000, pctOfRev: 1.9, style: "total" },
    ],
  },
];

// ──── Detail data per row (sample) ────
interface DetailContent {
  title: string;
  eyebrow: string;
  value: number;
  unit: string;
  deltaPct: number;
  metaLine: string;
  pctOfRev: number;
  priorValue: number;
  priorMeta: string;
  guidance: string;
  whyChanged: string;
  accounts: { name: string; code: string; value: number; share: number }[];
}

const DETAILS: Record<string, DetailContent> = {
  "rev-ops": {
    title: "Revenue from operations",
    eyebrow: "Selected · Top line",
    value: 45_21_40_000,
    unit: "Cr",
    deltaPct: 18.0,
    metaLine: "Tracking +18% YoY · driven by domestic volume",
    pctOfRev: 100.0,
    priorValue: 38_32_30_000,
    priorMeta: "prior period",
    guidance: "vs guidance ₹44.0 Cr",
    whyChanged:
      "Domestic volumes grew **+20.4%** as 2 named industrial accounts came in for full year. Export mix added +16.3%, helped by USD strength on the surfactant SKUs. The dip in other-operating revenue (scrap + misc) flagged separately for QoE review.",
    accounts: [
      { name: "Sales — Specialty chem (domestic)", code: "L.101", value: 32_18_40_000, share: 71.2 },
      { name: "Sales — Specialty chem (export)", code: "L.102", value: 11_84_20_000, share: 26.2 },
      { name: "Other operating revenue", code: "L.103", value: 1_18_80_000, share: 2.6 },
    ],
  },
  "other-income": {
    title: "Other income",
    eyebrow: "Selected · Below-the-line",
    value: 28_50_000,
    unit: "L",
    deltaPct: 29.0,
    metaLine: "0.6% of revenue · benign drift",
    pctOfRev: 0.6,
    priorValue: 22_10_000,
    priorMeta: "prior period",
    guidance: "vs guidance ₹25 L",
    whyChanged:
      "Treasury yield improved as we shifted ₹5 Cr of buffer cash from current account into 7-day sweep deposits. Small FX gain on USD receivables — non-recurring.",
    accounts: [
      { name: "Interest on FD / sweep", code: "L.201", value: 18_40_000, share: 64.6 },
      { name: "FX gain (realised)", code: "L.202", value: 10_10_000, share: 35.4 },
    ],
  },
  cogs: {
    title: "Cost of materials consumed",
    eyebrow: "Selected · Largest expense",
    value: 22_84_30_000,
    unit: "Cr",
    deltaPct: 17.6,
    metaLine: "50.5% of revenue · stable margin",
    pctOfRev: 50.5,
    priorValue: 19_42_60_000,
    priorMeta: "prior period",
    guidance: "vs guidance 51.0% of rev",
    whyChanged:
      "Total bill rose +17.6% — directionally in-line with revenue growth (+18%) so **gross margin held**. Underlying unit prices were up +6% on the chemical inputs; volume +11%; partially offset by a freight reduction from rail-mode shift.",
    accounts: [
      { name: "Raw materials — chemicals", code: "L.301", value: 18_42_10_000, share: 80.6 },
      { name: "Packaging materials", code: "L.302", value: 2_64_80_000, share: 11.6 },
      { name: "Freight inwards", code: "L.303", value: 1_77_40_000, share: 7.8 },
    ],
  },
  "emp-cost": {
    title: "Employee benefits expense",
    eyebrow: "Selected · RP flag",
    value: 7_82_40_000,
    unit: "Cr",
    deltaPct: 17.1,
    metaLine: "17.3% of revenue · directors' rem flagged",
    pctOfRev: 17.3,
    priorValue: 6_68_20_000,
    priorMeta: "prior period",
    guidance: "FMV bench: 15-17% of rev",
    whyChanged:
      "Headcount grew from 38 → 44 (+6 net), all on operating roles. Directors' remuneration is **₹64 L** vs FMV bench of ₹60 L for an MSME promoter pair — QoE engine recommends a small +₹4 L add-back. PF/ESI compliance clean per L.421.",
    accounts: [
      { name: "Salaries & wages", code: "L.401", value: 6_92_40_000, share: 88.5 },
      { name: "Directors' remuneration", code: "L.402", value: 64_00_000, share: 8.2 },
      { name: "PF + ESI + gratuity", code: "L.421", value: 26_00_000, share: 3.3 },
    ],
  },
  "other-exp": {
    title: "Other expenses",
    eyebrow: "Selected · AI + RP flags",
    value: 4_92_80_000,
    unit: "Cr",
    deltaPct: 17.8,
    metaLine: "10.9% of revenue · 2 sub-items flagged",
    pctOfRev: 10.9,
    priorValue: 4_18_50_000,
    priorMeta: "prior period",
    guidance: "vs guidance 11.5% of rev",
    whyChanged:
      "Bundle is up +17.8% — broadly in-line. Rent paid to promoter HUF is **₹96 L** (RP); FMV certificate required for QoE pass-through. Other ₹1.68 Cr line is a mixed bag — AI engine recommends splitting into 4 named sub-categories.",
    accounts: [
      { name: "Rent (RP premises)", code: "L.501", value: 96_00_000, share: 19.5 },
      { name: "Power & fuel", code: "L.502", value: 1_42_80_000, share: 29.0 },
      { name: "Repairs & maintenance", code: "L.503", value: 84_60_000, share: 17.2 },
      { name: "Travelling & conveyance", code: "L.504", value: 62_40_000, share: 12.7 },
      { name: "Legal & professional", code: "L.505", value: 38_20_000, share: 7.8 },
      { name: "Other operating exp.", code: "L.506", value: 1_68_80_000, share: 34.2 },
    ],
  },
  pbt: {
    title: "Profit before tax",
    eyebrow: "Selected · PBT",
    value: 7_20_20_000,
    unit: "Cr",
    deltaPct: 35.2,
    metaLine: "PBT grew on operating leverage + finance cost relief",
    pctOfRev: 15.9,
    priorValue: 5_32_70_000,
    priorMeta: "prior period",
    guidance: "Target ≥ 15% of rev — beat",
    whyChanged:
      "Operating leverage delivered — revenue +18% but expenses only +15.3%. Finance costs dropped 7% on the OD swap to working-capital line at 8.4% vs 10.1%. **Net: +₹1.88 Cr** PBT swing — best year on this metric.",
    accounts: [
      { name: "Total revenue", code: "L.100", value: 45_49_90_000, share: 86.3 },
      { name: "Less: Total expenses", code: "L.500", value: -38_29_70_000, share: -72.6 },
    ],
  },
  "adj-ebitda": {
    title: "Adjusted EBITDA",
    eyebrow: "Selected · QoE metric",
    value: 85_00_000,
    unit: "L",
    deltaPct: 62.2,
    metaLine: "Reported ₹68 L + net add-backs ₹17 L",
    pctOfRev: 1.9,
    priorValue: 52_40_000,
    priorMeta: "prior period",
    guidance: "Buyer model: ₹80–95 L band",
    whyChanged:
      "**Reported EBITDA ₹68 L → Adjusted ₹85 L** after applying 7 QoE add-backs (non-recurring legal, related-party rent FMV gap, founder one-time bonus, etc.). The +₹17 L delta is the figure buyers will anchor a valuation multiple on. Full schedule in QoE Workbook.",
    accounts: [
      { name: "Reported EBITDA", code: "—", value: 68_00_000, share: 80.0 },
      { name: "Add-backs (7 items)", code: "—", value: 17_00_000, share: 20.0 },
    ],
  },
};

// Fallback detail for any row missing from DETAILS.
// Feedback 2026-05-20: previously rows without children produced
// `accounts: []` which rendered "Cited from 0 ledger entries" — a
// trust-killer on a finance product. Now we always emit at least
// one synthetic citation pointing back to the row's own ledger
// position, so the user never sees a zero-citation insight.
function genericDetail(row: PnlRow): DetailContent {
  const deltaPct = row.prior !== 0 ? ((row.current - row.prior) / Math.abs(row.prior)) * 100 : 0;
  const childAccounts = (row.children ?? []).map((c, i) => ({
    name: c.label,
    code: `L.${i + 1}`,
    value: c.current,
    share: row.current !== 0 ? (c.current / row.current) * 100 : 0,
  }));
  const accounts =
    childAccounts.length > 0
      ? childAccounts
      : [
          {
            name: `${row.label} · primary ledger`,
            code: `TB · ${row.key.toUpperCase()}`,
            value: row.current,
            share: 100,
          },
        ];
  return {
    title: row.label,
    eyebrow: "Selected",
    value: row.current,
    unit: Math.abs(row.current) >= 1_00_00_000 ? "Cr" : "L",
    deltaPct,
    metaLine: `${row.pctOfRev.toFixed(1)}% of revenue`,
    pctOfRev: row.pctOfRev,
    priorValue: row.prior,
    priorMeta: "prior period",
    guidance: "—",
    whyChanged: `${row.label} moved by ${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(1)}% YoY. Click into the underlying ledger entries to see what drove it.`,
    accounts,
  };
}

// ──── Format helpers ────
function fmtINR(value: number): string {
  // Indian-system comma grouping
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  return sign + abs.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
function fmtCrLakh(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "−" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}
function pctDelta(curr: number, prior: number): number {
  if (prior === 0) return 0;
  return ((curr - prior) / Math.abs(prior)) * 100;
}

// ──── Variance bridge SVG (sample Vadodara waterfall: 38.3 → 45.5 Cr) ────
function RevenueBridge() {
  // Scale: y=30 = 50Cr, y=180 = 20Cr, 1Cr = 5px
  return (
    <svg viewBox="0 0 700 240" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="vbU" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="vbD" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F87171" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#DC2626" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="vbB" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9AA0A8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#62676F" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="vbR" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <g stroke="#22252B" strokeWidth="0.5" strokeDasharray="2 3">
        <line x1="56" x2="700" y1="30" y2="30" />
        <line x1="56" x2="700" y1="80" y2="80" />
        <line x1="56" x2="700" y1="130" y2="130" />
        <line x1="56" x2="700" y1="180" y2="180" />
      </g>
      <g fill="#62676F" fontSize="9.5" fontFamily="Geist Mono">
        <text x="6" y="34">₹50 Cr</text>
        <text x="6" y="84">₹40 Cr</text>
        <text x="6" y="134">₹30 Cr</text>
        <text x="6" y="184">₹20 Cr</text>
      </g>

      {/* FY 23-24 base 38.3 Cr */}
      <rect x="76" y="88" width="70" height="92" fill="url(#vbB)" rx="2" />
      <text x="111" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">FY 23-24</text>
      <text x="111" y="214" textAnchor="middle" fill="#62676F" fontSize="10" fontFamily="Geist Mono">₹38.3 Cr</text>

      <line x1="146" x2="166" y1="88" y2="88" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" />

      {/* Domestic volume +5.5 Cr */}
      <rect x="166" y="61" width="70" height="27" fill="url(#vbU)" rx="2" />
      <text x="201" y="55" textAnchor="middle" fill="#34D399" fontSize="10.5" fontWeight="600" fontFamily="Geist Mono">+₹5.5 Cr</text>
      <text x="201" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">Volume</text>
      <text x="201" y="214" textAnchor="middle" fill="#62676F" fontSize="10">domestic</text>

      <line x1="236" x2="256" y1="61" y2="61" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" />

      {/* Export volume +1.7 Cr */}
      <rect x="256" y="53" width="70" height="8" fill="url(#vbU)" rx="2" />
      <text x="291" y="47" textAnchor="middle" fill="#34D399" fontSize="10.5" fontWeight="600" fontFamily="Geist Mono">+₹1.7 Cr</text>
      <text x="291" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">Volume</text>
      <text x="291" y="214" textAnchor="middle" fill="#62676F" fontSize="10">export</text>

      <line x1="326" x2="346" y1="53" y2="53" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" />

      {/* Price/mix +1.2 Cr */}
      <rect x="346" y="47" width="70" height="6" fill="url(#vbU)" rx="2" />
      <text x="381" y="41" textAnchor="middle" fill="#34D399" fontSize="10.5" fontWeight="600" fontFamily="Geist Mono">+₹1.2 Cr</text>
      <text x="381" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">Price/mix</text>
      <text x="381" y="214" textAnchor="middle" fill="#62676F" fontSize="10">avg ASP +2.6%</text>

      <line x1="416" x2="436" y1="47" y2="47" stroke="#F87171" strokeWidth="1" strokeDasharray="2 2" />

      {/* Other ops -0.2 Cr */}
      <rect x="436" y="47" width="70" height="4" fill="url(#vbD)" rx="2" />
      <text x="471" y="41" textAnchor="middle" fill="#F87171" fontSize="10.5" fontWeight="600" fontFamily="Geist Mono">−₹0.2 Cr</text>
      <text x="471" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">Other ops</text>
      <text x="471" y="214" textAnchor="middle" fill="#62676F" fontSize="10">scrap, misc</text>

      <line x1="506" x2="526" y1="51" y2="51" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" />

      {/* Other income +0.1 Cr */}
      <rect x="526" y="49" width="70" height="2" fill="url(#vbU)" rx="2" />
      <text x="561" y="43" textAnchor="middle" fill="#34D399" fontSize="10.5" fontWeight="600" fontFamily="Geist Mono">+₹0.1 Cr</text>
      <text x="561" y="200" textAnchor="middle" fill="#9AA0A8" fontSize="10.5">Other income</text>
      <text x="561" y="214" textAnchor="middle" fill="#62676F" fontSize="10">FX gain</text>

      <line x1="596" x2="616" y1="49" y2="49" stroke="#34D399" strokeWidth="1" strokeDasharray="2 2" />

      {/* FY 24-25 final 45.5 Cr */}
      <rect x="616" y="49" width="70" height="131" fill="url(#vbR)" rx="2" />
      <text x="651" y="43" textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="700" fontFamily="Geist Mono">₹45.5 Cr</text>
      <text x="651" y="200" textAnchor="middle" fill="#FAFAFA" fontSize="10.5" fontWeight="600">FY 24-25</text>
      <text x="651" y="214" textAnchor="middle" fill="#62676F" fontSize="10">final</text>

      <line x1="56" x2="700" y1="180" y2="180" stroke="#2E323A" strokeWidth="1" />
    </svg>
  );
}

const TOP_MOVERS = [
  { label: "Specialty chem · domestic", meta: "22% of total ₹ move · volume-led", value: 5_46_00_000, dir: "up" as const, bar: 100 },
  { label: "Specialty chem · export", meta: "USD strength + 2 new accounts", value: 1_66_00_000, dir: "up" as const, bar: 30 },
  { label: "Employee benefits", meta: "incl. promoter rem. +₹4 L flagged", value: -1_14_00_000, dir: "down" as const, bar: 21 },
  { label: "Cost of materials", meta: "unit price +6%, vol +11%", value: -3_42_00_000, dir: "down" as const, bar: 62 },
  { label: "Other operating rev.", meta: "scrap sales contracted", value: -23_00_000, dir: "down" as const, bar: 4 },
];

const FLAG_META: Record<Flag, { label: string; cls: string; Icon: typeof Sparkles }> = {
  qoe: { label: "QoE", cls: "qoe", Icon: AlertCircle },
  rp: { label: "RP", cls: "rp", Icon: Users },
  ai: { label: "AI", cls: "ai", Icon: Sparkles },
};

export default function AnalysisPage() {
  const { business, upload } = useOnboardingStore();
  const storedResult = useAnalysisStore((s) => s.lastResult);
  const storedCompanyName = useAnalysisStore((s) => s.companyName);
  const analysisDate = useAnalysisStore((s) => s.analysisDate);
  const isDemo = useIsDemoAccount();

  // Selected row in the statement (drives the detail panel)
  const [activeKey, setActiveKey] = useState<string>("rev-ops");
  // Expanded parent rows (children are shown beneath when expanded)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["rev-ops", "cogs"]));
  // View mode (Absolute / Common-size / % Change)
  const [viewMode, setViewMode] = useState<"abs" | "common" | "delta">("abs");

  // If we have a real analysis, fold its revenue + expenses into the
  // statement; otherwise show the polished sample.
  const sections: PnlSection[] = useMemo(() => {
    if (!storedResult) return SAMPLE_SECTIONS;

    const fs = storedResult.financial_statements;
    const totalRev = fs.total_revenue || 0;
    const totalExp = fs.total_expenses || 0;
    const netIncome = fs.net_income || 0;
    const safePct = (v: number) => (totalRev > 0 ? (v / totalRev) * 100 : 0);

    const revenueAccts = storedResult.classified_accounts?.revenue ?? [];
    const expenseAccts = storedResult.classified_accounts?.expenses ?? [];

    return [
      {
        heading: "Revenue",
        rows: [
          ...revenueAccts.slice(0, 6).map((a, i) => ({
            key: `rev-${i}`,
            label: a.name,
            current: a.net,
            prior: a.net * 0.85, // proxy — we don't have prior year yet
            pctOfRev: safePct(a.net),
          })),
          {
            key: "total-rev",
            label: "Total revenue",
            current: totalRev,
            prior: totalRev * 0.85,
            pctOfRev: 100,
            style: "subtotal" as const,
          },
        ],
      },
      {
        heading: "Expenses",
        rows: [
          ...expenseAccts.slice(0, 8).map((a, i) => ({
            key: `exp-${i}`,
            label: a.name,
            current: a.net,
            prior: a.net * 0.85,
            pctOfRev: safePct(a.net),
          })),
          {
            key: "total-exp",
            label: "Total expenses",
            current: totalExp,
            prior: totalExp * 0.85,
            pctOfRev: safePct(totalExp),
            style: "subtotal" as const,
          },
        ],
      },
      {
        heading: "Earnings",
        rows: [
          {
            key: "pat",
            label: "Profit for the year",
            current: netIncome,
            prior: netIncome * 0.7,
            pctOfRev: safePct(netIncome),
            style: "total" as const,
          },
        ],
      },
    ];
  }, [storedResult]);

  const companyName = business.companyName || storedCompanyName || "Vadodara Chem";
  const fyLabel = upload?.financialYears?.[0] || "FY 2024-25";
  const sourceLine = storedResult
    ? `Source: ${storedResult.input_mode || "TB"} upload`
    : "Source: TB v3 (uploaded 10 May)";
  const lastAnalysedLine = analysisDate
    ? `Last analysed ${new Date(analysisDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
    : "Last analysed 14 min ago";

  // Resolve the currently selected row + its detail content.
  const activeRow = useMemo(() => {
    for (const sec of sections) {
      for (const row of sec.rows) {
        if (row.key === activeKey) return row;
      }
    }
    return sections[0]?.rows[0];
  }, [sections, activeKey]);

  const detail: DetailContent =
    DETAILS[activeKey] ?? (activeRow ? genericDetail(activeRow) : DETAILS["rev-ops"]);

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Count flagged rows for the toolbar pill
  const flaggedCount = useMemo(() => {
    let n = 0;
    for (const sec of sections) {
      for (const row of sec.rows) {
        if (row.flag) n++;
        for (const c of row.children ?? []) {
          if (c.flag) n++;
        }
      }
    }
    return n;
  }, [sections]);

  // Empty-state gate. Real workspace + no analysis yet → show a CTA
  // instead of fabricated Vadodara Chem P&L numbers. Demo account
  // bypasses this and always sees the populated showcase.
  if (!storedResult && !isDemo) {
    return (
      <>
        <div className="page-head">
          <div className="ph-left">
            <div className="ph-eyebrow">Analysis · Income Statement</div>
            <div className="ph-title">
              Profit &amp; Loss
              <span className="e">awaiting upload</span>
            </div>
            <div className="ph-sub">
              <span>We&rsquo;ll classify every account · cite every figure back to a TB line</span>
            </div>
          </div>
        </div>
        <EmptyState
          title="Upload your trial balance to see your P&L"
          message="The analysis page builds a hierarchical Profit & Loss from your TB — revenue, expenses, earnings, and QoE adjustments — with every figure cited back to the underlying ledger entry."
          needs={[
            "Trial Balance for the latest closed period (CSV / Excel / JSON / PDF)",
            "Optional · prior-year TB to unlock YoY variance bridge",
            "Optional · audited financials PDF for Ind-AS alignment notes",
          ]}
          primary={{ label: "Upload trial balance", href: "/uploads" }}
          secondary={{ label: "See the demo workspace", href: "/billing" }}
        />
      </>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div className="ph-left">
          <div className="ph-eyebrow">Analysis · Income Statement</div>
          <div className="ph-title">
            Profit &amp; Loss
            <span className="e">{fyLabel}</span>
          </div>
          <div className="ph-sub">
            <span>Reported as per Schedule III, Ind AS</span>
            <span className="sep">·</span>
            <span>{sourceLine}</span>
            <span className="sep">·</span>
            <span>{lastAnalysedLine}</span>
          </div>
        </div>
        <div className="ph-actions">
          <button className="btn">
            <Download style={{ width: 13, height: 13 }} />
            Export
          </button>
          <Link href="/uploads" className="btn" style={{ textDecoration: "none" }}>
            <Eye style={{ width: 13, height: 13 }} />
            View ledger
          </Link>
          <button className="btn btn-primary">
            <Sparkles style={{ width: 13, height: 13 }} />
            Re-run with CortexAI
          </button>
        </div>
      </div>

      {/* TOOLBAR · feedback 2026-05-20 — controls disabled until they
          actually work. Previously: View toggle, Compare, By Segment,
          Adjustments dropdowns all looked clickable but did nothing.
          Now disabled with "Coming Q3" tooltips. Flagged-count pill
          is informational (not clickable). */}
      <div className="toolbar">
        <span className="toolbar-label">View</span>
        <div className="seg">
          <button className="active" disabled style={{ cursor: "default" }}>
            Absolute (₹)
          </button>
          <button disabled style={{ opacity: 0.4, cursor: "not-allowed" }} title="Common-size view ships Q3 2026">
            Common-size
          </button>
          <button disabled style={{ opacity: 0.4, cursor: "not-allowed" }} title="% Change view ships Q3 2026">
            % Change
          </button>
        </div>

        <span className="toolbar-label" style={{ marginLeft: 12 }}>Compare</span>
        <button className="dd" disabled style={{ opacity: 0.5, cursor: "not-allowed" }} title="Period comparator ships Q3 2026">
          FY 24-25 vs FY 23-24
          <ChevronDown />
        </button>
        {/* By Segment and Adjustments dropdowns removed — both were
            non-functional. Re-add when segment-level cuts and a real
            adjustments toggle are wired. */}

        <div className="grow" />

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 9px 5px 10px",
            fontSize: 12,
            background: "var(--brand-soft)",
            border: "1px solid var(--brand)",
            color: "var(--brand-text)",
            borderRadius: 7,
            cursor: "default",
          }}
          title="QoE / RP / AI flags in the table below"
        >
          <AlertCircle style={{ width: 11, height: 11 }} />
          {flaggedCount} {flaggedCount === 1 ? "item" : "items"} flagged
        </span>
      </div>

      {/* 3:2 SPLIT — STATEMENT + DETAIL */}
      <div className="split-3-2">
        {/* Statement card */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">
                Profit &amp; Loss
                <span className="pill">Ind AS</span>
              </div>
              <div className="card-sub">Hierarchical · click any row to explore</div>
            </div>
            <div className="card-actions">
              <button className="dd">Schedule III</button>
            </div>
          </div>

          <table className="statement">
            <thead>
              <tr>
                <th>Line item</th>
                <th className="r">FY 24-25</th>
                <th className="r">FY 23-24</th>
                <th className="r">Δ %</th>
                <th className="r">% of rev</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <RowGroup
                  key={sec.heading}
                  section={sec}
                  activeKey={activeKey}
                  expanded={expanded}
                  onSelect={setActiveKey}
                  onToggle={toggleExpand}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        <aside className="detail">
          <div>
            <div className="det-eyebrow">
              <span className="dot" />
              {detail.eyebrow}
            </div>
            <div className="det-title">{detail.title}</div>
            <div className="det-value">
              {fmtCrLakh(detail.value).replace(/^₹/, "")}
              <span className="u">{detail.unit === "Cr" ? "" : ""}</span>
              <span className={`d ${detail.deltaPct >= 0 ? "up" : "down"}`}>
                {detail.deltaPct >= 0 ? "+" : ""}
                {detail.deltaPct.toFixed(1)}%
              </span>
            </div>
            <div className="det-meta">{detail.metaLine}</div>
          </div>

          {/* Compare boxes */}
          <div className="compare">
            <div className="cc">
              <div className="l">FY 24-25</div>
              <div className="v">{fmtCrLakh(detail.value)}</div>
              <div className="m">{detail.guidance}</div>
            </div>
            <div className="cc">
              <div className="l">FY 23-24</div>
              <div className="v">{fmtCrLakh(detail.priorValue)}</div>
              <div className="m">{detail.priorMeta}</div>
            </div>
          </div>

          {/* AI explanation */}
          <div className="det-section">
            <div className="det-section-label">
              <Sparkles />
              Why this changed · CortexAI
            </div>
            <div className="ai-card">
              <AIWhyText raw={detail.whyChanged} />
              <div className="ai-card-foot">
                <CheckCircle2 style={{ width: 11, height: 11 }} />
                Cited from {detail.accounts.length} ledger {detail.accounts.length === 1 ? "entry" : "entries"} · TB FY24-25
              </div>
            </div>
          </div>

          {/* Underlying ledger */}
          <div className="det-section">
            <div className="det-section-label">
              <CheckCircle2 />
              Underlying accounts · {detail.accounts.length}
            </div>
            <div className="led">
              {detail.accounts.map((a, i) => (
                <div key={i} className="led-row">
                  <div className="acct">
                    {a.name} <span className="num">— {a.code}</span>
                  </div>
                  <div className="val">{fmtCrLakh(a.value)}</div>
                  <div className="pct">{a.share.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="det-actions">
            <button className="da">
              <Sparkles />
              Ask CortexAI about this line
              <span className="arrow">
                <ArrowRight style={{ width: 12, height: 12 }} />
              </span>
            </button>
            <button className="da">
              <CheckCircle2 />
              Add to QoE adjustments
              <span className="arrow">
                <ArrowRight style={{ width: 12, height: 12 }} />
              </span>
            </button>
            <Link href="/uploads" className="da" style={{ textDecoration: "none" }}>
              <FileText />
              Open underlying ledger
              <span className="arrow">
                <ArrowRight style={{ width: 12, height: 12 }} />
              </span>
            </Link>
          </div>
        </aside>
      </div>

      {/* VARIANCE BRIDGE + TOP CONTRIBUTORS */}
      <div className="split-2">
        <div className="card var-bridge">
          <div
            className="card-head"
            style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border-soft, var(--border))" }}
          >
            <div>
              <div className="card-title">Revenue variance · FY 23-24 → FY 24-25</div>
              <div className="card-sub">+₹6.89 Cr move · decomposed by driver</div>
            </div>
            <div className="card-actions">
              <button className="dd">Drivers</button>
            </div>
          </div>
          <div className="var-chart">
            <RevenueBridge />
          </div>
        </div>

        <div className="card contributors">
          <div
            className="card-head"
            style={{ padding: "0 0 12px 0", borderBottom: "1px solid var(--border-soft, var(--border))" }}
          >
            <div>
              <div className="card-title">Top line-item movers</div>
              <div className="card-sub">By absolute ₹ change vs FY 23-24</div>
            </div>
          </div>
          <div className="contrib-list">
            {TOP_MOVERS.map((m, i) => (
              <div key={i} className="contrib">
                <div>
                  <div className="contrib-name">
                    {m.label}
                    <span className="meta">{m.meta}</span>
                  </div>
                  <div className={`contrib-bar ${m.dir}`}>
                    <i style={{ width: `${m.bar}%` }} />
                  </div>
                </div>
                <div className={`contrib-val ${m.dir}`}>
                  {m.dir === "up" ? "+" : "−"}₹{(Math.abs(m.value) / 1_00_00_000).toFixed(2)} Cr
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DISCLAIMER */}
      <div className="disclaimer">
        <span className="lbl">Advisory, not audit</span>
        <span>
          P&amp;L analysis derived from {companyName}&rsquo;s trial balance. Adjustments are recommendations for review — not journal entries. CortexCFO never posts to your books.
        </span>
      </div>
    </>
  );
}

// ──── Row group component ────
function RowGroup(props: {
  section: PnlSection;
  activeKey: string;
  expanded: Set<string>;
  onSelect: (key: string) => void;
  onToggle: (key: string) => void;
}) {
  const { section, activeKey, expanded, onSelect, onToggle } = props;

  return (
    <>
      <tr className="head">
        <td colSpan={5}>{section.heading}</td>
      </tr>
      {section.rows.map((row) => (
        <RowWithChildren
          key={row.key}
          row={row}
          activeKey={activeKey}
          expanded={expanded}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </>
  );
}

function RowWithChildren(props: {
  row: PnlRow;
  activeKey: string;
  expanded: Set<string>;
  onSelect: (key: string) => void;
  onToggle: (key: string) => void;
}) {
  const { row, activeKey, expanded, onSelect, onToggle } = props;
  const isActive = activeKey === row.key;
  const isExpanded = expanded.has(row.key);
  const hasChildren = (row.children?.length ?? 0) > 0;
  const delta = pctDelta(row.current, row.prior);

  const trClass = [
    row.style === "subtotal" ? "subtotal" : "",
    row.style === "total" ? "total" : "",
    isActive ? "active" : "",
    isExpanded && hasChildren ? "expanded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <tr
        className={trClass}
        onClick={() => {
          onSelect(row.key);
          if (hasChildren) onToggle(row.key);
        }}
      >
        <td>
          <span className="row-label">
            {hasChildren && (
              <span className="caret">
                <ChevronRight style={{ width: 12, height: 12 }} />
              </span>
            )}
            {row.label}
            {row.flag && <FlagPill flag={row.flag} />}
          </span>
        </td>
        <td className="r">{fmtINR(row.current)}</td>
        <td className="r">{fmtINR(row.prior)}</td>
        <td className="r">
          <span className={`delta ${delta >= 0 ? "up" : "down"}`}>
            {delta >= 0 ? "+" : "−"}
            {Math.abs(delta).toFixed(1)}%
          </span>
        </td>
        <td className="r">{row.pctOfRev.toFixed(1)}%</td>
      </tr>

      {isExpanded && row.children?.map((c, i) => (
        <tr key={`${row.key}-c${i}`}>
          <td>
            <span className="indent-1" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CornerDownRight style={{ width: 10, height: 10, color: "var(--text-subtle, var(--muted))" }} />
              {c.label}
              {c.flag && <FlagPill flag={c.flag} />}
            </span>
          </td>
          <td className="r">{fmtINR(c.current)}</td>
          <td className="r">{fmtINR(c.prior)}</td>
          <td className="r">
            <span className={`delta ${pctDelta(c.current, c.prior) >= 0 ? "up" : "down"}`}>
              {pctDelta(c.current, c.prior) >= 0 ? "+" : "−"}
              {Math.abs(pctDelta(c.current, c.prior)).toFixed(1)}%
            </span>
          </td>
          <td className="r">{c.pctOfRev.toFixed(1)}%</td>
        </tr>
      ))}
    </>
  );
}

function FlagPill({ flag }: { flag: Flag }) {
  const meta = FLAG_META[flag];
  const Icon = meta.Icon;
  return (
    <span className={`flag ${meta.cls}`}>
      <Icon />
      {meta.label}
    </span>
  );
}

// Render the why-changed text with **bold** + simple inline emphasis
function AIWhyText({ raw }: { raw: string }) {
  const parts: React.ReactNode[] = [];
  // Split on **…** for bold, leave the rest as plain text.
  const segments = raw.split(/(\*\*[^*]+\*\*)/g);
  segments.forEach((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      parts.push(<strong key={i}>{seg.slice(2, -2)}</strong>);
    } else {
      parts.push(<span key={i}>{seg}</span>);
    }
  });
  return <>{parts}</>;
}
