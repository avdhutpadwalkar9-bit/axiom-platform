"use client";

/**
 * useFormat — unified "display a number as currency" hook.
 *
 * Combines three sources of truth that every page needed to juggle
 * separately before:
 *   1. Source currency — what the raw number actually represents
 *      (from analysisStore.sourceCurrency, falling back to the
 *      user's display currency at upload time).
 *   2. Display currency — what the user wants to see (from
 *      onboardingStore.business.currency).
 *   3. Live FX rates — from FxContext.
 *
 * Returns a `fmt()` function that takes a raw number and produces
 * the user-visible string, doing conversion along the way.
 *
 *   const { fmt } = useFormat();
 *   <p>{fmt(lastResult.total_revenue)}</p>
 *   // → "$180K" if source=INR, display=USD, raw=15_000_000, rate=83.2
 *   // → "₹1.50 Cr" if source=INR, display=INR
 *
 * "Don't keep anything local" — no more per-page makeFmt closures
 * holding their own currency parameter; no more `fmt(value, currency)`
 * call sites leaking the currency choice throughout each component.
 */

import { useCallback, useMemo } from "react";

import {
  asCurrency,
  Currency,
  fmt as fmtCurrency,
  fmtFull as fmtFullCurrency,
  fmtNum as fmtNumCurrency,
  regionFromCurrency,
  symbol as currencySymbol,
  type Region,
} from "@/lib/currency";
import { useFx } from "@/context/FxContext";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

export interface UseFormatResult {
  /** Compact display (e.g. "$1.50M"). Converts source → display. */
  fmt: (value: number | null | undefined) => string;
  /** Intl full-form display (e.g. "$1,500,000"). Converts too. */
  fmtFull: (value: number | null | undefined, opts?: { fractionDigits?: number }) => string;
  /** Number with locale grouping, no currency symbol. */
  fmtNum: (value: number | null | undefined, opts?: { fractionDigits?: number }) => string;
  /** Raw converter — returns the numeric amount in display currency. */
  convert: (value: number) => number;
  /** True if source !== display AND live rates are loaded. Useful for
   * showing a subtle "converted from X" indicator. */
  isConverting: boolean;
  /** True while live rates are still loading on first paint. */
  fxLoading: boolean;
  sourceCurrency: Currency;
  displayCurrency: Currency;
  /** Internal region ("US" | "IN") derived from display currency. */
  region: Region;
  currencySymbol: string;
}

export function useFormat(): UseFormatResult {
  const { business } = useOnboardingStore();
  const source = useAnalysisStore((s) => s.sourceCurrency);
  const { convertSafe, loading: fxLoading, rates } = useFx();

  const displayCurrency = asCurrency(business?.currency);
  // If the analysis store doesn't know the source currency (fresh install,
  // legacy persisted data), assume the raw numbers are in the user's
  // currently-displayed currency — no conversion needed, just formatting.
  const sourceCurrency = asCurrency(source ?? displayCurrency);

  const convert = useCallback(
    (value: number) => convertSafe(value, sourceCurrency, displayCurrency),
    [convertSafe, sourceCurrency, displayCurrency],
  );

  const fmt = useCallback(
    (value: number | null | undefined): string => {
      if (value == null || Number.isNaN(value)) return "—";
      return fmtCurrency(convert(value), displayCurrency);
    },
    [convert, displayCurrency],
  );

  const fmtFull = useCallback(
    (value: number | null | undefined, opts?: { fractionDigits?: number }): string => {
      if (value == null || Number.isNaN(value)) return "—";
      return fmtFullCurrency(convert(value), displayCurrency, opts);
    },
    [convert, displayCurrency],
  );

  const fmtNum = useCallback(
    (value: number | null | undefined, opts?: { fractionDigits?: number }): string => {
      if (value == null || Number.isNaN(value)) return "—";
      return fmtNumCurrency(convert(value), displayCurrency, opts);
    },
    [convert, displayCurrency],
  );

  return useMemo<UseFormatResult>(
    () => ({
      fmt,
      fmtFull,
      fmtNum,
      convert,
      isConverting: sourceCurrency !== displayCurrency && rates !== null,
      fxLoading,
      sourceCurrency,
      displayCurrency,
      region: regionFromCurrency(displayCurrency),
      currencySymbol: currencySymbol(displayCurrency),
    }),
    [fmt, fmtFull, fmtNum, convert, sourceCurrency, displayCurrency, fxLoading, rates],
  );
}
