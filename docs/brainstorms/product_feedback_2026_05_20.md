# Product feedback · 2026-05-20

Three rounds of detailed audit from a senior product/finance friend. Captured here as a single record so future sessions can reference what was raised, what was addressed, and what was deferred.

---

## Round 1 · Industry page (focused)

- Peer table comparing ₹45 Cr Vadodara vs ₹342 Cr Pidilite — credibility break
- DSO + DPO both amber, direction ambiguous
- KPI cards lack interactivity cues / explainer
- "View All 47" leads nowhere
- "Working Capital Cycle" under-labelled (should be Cash Conversion Cycle)
- Left nav hierarchy could be richer (Home / Insights / Tools / Data)
- No time-period toggle on Industry page
- "Ask CortexAI" FAB overlaps lower-right content

## Round 2 · Authenticated product (every page)

- Global: "Reports" goes to AI Feedback page (misname), Compliance tab on Dashboard routes to /integrations, sidebar truncates username
- Dashboard: period toggle does nothing, Revenue ₹1.4 Cr (Tohands real data) vs QoE ₹45 Cr (Vadodara demo) — data inconsistency, identical sparkline curves, attention-rail CTAs go nowhere, status pill labels need legend
- Analysis: view toggle (Abs/Common-size/% Change) non-functional, Compare/Segment/Adjustments dropdowns inert, "0 ledger entries" trust killer, revenue shown as negative
- QoE: period tabs don't update, sub-tabs are anchor scrolls, Diligence pack tab dead, "Over 180d (suspect)" alarming language, EBITDA bridge truncated labels, Ind AS catalogue chip dead
- Scenarios: sliders don't update cards, case cards don't pre-populate sliders, Save/Reset buttons untested
- Uploads: source filter tabs inert, "hover for preview" untested, Bulk delete no confirmation
- Reports (misname): should be a real reports page; current AI feedback page belongs in settings
- Integrations: Configure/Connect buttons inert, no WhatsApp, Tally should be featured
- CortexAI chat: overlap, no history, no suggested prompts

## Round 3 · Public site

### US landing (/)
- Hero preview shows USD ($500K/$75K) but product is INR — currency mismatch
- "Book a QoE walkthrough" CTA not wired
- US/India toggle confusing, India popup appears even on /in
- Anonymous testimonials (Series A founder / Bengaluru would help)
- "SOC 2 Type II in progress" reads as negative trust signal
- Three-column "Who it's for" cards dimmed by Resources dropdown overlay

### India landing (/in)
- "Four fault-lines" section is best content on whole site
- "Who we work with" labels are static — could be linked to mini case studies
- Named-reference NDA line buried in footnote
- Tier ladder dense → could use a "what stage are you at?" mini-quiz
- Tier pricing inconsistent between /in and /pricing (Tier 3 = Growth, Tier 4 = Portfolio, but feature descriptions overlap confusingly)
- CTA copy inconsistent: "Start free", "Start free trial", "Start your 14-day trial"
- India page hero mockup blank on load (race condition)

### Pricing
- Currency confusion: $299 next to ₹49,000 next to ₹1.5 L
- Diligence Report ₹49K one-time placed before Growth ₹24,999/mo subscription — misleading order
- No annual pricing option
- No FAQs on the page
- Compare table column headers low contrast (accessibility issue)

### Navigation (header)
- About goes nowhere (page exists, link may be broken)
- Resources dropdown items go nowhere
- Contact nav doesn't navigate
- No Login button for guests
- Product dropdown copy "Multi-model Cognitive Engine" is feature-led, not benefit-led

### Profile
- Default currency USD for Indian user
- "Starter plan" vs "Trial" naming inconsistent
- "0 reports run · lifetime" tile is discouraging
- Team members 1 of 1 · 0 slots — no room for CA invite on trial
- Legal name + website truncated

### Footer
- Links to Success Stories, Case Studies, Glossary, Blog, FAQ, Careers, About — friend reports several broken

### Overall journey
- No visible onboarding from landing → signup → first analysis
- Empty-state on first product visit unclear
- US/India context switch jarring (different visual language)
- Landing white/light vs product dark — no transition continuity

## What's strong (preserve)
1. The "Big-4 ₹15L vs CortexCFO ₹25K" value frame
2. India-specific domain knowledge (Ind AS, GSTR-2A, promoter add-backs)
3. The tier ladder concept
4. Privacy + CA-reviewed trust language
5. Copy tone throughout — sharp, jargon-literate, authentic
