"use client";

/**
 * Perplexity-style model selector. Compact pill that opens a dropdown with
 * model labels + hints. Used in the analysis + dashboard chat input areas.
 */

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Sparkles } from "lucide-react";

export type ChatProvider = "claude" | "gemini" | "groq";

const MODELS: Array<{
  id: ChatProvider;
  label: string;
  tagline: string;
  hint: string;
}> = [
  {
    id: "claude",
    label: "Strategist",
    tagline: "Primary reasoning model",
    hint: "Best reasoning for financial analysis. Default routing.",
  },
  {
    id: "gemini",
    label: "Fast Reasoner",
    tagline: "High-throughput fallback",
    hint: "Fast fallback when primary queues are saturated.",
  },
  {
    id: "groq",
    label: "Scale Reasoner",
    tagline: "Open-weights throughput",
    hint: "Maximum throughput for batch operations.",
  },
];

export default function ModelSelector({
  value,
  onChange,
}: {
  value: ChatProvider;
  onChange: (v: ChatProvider) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = MODELS.find((m) => m.id === value) ?? MODELS[0];

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Close on escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 bg-white/3 border border-white/8 hover:bg-white/5 hover:border-white/15 hover:text-white/80 rounded-lg px-2.5 py-1.5 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span className="truncate max-w-[140px]">{active.label}</span>
        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 mb-2 w-[260px] bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden animate-scale-in z-50"
        >
          <div className="px-3 pt-3 pb-2 border-b border-white/5">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
              AI model
            </p>
          </div>
          <div className="p-1">
            {MODELS.map((m) => {
              const isActive = m.id === value;
              return (
                <button
                  key={m.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                    isActive ? "bg-emerald-500/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[12px] font-medium ${
                            isActive ? "text-emerald-300" : "text-white/80"
                          }`}
                        >
                          {m.label}
                        </span>
                        <span className="text-[10px] text-white/30">· {m.tagline}</span>
                      </div>
                      <p className="text-[10px] text-white/40 leading-relaxed mt-0.5">
                        {m.hint}
                      </p>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
