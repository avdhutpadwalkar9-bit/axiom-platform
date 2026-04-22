# CortexCFO — Handoff Knowledge Base

Three documents. Pick the one that matches your role; start at the top; cross-reference the others when needed.

## Files in this folder

| File | Pages | For |
|---|---|---|
| [`03-COMBINED-OVERVIEW.md`](./03-COMBINED-OVERVIEW.md) | ~15 | **Start here.** Leadership, new hires, anyone who needs the full picture in one read. |
| [`01-TECHNICAL-HANDOFF.md`](./01-TECHNICAL-HANDOFF.md) | ~25 | Engineering team taking over build and maintenance. |
| [`02-DESIGN-HANDOFF.md`](./02-DESIGN-HANDOFF.md) | ~23 | Design team taking over visual language, components, and content. |

## How they relate

```
            ┌──────────────────────────────────┐
            │      03 — Combined Overview       │
            │   (shared context + cross-refs)   │
            └──────────┬──────────────┬────────┘
                       │              │
                       ▼              ▼
         ┌─────────────────┐   ┌─────────────────┐
         │  01 — Technical │   │  02 — Design    │
         │     Handoff     │   │     Handoff     │
         │  (engineering)  │   │   (designers)   │
         └─────────────────┘   └─────────────────┘
```

All three start with the same **Part 0 — thought process behind the business**, so whichever one you pick, you get the context first. After Part 0, the docs diverge by audience.

## How to read this if you're new

1. Spend ~2 hours with `03-COMBINED-OVERVIEW.md` — Part 10 in that doc is a literal 2-hour walkthrough
2. Then pick either 01 or 02 based on your role
3. Use the Combined doc's cross-references when you hit a "wait, what does that mean" moment

## Written / last reviewed

- Written: **2026-04**
- Commit at time of writing: **`df0cc48`**
- Reviewed: 3 passes (structure → accuracy → polish)
- Reviewed by: the founder-assistant pairing that built the system

When the product changes materially, update the relevant doc and bump the "Commit at time of writing" line at the top. These are living documents.
