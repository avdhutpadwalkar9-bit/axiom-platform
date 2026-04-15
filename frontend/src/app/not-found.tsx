// Root app/not-found.tsx — renders for any unmatched URL across the whole
// application, plus any explicit `notFound()` calls from a route segment.
// Kept as a Server Component; Next.js auto-injects <meta name="robots"
// content="noindex"> for pages that return a 404 status code.

import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Compass className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              404 — Not found
            </p>
            <h1 className="text-[18px] font-semibold leading-tight text-white">
              This page doesn&apos;t exist
            </h1>
          </div>
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-white/60">
          The link you followed is either out of date or was mistyped. Head
          back to the dashboard or start from the top.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            href="/dashboard"
            className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/5"
          >
            <span className="text-[13px] font-medium text-white/80">
              Dashboard
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
          </Link>
          <Link
            href="/"
            className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 transition-colors hover:bg-white/5"
          >
            <span className="text-[13px] font-medium text-white/80">
              Home
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
