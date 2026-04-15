// Root app/loading.tsx — renders as the React Suspense fallback while any
// route segment streams in. Kept as a lightweight Server Component with an
// indeterminate shimmer that respects prefers-reduced-motion (see globals.css).

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 text-white">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center">
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          CortexCFO
        </span>
      </div>

      <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/5">
        <div className="indeterminate-bar h-full w-1/3 rounded-full bg-emerald-500" />
      </div>

      <p className="mt-3 text-[12px] text-white/40">Loading…</p>
    </div>
  );
}
