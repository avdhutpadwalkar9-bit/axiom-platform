"""
AI Service — Connects to Claude API for financial analysis chat.
Falls back to smart local responses when no API key is configured.
"""

import json
from typing import Optional

from app.config import settings
from app.services.industry_knowledge import get_industry_context, get_industry_profile

# Try importing anthropic
try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


def get_client():
    """Get Anthropic client if API key is configured."""
    api_key = settings.ANTHROPIC_API_KEY
    if not api_key or not HAS_ANTHROPIC:
        return None
    return anthropic.Anthropic(api_key=api_key)


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


SYSTEM_PROMPT = """You are CortexCFO AI, a financial consultant for Indian MSMEs and startups.

Your readers are business owners, NOT finance professionals. Write simply.

FORMATTING RULES (very important):
- Use proper markdown. Headings with ## and ###. Lists with "- " dash prefix.
- NEVER use bullet characters like • or ◦ or ▪. Always use "- " for lists.
- Every list item MUST start on its own line with "- " prefix.
- Add a blank line before every heading and before every list.
- Keep paragraphs short (2-3 sentences max).
- Use **bold** for key terms and numbers.
- NEVER use em dashes. Use periods or commas instead.

WRITING STYLE:
- Plain, simple English. Short sentences.
- Avoid jargon. If you must use a financial term, briefly explain it in parentheses.
- Be specific and actionable. Say what to do, not just what the problem is.
- Be warm and helpful, like a trusted advisor.
- Reference actual numbers from the data. Use Indian Rupee formatting (Lakhs, Crores).
- Max 3-4 paragraphs unless asked for detail.
- If you don't have enough data to answer, say so honestly.
- Never make up numbers. Only use what is in the data."""


async def chat_with_ai(
    question: str,
    analysis_result: dict,
    conversation_history: list[dict] = None,
    business_context: dict = None,
    user_answers: dict = None,
) -> str:
    """
    Chat with AI about the financial analysis.
    Uses Claude API if available, falls back to smart local responses.
    """
    client = get_client()

    # Build context
    financial_context = build_financial_context(analysis_result, business_context)

    # Add user answers to context if provided
    if user_answers:
        financial_context += "\n### Management Answers to AI Questions\n"
        for q, a in user_answers.items():
            financial_context += f"Q: {q}\nA: {a}\n\n"

    if client:
        # Use Claude API
        messages = []

        # Add conversation history
        if conversation_history:
            for msg in conversation_history[-10:]:  # Keep last 10 messages
                messages.append({
                    "role": msg["role"],
                    "content": msg["text"],
                })

        # Add current question
        messages.append({
            "role": "user",
            "content": question,
        })

        try:
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=f"{SYSTEM_PROMPT}\n\n{financial_context}",
                messages=messages,
            )
            return response.content[0].text
        except Exception as e:
            # Fall back to local if API fails
            return _local_response(question, analysis_result)
    else:
        # No API key — use smart local responses
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
        resp = f"Employee costs: {fmt(total)} ({total/fs['total_expenses']*100:.1f}% of total expenses)\n\n"
        for e in payroll:
            resp += f"• {e['name']}: {fmt(abs(e['net']))}\n"
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
