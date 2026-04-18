"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Send,
  X,
  MessageSquare,
  Loader2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import AIChatBubble from "./AIChatBubble";
import { api } from "@/lib/api";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

type ChatRole = "user" | "ai";

interface ChatMessage {
  role: ChatRole;
  text: string;
  // Stable id so React doesn't rekey bubbles on re-render.
  id: string;
}

// Route-aware suggested prompts. The prefix match catches sub-routes
// (e.g. /analysis/abcd123 → analysis prompts). Leftmost match wins.
const PROMPTS: Array<{ prefix: string; prompts: string[] }> = [
  {
    prefix: "/qoe",
    prompts: [
      "What's driving the biggest add-back this year?",
      "Which items on this page would a PE buyer challenge first?",
      "How does our adjusted EBITDA compare to industry benchmarks?",
    ],
  },
  {
    prefix: "/dashboard",
    prompts: [
      "Summarize my financial health in 3 bullets",
      "What's the most urgent risk I should address?",
      "Project next year's net income under conservative and aggressive cases",
    ],
  },
  {
    prefix: "/analysis",
    prompts: [
      "Walk me through the top 3 expense reductions with ₹ savings",
      "What does my working capital position tell you?",
      "Which Ind AS observations need a CA conversation this quarter?",
    ],
  },
  {
    prefix: "/scenarios",
    prompts: [
      "Build a conservative / base / aggressive scenario for next year",
      "What happens to my margins if revenue grows 20% but costs grow 15%?",
      "Which single lever has the biggest impact on net income?",
    ],
  },
  {
    prefix: "/industries",
    prompts: [
      "What's a good gross margin for my industry at our revenue band?",
      "How should I compare my working capital cycle to peers?",
      "Which Ind AS standards matter most for my sector?",
    ],
  },
  {
    prefix: "/profile",
    prompts: [
      "What details matter most for better AI analysis accuracy?",
      "How do you use my business information in recommendations?",
      "What's the next thing I should add to my profile?",
    ],
  },
  {
    prefix: "/uploads",
    prompts: [
      "What file formats give the best analysis quality?",
      "How do you handle related-party adjustments in the ledger?",
      "What should I clean up in my trial balance before uploading?",
    ],
  },
];

const DEFAULT_PROMPTS = [
  "What's my biggest growth opportunity this year?",
  "Where is my money actually going?",
  "Give me a priority list for this quarter",
];

function promptsForRoute(pathname: string | null): string[] {
  if (!pathname) return DEFAULT_PROMPTS;
  const match = PROMPTS.find((p) => pathname.startsWith(p.prefix));
  return match?.prompts ?? DEFAULT_PROMPTS;
}

// Build a short per-page context string so the AI can answer questions
// about what's actually on screen, not just the TB analysis blob.
// Kept deliberately small (<1 KB) — model gets the full analysis via the
// separate `analysis_result` field.
function buildPageContext(pathname: string | null): string {
  if (!pathname) return "";
  if (pathname.startsWith("/qoe")) {
    return "The user is viewing the Quality of Earnings page. It shows the EBITDA bridge (reported → adjusted), an add-back schedule broken out into Related-party / One-time / Revenue / Accounting categories with Ind AS references, customer concentration from the GL upload, and a continuous compliance matrix (GST / TDS / MCA). Questions on this page are usually about specific add-back items, red flags on concentration, or whether an adjustment would survive PE diligence.";
  }
  if (pathname.startsWith("/dashboard")) {
    return "The user is viewing the main dashboard — high-level revenue, expense, margin, and health-score cards. Questions here are usually strategic and broad: 'what should I focus on', 'am I healthy', 'what's next'.";
  }
  if (pathname.startsWith("/analysis")) {
    return "The user is viewing the TB/GL analysis output — income statement, balance sheet, ratios, classified account breakdowns, warnings, and Ind AS observations. Questions here are usually about specific ratios, expense heads, or what a specific line item means.";
  }
  if (pathname.startsWith("/scenarios")) {
    return "The user is on the scenario modeling page. Questions here are usually about projections, sensitivity, and what-if cases.";
  }
  if (pathname.startsWith("/industries")) {
    return "The user is viewing industry expertise / benchmarks. Questions here are usually about how their numbers compare to peers in their sector.";
  }
  return `The user is on ${pathname}.`;
}

// Generate stable message ids without pulling in a uuid dep.
let _idSeq = 0;
function newId(): string {
  _idSeq += 1;
  return `m${Date.now()}-${_idSeq}`;
}

export default function AIChatPanel() {
  const pathname = usePathname();
  const { lastResult } = useAnalysisStore();
  const { business } = useOnboardingStore();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = useMemo(() => promptsForRoute(pathname), [pathname]);

  // Auto-scroll to the latest message whenever the list grows or loading
  // spinner appears.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, loading]);

  // Focus the input when we open — lets the user start typing immediately.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Esc closes the panel. Attach on document so it works even when the
  // user's focus is inside the textarea.
  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const businessContext = useMemo(() => {
    if (!business) return undefined;
    return {
      company_name: business.companyName,
      industry: business.industry,
      entity_type: business.entityType,
      year_founded: business.yearFounded,
      services_description: business.servicesDescription,
    };
  }, [business]);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: ChatMessage = { id: newId(), role: "user", text: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        // Send only history PRIOR to this question — the backend appends
        // the question itself on top of the returned history.
        const history = messages.map((m) => ({ role: m.role, text: m.text }));
        const data = await api.chat({
          question: trimmed,
          analysis_result: (lastResult as Record<string, unknown>) ?? {},
          conversation_history: history,
          business_context: businessContext,
          page_context: buildPageContext(pathname),
        });
        setMessages((prev) => [
          ...prev,
          { id: newId(), role: "ai", text: data.response },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Chat failed — please try again.";
        // api.ts throws the raw text; backend errors are usually JSON with
        // a `detail` field. Try to surface that.
        let friendly = "Could not reach CortexAI. Please try again.";
        try {
          const parsed = JSON.parse(msg);
          if (parsed?.detail) friendly = String(parsed.detail);
        } catch {
          /* keep generic */
        }
        setError(friendly);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, lastResult, businessContext, pathname]
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      send(input);
    },
    [input, send]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter sends; Shift+Enter inserts newline. Standard chat UX.
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        send(input);
      }
    },
    [input, send]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
    setInput("");
  }, []);

  // --- Collapsed floating button ------------------------------------------
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium pl-4 pr-5 py-3 rounded-full shadow-[0_10px_40px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Open CortexAI chat"
      >
        <div className="relative">
          <Sparkles className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
        <span className="text-[13px]">Ask CortexAI</span>
      </button>
    );
  }

  // --- Expanded panel -----------------------------------------------------
  return (
    <div
      role="dialog"
      aria-label="CortexAI chat"
      className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(640px,calc(100vh-3rem))] flex flex-col bg-app-elevated border border-app-border-strong rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border bg-app-card">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-app-text leading-tight">CortexAI</p>
            <p className="text-[10px] text-app-text-subtle leading-tight">Your CFO advisor</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={reset}
              className="p-1.5 rounded-md text-app-text-subtle hover:text-app-text hover:bg-app-card-hover transition-colors"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md text-app-text-subtle hover:text-app-text hover:bg-app-card-hover transition-colors"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col h-full">
            <div className="flex items-start gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-app-text leading-relaxed">
                  Ask me anything about the numbers on this page, your overall
                  FP&amp;A, or general CFO-level strategy for your business.
                </p>
                <p className="text-[11px] text-app-text-subtle mt-1.5">
                  I see what you see — your trial balance, ratios, adjustments and
                  business context.
                </p>
              </div>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] uppercase tracking-[0.15em] text-app-text-subtle font-semibold mb-2">
                Suggested
              </p>
              <div className="space-y-1.5">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    disabled={loading}
                    className="w-full text-left text-[12px] text-app-text-muted bg-app-card hover:bg-app-card-hover border border-app-border hover:border-emerald-500/40 hover:text-app-text rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <AIChatBubble key={m.id} role={m.role} text={m.text} dark />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-3 bg-app-card-hover flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[12px] text-app-text-subtle">CortexAI is thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-[12px] text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={onSubmit}
        className="border-t border-app-border bg-app-card px-3 py-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about this page, your analysis, or anything FP&A…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none bg-app-canvas border border-app-border rounded-lg px-3 py-2 text-[13px] text-app-text placeholder:text-app-text-subtle outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 disabled:opacity-60 max-h-32 transition-colors"
            style={{ minHeight: "40px" }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-colors"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-app-text-subtle mt-1.5 px-1">
          Enter to send &middot; Shift+Enter for newline &middot; Esc to close
        </p>
      </form>
    </div>
  );
}
