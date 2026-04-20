"use client";

/**
 * RegionPicker — first-visit soft modal offering a US-specific version.
 *
 * Philosophy: we don't GATE the site behind a picker. The default `/`
 * landing serves everyone; the picker just nudges US visitors to the
 * US-tailored page at /us (M&A Readiness positioning, USD pricing,
 * ASC/GAAP language). Indian visitors keep using the default as-is.
 *
 * Storage: the user's choice (dismiss OR "take me to US") lands in
 * localStorage so we don't ask again. 3-month TTL — if someone's
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

const LS_KEY = "cortexcfo-region-prompt-v1";
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

type Choice = "dismissed" | "chose-us" | "chose-default";

interface Stored {
  v: Choice;
  t: number;
}

/** Best-guess region from the browser's IANA timezone. "US" if the
 * timezone starts with "America/", else "default". No geolocation API
 * prompt (would trigger a permission banner). */
function guessRegion(): "US" | "default" {
  if (typeof Intl === "undefined") return "default";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    // America/* covers US + LATAM. For a US-specific pitch it's still
    // the best cheap hint we have; Mexico/Brazil visitors see the same
    // nudge and can dismiss it.
    if (tz.startsWith("America/")) return "US";
  } catch {
    /* resolvedOptions not available in some runtimes */
  }
  return "default";
}

export default function RegionPicker() {
  const [show, setShow] = useState(false);

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
    // Only show to visitors whose timezone guess suggests US — avoids
    // annoying Indian visitors (the default audience) with a picker
    // they don't need.
    if (guessRegion() !== "US") return;
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
          <p className="text-[13px] font-semibold text-white leading-tight">Based in the US?</p>
          <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
            We have a page tailored for US SMBs preparing for M&amp;A &mdash;
            pricing in USD, GAAP references, US-CPA-reviewed outputs.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          href="/us"
          onClick={() => record("chose-us")}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-[12px] font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          View US version
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
