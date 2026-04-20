"""
FAQ matching service.

Given a user's question + their live analysis result, try to match against
the seeded FAQ bank and return a fully-interpolated answer. Returns None
if no FAQ clears the confidence threshold — caller falls through to the
LLM.

DESIGN:
- Stdlib-only matcher (difflib + set jaccard + keyword hits). For <500
  FAQs this is accurate enough and has zero dependencies. Upgrade path:
  swap _score_faq for embedding-based cosine similarity once we exceed
  ~500 entries and care about paraphrase tolerance.
- Interpolation is defensive: any placeholder we can't fill is STRIPPED
  from the output rather than left as a literal "{placeholder}" — we'd
  rather return a shorter answer than expose template syntax.
- Build_placeholders centralises every derivation. Adding a new placeholder
  means one edit here, then reference it in faq_data.py.
"""

from __future__ import annotations

import logging
import re
from difflib import SequenceMatcher
from typing import Optional

from app.services.faq_data import SEED_FAQS

logger = logging.getLogger(__name__)

# Confidence threshold — below this we give up and fall through to LLM.
# Tuned to trade false positives (wrong FAQ fires) against false negatives
# (good match missed). Empirically 0.55 is the sweet spot for our current
# seed size; raise to ~0.7 when FAQ count grows past 200.
MATCH_THRESHOLD = 0.55


# ─── Formatting helpers ────────────────────────────────────────────────

def fmt_money(val: float | int | None, region: str = "US") -> str:
    """Region-aware compact currency.

    US: $<n>M / $<n>K / $<n>
    IN: ₹<n> Cr / ₹<n> L / ₹<n>K / ₹<n>
    """
    if val is None:
        return "—"
    try:
        v = float(val)
    except (TypeError, ValueError):
        return "—"
    sign = "-" if v < 0 else ""
    a = abs(v)
    if (region or "").upper() == "IN":
        if a == 0:
            return "₹0"
        if a >= 10_000_000:
            return f"{sign}₹{a / 10_000_000:.2f} Cr"
        if a >= 100_000:
            return f"{sign}₹{a / 100_000:.2f} L"
        if a >= 1_000:
            return f"{sign}₹{a / 1_000:.1f}K"
        return f"{sign}₹{a:,.0f}"
    # US / default
    if a == 0:
        return "$0"
    if a >= 1_000_000:
        return f"{sign}${a / 1_000_000:.2f}M"
    if a >= 1_000:
        return f"{sign}${a / 1_000:.1f}K"
    return f"{sign}${a:,.0f}"


# Legacy alias — kept as fmt_inr for any callers still importing by the
# old name. Defaults to Indian formatting for backwards-compatibility.
def fmt_inr(val: float | int | None) -> str:
    return fmt_money(val, region="IN")


def _pct(a: float, b: float) -> float:
    if not b:
        return 0.0
    return round((a / b) * 100, 1)


# ─── Placeholder derivation ────────────────────────────────────────────

def build_placeholders(
    analysis_result: dict,
    business_context: Optional[dict] = None,
    region: str = "US",
) -> dict[str, str]:
    """Read the live analysis data and produce a flat dict of template
    values. Missing data produces empty strings so the FAQ still renders
    without crashing; we strip dangling sentence fragments afterwards."""
    ph: dict[str, str] = {}
    fs = analysis_result.get("financial_statements", {}) if analysis_result else {}
    ratios = analysis_result.get("ratios", {}) if analysis_result else {}
    ca = analysis_result.get("classified_accounts", {}) if analysis_result else {}
    warnings = analysis_result.get("warnings", []) if analysis_result else []
    ind_as = analysis_result.get("ind_as_observations", []) if analysis_result else []

    revenue = float(fs.get("total_revenue") or 0)
    expenses = float(fs.get("total_expenses") or 0)
    net_income = float(fs.get("net_income") or 0)
    assets = float(fs.get("total_assets") or 0)
    liabilities = float(fs.get("total_liabilities") or 0)
    equity = float(fs.get("total_equity") or 0)

    ph["revenue_fmt"] = fmt_money(revenue, region=region)
    ph["expenses_fmt"] = fmt_money(expenses, region=region)
    ph["net_income_fmt"] = fmt_money(net_income, region=region)
    ph["abs_net_income_fmt"] = fmt_money(abs(net_income))
    ph["assets_fmt"] = fmt_money(assets, region=region)
    ph["liabilities_fmt"] = fmt_money(liabilities, region=region)
    ph["equity_fmt"] = fmt_money(equity, region=region)

    # Ratios
    gm = ratios.get("gross_margin", 0) or 0
    nm = ratios.get("net_margin", 0) or 0
    ph["gross_margin"] = str(gm)
    ph["net_margin"] = str(nm)
    ph["current_ratio"] = str(ratios.get("current_ratio", 0) or 0)
    ph["debt_to_equity"] = str(ratios.get("debt_to_equity", 0) or 0)
    wc = float(ratios.get("working_capital") or 0)
    ph["working_capital_fmt"] = fmt_money(wc, region=region)

    # Revenue breakdown
    rev_items = ca.get("revenue", [])
    if rev_items:
        top = max(rev_items, key=lambda x: max(x.get("credit", 0), x.get("debit", 0)))
        ph["top_revenue_name"] = top.get("name", "—")
        top_val = top.get("credit", 0) or top.get("debit", 0)
        ph["top_revenue_amount_fmt"] = fmt_money(top_val, region=region)
        rev_lines = []
        for r in rev_items[:5]:
            v = r.get("credit", 0) or r.get("debit", 0)
            rev_lines.append(f"- **{r.get('name', '—')}**: {fmt_money(v, region=region)}")
        ph["revenue_breakdown_md"] = "\n".join(rev_lines) if rev_lines else "- No revenue line items found"
    else:
        ph["top_revenue_name"] = "—"
        ph["top_revenue_amount_fmt"] = "—"
        ph["revenue_breakdown_md"] = "- No revenue line items found"

    # Expenses — top 3 + top 5
    exp_items = sorted(
        ca.get("expenses", []),
        key=lambda x: abs(x.get("net", 0) or 0),
        reverse=True,
    )
    if exp_items:
        top_exp = exp_items[0]
        ph["top_expense_name"] = top_exp.get("name", "—")
        te_val = abs(top_exp.get("net", 0) or 0)
        ph["top_expense_fmt"] = fmt_money(te_val, region=region)
        ph["top_expense_pct"] = str(_pct(te_val, expenses))
        ph["top_expense_5pct_fmt"] = fmt_money(te_val * 0.05, region=region)
        ph["eight_pct_vendor_fmt"] = fmt_money(te_val * 0.08, region=region)

        if len(exp_items) >= 2:
            s = exp_items[1]
            ph["second_expense_name"] = s.get("name", "—")
            ph["second_expense_fmt"] = fmt_money(abs(s.get("net", 0) or 0))
        else:
            ph["second_expense_name"] = "—"
            ph["second_expense_fmt"] = "—"

        top3_rows = []
        top3_total = 0.0
        for i, e in enumerate(exp_items[:3], 1):
            v = abs(e.get("net", 0) or 0)
            top3_total += v
            top3_rows.append(
                f"{i}. **{e.get('name', '—')}** — {fmt_money(v, region=region)} "
                f"({_pct(v, expenses)}% of spend)"
            )
        ph["top_3_expenses_md"] = "\n".join(top3_rows)
        ph["top_3_pct"] = str(_pct(top3_total, expenses))
        ph["top_3_savings_fmt"] = fmt_money(top3_total * 0.05, region=region)
    else:
        for k in [
            "top_expense_name", "top_expense_fmt", "top_expense_pct",
            "top_expense_5pct_fmt", "eight_pct_vendor_fmt",
            "second_expense_name", "second_expense_fmt",
            "top_3_expenses_md", "top_3_pct", "top_3_savings_fmt",
        ]:
            ph[k] = "—"

    # Payroll
    payroll_items = [
        e for e in ca.get("expenses", [])
        if any(w in (e.get("name", "") or "").lower()
               for w in ["salary", "wage", "payroll", "staff", "pf", "esi", "gratuity"])
    ]
    payroll_total = sum(abs(e.get("net", 0) or 0) for e in payroll_items)
    ph["payroll_fmt"] = fmt_money(payroll_total, region=region)
    ph["payroll_pct"] = str(_pct(payroll_total, expenses))
    if payroll_items:
        ph["payroll_breakdown_md"] = "\n".join(
            f"- {e.get('name', '—')}: {fmt_money(abs(e.get('net', 0) or 0))}"
            for e in payroll_items
        )
    else:
        ph["payroll_breakdown_md"] = "- No payroll line items found in the ledger"

    # Receivables
    rec_items = [
        a for a in ca.get("assets", [])
        if any(w in (a.get("name", "") or "").lower()
               for w in ["receiv", "debtor"])
    ]
    rec_total = sum(abs(a.get("net", 0) or 0) for a in rec_items)
    ph["receivables_fmt"] = fmt_money(rec_total, region=region)
    ph["receivables_pct_of_rev"] = str(_pct(rec_total, revenue))
    if revenue and rec_total / revenue > 0.3:
        ph["receivables_verdict"] = (
            f"**Receivables at {_pct(rec_total, revenue)}% of revenue is above "
            "the healthy 25% band. Collection is the bottleneck, not sales.**"
        )
    elif revenue and rec_total / revenue > 0.15:
        ph["receivables_verdict"] = (
            f"Receivables at {_pct(rec_total, revenue)}% of revenue is within "
            "normal MSME range. Worth an aging review to stay ahead."
        )
    else:
        ph["receivables_verdict"] = "Receivables are well-managed."

    # Assets / liabilities breakdown
    asset_items = sorted(
        ca.get("assets", []),
        key=lambda x: abs(x.get("net", 0) or 0), reverse=True,
    )[:5]
    liab_items = sorted(
        ca.get("liabilities", []),
        key=lambda x: abs(x.get("net", 0) or 0), reverse=True,
    )[:5]
    ph["top_assets_md"] = "\n".join(
        f"- {a.get('name', '—')}: {fmt_money(abs(a.get('net', 0) or 0))}"
        for a in asset_items
    ) or "- No asset items found"
    ph["top_liabilities_md"] = "\n".join(
        f"- {l.get('name', '—')}: {fmt_money(abs(l.get('net', 0) or 0))}"
        for l in liab_items
    ) or "- No liability items found"

    # Suspense
    susp = [
        e for e in (ca.get("liabilities", []) + ca.get("assets", []))
        if any(w in (e.get("name", "") or "").lower() for w in ["suspense", "clearing"])
    ]
    if susp:
        total_susp = sum(abs(e.get("net", 0) or 0) for e in susp)
        ph["suspense_md"] = (
            f"{fmt_money(total_susp, region=region)} across {len(susp)} accounts: "
            + ", ".join(f"**{e['name']}** ({fmt_money(abs(e.get('net', 0) or 0))})" for e in susp)
        )
    else:
        ph["suspense_md"] = (
            "**None** — no suspense or clearing accounts found in your books. "
            "That's a sign of a well-maintained ledger."
        )

    # Projections — growth scenarios
    def _proj(rev_g: float, exp_g: float) -> tuple[str, str, str]:
        pr = revenue * (1 + rev_g)
        pe = expenses * (1 + exp_g)
        return fmt_money(pr, region=region), fmt_money(pe, region=region), fmt_money(pr - pe, region=region)

    pc_r, pc_e, pc_n = _proj(0.05, 0.03)
    pb_r, pb_e, pb_n = _proj(0.15, 0.08)
    pa_r, pa_e, pa_n = _proj(0.25, 0.13)
    ph["proj_conservative_rev_fmt"] = pc_r
    ph["proj_conservative_exp_fmt"] = pc_e
    ph["proj_conservative_net_fmt"] = pc_n
    ph["proj_base_rev_fmt"] = pb_r
    ph["proj_base_exp_fmt"] = pb_e
    ph["proj_base_net_fmt"] = pb_n
    ph["proj_aggressive_rev_fmt"] = pa_r
    ph["proj_aggressive_exp_fmt"] = pa_e
    ph["proj_aggressive_net_fmt"] = pa_n

    # 20% scenario
    p20_r, p20_e, p20_n = _proj(0.20, 0.10)
    ph["proj_rev_20pct_fmt"] = p20_r
    ph["proj_exp_20pct_fmt"] = p20_e
    ph["proj_net_20pct_fmt"] = p20_n

    # Growth levers
    ph["one_pct_margin_fmt"] = fmt_money(revenue * 0.01, region=region)
    ph["rev_10pct_impact_fmt"] = fmt_money(revenue * 0.10 * (nm / 100 if nm else 0.05))
    ph["five_pct_price_fmt"] = fmt_money(revenue * 0.05, region=region)

    # Margin verdict
    if nm < 0:
        ph["margin_verdict"] = "you're making a loss"
        ph["margin_action"] = (
            "Priority this quarter is getting to zero, not growth. "
            f"Bottom-up review of {ph['top_expense_name']} — the single "
            "biggest cost line — is where I'd start."
        )
    elif nm < 5:
        ph["margin_verdict"] = "thin"
        ph["margin_action"] = (
            "Any shock to costs wipes you out. Rebuild to 10% margin over "
            "the next 2-3 quarters before scaling revenue further."
        )
    elif nm < 15:
        ph["margin_verdict"] = "healthy for MSME"
        ph["margin_action"] = (
            "Margin is solid. Growth spend (sales, marketing, ops capacity) "
            "is now responsible — not reckless."
        )
    else:
        ph["margin_verdict"] = "strong"
        ph["margin_action"] = (
            "You have the cushion to invest aggressively. The risk now is "
            "complacency — re-test pricing and cost discipline yearly."
        )

    # Health verdict
    healthy = (
        ratios.get("current_ratio", 0) >= 1.5
        and ratios.get("debt_to_equity", 99) <= 2.0
        and nm >= 5
        and wc > 0
    )
    if healthy:
        ph["health_verdict"] = "Books are in solid shape"
        ph["health_action"] = (
            "No red flags on liquidity or leverage. Focus next quarter on "
            "growth drivers and operational quality, not fixing the books."
        )
    else:
        ph["health_verdict"] = "Books need attention in 2-3 areas"
        ph["health_action"] = (
            f"{'Working capital is negative — fix first. ' if wc < 0 else ''}"
            f"{'Leverage is high — tighten before growth. ' if ratios.get('debt_to_equity', 0) > 2 else ''}"
            f"{'Margin is weak — reprice or reduce costs. ' if nm < 5 else ''}"
            "Pick the single biggest gap and treat it as a 90-day priority."
        )

    # Working capital sign verdict
    if wc < 0:
        ph["wc_sign_verdict"] = (
            f"**Negative working capital of {fmt_money(wc, region=region)}** — short-term "
            "liabilities exceed short-term assets. You're funding operations "
            "with supplier credit; any supplier tightening becomes a crisis."
        )
    elif wc > revenue * 0.5:
        ph["wc_sign_verdict"] = (
            f"Working capital of {fmt_money(wc, region=region)} is cushiony. Could deploy "
            "some into growth rather than letting it sit."
        )
    else:
        ph["wc_sign_verdict"] = (
            f"Working capital of {fmt_money(wc, region=region)} is within normal MSME range."
        )

    if wc < 0:
        ph["wc_action"] = (
            "Fix this first. Negotiate longer payment terms with your top "
            "suppliers, tighten receivable collection, and stop taking "
            "on new capex until WC is positive."
        )
    else:
        ph["wc_action"] = (
            "Working capital is positive. The question is now efficiency — "
            "are you tying up cash in slow-moving inventory or aging "
            "receivables that could be redeployed?"
        )

    # Expense coverage
    ph["expense_coverage"] = str(_pct(expenses, revenue))

    # Industry
    industry = (business_context or {}).get("industry") or "your sector"
    ph["industry"] = industry
    ph["industry_comparison_md"] = (
        f"- Gross margin **{gm}%** (typical for {industry}: 25-40%)\n"
        f"- Net margin **{nm}%** (typical: 8-15%)\n"
        f"- Current ratio **{ratios.get('current_ratio', 0)}x** (healthy: 1.5-2.0x)"
    )
    ph["industry_action"] = (
        "Where you diverge from benchmarks is where the leverage sits. "
        "Below-industry gross margin = pricing or COGS problem. "
        "Below-industry net margin with healthy gross = overhead bloat. "
        "Use this gap diagnosis to pick your 90-day focus."
    )

    # Priorities
    priorities = []
    if susp:
        priorities.append(
            f"1. **Clear suspense balances** ({fmt_money(sum(abs(e.get('net', 0) or 0) for e in susp))}). "
            "Distorts every ratio. Audit blocker."
        )
    if net_income < 0:
        priorities.append(
            f"2. **Address the {fmt_money(abs(net_income))} loss**. Start with "
            f"{ph['top_expense_name']} — biggest line."
        )
    if wc < 0:
        priorities.append(
            f"3. **Fix working capital** (currently {fmt_money(wc, region=region)}). Negotiate supplier terms."
        )
    if len(priorities) < 3:
        priorities.append(
            f"{len(priorities)+1}. **Vendor renegotiation cycle** — top 5 suppliers, every 12 months."
        )
    if len(priorities) < 4:
        priorities.append(
            f"{len(priorities)+1}. **Monthly GST reconciliation** — don't let gaps compound."
        )
    ph["priorities_md"] = "\n".join(priorities)

    # Risks
    risks = []
    if net_income < 0:
        risks.append(
            f"🔴 **Operating loss** of {fmt_money(abs(net_income))} ({abs(nm)}% negative margin). "
            "Cash is bleeding every month."
        )
    if susp:
        risks.append(
            f"🔴 **Suspense balance** of "
            f"{fmt_money(sum(abs(e.get('net', 0) or 0) for e in susp))} "
            "could mask real liabilities. Reconcile before audit."
        )
    if ratios.get("current_ratio", 0) < 1:
        risks.append(
            f"🟡 **Liquidity tight** — current ratio {ratios.get('current_ratio', 0)}x. "
            "Short-term obligation stress if any creditor tightens."
        )
    if rec_total and revenue and rec_total / revenue > 0.3:
        risks.append(
            f"🟡 **Collection risk** — receivables {fmt_money(rec_total, region=region)} = "
            f"{_pct(rec_total, revenue)}% of revenue. Some of this is stuck."
        )
    if not risks:
        risks.append("✅ No critical risks detected. Maintain discipline on monthly reviews.")
    ph["risks_md"] = "\n\n".join(risks[:5])

    # Compliance
    comp_lines = []
    if ind_as:
        for obs in ind_as[:5]:
            sev = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(obs.get("severity", ""), "•")
            comp_lines.append(f"{sev} **{obs.get('standard', 'Ind AS')}** — {obs.get('observation', '')}")
    if warnings:
        for w in warnings[:3]:
            comp_lines.append(f"⚠️ **{w.get('title', 'Issue')}** — {w.get('detail', '')}")
    if not comp_lines:
        comp_lines = ["- No compliance observations generated yet. Re-upload your TB to run Ind AS checks."]
    ph["compliance_md"] = "\n\n".join(comp_lines)

    # Ind AS counts
    ph["ind_as_obs_count"] = str(len(ind_as))

    # Fundraise
    if gm < 20:
        ph["gm_readiness"] = "Below the 25%+ bar typical investors want to see."
    elif gm < 35:
        ph["gm_readiness"] = "In range. Growth trajectory matters more."
    else:
        ph["gm_readiness"] = "Strong. Unit economics aren't a blocker."

    return ph


# ─── Matching ──────────────────────────────────────────────────────────

_TOKEN_RE = re.compile(r"[a-zA-Z0-9]+")

def _tokenize(s: str) -> set[str]:
    return {t.lower() for t in _TOKEN_RE.findall(s) if len(t) > 1}


def _score_faq(question: str, faq: dict) -> float:
    """Return a 0-1 score for how well `question` matches this FAQ.

    Signal stack:
    - Jaccard on tokenized words (across canonical + alternate phrasings)
    - difflib ratio (catches typos + reorderings jaccard misses)
    - Keyword hits (bonus — capped so single high-match can't dominate)
    """
    q = question.lower()
    q_tokens = _tokenize(q)
    if not q_tokens:
        return 0.0

    variants = [faq["question"]] + list(faq.get("alternates", []))

    best_jaccard = 0.0
    best_ratio = 0.0
    for v in variants:
        v_lower = v.lower()
        v_tokens = _tokenize(v_lower)
        if v_tokens:
            union = len(q_tokens | v_tokens)
            jacc = len(q_tokens & v_tokens) / union if union else 0.0
            best_jaccard = max(best_jaccard, jacc)
        ratio = SequenceMatcher(None, q, v_lower).ratio()
        best_ratio = max(best_ratio, ratio)

    # Keyword bonus (each hit adds 0.08, capped at 0.25)
    hits = sum(1 for k in faq.get("keywords", []) if k.lower() in q)
    kw_bonus = min(hits * 0.08, 0.25)

    # Weighted blend. Ratio catches typos, jaccard catches paraphrases.
    score = 0.55 * best_jaccard + 0.35 * best_ratio + kw_bonus
    return score


def find_best_faq(question: str, region: str = "US") -> Optional[tuple[dict, float]]:
    """Return (faq, score) for the top match, or None if nothing clears
    the confidence threshold.

    Filters FAQs by region: each FAQ carries a `region` tag ("US" | "IN")
    OR a `regions` list. An FAQ with no region is treated as universal
    (matches any region). This lets us keep generic financial-literacy
    FAQs in the shared pool while region-specific ones (TDS, GSTR,
    federal withholding) stay scoped.
    """
    if not question or not question.strip():
        return None
    target = (region or "US").upper()

    def _matches_region(faq: dict) -> bool:
        regions = faq.get("regions")
        if regions:
            return target in [str(r).upper() for r in regions]
        single = faq.get("region")
        if single is None:
            # No region tag → universal FAQ, matches any region.
            return True
        return str(single).upper() == target

    candidates = [faq for faq in SEED_FAQS if _matches_region(faq)]
    scored = [(faq, _score_faq(question, faq)) for faq in candidates]
    scored.sort(key=lambda x: x[1], reverse=True)
    top = scored[0] if scored else None
    if not top or top[1] < MATCH_THRESHOLD:
        return None
    return top


def render_answer(faq: dict, placeholders: dict[str, str]) -> str:
    """Interpolate the FAQ template with the live placeholders.

    Unresolved placeholders (no key in `placeholders` or value is "—")
    are stripped along with their containing sentence fragment rather
    than left as literal `{name}` in the output. We'd rather return a
    slightly shorter answer than show template syntax to the user.
    """
    template = faq.get("answer_template", "")
    if not template:
        return ""

    # Resolve every placeholder we can. Use a default dict-like that
    # returns "" for unknowns.
    def _sub(match: re.Match) -> str:
        key = match.group(1)
        val = placeholders.get(key, "")
        # Treat "—" as missing — renders badly inside sentences.
        if val == "—":
            return ""
        return str(val)

    rendered = re.sub(r"\{([a-zA-Z_][a-zA-Z0-9_]*)\}", _sub, template)

    # Post-pass: collapse double spaces + dangling "()" + ", ," etc that
    # appear when placeholders were stripped mid-sentence.
    rendered = re.sub(r"\(\s*\)", "", rendered)
    rendered = re.sub(r"[ \t]+,", ",", rendered)
    rendered = re.sub(r",\s*,", ",", rendered)
    rendered = re.sub(r"[ \t]{2,}", " ", rendered)
    return rendered.strip()


def try_faq_answer(
    question: str,
    analysis_result: dict,
    business_context: Optional[dict] = None,
    region: str = "US",
) -> Optional[dict]:
    """End-to-end helper: match + render. Returns a dict with the answer
    + metadata, or None if no match cleared the threshold.

    Region filters which FAQs are in the candidate pool AND controls
    currency formatting in the interpolated answer.

    Returned shape (also used by the /ask endpoint to attach source info):
        {
          "answer": "<rendered markdown>",
          "faq_id": "faq-xxx",
          "score": 0.72,
        }
    """
    match = find_best_faq(question, region=region)
    if not match:
        return None
    faq, score = match
    placeholders = build_placeholders(analysis_result or {}, business_context, region=region)
    rendered = render_answer(faq, placeholders)
    if not rendered:
        # Template was somehow empty after substitution — don't return a
        # blank reply, fall through to LLM instead.
        logger.warning("FAQ %s rendered to empty string; falling through", faq.get("id"))
        return None
    return {
        "answer": rendered,
        "faq_id": faq.get("id"),
        "score": round(score, 3),
    }
