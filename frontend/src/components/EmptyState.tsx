"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/* ════════════════════════════════════════════════════════════════
   EmptyState — used across the (app) shell when a page or a card
   has no real user data to render. We deliberately do NOT fall
   back to fabricated demo numbers on real accounts; instead we
   tell the user exactly what kind of file would populate this
   surface (TB, bank statements, sales register, etc.).

   Two variants:
   - <EmptyState /> — full-bleed, sized for a whole page
   - <EmptyState.Inline /> — compact, sized for inside a card

   Demo accounts (see lib/demoMode) never see this — they get
   pre-seeded Vadodara Chem data.
   ════════════════════════════════════════════════════════════════ */

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message: string;
  /** Primary CTA — usually "Upload [X]" pointing to /uploads. */
  primary?: { label: string; href: string };
  /** Secondary CTA — e.g. "Try the demo workspace". */
  secondary?: { label: string; href: string };
  /** Optional short bullet list of what we need from the user. */
  needs?: string[];
}

export function EmptyState({
  icon,
  title,
  message,
  primary,
  secondary,
  needs,
}: EmptyStateProps) {
  return (
    <div
      className="card"
      style={{
        padding: "40px 32px",
        textAlign: "center",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--brand) 4%, var(--card)) 0%, var(--card) 100%)",
        borderStyle: "dashed",
      }}
    >
      {icon && (
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--brand-soft)",
            border: "1px solid color-mix(in oklab, var(--brand) 30%, transparent)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            color: "var(--brand-text)",
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-muted, var(--muted))",
          maxWidth: 480,
          margin: "10px auto 0",
          lineHeight: 1.55,
        }}
      >
        {message}
      </p>

      {needs && needs.length > 0 && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "18px auto 0",
            display: "inline-grid",
            gap: 6,
            textAlign: "left",
            fontSize: 12.5,
            color: "var(--text-muted, var(--muted))",
          }}
        >
          {needs.map((n) => (
            <li key={n} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: "var(--brand)",
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              {n}
            </li>
          ))}
        </ul>
      )}

      {(primary || secondary) && (
        <div
          style={{
            marginTop: 22,
            display: "inline-flex",
            gap: 10,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {primary && (
            <Link
              href={primary.href}
              className="btn btn-primary"
              style={{ textDecoration: "none" }}
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="btn"
              style={{ textDecoration: "none" }}
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

interface InlineEmptyProps {
  title: string;
  message: string;
  cta?: { label: string; href: string };
}

EmptyState.Inline = function InlineEmpty({ title, message, cta }: InlineEmptyProps) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        background: "var(--canvas-2)",
        border: "1px dashed var(--border)",
        borderRadius: 10,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{title}</div>
      <div
        style={{
          fontSize: 12,
          color: "var(--text-muted, var(--muted))",
          marginTop: 4,
          lineHeight: 1.5,
          maxWidth: 360,
          marginInline: "auto",
        }}
      >
        {message}
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="chip"
          style={{ textDecoration: "none", marginTop: 12, display: "inline-flex" }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
};
