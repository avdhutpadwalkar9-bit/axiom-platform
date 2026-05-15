"use client";

/* Reusable left-column aside for the auth split-screen layout.
   Single source of truth for the brand mark, hero copy, testimonial
   and trust badges. Each /login, /signup, /verify-email page passes
   its own headline + sub + (optional) testimonial. */

import type { ReactNode } from "react";

interface AuthAsideProps {
  eyebrow: string;
  headline: ReactNode; // can include <em> for italic accent words
  sub: string;
  cite?: { text: string; who: string };
}

export function AuthAside({ eyebrow, headline, sub, cite }: AuthAsideProps) {
  return (
    <aside className="auth-aside">
      <div className="auth-brand">
        <div className="auth-mark">C</div>
        <div className="auth-wordmark">
          Cortex<span>CFO</span>
        </div>
      </div>

      <div className="auth-hero">
        <span className="auth-eyebrow">
          <span className="pulse" />
          {eyebrow}
        </span>
        <h2 className="auth-headline">{headline}</h2>
        <p className="auth-sub">{sub}</p>

        {cite && (
          <div className="auth-cite">
            <div className="auth-cite-text">&ldquo;{cite.text}&rdquo;</div>
            <div className="auth-cite-who">{cite.who}</div>
          </div>
        )}
      </div>

      <div className="auth-trust">
        <span>SOC 2 Type II</span>
        <span>AES-256 at rest</span>
        <span>CA-reviewed templates</span>
        <span>Ind AS aligned</span>
      </div>
    </aside>
  );
}
