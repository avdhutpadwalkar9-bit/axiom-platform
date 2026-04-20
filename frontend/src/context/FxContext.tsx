"use client";

/**
 * FxProvider — single source of FX rates for the whole authenticated app.
 *
 * Architecture decision: we fetch ONCE per session from api.frankfurter.app
 * (USD base, all supported currencies) and hold the result in React context.
 * Every component that needs conversion or formatting reads from this
 * context via `useFx()`. This kills three classes of bug that existed
 * when each component had its own fetch:
 *
 *   1. Rate drift across pages (Dashboard loaded 10:00:00, QoE loaded
 *      10:12:15, Analysis loaded 10:18:42 → three different rates, so
 *      the same source number displays differently on each page).
 *   2. N fetches on navigation (every page re-fetches on mount).
 *   3. Waterfall loading states (each page starts with a "loading FX…"
 *      flicker).
 *
 * Cache layering:
 *   - sessionStorage (10 min TTL) — survives page navs within a tab.
 *   - In-memory context — shared across every page in the tree.
 *   - Refresh policy: stale-while-revalidate at 10 min. We return the
 *     cached value immediately AND kick off a background refetch.
 *
 * Error policy: if the remote fetch fails and we have NO cached data,
 * `rates = null` + `error = "…"`. Components should render a graceful
 * fallback (render values in source currency without conversion, show
 * a small "FX unavailable" hint). We do NOT block the whole app on FX.
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Currency, DEFAULT_CURRENCY } from "@/lib/currency";
import { convertAmount, fetchLiveRates, FxRates, safeConvert } from "@/lib/fx";

const CACHE_KEY = "cortexcfo-fx-usd-base";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface FxContextValue {
  rates: FxRates | null;
  loading: boolean;
  error: string | null;
  // Current as-of date from the rate source ("YYYY-MM-DD"), or null.
  asOf: string | null;
  /** Convert using the live rate table. Returns NaN if unavailable. */
  convert: (amount: number, from: Currency, to: Currency) => number;
  /** Convert but fall back to the source amount if rates are missing.
   * Safer for display paths that should never show "NaN". */
  convertSafe: (amount: number, from: Currency, to: Currency) => number;
  /** Force a refetch (e.g. after user clicks "refresh rates"). */
  refetch: () => Promise<void>;
}

const FxContext = createContext<FxContextValue | null>(null);

export function FxProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<FxRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AbortController for the in-flight request. Prevents racey state
  // updates if the user triggers refetch() while the initial request
  // is still going.
  const inFlightRef = useRef<AbortController | null>(null);

  const loadFromCache = useCallback((): FxRates | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { t: number; v: FxRates };
      if (Date.now() - parsed.t < CACHE_TTL_MS) return parsed.v;
      return null;
    } catch {
      return null;
    }
  }, []);

  const writeCache = useCallback((v: FxRates) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v }));
    } catch {
      /* quota / disabled */
    }
  }, []);

  const fetchFresh = useCallback(async () => {
    // Cancel any in-flight request before starting a new one.
    inFlightRef.current?.abort();
    const ctrl = new AbortController();
    inFlightRef.current = ctrl;
    try {
      const fresh = await fetchLiveRates(ctrl.signal);
      if (ctrl.signal.aborted) return;
      setRates(fresh);
      setError(null);
      writeCache(fresh);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      const msg = e instanceof Error ? e.message : "FX fetch failed";
      // Only surface the error if we have NO rates at all — if we
      // already have a cached table the user sees consistent numbers
      // and doesn't need to know a background refresh failed.
      setError((prev) => {
        // Keep showing rates if we have them; flag error for debugging.
        return prev ?? msg;
      });
      console.warn("[FxProvider] fetch failed:", msg);
    } finally {
      setLoading(false);
    }
  }, [writeCache]);

  // Initial load: show cached value immediately if fresh, then do a
  // background refetch. This is the classic stale-while-revalidate.
  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setRates(cached);
      setLoading(false);
    }
    // Fire the network request regardless — either to hydrate the
    // empty cache or to refresh a stale one.
    void fetchFresh();
    return () => {
      inFlightRef.current?.abort();
    };
  }, [loadFromCache, fetchFresh]);

  const value = useMemo<FxContextValue>(
    () => ({
      rates,
      loading,
      error,
      asOf: rates?.asOf ?? null,
      convert: (amount, from, to) => convertAmount(amount, from, to, rates),
      convertSafe: (amount, from, to) => safeConvert(amount, from, to, rates),
      refetch: fetchFresh,
    }),
    [rates, loading, error, fetchFresh],
  );

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

/**
 * Access FX rates + conversion helpers. Must be called from a
 * component rendered inside <FxProvider>. Returns a no-op value if
 * the provider is missing so individual page renders don't crash
 * during SSR or in tests — but conversion yields NaN without a
 * provider, which would surface as "—" in UI.
 */
export function useFx(): FxContextValue {
  const ctx = useContext(FxContext);
  if (ctx) return ctx;
  // Fallback that behaves like "rates unavailable". Never throws.
  return {
    rates: null,
    loading: true,
    error: null,
    asOf: null,
    convert: (amount, from, to) => (from === to ? amount : NaN),
    convertSafe: (amount) => amount,
    refetch: async () => {
      /* no-op */
    },
  };
}

// Re-export Currency so consumers can import it from this module
// if they already import useFx — one-stop shop for the conversion API.
export type { Currency };
export { DEFAULT_CURRENCY };
