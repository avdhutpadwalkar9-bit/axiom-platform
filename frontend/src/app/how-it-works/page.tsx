"use client";

/**
 * /how-it-works — the CortexCFO Cognitive Engine architecture page.
 *
 * Positioning: machines now think like brains. We walk a client through
 * a 4-layer cognitive framework (Perceive → Reason → Synthesize → Verify),
 * show each of our named component models (Perceptor, Classifier,
 * Quick-Match, Reasoner, Strategist, Verifier, Synthesizer, Auditor),
 * and demonstrate how the pipeline grounds every answer in the user's
 * own ledger so nothing hallucinates.
 *
 * Design note: every visual is inline SVG so the page renders crisp on
 * any device and reads cleanly on both dark and light themes. No stock
 * photos, no marketing illustrations — just architectural diagrams that
 * a CFO / CA / PE buyer can take seriously.
 */

import Link from "next/link";
import type { ReactElement } from "react";
import {
  ArrowRight,
  Brain,
  Eye,
  Network,
  FileCheck,
  Sparkles,
  Shield,
  Zap,
  Target,
  Layers,
  GitBranch,
  BookOpen,
  CircleCheck,
  AlertTriangle,
} from "lucide-react";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { FadeIn } from "@/components/Animate";

/* ================================================================= */
/*  Framework data — keep content close to where it's rendered so    */
/*  future tweaks don't hunt across the file.                         */
/* ================================================================= */

// The 4 cognitive layers — mirror brain-region analogies in tooltips
// so the "thinks like a brain" framing is concrete, not hand-wavy.
const LAYERS = [
  {
    id: "perceive",
    num: "01",
    icon: Eye,
    name: "PERCEIVE",
    brain: "≈ sensory cortex",
    headline: "We read your ledger the way a CFO reads it.",
    blurb:
      "Trial balance, general ledger, P&L, balance sheet — uploaded in any format our Perceptor can parse. Columns are detected by synonym matching (400+ known header variants across QuickBooks / Xero / Tally / Zoho / Busy), not templates, so your CoA doesn't have to change.",
    models: ["Perceptor", "Classifier"],
  },
  {
    id: "reason",
    num: "02",
    icon: Brain,
    name: "REASON",
    brain: "≈ prefrontal cortex",
    headline: "Multi-model reasoning — the right brain for the job.",
    blurb:
      "Every question is routed to the right model. Common asks hit Quick-Match (a retrieval model over our curated FAQ corpus) and return in 200ms. Novel asks go to the Reasoner for single-shot reasoning, or the Strategist with extended reasoning when the user asks us to think deeper. One question, one brain — never an over-sized model for a small question.",
    models: ["Quick-Match", "Reasoner", "Strategist"],
  },
  {
    id: "synthesize",
    num: "03",
    icon: Network,
    name: "SYNTHESIZE",
    brain: "≈ Broca's / Wernicke's area",
    headline: "We explain it back to you in plain language.",
    blurb:
      "The Synthesizer converts reasoning traces and raw calculations into board-ready narrative. Add-back schedules get ranked by magnitude and defensibility. Ratios carry their formulas and benchmarks. Every number links back to the GL account that produced it — not a paraphrase of general knowledge.",
    models: ["Synthesizer"],
  },
  {
    id: "verify",
    num: "04",
    icon: FileCheck,
    name: "VERIFY",
    brain: "≈ anterior cingulate (metacognition)",
    headline: "We check our own work — then a CPA checks it too.",
    blurb:
      "The Verifier cross-checks every emitted number against the source GL. Hallucinated figures can't survive this step — if the amount isn't in the ledger, it's flagged and re-generated. Then a qualified licensed CPA reviews and signs every customer-facing report before delivery. Two layers of truth, not one.",
    models: ["Verifier", "Auditor (human CPA)"],
  },
];

// Each named model in the ensemble. Keep these honest — the descriptions
// map to real architectural roles, so customers asking detail questions
// get coherent answers from any team member.
const MODELS = [
  {
    name: "Perceptor",
    role: "Data ingestion",
    desc: "Parses the uploaded trial balance / GL / P&L / BS into a normalized internal schema. Handles Excel, CSV, JSON, Tally XML, and Zoho Books exports. Tolerates messy headers via a 400+-term synonym bank.",
    icon: Eye,
  },
  {
    name: "Classifier",
    role: "Account tagging",
    desc: "Maps every ledger account to the right statement line under either Ind AS Schedule III or US GAAP. Trained on a labelled corpus of Indian + US SMB charts of accounts. Emits a confidence score per tag; anything below 0.75 gets flagged for CPA review.",
    icon: Layers,
  },
  {
    name: "Quick-Match",
    role: "FAQ retrieval",
    desc: "A retrieval model over our curated FAQ bank of ~60 Indian and US-SMB financial questions. Matches incoming questions by embedding similarity, falls through to the Reasoner when no answer clears the 0.82 confidence threshold. Sub-200ms on hits.",
    icon: Zap,
  },
  {
    name: "Reasoner",
    role: "Single-shot reasoning",
    desc: "Handles novel questions that don't hit the FAQ layer. Produces direct, grounded answers using the user's live financials as context. Typical latency 3–5 seconds. The workhorse of Quick mode.",
    icon: Sparkles,
  },
  {
    name: "Strategist",
    role: "Extended reasoning",
    desc: "The Think-Deeper model. Runs multi-step chain-of-thought with a visible reasoning trace before emitting the answer. Used for strategic questions — fundraising readiness, scenario trade-offs, deal-structure guidance. Streams its thinking live so the founder sees it reason.",
    icon: Brain,
  },
  {
    name: "Synthesizer",
    role: "Narrative generation",
    desc: "Converts reasoning output and deterministic calculations into board-ready language. Handles formatting, pacing, and tone for four audiences: board pack, investor deck, banker memo, internal dashboard.",
    icon: BookOpen,
  },
  {
    name: "Verifier",
    role: "Ground-truth checker",
    desc: "Cross-checks every figure in the emitted response against the source ledger. Hallucinations don't survive. If an amount referenced in the narrative isn't in the GL, the response is rejected and regenerated. This is how we eliminate the most-feared AI risk in finance.",
    icon: Shield,
  },
  {
    name: "Auditor (human CPA)",
    role: "Sign-off",
    desc: "Every customer-facing report is reviewed and signed by a qualified licensed CPA before delivery. Name, stamp, and membership number on every pack. Machine speed, human accountability.",
    icon: CircleCheck,
  },
];

const DIFFERENTIATORS = [
  {
    icon: Target,
    title: "Every number traces back to your ledger.",
    desc: "The Verifier rejects any figure the Synthesizer emits if it isn't present in the GL. Zero hallucination surface for dollar amounts.",
  },
  {
    icon: GitBranch,
    title: "Model routing, not monolithic calls.",
    desc: "We don't throw every question at one big model. FAQ hits skip the expensive model entirely; strategic questions get extended reasoning. Cost and latency scale with the question, not the platform.",
  },
  {
    icon: Shield,
    title: "Two-layer truth: machine + CPA.",
    desc: "Machines are fast and tireless. Humans hold professional liability. Our pipeline runs both — every report goes out with a CPA signature, a membership number, and E&O cover.",
  },
  {
    icon: AlertTriangle,
    title: "Deterministic formulas on top of reasoning.",
    desc: "Ratio math, add-back schedules, and ASC 606 / Ind AS 115 logic run in deterministic code — not probabilistic generation. The Reasoner decides what to compute; the compute itself is exact.",
  },
];

/* ================================================================= */
/*  Diagrams — inline SVG so they render on any device + theme.      */
/* ================================================================= */

function PipelineDiagram() {
  return (
    <svg
      viewBox="0 0 1200 420"
      className="w-full h-auto text-white"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Four-layer cognitive pipeline: Perceive, Reason, Synthesize, Verify"
    >
      <defs>
        <linearGradient id="pipeFlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34d399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="nodeGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.2" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Input card (your ledger) */}
      <g transform="translate(10, 150)">
        <rect
          width="160"
          height="120"
          rx="12"
          fill="currentColor"
          fillOpacity="0.04"
          stroke="currentColor"
          strokeOpacity="0.15"
        />
        <text
          x="80"
          y="30"
          textAnchor="middle"
          fill="currentColor"
          fillOpacity="0.6"
          fontSize="9"
          fontFamily="Poppins, sans-serif"
          fontWeight="600"
          letterSpacing="1.5"
        >
          YOUR LEDGER
        </text>
        {[45, 60, 75, 90].map((y, i) => (
          <g key={i}>
            <rect
              x="20"
              y={y}
              width="70"
              height="5"
              rx="2"
              fill="currentColor"
              fillOpacity="0.35"
            />
            <rect
              x="100"
              y={y}
              width="40"
              height="5"
              rx="2"
              fill="currentColor"
              fillOpacity="0.25"
            />
          </g>
        ))}
      </g>

      {/* Four layer nodes */}
      {[
        { x: 220, color: "#10b981", label: "PERCEIVE", sub: "Perceptor · Classifier" },
        { x: 460, color: "#06b6d4", label: "REASON", sub: "Quick-Match · Reasoner · Strategist" },
        { x: 700, color: "#8b5cf6", label: "SYNTHESIZE", sub: "Synthesizer" },
        { x: 940, color: "#f59e0b", label: "VERIFY", sub: "Verifier · CPA" },
      ].map((node, i) => (
        <g key={i} transform={`translate(${node.x}, 140)`}>
          {/* Glow halo */}
          <circle cx="70" cy="70" r="100" fill="url(#nodeGlow)" />
          {/* Ring */}
          <circle
            cx="70"
            cy="70"
            r="64"
            fill="none"
            stroke={node.color}
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          {/* Core */}
          <circle cx="70" cy="70" r="48" fill={node.color} fillOpacity="0.1" />
          <circle cx="70" cy="70" r="40" fill={node.color} />
          <text
            x="70"
            y="68"
            textAnchor="middle"
            fill="#fff"
            fontSize="9"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
            letterSpacing="1.5"
          >
            {`0${i + 1}`}
          </text>
          <text
            x="70"
            y="82"
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontFamily="Poppins, sans-serif"
            fontWeight="700"
            letterSpacing="1.2"
            opacity="0.9"
          >
            {node.label}
          </text>
          {/* Name + models below */}
          <text
            x="70"
            y="160"
            textAnchor="middle"
            fill="currentColor"
            fillOpacity="0.45"
            fontSize="10"
            fontFamily="Poppins, sans-serif"
          >
            {node.sub}
          </text>
        </g>
      ))}

      {/* Flow connectors */}
      {[180, 370, 610, 850].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            y1="210"
            x2={x + 70}
            y2="210"
            stroke="url(#pipeFlow)"
            strokeWidth="2"
          />
          <polygon
            points={`${x + 65},205 ${x + 75},210 ${x + 65},215`}
            fill="#34d399"
            fillOpacity="0.7"
          />
        </g>
      ))}

      {/* Output card */}
      <g transform="translate(1070, 150)">
        <rect
          width="120"
          height="120"
          rx="12"
          fill="#34d399"
          fillOpacity="0.08"
          stroke="#34d399"
          strokeOpacity="0.4"
        />
        <text
          x="60"
          y="30"
          textAnchor="middle"
          fill="#34d399"
          fontSize="9"
          fontFamily="Poppins, sans-serif"
          fontWeight="700"
          letterSpacing="1.5"
        >
          QoE PACK
        </text>
        <circle cx="60" cy="70" r="22" fill="#34d399" />
        <path
          d="M 50 70 L 57 77 L 72 62"
          fill="none"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="60"
          y="105"
          textAnchor="middle"
          fill="currentColor"
          fillOpacity="0.55"
          fontSize="9"
          fontFamily="Poppins, sans-serif"
        >
          CPA-signed
        </text>
      </g>
    </svg>
  );
}

function BrainHeroIllustration() {
  return (
    <svg
      viewBox="0 0 600 420"
      className="w-full h-auto text-white"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Neural network rendering as a stylized brain"
    >
      <defs>
        <radialGradient id="brainGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.22" />
          <stop offset="1" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="synapse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" stopOpacity="0.6" />
          <stop offset="1" stopColor="#06b6d4" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <ellipse cx="300" cy="210" rx="280" ry="180" fill="url(#brainGlow)" />

      {/* Neural nodes — pseudo-random-but-deterministic positions */}
      {(() => {
        const nodes = [
          [150, 120], [220, 90], [310, 80], [400, 95], [470, 130],
          [130, 200], [200, 170], [280, 160], [360, 175], [440, 200], [510, 220],
          [170, 260], [250, 250], [330, 270], [410, 260], [490, 290],
          [200, 330], [290, 340], [380, 330],
        ] as const;
        // Connect nearby nodes for a neural look
        const lines: ReactElement[] = [];
        nodes.forEach((a, i) => {
          nodes.forEach((b, j) => {
            if (j <= i) return;
            const dx = a[0] - b[0];
            const dy = a[1] - b[1];
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              lines.push(
                <line
                  key={`${i}-${j}`}
                  x1={a[0]}
                  y1={a[1]}
                  x2={b[0]}
                  y2={b[1]}
                  stroke="url(#synapse)"
                  strokeWidth={d < 70 ? 1.5 : 1}
                  strokeOpacity={d < 70 ? 0.75 : 0.35}
                />,
              );
            }
          });
        });
        return (
          <>
            {lines}
            {nodes.map((n, i) => (
              <g key={`n-${i}`}>
                <circle
                  cx={n[0]}
                  cy={n[1]}
                  r={i % 4 === 0 ? 6 : 4}
                  fill="#34d399"
                  fillOpacity={i % 3 === 0 ? 1 : 0.7}
                />
                {i % 5 === 0 && (
                  <circle
                    cx={n[0]}
                    cy={n[1]}
                    r="10"
                    fill="none"
                    stroke="#34d399"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                  >
                    <animate
                      attributeName="r"
                      values="4;14;4"
                      dur="2.4s"
                      repeatCount="indefinite"
                      begin={`${(i * 0.2) % 2}s`}
                    />
                    <animate
                      attributeName="stroke-opacity"
                      values="0.5;0;0.5"
                      dur="2.4s"
                      repeatCount="indefinite"
                      begin={`${(i * 0.2) % 2}s`}
                    />
                  </circle>
                )}
              </g>
            ))}
          </>
        );
      })()}
    </svg>
  );
}

/* ================================================================= */
/*  Page                                                              */
/* ================================================================= */

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* ────────────────────────── HERO ────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeIn>
            <div className="grid lg:grid-cols-[1fr_520px] gap-12 items-center">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-5">
                  How It Works
                </p>
                <h1 className="text-[44px] md:text-[58px] lg:text-[68px] font-bold leading-[1.02] tracking-tight mb-6">
                  Machines now
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    think like brains.
                  </span>
                </h1>
                <p className="text-[17px] lg:text-[19px] text-white/70 leading-relaxed max-w-xl mb-8">
                  The CortexCFO Cognitive Engine is a multi-model architecture.
                  Eight specialized models, routed like brain regions, each
                  doing one thing well. The result: a financial analysis
                  pipeline that reasons like a CFO, computes like a spreadsheet,
                  and gets signed by a real CPA before you ever see it.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#pipeline"
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-full transition-all text-[14px] hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/30"
                  >
                    See the architecture
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#models"
                    className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-6 py-3 rounded-full border border-white/15 hover:border-white/30 transition-colors text-[14px]"
                  >
                    The eight models
                  </Link>
                </div>
              </div>
              <div className="order-first lg:order-last">
                <BrainHeroIllustration />
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── Why not one big model? ────────── */}
      <section className="py-20 px-6 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
                The thesis
              </p>
              <h2 className="text-[32px] lg:text-[40px] font-bold tracking-tight leading-[1.1] mb-4">
                One brain. Many regions.
              </h2>
              <p className="text-[16px] lg:text-[17px] text-white/70 leading-relaxed">
                Your visual cortex doesn&rsquo;t do language. Your prefrontal
                cortex doesn&rsquo;t do balance. Evolution built specialized
                modules because intelligence isn&rsquo;t one thing. We built
                CortexCFO the same way. Every question gets routed to the
                model that&rsquo;s actually good at answering it.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                bad: "Ask a generic chatbot 'what&apos;s my runway'",
                good: "The Perceptor reads your GL. The Classifier tags cash. The Reasoner applies the burn-rate formula. The Verifier cross-checks against the ledger. You get a number you can show the board.",
              },
              {
                bad: "Run a big model on every question",
                good: "Quick-Match answers the common ones in 200ms with zero model cost. Only novel questions hit the Reasoner. Only strategic questions hit the Strategist. Right brain, right job.",
              },
              {
                bad: "Trust a hallucinated EBITDA",
                good: "The Verifier refuses to emit any dollar figure that isn&rsquo;t present in the source ledger. Then a human CPA signs the final report. Two-layer truth.",
              },
            ].map((pair, i) => (
              <FadeIn key={i} delay={i * 80}>
                <div className="h-full bg-white/[0.02] border border-white/8 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-rose-400">
                      What most AI does
                    </p>
                  </div>
                  <p
                    className="text-[14px] text-white/55 leading-relaxed mb-5"
                    dangerouslySetInnerHTML={{ __html: pair.bad }}
                  />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <CircleCheck className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-emerald-400">
                      What we do
                    </p>
                  </div>
                  <p
                    className="text-[14px] text-white/80 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: pair.good }}
                  />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ────────── The 4-layer pipeline diagram ────────── */}
      <section id="pipeline" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              The architecture
            </p>
            <h2 className="text-[32px] lg:text-[44px] font-bold tracking-tight leading-[1.1] mb-4">
              The Cognitive Engine pipeline.
            </h2>
            <p className="text-[16px] lg:text-[17px] text-white/70 leading-relaxed">
              Four layers, eight models. Your ledger goes in on the left; a
              CPA-signed QoE pack comes out on the right. Every number in
              that pack is traceable to an account in your books.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 lg:p-10">
              <PipelineDiagram />
            </div>
          </FadeIn>

          {/* Four layer cards */}
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            {LAYERS.map((layer, i) => {
              const Icon = layer.icon;
              return (
                <FadeIn key={layer.id} delay={i * 60}>
                  <div className="group h-full bg-white/[0.02] border border-white/8 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-emerald-400">
                            Layer {layer.num}
                          </p>
                          <p className="text-[10px] text-white/40 italic mt-0.5">
                            {layer.brain}
                          </p>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[20px] font-semibold text-white leading-snug mb-2 tracking-tight">
                      {layer.name}
                    </h3>
                    <p className="text-[15px] text-white/70 leading-relaxed mb-4">
                      {layer.headline}
                    </p>
                    <p className="text-[14px] text-white/55 leading-relaxed mb-4">
                      {layer.blurb}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                      <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/40 w-full mb-1">
                        Models
                      </p>
                      {layer.models.map((m) => (
                        <span
                          key={m}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 font-medium"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── The 8 named models ────────── */}
      <section id="models" className="py-24 px-6 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              The ensemble
            </p>
            <h2 className="text-[32px] lg:text-[44px] font-bold tracking-tight leading-[1.1] mb-4">
              Eight models. One Cognitive Engine.
            </h2>
            <p className="text-[16px] lg:text-[17px] text-white/70 leading-relaxed">
              Each model has a job description. When you click &ldquo;Think
              deeper&rdquo; in the chat panel, you&rsquo;re routing to the
              Strategist. When you upload a trial balance, the Perceptor and
              Classifier wake up. Full org chart below.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.map((m, i) => {
              const Icon = m.icon;
              return (
                <FadeIn key={m.name} delay={i * 40}>
                  <div className="group h-full bg-white/[0.02] border border-white/8 rounded-2xl p-5 transition-all duration-300 hover:border-emerald-500/40 hover:-translate-y-0.5 hover:bg-white/[0.04]">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-[16px] font-semibold text-white mb-1 tracking-tight">
                      {m.name}
                    </h3>
                    <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-emerald-400 mb-3">
                      {m.role}
                    </p>
                    <p className="text-[13px] text-white/60 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── Worked example ────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              A worked example
            </p>
            <h2 className="text-[32px] lg:text-[40px] font-bold tracking-tight leading-[1.1] mb-4">
              One question, end-to-end.
            </h2>
            <p className="text-[16px] text-white/70 leading-relaxed">
              What happens when a founder asks &ldquo;Why did my gross margin
              drop 2 points in Q3?&rdquo;
            </p>
          </FadeIn>

          <FadeIn>
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 lg:p-8 space-y-5">
              {[
                {
                  step: "t=0ms",
                  who: "Perceptor",
                  what: 'Reads question. Detects intent: "margin change analysis", period: "Q3", reference: "gross margin".',
                },
                {
                  step: "t=40ms",
                  who: "Quick-Match",
                  what:
                    "Runs retrieval over 60 curated FAQs. No match clears 0.82 threshold (the question is specific to this user's numbers). Routes to the Reasoner.",
                },
                {
                  step: "t=80ms",
                  who: "Classifier",
                  what:
                    'Pulls the user\'s Q3 and Q2 trial balances. Tags every revenue, COGS, and direct-cost account. Emits two ranked account lists sorted by Q3-vs-Q2 delta.',
                },
                {
                  step: "t=120ms",
                  who: "Reasoner",
                  what:
                    "Given the ranked deltas + business context, reasons about likely drivers: inventory write-offs, freight cost spikes, mis-classifications. Produces a ranked hypothesis list.",
                },
                {
                  step: "t=3.4s",
                  who: "Verifier",
                  what:
                    "For every rupee-amount the Reasoner cites (e.g. ₹18L inventory write-off on acct 5120), checks the GL. If the amount isn't present, rejects and re-prompts. Everything checks out.",
                },
                {
                  step: "t=3.6s",
                  who: "Synthesizer",
                  what:
                    "Converts the verified reasoning into a 3-point answer with the referenced account numbers inline, formatted for the chat panel.",
                },
                {
                  step: "t=3.7s",
                  who: "Delivered",
                  what:
                    "Answer appears in the chat with 3 referenced-account chips. Total time: ~3.7 seconds. Cost: one single-shot model call + cached retrieval + deterministic compute.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 pb-5 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <div className="flex-shrink-0 w-24">
                    <p className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-1 rounded-md inline-block">
                      {step.step}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-white mb-1">
                      {step.who}
                    </p>
                    <p className="text-[14px] text-white/65 leading-relaxed">
                      {step.what}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ────────── Differentiators ────────── */}
      <section className="py-24 px-6 bg-[#0d0d0d] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
              Why this matters
            </p>
            <h2 className="text-[32px] lg:text-[40px] font-bold tracking-tight leading-[1.1] mb-4">
              Engineering choices that
              <br />
              a PE buyer can underwrite.
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-5">
            {DIFFERENTIATORS.map((d, i) => {
              const Icon = d.icon;
              return (
                <FadeIn key={d.title} delay={i * 60}>
                  <div className="h-full bg-white/[0.02] border border-white/8 rounded-2xl p-6 hover:border-emerald-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-[17px] font-semibold text-white leading-snug mb-2 tracking-tight">
                      {d.title}
                    </h3>
                    <p className="text-[14px] text-white/65 leading-relaxed">
                      {d.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────── Closing CTA ────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-[36px] lg:text-[48px] font-bold tracking-tight leading-[1.05] mb-5">
              Give it a ledger.
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Watch it think.
              </span>
            </h2>
            <p className="text-[18px] text-white/70 leading-relaxed mb-8 max-w-xl mx-auto">
              Upload your trial balance. The Perceptor reads it in seconds.
              The pipeline does the rest. A qualified CPA signs off before
              you see it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-4 rounded-full transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/30 text-[14px]"
              >
                Start free — no card required
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/product"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium px-6 py-4 rounded-full border border-white/15 hover:border-white/30 transition-colors text-[14px]"
              >
                See the product
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
