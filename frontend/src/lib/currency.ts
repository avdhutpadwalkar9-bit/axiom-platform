/**
 * Currency + region helpers.
 *
 * CortexCFO now supports five currencies chosen during profile setup:
 *   USD · EUR · GBP · INR · JPY
 * These cover ~90% of global SMB transaction volume. Adding a sixth
 * (CAD / AUD / CHF / CNY) is one entry in CURRENCIES below + one
 * entry in the locale / fmt maps.
 *
 * The broader `Region` axis ("US" | "IN") stays — it drives the AI
 * voice, FAQ filtering and regulatory framework. Currency is UI-only.
 * Today we derive region from currency:
 *   INR → IN   (Indian founder, Ind AS, Lakh/Crore voice)
 *   other → US (US SMB, GAAP, $K/$M voice)
 * Once we author EU / UK / JP regulatory FAQs we split region further.
 */

export type Currency = "USD" | "EUR" | "GBP" | "INR" | "JPY";
export type Region = "US" | "IN";

export const DEFAULT_CURRENCY: Currency = "USD";
export const DEFAULT_REGION: Region = "US";

// Ordered list for UI pickers. The first entry is the default pick.
export const CURRENCIES: Array<{
  code: Currency;
  symbol: string;
  name: string;
  country: string;
  // Natural locale string to hand to Intl.NumberFormat.
  locale: string;
}> = [
  { code: "USD", symbol: "$", name: "US Dollar", country: "United States", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", country: "Eurozone", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", country: "United Kingdom", locale: "en-GB" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", country: "India", locale: "en-IN" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", country: "Japan", locale: "ja-JP" },
];

const BY_CODE: Record<Currency, (typeof CURRENCIES)[number]> = CURRENCIES.reduce(
  (acc, c) => {
    acc[c.code] = c;
    return acc;
  },
  {} as Record<Currency, (typeof CURRENCIES)[number]>,
);

export function symbol(currency: Currency = DEFAULT_CURRENCY): string {
  return BY_CODE[currency]?.symbol ?? "$";
}

export function locale(currency: Currency = DEFAULT_CURRENCY): string {
  return BY_CODE[currency]?.locale ?? "en-US";
}

export function currencyName(currency: Currency = DEFAULT_CURRENCY): string {
  return BY_CODE[currency]?.name ?? currency;
}

/**
 * Convert a Currency back to the backend's Region vocabulary.
 *   INR → IN   (Indian AI voice, Indian FAQ bank)
 *   others → US (default voice, US FAQ bank)
 */
export function regionFromCurrency(currency: Currency | undefined | null): Region {
  return currency === "INR" ? "IN" : "US";
}

/**
 * Narrow a loose string to Currency. API responses / store hydration
 * paths go through this so a stale or malformed value collapses to
 * the default rather than propagating as `undefined`.
 */
export function asCurrency(value: string | null | undefined): Currency {
  switch (value) {
    case "USD":
    case "EUR":
    case "GBP":
    case "INR":
    case "JPY":
      return value;
    default:
      return DEFAULT_CURRENCY;
  }
}

/**
 * Kept for back-compat with old `region`-based callers. Takes a region
 * and returns the natural currency for that region.
 */
export function asRegion(value: string | null | undefined): Region {
  return value === "IN" ? "IN" : "US";
}

/**
 * Compact short-form currency. Business-friendly sizing:
 *   USD / EUR / GBP / JPY — ≥1M → "$1.50M", ≥1K → "$1.5K", else "$999"
 *   INR — ≥1 Cr → "₹1.50 Cr", ≥1 L → "₹1.50 L", ≥1 K → "₹1.5K"
 *
 * Negative values render with a leading "-" before the symbol.
 * Passing `Region` instead of `Currency` is supported for migration
 * ergonomics — the old call sites still work.
 */
export function fmt(
  value: number | null | undefined,
  currencyOrRegion: Currency | Region | undefined | null = DEFAULT_CURRENCY,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const currency = _toCurrency(currencyOrRegion);
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const sym = symbol(currency);

  if (currency === "INR") {
    if (abs >= 10_000_000) return `${sign}${sym}${(abs / 10_000_000).toFixed(2)} Cr`;
    if (abs >= 100_000) return `${sign}${sym}${(abs / 100_000).toFixed(2)} L`;
    if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}K`;
    return `${sign}${sym}${abs.toFixed(0)}`;
  }

  // JPY is traditionally rendered without decimals even at small amounts.
  if (currency === "JPY") {
    if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}K`;
    return `${sign}${sym}${Math.round(abs).toLocaleString("ja-JP")}`;
  }

  // USD / EUR / GBP share the same M/K convention.
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${sym}${abs.toFixed(0)}`;
}

/** Intl-based full-form currency for tables + exports. */
export function fmtFull(
  value: number | null | undefined,
  currencyOrRegion: Currency | Region | undefined | null = DEFAULT_CURRENCY,
  opts: { fractionDigits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const currency = _toCurrency(currencyOrRegion);
  // JPY conventionally has no decimals. Everyone else defaults to 0 for
  // dashboards; callers that want cents pass fractionDigits: 2.
  const defaultFrac = currency === "JPY" ? 0 : 0;
  const { fractionDigits = defaultFrac } = opts;
  try {
    return new Intl.NumberFormat(locale(currency), {
      style: "currency",
      currency,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return `${symbol(currency)}${value.toFixed(fractionDigits)}`;
  }
}

/** Plain number with region-appropriate grouping. */
export function fmtNum(
  value: number | null | undefined,
  currencyOrRegion: Currency | Region | undefined | null = DEFAULT_CURRENCY,
  opts: { fractionDigits?: number } = {},
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const currency = _toCurrency(currencyOrRegion);
  const { fractionDigits = 0 } = opts;
  try {
    return new Intl.NumberFormat(locale(currency), {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value);
  } catch {
    return value.toFixed(fractionDigits);
  }
}

// Internal: accept either a Currency code or a legacy Region tag so
// every existing `fmt(value, "US")` call site keeps working.
function _toCurrency(value: Currency | Region | undefined | null): Currency {
  if (value === "IN") return "INR";
  if (value === "US") return "USD";
  switch (value) {
    case "USD":
    case "EUR":
    case "GBP":
    case "INR":
    case "JPY":
      return value;
    default:
      return DEFAULT_CURRENCY;
  }
}

export { _toCurrency as toCurrency };

export function currencyCode(currency: Currency = DEFAULT_CURRENCY): Currency {
  return currency;
}
