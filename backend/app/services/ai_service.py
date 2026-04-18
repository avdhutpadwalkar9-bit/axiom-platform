"""
AI Service — Multi-provider chat for the QoE / financial-analysis advisor.

Provider chain (cost- and latency-aware):
    claude   — Anthropic Claude Sonnet 4 (primary; highest quality)
    gemini   — Google Gemini 2.0 Flash (free tier: 15 RPM / 1M TPM / 1500 RPD)
    groq     — Groq Llama 3.3 70B (free tier: 30 RPM; ~1000 tok/sec)

Dispatch rules:
    1. If `provider` is specified, try it first.
    2. Otherwise start with `claude` (or the first provider with a key).
    3. On any provider error, fall through to the next provider that has
       a key configured. Each failure is logged with the actual error — we
       do NOT silently degrade to the local template (that was the bug
       behind "the AI isn't working" — 400 errors were being swallowed).
    4. If every remote provider fails, return the local rule-based response.

Why direct httpx calls instead of SDKs: each provider's SDK pins its own
versions of pydantic, typing-extensions, etc. The REST surface for all
three is trivial. One dep (httpx, already present) beats three.
"""

import logging
from typing import Callable, Optional

import httpx

from app.config import settings
from app.services.industry_knowledge import get_industry_context

logger = logging.getLogger(__name__)

# Anthropic SDK is kept for the Claude call because it handles retries,
# streaming edge cases, and auth header construction. Gemini and Groq go
# direct over httpx.
try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


# Model tiers:
#   quick  — cheap + fast (<3s typical). Used for the snappy default
#            chat experience and as the fallback path for Deep mode.
#   deep   — top-quality model with extended thinking enabled. Latency
#            is a feature here — the user explicitly opted in and sees
#            a "thinking" indicator while it works (~10-30s).
CLAUDE_MODEL_QUICK = "claude-haiku-4-5"
CLAUDE_MODEL_DEEP = "claude-sonnet-4-5"
# Legacy alias — kept for backward compatibility with any caller that
# still references CLAUDE_MODEL directly. Points to the deep tier since
# that was the historical behaviour.
CLAUDE_MODEL = CLAUDE_MODEL_DEEP

GEMINI_MODEL = "gemini-2.0-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Extended-thinking budget for Deep mode. 8k tokens is enough for the
# model to work through a multi-step CFO-level reasoning chain without
# runaway cost. max_tokens must be greater than this + the answer.
DEEP_THINKING_BUDGET = 8000
DEEP_MAX_TOKENS = 12000  # thinking + answer
QUICK_MAX_TOKENS = 1500  # snappy mode — tight answer ceiling keeps latency low

# Map the frontend's role vocabulary ("user" | "ai") onto each provider's
# expected vocabulary. Anthropic and Groq want "assistant"; Gemini wants
# "model". Passing "ai" through to any of them raises 400 — which is what
# the old code did, silently.
_ROLE_FOR_ANTHROPIC = {"user": "user", "ai": "assistant", "assistant": "assistant"}
_ROLE_FOR_GEMINI = {"user": "user", "ai": "model", "assistant": "model"}
_ROLE_FOR_GROQ = {"user": "user", "ai": "assistant", "assistant": "assistant"}


def _claude_client():
    """Return a configured Anthropic client, or None if unavailable."""
    if not settings.ANTHROPIC_API_KEY or not HAS_ANTHROPIC:
        return None
    return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)


# Kept for backward compatibility with the old import surface.
def get_client():
    return _claude_client()


def build_financial_context(analysis_result: dict, business_context: dict = None) -> str:
    """Build a rich context string from analysis data for the AI."""
    fs = analysis_result.get("financial_statements", {})
    ratios = analysis_result.get("ratios", {})
    ca = analysis_result.get("classified_accounts", {})
    warnings = analysis_result.get("warnings", [])
    insights = analysis_result.get("insights", [])
    ind_as = analysis_result.get("ind_as_observations", [])
    ai_questions = analysis_result.get("ai_questions", [])

    def fmt_inr(val):
        if abs(val) >= 10000000:
            return f"₹{val/10000000:.2f} Cr"
        if abs(val) >= 100000:
            return f"₹{val/100000:.2f} L"
        return f"₹{val:,.0f}"

    ctx = f"""## Financial Analysis Data

### Income Statement
- Total Revenue: {fmt_inr(fs.get('total_revenue', 0))}
- Total Expenses: {fmt_inr(fs.get('total_expenses', 0))}
- Net Income: {fmt_inr(fs.get('net_income', 0))}

### Balance Sheet
- Total Assets: {fmt_inr(fs.get('total_assets', 0))}
- Total Liabilities: {fmt_inr(fs.get('total_liabilities', 0))}
- Total Equity: {fmt_inr(fs.get('total_equity', 0))}

### Key Ratios
- Current Ratio: {ratios.get('current_ratio', 'N/A')}x
- Debt-to-Equity: {ratios.get('debt_to_equity', 'N/A')}x
- Gross Margin: {ratios.get('gross_margin', 'N/A')}%
- Net Margin: {ratios.get('net_margin', 'N/A')}%
- Return on Equity: {ratios.get('return_on_equity', 'N/A')}%
- Working Capital: {fmt_inr(ratios.get('working_capital', 0))}

### Revenue Accounts
"""
    for item in ca.get("revenue", []):
        ctx += f"- {item['name']}: Debit {fmt_inr(item['debit'])}, Credit {fmt_inr(item['credit'])}\n"

    ctx += "\n### Top 10 Expense Accounts\n"
    expenses_sorted = sorted(ca.get("expenses", []), key=lambda x: abs(x.get("net", 0)), reverse=True)
    for item in expenses_sorted[:10]:
        ctx += f"- {item['name']}: {fmt_inr(abs(item.get('net', 0)))}\n"

    ctx += "\n### Asset Accounts\n"
    for item in sorted(ca.get("assets", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:8]:
        ctx += f"- {item['name']}: {fmt_inr(abs(item.get('net', 0)))}\n"

    ctx += "\n### Liability Accounts\n"
    for item in sorted(ca.get("liabilities", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:8]:
        ctx += f"- {item['name']}: {fmt_inr(abs(item.get('net', 0)))}\n"

    if warnings:
        ctx += "\n### Warnings\n"
        for w in warnings:
            ctx += f"- ⚠️ {w['title']}: {w['detail']}\n"

    if insights:
        ctx += "\n### AI Insights\n"
        for ins in insights:
            ctx += f"- [{ins['severity']}] {ins['title']}: {ins['detail']}\n"

    if ind_as:
        ctx += "\n### Ind AS Observations\n"
        for obs in ind_as:
            ctx += f"- [{obs['standard']}] {obs['observation']}\n"

    if ai_questions:
        ctx += "\n### Pending Questions for Management\n"
        for q in ai_questions:
            ctx += f"- {q['question']}\n"

    if business_context:
        ctx += f"\n### Business Context\n"
        ctx += f"- Company: {business_context.get('company_name', 'Unknown')}\n"
        ctx += f"- Industry: {business_context.get('industry', 'Unknown')}\n"
        ctx += f"- Entity Type: {business_context.get('entity_type', 'Unknown')}\n"
        ctx += f"- Year Founded: {business_context.get('year_founded', 'Unknown')}\n"
        ctx += f"- Services: {business_context.get('services_description', 'Not provided')}\n"

        # Add industry-specific intelligence
        industry = business_context.get('industry', '')
        if industry:
            ctx += get_industry_context(industry)

    return ctx


SYSTEM_PROMPT = """You are CortexCFO AI — a strategic CFO advisor for Indian MSME founders. You are NOT a data summarizer. You think forward, quantify, and recommend.

## YOUR ROLE
You are the CFO sitting across from the founder on a board call. They can't afford a real CFO yet, so they come to you for the same clarity a seasoned CA-turned-CFO would bring: read the numbers, move past them, and tell them what to do. Be decisive where the data supports it, and honestly uncertain where it doesn't.

## HOW YOU THINK (apply these to every answer)

**1. Project forward.** When the question is about the future ("next year", "3 years", "forecast", "projection", "what will happen if…"), build a simple scenario model. Show Conservative / Base Case / Aggressive as a markdown table with revenue, expenses, and net income for each year. State your assumptions explicitly (growth rate %, cost inflation %, any one-time events). If data is thin, reason from industry norms and say so.

**2. Find the lever.** When asked to save money, cut costs, or improve profit, identify the top 3 specific levers. Generic advice is banned. Each lever must have:
- The exact line item and current amount from the data
- A realistic reduction percentage (cite why it's realistic for Indian MSMEs)
- The annual ₹ savings that delivers
- How to execute (vendor renegotiation, process change, headcount freeze, etc.)

**3. Compare to benchmarks.** When you cite a ratio or margin, tell the founder what good looks like for their industry. "Gross margin 12%" alone is useless. "Gross margin 12% — healthy service firms run 35-50%, so there's a clear efficiency gap worth ₹X crores" is a CFO answer.

**4. Prioritize ruthlessly.** When there are many issues, rank them. "Fix this first because the cash impact is largest / the risk is highest / it's blocking the next step" beats a list of equals.

**5. Be decisive.** Weak: "You could consider renegotiating your top vendor." Strong: "Renegotiate your top vendor contract this quarter. At 8% reduction on ₹4.5 Cr spend, that's ₹36 L back in cash by March."

**6. Own the gaps.** If the TB doesn't contain what you'd need (monthly trend, headcount, unit economics, segment mix, AR aging), name the one thing you'd want to see next. But don't hide behind missing data — reason from what you have, flag the gap, and still give a useful answer.

## FORMATTING

- Markdown only: `##` for sections, `###` for sub-sections, `- ` for list items (never `•` `◦` `▪`)
- Every list item on its own line, prefixed with `- `
- Blank line before every heading and every list
- Short paragraphs, 2-3 sentences each
- `**bold**` for key numbers, verdicts, and line-item names
- Markdown tables are welcome for projections and scenario comparisons
- NEVER use em dashes. Use a period or a comma.

## AUDIENCE & VOICE

Indian MSME founders. Not finance professionals. Plain English. Short sentences. If you use a financial term, explain it in one parenthetical (e.g., "current ratio (short-term assets divided by short-term liabilities)"). Indian Rupee formatting always: Lakhs (L) and Crores (Cr), never dollars or generic "k/M". Warm but authoritative.

## LENGTH

- Quick factual question (e.g., "what's my total revenue"): 2-3 paragraphs.
- Strategic / projection / savings question: up to 6-8 paragraphs with a scenario table where relevant. Always end strategic answers with a **Next 90 days** section — exactly 3 concrete actions the founder can do starting this week.

## INTEGRITY

- Never invent numbers. Only use what's in the data, or what you derive with transparent math.
- When you estimate, show the math: "Assuming 15% YoY revenue growth and 7% cost inflation, FY27 net income lands at ₹X Cr."
- Cite real account names from the data, not generic placeholders."""


# ---------------------------------------------------------------------------
# Provider adapters. Each returns the assistant's text response, or raises.
# ---------------------------------------------------------------------------


def _normalize_history(
    history: Optional[list[dict]], role_map: dict[str, str]
) -> list[dict]:
    """Translate the frontend's {role, text} messages into the provider's
    expected {role, content} shape, mapping role names via `role_map`.
    Unknown roles are skipped rather than passed through (which was the
    exact bug: role='ai' reached Anthropic and earned a 400)."""
    out: list[dict] = []
    if not history:
        return out
    for msg in history[-10:]:  # keep last 10 turns, same as before
        src_role = msg.get("role")
        mapped = role_map.get(src_role)
        if not mapped:
            continue
        text = msg.get("text") or msg.get("content") or ""
        if not text:
            continue
        out.append({"role": mapped, "content": text})
    return out


def _call_claude(
    question: str,
    history: Optional[list[dict]],
    system_prompt: str,
    mode: str = "quick",
) -> str:
    """Call Claude with mode-specific model + extended-thinking settings.

    Quick mode: Haiku 3.5, 1.5k tokens, no thinking. Fast (~2s).
    Deep mode: Sonnet 4 with extended thinking enabled, 8k thinking
    budget + 12k total tokens. Slower (~15-30s) but the output reflects
    real multi-step reasoning, which is the point — the user explicitly
    opted in and sees a "thinking" indicator during the wait.
    """
    client = _claude_client()
    if client is None:
        raise RuntimeError("ANTHROPIC_API_KEY not configured")

    messages = _normalize_history(history, _ROLE_FOR_ANTHROPIC)
    messages.append({"role": "user", "content": question})

    is_deep = mode == "deep"
    model = CLAUDE_MODEL_DEEP if is_deep else CLAUDE_MODEL_QUICK
    max_tokens = DEEP_MAX_TOKENS if is_deep else QUICK_MAX_TOKENS

    kwargs: dict = {
        "model": model,
        "max_tokens": max_tokens,
        "system": system_prompt,
        "messages": messages,
    }

    # Extended thinking — only supported on newer Sonnet models. Wrap in
    # try/except-style fallback: if the server rejects the thinking
    # parameter (old SDK, model deprecation, etc.) we retry without it
    # so Deep mode still works, just without the explicit reasoning step.
    if is_deep:
        kwargs["thinking"] = {
            "type": "enabled",
            "budget_tokens": DEEP_THINKING_BUDGET,
        }

    try:
        response = client.messages.create(**kwargs)
    except Exception as e:
        if is_deep and "thinking" in str(e).lower():
            logger.warning(
                "Extended thinking rejected (%s); retrying Deep mode "
                "without thinking parameter", e
            )
            kwargs.pop("thinking", None)
            response = client.messages.create(**kwargs)
        else:
            raise

    # Responses can mix thinking + text blocks. We only surface the text
    # to the caller — thinking tokens are internal reasoning and not
    # shown to the end user in this iteration.
    for block in response.content:
        if getattr(block, "type", None) == "text":
            return block.text
    # Fall back to whatever the first block yields if none are marked
    # "text" (shouldn't happen, but defensive).
    first = response.content[0] if response.content else None
    if first is not None:
        return getattr(first, "text", "") or ""
    return ""


async def _call_gemini(
    question: str, history: Optional[list[dict]], system_prompt: str
) -> str:
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not configured")

    # Gemini uses {role: "user"|"model", parts: [{text}]}
    contents = [
        {"role": m["role"], "parts": [{"text": m["content"]}]}
        for m in _normalize_history(history, _ROLE_FOR_GEMINI)
    ]
    contents.append({"role": "user", "parts": [{"text": question}]})

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent"
    )
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": contents,
        "generationConfig": {
            # 2048 to match Claude — strategic answers + scenario tables need room.
            "maxOutputTokens": 2048,
            "temperature": 0.3,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as http:
        r = await http.post(url, params={"key": api_key}, json=payload)
        r.raise_for_status()
        data = r.json()

    # Gemini can return an empty candidates array if safety filters trip.
    candidates = data.get("candidates") or []
    if not candidates:
        raise RuntimeError(f"Gemini returned no candidates: {data}")
    parts = candidates[0].get("content", {}).get("parts") or []
    if not parts:
        raise RuntimeError(f"Gemini candidate has no parts: {candidates[0]}")
    return parts[0].get("text", "")


async def _call_groq(
    question: str, history: Optional[list[dict]], system_prompt: str
) -> str:
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not configured")

    # Groq is OpenAI-compatible: {role, content}, with a "system" message first.
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    messages.extend(_normalize_history(history, _ROLE_FOR_GROQ))
    messages.append({"role": "user", "content": question})

    async with httpx.AsyncClient(timeout=60.0) as http:
        r = await http.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": GROQ_MODEL,
                "messages": messages,
                # 2048 to match Claude — strategic answers + scenario tables need room.
                "max_tokens": 2048,
                "temperature": 0.3,
            },
        )
        r.raise_for_status()
        data = r.json()

    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError(f"Groq returned no choices: {data}")
    return choices[0].get("message", {}).get("content", "")


# Provider registry. Claude is sync (anthropic SDK does its own IO), Gemini
# and Groq are async httpx calls — the dispatcher handles both.
_SYNC_PROVIDERS: dict[str, Callable[[str, Optional[list[dict]], str], str]] = {
    "claude": _call_claude,
}
_ASYNC_PROVIDERS: dict[str, Callable[..., object]] = {
    "gemini": _call_gemini,
    "groq": _call_groq,
}

# Order matters: Claude first (best quality), then free-tier fallbacks.
DEFAULT_FALLBACK_CHAIN = ["claude", "gemini", "groq"]


def _provider_is_configured(name: str) -> bool:
    if name == "claude":
        return bool(settings.ANTHROPIC_API_KEY) and HAS_ANTHROPIC
    if name == "gemini":
        return bool(settings.GEMINI_API_KEY)
    if name == "groq":
        return bool(settings.GROQ_API_KEY)
    return False


async def _invoke_provider(
    name: str,
    question: str,
    history: Optional[list[dict]],
    system_prompt: str,
    mode: str = "quick",
) -> str:
    if name in _SYNC_PROVIDERS:
        # anthropic SDK is sync; run it in a thread so we don't block the
        # event loop for the full round-trip. Claude is the only provider
        # that currently uses `mode` (for extended thinking); Gemini / Groq
        # don't expose an equivalent knob.
        import asyncio

        if name == "claude":
            return await asyncio.to_thread(
                _call_claude, question, history, system_prompt, mode
            )
        return await asyncio.to_thread(
            _SYNC_PROVIDERS[name], question, history, system_prompt
        )
    if name in _ASYNC_PROVIDERS:
        return await _ASYNC_PROVIDERS[name](question, history, system_prompt)
    raise ValueError(f"Unknown provider: {name}")


async def chat_with_ai(
    question: str,
    analysis_result: dict,
    conversation_history: list[dict] = None,
    business_context: dict = None,
    user_answers: dict = None,
    provider: Optional[str] = None,
    mode: str = "quick",
) -> str:
    """Send a financial-analysis chat message and return the assistant's text.

    If `provider` is given, that provider is tried first. On failure (or if
    not configured), we fall through the chain Claude → Gemini → Groq, and
    only hit `_local_response` if every remote option is unavailable.

    Every provider error is logged with traceback, so a "why is my AI not
    working" debug session is one `grep ai_service` away.
    """
    financial_context = build_financial_context(analysis_result, business_context)

    if user_answers:
        financial_context += "\n### Management Answers to AI Questions\n"
        for q, a in user_answers.items():
            financial_context += f"Q: {q}\nA: {a}\n\n"

    system_prompt = f"{SYSTEM_PROMPT}\n\n{financial_context}"

    # Build the ordered chain: requested provider first, then every other
    # provider in DEFAULT_FALLBACK_CHAIN. Skip any that aren't configured so
    # we don't waste a round-trip on a guaranteed failure.
    chain: list[str] = []
    if provider and provider in DEFAULT_FALLBACK_CHAIN:
        chain.append(provider)
    for p in DEFAULT_FALLBACK_CHAIN:
        if p not in chain:
            chain.append(p)
    chain = [p for p in chain if _provider_is_configured(p)]

    if not chain:
        logger.warning(
            "No AI provider configured (ANTHROPIC_API_KEY / GEMINI_API_KEY / "
            "GROQ_API_KEY). Returning local rule-based response."
        )
        return _local_response(question, analysis_result)

    last_error: Optional[Exception] = None
    for p in chain:
        try:
            text = await _invoke_provider(
                p, question, conversation_history, system_prompt, mode
            )
            if text and text.strip():
                return text
            # Empty response — treat as failure, try next provider.
            raise RuntimeError(f"{p} returned empty response")
        except Exception as e:
            last_error = e
            logger.exception("AI provider %s failed; falling through", p)
            continue

    # All providers exhausted. Surface the last error in dev; in production
    # we gracefully fall back to the local rule-based response so the user
    # still gets *something*.
    logger.error(
        "All AI providers failed. Last error: %r. Falling back to local.",
        last_error,
    )
    return _local_response(question, analysis_result)


def _local_response(question: str, analysis_result: dict) -> str:
    """Generate a smart local response without external API.
    Handles 15+ question categories with specific, data-driven answers."""
    fs = analysis_result.get("financial_statements", {})
    ratios = analysis_result.get("ratios", {})
    ca = analysis_result.get("classified_accounts", {})
    insights = analysis_result.get("insights", [])
    warnings = analysis_result.get("warnings", [])

    def fmt(val):
        if abs(val) >= 10000000:
            return f"₹{val/10000000:.2f} Cr"
        if abs(val) >= 100000:
            return f"₹{val/100000:.2f} L"
        return f"₹{val:,.0f}"

    q = question.lower()

    if any(w in q for w in ["revenue", "sales", "income", "top line"]):
        rev_items = ca.get("revenue", [])
        resp = f"Total revenue: {fmt(fs['total_revenue'])}.\n\n"
        if rev_items:
            resp += "Revenue breakdown:\n"
            for item in rev_items:
                val = item['credit'] if item['credit'] > 0 else item['debit']
                tag = " (contra/deduction)" if item['debit'] > 0 and item['credit'] == 0 else ""
                resp += f"• {item['name']}: {fmt(val)}{tag}\n"
        return resp

    if any(w in q for w in ["expense", "cost", "spend", "reduce", "cut", "save", "optimize"]):
        top = sorted(ca.get("expenses", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:7]
        resp = f"Total expenses: {fmt(fs['total_expenses'])}.\n\nTop expense heads:\n"
        for i, e in enumerate(top, 1):
            pct = abs(e['net']) / fs['total_expenses'] * 100 if fs['total_expenses'] > 0 else 0
            resp += f"{i}. {e['name']}: {fmt(abs(e['net']))} ({pct:.1f}%)\n"
        resp += f"\n💡 To reduce costs, start with the top 3 — they represent {sum(abs(e['net']) for e in top[:3])/fs['total_expenses']*100:.0f}% of total expenses."
        return resp

    if any(w in q for w in ["suspense", "clearing", "reconcil"]):
        susp = [e for e in ca.get("liabilities", []) + ca.get("assets", []) if "suspense" in e['name'].lower() or "clearing" in e['name'].lower()]
        if susp:
            resp = f"Found {len(susp)} suspense/clearing accounts:\n"
            for e in susp:
                resp += f"• {e['name']}: {fmt(abs(e['net']))}\n"
            resp += "\n⚠️ These need immediate reconciliation. Large suspense balances indicate uncleared transactions that distort your financial position."
            return resp
        return "No significant suspense or clearing accounts found."

    if any(w in q for w in ["ratio", "health", "position", "liquidity"]):
        cr = ratios.get('current_ratio', 0)
        de = ratios.get('debt_to_equity', 0)
        nm = ratios.get('net_margin', 0)
        gm = ratios.get('gross_margin', 0)
        wc = ratios.get('working_capital', 0)
        resp = f"Financial Health Check:\n\n"
        resp += f"• Current Ratio: {cr}x {'✅' if cr >= 1.5 else '⚠️ Below 1.5x'}\n"
        resp += f"• Debt-to-Equity: {de}x {'✅' if de <= 2 else '⚠️ High leverage'}\n"
        resp += f"• Gross Margin: {gm}% {'✅' if gm >= 30 else '⚠️ Low'}\n"
        resp += f"• Net Margin: {nm}% {'✅' if nm >= 10 else '⚠️ Needs improvement'}\n"
        resp += f"• Working Capital: {fmt(wc)} {'✅' if wc > 0 else '🔴 Negative!'}\n"
        return resp

    if any(w in q for w in ["employee", "salary", "payroll", "staff", "hiring"]):
        payroll = [e for e in ca.get("expenses", []) if any(w in e['name'].lower() for w in ["salary", "wage", "payroll", "staff", "pf", "esi", "gratuity"])]
        total = sum(abs(e['net']) for e in payroll)
        pct = total / fs['total_expenses'] * 100 if fs['total_expenses'] else 0

        # Try to pick a headcount out of the question (e.g. "40 employees",
        # "have 12 staff"). Falls back to generic framing if we can't find one.
        import re as _re
        headcount_match = _re.search(r"\b(\d{1,4})\s*(?:employees?|people|staff|headcount|team|workers?)\b", q)
        headcount = int(headcount_match.group(1)) if headcount_match else None

        resp = "## Employee Cost Breakdown\n\n"
        resp += f"- **Total payroll cost**: {fmt(total)} ({pct:.1f}% of total expenses)\n"
        for e in payroll:
            resp += f"- {e['name']}: {fmt(abs(e['net']))}\n"

        if headcount and total > 0:
            per_head_yr = total / headcount
            per_head_mo = per_head_yr / 12
            resp += f"\n## Average Salary Math\n\n"
            resp += f"With {headcount} employees: **{fmt(per_head_yr)}/year per head**, or **₹{per_head_mo:,.0f}/month**.\n\n"
            resp += "## Indian Industry Benchmark\n\n"
            if per_head_mo < 10000:
                resp += f"**This is very low.** Manufacturing and trading MSMEs in India typically pay ₹15,000-30,000/month minimum for full-time skilled workers. At ₹{per_head_mo:,.0f}/month your team is either (a) mostly part-time / contract labour, (b) headcount is overstated, or (c) a lot of compensation is sitting outside the salary ledger (as benefits, director remuneration, or paid through a related party).\n\n"
            elif per_head_mo < 25000:
                resp += f"**On the low side.** Entry-level manufacturing wages in India cluster around ₹15-25k/month, so you're in the range for unskilled / semi-skilled labour but nothing more senior. If you have any mid-level staff, the number doesn't add up.\n\n"
            elif per_head_mo < 50000:
                resp += f"**Broadly in line with Indian MSME norms** for a mixed team of operators and junior execs (₹25-50k/month average). No red flag.\n\n"
            else:
                resp += f"**Above average.** You're paying senior-team salaries on average. Worth checking you're getting the productivity that justifies it.\n\n"
            resp += "## Next Step\n\n"
            resp += "- Reconcile the payroll ledger to actual HR headcount. A mismatch here often hides contract labour, promoter remuneration, or missing CTC components like PF / ESI / gratuity.\n"
        else:
            resp += "\nShare your employee headcount and I can tell you if the average salary is in line with Indian MSME norms.\n"
        return resp

    if any(w in q for w in ["asset", "balance sheet", "what do we own"]):
        assets = sorted(ca.get("assets", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:7]
        resp = f"Total Assets: {fmt(fs['total_assets'])}\n\nTop assets:\n"
        for e in assets:
            resp += f"• {e['name']}: {fmt(abs(e['net']))}\n"
        return resp

    # Projection / forecast
    if any(w in q for w in ["project", "forecast", "next year", "future", "predict", "growth"]):
        rev = fs['total_revenue']
        exp = fs['total_expenses']
        net = fs['net_income']
        resp = f"Based on current financials, here's a simple projection:\n\n"
        resp += f"Current Year:\n• Revenue: {fmt(rev)}\n• Expenses: {fmt(exp)}\n• Net: {fmt(net)}\n\n"
        for scenario, growth in [("Conservative (5%)", 0.05), ("Moderate (15%)", 0.15), ("Aggressive (25%)", 0.25)]:
            proj_rev = rev * (1 + growth)
            # Assume expenses grow at half the revenue rate
            proj_exp = exp * (1 + growth * 0.5)
            proj_net = proj_rev - proj_exp
            resp += f"{scenario}:\n  Revenue: {fmt(proj_rev)} | Expenses: {fmt(proj_exp)} | Net: {fmt(proj_net)}\n\n"
        resp += "⚠️ Note: This is a simplified projection. For accurate forecasting, we need monthly data, seasonality patterns, and planned capex. Add your Anthropic API key for AI-powered projections."
        return resp

    # Risk assessment
    if any(w in q for w in ["risk", "danger", "threat", "worry", "concern"]):
        risks = []
        if fs['net_income'] < 0:
            risks.append(f"🔴 Operating Loss: Net loss of {fmt(abs(fs['net_income']))} ({abs(ratios.get('net_margin',0))}% negative margin). Company is burning cash.")
        susp = [e for e in ca.get("liabilities", []) + ca.get("assets", []) if "suspense" in e['name'].lower()]
        if susp:
            risks.append(f"🔴 Large Suspense Balance: {fmt(sum(abs(e['net']) for e in susp))} in unreconciled accounts. Could mask real liabilities.")
        if ratios.get('current_ratio', 0) < 1:
            risks.append(f"🟡 Liquidity Risk: Current ratio {ratios['current_ratio']}x — may struggle to pay short-term obligations.")
        top_exp = sorted(ca.get("expenses", []), key=lambda x: abs(x.get("net", 0)), reverse=True)
        if top_exp and abs(top_exp[0]['net']) / fs['total_expenses'] > 0.3:
            risks.append(f"🟡 Concentration Risk: {top_exp[0]['name']} is {abs(top_exp[0]['net'])/fs['total_expenses']*100:.0f}% of total expenses — over-reliance on one cost center.")
        receivables = [e for e in ca.get("assets", []) if "receiv" in e['name'].lower() or "debtor" in e['name'].lower()]
        if receivables:
            rec_total = sum(abs(e['net']) for e in receivables)
            if rec_total > fs['total_revenue'] * 0.3:
                risks.append(f"🟡 Collection Risk: Receivables ({fmt(rec_total)}) are {rec_total/fs['total_revenue']*100:.0f}% of revenue — possible collection issues.")
        if not risks:
            risks.append("No critical risks detected, but regular monitoring recommended.")
        resp = "Top Financial Risks:\n\n" + "\n\n".join(risks[:5])
        return resp

    # Profitability / improve / suggestions
    if any(w in q for w in ["profit", "improve", "suggest", "better", "optimize", "recommend", "action"]):
        top3 = sorted(ca.get("expenses", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:3]
        resp = "Actionable Steps to Improve Profitability:\n\n"
        resp += f"1. Address Top Cost Center — {top3[0]['name']} ({fmt(abs(top3[0]['net']))}, {abs(top3[0]['net'])/fs['total_expenses']*100:.0f}% of expenses):\n"
        resp += f"   Benchmark against industry peers. Even a 5% reduction saves {fmt(abs(top3[0]['net'])*0.05)}/year.\n\n"
        resp += f"2. Revenue Growth — Current revenue {fmt(fs['total_revenue'])}:\n"
        resp += f"   Focus on pricing optimization. A 10% price increase on same volume adds {fmt(fs['total_revenue']*0.1)}.\n\n"
        resp += f"3. Working Capital — "
        if ratios.get('working_capital', 0) < 0:
            resp += f"Working capital is NEGATIVE ({fmt(ratios['working_capital'])}). Negotiate longer payment terms with suppliers and tighten receivable collection.\n\n"
        else:
            resp += f"Working capital is {fmt(ratios['working_capital'])}. Consider deploying excess into growth.\n\n"
        if len(top3) > 2:
            resp += f"4. Review {top3[2]['name']} ({fmt(abs(top3[2]['net']))}) — is this discretionary? Can it be deferred?\n\n"
        resp += f"5. Clear the suspense account — unreconciled balances may hide cost leaks."
        return resp

    # Focus / priority / quarter
    if any(w in q for w in ["focus", "priority", "quarter", "this month", "immediate", "urgent"]):
        resp = "Priority Actions for This Quarter:\n\n"
        priorities = []
        susp = [e for e in ca.get("liabilities", []) + ca.get("assets", []) if "suspense" in e['name'].lower() or "clearing" in e['name'].lower()]
        if susp:
            priorities.append(f"1. URGENT: Reconcile suspense/clearing accounts ({fmt(sum(abs(e['net']) for e in susp))}). These distort every ratio and decision.")
        if fs['net_income'] < 0:
            priorities.append(f"2. HIGH: Address the {fmt(abs(fs['net_income']))} operating loss. Review the top 3 expense heads for immediate reduction opportunities.")
        receivables = [e for e in ca.get("assets", []) if "receiv" in e['name'].lower()]
        if receivables:
            priorities.append(f"3. MEDIUM: Follow up on receivables ({fmt(sum(abs(e['net']) for e in receivables))}). Aging analysis needed — how much is overdue?")
        priorities.append(f"4. MEDIUM: Conduct a vendor renegotiation cycle for your top 5 suppliers.")
        priorities.append(f"5. LOW: Document and formalize your accounting policies for Ind AS compliance.")
        resp += "\n\n".join(priorities[:5])
        return resp

    # Where money going / cash flow / cash
    if any(w in q for w in ["where", "money", "cash", "flow", "going", "spent"]):
        top7 = sorted(ca.get("expenses", []), key=lambda x: abs(x.get("net", 0)), reverse=True)[:7]
        total_exp = fs['total_expenses']
        resp = f"Where Your Money Is Going (Total: {fmt(total_exp)}):\n\n"
        for i, e in enumerate(top7, 1):
            pct = abs(e['net']) / total_exp * 100 if total_exp > 0 else 0
            bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
            resp += f"{i}. {e['name']}: {fmt(abs(e['net']))} ({pct:.1f}%)\n   {bar}\n"
        resp += f"\nTop 3 expenses consume {sum(abs(e['net']) for e in top7[:3])/total_exp*100:.0f}% of total spending."
        return resp

    # CA / auditor / review / compliance
    if any(w in q for w in ["ca ", "auditor", "chartered", "review", "audit", "compliance", "ind as"]):
        ind_as = analysis_result.get("ind_as_observations", [])
        resp = "As a CA reviewing this TB, here are my observations:\n\n"
        if ind_as:
            for obs in ind_as[:4]:
                sev_icon = "🔴" if obs['severity'] == 'high' else "🟡" if obs['severity'] == 'medium' else "🟢"
                resp += f"{sev_icon} [{obs['standard']}]\n   {obs['observation']}\n\n"
        susp = [e for e in ca.get("liabilities", []) + ca.get("assets", []) if "suspense" in e['name'].lower()]
        if susp:
            resp += f"⚠️ CRITICAL: Clear the suspense account ({fmt(sum(abs(e['net']) for e in susp))}) before statutory audit. No auditor will sign off with this balance.\n\n"
        resp += "My recommendation: Engage your CA to do a quarterly review. The TB has areas that need attention before year-end."
        return resp

    # Generic — much better fallback
    resp = f"Here's what I see in your financials:\n\n"
    resp += f"Revenue: {fmt(fs['total_revenue'])} | Expenses: {fmt(fs['total_expenses'])} | Net: {fmt(fs['net_income'])}\n\n"

    # Give the most relevant insight
    if fs['net_income'] < 0:
        resp += f"⚠️ Your company is loss-making with a {abs(ratios.get('net_margin',0))}% negative margin. The biggest expense is {sorted(ca.get('expenses',[]), key=lambda x: abs(x.get('net',0)), reverse=True)[0]['name'] if ca.get('expenses') else 'unknown'}.\n\n"
    elif ratios.get('net_margin', 0) < 10:
        resp += f"Your margin is thin at {ratios['net_margin']}%. Focus on either growing revenue or cutting the top expense heads.\n\n"
    else:
        resp += f"Good profitability with {ratios['net_margin']}% margin. Look for optimization opportunities in your cost structure.\n\n"

    if insights:
        resp += f"Key insight: {insights[0]['detail']}\n\n"

    resp += "I can help with: revenue analysis, expense breakdown, risk assessment, projections, employee costs, profitability improvement, compliance review, balance sheet analysis, or cash position."
    return resp
