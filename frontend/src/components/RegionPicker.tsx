"use client";

/**
 * RegionPicker — first-visit soft modal offering a region-specific page.
 *
 * Philosophy: we don't GATE the site behind a picker. The default `/`
 * landing serves everyone; the picker just nudges recognised visitors
 * to the regionally-tailored page:
 *   - America/* timezones  → /us (M&A positioning, USD pricing)
 *   - Asia/Kolkata         → /in (PE positioning, INR pricing, Ind AS)
 *   - everyone else        → no prompt (use default)
 *
 * Storage: the user's choice (dismiss OR "take me to X") lands in
 * localStorage so we don't ask again. 90-day TTL — if someone's
 * circumstances change they get offered again.
 *
 * Geo hint: we pick the default recommendation from the browser's
 * timezone (Intl.DateTimeFormat().resolvedOptions().timeZone). This is
 * a hint, not a lock — easier to implement than geolocation, gives a
 * sensible default, and never asks for permission.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Globe, X, ArrowRight } from "lucide-react";

const LS_KEY = "cortexcfo-region-prompt-v2"; // v2 — now handles IN too
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

type Region = "US" | "IN" | "default";
type Choice = "dismissed" | "chose-us" | "chose-in" | "chose-default";

interface Stored {
  v: Choice;
  t: number;
}

/** Best-guess region from the browser's IANA timezone.
 *
 *  - "US"      if timezone starts with "America/"  (covers US + LATAM;
 *              LATAM visitors can dismiss)
 *  - "IN"      if timezone is "Asia/Kolkata" (the only IANA zone India
 *              actually uses)
 *  - "default" otherwise
 */
function guessRegion(): Region {
  if (typeof Intl === "undefined") return "default";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    if (tz.startsWith("America/")) return "US";
    if (tz === "Asia/Kolkata" || tz === "Asia/Calcutta") return "IN";
  } catch {
    /* resolvedOptions not available in some runtimes */
  }
  return "default";
}

export default function RegionPicker() {
  const [show, setShow] = useState(false);
  const [region, setRegion] = useState<Region>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Stored;
        if (Date.now() - parsed.t < TTL_MS) {
          // User already answered within TTL. Don't bother them again.
          return;
        }
      }
    } catch {
      /* corrupt storage — treat as unseen */
    }
    // Only show to visitors whose timezone guess suggests a region we
    // have a page for. "default" gets the regionally-neutral /.
    const guess = guessRegion();
    if (guess === "default") return;
    setRegion(guess);
    // Small delay so the banner doesn't jank above-the-fold paint.
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const record = (v: Choice) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ v, t: Date.now() }));
    } catch {
      /* quota — non-fatal */
    }
    setShow(false);
  };

  if (!show) return null;

  // Per-region copy. Keep both branches short — the picker is a pill,
  // not a tour.
  const copy =
    region === "US"
      ? {
          headline: "Based in the US?",
          body:
            "We have a page tailored for US SMBs preparing for M&A — pricing in USD, GAAP references, US-CPA-reviewed outputs.",
          href: "/us",
          cta: "View US version",
          choice: "chose-us" as const,
        }
      : {
          headline: "Based in India?",
          body:
            "We have a page tailored for Indian MSMEs preparing for PE — pricing in ₹, Ind AS, Tally/Zoho native, CA-reviewed outputs.",
          href: "/in",
          cta: "View India version",
          choice: "chose-in" as const,
        };

  return (
    <div
      role="dialog"
      aria-label="Region suggestion"
      className="fixed bottom-6 right-6 z-[60] w-[min(380px,calc(100vw-2rem))] rounded-2xl bg-[#111] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 animate-[slideUp_0.4s_ease-out]"
    >
      <button
        onClick={() => record("dismissed")}
        className="absolute top-3 right-3 p-1 rounded-md text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white leading-tight">
            {copy.headline}
          </p>
          <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
            {copy.body}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          href={copy.href}
          onClick={() => record(copy.choice)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          {copy.cta}
          <ArrowRight className="w-3 h-3" />
        </Link>
        <button
          onClick={() => record("chose-default")}
          className="text-[12px] text-white/50 hover:text-white/80 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          Stay here
        </button>
      </div>
    </div>
  );
}
