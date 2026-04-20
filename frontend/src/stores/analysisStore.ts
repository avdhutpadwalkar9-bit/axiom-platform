import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/currency";
import type { FxRates } from "@/lib/fx";

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
  // FX rate snapshot captured at upload time. Locks the conversion for
  // THIS analysis so switching display currency a week later doesn't
  // give different numbers than switching it yesterday — reproducible
  // reporting is non-negotiable for investor/board-facing QoE reports.
  // Null means "use live rates" (legacy analyses, or demo mode).
  exchangeRates: FxRates | null;

  setResult: (
    result: AnalysisResult,
    companyName?: string,
    sourceCurrency?: Currency,
    exchangeRates?: FxRates | null,
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
      exchangeRates: null,

      setResult: (result, companyName, sourceCurrency, exchangeRates) =>
        set({
          lastResult: result,
          companyName: companyName || "Your Company",
          analysisDate: new Date().toISOString(),
          hasData: true,
          // Fallback to null (= interpret as current display currency)
          // if caller didn't pass it. Every upload site should pass it.
          sourceCurrency: sourceCurrency ?? null,
          // Null when caller didn't pass a snapshot — consumer falls
          // back to live rates in that case. Every new upload should
          // pass the current FxContext rates so reporting stays
          // reproducible independent of when the report is re-opened.
          exchangeRates: exchangeRates ?? null,
        }),

      clearResult: () =>
        set({
          lastResult: null,
          companyName: "Your Company",
          analysisDate: null,
          hasData: false,
          sourceCurrency: null,
          exchangeRates: null,
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
      // Accept persisted state from ANY earlier version — we only ever
      // added fields (sourceCurrency, exchangeRates) and `merge` above
      // fills the gaps from current defaults. Without this, Zustand
      // drops state on version mismatch and users lose their last
      // analysis silently.
      migrate: (persisted) => persisted as AnalysisState,
    }
  )
);
