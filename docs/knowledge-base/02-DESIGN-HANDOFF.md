# CortexCFO — Design Handoff

**Audience:** the design team taking over visual language, component system, and content.
**Assumed familiarity:** web design fundamentals, Tailwind / design tokens, Figma or equivalent.
**Written:** 2026-04. **Commit at time of writing:** `df0cc48`.
**Live URL:** https://axiom-platform.vercel.app

---

## Part 0 — The thought process behind the business

### What CortexCFO is

A **multi-model Cognitive Engine for FP&A** — specifically for the Quality-of-Earnings (QoE) problem in the US $1M–$10M SMB segment and the Indian ₹10–50 Cr MSME segment.

In one sentence: *we produce Big-4-grade financial analysis and QoE packs every month, for $299, reviewed by a qualified CPA, using a pipeline of eight specialized AI models.*

### Why this product exists (and why the design reflects it)

Three converging gaps:

1. **Big-4 QoE engagements cost $10–25K per round, take 6–8 weeks, and happen once.** A founder raising capital pays that every time they raise. Between rounds, they have nothing — no continuous read on their own earnings quality.
2. **Generic AI chatbots hallucinate numbers.** A CFO asking ChatGPT "why did my margin drop 2 points" gets a plausible-sounding answer with no grounding in the actual ledger. That's dangerous in any finance conversation.
3. **Template-based QoE misses sector-specific economics.** Home-health post-PDGM, PE-backed physician practice management, SaaS ASC 606 subtleties — generic templates don't touch them.

The design consequence: the product has to **feel credible to a CFO, a PE associate, and a senior banker**. Not a flashy chatbot; not a toy; not a dashboard that looks like a crypto app. It has to look like something that belongs in a boardroom, with enough modern polish to signal "this isn't Big-4-legacy software."

That tension — serious + modern — is the core design constraint everything else bends toward.

### Who the founder is

**Avdhut Padwalkar** — founder, came from the US QoE desk at MARC (Mangal Analytics). Every article in `/knowledge-base`, every DD finding, every add-back example is drawn from real engagements he ran. This matters for design because **the content is real** — don't let layout treatments dilute the authority of the words.

**Rajan Nagaraju** — co-builder.

### Voice

**Indian-business-polite crossed with an operator's crispness.** Not corporate fluff. Not Valley bluster. Not chatbot cheer. Read any article on `/knowledge-base` and match that register.

The structural pattern we use for every piece of content: **Hook → Pain → Solution → tangible number**. Every headline earns its place; every body paragraph moves the reader forward; every close gives them something to remember.

Examples from the live site:
- *"When your P&L and your bank statements tell different stories"* (Hook — concrete, specific)
- *"We regularly see 20–65% variances"* (Pain — with a number)
- *"If you can't close that gap in an hour, buyers walk"* (Stakes)
- *"When the gap surfaces in your own pre-diligence, it's an accounting issue; in the buyer's diligence, it's a valuation haircut"* (Close — tangible consequence)

If a draft doesn't follow that arc, rewrite it before shipping.

### Positioning by region

- **US landing (`/us`):** M&A Readiness
- **India landing (`/in`):** PE Readiness
- **Default landing (`/`):** region-neutral

The **region toggle** lives in the top nav (two small flag pills: 🇺🇸 US / 🇮🇳 IN). It's also inlined above the hero on `/`. Never remove either — the inline one on the hero was explicitly requested by the founder after the nav-only version didn't get noticed.

---

## Part 1 — Brand identity

### Logo + wordmark

- **Mark:** solid emerald-500 rounded square, 8×8 (logo scale) to 32×32 (nav), with an inverse white `TrendingUp` icon centered. Currently `src/components/SiteNav.tsx` lines 110-117.
- **Wordmark:** **CortexCFO** — one word, camel-case. 15px tight-letterspaced semibold in the nav. **Never** render as "Cortex CFO" (space) or "CortexC.F.O." (dots).
- **Full lockup:** mark + wordmark, 8px gap.
- **Favicon:** `public/favicon.ico` — currently the default; replace with an emerald mark on dark background.

### Color system

We operate on **two** parallel palettes: a brand palette (emerald-first, semantic colors) and a **surface palette** (flips between dark / light based on theme).

#### Brand palette (constant across themes)

| Role | Token | Value | Usage |
|---|---|---|---|
| Primary | `emerald-500` | `#10b981` | CTA buttons, accents, brand mark |
| Primary hover | `emerald-400` | `#34d399` | Hover state on primary |
| Primary dim | `emerald-600` | `#059669` | Pressed / active |
| Primary gradient | `emerald-400 → teal-400 → cyan-400` | — | Hero headline highlights, "think like brains" gradient |
| Success | `app-positive` | `#34d399` (same as emerald) | Deltas ↑, positive findings |
| Negative | `app-negative` | `#F87171` (rose-400) | Deltas ↓, destructive actions |
| Warning | `app-warning` | `#FBBF24` (amber-400) | Featured badge on KB, medium-severity flags |
| Info | `app-info` | `#38BDF8` (sky-400) | Informational chips |
| Neutral | `app-neutral` | `#6B7280` (gray-500) | Waterfall anchor bars |

#### Surface palette — DARK theme (default)

| Layer | Token | Value | Usage |
|---|---|---|---|
| Canvas | `app-canvas` | `#0A0A0A` | Page background |
| Card | `app-card` | `#161616` | Cards, sidebar |
| Card hover | `app-card-hover` | `#1C1C1C` | Card hover state |
| Elevated | `app-elevated` | `#1F1F1F` | Tooltips, popovers, modals |
| Border | `app-border` | `#2A2A2A` | Default 1px border |
| Border strong | `app-border-strong` | `#3A3A3A` | Focus, active, elevated borders |
| Text primary | `app-text` | `#F5F5F5` | Headings, stat numbers |
| Text muted | `app-text-muted` | `#A3A3A3` | Body copy, labels |
| Text subtle | `app-text-subtle` | `#737373` | Metadata, captions |
| Text disabled | `app-text-disabled` | `#525252` | Disabled states only |

#### Surface palette — LIGHT theme

| Layer | Token | Value | Usage |
|---|---|---|---|
| Canvas | `app-canvas` | `#fafaf7` | Warm cream, matches marketing cream |
| Card | `app-card` | `#ffffff` | Pure white cards |
| Card hover | `app-card-hover` | `#f5f3ef` | Soft cream hover |
| Elevated | `app-elevated` | `#ffffff` | Same as card with shadow |
| Border | `app-border` | `#e5e1db` | Warm tan border |
| Border strong | `app-border-strong` | `#c8c2b9` | Active border |
| Text primary | `app-text` | `#1a1a1a` | Near-black |
| Text muted | `app-text-muted` | `#52525b` | ~7.2:1 contrast on white |
| Text subtle | `app-text-subtle` | `#71717a` | ~4.55:1 — AA, borderline |

**All text/background pairs above clear WCAG AA 4.5:1** on their target surface.

#### Why cream and not pure white for canvas

The `#fafaf7` light canvas is pulled directly from the marketing palette (`--background` in `:root`). Using the same warm cream across marketing + app means a user flipping themes feels **one continuous brand**, not a mode switch.

Never use `#ffffff` for the full-page background — it looks medical. Reserve white for cards on top of the cream.

### Typography

Two fonts, loaded via `next/font` in `layout.tsx`:

| Variable | Font | Weights | Usage |
|---|---|---|---|
| `--font-sans` | **Poppins** | 400, 500, 600, 700 | Everything non-code |
| `--font-geist-mono` | **JetBrains Mono** | default | Numbers in tables, chat `t=0ms` markers, illustrations |

Critical hierarchy:

| Role | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|
| Mega hero | `48–72px` | 700 | `-0.03em` (`tracking-tight`) | `1.02–1.08` |
| Section headline | `32–44px` | 700 | `-0.02em` | `1.1–1.15` |
| Sub-headline | `22–28px` | 600 | `-0.01em` | `1.25` |
| Card headline | `16–20px` | 600 | default | `1.3–1.4` |
| Body primary | `15–17px` | 400 | default | `1.6–1.75` |
| Body secondary | `13–14px` | 400 | default | `1.5–1.65` |
| Eyebrow / caption | `11px uppercase` | 600 | `0.14–0.18em` | default |
| Fine print | `10–12px` | 400 or 500 | default | `1.4` |

**Rule of thumb for small text:** below 13px, always pair with elevated weight (500+) and a color at least `white/55` (dark mode) or `rgba(17,24,39,0.6)` (light). The founder flagged 11px/white/30 as unreadable in the April batch — we bumped wholesale.

### Iconography

**Lucide React** exclusively (`lucide-react` v1.8). ~50 icons in use across the site. When adding:

- Use **outline style** (the default) — never the solid `lucide-react/solid` variants
- Default stroke width: `2` (Lucide default)
- Sizes: `w-3 h-3` (10–12px) for inline, `w-3.5 h-3.5` (14px) for labels, `w-4 h-4` (16px) default, `w-5 h-5` (20px) in feature cards, `w-6 h-6` (24px) max
- **Never mix icon libraries.** If Lucide doesn't have what you need, either compose from primitives or commission an SVG.

### Imagery policy

- **Prefer custom SVG** for product illustrations (see `src/components/ProductIllustrations.tsx` for the pattern)
- **Avoid stock photos** of people in offices, handshakes, suits, trading floors — they feel generic
- **Two Unsplash images** are still on `/product` deliberately: the abstract neural-grid (photo-1460925895917) and the circuit-board (photo-1554224155). They're kept because they read as "neural/connected/automated" rather than "business person." All other stock photos have been replaced.
- Brand mark on every OG image going forward (not yet built — deferred)

---

## Part 2 — Design tokens & component system

### How tokens work

We use Tailwind v4's `@theme inline` block in `src/app/globals.css`. Every `bg-app-canvas`, `text-app-text`, `border-app-border` utility resolves to a CSS variable lookup. Those variables are defined on `:root` (dark) and `html.theme-light` (light). When the user clicks the theme toggle, only the variables change — every component re-renders with the flipped palette automatically.

**Design implication:** if you're spec'ing a new surface color, pick a semantic token name (not a literal hex). If you must use a hex, add a matching override rule in the bottom `html.theme-light { ... }` block of globals.css so the theme flip still works.

### Spacing scale

Tailwind default scale (4px grid). We use these stops most:

`gap-1` (4px) · `gap-2` (8px) · `gap-3` (12px) · `gap-4` (16px) · `gap-5` (20px) · `gap-6` (24px) · `gap-8` (32px) · `gap-10` (40px) · `gap-12` (48px)

Padding inside cards: `p-5` or `p-6` standard, `p-8` or `p-10` for hero panels. Page section vertical rhythm: `py-20` or `py-24` between sections, `py-32` for closing CTA.

### Radius scale

- `rounded-lg` (10px) — small buttons, input fields, icon chips
- `rounded-xl` (12px) — secondary buttons, toast cards
- `rounded-2xl` (16px) — standard cards (most of the site)
- `rounded-3xl` (22px) — hero cards, newsletter panel
- `rounded-full` — CTAs (Subscribe, Start Free, etc.), pill tags, icon buttons

**Rule:** CTAs are always `rounded-full`. Informational cards are always `rounded-2xl`. Mixing signals.

### Shadow / elevation

- Subtle lift (card hover): `hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]` — emerald glow
- Primary CTA pressed: `hover:shadow-lg hover:shadow-emerald-500/30`
- Modal / floating chat: `shadow-2xl`
- Default cards: **no shadow** (we lean on border + contrast instead)

### Border treatment

Faint borders everywhere. Standard card:
```html
<div className="bg-white/[0.02] border border-white/8 rounded-2xl">
```

On light mode this automatically flips via our overrides to:
```css
background-color: rgba(17,24,39,0.04);
border-color: rgba(17,24,39,0.08);
```

---

## Part 3 — Component library

### Buttons

**Primary CTA** (the most used control on the site):
```html
<button class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
               text-white font-semibold px-6 py-3 rounded-full
               transition-all hover:scale-[1.03]
               hover:shadow-lg hover:shadow-emerald-500/30
               text-[14px]">
  Start free <ArrowRight className="w-4 h-4" />
</button>
```

Key details:
- `rounded-full` pill
- 14px text, semibold
- `px-6 py-3` for standard, `px-7 py-4` for hero-scale
- Hover: scale 1.03 + emerald shadow + background lightens
- Active: scale 0.95 (via `active:scale-95` in some places)
- Disabled: `disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100`

**Secondary / ghost CTA** (sits next to primary):
```html
<button class="inline-flex items-center gap-2 text-white/80 hover:text-white
               font-medium px-5 py-3 rounded-full
               border border-white/15 hover:border-white/30
               transition-colors text-[14px]">
  Talk to sales
</button>
```

**Text link** (smallest):
```html
<a class="inline-flex items-center gap-1.5 text-[13px] text-emerald-400
          hover:text-emerald-300 font-medium group">
  See sample report
  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
</a>
```

**Icon button** (theme toggle, back arrow):
```html
<button class="w-9 h-9 inline-flex items-center justify-center rounded-full
               border border-white/10 bg-white/[0.04] text-white/70
               hover:text-white hover:bg-white/[0.08] hover:border-white/25
               transition-all active:scale-95">
  <Sun className="w-4 h-4" />
</button>
```

### Cards

**Article card** (Knowledge Base, blog, tier cards):
```html
<div class="group bg-white/[0.02] border border-white/8 rounded-2xl p-6
            transition-all duration-300
            hover:border-emerald-500/40
            hover:-translate-y-0.5
            hover:shadow-[0_0_40px_-12px_rgba(16,185,129,0.25)]">
  <!-- content -->
</div>
```

All interactive cards **must** have:
- `group` class (for nested hover children)
- `transition-all duration-300`
- `hover:-translate-y-0.5` (subtle lift)
- Emerald border tint on hover
- Emerald glow shadow on hover

**Tier card** (`/in`, `/us`, `/pricing`): same pattern + has a `grid lg:grid-cols-[1fr_220px]` split for the price column.

**Dashboard card** (app-side): uses token classes exclusively.
```html
<div class="bg-app-card border border-app-border rounded-2xl p-6 hover:bg-app-card-hover">
```

### Pill tags (Bain-inspired)

The colored chip before article titles:
```html
<span class="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em]
             font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25
             px-2.5 py-0.5 rounded-full">
  US Deal Pitfalls
</span>
```

**Variants:**
- Emerald (default, category tag)
- Amber (`text-amber-300 bg-amber-500/10 border-amber-500/25`) — Featured / priority
- Rose (`text-rose-300 bg-rose-500/10 border-rose-500/25`) — Warning / risk
- White (`text-white/70 bg-white/5 border-white/10`) — Neutral metadata

### Input fields

```html
<input class="w-full px-4 py-3 rounded-full
              bg-white/[0.04] border border-white/10
              text-white placeholder-white/30
              text-[14px]
              focus:outline-none focus:border-emerald-500/50
              focus:bg-white/[0.06]
              transition-colors
              disabled:opacity-60" />
```

- All text inputs are `rounded-full` (matches CTA radius) OR `rounded-xl` inside multi-field forms
- Placeholder `text-white/30` dark mode
- Focus state: emerald border + slight bg lift
- Errors: add `border-rose-500/40` + `text-rose-300` message below

### Chat panel (`AIChatPanel.tsx`)

Floating widget bottom-right on every authenticated page. Structure:
- Collapsed: pill-shaped button `right-6 bottom-6`, emerald
- Expanded: `w-[420px] h-[640px]` card with:
  - Header: CortexAI title + connection dot + close button
  - Mode toggle: Quick Answer · Think Deeper (pill pair)
  - Message list: user bubbles right (emerald), AI bubbles left (card bg)
  - Thinking panel (collapsible): gray italic text
  - Input footer: textarea + send button + model label

Mode-label footer is important: **"Quick-Match + Reasoner"** or **"Strategist · Extended Reasoning"** — NEVER show "Sonnet" / "Claude" / "Haiku" in user-facing text.

### Newsletter block (Bain-inspired)

On `/knowledge-base` before the CTA. Pattern:
```html
<div class="relative overflow-hidden rounded-3xl border border-emerald-500/20
            bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.02] to-transparent
            p-8 lg:p-10">
  <div class="absolute -right-16 -top-16 w-64 h-64
              rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
  <div class="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
    <!-- left: copy -->
    <!-- right: email form -->
  </div>
</div>
```

Key visual moves:
- `rounded-3xl` (22px, larger than standard cards — signals "moment of intent")
- Emerald gradient background with glow blur behind right edge
- 2-column grid on desktop, stacks on mobile

---

## Part 4 — Page-by-page walkthrough

### 4.1 — `/` (default landing)

**Sections, top-to-bottom:**

1. **Hero** — 2-column on desktop:
   - Left: badge + inline region toggle (🇺🇸 US / 🇮🇳 IN pills), H1 with emerald gradient on "Quality of Earnings" span, 18px body, primary CTA + secondary CTA, sample report text link, "no card required" check badge, founder quote
   - Right: `<HeroLiveDemo />` — animated mock of the app dashboard
2. **Trust bar** — 4 items with emerald accents (Certified QB Partner, CPA-Signed, Cognitive Engine inside, etc.)
3. **Problem** — Big-4 cost comparison
4. **Product essentials** — tabbed feature grid with live mockups (EssentialMockup component)
5. **Testimonials ticker** — 2 rows, reverse direction, 60s duration, subtle emerald accent
6. **Onboarding timeline** — 3-step (Sign up → Upload → Receive)
7. **Advisory disclaimer** — 14px white/65, explicitly states "not audit"
8. **Floating CTA** — fixed bottom-right emerald pill (`Start 14-day trial`)

**Visual character:** dark, spacious, emerald highlights on specific words (never entire sentences). Lots of whitespace between sections.

### 4.2 — `/us` and `/in` (regional landings)

Same structural template. Differences:
- `/us` — $ pricing, ASC 606 references, "M&A Readiness"
- `/in` — ₹ pricing, Ind AS references, "PE Readiness", Tally/Zoho integration names

5-tier ladder (both):
1. Starter (free)
2. Growth
3. Diligence
4. Pre-M&A (US) / Pre-PE (IN)
5. QoE-Ready

**Tier card layout:** `grid lg:grid-cols-[1fr_220px] gap-6 lg:gap-10 items-start`. Left column has Tier N eyebrow → title → tagline → features list. Right column has price + CTA.

**"Most popular" badge** sits **inline** in the eyebrow row (next to "Tier N · band"), NOT absolute-positioned (we fixed that overlap bug — see technical doc).

### 4.3 — `/how-it-works`

The Cognitive Engine page. Sections:

1. **Hero** — "Machines now think like brains." Emerald gradient. Live animated neural-network SVG (BrainHeroIllustration) on the right.
2. **Thesis** — "One brain. Many regions." 3-card bad-vs-good contrast (rose icon for "what most AI does", emerald for "what we do")
3. **Pipeline diagram** — full-width inline SVG showing ledger → 4 layer nodes (emerald/cyan/violet/amber) → CPA-signed QoE pack with flow arrows
4. **4 layer cards** — each with its brain-region analogy ("≈ prefrontal cortex") + pill chips showing which models live in that layer
5. **8-model grid** — 4-column grid at lg, each card has icon + name + role + description
6. **Worked example** — "Why did gross margin drop 2 points in Q3?" traced end-to-end from t=0ms to t=3.7s across 7 models. Uses mono font for the timestamps, regular font for the who/what.
7. **Differentiators** — 4-card grid (ledger-grounded / model routing / two-layer truth / deterministic math)
8. **Closing CTA** — "Give it a ledger. Watch it think."

**Why this page exists:** it's the "show your work" document for sophisticated buyers (PE associates, CFOs, corp dev). Without it, we're one more AI product. With it, we're an architecture.

### 4.4 — `/product`

Alternating 2-col feature rows with illustration on alternating sides. Four features:

1. "From raw data to boardroom-ready analysis" — custom SVG (`DataToAnalysisIllustration`)
2. "Surface what matters. Automatically." — Unsplash neural-grid (kept)
3. "Compliance checks that never sleep" — Unsplash circuit-board (kept)
4. "Ask anything. Get answers with your actual numbers." — custom SVG (`AskAnythingIllustration`)

Hero includes a mock-browser frame wrapping `HeroDashboardIllustration` (also custom SVG).

### 4.5 — `/pricing`

- Optional **post-onboarding celebration banner** at top when `?source=onboarding`:
  ```html
  <div class="rounded-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-500/15">
    ✨ "Your analysis is ready" badge
    Large: "Pick a plan to unlock continuous monitoring."
    Body: "Your first report is in the dashboard. Paid plans add..."
    Text link: "Skip for now — open dashboard →"
  </div>
  ```
- 4-column plan grid (Diligence / Growth / Portfolio / Enterprise)
- Growth plan is **highlighted** with `"Most popular"` starred ribbon above
- Comparison table (13 rows × 4 plan columns) with check/dash/value cells
- Advisory disclaimer
- Closing CTA

### 4.6 — `/checkout`

Split layout: left = payment form (account info, method picker, preview card/UPI/bank), right = sticky order summary.

**Amber "Demo checkout" banner** at top because no real gateway is wired. Copy: *"Demo checkout. This flow is live for preview — no card is charged and no payment gateway is connected yet."* Keep this copy until Stripe/Razorpay lands.

Payment method picker is region-aware:
- US: Card, Bank transfer (no UPI)
- IN: Card, UPI, Bank transfer

### 4.7 — `/knowledge-base`

**Sections:**
1. Hero with breadcrumb + book icon + search bar
2. Category tab strip (horizontal pills) — `All (N)` + 6 categories
3. Featured articles grid (only when `All` + no search) — 3 columns
4. Full article list, grouped by category
5. **Newsletter signup panel** (new — Bain-inspired)
6. Closing CTA

Every article card in the list shows:
- Pill tag (category)
- Optional amber "Featured" pill if flagged
- Headline (17px semibold)
- Summary (14px white/55)
- Read time eyebrow
- Chevron that rotates on expand

Click → expands inline with body paragraphs (14px, line-height 1.75).

**Category order (by intent):** US Deal Pitfalls, Healthcare Sector, Core Concepts, Playbooks, Compliance & Standards, Integrations & Data.

### 4.8 — `/glossary`

A-Z grouped index. Search bar at top. Each term = bold heading + short def below. No cards, no pill tags — this is a reference, not a content experience.

### 4.9 — `/faq`, `/blog`

Standard marketing templates. Each FAQ card is a collapse — click to expand. Blog currently has placeholder posts.

### 4.10 — `/about`, `/contact`, `/careers`

Minimal pages. `/about` has a milestone timeline. `/contact` has a contact form. `/careers` has a jobs list.

### 4.11 — `/terms`, `/privacy`

Legal — keep the typography conservative, no emerald accents, no decoration. This is the place to read boringly on purpose.

### 4.12 — `/login`, `/signup`, `/verify-email`

Split-screen auth layout (sharing a group layout in `(auth)/layout.tsx`). Left = form; right = supporting panel (testimonial / copy). Mobile stacks.

### 4.13 — `/onboarding`

4-step wizard:
1. Personal (name, phone, role)
2. Business (company, currency, industry, entity type, GSTIN/EIN)
3. Financial Data (financial years, upload type) — **actual upload step**
4. AI Analysis (spinner while the Cognitive Engine runs)

After step 4, routes to `/pricing?region={us|in}&source=onboarding`. If onboarding was previously completed, the page short-circuits to `/dashboard`.

### 4.14 — Authenticated app (`(app)/...`)

Shared sidebar (260px wide, dark card bg):
- Logo at top
- Workspace selector (company name + user name, opens to Profile + Uploads)
- Nav items: Dashboard, Analysis, Industries, Scenarios, QoE Center, AI Feedback, Integrations
- Upgrade-to-Pro card (emerald gradient, subtle)
- Bottom row: Logout button + Theme toggle (compact)

Main content area:
- `overflow-y-auto`
- Each page has its own header with title + region pill + FX strip (on dashboard) + action buttons

Floating chat on every page (bottom-right).

---

## Part 5 — Interaction patterns & motion

### Hover rules
- Every CTA: **scale 1.03 + emerald shadow** on hover
- Every card: **translate-y -2px + emerald border tint + emerald glow shadow**
- Every text link with arrow: **arrow translates right 2px** (`group-hover:translate-x-0.5`)
- Every disabled element: **opacity 60% + cursor-not-allowed + skip hover effect**

### Focus states

Every interactive element needs a visible focus ring on keyboard navigation:
- Buttons: default browser outline is fine (don't `outline-none` without a replacement)
- Inputs: `focus:border-emerald-500/50` is our pattern — emerald border replaces the default ring
- Cards with click handlers: add `focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-app-canvas`

### Transitions
- Color changes: `transition-colors` (150ms)
- Scale / shadow: `transition-all duration-300`
- Layout (collapse/expand): `transition-[max-height]` with measured max-height, OR Framer Motion for non-trivial cases

### Motion library

`framer-motion` is installed. Use **sparingly** for:
- Page-entry fades (`<FadeIn>` wrapper in `src/components/Animate.tsx`)
- Modal / popover enter-exit
- Streamed content (chat responses stream token-by-token — handled by CSS, not framer)

**Never animate the Cognitive Engine diagrams in a way that competes with content.** The neural-network SVG has subtle pulsing rings — that's enough.

### Page transitions

No full-screen transitions. Router navigations are instant; individual sections fade in as they scroll into view via `<FadeIn>`.

---

## Part 6 — Dark / Light theme rules

The toggle lives in 3 places:
1. Top nav (every marketing page) — small round pill with Sun/Moon
2. App sidebar (every dashboard page) — same treatment, compact
3. Mobile menu bottom row

### The rules

- **Default is dark.** First-time visitors land on dark.
- **Respect `prefers-color-scheme: light`** if user hasn't explicitly chosen — handled in the no-flash script at the top of `layout.tsx`.
- **Explicit choice persists** in localStorage key `cortexcfo-theme` — values `"light" | "dark" | "system"`.
- **Every page must work in both themes.** If a component reads wrong in light, add a token (not a hex) — and if you must hex, add the matching override in globals.css's `html.theme-light` block.

### Contrast requirements

Every text/background pair above clears **WCAG AA 4.5:1**. If you're adding new colors, verify with WebAIM Contrast Checker or similar. Specifically watch:
- `text-white/30` on `#0a0a0a` — passes (barely)
- `text-emerald-400` on `#fafaf7` — FAILS. We bumped to `emerald-700` for light mode. If you introduce emerald text, check it in light first.

### Brand color behavior across themes

Emerald stays emerald. It reads well on both dark and light. But:
- `text-emerald-400` on **light** canvas is below AA — always use `text-emerald-700` instead, OR let our compensating override kick in (`.theme-light .text-emerald-400` rewrites to `#047857`).

---

## Part 7 — Content patterns

### Headlines

Use the **"X. Y."** pattern for section headlines with a line break — eg:
- "Stop guessing.\nStart modelling."
- "Give it a ledger.\nWatch it think."
- "Machines now\nthink like brains."

Top line = normal color. Second line = emerald gradient span. This is a brand fingerprint.

### Eyebrow (above every section headline)

Tiny uppercase label in emerald:
```html
<p class="text-[11px] font-semibold tracking-[0.2em] uppercase text-emerald-400 mb-3">
  How It Works
</p>
```

### Stats / numbers

Big, `font-bold tabular-nums`. Always pair with a label below in `text-app-text-subtle`.

### Quotes / testimonials

Use `italic` for quoted text, regular for the attribution. Attribution format: `— Name, title, context`.

### Disclaimers

- **Always visible**, never buried
- Label: `"Advisory, not audit."` in bold
- 14px body, white/65 — readable but not shouting

### CTAs

Every CTA pair follows: **primary action first** (emerald filled), **ghost/secondary second** (bordered). Mobile stacks them.

---

## Part 8 — Accessibility

Current state:
- Semantic HTML throughout (`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- `aria-label` on icon-only buttons (Theme toggle, close buttons, back arrows)
- `role="status"` + `aria-live="polite"` on async updates (newsletter success, chat thinking)
- `role="alert"` on error messages

What's missing (known):
- Full keyboard navigation audit — has not been done end-to-end
- Screen-reader verification — has not been tested with JAWS / NVDA / VoiceOver
- Focus ring audit on newer components (Checkout form, Newsletter form)

---

## Part 9 — Design debt

Listed, roughly by impact:

1. **Two Unsplash images on `/product`** still need custom illustrations. Commission when bandwidth allows. Until then, they're kept because they read neural/connected.
2. **OG images.** Every page currently uses the same default OG. Designing a branded template per page will help social sharing.
3. **Blog post design.** `/blog` index is styled, but individual post pages don't exist yet. Follow the knowledge-base article expanded state as the template when it's time.
4. **Empty states.** Dashboard / Analysis / QoE each have an empty state, but they're text-heavy. Would benefit from a friendly illustration.
5. **Mobile audit.** We've built responsive throughout, but nothing has been stress-tested on small iPhone (375px). The tier card `grid lg:grid-cols-[1fr_220px]` stacks correctly but the newsletter form's `flex-col sm:flex-row` can feel cramped below 340px.
6. **Dark mode comes first.** Light mode is fully functional but a few spots (`/integrations` older widgets, advisory disclaimer) are tuned for dark. Walk through each app page in light mode and adjust contrast where needed.
7. **Favicon.** Currently the default Next.js one. Replace with an emerald mark.
8. **Illustration consistency.** `ProductIllustrations.tsx` SVGs are good but each uses slightly different stroke widths / corner radii. A unified illustration guideline would tighten the family.
9. **Feature-tab illustrations.** On the main landing, `EssentialMockup` has 5 tabs and each has a hand-built SVG mock. Some are more polished than others — consistency pass needed.

---

## Part 10 — Design assets inventory

| Asset | Location | Owner |
|---|---|---|
| Logo SVG (mark) | inline in `SiteNav.tsx` (not a file yet) | — |
| Favicon | `public/favicon.ico` | default Next.js |
| Custom product illustrations | `src/components/ProductIllustrations.tsx` | inline SVG |
| How-it-works diagrams | `src/app/how-it-works/page.tsx` | inline SVG |
| Stock imagery | Unsplash URLs hard-coded in `src/app/product/page.tsx` (2 images) | Unsplash |
| Fonts | Google Fonts (Poppins + JetBrains Mono) via `next/font` | Google |
| Icon set | `lucide-react` npm package | Lucide open-source |
| Color palette | `src/app/globals.css` — `@theme inline` + `.theme-light` + `.theme-dark` | — |

**No Figma file yet.** If the new design team wants to move to Figma as source of truth, establish that on day 1 and create the token + component library there before designing anything new.

---

## Part 11 — Design inspirations referenced

| Source | What we used |
|---|---|
| **Bain Insights** (bain.com/insights/topics/cfo-insights, /m-and-a-report, /ai, /ceo-agenda) | Card-based grid with pill tags, featured articles, newsletter signup module, editorial typography hierarchy |
| **Stitch UI/UX audit** (earlier engagement) | Paired CTA pattern, early-funnel text link, dashboard feature grid with live mockups |
| **Linear, Vercel, Stripe** (general reference) | Typography scale, emerald-on-dark canvas, minimal icon use, button polish |
| **Claude / Anthropic site** (reference point) | Copy voice for the Cognitive Engine page — "show your work" approach |

---

## Part 12 — Handoff checklist for the new designer

Day 1:
- [ ] Visit every live URL (listed in the Combined doc)
- [ ] Read the voice guide (Part 0) and one article on `/knowledge-base`
- [ ] Toggle light/dark on every marketing page — note anything that reads wrong
- [ ] Walk through signup → onboarding → dashboard as a new user would

Day 2:
- [ ] Read `globals.css` top to bottom
- [ ] Open `SiteNav.tsx`, `SiteFooter.tsx`, `AIChatPanel.tsx` — these are the cross-cutting components
- [ ] Pick ONE item from the design debt list and spec a fix

Day 3:
- [ ] Start a Figma file with the token library + component kit
- [ ] Export the logo as a proper SVG asset (replace inline version)
- [ ] Ship one improvement end-to-end so you've touched the deploy path

---

*End of Design Handoff.*
