"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Loader2,
  RefreshCcw,
  Zap,
  Brain,
  MessageSquare,
  AlertTriangle,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";

type Scope = "mine" | "all";

interface Breakdown {
  total: number;
  helpful: number;
  unhelpful: number;
  helpful_rate_pct: number;
}

interface Stats {
  total: number;
  helpful_count: number;
  unhelpful_count: number;
  helpful_rate_pct: number;
  by_mode: Record<string, Breakdown>;
  by_source: Record<string, Breakdown>;
  top_downvoted_faqs: Array<{ faq_id: string; downvote_count: number }>;
  recent_downvotes: Array<{
    created_at: string;
    question: string;
    response_snippet: string;
    source: string | null;
    mode: string | null;
    page: string | null;
    faq_id: string | null;
  }>;
}

export default function FeedbackPage() {
  const [scope, setScope] = useState<Scope>("mine");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFeedbackStats(scope);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feedback stats");
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const helpfulRateColor = useMemo(() => {
    if (!stats) return "text-app-text-muted";
    const r = stats.helpful_rate_pct;
    if (r >= 75) return "text-emerald-400";
    if (r >= 50) return "text-amber-300";
    return "text-rose-400";
  }, [stats]);

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400">
              Feedback analytics
            </p>
          </div>
          <h1 className="text-2xl font-bold text-app-text">CortexAI feedback</h1>
          <p className="text-sm text-app-text-subtle mt-1">
            Every thumbs-up and thumbs-down a user casts on an AI answer, persisted
            and aggregated — raw signal for FAQ curation and model tuning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Scope toggle */}
          <div className="flex items-center rounded-lg border border-app-border bg-app-card p-0.5">
            <ScopeButton
              active={scope === "mine"}
              label="My feedback"
              onClick={() => setScope("mine")}
            />
            <ScopeButton
              active={scope === "all"}
              label="Platform-wide"
              onClick={() => setScope("all")}
            />
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 bg-app-card hover:bg-app-card-hover border border-app-border text-app-text-muted hover:text-app-text px-3 py-2 rounded-lg text-[13px] transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCcw className="w-3.5 h-3.5" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex items-start gap-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {loading && !stats && (
        <div className="flex items-center gap-2 text-app-text-subtle text-sm py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading feedback…
        </div>
      )}

      {stats && stats.total === 0 && !loading && (
        <div className="rounded-xl border border-app-border bg-app-card p-8 text-center">
          <Sparkles className="w-8 h-8 text-app-text-subtle mx-auto mb-3" />
          <p className="text-sm text-app-text">No feedback recorded yet</p>
          <p className="text-[11px] text-app-text-subtle mt-1.5">
            Every 👍/👎 a user clicks on an AI reply lands here. Start
            asking questions in the floating CortexAI widget and rating them.
          </p>
        </div>
      )}

      {stats && stats.total > 0 && (
        <div className="space-y-6">
          {/* Headline KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={<Users className="w-3.5 h-3.5 text-app-text-subtle" />}
              label="Total votes"
              value={stats.total.toLocaleString("en-IN")}
              sub="Across all AI responses"
            />
            <KpiCard
              icon={<ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />}
              label="Helpful"
              value={stats.helpful_count.toLocaleString("en-IN")}
              sub={`${stats.helpful_rate_pct}% of votes`}
              tone="emerald"
            />
            <KpiCard
              icon={<ThumbsDown className="w-3.5 h-3.5 text-rose-400" />}
              label="Not helpful"
              value={stats.unhelpful_count.toLocaleString("en-IN")}
              sub="Each one is a curation opportunity"
              tone="rose"
            />
            <div className="bg-app-card rounded-xl border border-app-border p-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-app-text-subtle" />
                <p className="text-xs text-app-text-subtle">Helpful rate</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${helpfulRateColor}`}>
                {stats.helpful_rate_pct}%
              </p>
              <p className="text-[11px] text-app-text-subtle mt-1">
                {stats.helpful_rate_pct >= 75
                  ? "On target — answers are landing"
                  : stats.helpful_rate_pct >= 50
                  ? "Mid-range — signal worth digging into"
                  : "Attention — lots of unhappy votes"}
              </p>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid lg:grid-cols-2 gap-4">
            <BreakdownCard
              title="By mode"
              subtitle="Quick (Haiku) vs Deep (Sonnet + Extended Thinking)"
              data={stats.by_mode}
              icon={(key) =>
                key === "deep" ? (
                  <Brain className="w-3 h-3 text-sky-400" />
                ) : (
                  <Zap className="w-3 h-3 text-emerald-400" />
                )
              }
            />
            <BreakdownCard
              title="By source"
              subtitle="FAQ (instant template) vs AI (live model call)"
              data={stats.by_source}
              icon={(key) =>
                key === "faq" ? (
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Brain className="w-3 h-3 text-sky-400" />
                )
              }
            />
          </div>

          {/* Top downvoted FAQs */}
          {stats.top_downvoted_faqs.length > 0 && (
            <div className="bg-app-card rounded-xl border border-app-border p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-app-text">
                    Top downvoted FAQs
                  </h3>
                  <p className="text-xs text-app-text-subtle mt-0.5">
                    Templates worth rewriting first — ordered by downvote count
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {stats.top_downvoted_faqs.map((f) => (
                  <div
                    key={f.faq_id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-app-canvas border border-app-border/70"
                  >
                    <code className="text-[12px] text-app-text font-mono">
                      {f.faq_id}
                    </code>
                    <div className="flex items-center gap-1.5 text-[12px] text-rose-400">
                      <ThumbsDown className="w-3 h-3" />
                      <span className="tabular-nums font-medium">
                        {f.downvote_count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent downvotes — primary curation input */}
          {stats.recent_downvotes.length > 0 && (
            <div className="bg-app-card rounded-xl border border-app-border p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-app-text">
                    Recent downvotes
                  </h3>
                  <p className="text-xs text-app-text-subtle mt-0.5">
                    Latest 20 thumbs-down. Read through and promote the common
                    patterns into FAQ entries in{" "}
                    <code className="text-app-text-muted">faq_data.py</code>.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {stats.recent_downvotes.map((d, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-app-border/70 bg-app-canvas p-4"
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-[10px] text-app-text-subtle">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </span>
                      {d.mode && (
                        <Pill
                          icon={
                            d.mode === "deep" ? (
                              <Brain className="w-2.5 h-2.5" />
                            ) : (
                              <Zap className="w-2.5 h-2.5" />
                            )
                          }
                          label={d.mode}
                          tone={d.mode === "deep" ? "sky" : "emerald"}
                        />
                      )}
                      {d.source && (
                        <Pill
                          label={d.source.toUpperCase()}
                          tone={d.source === "faq" ? "emerald" : "neutral"}
                        />
                      )}
                      {d.page && (
                        <Pill label={d.page} tone="neutral" />
                      )}
                      {d.faq_id && (
                        <Pill label={d.faq_id} tone="neutral" mono />
                      )}
                    </div>
                    <p className="text-[13px] text-app-text mb-2 leading-relaxed">
                      <span className="text-app-text-subtle font-semibold mr-1.5">
                        Q:
                      </span>
                      {d.question}
                    </p>
                    <p className="text-[12px] text-app-text-muted leading-relaxed">
                      <span className="text-app-text-subtle font-semibold mr-1.5">
                        A:
                      </span>
                      {d.response_snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScopeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
        active
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-app-text-subtle hover:text-app-text-muted"
      }`}
    >
      {label}
    </button>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "emerald" | "rose";
}) {
  const border =
    tone === "emerald"
      ? "border-emerald-500/30 bg-emerald-500/5"
      : tone === "rose"
      ? "border-rose-500/30 bg-rose-500/5"
      : "border-app-border bg-app-card";
  return (
    <div className={`rounded-xl border ${border} p-5`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-app-text-subtle">{label}</p>
      </div>
      <p className="text-2xl font-bold text-app-text tabular-nums">{value}</p>
      <p className="text-[11px] text-app-text-subtle mt-1">{sub}</p>
    </div>
  );
}

function BreakdownCard({
  title,
  subtitle,
  data,
  icon,
}: {
  title: string;
  subtitle: string;
  data: Record<string, Breakdown>;
  icon: (key: string) => React.ReactNode;
}) {
  const entries = Object.entries(data);
  return (
    <div className="bg-app-card rounded-xl border border-app-border p-5">
      <h3 className="text-sm font-semibold text-app-text mb-0.5">{title}</h3>
      <p className="text-xs text-app-text-subtle mb-4">{subtitle}</p>
      {entries.length === 0 ? (
        <p className="text-[12px] text-app-text-subtle py-2">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {entries
            .sort((a, b) => b[1].total - a[1].total)
            .map(([key, b]) => {
              const rate = b.helpful_rate_pct;
              const barColor =
                rate >= 75
                  ? "bg-emerald-400"
                  : rate >= 50
                  ? "bg-amber-400"
                  : "bg-rose-400";
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {icon(key)}
                      <span className="text-[12px] font-medium text-app-text capitalize">
                        {key}
                      </span>
                      <span className="text-[11px] text-app-text-subtle">
                        ({b.total} vote{b.total === 1 ? "" : "s"})
                      </span>
                    </div>
                    <span
                      className={`text-[12px] tabular-nums font-semibold ${
                        rate >= 75
                          ? "text-emerald-400"
                          : rate >= 50
                          ? "text-amber-300"
                          : "text-rose-400"
                      }`}
                    >
                      {rate}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-app-canvas overflow-hidden">
                    <div
                      className={`h-full ${barColor}`}
                      style={{ width: `${Math.max(2, rate)}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-app-text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-2.5 h-2.5 text-emerald-400" />
                      {b.helpful}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsDown className="w-2.5 h-2.5 text-rose-400" />
                      {b.unhelpful}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function Pill({
  icon,
  label,
  tone,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  tone: "emerald" | "sky" | "neutral";
  mono?: boolean;
}) {
  const palette =
    tone === "emerald"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
      : tone === "sky"
      ? "bg-sky-500/10 border-sky-500/30 text-sky-300"
      : "bg-app-card-hover border-app-border text-app-text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${palette} ${
        mono ? "font-mono" : ""
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
