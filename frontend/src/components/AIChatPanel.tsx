"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Send,
  X,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Zap,
  Brain,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
} from "lucide-react";
import AIChatBubble from "./AIChatBubble";
import { api } from "@/lib/api";
import { useAnalysisStore } from "@/stores/analysisStore";
import { useOnboardingStore } from "@/stores/onboardingStore";

// Model labels shown in the bottom-of-panel badge. Kept in sync with the
// backend's CLAUDE_MODEL_QUICK / CLAUDE_MODEL_DEEP constants — trust badge
// that tells the user which tier served their answer.
const MODEL_LABEL: Record<ChatMode, string> = {
  quick: "Claude Haiku 4.5",
  deep: "Claude Sonnet 4.5 · Extended Thinking",
};

type ChatRole = "user" | "ai";
type ChatMode = "quick" | "deep";
type ChatSource = "faq" | "ai";

interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  // Only populated on AI messages. Lets the UI render a subtle source
  // badge + feedback buttons correctly.
  source?: ChatSource;
  faqId?: string | null;
  mode?: ChatMode;
}

// Build a short per-page context so the model knows what's on screen,
// not just the TB analysis blob. Prepended (bracketed) to the user's
// question server-side.
function buildPageContext(pathname: string | null): string {
  if (!pathname) return "";
  if (pathname.startsWith("/qoe")) {
    return "The user is viewing the Quality of Earnings page. It shows the EBITDA bridge (reported → adjusted), an add-back schedule broken out into Related-party / One-time / Revenue / Accounting categories with Ind AS references, customer concentration from the GL upload, and a continuous compliance matrix (GST / TDS / MCA). Questions here are usually about specific add-back items, red flags on concentration, or whether an adjustment would survive PE diligence.";
  }
  if (pathname.startsWith("/dashboard")) {
    return "The user is viewing the main dashboard — high-level revenue, expense, margin, and health cards. Questions here are usually strategic and broad.";
  }
  if (pathname.startsWith("/analysis")) {
    return "The user is viewing the TB/GL analysis output — income statement, balance sheet, ratios, classified accounts, warnings, and Ind AS observations.";
  }
  if (pathname.startsWith("/scenarios")) {
    return "The user is on the scenario modeling page. Projections, sensitivity, what-if cases.";
  }
  if (pathname.startsWith("/industries")) {
    return "The user is viewing industry expertise / benchmarks.";
  }
  return `The user is on ${pathname}.`;
}

let _idSeq = 0;
function newId(): string {
  _idSeq += 1;
  return `m${Date.now()}-${_idSeq}`;
}

export default function AIChatPanel() {
  const pathname = usePathname();
  const { lastResult, companyName, analysisDate } = useAnalysisStore();
  const { business } = useOnboardingStore();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("quick");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Elapsed time during a Deep-mode call — lets us show a counter so
  // the wait feels intentional. Kept in its own state so it only
  // re-renders the thinking pill, not every bubble.
  const [elapsed, setElapsed] = useState(0);
  // Feedback state — keyed by messageId so the buttons stay sticky
  // per message even as new ones stream in.
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new content.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, loading, elapsed]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Elapsed-time ticker — only runs while loading. Cleared on response
  // so the counter doesn't stick after a successful reply.
  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const tick = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => clearInterval(tick);
  }, [loading]);

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

  // Context tags — surface what the AI is actually looking at. Borrowed
  // from the Dashboard's (now retired) inline AI Analyst panel. Renders
  // nothing if the user hasn't completed onboarding or uploaded analysis.
  const contextTags = useMemo(() => {
    const tags: Array<{ label: string; tone: "neutral" | "emerald" }> = [];
    const name = business?.companyName?.trim() || companyName?.trim();
    if (name) tags.push({ label: name, tone: "neutral" });
    if (business?.industry) tags.push({ label: business.industry, tone: "neutral" });
    if (business?.entityType) tags.push({ label: business.entityType, tone: "neutral" });
    if (analysisDate) {
      try {
        const d = new Date(analysisDate);
        const label = d.toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        });
        tags.push({ label, tone: "emerald" });
      } catch {
        /* ignore — just skip the date tag if parsing fails */
      }
    }
    return tags;
  }, [business?.companyName, business?.industry, business?.entityType, companyName, analysisDate]);

  const send = useCallback(
    async (question: string, sendMode: ChatMode = mode) => {
      const trimmed = question.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: ChatMessage = { id: newId(), role: "user", text: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const history = messages.map((m) => ({ role: m.role, text: m.text }));
        const data = await api.chat({
          question: trimmed,
          // `lastResult` is typed as AnalysisResult with specific field
          // names (financial_statements, ratios, etc.); the backend
          // happily accepts any shape. Widen via unknown so TS lets us
          // pass it through to the JSON body without fighting the type.
          analysis_result: (lastResult ?? {}) as unknown as Record<string, unknown>,
          conversation_history: history,
          business_context: businessContext,
          page_context: buildPageContext(pathname),
          mode: sendMode,
        });
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: "ai",
            text: data.response,
            source: data.source,
            faqId: data.faq_id ?? null,
            mode: data.mode,
          },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Chat failed — please try again.";
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
    [loading, messages, lastResult, businessContext, pathname, mode]
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
    setFeedback({});
  }, []);

  const recordFeedback = useCallback(
    async (msgId: string, helpful: boolean) => {
      if (feedback[msgId]) return;
      setFeedback((prev) => ({ ...prev, [msgId]: helpful ? "up" : "down" }));
      const msg = messages.find((m) => m.id === msgId);
      if (!msg) return;
      // Find the preceding user question — the feedback log ties both
      // together so we can see what was asked vs what was answered.
      const idx = messages.findIndex((m) => m.id === msgId);
      const userQ = idx > 0 ? messages[idx - 1].text : "";
      try {
        await api.sendChatFeedback({
          question: userQ,
          response: msg.text,
          helpful,
          source: msg.source,
          faq_id: msg.faqId ?? null,
          mode: msg.mode,
          page: pathname ?? undefined,
        });
      } catch {
        // Never surface feedback errors to the user — logging is
        // best-effort and doesn't change what they see on screen.
      }
    },
    [feedback, messages, pathname]
  );

  // ── Collapsed floating button ─────────────────────────────────────────
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

  // ── Expanded panel ───────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-label="CortexAI chat"
      className="fixed bottom-6 right-6 z-50 w-[min(440px,calc(100vw-2rem))] h-[min(680px,calc(100vh-3rem))] flex flex-col bg-app-elevated border border-app-border-strong rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden"
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

      {/* Mode toggle */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-app-border bg-app-card/50">
        <ModeButton
          active={mode === "quick"}
          icon={<Zap className="w-3 h-3" />}
          label="Quick answer"
          hint="Fast (~2s)"
          onClick={() => setMode("quick")}
        />
        <ModeButton
          active={mode === "deep"}
          icon={<Brain className="w-3 h-3" />}
          label="Think deeper"
          hint="Strategic (~15-30s)"
          onClick={() => setMode("deep")}
        />
      </div>

      {/* "Analysing" context tags — shows what the AI can actually see.
          Only renders when the user has a company profile or uploaded
          financials; otherwise a new user would get an empty strip. */}
      {contextTags.length > 0 && (
        <div className="px-4 py-2.5 border-b border-app-border bg-app-canvas">
          <p className="text-[9px] text-app-text-subtle uppercase tracking-[0.15em] font-semibold mb-1.5">
            Analysing
          </p>
          <div className="flex flex-wrap gap-1.5">
            {contextTags.map((t, i) => (
              <span
                key={i}
                className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  t.tone === "emerald"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-app-card-hover border-app-border text-app-text-muted"
                }`}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-start gap-2.5 pt-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] text-app-text leading-relaxed">
                Ask me anything about the numbers on this page, your FP&amp;A,
                or general CFO-level strategy for your business.
              </p>
              <p className="text-[11px] text-app-text-subtle mt-1.5 leading-relaxed">
                I read your trial balance, ratios, adjustments, and company context
                live. Use <span className="text-app-text-muted font-medium">Think deeper</span>{" "}
                when you want strategic reasoning over a quick answer.
              </p>
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="space-y-1">
            <AIChatBubble role={m.role} text={m.text} dark />
            {m.role === "ai" && (
              <div className="flex items-center justify-between pl-1 pr-1">
                <div className="flex items-center gap-1.5">
                  {m.source === "faq" && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5"
                      title="Answer served from our FAQ bank with your live numbers interpolated"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" /> FAQ
                    </span>
                  )}
                  {m.source === "ai" && m.mode === "deep" && (
                    <span
                      className="inline-flex items-center gap-1 text-[10px] text-app-text-muted bg-app-card-hover border border-app-border-strong rounded-full px-2 py-0.5"
                      title="Generated with extended thinking"
                    >
                      <Brain className="w-2.5 h-2.5" /> Deep
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => recordFeedback(m.id, true)}
                    disabled={!!feedback[m.id]}
                    className={`p-1 rounded transition-colors ${
                      feedback[m.id] === "up"
                        ? "text-emerald-400 bg-emerald-500/10"
                        : "text-app-text-subtle hover:text-emerald-400 hover:bg-emerald-500/10"
                    } disabled:cursor-default`}
                    aria-label="Helpful"
                    title="Helpful"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => recordFeedback(m.id, false)}
                    disabled={!!feedback[m.id]}
                    className={`p-1 rounded transition-colors ${
                      feedback[m.id] === "down"
                        ? "text-rose-400 bg-rose-500/10"
                        : "text-app-text-subtle hover:text-rose-400 hover:bg-rose-500/10"
                    } disabled:cursor-default`}
                    aria-label="Not helpful"
                    title="Not helpful"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-2xl rounded-bl-sm px-4 py-3 bg-app-card-hover border border-app-border flex items-center gap-2.5">
              {mode === "deep" ? (
                <>
                  <Brain className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-[12px] text-app-text font-medium">
                      Thinking deeply…
                    </span>
                    <span className="text-[10px] text-app-text-subtle">
                      {elapsed}s elapsed &middot; strategic reasoning in progress
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-[12px] text-app-text-subtle">
                    CortexAI is thinking…
                  </span>
                </>
              )}
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
            placeholder={
              mode === "deep"
                ? "Ask a strategic question — I'll think it through…"
                : "Ask anything about your financials or this page…"
            }
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
        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-[10px] text-app-text-subtle">
            Enter to send &middot; Shift+Enter for newline &middot; Esc to close
          </p>
          <span
            className="inline-flex items-center gap-1 text-[10px] text-app-text-subtle"
            title={
              mode === "deep"
                ? "Deep mode uses Claude Sonnet 4.5 with extended thinking enabled — slower, more considered answers."
                : "Quick mode uses Claude Haiku 4.5 for fast answers; FAQ matches are served instantly from our seed bank."
            }
          >
            {mode === "deep" ? (
              <Brain className="w-2.5 h-2.5" />
            ) : (
              <Zap className="w-2.5 h-2.5" />
            )}
            {MODEL_LABEL[mode]}
          </span>
        </div>
      </form>
    </div>
  );
}

// Small helper for the mode pill. Extracted so the two pills are
// pixel-identical without inline duplication.
function ModeButton({
  active,
  icon,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
        active
          ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
          : "text-app-text-subtle hover:text-app-text-muted hover:bg-app-card-hover border border-transparent"
      }`}
    >
      {icon}
      <span>{label}</span>
      <span
        className={`text-[9px] ${
          active ? "text-emerald-400/70" : "text-app-text-subtle"
        }`}
      >
        {hint}
      </span>
    </button>
  );
}
