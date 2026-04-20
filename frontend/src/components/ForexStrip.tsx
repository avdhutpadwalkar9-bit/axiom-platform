"use client";

/**
 * ForexStrip — thin presentational wrapper on top of the shared FxContext.
 *
 * This component no longer fetches anything itself. All rate logic lives
 * in FxProvider (mounted in (app)/layout.tsx) so every consumer reads
 * the same rate table from the same session fetch. Kills the triple-
 * fetch / rate-drift problem we had when each page loaded its own.
 */

import { Loader2, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import type { Currency } from "@/lib/currency";
import { CURRENCIES } from "@/lib/currency";
import { formatRate, pairRate } from "@/lib/fx";
import { useFx } from "@/context/FxContext";

interface ForexStripProps {
  base: Currency;
  compact?: boolean;
  className?: string;
}

export default function ForexStrip({ base, compact = false, className = "" }: ForexStripProps) {
  const { rates, loading, error, asOf } = useFx();

  if (loading && !rates) {
    return (
      <div className={`inline-flex items-center gap-2 text-[11px] text-app-text-subtle ${className}`}>
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading FX…
      </div>
    );
  }

  if (error && !rates) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[11px] text-app-text-subtle ${className}`}
        title={error}
      >
        <AlertCircle className="w-3 h-3" />
        FX unavailable
      </div>
    );
  }

  if (!rates) return null;

  // Derive the rate FROM the user's base TO each other currency via USD.
  const others = CURRENCIES.map((c) => c.code).filter((c) => c !== base);

  return (
    <div className={`inline-flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className="text-[10px] text-app-text-subtle uppercase tracking-[0.12em] font-semibold pr-1">
        Live FX &middot; 1 {base} =
      </span>
      {others.map((code) => {
        const rate = pairRate(base, code, rates);
        if (!Number.isFinite(rate)) return null;
        const stronger = rate < 1;
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
      {!compact && asOf && (
        <span className="text-[10px] text-app-text-subtle pl-1" title="ECB reference rate, end-of-day">
          &middot; as of {asOf}
        </span>
      )}
    </div>
  );
}
