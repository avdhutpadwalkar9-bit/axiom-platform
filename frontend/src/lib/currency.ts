/**
 * Region-aware currency + number formatting.
 *
 * CortexCFO serves two regions today:
 *   - US (default): USD, $, M/K compact suffix, "en-US" locale
 *   - IN: INR, ₹, Cr/L compact suffix, "en-IN" locale
 *
 * Every component that displays a number should go through `fmt()` here
 * so we have a single switch-point when we add another region (EU/GB
 * are the natural next candidates). Hardcoding "$" or "₹" in a
 * component locks that component to one region.
 *
 * Contract:
 *   - `fmt(value, region)` returns a human-friendly short form.
 *     "$4.5M", "₹4.2 Cr", "$25K", "₹45 L", "$999", "₹12,500".
 *   - `fmtFull(value, region)` returns the non-compact form via
 *     Intl.NumberFormat — proper thousands separators + currency symbol.
 *   - `symbol(region)` returns just the currency symbol.
 *   - `locale(region)` returns the BCP-47 locale tag.
 *
 * The `region` argument is typed narrow so TypeScript catches typos.
 * Callers that don't have a region yet (e.g. during SSR or on an
 * unauthenticated surface) should default to "US".
 */

export type Region = "US" | "IN";

export const DEFAULT_REGION: Region = "US";

export function locale(region: Region): string {
  return region === "IN" ? "en-IN" : "en-US";
}

export function symbol(region: Region): string {
  return region === "IN" ? "₹" : "$";
}

export function currencyCode(region: Region): "INR" | "USD" {
  return region === "IN" ? "INR" : "USD";
}

/**
 * Compact short-form currency. Business-friendly sizing:
 *   IN:   ≥1 Cr → "x.xx Cr"; ≥1 L → "x.xx L"; ≥1 K → "x.xK"; else raw
 *   US:   ≥1 M → "$x.xxM"; ≥1 K → "$x.xK"; else "$<n>"
 *
 * Negative values render with a leading "-" before the symbol.
 */
export function fmt(value: number | null | undefined, region: Region = DEFAULT_REGION): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const sym = symbol(region);

  if (region === "IN") {
    if (abs >= 10_000_000) return `${sign}${sym}${(abs / 10_000_000).toFixed(2)} Cr`;
    if (abs >= 100_000) return `${sign}${sym}${(abs / 100_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}K`;
    return `${sign}${sym}${abs.toFixed(0)}`;
  }

  // US / default
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${sym}${abs.toFixed(0)}`;
}

/**
 * Full-form currency via Intl. For tables and places where the reader
 * benefits from exact numbers with thousands separators.
 *
 *   fmtFull(4250000, "US") → "$4,250,000"
 *   fmtFull(4250000, "IN") → "₹42,50,000"  (Indian lakh grouping)
 */
export function fmtFull(
  value: number | null | undefined,
  region: Region = DEFAULT_REGION,
  opts: { fractionDigits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const { fractionDigits = 0 } = opts;
  try {
    return new Intl.NumberFormat(locale(region), {
      style: "currency",
      currency: currencyCode(region),
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    // Fallback if the runtime rejects the locale (shouldn't happen on
    // modern browsers but we've seen edge cases with older Node during
    // SSR). Produce something readable rather than crashing.
    return `${symbol(region)}${value.toFixed(fractionDigits)}`;
  }
}

/**
 * Plain number formatting with region-appropriate grouping.
 *   fmtNum(1234567, "US") → "1,234,567"
 *   fmtNum(1234567, "IN") → "12,34,567"
 */
export function fmtNum(
  value: number | null | undefined,
  region: Region = DEFAULT_REGION,
  opts: { fractionDigits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const { fractionDigits = 0 } = opts;
  try {
    return new Intl.NumberFormat(locale(region), {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits);
  }
}

/**
 * Narrow a loose string to Region. Lets API responses that stringly-type
 * region survive without forcing every caller to do the check.
 */
export function asRegion(value: string | null | undefined): Region {
  if (value === "IN") return "IN";
  // Everything else, including "US", null, undefined, or malformed, collapses
  // to the default. Prevents an unexpected region string from propagating.
  return "US";
}
