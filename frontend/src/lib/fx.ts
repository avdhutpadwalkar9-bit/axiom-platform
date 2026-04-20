/**
 * FX conversion primitives.
 *
 * Everything currency-pair-math lives here so UI components never do
 * conversion arithmetic inline. The live-rate fetching + caching lives
 * in FxContext (one source of truth for a session); this file is the
 * pure side: types + conversion functions, no side effects.
 *
 * Rate representation (normalized to USD base):
 *   rates[USD] = 1
 *   rates[EUR] = 0.91  (1 USD = 0.91 EUR)
 *   rates[INR] = 83.2  (1 USD = 83.2 INR)
 *   ...
 * Converting FROM → TO is always done via USD: (amount / rates[FROM]) * rates[TO].
 * The triangulation introduces tiny rounding error but it's bounded
 * and consistent, and means we only need ONE base-currency fetch per
 * session (instead of N² pair fetches).
 */

import type { Currency } from "./currency";
import { CURRENCIES } from "./currency";

// Normalized USD-base rate table. `rates.USD === 1` always.
export interface FxRates {
  base: "USD";
  rates: Record<Currency, number>;
  asOf: string; // "YYYY-MM-DD" from the source
}

/**
 * Convert an amount from one currency to another using the USD-base
 * rate table. Handles the no-op (same currency) case without touching
 * the rate table so a missing/loading table doesn't block display.
 *
 * Returns NaN if either currency isn't in the rate table — callers
 * should render "—" or similar in that case.
 */
export function convertAmount(
  amount: number,
  from: Currency,
  to: Currency,
  rates: FxRates | null | undefined,
): number {
  if (!Number.isFinite(amount)) return NaN;
  if (from === to) return amount;
  if (!rates) return NaN;
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  if (!fromRate || !toRate) return NaN;
  // Route via USD: amount_in_usd = amount / fromRate;
  //                amount_in_to  = amount_in_usd * toRate.
  return (amount / fromRate) * toRate;
}

/** Safe convert — returns the original amount if the rate table is
 * missing or the currencies aren't covered. Use for display when you
 * would rather show the source-currency value than nothing. */
export function safeConvert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: FxRates | null | undefined,
): number {
  const out = convertAmount(amount, from, to, rates);
  return Number.isFinite(out) ? out : amount;
}

/**
 * Fetch live rates from api.frankfurter.app (ECB reference rates,
 * free, no API key, no CORS). Returns a normalized USD-base table.
 *
 * We always request base=USD so the resulting table is directly
 * triangulatable. Timeout at 5s; on failure caller should decide
 * whether to fall back to cached data or render "FX unavailable".
 */
export async function fetchLiveRates(signal?: AbortSignal): Promise<FxRates> {
  const targets = CURRENCIES.map((c) => c.code).filter((c) => c !== "USD");
  const url = `https://api.frankfurter.app/latest?base=USD&symbols=${targets.join(",")}`;
  const res = await fetch(url, {
    signal: signal ?? AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const raw = (await res.json()) as {
    base: string;
    date: string;
    rates: Record<string, number>;
  };
  // Assemble the normalized table — USD is 1 by definition, plus each
  // target currency at the rate returned.
  const rates: Record<Currency, number> = {
    USD: 1,
    EUR: Number(raw.rates?.EUR) || NaN,
    GBP: Number(raw.rates?.GBP) || NaN,
    INR: Number(raw.rates?.INR) || NaN,
    JPY: Number(raw.rates?.JPY) || NaN,
  };
  return { base: "USD", rates, asOf: raw.date };
}

/** Pretty-print a 1:X rate for UI pills, e.g. "0.9140" / "83.21". */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 10) return rate.toFixed(3);
  return rate.toFixed(4);
}

/** Derive the rate between two arbitrary currencies from a USD-base table. */
export function pairRate(
  from: Currency,
  to: Currency,
  rates: FxRates | null | undefined,
): number {
  if (from === to) return 1;
  if (!rates) return NaN;
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  if (!fromRate || !toRate) return NaN;
  return toRate / fromRate;
}

/**
 * Deep-convert the currency-valued fields of an AnalysisResult from
 * one currency to another. Used before sending the result to the AI
 * so the model reads numbers in the same denomination the user is
 * looking at on screen — otherwise it would report "$15M" when the
 * user sees "$180K".
 *
 * Only touches fields known to be money: financial_statements,
 * ratios.working_capital, classified_accounts[*].{debit,credit,net}.
 * Ratios that are percentages / multiples (current_ratio,
 * debt_to_equity, gross_margin, net_margin, return_on_equity) are
 * unitless and left alone.
 *
 * Returns a SHALLOW-cloned result; caller can safely mutate or pass
 * further without affecting the original store value.
 */
// Minimal shape needed for conversion — a permissive subset of the
// analysis-store AnalysisResult type. Typed here so this file stays
// free of a circular dep on the store.
interface ConvertableAnalysis {
  financial_statements?: Record<string, number | undefined>;
  ratios?: Record<string, number | undefined>;
  classified_accounts?: Record<
    string,
    Array<{ debit: number; credit: number; net: number; [k: string]: unknown }>
  >;
  [key: string]: unknown;
}

export function convertAnalysisResult<T extends ConvertableAnalysis>(
  result: T,
  from: Currency,
  to: Currency,
  rates: FxRates | null | undefined,
): T {
  if (from === to || !rates) return result;
  const conv = (v: number | undefined): number => {
    if (v == null || !Number.isFinite(v)) return v ?? 0;
    return convertAmount(v, from, to, rates);
  };

  const fs = result.financial_statements ?? {};
  const ratios = result.ratios ?? {};
  const ca = result.classified_accounts ?? {};

  const convertedCA: Record<
    string,
    Array<{ debit: number; credit: number; net: number; [k: string]: unknown }>
  > = {};
  for (const [bucket, items] of Object.entries(ca)) {
    convertedCA[bucket] = items.map((row) => ({
      ...row,
      debit: conv(row.debit),
      credit: conv(row.credit),
      net: conv(row.net),
    }));
  }

  return {
    ...result,
    financial_statements: {
      ...fs,
      total_assets: conv(fs.total_assets),
      total_liabilities: conv(fs.total_liabilities),
      total_equity: conv(fs.total_equity),
      total_revenue: conv(fs.total_revenue),
      total_expenses: conv(fs.total_expenses),
      net_income: conv(fs.net_income),
    },
    ratios: {
      ...ratios,
      // Only working_capital is a currency amount. Everything else is
      // a ratio / percentage, unitless.
      working_capital: conv(ratios.working_capital),
    },
    classified_accounts: convertedCA,
  } as T;
}
