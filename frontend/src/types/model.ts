export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface FinancialModel {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  start_date: string;
  period_count: number;
  period_type: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  model_id: string;
  name: string;
  section_type: string | null;
  sort_order: number;
  statement: string | null;
  created_at: string;
}

export interface Variable {
  id: string;
  model_id: string;
  section_id: string | null;
  name: string;
  slug: string;
  variable_type: "input" | "formula" | "summary";
  data_type: "currency" | "number" | "percentage";
  formula: string | null;
  default_value: number | null;
  sort_order: number;
  is_cumulative: boolean;
  created_at: string;
}

export interface Scenario {
  id: string;
  model_id: string;
  name: string;
  is_base: boolean;
  color: string | null;
  created_at: string;
}

export interface CellValue {
  variable_id: string;
  scenario_id: string;
  period_index: number;
  value: number | null;
  is_override: boolean;
}

export interface ComputeResult {
  scenario_id: string;
  period_count: number;
  start_date: string;
  values: Record<string, Record<number, number>>;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
