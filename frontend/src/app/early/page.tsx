"use client";

/* ════════════════════════════════════════════════════════════════════
   /early · Stealth landing for the CA-firm interest test.

   Standalone page · no SiteNav, no SiteFooter, no CortexCFO branding
   visible. Pitched at boutique CA firm partners working with Indian
   ₹10–50 Cr MSMEs. The play: collect email signups so Avdhut can
   gauge interest before revealing the underlying product (CortexCFO).

   POSTs to /api/subscribe with source="early-access" — that route
   branches its email template to send a stealth-friendly "you're on
   the list" message with no CortexCFO mention.

   Built mobile-first because CA partners will tap from WhatsApp on
   their phones. Every block uses single-column on narrow screens.
   ════════════════════════════════════════════════════════════════════ */

import { useState } from "react";
import { ArrowRight, Check, Sparkles, ShieldCheck, Brain, Send, AlertCircle, Mail } from "lucide-react";

export default function EarlyAccessPage() {
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firm: firm.trim() || undefined,
          source: "early-access",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Couldn't sign you up just now. Try again in a moment?");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0A0B0D 0%, #0E1014 100%)",
        color: "#F4F5F7",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Hero · gradient orb behind content */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <header
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* No logo · just an "Early Access · Private Beta" badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.30)",
              color: "#6ee7b7",
              borderRadius: 100,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "#10B981",
                boxShadow: "0 0 8px #10B981",
              }}
            />
            Early access · private beta
          </div>
          <a
            href="#signup"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.7)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Get on the list →
          </a>
        </header>

        <section
          style={{
            position: "relative",
            padding: "60px 24px 80px",
            maxWidth: 920,
            margin: "0 auto",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "0 0 24px",
            }}
          >
            Your CAs aren&rsquo;t the bottleneck.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #34D399, #10B981)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              The clean-up is.
            </span>
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.6,
              margin: "0 auto 36px",
              maxWidth: 640,
            }}
          >
            AI handles the 80% drudge — account classification, anomaly detection,
            insight drafts. Your team reviews, signs off, ships in half the time.
            Built for boutique CA firms working with Indian MSMEs at ₹10–50 Cr.
          </p>

          <a
            href="#signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 600,
              background: "linear-gradient(180deg, #10B981 0%, #059669 100%)",
              color: "#fff",
              borderRadius: 100,
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              transition: "transform .15s, box-shadow .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(16,185,129,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(16,185,129,0.35)";
            }}
          >
            Join the early-access list
            <ArrowRight style={{ width: 16, height: 16 }} />
          </a>

          <div
            style={{
              marginTop: 24,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Onboarding 10 firms in Q3 · no public price yet · founder-led pilots
          </div>
        </section>
      </div>

      {/* What it is · 3 steps */}
      <section
        style={{
          padding: "60px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: "#34D399",
              marginBottom: 12,
            }}
          >
            How it works
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Three steps from messy books to signed report.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              n: "01",
              title: "Plug in your client's books",
              body:
                "Tally Prime, Zoho Books, QuickBooks, or Excel. Bank statements as PDF if you want cash proof. Every file hashed + encrypted at rest.",
              meta: "~60 seconds",
            },
            {
              n: "02",
              title: "AI cleans, classifies, drafts",
              body:
                "Accounts mapped to Ind AS / Schedule III. Ratios computed against the right peer set. Adjustment ladder drafted with every figure cited back to a TB line.",
              meta: "~10 minutes",
            },
            {
              n: "03",
              title: "Your CAs review + sign off",
              body:
                "Same review you'd do today — minus the 14 hours of prep. Sign the report, hand it to the client, move on to the next file.",
              meta: "Your time, ~80% less",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                padding: 24,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                transition: "border-color .2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'Geist Mono', ui-monospace, 'SF Mono', Consolas, monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#34D399",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.n}
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {s.meta}
                </span>
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  margin: "0 0 12px",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The wedge · why this matters for CA firms */}
      <section
        style={{
          padding: "60px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            padding: "32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
          }}
        >
          {[
            {
              n: "14",
              label: "hours / client / month",
              body:
                "Average prep time your CAs spend per client before they can even start reviewing — most of it data clean-up, format normalisation, citation tracing.",
            },
            {
              n: "80%",
              label: "of that work · automated",
              body:
                "Account classification, ratio computation, anomaly detection, citation linking — AI does it. Your CAs pick up at the review stage, not the prep stage.",
            },
            {
              n: "3×",
              label: "client load per CA · same headcount",
              body:
                "Three boutique firms in the private beta are reporting that one CA now handles three clients in the time it used to take for one.",
            },
          ].map((m) => (
            <div key={m.label}>
              <div
                style={{
                  fontSize: "clamp(40px, 5vw, 56px)",
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  background:
                    "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  lineHeight: 1,
                }}
              >
                {m.n}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffffff",
                  marginTop: 6,
                  marginBottom: 12,
                }}
              >
                {m.label}
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {m.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section
        style={{
          padding: "40px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            padding: "32px",
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.10)",
            borderRadius: 20,
          }}
        >
          {[
            {
              icon: <ShieldCheck style={{ width: 18, height: 18 }} />,
              title: "Your data, your IP",
              body:
                "Client books never train AI models. AES-256 at rest. Data stays in India.",
            },
            {
              icon: <Brain style={{ width: 18, height: 18 }} />,
              title: "Built for Indian books",
              body:
                "Native Ind AS / Schedule III · GSTR-2A reconciliation · TDS · MCA filings.",
            },
            {
              icon: <Sparkles style={{ width: 18, height: 18 }} />,
              title: "Your team signs off",
              body:
                "AI drafts. Your CAs review and sign. No black-box opinions, ever.",
            },
          ].map((t) => (
            <div key={t.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#6ee7b7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {t.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.55,
                  }}
                >
                  {t.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Signup form */}
      <section
        id="signup"
        style={{
          padding: "80px 24px 100px",
          maxWidth: 600,
          margin: "0 auto",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
            margin: "0 0 16px",
          }}
        >
          Be among the first ten firms.
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            margin: "0 0 32px",
          }}
        >
          We&rsquo;re onboarding 10 boutique CA firms in Q3 2026. Founder-led
          pilots — your input shapes the product. No price commitment.
        </p>

        {status === "success" ? (
          <div
            style={{
              padding: "32px 28px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.30)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "rgba(16,185,129,0.18)",
                border: "1px solid rgba(16,185,129,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6ee7b7",
              }}
            >
              <Check style={{ width: 22, height: 22 }} />
            </div>
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                margin: "0 0 8px",
              }}
            >
              You&rsquo;re on the list.
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Confirmation in your inbox. We&rsquo;ll reach out within 2–4 weeks
              when a pilot slot opens. Questions in the meantime? Reply to that
              email — it lands directly with the founder.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "24px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 16,
              textAlign: "left",
            }}
          >
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: -4,
              }}
              htmlFor="email"
            >
              Your email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@firm.com"
              disabled={status === "submitting"}
              style={{
                padding: "12px 14px",
                fontSize: 15,
                background: "rgba(0,0,0,0.30)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "#ffffff",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: -4,
                marginTop: 8,
              }}
              htmlFor="firm"
            >
              Firm name <span style={{ opacity: 0.5, fontWeight: 400, textTransform: "none" }}>· optional</span>
            </label>
            <input
              id="firm"
              type="text"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              placeholder="Where you practise"
              disabled={status === "submitting"}
              style={{
                padding: "12px 14px",
                fontSize: 15,
                background: "rgba(0,0,0,0.30)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "#ffffff",
                fontFamily: "inherit",
                outline: "none",
              }}
            />

            {errorMsg && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.30)",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#fca5a5",
                  marginTop: 4,
                }}
              >
                <AlertCircle style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting" || !email.includes("@")}
              style={{
                marginTop: 8,
                padding: "14px 24px",
                fontSize: 15,
                fontWeight: 600,
                background:
                  status === "submitting"
                    ? "rgba(16,185,129,0.5)"
                    : "linear-gradient(180deg, #10B981 0%, #059669 100%)",
                color: "#fff",
                border: 0,
                borderRadius: 100,
                cursor: status === "submitting" ? "wait" : "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                opacity: status === "submitting" || !email.includes("@") ? 0.6 : 1,
                boxShadow: "0 8px 24px rgba(16,185,129,0.30)",
                transition: "transform .15s",
              }}
            >
              {status === "submitting" ? (
                <>Sending…</>
              ) : (
                <>
                  Join the list
                  <Send style={{ width: 14, height: 14 }} />
                </>
              )}
            </button>

            <div
              style={{
                fontSize: 11.5,
                color: "rgba(255,255,255,0.4)",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              No spam. One confirmation email · one follow-up when a pilot slot opens.
            </div>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 24px",
          maxWidth: 1100,
          margin: "0 auto",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
          boxSizing: "border-box",
        }}
      >
        <span>Private beta · founder-led · India</span>
        <a
          href="mailto:hello@cortexcfo.in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
          }}
        >
          <Mail style={{ width: 12, height: 12 }} />
          hello@cortexcfo.in
        </a>
      </footer>
    </div>
  );
}
