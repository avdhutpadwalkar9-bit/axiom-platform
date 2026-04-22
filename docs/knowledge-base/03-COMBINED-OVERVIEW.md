# CortexCFO — Combined Overview

**Audience:** leadership, new hires of any function, anyone who needs the full picture in one document.
**Assumed familiarity:** none required beyond basic software/business literacy.
**Written:** 2026-04. **Commit at time of writing:** `df0cc48`.
**Live URL:** https://axiom-platform.vercel.app

> This document is the **master reference**. It summarizes both the engineering and the design handoffs into one narrative, with cross-references to the detailed docs:
> - [`01-TECHNICAL-HANDOFF.md`](./01-TECHNICAL-HANDOFF.md) — for the coding team
> - [`02-DESIGN-HANDOFF.md`](./02-DESIGN-HANDOFF.md) — for the design team

---

## Part 0 — The thought process behind the business

### In one paragraph

**CortexCFO is a multi-model Cognitive Engine for FP&A.** We produce Big-4-grade financial analysis and QoE (Quality-of-Earnings) reports every month, for $299, reviewed by a qualified CPA, using a pipeline of eight specialized AI models orchestrated like regions of a brain. Our customers are US SMBs ($1M–$10M revenue) preparing for M&A, and Indian MSMEs (₹10–50 Cr) preparing for PE or growth capital.

### In more detail

Three real gaps, observed by the founder across years of US QoE engagements at Mangal Analytics:

1. **Big-4 QoE engagements cost $10–25K per round, take 6–8 weeks, happen once per capital event.** Between rounds, founders have no continuous read on their own earnings quality. When a buyer's team does diligence and finds issues, it's already priced into a re-trade.

2. **Generic AI chatbots hallucinate in finance.** A CFO asking a general LLM "why did gross margin drop 2 points in Q3" gets a plausible-sounding answer that invents numbers. In finance, plausible-but-wrong is worse than silence. Every serious CFO knows this — and therefore can't trust AI yet.

3. **Template-based QoE misses sector economics.** Home-health post-PDGM, PE-backed physician practice management, SaaS ASC 606 subtleties, Amazon-platform concentration risk — generic templates don't touch them. Every sector-savvy buyer notices the gap, and the seller loses multiple.

Our architecture fills all three:
- **Continuous** (monthly packs, not 6-week one-offs)
- **Grounded** (the Verifier rejects any number not in the ledger — no hallucination surface for amounts)
- **Sector-aware** (named models + curated sector knowledge bases)

### Who runs it

- **Avdhut Padwalkar** — founder. Built the product voice and content on the back of real US QoE engagement work (Home Instead, Guardian FBA, MyOwens, Project Axis, SpartanLTC, Project Pacers, etc.)
- **Rajan Nagaraju** — co-builder, focused on commercial DD and strategic consulting angles

### The brand voice, in one rule

**Indian-business-polite crossed with an operator's crispness.** Not Big-4 corporate. Not Valley bluster. Not chatbot cheer. Read any article on `/knowledge-base` — that's the register.

Every content piece follows **Hook → Pain → Solution → tangible number**.

### What "done" looks like for a customer

1. They sign up at `/signup`
2. Verify email (6-digit code sent via Resend, expires in 10 minutes)
3. Walk through a 4-step onboarding wizard (personal → business → financial-year selection → trial-balance upload)
4. The Cognitive Engine runs — Perceptor parses the ledger, Classifier tags accounts, Reasoner computes ratios + QoE adjustments, Verifier cross-checks every number, Synthesizer writes narrative
5. They're routed to `/pricing?source=onboarding&region=us|in`, land on a celebration banner, pick a plan
6. Checkout → `/dashboard` with their first QoE pack live
7. AI CFO advisor (floating chat, bottom-right) answers follow-ups, grounded in their own numbers
8. A qualified CPA reviews before the monthly pack goes out

---

## Part 1 — What's live right now

### Live URL map

Everything below is on `https://axiom-platform.vercel.app` (until we move to `cortexcfo.com`).

#### Marketing (public)
- `/` — region-neutral landing
- `/us` — US M&A Readiness landing (5 tiers, USD pricing, ASC 606 references)
- `/in` — India PE Readiness landing (5 tiers, INR pricing, Ind AS / Tally references)
- `/about` — team, timeline, positioning
- `/product` — 4-feature tour with custom SVG illustrations + 2 kept Unsplash images
- `/how-it-works` — Cognitive Engine architecture (neural-network hero + pipeline diagram + 8-model grid + worked example)
- `/pricing` — 4-tier pricing with post-onboarding celebration banner when arrived via `?source=onboarding`
- `/checkout` — region-aware payment UI shell (no gateway wired; demo banner at top)
- `/contact` — contact form
- `/careers` — jobs
- `/terms`, `/privacy` — legal

#### Content
- `/knowledge-base` — **6 categories** (US Deal Pitfalls, Healthcare Sector, Core Concepts, Playbooks, Compliance & Standards, Integrations & Data), ~32 articles. Pill-tagged article cards + featured amber badge + newsletter signup panel.
- `/glossary` — ~140 terms covering Ind AS, US GAAP, DD vocabulary, SaaS metrics, startup finance
- `/faq` — common questions
- `/blog` — blog index (placeholder posts)

#### Auth / onboarding
- `/login`, `/signup`, `/verify-email` — split-screen auth pages
- `/onboarding` — 4-step wizard (personal → business → financial years → upload & analysis)

#### Authenticated app (requires login + verified email)
- `/dashboard` — KPI cards, ratio pack, FX strip, region pill, recent uploads, AI chat
- `/analysis` — upload + QoE lens (persisted state across tabs)
- `/qoe` — QoE Center
- `/scenarios` — scenario modeling
- `/industries` — industry expertise
- `/integrations` — accounting integrations list (region dropdown: US apps / India apps / All)
- `/feedback` — AI feedback analytics
- `/profile` — profile & business settings
- `/uploads` — upload history
- `/models` — financial models list
- `/models/[modelId]` — individual financial model

#### API + machine-readable
- `POST /api/subscribe` — Resend-backed newsletter endpoint
- `/sitemap.xml` — programmatic sitemap with hreflang (en-US → /us, en-IN → /in, x-default → /)
- `/robots.txt` — allows marketing, disallows app routes

### Live features snapshot

- **Theme toggle** — Sun/Moon pill in top nav + app sidebar + mobile menu. Persists across sessions. Works system-wide (token-driven, not page-by-page).
- **Region toggle** — 🇺🇸 US / 🇮🇳 IN pair in the top nav. Inline copy on the `/` hero too.
- **Currency system** — 5 currencies (USD/EUR/GBP/INR/JPY) with live FX from frankfurter.dev/v1. Dashboard shows a running FX strip.
- **Cognitive Engine chat** — Quick Answer (FAQ-first, ~200ms on hits, 3–5s on model calls) + Think Deeper (streamed thinking trace, 15–30s). With graceful 404 fallback.
- **Post-upload redirect** — onboarding completion → `/pricing?region=&source=onboarding` with celebration banner.
- **Newsletter** — Resend-backed on `/knowledge-base`. Welcome email with honest "still building, encryption hardening" copy. API key needs Vercel env var setup (see Technical doc §8).
- **Legacy key migration** — inline `<script>` copies `axiom-*` localStorage keys to `cortexcfo-*` on page load. Historical user data not stranded.
- **Schema.org JSON-LD** — Organization + WebSite + SoftwareApplication + Offer markup on every page for Google rich results.
- **hreflang alternates** — `/`, `/us`, `/in` cross-declare for locale-aware search.
- **Advisory disclaimer** — "Advisory, not audit" stated on every marketing page. E&O cover claim is on `/`, `/pricing`, `/how-it-works`.

---

## Part 2 — The Cognitive Engine in one page

Customer-facing framing (on `/how-it-works`):

> **Eight specialized models organized into four cognitive layers. Machines now think like brains.**

### The four layers

| # | Layer | Brain region | What happens |
|---|---|---|---|
| 01 | PERCEIVE | ≈ sensory cortex | Read the ledger. Parse any TB/GL/P&L/BS format via a 400+ synonym bank. |
| 02 | REASON | ≈ prefrontal cortex | Multi-model routing. Common questions → Quick-Match (retrieval, sub-200ms). Novel → Reasoner. Strategic → Strategist with extended reasoning. |
| 03 | SYNTHESIZE | ≈ Broca's / Wernicke's | Convert reasoning traces into board-ready narrative. Link every number to a GL account. |
| 04 | VERIFY | ≈ anterior cingulate (metacognition) | Cross-check every emitted figure against the source ledger. Hallucinated numbers can't survive. Then a human CPA reviews. |

### The eight models

| # | Model | Job | Notes |
|---|---|---|---|
| 1 | **Perceptor** | Data ingestion | Handles xlsx, csv, json, PDF, Tally XML, Zoho COA |
| 2 | **Classifier** | Account tagging | Maps to Ind AS Schedule III or US GAAP; flags low confidence for CPA |
| 3 | **Quick-Match** | FAQ retrieval | Embedding-based lookup over 60+ curated FAQs |
| 4 | **Reasoner** | Single-shot reasoning | Fast path for Quick mode novel questions |
| 5 | **Strategist** | Extended reasoning | Think-Deeper with live streaming thinking trace |
| 6 | **Synthesizer** | Narrative generation | 4 audiences (board pack, investor deck, banker memo, dashboard) |
| 7 | **Verifier** | Ground-truth checker | Rejects any $ / ₹ amount not in the GL |
| 8 | **Auditor** | Human CPA sign-off | Name + stamp + membership number on every pack |

### Critical invariants

- **Never expose vendor model names** ("Sonnet", "Haiku", "Claude", "Anthropic") in any user-visible surface. Our public framing is the 8 named models. Internal code comments can mention vendors; UI strings cannot.
- **The Verifier is mandatory.** Bypassing it removes the anti-hallucination layer. We've architected the pipeline to make bypass hard; keep it that way.
- **Ratios are stored as percentages in the backend, not fractions.** A `4.76` in the API response means 4.76%. The frontend should display it as-is with a `%` suffix, not multiply by 100. The April 2026 "476% margin" bug came from exactly that mistake.

---

## Part 3 — Tech stack at a glance

### Frontend
- **Next.js 16.2.3** (App Router, Turbopack) — this is NOT the older Next.js; breaking changes throughout. Read `frontend/AGENTS.md` before touching route code.
- **React 19.2.4** — new compiler, stable Suspense, refs as props
- **Tailwind CSS v4** — `@theme inline` with token-driven CSS variables; different setup from v3
- **Zustand** (v5) — client state with `persist` middleware
- **react-hook-form + zod** — forms
- **framer-motion** — motion, used sparingly
- **lucide-react** — icon set
- **recharts** + **ag-grid** — data viz and tables
- **Resend SDK** (v6) — newsletter

### Backend
- **FastAPI 0.115** on Python 3.12, async throughout
- **SQLAlchemy 2.0 async** + **asyncpg** over **Postgres**
- **python-jose** for JWT (HS256) + **passlib/bcrypt** for password hash
- **Anthropic SDK 0.94** (Claude) + optional Gemini / Groq fallbacks
- **Resend 2.0** for email verification

### Hosting
- **Vercel** — frontend, auto-deploy on `main` push
- **Render** — backend + managed Postgres, auto-deploy on `main` push (has failed; monitor)

### External services
- **Anthropic** (required) — pay-per-token
- **Resend** (required in prod for verification) — 3000 emails/month free
- **Frankfurter.dev** — free FX rates, called from the browser
- **Google Fonts** — Poppins + JetBrains Mono
- **Unsplash** — 2 images kept on `/product` only

---

## Part 4 — Design language summary

### Color

**Brand:** emerald-500 (`#10b981`) primary, emerald-400 hover, emerald gradient for hero accents (emerald-400 → teal-400 → cyan-400).

**Surfaces (flips with theme):**
- Dark: `#0A0A0A` canvas / `#161616` cards / `#F5F5F5` text
- Light: `#fafaf7` canvas / `#ffffff` cards / `#1a1a1a` text

Cream canvas (`#fafaf7`) for light mode — not pure white. Matches marketing page cream so the theme switch feels like one continuous brand.

**Semantic:**
- `rose-400` for negatives / errors
- `amber-400` for featured / priority / warning
- `sky-400` for informational
- On light mode, bump `emerald-400/rose-400/amber-400` text to their `700` shades for WCAG AA

### Typography

- **Poppins** (sans) — everything non-code
- **JetBrains Mono** — numbers in tables, timestamps, illustration labels

Size scale: mega hero 48–72px → section 32–44px → card 16–20px → body 14–17px → caption 11px uppercase. Below 13px, always bump weight to 500+ and color to at least `white/55`.

### Radius

- `rounded-full` — CTAs + pill tags (signal "action")
- `rounded-2xl` — standard cards
- `rounded-3xl` — hero moments (newsletter panel, post-onboarding banner)

### Key component patterns

- **CTAs:** emerald filled + `rounded-full` + `hover:scale-[1.03]` + `hover:shadow-emerald-500/30`
- **Cards:** `bg-white/[0.02]` + `border-white/8` + `rounded-2xl` + `hover:-translate-y-0.5` + `hover:border-emerald-500/40`
- **Pill tags:** 10px uppercase, `tracking-[0.14em]`, emerald background at 10% opacity + matching border
- **Inputs:** `rounded-full` for standalone fields (email capture), `rounded-xl` in form grids, emerald focus border

See `02-DESIGN-HANDOFF.md` for exhaustive patterns.

### Motion

- Every CTA: scale 1.03 + shadow on hover
- Every card: translate-y -2px + emerald glow on hover
- Every text link with arrow: arrow moves right 2px on hover
- Page entries: subtle fade-up via `<FadeIn>` wrapper
- No full-screen page transitions

---

## Part 5 — Key architectural decisions + why

### Decision: monolithic frontend on Vercel + monolithic backend on Render

**Chosen over:** microservices, serverless functions, Fly.io containers.

**Why:** we're pre-PMF. Operational simplicity > elasticity. Vercel + Render gives us automatic HTTPS, preview URLs on every PR, zero ops work. When we hit scale limits (Render's 512MB RAM free tier, or 3000 emails/month on Resend), we migrate.

### Decision: token-driven theming

**Chosen over:** parallel dark.css / light.css files, component-level dark variants, CSS-in-JS.

**Why:** one source of truth. When we change `--app-canvas`, every card / button / border that uses `bg-app-canvas` flips in lockstep. No hunting for missed references.

**Cost:** it broke once when the `@theme inline` block inlined literal values instead of var() references. We had to restructure tokens to reference intermediate variables (see commit `7b69d28`). Document this pattern — future devs will assume `@theme` without `inline` works the same.

### Decision: 8 named models + 4 cognitive layers (over "it's AI powered")

**Chosen over:** generic "AI CFO advisor" framing.

**Why:** sophisticated buyers (PE, corp dev, CFOs) see through hand-wavy AI marketing. They ask how it works. Without a defensible architecture diagram, we're one more chatbot. With `/how-it-works` showing the pipeline, we're an architecture.

The framing is honest: we really do route Quick questions through a retrieval layer before hitting the model, we really do run a Verifier cross-check, a real human CPA really does sign off. The names (Perceptor / Classifier / Quick-Match / Reasoner / Strategist / Synthesizer / Verifier / Auditor) map to real code paths.

### Decision: No vendor model names in UI

**Chosen over:** "Powered by Claude", "Claude Sonnet with Extended Thinking".

**Why:** We want the brand to sit above the vendor. If we swap Claude → Gemini → a fine-tuned local model, nothing about the customer experience should need to change. The 8-model framing is the contract; the underlying vendor is implementation detail.

### Decision: Regional split (US / IN / default)

**Chosen over:** single global landing with a currency selector.

**Why:** the value prop is different. A US $5M-revenue SMB cares about M&A readiness, ASC 606, payer mix, 1099 filings. An Indian ₹25Cr-revenue MSME cares about PE exits, Ind AS, GST, Tally migration. Separate landings let us be specific. The region toggle is the bridge.

### Decision: Multi-model ensemble framing even though we mostly use one model today

**Chosen over:** "single Claude Sonnet with careful prompting".

**Why:** it's *true* that we route Quick through retrieval + a fast model and Deep through a reasoning-capable model. It's *also true* that we're architected to slot in additional models (Gemini, Groq, a fine-tuned Verifier, etc.) as the product matures. The customer-facing story reflects both current reality and future architecture. It's not marketing theater.

---

## Part 6 — Sites / sources we've referenced

### For content

| Source | What we pulled |
|---|---|
| **Founder's prior HVG/MARC work** — Content strategy doc + Blog Topics xlsx (27 healthcare titles) | Voice guide (Hook → Pain → Solution → tangible number); 7 adapted healthcare KB articles |
| **Founder's prior US DD reports** (Guardian FBA, Home Instead, MyOwens, Axis, SpartanLTC, Project Pacers) | 9 US Deal Pitfalls KB articles grounded in real findings; 36 new glossary terms |
| **Bain Insights pages** (cfo-insights, m-and-a-report, ai, ceo-agenda) | Content framing; card-grid pattern; pill tags; newsletter panel design |
| **FAQ corpus** — internal 51-FAQ bank (27 Indian + 15 US + expansions) | Powers Quick-Match retrieval; expanded across commits `a468597`, `0072e03` |

### For design

| Source | What we took |
|---|---|
| **Bain Insights** | Card-based grid + pill tags + featured articles + newsletter signup module + editorial typography |
| **Stitch UI/UX audit** (earlier engagement) | Paired CTA pattern; dashboard feature grid with live mockups |
| **Linear / Vercel / Stripe** | Typography scale; emerald-on-dark canvas; minimal icon use; button polish |
| **Claude / Anthropic site** | "Show your work" copy voice for `/how-it-works` |

### For technology

| Tool / service | Why |
|---|---|
| Next.js 16 | Best-in-class DX, route handlers, Turbopack speed, Vercel integration |
| Tailwind v4 | Design token system that actually works |
| Zustand | Simpler than Redux, persist middleware trivial, TypeScript-first |
| FastAPI | Async-native, Pydantic validation, OpenAPI auto-docs |
| Postgres | Ind AS / US GAAP / user / workspace data. Will need more with scale. |
| Anthropic Claude | Best reasoning quality for our use case; extended thinking is a standout feature |
| Resend | Dev-friendly email API; better DX than SendGrid/Postmark/Mailgun for our volume |
| Frankfurter.dev | Free FX, no API key, cached |
| Render | Managed Postgres + Python hosting at reasonable price |
| Vercel | Zero-config Next.js deployment + preview URLs |

---

## Part 7 — Session history (how we got here)

Recent commits shipped during the late-April 2026 sprint (most recent first):

1. **`df0cc48`** — Resend-backed newsletter on `/knowledge-base`
2. **`0024938`** — KB expansion: +9 US Deal Pitfalls, +7 Healthcare Sector articles, +36 glossary terms, Bain design pickups (pill tags, newsletter panel)
3. **`75957cf`** — Cognitive Engine framework + `/how-it-works` page + de-Sonnet'd entire surface (no vendor model names visible)
4. **`7b69d28`** — System-wide dark/light theme flip (token restructure) + custom SVG illustrations on `/product`
5. **`d1b3388`** — Think-deeper 404 graceful fallback
6. **`bdde1d6`** — Phase-4 batch: tier overlap fix, text-size bumps, region toggle, checkout shell, theme toggle scaffold, US GAAP KB articles

Earlier foundational work (2025–early 2026):
- Regional split (Phase A → Phase C) — commits `a759afc`, `0072e03`, `864a8e7`
- Streaming Deep mode (Phase 4.5) — `4bd2478`
- Chat feedback + analytics (Phase 3.5) — `c6888fd`
- Quick/Deep modes + FAQ (Phases 1–3) — `5966bca`
- Marketing pivot India-first → international — `d4a604d`

See `01-TECHNICAL-HANDOFF.md` §15 for the full history with context.

---

## Part 8 — Team handoff matrix

Who owns what when the new teams come in:

| Surface | Design team | Engineering team |
|---|---|---|
| Marketing pages (`/`, `/us`, `/in`, `/product`, etc.) | Copy, layout, illustrations, CTA hierarchy | Route files, Suspense boundaries, sitemap entries |
| `/how-it-works` | SVG diagrams, content voice | Inline SVG components, page layout |
| `/knowledge-base`, `/glossary` | Content additions, pill tag variants, category icons | Data structures, search/filter, newsletter endpoint |
| Auth + onboarding (`/signup`, `/verify-email`, `/onboarding`) | Form UX, error messages, empty states | JWT flow, Resend email templates, store persistence |
| App (`(app)/*`) | Dashboard layout, empty states, chart treatments | API integration, state management, theme tokens |
| Chat panel (`AIChatPanel`) | Message bubble styling, thinking panel | SSE parsing, mode routing, fallback logic |
| Theme system | Token palette, contrast rules | `ThemeProvider`, no-flash script, override rules |
| Design system tokens | Color / spacing / radius scales, component specs | Tailwind config, CSS variable definitions |
| API routes (`/api/subscribe`) | — | Endpoint implementation, Resend integration, rate limiting |
| Content (KB articles, glossary terms, FAQ, blog) | Writing, editing, voice consistency | Data structure, search/filter, indexing |

---

## Part 9 — Open questions (decisions needed)

Listed so you don't rediscover them:

1. **Domain name.** Currently `axiom-platform.vercel.app`. Planned: `cortexcfo.com`. Needs purchase + DNS setup + Resend domain verification + update SITE_URL in `layout.tsx` and `sitemap.ts`.
2. **Payment gateway.** `/checkout` is a UI shell. Decision: Stripe for US, Razorpay for IN. Who drives integration? Time-box: 2 weeks once prioritized.
3. **Figma as source of truth** for design? Currently design lives in code. If the new design team wants Figma, establish on day 1.
4. **Test suite strategy.** We don't have one. Recommend Playwright e2e for the top 5 user flows + Vitest for ratio/currency helpers.
5. **Alembic migrations.** Currently using ad-hoc `ALTER TABLE` in the backend startup hook. Must migrate before the next schema change.
6. **Render reliability.** Multiple silent-failed auto-deploys. Either fix the webhook or move to Fly.io / Railway.
7. **Custom illustrations on `/product`.** Two Unsplash images remain. Commission replacements when bandwidth allows.
8. **Chat history persistence.** Currently session-local. Persist to Postgres to enable cross-device resume?
9. **Subscriber audience.** Resend's RESEND_AUDIENCE_ID is optional right now. Create an audience and plumb it through for mailchimp-level list management.
10. **SEO / content cadence.** We have 32 KB articles. At what cadence do we publish new ones? 1/week? 2/week? Who writes?

---

## Part 10 — Quick-start for anyone new

If you're joining CortexCFO today, do these in order. Two hours total.

### 30 minutes — experience the product as a user
1. Visit https://axiom-platform.vercel.app
2. Read the `/` landing top to bottom
3. Toggle dark/light with the nav toggle. Watch it flip site-wide.
4. Flip to US then to IN using the flag pills. Note how the content changes.
5. Click through to `/how-it-works`. Read it.
6. Skim `/knowledge-base` — expand one article in "US Deal Pitfalls"
7. Sign up for an account (use a real email so the verification code reaches you)
8. Walk the onboarding wizard, upload a sample trial balance (or skip to dashboard)
9. Open the floating chat panel (bottom-right). Ask a question in Quick mode. Then flip to Think Deeper.

### 30 minutes — read the thought process
- Part 0 of this document
- The voice section of `02-DESIGN-HANDOFF.md`
- One KB article — any one — to feel the voice

### 30 minutes — skim the codebase
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx` (landing)
- `frontend/src/components/SiteNav.tsx` (cross-cutting chrome)
- `frontend/src/app/how-it-works/page.tsx` (the architecture page you just visited)
- `backend/app/main.py`, `backend/app/routers/chat.py`, `backend/app/services/ai_service.py`

### 30 minutes — read the detailed handoff for your role
- Engineers: `01-TECHNICAL-HANDOFF.md`
- Designers: `02-DESIGN-HANDOFF.md`

---

## Part 11 — Critical invariants (don't break these)

1. **No vendor model names in UI.** "Sonnet", "Haiku", "Claude", "Anthropic" never appear in customer-facing strings. Internal comments OK.
2. **Verifier must run on every model output.** Removing it removes the anti-hallucination layer.
3. **Theme tokens are the single source of truth.** Adding a hardcoded `#hex` requires a matching override in `html.theme-light` in `globals.css`.
4. **`pctFromPercent()` and direct percent passes.** Ratios from backend are already percentages. Do not multiply by 100.
5. **Legacy localStorage migration script** in `layout.tsx` — never delete. Users who onboarded before the `axiom-*` → `cortexcfo-*` rename depend on it.
6. **404 fallback on `chatStream`.** When `/ask-stream` returns 404 the chat silently retries via `/ask` with `mode=deep`. Permanent resilience.
7. **Email verification gate on `(app)/layout.tsx`.** Unverified users redirect to `/verify-email`. Don't add authenticated pages outside this group.
8. **Schema.org JSON-LD** in `layout.tsx` — hand-written, validated. Don't remove without replacement.
9. **No personally-identifying data from DD reports** should appear in public content (KB, glossary, blog). Every example generalized. Never commit a real client name.
10. **CPA sign-off step** is mandatory for customer-facing QoE packs. No shipped monthly pack without it.

---

## Part 12 — Quick links

- **Live site:** https://axiom-platform.vercel.app
- **GitHub repo:** https://github.com/avdhutpadwalkar9-bit/axiom-platform
- **Vercel dashboard:** https://vercel.com (frontend deploy)
- **Render dashboard:** https://dashboard.render.com (backend + Postgres)
- **Resend dashboard:** https://resend.com (newsletter + verification emails)
- **Anthropic console:** https://console.anthropic.com (Claude API usage + key management)
- **Technical doc:** [`01-TECHNICAL-HANDOFF.md`](./01-TECHNICAL-HANDOFF.md)
- **Design doc:** [`02-DESIGN-HANDOFF.md`](./02-DESIGN-HANDOFF.md)

---

*End of Combined Overview. Three docs total in this folder — start here, branch to the specialized ones as needed.*
