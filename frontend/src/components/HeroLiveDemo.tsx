"use client";

/**
 * HeroLiveDemo — animated Q→A speech-bubble exchange for landing heroes.
 *
 * The pattern comes from trylibra.ai: instead of a generic chart mockup,
 * show the product's actual output. Prospect sees CortexAI answer a real
 * founder question with real numbers in the first 2 seconds on the page.
 *
 * Autoplay cycle: user question types in → pause → CortexAI response
 * streams in token-by-token → long pause → loop. The loop never pauses
 * on the final answer because "live" feels more alive than "paused".
 *
 * Reusable across `/` (default) and `/us` (M&A-positioned). Props let
 * the parent supply region-appropriate question + answer text.
 */

import { useEffect, useState } from "react";
import { Sparkles, User as UserIcon } from "lucide-react";

interface HeroLiveDemoProps {
  question: string;
  // The answer string can contain inline markdown-ish accents:
  //   **bold** renders bold, *italic* renders italic.
  // Keep it to 3-5 short sentences — the hero isn't a whitepaper.
  answer: string;
  // Small label shown above the transcript. "CortexAI" by default.
  aiName?: string;
  className?: string;
}

export default function HeroLiveDemo({
  question,
  answer,
  aiName = "CortexAI",
  className = "",
}: HeroLiveDemoProps) {
  const [phase, setPhase] = useState<"typing-q" | "waiting" | "typing-a" | "done">(
    "typing-q",
  );
  const [qText, setQText] = useState("");
  const [aText, setAText] = useState("");

  useEffect(() => {
    let cancelled = false;
    // Reset when the inputs change so the demo re-animates if the parent
    // switches region mid-view.
    setPhase("typing-q");
    setQText("");
    setAText("");

    let timers: ReturnType<typeof setTimeout>[] = [];

    const typeOut = (
      text: string,
      setter: (s: string) => void,
      charMs: number,
      onDone: () => void,
    ) => {
      let i = 0;
      const step = () => {
        if (cancelled) return;
        i += 1;
        setter(text.slice(0, i));
        if (i < text.length) {
          timers.push(setTimeout(step, charMs));
        } else {
          timers.push(setTimeout(onDone, 400));
        }
      };
      step();
    };

    const run = () => {
      if (cancelled) return;
      setPhase("typing-q");
      typeOut(question, setQText, 25, () => {
        if (cancelled) return;
        setPhase("waiting");
        timers.push(
          setTimeout(() => {
            if (cancelled) return;
            setPhase("typing-a");
            typeOut(answer, setAText, 15, () => {
              if (cancelled) return;
              setPhase("done");
              timers.push(
                setTimeout(() => {
                  if (cancelled) return;
                  setQText("");
                  setAText("");
                  run();
                }, 8000),
              );
            });
          }, 700),
        );
      });
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers = [];
    };
  }, [question, answer]);

  // Parse inline **bold** / *italic* markers so parents don't have to
  // wrap spans in their answer strings. Kept narrow — no tables/lists.
  const renderInline = (s: string): React.ReactNode =>
    s
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
      .filter(Boolean)
      .map((chunk, i) => {
        if (chunk.startsWith("**") && chunk.endsWith("**"))
          return (
            <strong key={i} className="text-white font-semibold">
              {chunk.slice(2, -2)}
            </strong>
          );
        if (chunk.startsWith("*") && chunk.endsWith("*"))
          return (
            <em key={i} className="italic text-white/80">
              {chunk.slice(1, -1)}
            </em>
          );
        return <span key={i}>{chunk}</span>;
      });

  return (
    <div
      className={`w-full max-w-[520px] rounded-2xl border border-white/10 bg-[#0d0d10]/80 backdrop-blur-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* User question bubble */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-3.5 h-3.5 text-white/60" />
        </div>
        <div className="flex-1 min-h-[44px]">
          <p className="text-[11px] text-white/40 uppercase tracking-[0.14em] font-semibold mb-1">
            You
          </p>
          <p className="text-[14px] text-white/90 leading-relaxed">
            {qText}
            {phase === "typing-q" && (
              <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 align-[-2px] animate-pulse" />
            )}
          </p>
        </div>
      </div>

      {/* AI thinking / answer bubble */}
      {phase !== "typing-q" && (
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex-1 min-h-[60px]">
            <p className="text-[11px] text-emerald-400 uppercase tracking-[0.14em] font-semibold mb-1">
              {aiName}
            </p>
            {phase === "waiting" ? (
              <div className="flex items-center gap-1.5 py-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: "240ms" }}
                />
              </div>
            ) : (
              <p className="text-[14px] text-white/80 leading-relaxed">
                {renderInline(aText)}
                {phase === "typing-a" && (
                  <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-0.5 align-[-2px] animate-pulse" />
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
