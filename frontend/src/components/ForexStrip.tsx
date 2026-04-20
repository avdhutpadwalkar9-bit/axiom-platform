"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import type { Currency } from "@/lib/currency";
import { CURRENCIES } from "@/lib/currency";

/**
 * Live FX rates, base = the user's chosen currency.
 *
 * Source: api.frankfurter.app — ECB-sourced, free, no API key, no CORS
 * issues. Rates update once per business day (~16:00 CET). Good enough
 * for a "real-time" dashboard banner; finance users expect EOD rates
 * as the honest signal, not bid-ask tick streams.
 *
 * Caching: results live in sessionStorage for 10 minutes. Stops us
 * from refetching on every page nav while the user pokes around. A
 * silent background revalidation would be nice later — not worth the
 * complexity on v1.
 *
 * Failure behaviour: on any network / parse / CORS error we render a
 * muted "FX unavailable" chip instead of the rates. Never blocks the
 * dashboard.
 */

const CACHE_KEY_PREFIX = "cortexcfo-fx-";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface FxRates {
  base: Currency;
  date: string; // "YYYY-MM-DD" from the API
  rates: Partial<Record<Currency, number>>;
}

interface ForexStripProps {
  base: Currency;
  // Compact mode hides the "As of <date>" footer for tight spaces.
  compact?: boolean;
  className?: string;
}

export default function ForexStrip({ base, compact = false, className = "" }: ForexStripProps) {
  const [data, setData] = useState<FxRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    // Cache lookup first — instant paint if we have fresh data.
    const cacheKey = `${CACHE_KEY_PREFIX}${base}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { t: number; v: FxRates };
        if (Date.now() - parsed.t < CACHE_TTL_MS) {
          setData(parsed.v);
          setLoading(false);
          return;
        }
      }
    } catch {
      /* sessionStorage unavailable (SSR) or corrupted — fall through to fetch */
    }

    const others = CURRENCIES.map((c) => c.code).filter((c) => c !== base);
    const url = `https://api.frankfurter.app/latest?base=${base}&symbols=${others.join(",")}`;

    fetch(url, { signal: AbortSignal.timeout(5000) })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: { base: string; date: string; rates: Record<string, number> }) => {
        if (cancelled) return;
        const typedRates: Partial<Record<Currency, number>> = {};
        for (const code of others) {
          if (typeof j.rates?.[code] === "number") {
            typedRates[code] = j.rates[code];
          }
        }
        const next: FxRates = { base, date: j.date, rates: typedRates };
        setData(next);
        setLoading(false);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), v: next }));
        } catch {
          /* quota / disabled — not critical */
        }
      })
      .catch((e) => {
        if (cancelled) return;
        // Timeout / CORS / 5xx / DNS — rendered as a single chip, not
        // a loud banner. Finance users read "FX unavailable" and move
        // on; they don't need our stack trace.
        console.warn("[ForexStrip] fetch failed:", e);
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [base]);

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 text-[11px] text-app-text-subtle ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading FX…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] text-app-text-subtle ${className}`}
        title="Live FX temporarily unavailable"
      >
        <AlertCircle className="w-3 h-3" />
        FX unavailable
      </div>
    );
  }

  // Show the four other currencies as compact pills. Up-arrow if the
  // rate > 1 (1 base unit is worth more than 1 unit of the other
  // currency — our base is "stronger"); down-arrow otherwise.
  const entries = Object.entries(data.rates) as Array<[Currency, number]>;

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="text-[10px] text-app-text-subtle uppercase tracking-[0.12em] font-semibold pr-1">
        Live FX · 1 {base} =
      </span>
      {entries.map(([code, rate]) => {
        const stronger = rate < 1; // base is "weaker" if we need <1 unit of the other
        return (
          <span
            key={code}
            className="inline-flex items-center gap-1 text-[11px] font-medium bg-app-card-hover border border-app-border rounded-full px-2 py-0.5 text-app-text-muted hover:border-emerald-500/40 hover:text-app-text transition-colors"
            title={`1 ${base} = ${rate.toFixed(4)} ${code}`}
          >
            {stronger ? (
              <TrendingDown className="w-2.5 h-2.5 text-rose-400" />
            ) : (
              <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
            )}
            <span className="font-mono tabular-nums">{formatRate(rate)}</span>
            <span className="text-app-text-subtle">{code}</span>
          </span>
        );
      })}
      {!compact && (
        <span
          className="text-[10px] text-app-text-subtle pl-1"
          title="ECB reference rate, end-of-day"
        >
          · as of {data.date}
        </span>
      )}
    </div>
  );
}

/** Format the FX rate compactly — keep the "money-y" feel but not
 * over-precise. Large rates (JPY against everything) get integers,
 * small ones (EUR/GBP against USD) get 4 decimals, mid-range (INR)
 * gets 2 decimals. */
function formatRate(rate: number): string {
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 10) return rate.toFixed(3);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(4);
}
