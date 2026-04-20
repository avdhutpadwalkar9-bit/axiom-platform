import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/currency";

interface FinancialStatements {
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_revenue: number;
  total_expenses: number;
  net_income: number;
}

interface Ratios {
  current_ratio: number;
  debt_to_equity: number;
  gross_margin: number;
  net_margin: number;
  return_on_equity: number;
  working_capital: number;
}

// Per-ratio status so the dashboard can render "—" + a tooltip instead of
// a silent 0 when a denominator is missing or the account wasn't present.
// The legacy `ratios` bag is still populated (mirroring `.value`), so
// existing consumers don't break — only the dashboard opts into the new
// shape today.
export type RatioStatus = "ok" | "not_computable";
export interface RatioMeta {
  value: number;
  status: RatioStatus;
  reason?: string;
}
export interface RatiosMeta {
  current_ratio: RatioMeta;
  debt_to_equity: RatioMeta;
  gross_margin: RatioMeta;
  net_margin: RatioMeta;
  return_on_equity: RatioMeta;
  working_capital: RatioMeta;
}

export interface Completeness {
  computed: number;
  total: number;
  pct: number;
}

// Source type of the uploaded file — drives downstream behaviour. Defaults
// to "TB" because that's the only path shipping today. Parsers for audited
// financials, general ledgers, standalone P&Ls etc. will set their own.
export type InputMode =
  | "TB"
  | "AUDITED"
  | "GL"
  | "PNL_ONLY"
  | "BS_ONLY"
  | "MIS"
  | "SIMPLE";

interface AccountItem {
  name: string;
  code: string;
  debit: number;
  credit: number;
  net: number;
  sub_group: string;
}

interface Insight {
  category: string;
  title: string;
  detail: string;
  action: string;
  severity: string;
}

interface IndASObservation {
  standard: string;
  observation: string;
  severity: string;
}

interface AIQuestion {
  question: string;
  reason: string;
}

interface Warning {
  severity: string;
  title: string;
  detail: string;
}

export interface AnalysisResult {
  summary: {
    total_debit: number;
    total_credit: number;
    is_balanced: boolean;
    variance: number;
  };
  financial_statements: FinancialStatements;
  ratios: Ratios;
  // Optional because old persisted analyses in localStorage predate this
  // field. New analyses from the backend always include it.
  ratios_meta?: RatiosMeta;
  completeness?: Completeness;
  input_mode?: InputMode;
  classified_accounts: {
    assets: AccountItem[];
    liabilities: AccountItem[];
    equity: AccountItem[];
    revenue: AccountItem[];
    expenses: AccountItem[];
  };
  ind_as_observations: IndASObservation[];
  ai_questions: AIQuestion[];
  insights: Insight[];
  warnings: Warning[];
}

interface AnalysisState {
  lastResult: AnalysisResult | null;
  companyName: string;
  analysisDate: string | null;
  hasData: boolean;
  // The currency the raw numbers in `lastResult` are denominated in.
  // Stamped at upload time from the user's then-current reporting
  // currency. When null, consumers treat the data as being in the
  // user's CURRENT reporting currency (no conversion). Stored so
  // flipping the reporting currency afterwards runs proper FX
  // conversion rather than just swapping the symbol.
  sourceCurrency: Currency | null;

  setResult: (
    result: AnalysisResult,
    companyName?: string,
    sourceCurrency?: Currency,
  ) => void;
  clearResult: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      lastResult: null,
      companyName: "Your Company",
      analysisDate: null,
      hasData: false,
      sourceCurrency: null,

      setResult: (result, companyName, sourceCurrency) =>
        set({
          lastResult: result,
          companyName: companyName || "Your Company",
          analysisDate: new Date().toISOString(),
          hasData: true,
          // Fallback to null (= interpret as current display currency)
          // if caller didn't pass it. Every upload site should pass it.
          sourceCurrency: sourceCurrency ?? null,
        }),

      clearResult: () =>
        set({
          lastResult: null,
          companyName: "Your Company",
          analysisDate: null,
          hasData: false,
          sourceCurrency: null,
        }),
    }),
    {
      name: "cortexcfo-analysis",
      version: 2,
      // Deep merge so old persisted blobs without sourceCurrency get
      // it as null (which the hook treats as "no conversion needed").
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AnalysisState>),
      }),
    }
  )
);
