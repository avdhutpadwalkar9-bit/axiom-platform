# CortexCFO — Technical Handoff

**Audience:** the engineering team taking over build and maintenance.
**Assumed familiarity:** TypeScript, React, Next.js App Router, Python, FastAPI.
**Written:** 2026-04. **Commit at time of writing:** `df0cc48`.

---

## Part 0 — The thought process behind the business

### What CortexCFO is

CortexCFO is a **multi-model Cognitive Engine for FP&A** — specifically built for the **Quality-of-Earnings (QoE) problem** in the US $1M–$10M SMB segment and the Indian ₹10–50 Cr MSME segment.

In one sentence: *we produce Big-4-grade financial analysis and QoE packs every month, for $299, reviewed by a qualified CPA, using a pipeline of eight specialized AI models.*

### Why this product exists

Three converging gaps:

1. **Big-4 QoE engagements cost $10–25K per round, take 6–8 weeks, and happen once.** A founder raising capital pays that every time they raise. Between rounds, they have nothing — no continuous read on their own earnings quality.
2. **Generic AI chatbots hallucinate numbers.** A CFO asking ChatGPT "why did my margin drop 2 points" gets a plausible-sounding answer with no grounding in the actual ledger. That's dangerous in any finance conversation.
3. **Template-based QoE misses sector-specific economics.** Home-health post-PDGM, PE-backed physician practice management, SaaS ASC 606 subtleties — generic templates don't touch them. Every serious buyer notices.

The product fills all three: continuous, grounded, sector-aware. Priced to be accessible to businesses that can't justify the Big-4 fee.

### Who the founder is, and why that matters for design choices

**Avdhut Padwalkar** (founder) spent years on the US QoE desk at Mangal Analytics (MARC). Every DD finding, every add-back dispute, every re-trade scenario you'll read in our Knowledge Base is drawn from **real engagements** he ran. The voice of the product — direct, operator-grade, zero fluff — reflects that source.

**Rajan Nagaraju** is the co-builder, focused on strategic consulting / commercial DD angles and applying to top MiM / MSc programs.

The brand voice is **Indian-business-polite with an operator's crispness**. Not corporate fluff, not Silicon Valley bluster. When in doubt, read any article on `/knowledge-base` and match that register.

### What "done" looks like

A founder uploads a trial balance → within minutes, they see a boardroom-ready analysis with ratios, adjusted EBITDA, add-back schedule, compliance flags, and an AI CFO advisor they can interrogate. A qualified CPA has signed off before they see any output. The whole thing costs $99–$2,499/month depending on the tier.

### Positioning by region (important — this shapes a lot of code)

- **US landing (`/us`):** frames as **M&A Readiness**. Five tiers mapped to revenue bands: Starter (< $1M) → Growth ($1–5M) → Diligence ($5M+) → Pre-M&A → QoE-Ready. Voice leans toward PE/strategic acquirers.
- **India landing (`/in`):** frames as **PE Readiness**. Same five-tier ladder with INR pricing, Indian accounting references (Ind AS, GST, PAN/GSTIN), Indian integrations (Tally, Zoho, Busy, HDFC, ICICI).
- **Default landing (`/`):** region-neutral, defaults to USD, serves visitors outside US/India timezones.

A visitor's IP timezone (`Intl.DateTimeFormat`) nudges them to the right landing on first visit (handled by `<RegionPicker />`). They can also explicitly flip with the US/IN toggle in the nav.

### Monetization

Pricing tiers live on `/pricing`. Plan slug + region is passed to `/checkout?plan=X&region=Y`. The checkout is a **UI-only shell** — no payment gateway is wired yet (intentional — see Section 11).

---

## Part 1 — High-level system architecture

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    USER (browser)                           │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTPS
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │            FRONTEND — Next.js 16 on Vercel                  │
 │  • App Router (/src/app)                                    │
 │  • React 19.2, Tailwind v4                                  │
 │  • Zustand stores (persisted to localStorage)               │
 │  • ThemeProvider (.theme-dark | .theme-light on <html>)     │
 │  • FxContext (live currency conversion)                     │
 │  • POST /api/subscribe → Resend (newsletter)                │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTPS (Bearer JWT)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │            BACKEND — FastAPI on Render                      │
 │  • /api/auth/*    (signup, login, verify-email, me)         │
 │  • /api/analysis/* (trial-balance upload + QoE lens)        │
 │  • /api/chat/ask, /ask-stream (Cognitive Engine entry)      │
 │  • /api/chat/feedback (thumbs up/down analytics)            │
 │  • /api/profile, /models, /scenarios, /variables, /compute  │
 │  • Postgres via SQLAlchemy async                            │
 └──────┬──────────────────┬──────────────────┬────────────────┘
        │                  │                  │
        ▼                  ▼                  ▼
 ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐
 │ Postgres DB  │ │  Anthropic   │ │  Resend (transactional) │
 │  on Render   │ │  (Claude)    │ │  — welcome + verify     │
 └──────────────┘ │  ± Gemini    │ └──────────────────────────┘
                  │  ± Groq      │
                  └──────────────┘

 FX:  frankfurter.dev/v1 (called directly from the frontend browser)
```

Three machines you need to know about:

| Layer | Host | Deploy trigger | URL |
|---|---|---|---|
| Frontend | **Vercel** | auto on push to `main` | `https://axiom-platform.vercel.app` |
| Backend  | **Render** | auto on push to `main` (has failed before — see §15) | `https://axiom-platform.onrender.com` |
| Database | **Render Postgres** | managed with backend | internal connection string |

---

## Part 2 — Tech stack

### Frontend dependencies (from `frontend/package.json`)

| Package | Version | Role |
|---|---|---|
| `next` | `16.2.3` | **Framework. Breaking changes from older Next. See `frontend/AGENTS.md`.** |
| `react` / `react-dom` | `19.2.4` | React 19 — new compiler, stable Suspense |
| `typescript` | `^5` | strict mode on |
| `tailwindcss` | `^4` | **v4 is a major shift** — uses `@theme inline` + CSS-variable token pattern. See `src/app/globals.css` |
| `tw-animate-css` | `^1.4.0` | Adds `animate-*` utility classes |
| `@base-ui/react` | `^1.3.0` | Primitive UI components (layered under shadcn) |
| `shadcn` | `^4.2.0` | Copy-paste component framework |
| `zustand` | `^5.0.12` | Client state with `persist` middleware |
| `zod` | `^4.3.6` | Runtime validation (used in react-hook-form resolvers) |
| `react-hook-form` + `@hookform/resolvers` | `^7.72` + `^5.2` | Forms |
| `framer-motion` | `^12.38` | Motion for page transitions + select micro-interactions |
| `lucide-react` | `^1.8.0` | Icon set (we use ~50 icons) |
| `recharts` | `^3.8.1` | Dashboard + analysis charts |
| `ag-grid-community` + `ag-grid-react` | `^35.2.1` | Large tabular data (trial balance viewer) |
| `react-markdown` + `remark-gfm` | `^10.1` + `^4.0.1` | Render AI responses with tables/lists |
| `date-fns` | `^4.1.0` | Date math |
| `mathjs` | `^15.2.0` | Formula evaluation in models |
| `jspdf` + `jspdf-autotable` | `^4.2` + `^5.0.7` | Export QoE packs to PDF |
| `sonner` | `^2.0.7` | Toast notifications |
| `resend` | `^6.12.2` | Newsletter + transactional email |
| `clsx`, `tailwind-merge`, `class-variance-authority` | — | className composition helpers |

### Backend dependencies (from `backend/requirements.txt`)

| Package | Version | Role |
|---|---|---|
| `fastapi` | `0.115.0` | HTTP framework |
| `uvicorn[standard]` | `0.30.0` | ASGI server |
| `sqlalchemy[asyncio]` | `2.0.35` | ORM |
| `asyncpg` | `0.29.0` | Postgres async driver |
| `aiosqlite` | `0.22.1` | SQLite async driver (local dev) |
| `alembic` | `1.13.0` | DB migrations |
| `python-jose[cryptography]` | `3.3.0` | JWT |
| `passlib[bcrypt]` + `bcrypt` | `1.7.4` + `5.0.0` | Password hashing |
| `python-dotenv` | `1.0.1` | `.env` loader |
| `httpx` | `0.27.0` | Async HTTP client (used for Gemini/Groq fallbacks) |
| `pydantic[email-validator]` + `pydantic-settings` | `2.9` + `2.5` | Settings + validation |
| `anthropic` | `0.94.0` | Claude SDK |
| `openpyxl` | `3.1.5` | Excel parsing (trial balances) |
| `pypdf` | `5.1.0` | PDF parsing (audited financials) |
| `resend` | `2.0.0` | Email verification |

### External services we consume

| Service | What for | Cost model |
|---|---|---|
| **Vercel** | Frontend host + CDN + preview URLs | Free tier sufficient; bump to Pro when we need longer build minutes |
| **Render** | Backend + Postgres | Free tier has cold-start + 512MB RAM limit; $7/month Starter recommended |
| **Anthropic** | Claude (the Reasoner + Strategist) | Pay-per-token; Sonnet ~$3/M input, ~$15/M output |
| **Google AI Studio** | Gemini (optional fallback) | Free tier generous |
| **Groq** | Llama 3.3 70B (optional fallback) | Free tier |
| **Resend** | Transactional + newsletter email | 3,000 emails/month free, then $20/month |
| **Frankfurter.dev** | FX rates (USD/EUR/GBP/INR/JPY) | Free, no key required |
| **Google Fonts** | Poppins + JetBrains Mono | Free |
| **Unsplash** (2 images only) | `/product` hero backgrounds for two feature blocks | Free, attribution not required for our usage |

### Important note on Next.js 16

This is **NOT** the Next.js that older LLMs know. Breaking changes:
- Route handlers are in `src/app/**/route.ts` — NOT `src/pages/api/*.ts`
- Server components are the default; add `"use client"` explicitly at the top of any file that uses hooks or `window`
- `useSearchParams()` MUST be wrapped in `<Suspense>` or build fails
- Turbopack is the default bundler. Faster HMR than Webpack.
- `AGENTS.md` lives in `frontend/` — **read node_modules/next/dist/docs/ before writing route code** if you've never touched Next 16.

---

## Part 3 — Repository layout

```
fp-and-a/
├── frontend/                     # Next.js 16 app
│   ├── AGENTS.md                 # "This is NOT the Next.js you know"
│   ├── CLAUDE.md                 # Alias to AGENTS.md
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts        # mostly empty — v4 uses @theme in globals.css
│   ├── .env.local                # local API URL
│   ├── .env.production           # prod API URL
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # Root layout + Schema.org + no-flash theme script
│       │   ├── page.tsx          # / (region-neutral landing)
│       │   ├── us/page.tsx       # /us landing
│       │   ├── in/page.tsx       # /in landing
│       │   ├── how-it-works/     # /how-it-works (Cognitive Engine page)
│       │   ├── product/          # /product
│       │   ├── pricing/          # /pricing (region-aware, post-onboarding banner)
│       │   ├── checkout/         # /checkout (UI shell, no gateway)
│       │   ├── knowledge-base/   # /knowledge-base (6 categories, newsletter)
│       │   ├── glossary/         # /glossary (~140 terms)
│       │   ├── faq/, blog/,
│       │   ├── about/, contact/, careers/
│       │   ├── terms/, privacy/
│       │   ├── onboarding/       # /onboarding (post-signup data capture)
│       │   ├── (auth)/           # group: login/, signup/, verify-email/
│       │   ├── (app)/            # group: authenticated app routes
│       │   │   ├── layout.tsx    # sidebar + theme toggle + auth gate
│       │   │   ├── dashboard/, analysis/, qoe/
│       │   │   ├── scenarios/, industries/
│       │   │   ├── integrations/, feedback/
│       │   │   ├── profile/, uploads/
│       │   ├── (dashboard)/      # group: financial model workspace
│       │   │   ├── layout.tsx    # separate chrome from (app)
│       │   │   ├── models/       # /models index
│       │   │   └── models/[modelId]/ # /models/abc123 dynamic
│       │   ├── api/
│       │   │   └── subscribe/route.ts  # Resend newsletter
│       │   ├── sitemap.ts        # programmatic sitemap
│       │   ├── robots.ts         # robots.txt
│       │   ├── globals.css       # @theme + theme tokens + light overrides
│       │   ├── error.tsx, not-found.tsx, loading.tsx
│       ├── components/
│       │   ├── SiteNav.tsx       # Top nav + region + theme toggles
│       │   ├── SiteFooter.tsx
│       │   ├── AIChatPanel.tsx   # Floating chat widget
│       │   ├── AIChatBubble.tsx
│       │   ├── RegionPicker.tsx  # Timezone-based nudge
│       │   ├── ThemeToggle.tsx   # Sun/Moon pill
│       │   ├── ForexStrip.tsx    # Dashboard FX ticker
│       │   ├── HeroLiveDemo.tsx
│       │   ├── ModelSelector.tsx # Strategist / Fast / Scale labels
│       │   ├── ProductIllustrations.tsx  # Inline SVGs for /product
│       │   ├── Animate.tsx       # <FadeIn> wrapper
│       │   ├── grid/, layout/, model/, ui/
│       ├── stores/
│       │   ├── analysisStore.ts  # persisted: last QoE result
│       │   ├── authStore.ts      # user + token state
│       │   ├── modelStore.ts     # financial models
│       │   └── onboardingStore.ts # persisted: personal + business + upload
│       ├── context/
│       │   └── FxContext.tsx     # Live currency rates provider
│       └── lib/
│           ├── api.ts            # API client (chat, chatStream, getMe, etc.)
│           ├── theme.tsx         # ThemeProvider + useTheme hook
│           ├── fx.ts             # Frankfurter fetcher
│           ├── currency.ts       # Region / Currency types + formatters
│           ├── dummy-data.ts     # seed data + Indian integrations list
│           ├── formula.ts, exportPdf.ts, utils.ts
│
├── backend/                      # FastAPI
│   ├── requirements.txt
│   ├── .env                      # DATABASE_URL, SECRET_KEY, ANTHROPIC_API_KEY, etc.
│   └── app/
│       ├── main.py               # FastAPI() + startup hooks (email normalize, region col migrate)
│       ├── config.py             # Settings (pydantic) + production guards
│       ├── database.py           # SQLAlchemy engine + Base
│       ├── routers/
│       │   ├── auth.py           # signup, login, refresh, me, verify-email
│       │   ├── analysis.py       # tb/json, tb/upload, tb/quick, tb/multi-upload, upload
│       │   ├── chat.py           # /ask (Quick), /ask-stream (Deep), /feedback, /feedback/stats
│       │   ├── profile.py        # /profile GET/POST/PUT, onboarding-status
│       │   ├── models.py, variables.py, scenarios.py, compute.py
│       ├── services/
│       │   ├── ai_service.py     # chat_with_ai, stream_deep (Cognitive Engine)
│       │   ├── gl_parser.py      # 400+ synonym header map (Perceptor)
│       │   ├── audited_fs_parser.py
│       │   ├── tb_analyzer.py    # Classifier + Reasoner workhorse
│       │   ├── faq_service.py    # Quick-Match retriever
│       │   ├── faq_data.py       # FAQ corpus (Indian + US)
│       │   ├── verification_service.py  # Verifier layer
│       │   ├── email_service.py  # Resend verification emails
│       │   ├── auth_service.py   # JWT sign/verify, password hash
│       │   ├── formula_engine.py # deterministic compute
│       │   ├── industry_knowledge.py
│       ├── models/               # SQLAlchemy ORM models
│       │   ├── user.py, workspace.py, business_profile.py
│       │   ├── financial_model.py, variable.py, section.py, cell_value.py
│       │   ├── scenario.py, chat_feedback.py, email_verification.py
│       ├── schemas/              # Pydantic request/response schemas
│       ├── middleware/
│       └── utils/
│
├── docs/
│   ├── case-study-outreach/
│   └── knowledge-base/           # THIS FOLDER (the three handoff docs)
├── Dockerfile
└── docker-compose.yml
```

---

## Part 4 — Frontend architecture

### Rendering model

- **Static-generated by default.** Every marketing page (`/`, `/us`, `/in`, `/product`, etc.) is prerendered at build time (see `○` markers in `npm run build` output).
- **Dynamic routes** (route handlers, authenticated pages that call `useSearchParams`, anything inside `(app)/`) are server-rendered on demand (see `ƒ` markers).
- **Client interactivity** happens via `"use client"` components hydrated from the server HTML.

### Layout + theme provider chain

```
<html>
  <head>
    [no-flash theme script: sets .theme-dark or .theme-light on <html> before paint]
    [Schema.org JSON-LD for Google rich results]
    [legacy-key migration script: axiom-* → cortexcfo-* localStorage keys]
  </head>
  <body>
    <ThemeProvider>                      ← src/lib/theme.tsx
      (public) <SiteNav /> + page + <SiteFooter />
      (app)    <FxProvider>              ← src/context/FxContext.tsx
                  <aside sidebar /> + <main> + <AIChatPanel />
               </FxProvider>
    </ThemeProvider>
  </body>
</html>
```

### Routing groups

- `src/app/(auth)/` — routes that share the split-screen auth layout. Parentheses = group, doesn't appear in URL. Contains `login/`, `signup/`, `verify-email/`.
- `src/app/(app)/` — the authenticated app with sidebar. Has its own `layout.tsx` that gates on `access_token` + email verification. Contains `dashboard/`, `analysis/`, `qoe/`, `scenarios/`, `industries/`, `integrations/`, `feedback/`, `profile/`, `uploads/`.
- `src/app/(dashboard)/` — financial-modeling workspace. Contains `models/` + `models/[modelId]` (dynamic). Shares no chrome with `(app)/` — the models editor has its own layout. Note: despite the group name, this is NOT the main dashboard — that's under `(app)/dashboard/`.
- Everything else is a sibling of `layout.tsx` and inherits the public shell.

### State management (Zustand + persist)

Four stores in `src/stores/`:

| Store | Key | What's stored | Notes |
|---|---|---|---|
| `analysisStore.ts` | `cortexcfo-analysis` | Last QoE result + company name | Persisted. `migrate` handler rescues old schemas. |
| `onboardingStore.ts` | `cortexcfo-onboarding` | Personal + business + upload state + current step | Persisted. Triggers `/pricing` redirect on completion. |
| `authStore.ts` | `access_token`, `refresh_token`, `cortexcfo:user` (three raw keys, NOT persist middleware) | User object + tokens | Manually reads/writes `localStorage`. `hydrate()` is called from `SiteNav` via `useLayoutEffect` so the nav shows the auth chip before first paint instead of flashing guest CTAs. |
| `modelStore.ts` | (not persisted) | In-session financial model workspace | Ephemeral. |

**Why persisted:** a founder uploading a 30MB trial balance and seeing 4.8% gross margin shouldn't lose the work on a tab close. All three persisted stores run through Zustand's `persist` middleware with an explicit `version` number and a `migrate` function.

**Historical gotcha:** we renamed all persist keys from `axiom-*` to `cortexcfo-*` in one release. Existing users' analysis got stranded under the old key ("No Financial Data Yet"). The fix in `src/app/layout.tsx` is an inline `<script>` that runs synchronously **before** any module imports, copying any `axiom-*` value into `cortexcfo-*` if the new key is empty. Never delete that script.

### API client

`src/lib/api.ts` — a `class Api { ... }` singleton with the JWT attached automatically. Key methods:

- `chat(payload, mode)` → `POST /api/chat/ask` (Quick, FAQ-first)
- `chatStream(payload, handlers)` → `POST /api/chat/ask-stream` with SSE parsing (Deep)
- `sendChatFeedback(payload)` → `POST /api/chat/feedback`
- `getMe()` → `GET /api/auth/me`
- `login`, `signup`, `refresh`, `verifyEmail`, `resendVerification`, `deleteAccount`
- `getAnalysis()`, `uploadTrialBalance()` (multipart)

The `request()` method on the class auto-redirects to `/login` on 401 (token expired). Keep that behavior.

### Styling system

Tailwind v4 with `@theme inline` block in `globals.css`. Custom token layer on top:

```css
@theme inline {
  --color-app-canvas: var(--app-canvas);     /* flips with theme */
  --color-app-card: var(--app-card);
  --color-app-text: var(--app-text);
  --color-app-text-muted: var(--app-text-muted);
  /* ...etc */
}

:root, html.theme-dark {
  --app-canvas: #0A0A0A;
  --app-card: #161616;
  --app-text: #F5F5F5;
  /* ...dark palette */
}

html.theme-light {
  --app-canvas: #fafaf7;
  --app-card: #ffffff;
  --app-text: #1a1a1a;
  /* ...light palette */
}
```

The `inline` keyword is important. Without it, Tailwind inlines the literal value at build time and the theme switch won't work at runtime. WITH it, the utility compiles to `background-color: var(--app-canvas)` which flips when we override the var on `html.theme-light`.

For hardcoded legacy colors (many `bg-[#0a0a0a]`, `text-white/60`), we have compensating overrides at the bottom of `globals.css` inside `html.theme-light { ... }` that flip the most common opacity variants. Adding new hardcoded colors is technically allowed but **prefer tokens** so future theme changes don't need new overrides.

---

## Part 5 — Backend architecture

### Entry point (`backend/app/main.py`)

1. Creates `FastAPI` app
2. Adds CORS with allowed origins: `localhost:3000` + `axiom-platform.vercel.app` (add `cortexcfo.com` when domain lands)
3. On startup runs two idempotent migrations:
   - `_normalize_user_emails()` — lowercases `users.email` for case-insensitive login
   - `_ensure_region_column()` — adds `business_profiles.region` + `currency` if missing (predates Alembic migrations)
4. Mounts routers: `auth`, `models`, `variables`, `scenarios`, `compute`, `analysis`, `profile`, `chat`

### Auth model

- **JWT** via `python-jose`, HS256, signing key = `SECRET_KEY` env var
- Access token: 24h
- Refresh token: 30d
- Password hashing: `bcrypt` via `passlib` (cost 12)
- Email verification required to access `(app)/` routes — 6-digit code emailed via Resend with 10-minute TTL

Production guards (in `config.py`) refuse to boot if:
- `SECRET_KEY` is still the placeholder
- `RESEND_API_KEY` is empty

This is enforced **only in production** (detected via `ENVIRONMENT=production` or presence of `RENDER`/`RENDER_EXTERNAL_URL` env vars). Local dev logs a warning but boots.

### Database

- Postgres (Render managed). SQLAlchemy async.
- Tables (via `backend/app/models/`):
  - `users` — email, hashed_password, is_email_verified, created_at
  - `email_verifications` — user_id, code, expires_at
  - `workspaces` — one per user; holds the business context
  - `business_profiles` — company name, region, currency, industry, GSTIN/EIN, etc.
  - `financial_models`, `sections`, `variables`, `cell_values`, `scenarios` — the spreadsheet substrate for scenario modeling
  - `chat_feedback` — thumbs up/down analytics, tagged by `mode` (quick/deep) and `source` (faq/ai)

### Region-aware backend logic

Two things in the backend are region-aware:

1. **System prompt** (`ai_service.py`) — the Reasoner / Strategist get a different opening preamble for US vs IN. India-mode uses "promoter"/"Schedule III"/"Ind AS"; US-mode uses "founder"/"GAAP"/"ASC 606".
2. **FAQ filter** (`faq_service.py`) — there are separate Indian and US FAQ banks. A region=US request only retrieves US FAQs; India only Indian. This prevents "what's GST on that?" from appearing as a Top Match for a US user.

Region is derived in a fallback chain:
1. explicit `region` field in the request payload
2. `business_context.region`
3. default `"US"`

---

## Part 6 — The Cognitive Engine (how the algorithm actually runs)

Customer-facing framing: **eight named models** organized into **four cognitive layers**. Detail on `/how-it-works`.

Engineering reality: a coordinated pipeline across deterministic parsing, retrieval, and LLM calls.

### 6.1 — Layer PERCEIVE (model: Perceptor + Classifier)

- **Perceptor** = `services/gl_parser.py` + `services/audited_fs_parser.py`
  - Accepts `.xlsx`, `.xls`, `.csv`, `.json`, `.pdf` (audited financials), Tally XML
  - Normalizes column headers against a **400+ synonym bank** (`_ACCOUNT_NAME_KEYS`, `_DEBIT_KEYS`, `_CREDIT_KEYS` — extend these when a new chart of accounts shows up; Zoho COA Summary uses `name`/`credit_total`/`debit_total`/`balance`/`is_debit` — we added those in commit `2eda2b1`)
  - Emits a normalized internal schema: `{ account, debit, credit, balance }[]`
- **Classifier** = part of `services/tb_analyzer.py`
  - Tags every account row into the canonical chart (Ind AS Schedule III OR US GAAP)
  - Outputs a confidence per tag; anything < 0.75 gets flagged for CPA review

### 6.2 — Layer REASON (models: Quick-Match + Reasoner + Strategist)

Two user-facing modes in the chat panel:

**Quick mode** (`POST /api/chat/ask` with `mode: "quick"`):
1. `try_faq_answer()` runs retrieval over the FAQ corpus
2. If score ≥ 0.82 → return canned answer interpolated with user's own numbers (source="faq")
3. Else fall through to `chat_with_ai(mode=quick)` → Claude Haiku (fast, ~3–5s)

**Deep mode** (`POST /api/chat/ask-stream` with `mode: "deep"`):
1. Skip FAQ entirely
2. `stream_deep()` calls Claude Sonnet with `thinking` enabled
3. Stream back Server-Sent Events:
   - `event: thinking` — partial reasoning trace
   - `event: response` — partial answer
   - `event: done` — clean close
   - `event: error` — fatal
4. Frontend buffers each type in its own state key and renders live

Both modes share:
- `payload.analysis_result` — the full QoE structure from the user's last upload (read from `analysisStore`)
- `payload.business_context` — company name, region, industry, etc.
- `payload.page_context` — a short string describing the current page (for smart context)
- `payload.conversation_history` — prior turns in the same session

**Fallback:** if `/ask-stream` returns 404 (backend deploy behind frontend — happened in commit `d1b3388`), the client silently retries via `/ask` with `mode=deep` in the payload. User still gets a deep-mode answer; they just lose the live thinking pane. This fallback is in `AIChatPanel.tsx` — do NOT remove.

### 6.3 — Layer SYNTHESIZE (model: Synthesizer)

Conceptually a prompt layer that converts reasoning + deterministic calculations into board-ready narrative. In the current implementation this is handled by the same model call as REASON — the prompt engineering lives in `ai_service.py`. Keep the logical separation in code comments so we can split it into a dedicated call later if needed.

### 6.4 — Layer VERIFY (model: Verifier + Auditor)

- **Verifier** = `services/verification_service.py`
  - Cross-checks every rupee/dollar amount the model emits against the source GL
  - If an amount in the response isn't found in the ledger within tolerance, the response is rejected and the prompt is re-run with a "cite exact account" constraint
  - This is the anti-hallucination layer. **Never bypass it.**
- **Auditor** = the human CPA. Sign-off happens outside the code path — the QoE pack output includes a "Reviewed by" slot populated at fulfillment time.

### 6.5 — Critical: ratio scaling (past bug, must-know)

**The bug (commit `f016a0a`):** the dashboard showed Gross Margin 476% / Net Margin -11826%. The pathological values came from a unit mismatch: the backend stores ratios as **percentages** (e.g. `4.76` means 4.76%), and the frontend's `pct()` helper multiplied by 100 again — double-scaling.

**The fix:** `pctFromPercent()` helper in the dashboard, and all ratio-pack thresholds rescaled from fractions to percentages (0.35 → 35, 0.2 → 20, 0.1 → 10, 0.03 → 3).

**The rule going forward:** if you're reading a ratio field off the API response, **do not multiply by 100**. If you're computing a ratio from raw numbers, use fractions until the very last `toFixed(2) + "%"` at render. Pick one convention per function and comment it.

---

## Part 7 — API reference

All endpoints rooted at `NEXT_PUBLIC_API_URL` (dev: `http://localhost:8000`, prod: `https://axiom-platform.onrender.com`).

### Auth
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create account, email 6-digit code |
| POST | `/api/auth/login` | — | Email + password → tokens |
| POST | `/api/auth/refresh` | refresh | Fresh access token |
| GET | `/api/auth/me` | access | Current user |
| POST | `/api/auth/verify-email` | access | Submit the 6-digit code |
| POST | `/api/auth/resend-verification` | access | New code |
| POST | `/api/auth/delete-account` | access | Self-serve account deletion |

### Analysis
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/analysis/tb/json` | Upload structured trial-balance JSON |
| POST | `/api/analysis/tb/upload` | Upload Excel/CSV/PDF (multipart) |
| POST | `/api/analysis/tb/multi-upload` | Upload multi-year comparative |
| POST | `/api/analysis/tb/quick` | Inline quick analysis |
| POST | `/api/analysis/upload` | Upload audited financials PDF |

### Chat (Cognitive Engine surface)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/chat/ask` | Quick mode — FAQ first, then Reasoner |
| POST | `/api/chat/ask-stream` | Deep mode — Strategist with streamed thinking |
| POST | `/api/chat/answer-question` | Legacy endpoint (don't use) |
| POST | `/api/chat/feedback` | Thumbs up/down |
| GET | `/api/chat/feedback/stats` | Analytics (admin) |

### Profile / workspace
- `POST/GET/PUT /api/profile`
- `GET /api/profile/onboarding-status`

### Models / scenarios (workspace modeling)
- `/api/models`, `/api/models/{id}` — CRUD
- `/api/models/{id}/sections`, `/variables`, `/compute`
- `/api/models/{id}/scenarios`, `/api/scenarios/{id}/clone`

### Frontend-only route handlers
- `POST /api/subscribe` (src/app/api/subscribe/route.ts) — Resend newsletter. Returns `{ ok: true }` or `{ ok: false, error }`.

---

## Part 8 — Environment variables

### Backend (`.env` in `backend/`)

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://user:pwd@host:5432/db` | Render-managed in prod |
| `SECRET_KEY` | 48 random bytes | Generate: `python -c "import secrets; print(secrets.token_urlsafe(48))"`. **Boot refuses in prod if default.** |
| `ALGORITHM` | `HS256` | JWT algo |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24h |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | |
| `CORS_ORIGINS` | `["http://localhost:3000","https://axiom-platform.vercel.app"]` | Add custom domain here |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | required for Reasoner + Strategist |
| `GEMINI_API_KEY` | (optional) | fallback when Claude rate-limits |
| `GROQ_API_KEY` | (optional) | fallback when Claude rate-limits |
| `RESEND_API_KEY` | `re_...` | required in prod for email verification |
| `FROM_EMAIL` | `CortexCFO <onboarding@resend.dev>` | Swap to verified domain when ready |
| `VERIFICATION_CODE_EXPIRE_MINUTES` | `10` | |
| `ENVIRONMENT` | `production` | Triggers the boot guards |
| `AI_ASSISTANT_ALLOWED_EMAILS` | `avdhut@...,rajan@...` | Comma-separated allowlist for the AI Assistant chat panel. **Empty / unset = every verified user can use it.** When populated, only listed emails can call `/api/chat/ask` + `/ask-stream`; denied users get a 403 and the frontend simply hides `<AIChatPanel />`. Case-insensitive, trims whitespace. See Part 16 below. |

### Frontend (`.env.local` / `.env.production` + Vercel)

| Variable | Local | Prod | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `https://axiom-platform.onrender.com` | All client-side API calls go here |
| `RESEND_API_KEY` | (set after Resend signup) | **set in Vercel** | Newsletter endpoint |
| `RESEND_FROM` | — | `CortexCFO <onboarding@resend.dev>` | Sandbox until domain verified |
| `RESEND_AUDIENCE_ID` | optional | optional | If set, contacts added to that audience |

**Vercel flow:** Settings → Environment Variables → add → check Production and Preview → Save → Redeploy.

---

## Part 9 — Third-party integrations, explained

### Resend (newsletter + verification emails)

- **Newsletter signup:** `POST /api/subscribe` (Next.js route handler). Validates email shape, optionally adds to audience, sends branded welcome. Welcome copy is intentionally honest: "still building, a few more months, want to be double-sure on encryption and analysis." Graceful degradation: no API key → logs intent, returns ok.
- **Email verification:** backend `services/email_service.py` sends the 6-digit code. Called from `routers/auth.py` on signup and `/resend-verification`.
- **Domain verification:** required before sending to anyone except the account owner. DNS records (SPF, DKIM, MX) go in the domain provider. Vercel subdomains can't support SPF, so we need a real domain (cortexcfo.com).

### Frankfurter.dev (FX rates)

- Called **directly from the browser** via `fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,INR,JPY")`
- No API key, no backend involvement
- Historical gotcha: the old host `frankfurter.app` now 301s without CORS. Use `frankfurter.dev/v1` — URL is in `src/lib/fx.ts`.

### Anthropic (Claude)

- SDK in `backend/services/ai_service.py`. Connection-per-request (no long-lived client).
- Two model IDs configured:
  - Quick mode → the cheaper/faster model (Haiku-class)
  - Deep mode → the reasoning-capable model (Sonnet-class) with `thinking: { type: "enabled", budget_tokens: N }`
- Fallback logic: if `anthropic.APIStatusError` fires with status 429, we try Gemini (if `GEMINI_API_KEY` set), then Groq. Never fail the user request silently.

### Vercel

- Auto-deploys on push to `main`. PR previews created automatically.
- Build cmd: `npm run build`. Install cmd: `npm install`.
- Project root: `frontend/` (set this in Vercel settings if the repo root ever changes).
- Framework preset: **Next.js**.

### Render

- Auto-deploys on push to `main` — **but has failed silently before**. Both the feedback 404 and the ask-stream 404 were caused by Render not picking up commits. Always verify after backend changes: `curl https://axiom-platform.onrender.com/openapi.json | jq '.paths | keys'` and confirm the route exists.
- If deploys are stuck: dashboard → Manual Deploy → Deploy latest commit. Check that Auto-Deploy is ON under Settings → Build & Deploy.

---

## Part 10 — Deployment workflow

1. Commit to `main` → Vercel auto-builds frontend → usually live within 2 minutes
2. Same commit → Render auto-builds backend → usually within 4 minutes, watch for it
3. Verify:
   - `curl -I https://axiom-platform.vercel.app/` → HTTP 200
   - `curl https://axiom-platform.onrender.com/openapi.json` → JSON with expected routes
   - Open `/knowledge-base` or `/how-it-works` in browser, click around

**Rollback:** in Vercel dashboard, find the last good deployment and "Promote to Production". Instant.

**Database migrations:** currently using SQLAlchemy `Base.metadata.create_all()` + ad-hoc `ALTER TABLE` calls in the startup hook. **Move to Alembic before the 2nd migration** — we already have the dependency installed. The ad-hoc approach is fragile.

---

## Part 11 — Known bugs fixed + patterns to remember

Listed by commit, with context. Read this section if you see similar symptoms later.

| Commit | Symptom | Root cause | Fix |
|---|---|---|---|
| `c68a6c1` | "No Financial Data Yet" on dashboard after deploy | Renamed persist keys `axiom-*` → `cortexcfo-*`. Old data stranded. | Inline `<script>` in layout that copies old keys into new if target is empty. Plus `migrate` callbacks on each store. |
| `43ce2fc` | FX strip shows "Failed to fetch" | frankfurter.app now redirects to frankfurter.dev without CORS. | URL updated to `https://api.frankfurter.dev/v1/...`. |
| `2eda2b1` | "Could not locate header" on Zoho COA upload | Zoho Books exports use `name`/`credit_total`/`debit_total`/`balance`/`is_debit` — not in our synonym bank. | Added those tokens to `_ACCOUNT_NAME_KEYS`, `_DEBIT_KEYS`, `_CREDIT_KEYS` in `gl_parser.py`. Added `zoho_coa_summary` format detection. |
| `f016a0a` | Dashboard showing 476% / -11826% | Backend stores ratios as percentages; frontend multiplied by 100 again. | `pctFromPercent()` helper + rescaled all thresholds. **Never multiply by 100 twice.** |
| `d1b3388` | `{"detail":"Not Found"}` on Think deeper | Render backend stale, `/ask-stream` not deployed. | Frontend fallback: catch 404 on `chatStream`, retry via `/ask` with `mode=deep`. Still need to keep Render auto-deploy healthy. |
| `7b69d28` | `.theme-light` toggle didn't flip app dashboard | `@theme inline` was baking literal hex values — CSS var override had nothing to bind. | Restructured tokens to reference intermediate vars (`--app-canvas`), which are then overridden on `html.theme-light`. |
| `bdde1d6` | "Most popular" badge overlapping price column on tier cards | Absolute `top-4 right-4` conflicted with `lg:grid-cols-[1fr_220px]`. | Moved badge inline next to "Tier N" label. |

---

## Part 12 — Common gotchas for new engineers

**Theme system**
- Always prefer `bg-app-canvas`, `text-app-text` etc. over `bg-[#0a0a0a]`. Hardcoded values bypass the theme system and need compensating overrides at the bottom of `globals.css`.
- If you DO hardcode, add a matching override in the `html.theme-light` block.

**Next.js 16 specifics**
- `useSearchParams()` crashes the build if not wrapped in `<Suspense>`. Pricing page and Checkout page both have this wrapper.
- Route handlers go in `src/app/**/route.ts` — NOT `src/pages/api/*`.
- Read `frontend/node_modules/next/dist/docs/` when in doubt — it's checked in and current.

**Chat flow**
- Never change the label strings in `MODEL_LABEL` without updating `/how-it-works` too. We de-Sonnet'd the entire surface in commit `75957cf` — keep that invariant.
- The 404 fallback on `chatStream` is not a workaround — it's a permanent resilience layer.

**Ratios + currency**
- `pctFromPercent(0.0476)` is wrong. The backend already gives you `4.76`. Pass that directly.
- All currency rendering goes through `src/lib/currency.ts` `asCurrency()`. Don't inline `$` or `₹` anywhere.

**Auth**
- `(app)/layout.tsx` gates on token + `is_email_verified`. Don't add authenticated routes outside that group without the gate.

**Backend deploy**
- After ANY backend code change, manually verify `/openapi.json` on prod. Don't trust auto-deploy. If routes are missing, Render dashboard → Manual Deploy.

**Secret rotation**
- `SECRET_KEY` can be rotated, but doing so invalidates every existing JWT. Users will be bounced to `/login` en masse. Time it for a maintenance window.

---

## Part 13 — Testing & verification

We don't have a test suite yet (intentional — we've been moving fast in pre-PMF mode). The "test" is:

1. `npm run build` in `frontend/` — catches TypeScript errors, missing Suspense wrappers, layout errors, dead imports
2. Smoke test the changed page manually in the Vercel preview URL
3. `curl` the relevant backend routes to confirm endpoints respond

**When you add the first real test:** prefer Playwright for end-to-end (auth + onboarding + upload + chat). Vitest for unit tests on ratio-math helpers and currency formatters. The highest-ROI initial test is "upload a sample TB → confirm ratio pack renders without NaN" because that's caught the most regressions historically.

---

## Part 14 — Roadmap / deferred work

Explicitly known-to-be-missing, ranked by impact:

1. **Backend auto-deploy reliability on Render.** Investigate the GitHub webhook / verify it's present and firing. Consider moving to Fly.io or Railway if Render keeps missing pushes.
2. **Payment gateway.** `/checkout` is a UI shell. Stripe for US, Razorpay for India is the plan. Server endpoint required: `/api/checkout/start` that creates a gateway session and returns the redirect URL.
3. **Full audit suite.** Add Alembic migrations, add Playwright e2e tests, add Sentry for error monitoring.
4. **Dark/light mode coverage on app pages.** The system-wide token flip works, but a few hardcoded colors in `/integrations` and older components still need token conversion. Run `grep -r "bg-\\[#" src/app/(app)` to see what's left.
5. **Resend domain verification + audience.** Newsletter is live but sandboxed to the account owner's inbox until DNS records are added.
6. **Alembic migration from the two ad-hoc startup hooks** — `_normalize_user_emails` and `_ensure_region_column`. These should move to proper migrations.
7. **Chat history persistence.** Currently session-local. Persisting chat to Postgres would let users resume conversations across devices.
8. **A real test for the Verifier.** Mock LLM output that includes hallucinated amounts; confirm they're rejected.
9. **Streaming Quick mode.** Quick mode's 8–10s wait (on FAQ miss) could be streamed too for perceived speed, though the single-shot JSON is simpler.
10. **Image assets.** Two Unsplash photos on `/product` are placeholder until custom illustrations replace them.

---

## Part 15 — How we got here (session history)

Most recent session (late April 2026) landed in this order:

1. `bdde1d6` — tier overlap, text bumps, region + theme toggles, checkout shell, US GAAP KB
2. `7b69d28` — system-wide theme flip + custom SVG illustrations on `/product`
3. `d1b3388` — Think-deeper 404 graceful fallback
4. `75957cf` — `/how-it-works` page + de-Sonnet entire surface
5. `0024938` — KB + glossary expansion (US Deal Pitfalls, Healthcare) + Bain design pickups
6. `df0cc48` — Resend-backed newsletter

Earlier foundational work (older commits you'll see referenced):
- `a759afc`, `0072e03`, `864a8e7` — region architecture (Phase A/B/C)
- `4bd2478` — streaming Deep mode (Phase 4.5)
- `c6888fd` — chat feedback + analytics dashboard (Phase 3.5)
- `5966bca` — Quick/Deep modes + FAQ layer (Phases 1–3)
- `d4a604d` — marketing pivot from India-first to international

---

## Part 16 — AI Assistant email allowlist (abuse prevention)

The Cognitive Engine chat panel (`AIChatPanel`) makes Claude API calls on every Deep-mode question. Without a gate, any verified user can consume our Anthropic budget — a real risk once the site is indexed and strangers can sign up.

### How it works

1. Env var `AI_ASSISTANT_ALLOWED_EMAILS` (backend only, NOT `NEXT_PUBLIC_*`) holds a comma-separated allowlist:
   ```
   AI_ASSISTANT_ALLOWED_EMAILS=avdhut@example.com,rajan@example.com,beta.user@company.com
   ```
2. `settings.user_has_ai_access(email)` in `backend/app/config.py` does the match. Case-insensitive, trims whitespace, returns `True` if the list is empty (dev default — no gate).
3. `_require_ai_access(user)` helper in `backend/app/routers/chat.py` is called at the top of both `/api/chat/ask` and `/api/chat/ask-stream`. Raises `HTTPException(403, "limited beta, rolling out...")` on denial.
4. `/api/auth/me` returns `has_ai_access: bool` computed from the same helper — this is what the frontend reads.
5. `frontend/src/app/(app)/layout.tsx` reads `me.has_ai_access` after the gate check and passes it to a React state. `<AIChatPanel />` is rendered only when `hasAiAccess === true`. Denied users don't see the widget at all — no 403 surface, no broken UX.

### Two-layer enforcement (on purpose)

| Layer | Purpose | What it catches |
|---|---|---|
| Backend 403 on `/api/chat/*` | Real security | Direct API calls, browser-devtools bypass, token stolen from another session |
| Frontend hide `<AIChatPanel />` | UX | Denied users don't see a floating button they can't use |

Never rely on only the frontend. The backend is authoritative.

### Operational notes

- **Changes are zero-downtime.** Add or remove emails in the env var, redeploy the backend on Render. No DB migration.
- **No DB field, on purpose.** The allowlist is small (single digits during beta). When we scale beyond ~50 allowed users, move to a `users.has_ai_access` boolean column with a proper admin UI.
- **Stale frontend protection.** The `has_ai_access` field defaults to `true` when missing from the response, so an older frontend talking to a newer backend (or vice versa) keeps working.
- **Audit trail.** Denied requests are logged at INFO level in the backend — `logger.info("AI Assistant access denied for user %s ...")`. Helps us see if non-allowlisted users are trying.

### Turning the gate ON

1. Render dashboard → Environment → add `AI_ASSISTANT_ALLOWED_EMAILS` with your allowlist string
2. Render redeploys automatically (or manual deploy if auto is off)
3. Wait ~30s for the backend to boot with the new value
4. Every Authenticated user's next `/auth/me` poll returns the updated `has_ai_access`. Existing logged-in users see the chat disappear on their next navigation.

### Turning it OFF (back to "open to all verified users")

Clear the env var (or unset it) and redeploy. Everyone regains access.

---

## Part 17 — Handoff checklist for the new engineer

Day 1:
- [ ] Clone repo, run `npm install` in `frontend/`, `pip install -r requirements.txt` in `backend/`
- [ ] Copy `.env.local.example` → `.env.local` (frontend), `.env.example` → `.env` (backend)
- [ ] `npm run dev` in frontend → localhost:3000 should render the landing page
- [ ] Start Postgres locally (or use Docker Compose — `docker-compose up`), `uvicorn app.main:app --reload` in backend → localhost:8000/docs
- [ ] Signup flow end-to-end on localhost, verify an email

Day 2:
- [ ] Read `/how-it-works` on prod to understand the Cognitive Engine framing
- [ ] Open `src/app/knowledge-base/page.tsx` and skim a few articles for voice
- [ ] Open `src/components/AIChatPanel.tsx` and walk through the deep-mode SSE flow

Day 3:
- [ ] Ship one small change (fix a typo, improve a hover state) so you've touched the deploy path
- [ ] Read the design handoff doc (`02-DESIGN-HANDOFF.md`) to understand brand / UX decisions

---

*End of Technical Handoff.*
