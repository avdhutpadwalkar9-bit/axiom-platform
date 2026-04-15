"use client";

// Error boundaries must be Client Components.
// This file wraps every route segment under src/app/ and catches render-time
// errors. In Next.js 16.2+, `unstable_retry` replaces the older `reset` prop
// and re-fetches + re-renders the segment when the user asks to try again.

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Development: show the full error in the console so engineers can debug.
    // Production: `error.message` is a generic string for Server Component
    // errors — the `digest` is the only reliable correlation key to server logs.
    console.error("[CortexCFO] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              Something broke
            </p>
            <h1 className="text-[18px] font-semibold leading-tight text-white">
              We couldn&apos;t render this page
            </h1>
          </div>
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-white/60">
          An unexpected error occurred while loading this screen. Your data is
          safe — the failure happened in the page itself, not in your account.
          Try once more; if it keeps failing, please reach out and share the
          reference below.
        </p>

        {error.digest && (
          <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/30">
              Error reference
            </p>
            <code className="mt-1 block font-mono text-[12px] text-white/70">
              {error.digest}
            </code>
          </div>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={() => unstable_retry()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-[13px] font-medium text-[#0a0a0a] transition-colors hover:bg-emerald-400"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-[13px] font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
