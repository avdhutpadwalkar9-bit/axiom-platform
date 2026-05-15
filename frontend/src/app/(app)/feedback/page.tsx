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

/* Health-band copy + colour for the helpful-rate KPI */
function healthCopy(rate: number): { color: string; line: string } {
  if (rate >= 75) return { color: "var(--positive)", line: "On target — answers are landing" };
  if (rate >= 50) return { color: "var(--warning)", line: "Mid-range — worth digging into" };
  return { color: "var(--negative)", line: "Attention — lots of unhappy votes" };
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

  const health = useMemo(() => healthCopy(stats?.helpful_rate_pct ?? 0), [stats]);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-meta">
          <span className="dot" />
          <span>Feedback analytics · every 👍 / 👎 on a CortexAI answer</span>
        </div>
        <h1 className="hero-title">
          What our users <span className="name">love</span> · and don&rsquo;t.
        </h1>
        <p className="hero-sub" style={{ display: "block", maxWidth: 620 }}>
          Raw signal from every thumbs-up / thumbs-down a user has cast on an AI response — aggregated so we know which templates to rewrite first and where the model is landing.
        </p>
      </section>

      {/* TOOLBAR */}
      <div className="toolbar">
        <span className="toolbar-label">Scope</span>
        <div className="seg">
          <button className={scope === "mine" ? "active" : ""} onClick={() => setScope("mine")}>
            My feedback
          </button>
          <button className={scope === "all" ? "active" : ""} onClick={() => setScope("all")}>
            Platform-wide
          </button>
        </div>
        <div className="grow" />
        <button
          className="dd"
          onClick={load}
          disabled={loading}
          style={loading ? { opacity: 0.5, cursor: "wait" } : undefined}
        >
          {loading ? (
            <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" />
          ) : (
            <RefreshCcw style={{ width: 11, height: 11 }} />
          )}
          Refresh
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="card"
          style={{
            padding: 16,
            background: "rgba(248,113,113,0.06)",
            borderColor: "rgba(248,113,113,0.30)",
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}
        >
          <AlertTriangle style={{ width: 14, height: 14, color: "var(--negative)", flexShrink: 0, marginTop: 2 }} />
          <span style={{ fontSize: 13, color: "var(--negative)" }}>{error}</span>
        </div>
      )}

      {/* LOADING SHELL */}
      {loading && !stats && (
        <div
          className="card"
          style={{ padding: 28, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}
        >
          <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
          <span style={{ fontSize: 13, color: "var(--text-muted, var(--muted))" }}>Loading feedback…</span>
        </div>
      )}

      {/* EMPTY STATE */}
      {stats && stats.total === 0 && !loading && (
        <div className="card" style={{ padding: 36, textAlign: "center" }}>
          <Sparkles
            style={{ width: 32, height: 32, color: "var(--text-subtle, var(--muted))", margin: "0 auto 12px" }}
          />
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>No feedback recorded yet</div>
          <div style={{ fontSize: 12, color: "var(--text-subtle, var(--muted))", marginTop: 6, maxWidth: 420, marginInline: "auto" }}>
            Every 👍 / 👎 a user clicks on an AI reply lands here. Start asking questions in the floating CortexAI widget and rating them.
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {stats && stats.total > 0 && (
        <>
          {/* KPI ROW */}
          <div className="kpi-row">
            <div className="kpi">
              <div className="kpi-head">
                <div className="kpi-icon"><Users style={{ width: 13, height: 13 }} /></div>
                <span className="kpi-label">Total votes</span>
              </div>
              <div className="kpi-value"><span>{stats.total.toLocaleString("en-IN")}</span></div>
              <div className="kpi-foot"><span className="meta">Across all AI responses</span></div>
            </div>

            <div className="kpi">
              <div className="kpi-head">
                <div className="kpi-icon" style={{ color: "var(--positive)" }}>
                  <ThumbsUp style={{ width: 13, height: 13 }} />
                </div>
                <span className="kpi-label">Helpful</span>
              </div>
              <div className="kpi-value">
                <span>{stats.helpful_count.toLocaleString("en-IN")}</span>
              </div>
              <div className="kpi-foot">
                <span className="meta">{stats.helpful_rate_pct}% of votes</span>
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-head">
                <div className="kpi-icon" style={{ color: "var(--negative)" }}>
                  <ThumbsDown style={{ width: 13, height: 13 }} />
                </div>
                <span className="kpi-label">Not helpful</span>
              </div>
              <div className="kpi-value">
                <span>{stats.unhelpful_count.toLocaleString("en-IN")}</span>
              </div>
              <div className="kpi-foot">
                <span className="meta">Each one is a curation opportunity</span>
              </div>
            </div>

            <div className="kpi accent">
              <div className="kpi-head">
                <div className="kpi-icon"><Sparkles style={{ width: 13, height: 13 }} /></div>
                <span className="kpi-label">Helpful rate</span>
              </div>
              <div className="kpi-value">
                <span style={{ color: health.color }}>{stats.helpful_rate_pct}</span>
                <span className="unit">%</span>
              </div>
              <div className="kpi-foot"><span className="meta">{health.line}</span></div>
            </div>
          </div>

          {/* BREAKDOWN SPLIT */}
          <div className="split">
            <BreakdownCard
              title="By mode"
              subtitle="Quick (Quick-Match + Reasoner) vs Deep (Strategist + Extended Reasoning)"
              data={stats.by_mode}
              icon={(key) =>
                key === "deep" ? (
                  <Brain style={{ width: 12, height: 12, color: "var(--info)" }} />
                ) : (
                  <Zap style={{ width: 12, height: 12, color: "var(--positive)" }} />
                )
              }
            />
            <BreakdownCard
              title="By source"
              subtitle="FAQ (instant template) vs AI (live model call)"
              data={stats.by_source}
              icon={(key) =>
                key === "faq" ? (
                  <Sparkles style={{ width: 12, height: 12, color: "var(--positive)" }} />
                ) : (
                  <Brain style={{ width: 12, height: 12, color: "var(--info)" }} />
                )
              }
            />
          </div>

          {/* TOP DOWNVOTED FAQs */}
          {stats.top_downvoted_faqs.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Top downvoted FAQs</div>
                  <div className="card-sub">Templates worth rewriting first · ordered by downvote count</div>
                </div>
              </div>
              <div style={{ padding: "8px 18px 14px", display: "grid", gap: 6 }}>
                {stats.top_downvoted_faqs.map((f) => (
                  <div
                    key={f.faq_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "var(--canvas-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <code
                      style={{
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                        fontSize: 12,
                        color: "var(--text)",
                      }}
                    >
                      {f.faq_id}
                    </code>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "var(--negative)",
                        fontFamily: "'Geist Mono', ui-monospace, monospace",
                      }}
                    >
                      <ThumbsDown style={{ width: 11, height: 11 }} />
                      <span style={{ fontWeight: 500 }}>{f.downvote_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RECENT DOWNVOTES */}
          {stats.recent_downvotes.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">Recent downvotes</div>
                  <div className="card-sub">
                    Latest {stats.recent_downvotes.length} thumbs-down · promote common patterns into{" "}
                    <code style={{ fontFamily: "'Geist Mono', ui-monospace, monospace" }}>faq_data.py</code>
                  </div>
                </div>
              </div>
              <div style={{ padding: "8px 18px 16px", display: "grid", gap: 10 }}>
                {stats.recent_downvotes.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 14,
                      background: "var(--canvas-2)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, color: "var(--text-subtle, var(--muted))" }}>
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
                              <Brain style={{ width: 10, height: 10 }} />
                            ) : (
                              <Zap style={{ width: 10, height: 10 }} />
                            )
                          }
                          label={d.mode}
                          tone={d.mode === "deep" ? "info" : "brand"}
                        />
                      )}
                      {d.source && <Pill label={d.source.toUpperCase()} tone={d.source === "faq" ? "brand" : "neutral"} />}
                      {d.page && <Pill label={d.page} tone="neutral" />}
                      {d.faq_id && <Pill label={d.faq_id} tone="neutral" mono />}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 6, lineHeight: 1.5 }}>
                      <span
                        style={{
                          color: "var(--text-subtle, var(--muted))",
                          fontWeight: 600,
                          marginRight: 6,
                        }}
                      >
                        Q:
                      </span>
                      {d.question}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted, var(--muted))",
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color: "var(--text-subtle, var(--muted))",
                          fontWeight: 600,
                          marginRight: 6,
                        }}
                      >
                        A:
                      </span>
                      {d.response_snippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISCLAIMER */}
          <div className="disclaimer">
            <span className="lbl">Curator&rsquo;s note</span>
            <span>
              Feedback is the only honest signal we have on whether CortexAI is landing. Every downvote is a chance to rewrite a template or tune the prompt — read them, don&rsquo;t dismiss them.{" "}
              <MessageSquare style={{ width: 11, height: 11, verticalAlign: "-2px" }} /> is where users actually rate.
            </span>
          </div>
        </>
      )}
    </>
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
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">{title}</div>
          <div className="card-sub">{subtitle}</div>
        </div>
      </div>
      <div style={{ padding: "10px 18px 18px", display: "grid", gap: 14 }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-subtle, var(--muted))", padding: "6px 0" }}>No data yet.</div>
        ) : (
          entries
            .sort((a, b) => b[1].total - a[1].total)
            .map(([key, b]) => {
              const rate = b.helpful_rate_pct;
              const barColor =
                rate >= 75 ? "var(--positive)" : rate >= 50 ? "var(--warning)" : "var(--negative)";
              const txt = rate >= 75 ? "var(--positive)" : rate >= 50 ? "var(--warning)" : "var(--negative)";
              return (
                <div key={key}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {icon(key)}
                      <span style={{ fontSize: 13, fontWeight: 500, textTransform: "capitalize" }}>{key}</span>
                      <span style={{ fontSize: 11, color: "var(--text-subtle, var(--muted))" }}>
                        ({b.total} vote{b.total === 1 ? "" : "s"})
                      </span>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: txt,
                      }}
                    >
                      {rate}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 3,
                      background: "var(--canvas-2)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(2, rate)}%`,
                        background: barColor,
                        borderRadius: 3,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 6,
                      fontSize: 10.5,
                      color: "var(--text-subtle, var(--muted))",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <ThumbsUp style={{ width: 10, height: 10, color: "var(--positive)" }} />
                      {b.helpful}
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <ThumbsDown style={{ width: 10, height: 10, color: "var(--negative)" }} />
                      {b.unhelpful}
                    </span>
                  </div>
                </div>
              );
            })
        )}
      </div>
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
  tone: "brand" | "info" | "neutral";
  mono?: boolean;
}) {
  const styles: React.CSSProperties =
    tone === "brand"
      ? {
          background: "var(--brand-soft)",
          color: "var(--brand-text)",
          border: "1px solid var(--brand-soft)",
        }
      : tone === "info"
      ? {
          background: "rgba(96,165,250,0.10)",
          color: "var(--info)",
          border: "1px solid rgba(96,165,250,0.25)",
        }
      : {
          background: "var(--card-hi, var(--card-2))",
          color: "var(--text-muted, var(--muted))",
          border: "1px solid var(--border)",
        };
  return (
    <span
      style={{
        ...styles,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        padding: "2px 8px",
        borderRadius: 100,
        fontFamily: mono ? "'Geist Mono', ui-monospace, monospace" : "inherit",
      }}
    >
      {icon}
      {label}
    </span>
  );
}
