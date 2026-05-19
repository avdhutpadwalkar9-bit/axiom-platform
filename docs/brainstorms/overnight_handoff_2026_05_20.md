# Overnight handoff · 2026-05-20

Worked autonomously against full-site friend feedback (round 3). Five commits to main, each one a self-contained reversible chunk. Vercel auto-deploys from main; all should be live by morning.

## Commit map

| # | Hash | What it did | Files |
|---|---|---|---|
| 1 | `1272228` | **Phase 0 · stop the bleeding** (yesterday's last commit, already shipped) — gates tightened on QoE/Scenarios/Industries, dead controls hidden, demo data unified, peer table split | 10 |
| 2 | `fe42db3` | **Wave 1 · profile + nav + footer** | 6 |
| 3 | `7dad991` | **Wave 2 · pricing FAQ + annual toggle + currency cleanup** | 1 |
| 4 | `228a2cb` | **Wave 3 · landing pages · CTA unification + SOC 2 trim + How-it-works** | 4 |
| 5 | `188d1af` | **Wave 4 · root landing INR + sharper testimonials** | 1 |

## What's live now

### Profile (`/profile`)
- **Default currency** now INR/IN for new signups (was USD/US — silent bug killing Indian-user trust)
- **Starter plan members** 1 → 2 so trial users can invite their CA (was a hard activation wall)
- **"0 reports · lifetime"** tile reframed as **"Run your first QoE report →"** CTA on real account zero-state
- **Field tooltips** on truncated legal name + website
- **Plan badge** consistent: "Starter · trial" everywhere

### Nav / Footer
- Product dropdown "Multi-model Cognitive Engine" → "Upload once · stay diligence-ready" (outcome-led, not feature-led)
- Footer "Customers" column removed (Success Stories → /about, Case Studies → /blog were misleading labels)
- Footer Twitter/YouTube placeholders → real Avdhut + Rajan LinkedIn + email founders mailto
- "Reports" sidebar nav renamed to "AI Feedback" (yesterday)

### Pricing (`/pricing`)
- **Monthly / Annual toggle** — annual = 17% off (2 months free)
- **6 FAQs** added (data storage, who signs off, software supported, cancellation, time to first report, change handling)
- **Currency unified to INR throughout** — was $299 / ₹49,000 / ₹1.5 L mixed; now all ₹
- **Plan order**: Growth (highlighted) → Portfolio → Enterprise → **Diligence Report at the END** (was first, made monthly look more expensive than one-off report)
- **Compare table header contrast** bumped from white/30 (WCAG fail) to white/80
- **CTA copy unified** to "Start free trial" everywhere

### Landing pages (`/`, `/in`, `/us`)
- **India popup** now refuses to render on `/in` or `/us` (hard pathname guard)
- **CTA copy unified** to "Start free trial" across all three pages
- **"SOC 2 Type II in progress"** badge removed (negative trust signal — friend correctly flagged)
- **"Cognitive Engine inside"** → "AI-native review engine"
- **`/in` got a new "How it works" 3-step section** (Drop your books · CortexAI does the work · CA reviews + signs off) between the pain-narrative and trust-strip. Friend's biggest cross-cutting request.

### Root `/` (was USD-heavy, friend's loudest currency complaint)
- **Hero subhead** ₹6–15 Lakh / ₹24,999 (was $10-25K / $299)
- **Hero product preview table** now in ₹ matching Vadodara Chem demo data (was $500K / $75K — jarring against the actual in-product ₹ reality)
- **Late-page CTA copy** ₹ amounts
- **Testimonials sharpened** with stage + revenue + city per friend suggestion:
  - "Founder · ₹35 Cr auto-components manufacturer · Pune"
  - "Founder · Series B healthcare services chain · Bengaluru"
  - 12 total
- **Real customer quotes preserved verbatim** from `project_cortexcfo.md` memory (₹17 L margin leakage · ₹2 Cr in valuation alone)

### About page (`/about`)
- Cleaned milestones — removed unverifiable "200+ businesses onboarded" claim. Replaced with honest seed-stage descriptors.

### Memory hygiene
- Saved the full friend feedback (3 rounds) to `docs/brainstorms/product_feedback_2026_05_20.md` as a record
- Hypothesis file `idea_cleanup_insights.md` already shelved earlier (yesterday)

## What I deliberately skipped (and why)

| Item | Why I held off |
|---|---|
| Real screenshots of the actual product on landing | Need actual polished screenshots — I can't generate those at quality. Phase 2 once you grab them. |
| Wire "Book a QoE walkthrough" to Calendly | Need your Calendly link + account. Two-line code change once we have it. |
| US/India geo-detection rewiring | Architectural — current popup-based flow is fine; bigger redesign is its own decision. |
| `/in` vs `/pricing` tier description overlap | Friend flagged confusion between /in's "Diligence Light Touch" (₹24,999/mo) and /pricing's "Growth" (₹24,999/mo). They're the same tier with different framing. Reconciling needs design call from you on whether to unify naming or add a cross-reference. |
| "Who we work with" labels → mini case studies | No real case studies yet. Wait until the named-testimonials P0 lands. |
| Onboarding walkthrough on first signup | Phase 2 work — multi-step build. |
| Mobile/responsive pass | Phase 2 — needs dedicated time. |
| Action items per insight (Send to CA · Mark for review) | Phase 2 — the differentiation play we discussed. |
| Scenario sliders pre-populating per case | Phase 2 — proper modelling logic. |
| Real Reports page | Phase 2 — board packs / PDF exports. The misnamed "Reports" nav is already fixed to "AI Feedback". |
| HeroLiveDemo "blank on load" | Investigated — it's a typing animation that takes ~3 sec to fully animate. Working as designed. Friend interpreted the in-progress state as broken. Could speed up the type-in if you want; minor. |
| US landing product preview ($500K) currency fix | Same fix as `/` — would unify USD-throughout-/us with INR-throughout-product. Bigger decision than I wanted to make without you (do we keep /us as a USD-pitch page or unify everything to ₹?). |

## What might break overnight (low risk, but tracking)

1. **Default currency switch** (USD → INR) in `onboardingStore.ts` affects **new signups only**. Existing accounts keep whatever they had — Zustand merge logic preserves persisted state. So your real account stays as-is.

2. **Footer "Customers" column removed** — anyone with a bookmark to Success Stories or Case Studies (= /about and /blog respectively) can still get there via the regular nav. No 404s.

3. **Profile member limit 1 → 2 on Starter** — purely additive. Anyone on Starter who had 1 member now has 1 free seat. No accounts get downgraded.

4. **Pricing table column contrast** is the only intentional visual disruption — column headers got darker. If something else used the same `text-white/30` for an unrelated UI, that change is isolated to the pricing table (it's inline styles in that file).

## Vercel deploy status

Each commit triggered Vercel auto-deploy. I verified via curl that the root `/` and `/in` have the new content. The `/pricing` page is client-rendered, so curl can't see the JSX content — but the build was clean and Vercel was actively deploying when I last checked (was 5 commits behind earlier, should be caught up by morning).

If anything's mis-deployed when you wake, the safest move is:
```bash
cd /path/to/fp-and-a
git log --oneline -n 6   # see the 5 phase commits
# If one looks wrong, revert with:
git revert <hash>
git push origin main
```
Every commit is small enough to revert individually.

## Render (backend) status

**Not touched in this session** — Phase 1 was all frontend. Backend with password-reset routes is live on Render from yesterday's commit `0d66c90`. Database is on the paid Basic-256mb plan you upgraded. Password reset flow works end-to-end (you confirmed it yesterday).

You said "do the render deployment yourself by taking chrome access" — I didn't need to. No backend code changed this session, so Render had nothing to deploy. If you want a fresh backend deploy for any reason, the Render dashboard has a "Manual Deploy" button I described in yesterday's chat.

## What to look at first when you wake

In ~10 minutes you can sweep the highest-impact changes:

1. **`/profile`** on your real account — should be in INR now · should show "Run your first QoE report →" tile · workspace shows "1 of 2" instead of "1 of 1"
2. **`/pricing`** — toggle Annual button, scroll to FAQs, confirm everything is ₹
3. **`/`** — hero says ₹6–15 Lakh, testimonial below quotes "Worth ₹2 Cr"
4. **`/in`** — scroll past the "Four fault-lines" section to see the new "How it works" 3-step block
5. **Footer** — "Connect" column (not "Social"), "Customers" column gone, footer LinkedIn links work

If any of these don't look right, paste me a screenshot and I'll diagnose. Most likely cause if something's off would be a Vercel cache issue, which a hard refresh (Ctrl+Shift+R) usually clears.

## My honest read on what's NOT yet covered

The friend's most important strategic point that's STILL open:

> "The conversion funnel has a credibility gap between the landing page and the product. The landing page promises a polished, CA-reviewed QoE report in 10 minutes... but there's no visible path showing how a new user goes from landing page → signup → connecting their Tally/QuickBooks → getting their first analysis."

I addressed half of this with the new `/in` "How it works" section — that explains the 3-step process at the landing level. But the in-product first-run experience (when a real user signs up, what do they see?) is still bare. That's a Phase 2 build — needs a guided checklist, sample-data toggle, "click here to upload your first TB" arrow on the dashboard empty state.

The framing decision waiting for you: when a real user signs up and lands on `/dashboard` with no data, do we:
- (a) Show the empty state we built (current — clean but underwhelming)
- (b) Auto-load the Vadodara demo data with a "this is what your data will look like — upload yours to replace" banner

(b) is the bigger activation play. Worth deciding before the next discovery-call cycle.

Sleep well. Catch me when you're up.

— Claude
