/**
 * ProductIllustrations — custom inline SVGs that replace the generic
 * stock photos on /product. Each illustration is theme-agnostic (uses
 * currentColor / CSS variables) so it reads cleanly on both dark and
 * light canvases.
 *
 * Design language: flat illustrative, emerald accent to match brand,
 * simple geometric shapes. No stock-market line charts, no corporate
 * handshakes, no laptops-in-coffee-shops.
 */

import * as React from "react";

const EMERALD = "#34d399";
const EMERALD_DIM = "#10b981";
const ACCENT_GLOW = "rgba(52, 211, 153, 0.18)";

type IllustrationProps = {
  className?: string;
  ariaLabel?: string;
};

/**
 * Hero dashboard mock — replaces the hero screenshot at the top of
 * /product. Shows a stylized CortexCFO dashboard: KPI row, line trend,
 * bar chart, insight card. Not a real screenshot, but reads clearly
 * as "this is what our product looks like".
 */
export function HeroDashboardIllustration({
  className,
  ariaLabel = "CortexCFO dashboard preview",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 1200 520"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="canvasGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={EMERALD} stopOpacity="0.35" />
          <stop offset="1" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Canvas background */}
      <rect width="1200" height="520" fill="url(#canvasGrad)" />
      {/* Soft emerald glow behind the chart */}
      <ellipse cx="420" cy="280" rx="380" ry="160" fill={ACCENT_GLOW} />

      {/* KPI row — 4 cards */}
      {[
        { x: 40, label: "REVENUE", val: "$4.2M", delta: "+18%" },
        { x: 320, label: "EBITDA MARGIN", val: "24.8%", delta: "+3.1pt" },
        { x: 600, label: "CASH RUNWAY", val: "18 mo", delta: "+2 mo" },
        { x: 880, label: "NRR", val: "112%", delta: "+4%" },
      ].map((kpi, i) => (
        <g key={i} transform={`translate(${kpi.x}, 40)`}>
          <rect
            width="260"
            height="92"
            rx="14"
            fill="currentColor"
            fillOpacity="0.03"
            stroke="currentColor"
            strokeOpacity="0.08"
          />
          <text
            x="20"
            y="30"
            fill="currentColor"
            fillOpacity="0.4"
            fontSize="10"
            fontFamily="Poppins, sans-serif"
            fontWeight="600"
            letterSpacing="1.5"
          >
            {kpi.label}
          </text>
          <text
            x="20"
            y="62"
            fill="currentColor"
            fillOpacity="0.95"
            fontSize="22"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
          >
            {kpi.val}
          </text>
          <text
            x="20"
            y="80"
            fill={EMERALD}
            fontSize="11"
            fontFamily="Poppins, sans-serif"
            fontWeight="600"
          >
            ▲ {kpi.delta}
          </text>
          {/* Mini sparkline */}
          <polyline
            points="160,70 180,55 200,62 220,42 240,48"
            fill="none"
            stroke={EMERALD}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {/* Main chart card */}
      <g transform="translate(40, 160)">
        <rect
          width="720"
          height="320"
          rx="16"
          fill="currentColor"
          fillOpacity="0.03"
          stroke="currentColor"
          strokeOpacity="0.08"
        />
        <text
          x="24"
          y="40"
          fill="currentColor"
          fillOpacity="0.9"
          fontSize="15"
          fontFamily="Poppins, sans-serif"
          fontWeight="600"
        >
          Revenue &amp; EBITDA trend
        </text>
        <text
          x="24"
          y="60"
          fill="currentColor"
          fillOpacity="0.45"
          fontSize="11"
          fontFamily="Poppins, sans-serif"
        >
          Last 12 months · auto-classified from your GL
        </text>

        {/* Gridlines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="24"
            x2="696"
            y1={100 + i * 50}
            y2={100 + i * 50}
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeDasharray="4 6"
          />
        ))}

        {/* Trend area fill */}
        <path
          d="M 40 240 L 100 220 L 160 225 L 220 200 L 280 180 L 340 170 L 400 155 L 460 160 L 520 135 L 580 110 L 640 95 L 690 80 L 690 290 L 40 290 Z"
          fill="url(#trendGrad)"
        />
        {/* Trend line */}
        <path
          d="M 40 240 L 100 220 L 160 225 L 220 200 L 280 180 L 340 170 L 400 155 L 460 160 L 520 135 L 580 110 L 640 95 L 690 80"
          fill="none"
          stroke={EMERALD}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {[[220, 200], [400, 155], [580, 110], [690, 80]].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="4.5"
            fill={EMERALD}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="3"
          />
        ))}

        {/* X-axis labels */}
        {["Jan", "Apr", "Jul", "Oct"].map((m, i) => (
          <text
            key={m}
            x={40 + i * 218}
            y="305"
            fill="currentColor"
            fillOpacity="0.35"
            fontSize="10"
            fontFamily="Poppins, sans-serif"
          >
            {m}
          </text>
        ))}
      </g>

      {/* Insight card (right side) */}
      <g transform="translate(780, 160)">
        <rect
          width="380"
          height="320"
          rx="16"
          fill="currentColor"
          fillOpacity="0.03"
          stroke="currentColor"
          strokeOpacity="0.08"
        />
        <g transform="translate(24, 28)">
          <rect
            width="60"
            height="20"
            rx="10"
            fill={EMERALD}
            fillOpacity="0.15"
          />
          <text
            x="30"
            y="14"
            fill={EMERALD}
            fontSize="9"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
            letterSpacing="1.4"
            textAnchor="middle"
          >
            AI INSIGHT
          </text>
        </g>
        <text
          x="24"
          y="84"
          fill="currentColor"
          fillOpacity="0.92"
          fontSize="14"
          fontFamily="Poppins, sans-serif"
          fontWeight="600"
        >
          <tspan x="24" dy="0">Gross margin held above 48%</tspan>
          <tspan x="24" dy="22">for the 6th straight month.</tspan>
        </text>
        <text
          x="24"
          y="150"
          fill="currentColor"
          fillOpacity="0.55"
          fontSize="11"
          fontFamily="Poppins, sans-serif"
        >
          <tspan x="24" dy="0">Price discipline on enterprise tier is</tspan>
          <tspan x="24" dy="16">holding. COGS ratio improved 1.8pt</tspan>
          <tspan x="24" dy="16">vs prior period — primarily from</tspan>
          <tspan x="24" dy="16">infrastructure cost optimization.</tspan>
        </text>

        {/* Action row */}
        <g transform="translate(24, 240)">
          <rect
            width="100"
            height="28"
            rx="14"
            fill={EMERALD}
          />
          <text
            x="50"
            y="18"
            fill="#fff"
            fontSize="11"
            fontFamily="Poppins, sans-serif"
            fontWeight="600"
            textAnchor="middle"
          >
            See breakdown
          </text>
          <text
            x="120"
            y="19"
            fill="currentColor"
            fillOpacity="0.4"
            fontSize="11"
            fontFamily="Poppins, sans-serif"
          >
            Ask the AI →
          </text>
        </g>
      </g>
    </svg>
  );
}

/**
 * "From raw data to boardroom-ready" — shows a trial balance sheet
 * flowing into structured P&L / BS / CFS statements via an AI layer.
 */
export function DataToAnalysisIllustration({
  className,
  ariaLabel = "Raw trial balance transforming into boardroom-ready statements",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="illuBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ACCENT_GLOW} />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
        <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={EMERALD} stopOpacity="0" />
          <stop offset="0.5" stopColor={EMERALD} stopOpacity="0.8" />
          <stop offset="1" stopColor={EMERALD} stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="600" fill="url(#illuBg)" opacity="0.7" />

      {/* ── LEFT: raw trial balance "document" ── */}
      <g transform="translate(40, 120)">
        <rect
          width="240"
          height="360"
          rx="14"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.1"
        />
        {/* Document header */}
        <rect
          x="20"
          y="20"
          width="80"
          height="10"
          rx="3"
          fill="currentColor"
          fillOpacity="0.5"
        />
        <rect
          x="20"
          y="36"
          width="140"
          height="6"
          rx="2"
          fill="currentColor"
          fillOpacity="0.2"
        />
        {/* Column headers */}
        <line
          x1="20"
          y1="64"
          x2="220"
          y2="64"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <text
          x="20"
          y="78"
          fill="currentColor"
          fillOpacity="0.4"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
        >
          ACCOUNT
        </text>
        <text
          x="135"
          y="78"
          fill="currentColor"
          fillOpacity="0.4"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
        >
          DEBIT
        </text>
        <text
          x="185"
          y="78"
          fill="currentColor"
          fillOpacity="0.4"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="600"
        >
          CREDIT
        </text>
        {/* Data rows */}
        {[
          ["Cash", "1,250", ""],
          ["AR", "480", ""],
          ["Inventory", "320", ""],
          ["PP&E", "2,100", ""],
          ["AP", "", "290"],
          ["Notes Pay.", "", "850"],
          ["Equity", "", "1,720"],
          ["Revenue", "", "4,200"],
          ["COGS", "2,150", ""],
          ["Opex", "960", ""],
        ].map((row, i) => (
          <g key={i} transform={`translate(0, ${92 + i * 24})`}>
            <text
              x="20"
              y="0"
              fill="currentColor"
              fillOpacity="0.7"
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
            >
              {row[0]}
            </text>
            <text
              x="135"
              y="0"
              fill={row[1] ? EMERALD : "currentColor"}
              fillOpacity={row[1] ? "1" : "0.2"}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
            >
              {row[1] || "—"}
            </text>
            <text
              x="185"
              y="0"
              fill={row[2] ? EMERALD_DIM : "currentColor"}
              fillOpacity={row[2] ? "1" : "0.2"}
              fontSize="10"
              fontFamily="JetBrains Mono, monospace"
              fontWeight="600"
            >
              {row[2] || "—"}
            </text>
          </g>
        ))}
        {/* Document label */}
        <text
          x="120"
          y="350"
          textAnchor="middle"
          fill="currentColor"
          fillOpacity="0.35"
          fontSize="10"
          fontFamily="Poppins, sans-serif"
          fontWeight="500"
          letterSpacing="1.5"
        >
          TRIAL BALANCE
        </text>
      </g>

      {/* ── CENTER: AI processing core ── */}
      <g transform="translate(320, 220)">
        <circle cx="80" cy="80" r="76" fill={EMERALD} fillOpacity="0.06" />
        <circle
          cx="80"
          cy="80"
          r="58"
          fill="none"
          stroke={EMERALD}
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 80 80"
            to="360 80 80"
            dur="18s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="80" cy="80" r="40" fill={EMERALD} />
        <text
          x="80"
          y="74"
          textAnchor="middle"
          fill="#fff"
          fontSize="10"
          fontFamily="Poppins, sans-serif"
          fontWeight="700"
          letterSpacing="1.5"
        >
          AI
        </text>
        <text
          x="80"
          y="90"
          textAnchor="middle"
          fill="#fff"
          fontSize="9"
          fontFamily="Poppins, sans-serif"
          fontWeight="600"
          opacity="0.85"
        >
          CLASSIFY
        </text>
        {/* Flow arrows in */}
        <line
          x1="-40"
          y1="80"
          x2="22"
          y2="80"
          stroke="url(#flowGrad)"
          strokeWidth="2"
        />
        {/* Flow arrows out */}
        <line
          x1="138"
          y1="80"
          x2="200"
          y2="80"
          stroke="url(#flowGrad)"
          strokeWidth="2"
        />
      </g>

      {/* ── RIGHT: three structured statement cards ── */}
      {[
        { y: 60, label: "INCOME STATEMENT", lines: ["Revenue", "Gross profit", "Operating income", "Net income"] },
        { y: 220, label: "BALANCE SHEET", lines: ["Current assets", "Fixed assets", "Liabilities", "Equity"] },
        { y: 380, label: "CASH FLOW", lines: ["Operating CF", "Investing CF", "Financing CF", "Net change"] },
      ].map((card, i) => (
        <g key={i} transform={`translate(540, ${card.y})`}>
          <rect
            width="220"
            height="140"
            rx="12"
            fill="currentColor"
            fillOpacity="0.04"
            stroke={EMERALD}
            strokeOpacity="0.35"
            strokeWidth="1"
          />
          <rect
            x="14"
            y="14"
            width="62"
            height="18"
            rx="9"
            fill={EMERALD}
            fillOpacity="0.18"
          />
          <text
            x="45"
            y="26"
            textAnchor="middle"
            fill={EMERALD}
            fontSize="8"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
            letterSpacing="1"
          >
            {card.label}
          </text>
          {card.lines.map((line, j) => (
            <g key={j} transform={`translate(14, ${48 + j * 20})`}>
              <circle cx="4" cy="-3" r="2.5" fill={EMERALD} />
              <text
                x="14"
                y="0"
                fill="currentColor"
                fillOpacity="0.7"
                fontSize="10"
                fontFamily="Poppins, sans-serif"
              >
                {line}
              </text>
              <rect
                x="150"
                y="-7"
                width={30 + (j % 3) * 12}
                height="8"
                rx="2"
                fill="currentColor"
                fillOpacity="0.15"
              />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

/**
 * "Ask anything" — shows a chat conversation with data-grounded answers.
 * A message references a specific ledger account, demonstrating
 * "grounded in YOUR numbers" rather than generic web advice.
 */
export function AskAnythingIllustration({
  className,
  ariaLabel = "AI chat answering questions grounded in your financial data",
}: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="chatBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ACCENT_GLOW} />
          <stop offset="1" stopColor="transparent" />
        </linearGradient>
      </defs>

      <rect width="800" height="600" fill="url(#chatBg)" opacity="0.7" />

      {/* ── User question (right-aligned) ── */}
      <g transform="translate(200, 60)">
        <rect
          x="10"
          y="0"
          width="560"
          height="58"
          rx="16"
          fill="currentColor"
          fillOpacity="0.05"
          stroke="currentColor"
          strokeOpacity="0.1"
        />
        <text
          x="30"
          y="26"
          fill="currentColor"
          fillOpacity="0.85"
          fontSize="14"
          fontFamily="Poppins, sans-serif"
          fontWeight="500"
        >
          Why did gross margin drop 2 points in Q3?
        </text>
        <text
          x="30"
          y="46"
          fill="currentColor"
          fillOpacity="0.45"
          fontSize="10"
          fontFamily="Poppins, sans-serif"
        >
          · Founder, 2:14 PM
        </text>
        <circle cx="575" cy="28" r="16" fill="currentColor" fillOpacity="0.1" />
        <text
          x="575"
          y="33"
          textAnchor="middle"
          fill="currentColor"
          fillOpacity="0.65"
          fontSize="11"
          fontFamily="Poppins, sans-serif"
          fontWeight="700"
        >
          AP
        </text>
      </g>

      {/* ── AI response card ── */}
      <g transform="translate(40, 150)">
        <rect
          width="720"
          height="400"
          rx="20"
          fill="currentColor"
          fillOpacity="0.04"
          stroke={EMERALD}
          strokeOpacity="0.3"
          strokeWidth="1.2"
        />
        {/* AI avatar + label */}
        <g transform="translate(24, 24)">
          <circle cx="18" cy="18" r="18" fill={EMERALD} fillOpacity="0.15" />
          <circle cx="18" cy="18" r="10" fill={EMERALD} />
          <text
            x="18"
            y="22"
            textAnchor="middle"
            fill="#fff"
            fontSize="9"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
            letterSpacing="1"
          >
            AI
          </text>
          <text
            x="52"
            y="16"
            fill="currentColor"
            fillOpacity="0.95"
            fontSize="13"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
          >
            CortexCFO advisor
          </text>
          <text
            x="52"
            y="32"
            fill={EMERALD}
            fontSize="10"
            fontFamily="Poppins, sans-serif"
            fontWeight="600"
          >
            Looked at 4 accounts from your GL
          </text>
        </g>

        {/* Answer body lines */}
        <g transform="translate(24, 96)">
          {[
            "Three drivers, in order of magnitude:",
            "",
            "1.  COGS ratio rose 1.4pt — inventory write-offs from",
            "     two discontinued SKUs (acct 5120) absorbed ₹18L.",
            "",
            "2.  Freight costs up 0.5pt — carrier renegotiation",
            "     landed in Q4, not Q3 (acct 5240).",
            "",
            "3.  One-time audit fee (acct 6310) of ₹4L ran through",
            "     COGS by mistake. Recommend reclass to Opex.",
          ].map((line, i) => (
            <text
              key={i}
              x="0"
              y={i * 22}
              fill="currentColor"
              fillOpacity={line.startsWith("     ") ? "0.65" : line.match(/^\d/) ? "0.85" : "0.78"}
              fontSize="13"
              fontFamily={line.match(/\d|₹|acct|Q\d/) ? "JetBrains Mono, monospace" : "Poppins, sans-serif"}
              fontWeight={line.match(/^\d\./) ? "600" : "400"}
            >
              {line}
            </text>
          ))}
        </g>

        {/* Referenced accounts footer */}
        <g transform="translate(24, 340)">
          <text
            x="0"
            y="0"
            fill="currentColor"
            fillOpacity="0.4"
            fontSize="10"
            fontFamily="Poppins, sans-serif"
            fontWeight="600"
            letterSpacing="1.2"
          >
            REFERENCED ACCOUNTS
          </text>
          {["5120 · Inventory w/off", "5240 · Freight in", "6310 · Audit fees"].map(
            (a, i) => (
              <g key={a} transform={`translate(${i * 200}, 18)`}>
                <rect
                  width="180"
                  height="28"
                  rx="14"
                  fill={EMERALD}
                  fillOpacity="0.1"
                  stroke={EMERALD}
                  strokeOpacity="0.3"
                />
                <circle cx="14" cy="14" r="3" fill={EMERALD} />
                <text
                  x="24"
                  y="18"
                  fill={EMERALD}
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="600"
                >
                  {a}
                </text>
              </g>
            ),
          )}
        </g>
      </g>
    </svg>
  );
}
