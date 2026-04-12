import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  setResult: (result: AnalysisResult, companyName?: string) => void;
  clearResult: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      lastResult: null,
      companyName: "Your Company",
      analysisDate: null,
      hasData: false,

      setResult: (result, companyName) =>
        set({
          lastResult: result,
          companyName: companyName || "Your Company",
          analysisDate: new Date().toISOString(),
          hasData: true,
        }),

      clearResult: () =>
        set({
          lastResult: null,
          companyName: "Your Company",
          analysisDate: null,
          hasData: false,
        }),
    }),
    {
      name: "axiom-analysis",
    }
  )
);
