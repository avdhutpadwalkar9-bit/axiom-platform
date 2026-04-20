"""
Seed FAQ data for the CortexCFO advisor.

Each FAQ has:
  - `question`: the canonical phrasing (for matching + display)
  - `alternates`: other phrasings users might type (fed into matcher)
  - `keywords`: comma-separated signal words; a hit adds weight
  - `answer_template`: markdown template. Placeholders like {revenue},
    {top_expense_name}, {current_ratio} are interpolated from the live
    analysis_result at response time — see faq_service.render_answer.
    Placeholders that can't be resolved are dropped (not left as "{x}").
  - `category`: free-form tag for reporting / future curation.

GROWTH PATH: this file starts with ~30 high-quality golden-path FAQs
covering the common 70% of Indian-MSME-founder questions. Expand from
real user questions via the /api/chat/feedback log — cap is ~500; past
that, embeddings + pgvector make sense instead of stdlib matching.

ETHOS: answers are strategic-CFO-voice, quantified, and end with a
concrete action. They are templates, not generic answers — they read
the user's own numbers and reflect them back.
"""

# Each entry is a small dict; kept as a list so order is preserved for
# deterministic "first best" matching when two FAQs tie.
SEED_FAQS: list[dict] = [
    # ─── Revenue & Top-Line ─────────────────────────────────────────────
    {
        "id": "faq-revenue-total",
        "region": "IN",
        "category": "revenue",
        "question": "What is my total revenue?",
        "alternates": [
            "How much revenue did we make",
            "Show me the top line",
            "What's the total sales number",
            "Revenue summary",
        ],
        "keywords": ["revenue", "sales", "top line", "turnover"],
        "answer_template": (
            "**Total revenue: {revenue_fmt}.**\n\n"
            "- Net income: **{net_income_fmt}** "
            "({net_margin}% margin — {margin_verdict})\n"
            "- Total expenses: {expenses_fmt}\n"
            "- Biggest revenue line: **{top_revenue_name}** "
            "at {top_revenue_amount_fmt}\n\n"
            "### So what\n\n"
            "Your headline margin is {net_margin}%. "
            "{margin_action}"
        ),
    },
    {
        "id": "faq-revenue-breakdown",
        "region": "IN",
        "category": "revenue",
        "question": "Break down my revenue by source",
        "alternates": [
            "Where is my revenue coming from",
            "Revenue by category",
            "Revenue mix",
        ],
        "keywords": ["revenue breakdown", "revenue mix", "revenue by", "source"],
        "answer_template": (
            "**Revenue of {revenue_fmt} across your books.**\n\n"
            "{revenue_breakdown_md}\n\n"
            "### So what\n\n"
            "Concentration in any single line above 60% is a diligence "
            "flag. If you're there, the next 90 days is about diversification, "
            "not growth."
        ),
    },

    # ─── Expenses & Cost Cutting ───────────────────────────────────────
    {
        "id": "faq-top-expenses",
        "region": "IN",
        "category": "expenses",
        "question": "What are my top expenses?",
        "alternates": [
            "Where is my money going",
            "Biggest cost centers",
            "What am I spending on",
            "Where do I spend the most",
        ],
        "keywords": ["expense", "cost", "spend", "top", "biggest"],
        "answer_template": (
            "**{top_expense_name} is your biggest line at {top_expense_fmt} "
            "— {top_expense_pct}% of total spend.**\n\n"
            "Top three cost centers:\n\n"
            "{top_3_expenses_md}\n\n"
            "### So what\n\n"
            "These three lines together are {top_3_pct}% of total expenses. "
            "Any cost-reduction program should start here — a 5% trim across "
            "just the top three saves **{top_3_savings_fmt}** a year."
        ),
    },
    {
        "id": "faq-reduce-costs",
        "region": "IN",
        "category": "expenses",
        "question": "How can I reduce my costs?",
        "alternates": [
            "How to cut expenses",
            "Where can I save money",
            "Cost reduction ideas",
            "How to improve profitability",
        ],
        "keywords": ["reduce", "cut", "save", "lower", "optimize", "trim"],
        "answer_template": (
            "**Three levers, ranked by impact on your books:**\n\n"
            "1. **{top_expense_name}** ({top_expense_fmt}, "
            "{top_expense_pct}% of total). Even a 5% renegotiation with "
            "your top vendor saves **{top_expense_5pct_fmt}** a year.\n"
            "2. **{second_expense_name}** ({second_expense_fmt}). Often "
            "discretionary — ask what's actually driving it, not what "
            "the ledger says.\n"
            "3. **Working capital tightening** — current WC is "
            "{working_capital_fmt}. "
            "{wc_action}\n\n"
            "### Next 90 days\n\n"
            "- Week 1-2: Tender your top-3 vendor contracts\n"
            "- Week 3-4: Freeze hiring in non-revenue functions\n"
            "- Month 2-3: Rebuild the budget bottom-up, not as last-year-plus-inflation"
        ),
    },

    # ─── Financial Health & Ratios ─────────────────────────────────────
    {
        "id": "faq-financial-health",
        "region": "IN",
        "category": "ratios",
        "question": "How is my financial health?",
        "alternates": [
            "Am I healthy",
            "Give me a health check",
            "Financial position summary",
            "Key ratios",
        ],
        "keywords": ["health", "ratio", "position", "liquidity", "solvency"],
        "answer_template": (
            "**Headline: {health_verdict}.**\n\n"
            "| Metric | Your value | Benchmark |\n"
            "| --- | --- | --- |\n"
            "| Current ratio | {current_ratio}x | 1.5-2.0x |\n"
            "| Debt-to-equity | {debt_to_equity}x | < 1.5x |\n"
            "| Gross margin | {gross_margin}% | 30%+ |\n"
            "| Net margin | {net_margin}% | 10%+ |\n"
            "| Working capital | {working_capital_fmt} | Positive |\n\n"
            "### So what\n\n"
            "{health_action}"
        ),
    },
    {
        "id": "faq-working-capital",
        "region": "IN",
        "category": "ratios",
        "question": "Is my working capital healthy?",
        "alternates": [
            "Working capital position",
            "Do I have enough working capital",
            "Cash position",
        ],
        "keywords": ["working capital", "wc", "liquidity"],
        "answer_template": (
            "**Working capital: {working_capital_fmt}.**\n\n"
            "- Current ratio: **{current_ratio}x** (short-term assets ÷ "
            "short-term liabilities)\n"
            "- {wc_sign_verdict}\n\n"
            "### So what\n\n"
            "{wc_action}"
        ),
    },

    # ─── Risks & Red Flags ─────────────────────────────────────────────
    {
        "id": "faq-top-risks",
        "region": "IN",
        "category": "risk",
        "question": "What are my biggest risks?",
        "alternates": [
            "Red flags in my business",
            "What should I worry about",
            "Where is the risk",
            "Top risks",
        ],
        "keywords": ["risk", "danger", "threat", "worry", "concern", "red flag"],
        "answer_template": (
            "**Ranked by how badly they'd hit cash if left alone:**\n\n"
            "{risks_md}\n\n"
            "### Next 90 days\n\n"
            "Pick the top 1-2 and treat them as quarterly board agenda items. "
            "Everything else can wait."
        ),
    },
    {
        "id": "faq-concentration-risk",
        "region": "IN",
        "category": "risk",
        "question": "Do I have customer concentration risk?",
        "alternates": [
            "Am I too dependent on one customer",
            "Client concentration",
            "Customer diversification",
        ],
        "keywords": ["concentration", "customer", "client", "diversif"],
        "answer_template": (
            "Customer concentration is a QoE red flag any diligence team "
            "will ask about before revenue growth.\n\n"
            "The rule of thumb: **top-3 customers above 50% of revenue is "
            "a yellow flag, above 70% is red**. Upload your General Ledger "
            "on the QoE page to see your exact numbers.\n\n"
            "### Next 90 days\n\n"
            "- If concentrated: identify 2-3 adjacent customers in the same "
            "segment and spend Q1 on warm outreach.\n"
            "- Document that the top relationship isn't personal to you — "
            "acquirers discount revenue tied to founder relationships."
        ),
    },

    # ─── Projections & Forecasts ───────────────────────────────────────
    {
        "id": "faq-project-next-year",
        "region": "IN",
        "category": "projection",
        "question": "What will my financials look like next year?",
        "alternates": [
            "Project next year",
            "Forecast for next year",
            "What will we make next year",
            "FY projection",
        ],
        "keywords": ["project", "forecast", "next year", "next fy", "predict"],
        "answer_template": (
            "**Simple 3-scenario projection from today's books:**\n\n"
            "| Scenario | Revenue | Expenses | Net |\n"
            "| --- | --- | --- | --- |\n"
            "| Conservative (+5% rev, +3% cost) | {proj_conservative_rev_fmt} | "
            "{proj_conservative_exp_fmt} | {proj_conservative_net_fmt} |\n"
            "| Base (+15% rev, +8% cost) | {proj_base_rev_fmt} | "
            "{proj_base_exp_fmt} | {proj_base_net_fmt} |\n"
            "| Aggressive (+25% rev, +13% cost) | {proj_aggressive_rev_fmt} | "
            "{proj_aggressive_exp_fmt} | {proj_aggressive_net_fmt} |\n\n"
            "### Caveats\n\n"
            "This is extrapolation from a single TB. For an investor-grade "
            "forecast I'd need monthly data, seasonality, and your planned "
            "capex. If you have any of those, upload on the Analysis page "
            "and we'll redo this with real drivers.\n\n"
            "### Next 90 days\n\n"
            "Pick the scenario you think is realistic. Commit to one "
            "month-end where you hit the run-rate implied by that scenario. "
            "Review variance monthly."
        ),
    },

    # ─── Employee Costs ────────────────────────────────────────────────
    {
        "id": "faq-employee-costs",
        "region": "IN",
        "category": "payroll",
        "question": "How much am I spending on employees?",
        "alternates": [
            "Payroll cost",
            "Salary bill",
            "Cost per employee",
            "Headcount cost",
        ],
        "keywords": ["employee", "salary", "payroll", "staff", "headcount", "hiring"],
        "answer_template": (
            "**Total payroll: {payroll_fmt} — {payroll_pct}% of expenses.**\n\n"
            "{payroll_breakdown_md}\n\n"
            "### Next step\n\n"
            "Share your exact headcount (e.g. *\"I have 18 employees\"*) and "
            "I'll tell you whether per-head cost is in line with Indian MSME "
            "norms for your sector."
        ),
    },

    # ─── Compliance ─────────────────────────────────────────────────────
    {
        "id": "faq-compliance-check",
        "region": "IN",
        "category": "compliance",
        "question": "Am I compliance-ready for audit?",
        "alternates": [
            "Ind AS compliance",
            "GST compliance",
            "Audit readiness",
            "Statutory check",
        ],
        "keywords": ["audit", "compliance", "ind as", "gst", "tds", "statutory"],
        "answer_template": (
            "**Compliance health summary from your books:**\n\n"
            "{compliance_md}\n\n"
            "### Next 90 days\n\n"
            "- Clear any open suspense/clearing balances before year-end — "
            "no statutory auditor signs off with those\n"
            "- Reconcile GSTR-3B vs books monthly, not quarterly\n"
            "- Document Ind AS 24 related-party disclosures ahead of audit\n"
            "- Schedule a CA review call for Q4"
        ),
    },
    {
        "id": "faq-suspense-account",
        "region": "IN",
        "category": "compliance",
        "question": "What is in my suspense account?",
        "alternates": [
            "Suspense balance",
            "Clearing account",
            "Unreconciled items",
        ],
        "keywords": ["suspense", "clearing", "unreconciled"],
        "answer_template": (
            "**Suspense/clearing balances found: {suspense_md}**\n\n"
            "Large unreconciled balances hide real liabilities and distort "
            "every ratio on this page.\n\n"
            "### Next 90 days\n\n"
            "- Age the balance: when was each transaction first posted?\n"
            "- Anything older than 60 days: investigate individually\n"
            "- Clear before FY close — no auditor signs off with suspense"
        ),
    },

    # ─── QoE & Add-backs (page-specific) ────────────────────────────────
    {
        "id": "faq-qoe-addbacks",
        "region": "IN",
        "category": "qoe",
        "question": "What are typical QoE add-backs?",
        "alternates": [
            "What is a normal add-back",
            "Common normalizations",
            "What do buyers adjust",
        ],
        "keywords": ["add-back", "addback", "normalis", "qoe", "adjust"],
        "answer_template": (
            "**Typical add-back categories buyers adjust for in Indian "
            "MSME QoE:**\n\n"
            "- **Related-party**: director's remuneration in excess of "
            "market, rent to promoter HUF above FMV, goods/services from "
            "affiliated entities.\n"
            "- **One-time**: legal/IP filing fees, restructuring, severance, "
            "one-off litigation settlements, grant income.\n"
            "- **Revenue adjustments**: non-recurring gains (PLI grants, "
            "asset disposals, forex gains).\n"
            "- **Accounting**: Ind AS 115 cut-off corrections, excess/"
            "reversed provisions, capitalisation corrections.\n\n"
            "### Why they matter\n\n"
            "Acquirers value recurring, run-rate EBITDA. If the top line "
            "of your bridge looks inflated by non-recurring items, the "
            "multiple gets compressed. A clean bridge is worth more than "
            "a high reported number."
        ),
    },
    {
        "id": "faq-qoe-what-is",
        "region": "IN",
        "category": "qoe",
        "question": "What is a Quality of Earnings report?",
        "alternates": [
            "What is QoE",
            "Why do I need a QoE",
            "Quality of earnings meaning",
        ],
        "keywords": ["quality of earnings", "qoe"],
        "answer_template": (
            "**QoE = the audited-adjacent workbook an acquirer or lender "
            "uses to figure out your *real* EBITDA.**\n\n"
            "- Starts with your reported EBITDA\n"
            "- Adjusts for non-recurring, related-party, and accounting-"
            "noise items (\"add-backs\")\n"
            "- Delivers a normalised, run-rate number that represents "
            "what a new owner would earn from the business\n\n"
            "It's not an audit. It's a diligence document — an auditor "
            "says *\"the numbers tie to ledger\"*, QoE says *\"here's what "
            "those numbers really mean to a buyer\"*.\n\n"
            "### When you need one\n\n"
            "- Fundraise > ₹5 Cr\n"
            "- Strategic sale conversation\n"
            "- Working-capital lender diligence\n"
            "- Any board member asks *\"what's our normalised EBITDA?\"*"
        ),
    },

    # ─── Industry & Benchmarks ─────────────────────────────────────────
    {
        "id": "faq-industry-benchmark",
        "region": "IN",
        "category": "benchmark",
        "question": "How do my numbers compare to my industry?",
        "alternates": [
            "Am I in line with peers",
            "Industry benchmarks",
            "Peer comparison",
        ],
        "keywords": ["benchmark", "peer", "industry", "compare", "sector"],
        "answer_template": (
            "Your industry is **{industry}**. Here's how your headline "
            "ratios compare to typical Indian MSMEs in this sector:\n\n"
            "{industry_comparison_md}\n\n"
            "### So what\n\n"
            "{industry_action}"
        ),
    },

    # ─── Growth & Strategy ─────────────────────────────────────────────
    {
        "id": "faq-growth-lever",
        "region": "IN",
        "category": "strategy",
        "question": "What's my biggest growth opportunity?",
        "alternates": [
            "How can I grow",
            "Where should I focus",
            "Biggest opportunity",
            "Growth strategy",
        ],
        "keywords": ["grow", "growth", "opportunity", "expand", "scale"],
        "answer_template": (
            "**The biggest lever in your books right now is margin, not "
            "volume.**\n\n"
            "At {net_margin}% net margin, every 1% of margin expansion is "
            "worth **{one_pct_margin_fmt}** a year at current revenue. "
            "Growing revenue 10% at today's margin earns you only "
            "{rev_10pct_impact_fmt}.\n\n"
            "### Priority order\n\n"
            "1. **Margin** — renegotiate top vendor, trim second-largest "
            "cost line, review discretionary spend\n"
            "2. **Working capital** — shorten debtor days, lengthen creditor "
            "days, free cash to reinvest\n"
            "3. **Revenue** — only after margins are healthy. Otherwise "
            "you're scaling losses."
        ),
    },
    {
        "id": "faq-priority-quarter",
        "region": "IN",
        "category": "strategy",
        "question": "What should I focus on this quarter?",
        "alternates": [
            "Top priorities",
            "What should I do first",
            "Q1 focus",
            "Next 90 days",
        ],
        "keywords": ["focus", "priority", "quarter", "90 days", "urgent", "this week"],
        "answer_template": (
            "**Priorities for the next 90 days, ranked:**\n\n"
            "{priorities_md}\n\n"
            "### Owner-level discipline\n\n"
            "Pick the top one. Put it on every weekly review for 12 weeks. "
            "Stop everything non-strategic until the metric moves. That's "
            "how MSMEs actually get through the ₹10-50 Cr gap."
        ),
    },

    # ─── Balance Sheet ─────────────────────────────────────────────────
    {
        "id": "faq-balance-sheet",
        "region": "IN",
        "category": "balance_sheet",
        "question": "What's on my balance sheet?",
        "alternates": [
            "Assets and liabilities",
            "What do I own and owe",
            "Balance sheet summary",
        ],
        "keywords": ["balance sheet", "asset", "liabilit", "equity", "own", "owe"],
        "answer_template": (
            "**Balance sheet snapshot:**\n\n"
            "- Total assets: **{assets_fmt}**\n"
            "- Total liabilities: **{liabilities_fmt}**\n"
            "- Total equity: **{equity_fmt}**\n"
            "- Debt-to-equity: **{debt_to_equity}x**\n\n"
            "### Largest assets\n\n"
            "{top_assets_md}\n\n"
            "### Largest liabilities\n\n"
            "{top_liabilities_md}"
        ),
    },

    # ─── Receivables ───────────────────────────────────────────────────
    {
        "id": "faq-receivables",
        "region": "IN",
        "category": "balance_sheet",
        "question": "How much am I owed by customers?",
        "alternates": [
            "Receivables",
            "Debtors",
            "Collection status",
            "AR position",
        ],
        "keywords": ["receivable", "debtor", "collect", "ar", "outstanding"],
        "answer_template": (
            "**Receivables position: {receivables_fmt} "
            "({receivables_pct_of_rev}% of annual revenue).**\n\n"
            "{receivables_verdict}\n\n"
            "### Next 90 days\n\n"
            "- Run an AR aging: split into <30 days, 30-60, 60-90, >90\n"
            "- Anything >60 days — call personally\n"
            "- Anything >90 days — escalate or write off. Don't let it hide "
            "in the ledger distorting your working capital ratio."
        ),
    },

    # ─── Profitability Deep Dive ───────────────────────────────────────
    {
        "id": "faq-loss-making",
        "region": "IN",
        "category": "profitability",
        "question": "Why am I losing money?",
        "alternates": [
            "Why am I not profitable",
            "Loss analysis",
            "Why is net income negative",
        ],
        "keywords": ["loss", "losing", "unprofitable", "negative"],
        "answer_template": (
            "**Net loss of {abs_net_income_fmt} this year ({net_margin}% "
            "negative margin).**\n\n"
            "Primary cause from the numbers:\n\n"
            "- Expenses are {expense_coverage}% of revenue. Anything above "
            "100% is a structural loss problem, not a timing one.\n"
            "- Biggest line: **{top_expense_name}** at {top_expense_fmt} "
            "({top_expense_pct}% of spend).\n\n"
            "### Next 90 days\n\n"
            "1. Bottom-up rebuild of {top_expense_name} — is any of it "
            "discretionary?\n"
            "2. Price review — if gross margin is below industry, pricing "
            "(not cost) is the problem\n"
            "3. Headcount freeze in non-revenue functions until you cross "
            "breakeven"
        ),
    },
    {
        "id": "faq-improve-margin",
        "region": "IN",
        "category": "profitability",
        "question": "How can I improve my margin?",
        "alternates": [
            "Increase profitability",
            "Margin expansion",
            "How to make more profit",
        ],
        "keywords": ["margin", "profitability", "improve profit"],
        "answer_template": (
            "**Three paths to better margin, ranked by Indian-MSME feasibility:**\n\n"
            "1. **Pricing discipline** — a 5% price increase on current "
            "revenue of {revenue_fmt} is **{five_pct_price_fmt}** of pure "
            "margin. No execution risk. Most founders under-price.\n"
            "2. **Top vendor renegotiation** — {top_expense_name} is "
            "{top_expense_fmt}. 8% reduction = **{eight_pct_vendor_fmt}**.\n"
            "3. **Product / service mix** — move volume toward your highest-"
            "margin line.\n\n"
            "### Don't do this first\n\n"
            "Don't cut marketing to improve margin. Indian MSME founders who "
            "do this always regret it 6 months later."
        ),
    },

    # ─── Ind AS ────────────────────────────────────────────────────────
    {
        "id": "faq-ind-as-24",
        "region": "IN",
        "category": "ind_as",
        "question": "What is Ind AS 24 related-party?",
        "alternates": [
            "Related party disclosure",
            "Ind AS 24 compliance",
            "Related party rules",
        ],
        "keywords": ["ind as 24", "related party", "related-party", "rpt"],
        "answer_template": (
            "**Ind AS 24 requires disclosure of every transaction with a "
            "related party** — director, promoter, their relatives, HUF, "
            "or any entity under their control.\n\n"
            "Disclosure includes: nature of relationship, transaction "
            "volume, outstanding balances, terms, and whether at arm's "
            "length.\n\n"
            "### Why it matters for QoE\n\n"
            "Buyers treat above-market related-party payments as add-backs. "
            "If you pay ₹12 L rent to the promoter's HUF and the market "
            "rate is ₹9 L, the ₹3 L excess comes off the cost base and "
            "adds to normalised EBITDA."
        ),
    },
    {
        "id": "faq-ind-as-115",
        "region": "IN",
        "category": "ind_as",
        "question": "What is Ind AS 115 revenue recognition?",
        "alternates": [
            "Revenue cut off",
            "When to recognize revenue",
            "Revenue recognition rules",
        ],
        "keywords": ["ind as 115", "revenue recognition", "cut-off", "cut off"],
        "answer_template": (
            "**Ind AS 115 recognises revenue when control passes to the "
            "customer — not when invoiced, and not when cash arrives.**\n\n"
            "Most-common MSME misses:\n\n"
            "- Recognising advance receipts as revenue (they're deferred "
            "revenue until service delivered)\n"
            "- Recognising service revenue on completion instead of over "
            "the delivery period\n"
            "- No cut-off review at year-end — invoices raised in April "
            "for March delivery should sit in March\n\n"
            "### Next 90 days\n\n"
            "Run a cut-off test: pull last 10 invoices raised after year-end. "
            "Were all deliveries after year-end too? If not, the revenue "
            "belongs in the previous year."
        ),
    },

    # ─── Product / Platform Help ───────────────────────────────────────
    {
        "id": "faq-upload-format",
        "region": "IN",
        "category": "product",
        "question": "What file format should I upload?",
        "alternates": [
            "How do I upload my trial balance",
            "What can you read",
            "Supported file types",
        ],
        "keywords": ["upload", "format", "file", "excel", "pdf", "tally", "zoho"],
        "answer_template": (
            "**We read:**\n\n"
            "- Trial balance (Excel / CSV — Tally, Zoho, QuickBooks exports "
            "all work)\n"
            "- General Ledger (Excel — for customer concentration + "
            "transaction-level add-back detection)\n"
            "- Audited financial statements (PDF — slower, less structured, "
            "used as supporting evidence)\n\n"
            "The cleaner the source, the better the analysis. A Zoho GL "
            "export is more useful than a scanned PDF.\n\n"
            "Upload on the **Analysis** page."
        ),
    },
    {
        "id": "faq-what-is-cortex",
        "region": "IN",
        "category": "product",
        "question": "What does CortexCFO do?",
        "alternates": [
            "What is this platform",
            "How does CortexCFO work",
            "What are you",
        ],
        "keywords": ["cortexcfo", "what is this", "what does this do", "help me"],
        "answer_template": (
            "**CortexCFO is the FP&A + QoE engine for Indian MSMEs in "
            "the ₹10-50 Cr revenue band.**\n\n"
            "What we do:\n\n"
            "- Read your trial balance, ledger, or audited FS\n"
            "- Turn it into a clean, normalised, CFO-quality financial "
            "picture\n"
            "- Build the QoE workbook acquirers, PE, and lenders expect\n"
            "- Flag Ind AS, GST, TDS, MCA compliance gaps before audit\n"
            "- Give you strategic CFO-level advice — what to fix, what to "
            "change, what to prioritise\n\n"
            "Think of it as a senior CA-turned-CFO on call, without the "
            "₹50 L/year cost."
        ),
    },

    # ─── Fundraise / Diligence ─────────────────────────────────────────
    {
        "id": "faq-fundraise-ready",
        "region": "IN",
        "category": "fundraise",
        "question": "Am I ready to raise?",
        "alternates": [
            "Fundraise readiness",
            "Can I raise equity",
            "Should I approach investors",
        ],
        "keywords": ["raise", "fundrais", "investor", "equity", "series"],
        "answer_template": (
            "**Fundraise readiness has three prongs. Quick audit from "
            "your books:**\n\n"
            "1. **Unit economics** — is gross margin positive and stable? "
            "Yours: **{gross_margin}%**. "
            "{gm_readiness}\n"
            "2. **Clean books** — are suspense balances cleared, related-"
            "party transactions disclosed, Ind AS compliant? Your TB has "
            "**{ind_as_obs_count} Ind AS observations** to resolve.\n"
            "3. **Growth trajectory** — 20%+ YoY at this revenue band is "
            "the investor bar.\n\n"
            "### Next step\n\n"
            "Upload your last 3 years of TBs on the Analysis page — the "
            "growth story is what a term sheet hinges on, not the latest "
            "snapshot."
        ),
    },

    # ─── Tax & GST ─────────────────────────────────────────────────────
    {
        "id": "faq-gst-reconcile",
        "region": "IN",
        "category": "tax",
        "question": "How do I reconcile GST with my books?",
        "alternates": [
            "GSTR-3B reconciliation",
            "GST vs books",
            "GST compliance check",
        ],
        "keywords": ["gst", "gstr-3b", "gstr-2a", "2b", "reconcile"],
        "answer_template": (
            "**GST reconciliation is the single most-skipped discipline "
            "in Indian MSME finance. Here's the monthly cadence:**\n\n"
            "- **GSTR-3B vs books** — tax liability in GSTR-3B should "
            "exactly match output GST in your P&L\n"
            "- **GSTR-2A/2B vs books** — input credit claimed must match "
            "what your vendors uploaded. Gap = vendor non-compliance = "
            "blocked credit\n"
            "- **Annual GSTR-9** — most founders sign this without a "
            "reconciliation. Don't.\n\n"
            "### Rule\n\n"
            "If any single month has a gap above 2%, investigate "
            "immediately. Gaps compound."
        ),
    },

    # ─── Scenario / What-if ────────────────────────────────────────────
    {
        "id": "faq-what-if-revenue",
        "region": "IN",
        "category": "scenario",
        "question": "What if my revenue grows 20%?",
        "alternates": [
            "Revenue growth scenario",
            "What happens if sales grow",
            "Growth scenario",
        ],
        "keywords": ["what if", "scenario", "grow 20", "grow 15", "grows"],
        "answer_template": (
            "**At today's cost structure, a 20% revenue lift lands roughly "
            "here:**\n\n"
            "- Revenue: {revenue_fmt} → **{proj_rev_20pct_fmt}**\n"
            "- Expenses (assuming costs grow at half — 10%): → "
            "**{proj_exp_20pct_fmt}**\n"
            "- Net income: {net_income_fmt} → **{proj_net_20pct_fmt}**\n\n"
            "### Caveat\n\n"
            "Cost leverage only works if your expense base has fixed cost "
            "(headcount, rent, SaaS). If your biggest line is a variable "
            "cost (materials, logistics), expenses grow closer to 20% too "
            "— and the bottom line move is smaller. Use the Scenarios "
            "page to model with real cost-fixity splits."
        ),
    },

    # ─── Phase 4 expansion: tax, HR, operations, banking, working
    # capital, pricing, customer metrics, valuation. Written for Indian
    # MSME founders in the ₹10-50 Cr band. Priority on evergreen advice
    # that doesn't drift with individual quarter numbers. ────────────

    # ─── Tax (TDS, advance tax, GST, LUT) ──────────────────────────
    {
        "id": "faq-tds-basics",
        "region": "IN",
        "category": "tax",
        "question": "What TDS do I need to deduct?",
        "alternates": [
            "TDS rates",
            "Who do I deduct TDS from",
            "TDS applicability",
        ],
        "keywords": ["tds", "tax deducted at source", "194", "deduct"],
        "answer_template": (
            "**Most common TDS obligations for an Indian MSME:**\n\n"
            "- **194C Contractors/sub-contractors** — 1% (individual/HUF), "
            "2% (others). Threshold ₹30K single / ₹1 L aggregate per year.\n"
            "- **194J Professional fees** — 10% (2% for tech/call-centre "
            "services). Threshold ₹30K per payee per year.\n"
            "- **194I Rent** — 10% on land/building above ₹2.4 L p.a.\n"
            "- **194H Commission/brokerage** — 5% above ₹15K.\n"
            "- **192 Salaries** — per slab, monthly.\n\n"
            "### Non-negotiables\n\n"
            "- Deposit by the 7th of the following month (April deadline is the 30th).\n"
            "- File quarterly TDS returns (Form 24Q, 26Q) by the last day of the following month.\n"
            "- Issue Form 16 / 16A by the June 15 deadline each year.\n\n"
            "### So what\n\n"
            "Short deduction or delayed deposit = disallowance of the "
            "expense under Section 40(a)(ia), plus interest. Set up a "
            "monthly calendar now and automate via your accounting tool."
        ),
    },
    {
        "id": "faq-advance-tax",
        "region": "IN",
        "category": "tax",
        "question": "When do I pay advance tax?",
        "alternates": [
            "Advance tax schedule",
            "Quarterly tax payment",
            "Advance tax dates",
        ],
        "keywords": ["advance tax", "quarterly tax", "pay tax", "235c"],
        "answer_template": (
            "**If your tax liability will exceed ₹10,000 in a year, advance "
            "tax is mandatory.** For companies, the schedule is:\n\n"
            "| Due date | Cumulative % |\n"
            "| --- | --- |\n"
            "| 15 June | 15% |\n"
            "| 15 September | 45% |\n"
            "| 15 December | 75% |\n"
            "| 15 March | 100% |\n\n"
            "Miss a milestone and Section 234B/C interest applies at 1% "
            "per month on the shortfall.\n\n"
            "### Pragmatic rule\n\n"
            "Estimate conservatively in Q1 (last year's tax / 4). Adjust "
            "upward in September and December based on actual run-rate. "
            "Shortfall interest is cheaper than overpayment + waiting for "
            "a refund."
        ),
    },
    {
        "id": "faq-gstr1-vs-3b",
        "region": "IN",
        "category": "tax",
        "question": "What's the difference between GSTR-1 and GSTR-3B?",
        "alternates": [
            "GSTR-1 GSTR-3B",
            "GST return types",
            "Which GST returns to file",
        ],
        "keywords": ["gstr-1", "gstr-3b", "gst return"],
        "answer_template": (
            "**GSTR-1 = your outward-supplies return.** Invoice-level detail "
            "of every sale, due by the 11th of the following month "
            "(monthly) or 13th (QRMP — quarterly filers under ₹5 Cr).\n\n"
            "**GSTR-3B = your consolidated tax-payment return.** Summary "
            "numbers only (output tax, input tax credit, net liability). "
            "Due by the 20th/22nd/24th depending on state category.\n\n"
            "### Why both matter\n\n"
            "GSTR-1 populates your customer's GSTR-2A — their ability to "
            "claim input credit depends on you filing GSTR-1 correctly and "
            "on time. GSTR-3B is how you actually pay. The two MUST match "
            "at year-end reconciliation (GSTR-9); mismatches invite notices.\n\n"
            "### Next step\n\n"
            "Reconcile GSTR-1 vs your invoice register monthly, not quarterly."
        ),
    },
    {
        "id": "faq-lut-export",
        "region": "IN",
        "category": "tax",
        "question": "Do I need LUT for exports?",
        "alternates": [
            "Letter of Undertaking",
            "Zero-rated exports",
            "Export without IGST",
        ],
        "keywords": ["lut", "letter of undertaking", "export", "zero-rated"],
        "answer_template": (
            "**Yes, if you want to export goods/services without paying "
            "IGST up front.** The Letter of Undertaking (LUT) lets you "
            "ship zero-rated without locking up cash in IGST refunds.\n\n"
            "- Apply annually (Form GST RFD-11) before the new financial year.\n"
            "- Valid for the full FY; lapses need a fresh application.\n"
            "- Without LUT, you pay IGST on export and claim refund later — "
            "typical refund cycle is 60-90 days, a real working-capital hit.\n\n"
            "### Rule of thumb\n\n"
            "Any exporter doing >₹25 L p.a. should keep a live LUT. "
            "The admin cost is a one-time annual filing; the working-capital "
            "savings compound every month."
        ),
    },

    # ─── HR (salaries, ESOP, gratuity, PF/ESI) ─────────────────────
    {
        "id": "faq-esop-msme",
        "region": "IN",
        "category": "hr",
        "question": "Should I set up an ESOP for my team?",
        "alternates": [
            "ESOP scheme",
            "Employee stock options",
            "Equity compensation",
        ],
        "keywords": ["esop", "stock option", "equity", "employee stock"],
        "answer_template": (
            "**ESOPs make sense once you hit ~₹10 Cr revenue and need to "
            "hire people the salary band won't attract.**\n\n"
            "### Typical Indian MSME structure\n\n"
            "- **Pool size**: 5-10% of fully-diluted cap table at first-round\n"
            "- **Vesting**: 4 years with 1-year cliff\n"
            "- **Strike price**: FMV as per Rule 11UA (merchant-banker valuation)\n"
            "- **Exercise window**: 90 days on leaving, 10 years on stay\n\n"
            "### Tax reality (important)\n\n"
            "- Taxed at exercise (perquisite, per slab) + at sale (capital gains)\n"
            "- DPIIT-recognised startups get deferred exercise tax (5 years / exit / sale)\n"
            "- FMV-at-exercise is how perquisite is measured — get this documented\n\n"
            "### Next step\n\n"
            "Don't DIY. A seasoned ESOP lawyer + CA structures this for "
            "₹1.5-3 L. Worth it vs. the cleanup costs of a sloppy first grant."
        ),
    },
    {
        "id": "faq-gratuity-provision",
        "region": "IN",
        "category": "hr",
        "question": "How do I provision for gratuity?",
        "alternates": [
            "Gratuity liability",
            "Payment of Gratuity Act",
            "Gratuity fund",
        ],
        "keywords": ["gratuity", "payment of gratuity", "retirement benefit"],
        "answer_template": (
            "**Payment of Gratuity Act applies to any firm with 10+ "
            "employees on any day in the preceding 12 months.** Once it "
            "applies, it applies forever — head-count dropping below 10 "
            "doesn't exempt you.\n\n"
            "### Formula\n\n"
            "Gratuity = (last drawn salary × 15 × years of service) ÷ 26\n\n"
            "Capped at ₹20 L tax-free. Payable on 5+ years of continuous service.\n\n"
            "### Ind AS 19 requirement\n\n"
            "Provision on the balance sheet for the **actuarially-valued** "
            "liability each year. Get an actuary's certificate; don't "
            "provision at book-value approximations — auditors reject those.\n\n"
            "### Smart move\n\n"
            "Fund it through a Gratuity Trust or LIC Group Gratuity scheme. "
            "Gives you tax deduction on contributions AND isolates the "
            "liability from working capital."
        ),
    },
    {
        "id": "faq-pf-esi-compliance",
        "region": "IN",
        "category": "hr",
        "question": "When do PF and ESI become mandatory?",
        "alternates": [
            "PF registration threshold",
            "ESI applicability",
            "Provident fund compliance",
        ],
        "keywords": ["pf", "esi", "provident fund", "esic", "epf"],
        "answer_template": (
            "**PF (EPF) becomes mandatory at 20+ employees.** Contribution: "
            "12% of basic + DA, matched by employer. Wage ceiling ₹15K for "
            "mandatory cover (optional above).\n\n"
            "**ESI is mandatory at 10+ employees** earning ≤₹21K/month "
            "(₹25K for disabled). Contribution: 0.75% employee + 3.25% employer.\n\n"
            "### Deposit schedule\n\n"
            "Both due by the 15th of the following month. Late deposit = "
            "12% p.a. interest + damages up to 100% of contribution.\n\n"
            "### Audit trap\n\n"
            "Schedule II of the Companies Act requires both to be deposited "
            "on time. Missed deposits are a statutory audit qualification "
            "and CARO reportable — which will kill a QoE multiple."
        ),
    },

    # ─── Operations (vendor management, inventory) ──────────────────
    {
        "id": "faq-vendor-negotiation",
        "region": "IN",
        "category": "operations",
        "question": "How do I negotiate better vendor terms?",
        "alternates": [
            "Vendor renegotiation",
            "Supplier negotiation",
            "Better payment terms",
        ],
        "keywords": ["vendor", "supplier", "negotiate", "terms"],
        "answer_template": (
            "**Three levers, in priority order:**\n\n"
            "1. **Payment terms** — each extra day of credit is ~0.03% of "
            "the invoice in effective financing. Pushing 30 → 60 days "
            "frees up ~2.5% of annual spend as working capital.\n"
            "2. **Price** — show them audited volume data. \"We bought ₹2 "
            "Cr from you last year; we're budgeting ₹2.6 Cr this year; "
            "what does that earn us on rate?\"\n"
            "3. **Rebate/volume discount** — ask for 2-3% annual rebate "
            "tied to a volume slab. Gives you upside if business grows; "
            "no downside if it doesn't.\n\n"
            "### Non-negotiables to lock in\n\n"
            "- Quality spec (written, testable)\n"
            "- Lead time commitment with penalty for breach\n"
            "- Price-hold period (minimum 6 months)\n"
            "- Exit clause — 30-day notice, no penalty\n\n"
            "### Cadence\n\n"
            "Renegotiate top-3 vendors every 12 months. Don't wait for a "
            "price hike; negotiate from strength, not crisis."
        ),
    },
    {
        "id": "faq-inventory-turnover",
        "region": "IN",
        "category": "operations",
        "question": "What's a good inventory turnover ratio?",
        "alternates": [
            "Inventory days",
            "Stock turn",
            "Inventory efficiency",
        ],
        "keywords": ["inventory turnover", "inventory days", "stock turn"],
        "answer_template": (
            "**Rules of thumb for Indian MSME, by sector:**\n\n"
            "| Sector | Turnover target | Inventory days |\n"
            "| --- | --- | --- |\n"
            "| Manufacturing | 6-10x | 36-60 days |\n"
            "| Wholesale trading | 8-12x | 30-45 days |\n"
            "| Retail | 8-15x | 24-45 days |\n"
            "| Services (consumables) | 12x+ | <30 days |\n\n"
            "### Why it matters\n\n"
            "Each extra month of inventory = ~2% of revenue trapped as "
            "cash. On a ₹20 Cr business that's ₹40 L locked up for nothing.\n\n"
            "### Next 90 days\n\n"
            "- Age your SKUs: how much sitting >90 days? >180? These are "
            "candidates for aggressive discount or write-off.\n"
            "- Switch fast-movers to JIT / kanban with key vendors.\n"
            "- Monthly inventory review — treat it as a P&L item, not a "
            "warehouse problem."
        ),
    },

    # ─── Working capital (debtor/creditor days, WC cycle) ───────────
    {
        "id": "faq-debtor-days",
        "region": "IN",
        "category": "working_capital",
        "question": "What's a healthy debtor days number?",
        "alternates": [
            "Receivable days",
            "Collection days",
            "DSO target",
        ],
        "keywords": ["debtor days", "dso", "receivable days", "collection days"],
        "answer_template": (
            "**Debtor days = (Receivables / Revenue) × 365.**\n\n"
            "| Sector | Healthy | Attention | Red |\n"
            "| --- | --- | --- | --- |\n"
            "| B2C retail | <15 | 15-30 | >30 |\n"
            "| Manufacturing B2B | 45-60 | 60-90 | >90 |\n"
            "| Services B2B | 30-60 | 60-90 | >90 |\n"
            "| Government contracts | 90-120 | 120-180 | >180 |\n\n"
            "### Why focus here\n\n"
            "Every 10 days of debtor reduction = ~2.7% of revenue back as "
            "cash. Cheaper than any form of external financing.\n\n"
            "### Collection toolkit\n\n"
            "- Monthly aging review at founder level (not delegated)\n"
            "- Auto-reminders at 7 / 15 / 30 days overdue\n"
            "- Early-payment discount (2/10 net 30) — more effective than chasing\n"
            "- Credit check before extending new terms on top 20% customers"
        ),
    },
    {
        "id": "faq-wc-cycle",
        "region": "IN",
        "category": "working_capital",
        "question": "What's my working capital cycle?",
        "alternates": [
            "Cash conversion cycle",
            "WC cycle formula",
            "Operating cycle",
        ],
        "keywords": ["working capital cycle", "cash conversion", "operating cycle"],
        "answer_template": (
            "**Cash Conversion Cycle (CCC) = Debtor days + Inventory days − Creditor days.**\n\n"
            "It measures how many days cash is tied up between paying "
            "suppliers and collecting from customers.\n\n"
            "### What each lever does\n\n"
            "- **Debtor days ↓** — collect faster. Every 10 days = ~2.7% of revenue as cash.\n"
            "- **Inventory days ↓** — hold less stock. Each 10 days = ~1-2% of revenue.\n"
            "- **Creditor days ↑** — pay suppliers slower. Gains match debtor days.\n\n"
            "### Benchmarks\n\n"
            "- Manufacturing MSME: 90-150 days is typical; <90 is excellent\n"
            "- Trading MSME: 45-90 days\n"
            "- Services MSME: 30-60 days\n\n"
            "### Strategic move\n\n"
            "A 30-day improvement on a ₹20 Cr business is ₹1.6 Cr in "
            "freed-up cash. That's usually cheaper than raising debt or "
            "equity. Start with debtor discipline — it's the most controllable."
        ),
    },

    # ─── Banking & credit ────────────────────────────────────────────
    {
        "id": "faq-od-vs-cc",
        "region": "IN",
        "category": "banking",
        "question": "Overdraft vs cash credit — which do I need?",
        "alternates": [
            "OD vs CC",
            "Working capital loan",
            "Cash credit facility",
        ],
        "keywords": ["overdraft", "cash credit", "od", "cc", "working capital loan"],
        "answer_template": (
            "**Both are revolving facilities, but they serve different needs:**\n\n"
            "| Feature | Overdraft (OD) | Cash Credit (CC) |\n"
            "| --- | --- | --- |\n"
            "| Security | Property / FD | Stock + Debtors |\n"
            "| Drawing power | Fixed limit | Changes with stock/debtor value (DP) |\n"
            "| Interest | On amount drawn | On amount drawn |\n"
            "| Typical use | Short-term bridging | Ongoing WC needs |\n"
            "| Stock audit | No | Yes, quarterly |\n\n"
            "### When to use which\n\n"
            "- **OD** if you have property/FD to pledge, predictable cash "
            "needs, and don't want monthly stock statements.\n"
            "- **CC** if your WC needs fluctuate with stock/debtors — "
            "the DP growing with business gives natural scaling.\n\n"
            "### What banks look at\n\n"
            "Current ratio >1.2, DSCR >1.3, no irregularities in last 6 "
            "months of account. Keep these tight BEFORE you apply — "
            "negotiating from strength saves 50-100 bps on rate."
        ),
    },
    {
        "id": "faq-dscr",
        "region": "IN",
        "category": "banking",
        "question": "What DSCR do banks want?",
        "alternates": [
            "Debt service coverage",
            "Term loan DSCR",
            "Coverage ratio",
        ],
        "keywords": ["dscr", "debt service coverage", "coverage ratio"],
        "answer_template": (
            "**DSCR = (Net profit + Depreciation + Interest) ÷ (Interest + Loan principal due)**\n\n"
            "It answers: can the business service its debt from operating cash?\n\n"
            "### What banks actually use as a bar\n\n"
            "- **>1.5x** — comfortable, best interest rates\n"
            "- **1.25-1.5x** — lendable, market rate\n"
            "- **<1.25x** — red flag, either declined or high premium\n"
            "- **<1.0x** — loss-making coverage, no chance\n\n"
            "### Common mistake\n\n"
            "Founders compute DSCR on current profit and current debt only. "
            "Banks compute it on **projected profit through the loan tenure "
            "vs the full debt schedule**. A 3-year loan with big Y3 "
            "repayments needs Y3 profit, not Y1 profit.\n\n"
            "### Pragmatic bump\n\n"
            "If DSCR is borderline, ask for a moratorium (6-12 months "
            "principal holiday) or a longer tenure. Both improve DSCR on "
            "paper without changing the business. Works for banks because "
            "it reduces default risk; works for you because it buys time."
        ),
    },

    # ─── Pricing & customer economics ────────────────────────────────
    {
        "id": "faq-pricing-strategy",
        "region": "IN",
        "category": "pricing",
        "question": "How should I price my product?",
        "alternates": [
            "Pricing strategy",
            "How to set prices",
            "Value-based pricing",
        ],
        "keywords": ["pricing", "price", "set prices"],
        "answer_template": (
            "**Three pricing anchors. Most Indian MSMEs use #1 by default "
            "— it leaves the most money on the table.**\n\n"
            "1. **Cost-plus** (add margin to COGS). Easy, safe, and leaves "
            "money on the table. Use this as a FLOOR, not a target.\n"
            "2. **Competitor-based** (match market). Commoditises you. "
            "Use this as a REALITY CHECK, not a pricing strategy.\n"
            "3. **Value-based** (what the outcome is worth to the customer). "
            "Hardest to implement, biggest upside. This is where the "
            "margin expansion sits.\n\n"
            "### Test\n\n"
            "Ask your top 3 customers: \"If we stopped tomorrow, what "
            "would it cost you to replace us?\" That number is the upper "
            "bound on your pricing.\n\n"
            "### Practical move\n\n"
            "- Raise prices 3-5% annually as default, no negotiation\n"
            "- Segment your price list: small customers pay list, strategic "
            "accounts get volume discount, walk-ins pay premium\n"
            "- Never discount on price without taking something back "
            "(volume, tenure, exclusivity, payment terms)"
        ),
    },
    {
        "id": "faq-cac-ltv",
        "region": "IN",
        "category": "customer",
        "question": "What's a good LTV to CAC ratio?",
        "alternates": [
            "LTV CAC ratio",
            "Customer acquisition cost",
            "Unit economics",
        ],
        "keywords": ["ltv", "cac", "customer acquisition", "unit economics"],
        "answer_template": (
            "**The industry benchmark is LTV:CAC of 3:1.**\n\n"
            "- Below 1:1 = you're paying more to acquire than you'll ever earn. Bleeding.\n"
            "- 1:1 to 3:1 = marginal. Optimise before you scale spend.\n"
            "- 3:1+ = healthy. Push spend harder.\n"
            "- 5:1+ = you're probably under-investing in acquisition.\n\n"
            "### How to compute honestly\n\n"
            "- **CAC** = all sales + marketing cost ÷ new customers acquired in same period.\n"
            "  Include founder time at ₹2-3K/hour if they're selling.\n"
            "- **LTV** = average monthly gross profit per customer × average customer lifetime (months).\n"
            "  Gross profit, NOT revenue. Revenue LTV flatters the number by the cost you forgot.\n\n"
            "### Payback ceiling\n\n"
            "Aim for CAC payback <12 months for B2B and <6 months for B2C. "
            "Longer payback = more working-capital funding needed between "
            "spend and return."
        ),
    },
    {
        "id": "faq-churn-retention",
        "region": "IN",
        "category": "customer",
        "question": "How do I calculate customer churn?",
        "alternates": [
            "Churn rate",
            "Customer retention",
            "Attrition rate",
        ],
        "keywords": ["churn", "retention", "attrition"],
        "answer_template": (
            "**Annual churn = (customers lost in period ÷ customers at start of period) × 100**\n\n"
            "Monthly churn = same formula, monthly window. Compounds to "
            "annual via (1 − monthly churn)^12.\n\n"
            "### Benchmarks (Indian B2B MSME SaaS/services)\n\n"
            "- <5% annual — world-class, mostly accounts of your size\n"
            "- 5-15% annual — healthy\n"
            "- 15-30% annual — leaky bucket, look hard at onboarding + success\n"
            "- >30% annual — you're replacing the customer base yearly, growth is an illusion\n\n"
            "### Critical distinction\n\n"
            "**Logo churn** (customers leaving) vs **revenue churn** "
            "(₹ value lost). Revenue churn can be NEGATIVE if remaining "
            "customers expand spend — that's net-revenue-retention (NRR) "
            ">100%, which is the gold standard.\n\n"
            "### Next 90 days\n\n"
            "Identify your top 5 customers. What's their renewal date? "
            "Two quarters before that is when expansion conversations "
            "should start — not two weeks before."
        ),
    },

    # ─── Valuation & fundraise ───────────────────────────────────────
    {
        "id": "faq-valuation-msme",
        "region": "IN",
        "category": "valuation",
        "question": "How is my company valued?",
        "alternates": [
            "Company valuation",
            "Business worth",
            "Valuation multiples",
        ],
        "keywords": ["valuation", "value", "worth", "multiple"],
        "answer_template": (
            "**For Indian MSMEs in the ₹10-50 Cr band, three valuation "
            "methods dominate. Numbers vary by sector.**\n\n"
            "### 1. EBITDA multiple (most common for profitable businesses)\n\n"
            "- Services / tech: 6-12x LTM adjusted EBITDA\n"
            "- Manufacturing: 4-7x LTM adjusted EBITDA\n"
            "- Distribution / trading: 3-5x LTM adjusted EBITDA\n\n"
            "Note: these are on **adjusted** (QoE-normalised) EBITDA, "
            "not reported. A clean QoE workbook earns 1-2x multiple.\n\n"
            "### 2. Revenue multiple (for high-growth, thin-margin)\n\n"
            "- SaaS: 3-8x ARR (depends on NRR, growth rate)\n"
            "- High-growth services: 1-3x revenue\n\n"
            "### 3. DCF (for anyone with visibility)\n\n"
            "Discount projected free cash flow at 12-18% (risk-free + "
            "equity risk + company-specific premium). Most founders skip "
            "this because the projections are fragile — but it's the only "
            "method that reflects *what you will actually generate*.\n\n"
            "### Bottom line\n\n"
            "Real valuation is whatever a strategic buyer or investor "
            "believes. These multiples are the starting point for "
            "conversation, not the destination."
        ),
    },
    {
        "id": "faq-runway",
        "region": "IN",
        "category": "fundraise",
        "question": "How do I calculate my runway?",
        "alternates": [
            "Burn rate",
            "Months of runway",
            "Cash runway",
        ],
        "keywords": ["runway", "burn rate", "burn", "cash runway"],
        "answer_template": (
            "**Runway = current cash ÷ monthly net burn.**\n\n"
            "- **Monthly burn** = monthly expenses − monthly revenue. "
            "If positive (profitable), runway is infinite at this burn.\n"
            "- **Monthly cash burn** (distinct from operating burn) "
            "includes capex + debt repayment + tax payments timed to months.\n\n"
            "### Benchmarks\n\n"
            "- <6 months runway — emergency. Raise now, cut deep, or both.\n"
            "- 6-12 months — planning window. Start fundraise at the 9-month mark.\n"
            "- 12-18 months — comfortable. Use the space to grow revenue, not raise.\n"
            "- 18+ months — investors ask why you need the money.\n\n"
            "### Honest burn, not convenient burn\n\n"
            "Founders often compute burn on a \"good month\" — revenue "
            "peak, quiet on capex. Use **trailing-3-month average burn** "
            "for planning; it smooths noise."
        ),
    },

    # ─── Break-even & fundamentals ───────────────────────────────────
    {
        "id": "faq-breakeven",
        "region": "IN",
        "category": "profitability",
        "question": "What is my break-even revenue?",
        "alternates": [
            "Break even point",
            "BEP calculation",
            "Revenue needed to break even",
        ],
        "keywords": ["break-even", "breakeven", "bep"],
        "answer_template": (
            "**Break-even revenue = Fixed costs ÷ Contribution margin %.**\n\n"
            "Contribution margin % = (Revenue − Variable costs) ÷ Revenue.\n\n"
            "### Practical split from the TB\n\n"
            "- **Fixed costs**: salaries (mostly), rent, SaaS, insurance, "
            "depreciation, interest. Don't change with volume.\n"
            "- **Variable costs**: materials, logistics, commissions, "
            "production labour (if hourly/piece-rate). Scale with revenue.\n\n"
            "### Why it matters\n\n"
            "Every rupee of revenue above break-even drops almost entirely "
            "to the bottom line. That's why founders at break-even are "
            "often one quarter away from a strong margin — if they hold "
            "fixed costs flat.\n\n"
            "### Smart move\n\n"
            "Know your monthly break-even number. Communicate it to the "
            "team. Cross it by the 20th of the month and celebrate. "
            "Miss it for two months in a row and review before month three."
        ),
    },

    # ─── Fixed vs variable ────────────────────────────────────────────
    {
        "id": "faq-fixed-vs-variable",
        "region": "IN",
        "category": "profitability",
        "question": "How do I know my fixed vs variable costs?",
        "alternates": [
            "Cost classification",
            "Fixed and variable costs",
            "Which costs are fixed",
        ],
        "keywords": ["fixed cost", "variable cost", "semi-variable", "cost structure"],
        "answer_template": (
            "**The two-minute test for each expense line:**\n\n"
            "1. If revenue dropped to zero tomorrow, would I still pay it next month? → **Fixed.**\n"
            "2. Does it scale linearly (or near-linearly) with units sold? → **Variable.**\n"
            "3. Some of both? → **Semi-variable** (e.g. utilities with base + usage).\n\n"
            "### Typical Indian MSME classification\n\n"
            "| Line | Usually |\n"
            "| --- | --- |\n"
            "| Salaries (permanent) | Fixed |\n"
            "| Rent, insurance, software, audit fees | Fixed |\n"
            "| Raw material, packaging, freight | Variable |\n"
            "| Sales commission | Variable |\n"
            "| Electricity, telephone | Semi-variable |\n"
            "| Marketing | Discretionary (treat as variable) |\n\n"
            "### Why bother\n\n"
            "Without this split, you can't compute break-even, contribution "
            "margin, or the incremental profit from a new customer. With "
            "it, you can answer \"should I take this order at a discount?\" "
            "in 30 seconds instead of guessing."
        ),
    },

    # ─── Seasonality & demand planning ────────────────────────────────
    {
        "id": "faq-seasonal-business",
        "region": "IN",
        "category": "operations",
        "question": "How do I manage a seasonal business?",
        "alternates": [
            "Seasonal demand",
            "Peak and lean management",
            "Managing seasonality",
        ],
        "keywords": ["seasonal", "seasonality", "peak season", "lean season"],
        "answer_template": (
            "**Two disciplines make or break seasonal Indian MSMEs.**\n\n"
            "### 1. Lean-season working capital\n\n"
            "- Build cash buffer in peak covering 3-6 months of fixed "
            "costs. Don't assume next year's peak is guaranteed.\n"
            "- Negotiate a bank OD/CC line BEFORE you need it. Banks "
            "price risk higher when you're desperate.\n"
            "- Cut discretionary spend by 20-30% in lean months — that's "
            "where the cash comes from, not revenue growth.\n\n"
            "### 2. Peak-season readiness\n\n"
            "- Inventory build-up 60-90 days ahead\n"
            "- Contract temp labour / overtime policy 30 days ahead\n"
            "- Extend credit terms with suppliers before the rush\n\n"
            "### Accounting implication\n\n"
            "QoE acquirers normalise seasonal earnings. A profitable peak "
            "offset by a loss-making lean doesn't count twice — buyers "
            "average it. Don't claim peak numbers as \"run-rate\" in your "
            "pitch; it erodes credibility."
        ),
    },

    # ─── Export/import forex ──────────────────────────────────────────
    {
        "id": "faq-forex-hedging",
        "region": "IN",
        "category": "operations",
        "question": "Should I hedge my forex exposure?",
        "alternates": [
            "Forex hedging",
            "Currency risk",
            "Foreign exchange exposure",
        ],
        "keywords": ["forex", "fx", "hedging", "hedge", "currency risk"],
        "answer_template": (
            "**Rule of thumb: hedge if forex is >10% of revenue or costs, "
            "don't bother if <5%.**\n\n"
            "### Why hedge\n\n"
            "A 5% INR move against USD on a ₹5 Cr export business = "
            "₹25 L — often bigger than the year's profit. That's business "
            "risk, not market opportunism.\n\n"
            "### Instruments Indian MSMEs actually use\n\n"
            "- **Forward contracts** — lock the rate for a future date. "
            "Simplest, cheapest. Covers 90%+ of MSME needs.\n"
            "- **Currency options** — pay premium, keep upside. Worth it "
            "only if you have a view.\n"
            "- **Natural hedge** — match receivables in a currency with "
            "payables in the same. Free, but only works if you have both.\n\n"
            "### Don't\n\n"
            "- Don't hedge 100% — keep 30-40% unhedged to participate in "
            "favourable moves.\n"
            "- Don't treat hedging as speculation. Lock the margin on a "
            "known order; don't trade views on the rupee."
        ),
    },

    # ─── Margin of safety / decision discipline ──────────────────────
    {
        "id": "faq-when-to-hire",
        "region": "IN",
        "category": "hr",
        "question": "When should I hire my next employee?",
        "alternates": [
            "Hiring decision",
            "When to hire",
            "Next hire",
        ],
        "keywords": ["hire", "hiring", "new employee", "next hire"],
        "answer_template": (
            "**Hire when the role pays for itself within 12 months, and not a day before.**\n\n"
            "### The 12-month rule\n\n"
            "If a new sales hire costs ₹12 L annual CTC, they need to "
            "generate ₹1 L/month of incremental gross profit within their "
            "first year. If the honest answer is \"maybe in 18 months,\" "
            "the hire is premature.\n\n"
            "### Founder mistakes to avoid\n\n"
            "1. **Hiring out of overwhelm.** Fatigue isn't a business "
            "case. First try: kill the low-value tasks, automate, or "
            "delegate to an existing underutilised person.\n"
            "2. **Hiring before process.** A new person without documented "
            "process = 2 months of you training + their confusion. Write "
            "the SOP first, then hire.\n"
            "3. **Over-hiring in revenue functions.** Two average salespeople "
            "rarely beat one great one. Promote scarcity.\n\n"
            "### Smart sequence for SMBs\n\n"
            "First 5 hires: ops lead, accountant, best salesperson you can "
            "afford, finance partner (fractional CFO beats full-time), "
            "and your second-in-command. Everything else scales from there."
        ),
    },

    # ═══════════════════════════════════════════════════════════════════
    # US REGION FAQs (region="US") — served to US founders whose Profile
    # region is set to "US". Templates use USD ($K/$M), US regulatory
    # framework (GAAP / ASC), and US tax vocabulary. A subset of the
    # Indian FAQ bank, prioritising the highest-frequency founder
    # questions + US-specific topics that don't exist in the Indian set.
    # ═══════════════════════════════════════════════════════════════════

    # ─── Revenue ────────────────────────────────────────────────────────
    {
        "id": "faq-us-revenue-total",
        "region": "US",
        "category": "revenue",
        "question": "What is my total revenue?",
        "alternates": [
            "How much revenue did we make",
            "Show me the top line",
            "What's the total sales number",
            "Revenue summary",
        ],
        "keywords": ["revenue", "sales", "top line", "turnover"],
        "answer_template": (
            "**Total revenue: {revenue_fmt}.**\n\n"
            "- Net income: **{net_income_fmt}** "
            "({net_margin}% margin — {margin_verdict})\n"
            "- Total expenses: {expenses_fmt}\n"
            "- Biggest revenue line: **{top_revenue_name}** "
            "at {top_revenue_amount_fmt}\n\n"
            "### So what\n\n"
            "Your headline margin is {net_margin}%. "
            "{margin_action}"
        ),
    },

    # ─── Expenses ───────────────────────────────────────────────────────
    {
        "id": "faq-us-top-expenses",
        "region": "US",
        "category": "expenses",
        "question": "What are my top expenses?",
        "alternates": [
            "Where is my money going",
            "Biggest cost centers",
            "What am I spending on",
            "Where do I spend the most",
        ],
        "keywords": ["expense", "cost", "spend", "top", "biggest"],
        "answer_template": (
            "**{top_expense_name} is your biggest line at {top_expense_fmt} "
            "— {top_expense_pct}% of total spend.**\n\n"
            "Top three cost centers:\n\n"
            "{top_3_expenses_md}\n\n"
            "### So what\n\n"
            "These three lines together are {top_3_pct}% of total expenses. "
            "Any cost-reduction program should start here — a 5% trim across "
            "just the top three saves **{top_3_savings_fmt}** a year."
        ),
    },
    {
        "id": "faq-us-reduce-costs",
        "region": "US",
        "category": "expenses",
        "question": "How can I reduce my costs?",
        "alternates": [
            "How to cut expenses",
            "Where can I save money",
            "Cost reduction ideas",
            "How to improve profitability",
        ],
        "keywords": ["reduce", "cut", "save", "lower", "optimize", "trim"],
        "answer_template": (
            "**Three levers, ranked by impact on your books:**\n\n"
            "1. **{top_expense_name}** ({top_expense_fmt}, "
            "{top_expense_pct}% of total). Even a 5% renegotiation with "
            "your top vendor saves **{top_expense_5pct_fmt}** a year.\n"
            "2. **{second_expense_name}** ({second_expense_fmt}). Often "
            "discretionary — ask what's actually driving it, not what "
            "the ledger says.\n"
            "3. **Working capital tightening** — current WC is "
            "{working_capital_fmt}. "
            "{wc_action}\n\n"
            "### Next 90 days\n\n"
            "- Week 1-2: RFP your top-3 vendor contracts\n"
            "- Week 3-4: Freeze hiring in non-revenue functions\n"
            "- Month 2-3: Rebuild the budget bottom-up, not last-year-plus-inflation"
        ),
    },

    # ─── Financial health ───────────────────────────────────────────────
    {
        "id": "faq-us-financial-health",
        "region": "US",
        "category": "ratios",
        "question": "How is my financial health?",
        "alternates": [
            "Am I healthy",
            "Give me a health check",
            "Financial position summary",
            "Key ratios",
        ],
        "keywords": ["health", "ratio", "position", "liquidity", "solvency"],
        "answer_template": (
            "**Headline: {health_verdict}.**\n\n"
            "| Metric | Your value | Benchmark |\n"
            "| --- | --- | --- |\n"
            "| Current ratio | {current_ratio}x | 1.5-2.0x |\n"
            "| Debt-to-equity | {debt_to_equity}x | < 1.5x |\n"
            "| Gross margin | {gross_margin}% | 30%+ |\n"
            "| Net margin | {net_margin}% | 10%+ |\n"
            "| Working capital | {working_capital_fmt} | Positive |\n\n"
            "### So what\n\n"
            "{health_action}"
        ),
    },

    # ─── Risk ────────────────────────────────────────────────────────────
    {
        "id": "faq-us-top-risks",
        "region": "US",
        "category": "risk",
        "question": "What are my biggest risks?",
        "alternates": [
            "Red flags in my business",
            "What should I worry about",
            "Where is the risk",
            "Top risks",
        ],
        "keywords": ["risk", "danger", "threat", "worry", "concern", "red flag"],
        "answer_template": (
            "**Ranked by how badly they'd hit cash if left alone:**\n\n"
            "{risks_md}\n\n"
            "### Next 90 days\n\n"
            "Pick the top 1-2 and treat them as quarterly board agenda items. "
            "Everything else can wait."
        ),
    },

    # ─── Projection ──────────────────────────────────────────────────────
    {
        "id": "faq-us-project-next-year",
        "region": "US",
        "category": "projection",
        "question": "What will my financials look like next year?",
        "alternates": [
            "Project next year",
            "Forecast for next year",
            "What will we make next year",
            "FY projection",
        ],
        "keywords": ["project", "forecast", "next year", "next fy", "predict"],
        "answer_template": (
            "**Simple 3-scenario projection from today's books:**\n\n"
            "| Scenario | Revenue | Expenses | Net |\n"
            "| --- | --- | --- | --- |\n"
            "| Conservative (+5% rev, +3% cost) | {proj_conservative_rev_fmt} | "
            "{proj_conservative_exp_fmt} | {proj_conservative_net_fmt} |\n"
            "| Base (+15% rev, +8% cost) | {proj_base_rev_fmt} | "
            "{proj_base_exp_fmt} | {proj_base_net_fmt} |\n"
            "| Aggressive (+25% rev, +13% cost) | {proj_aggressive_rev_fmt} | "
            "{proj_aggressive_exp_fmt} | {proj_aggressive_net_fmt} |\n\n"
            "### Caveats\n\n"
            "This is extrapolation from a single TB. For an investor-grade "
            "forecast I'd need monthly data, seasonality, and your planned "
            "capex. If you have those, upload on the Analysis page and "
            "we'll redo this with real drivers.\n\n"
            "### Next 90 days\n\n"
            "Pick the scenario you think is realistic. Commit to a month-end "
            "where you hit the run-rate implied by that scenario. Review "
            "variance monthly."
        ),
    },

    # ─── Working capital ─────────────────────────────────────────────────
    {
        "id": "faq-us-wc-cycle",
        "region": "US",
        "category": "working_capital",
        "question": "What's my working capital cycle?",
        "alternates": [
            "Cash conversion cycle",
            "WC cycle formula",
            "Operating cycle",
            "DSO DPO DIO",
        ],
        "keywords": ["working capital cycle", "cash conversion", "operating cycle", "dso", "dpo"],
        "answer_template": (
            "**Cash Conversion Cycle (CCC) = DSO + DIO − DPO.**\n\n"
            "It measures how many days cash is tied up between paying "
            "suppliers and collecting from customers.\n\n"
            "### What each lever does\n\n"
            "- **DSO ↓** — collect faster. Every 10 days = ~2.7% of revenue as cash.\n"
            "- **DIO ↓** — hold less inventory. Each 10 days = ~1-2% of revenue.\n"
            "- **DPO ↑** — pay suppliers slower. Gains match DSO days.\n\n"
            "### Benchmarks for US SMB\n\n"
            "- Manufacturing / distribution: 60-120 days\n"
            "- B2B services: 30-60 days\n"
            "- SaaS / subscription: 15-45 days\n\n"
            "### Strategic move\n\n"
            "A 30-day improvement on a $5M business is $400K in freed-up "
            "cash. Usually cheaper than a credit line or equity raise. "
            "Start with DSO discipline — it's the most controllable lever."
        ),
    },

    # ─── Pricing ────────────────────────────────────────────────────────
    {
        "id": "faq-us-pricing-strategy",
        "region": "US",
        "category": "pricing",
        "question": "How should I price my product?",
        "alternates": [
            "Pricing strategy",
            "How to set prices",
            "Value-based pricing",
        ],
        "keywords": ["pricing", "price", "set prices"],
        "answer_template": (
            "**Three pricing anchors, in priority order for margin expansion:**\n\n"
            "1. **Value-based** (what the outcome is worth to the customer). "
            "Biggest upside. Hardest to implement. Test: ask your top 3 "
            "customers *\"If we stopped tomorrow, what would it cost you "
            "to replace us?\"* That number is your pricing ceiling.\n"
            "2. **Competitor-based** (match market). Commoditizes you. "
            "Use as reality check, not strategy.\n"
            "3. **Cost-plus** (add margin to COGS). Safe, leaves money "
            "on the table. Use as FLOOR, not target.\n\n"
            "### Practical moves\n\n"
            "- Raise prices 3-5% annually as default, no negotiation\n"
            "- Segment: small customers pay list, strategic accounts get "
            "volume discount, walk-ins pay premium\n"
            "- Never discount on price without taking something back "
            "(volume commit, tenure, payment terms)"
        ),
    },

    # ─── Unit economics ─────────────────────────────────────────────────
    {
        "id": "faq-us-cac-ltv",
        "region": "US",
        "category": "customer",
        "question": "What's a good LTV to CAC ratio?",
        "alternates": [
            "LTV CAC ratio",
            "Customer acquisition cost",
            "Unit economics",
            "CAC payback",
        ],
        "keywords": ["ltv", "cac", "customer acquisition", "unit economics"],
        "answer_template": (
            "**Industry benchmark: LTV:CAC of 3:1.**\n\n"
            "- Below 1:1 = you pay more to acquire than you earn. Bleeding.\n"
            "- 1:1 to 3:1 = marginal. Optimize before you scale spend.\n"
            "- 3:1+ = healthy. Push spend harder.\n"
            "- 5:1+ = likely under-investing in acquisition.\n\n"
            "### How to compute honestly\n\n"
            "- **CAC** = all S&M cost ÷ new customers acquired in the same period. "
            "Include founder time at $300-500/hour if they sell.\n"
            "- **LTV** = avg monthly gross profit per customer × avg lifetime "
            "(months). Gross profit, NOT revenue. Revenue LTV flatters.\n\n"
            "### Payback ceiling\n\n"
            "Aim for CAC payback <12 months for B2B, <6 months for B2C."
        ),
    },

    # ─── Valuation ──────────────────────────────────────────────────────
    {
        "id": "faq-us-valuation",
        "region": "US",
        "category": "valuation",
        "question": "How is my company valued?",
        "alternates": [
            "Company valuation",
            "Business worth",
            "Valuation multiples",
            "What multiple do we trade at",
        ],
        "keywords": ["valuation", "value", "worth", "multiple"],
        "answer_template": (
            "**For US SMBs in the $1-10M revenue band, three valuation "
            "methods dominate. Multiples vary by sector.**\n\n"
            "### 1. EBITDA multiple (most common for profitable)\n\n"
            "- Tech / SaaS: 8-15x adjusted EBITDA\n"
            "- Services: 5-10x adjusted EBITDA\n"
            "- Manufacturing / distribution: 4-7x adjusted EBITDA\n\n"
            "Note: these are on **adjusted** (QoE-normalized) EBITDA, "
            "not reported. A clean QoE workbook earns 1-2x multiple.\n\n"
            "### 2. Revenue multiple (for growth / thin margin)\n\n"
            "- SaaS: 3-8x ARR (depends on NRR + growth rate)\n"
            "- High-growth services: 1-3x revenue\n\n"
            "### 3. DCF (for anyone with visibility)\n\n"
            "Discount projected free cash flow at 10-15% (risk-free + "
            "equity risk + company-specific premium).\n\n"
            "### Bottom line\n\n"
            "Real valuation is what a strategic buyer or investor believes. "
            "These multiples anchor the conversation, not the destination."
        ),
    },

    # ─── Runway ─────────────────────────────────────────────────────────
    {
        "id": "faq-us-runway",
        "region": "US",
        "category": "fundraise",
        "question": "How do I calculate my runway?",
        "alternates": [
            "Burn rate",
            "Months of runway",
            "Cash runway",
        ],
        "keywords": ["runway", "burn rate", "burn", "cash runway"],
        "answer_template": (
            "**Runway = current cash ÷ monthly net burn.**\n\n"
            "- **Monthly burn** = monthly expenses − monthly revenue. "
            "Positive (profitable) means infinite runway at this burn.\n"
            "- **Cash burn** (distinct from operating burn) includes capex "
            "+ debt service + estimated tax payments timed to months.\n\n"
            "### Benchmarks\n\n"
            "- <6 months runway — emergency. Raise now, cut deep, or both.\n"
            "- 6-12 months — planning window. Start fundraise by month 9.\n"
            "- 12-18 months — comfortable. Use the space to grow ARR, not raise.\n"
            "- 18+ months — investors ask why you need the money.\n\n"
            "### Honest burn\n\n"
            "Use **trailing-3-month average** for planning. A good month "
            "isn't the baseline — it's an outlier."
        ),
    },

    # ─── US-specific regulatory ─────────────────────────────────────────
    {
        "id": "faq-us-withholding-basics",
        "region": "US",
        "category": "tax",
        "question": "What withholding taxes do I need to handle?",
        "alternates": [
            "Payroll tax withholding",
            "Employer tax obligations",
            "1099 vs W-2 withholding",
            "Federal employment tax",
        ],
        "keywords": ["withholding", "payroll tax", "employment tax", "941", "w-2", "w2", "1099"],
        "answer_template": (
            "**Federal withholding obligations for US employers:**\n\n"
            "- **W-2 employees**: withhold federal income tax (per W-4), "
            "Social Security (6.2% up to wage base), Medicare (1.45%), "
            "plus employer match on FICA.\n"
            "- **FUTA**: 6% on first $7K wages per employee (usually "
            "offset by state credit to 0.6% effective).\n"
            "- **State income tax**: per state rules — some have none (TX, FL, WA), "
            "others up to ~13% top marginal (CA).\n"
            "- **1099 contractors**: no withholding required from you, "
            "BUT issue 1099-NEC if you pay any single contractor ≥$600/year.\n\n"
            "### Deposit calendar\n\n"
            "- Monthly depositors: 15th of following month\n"
            "- Semi-weekly depositors: Wed/Fri depending on payday\n"
            "- Quarterly Form 941 filing\n"
            "- Annual Form 940 (FUTA) + W-2 / 1099 by Jan 31\n\n"
            "### Non-negotiables\n\n"
            "Trust-fund taxes (withheld but not deposited) carry a 100% "
            "penalty personally assessable to officers. Never late on these."
        ),
    },
    {
        "id": "faq-us-estimated-tax",
        "region": "US",
        "category": "tax",
        "question": "When do I pay estimated taxes?",
        "alternates": [
            "Quarterly estimated tax",
            "Estimated tax deadlines",
            "Form 1040-ES",
            "1120-W",
        ],
        "keywords": ["estimated tax", "quarterly tax", "1040-es", "1120-w"],
        "answer_template": (
            "**If federal tax liability will exceed $500 for a corp "
            "(or $1,000 for a founder on individual basis), estimated "
            "taxes are mandatory.**\n\n"
            "### Quarterly deadlines (federal)\n\n"
            "| Due date | Covers |\n"
            "| --- | --- |\n"
            "| April 15 | Jan 1 – Mar 31 |\n"
            "| June 15 | Apr 1 – May 31 |\n"
            "| September 15 | Jun 1 – Aug 31 |\n"
            "| January 15 (next year) | Sep 1 – Dec 31 |\n\n"
            "### Safe harbor\n\n"
            "Pay the LESSER of:\n"
            "- 100% of last year's tax (110% if AGI > $150K), OR\n"
            "- 90% of current year's tax\n\n"
            "Miss the safe harbor and IRS charges underpayment penalty "
            "(short-term federal rate + 3%, updated quarterly).\n\n"
            "### State\n\n"
            "Most states mirror the federal calendar with their own "
            "quarterlies. CA adds a June 15 \"prepayment\" quirk. "
            "Check your state's Department of Revenue."
        ),
    },
    {
        "id": "faq-us-rd-credit",
        "region": "US",
        "category": "tax",
        "question": "Can I claim the R&D tax credit?",
        "alternates": [
            "R&D credit",
            "Research and development tax credit",
            "Section 174",
            "Payroll tax offset",
        ],
        "keywords": ["r&d credit", "research credit", "section 174", "section 41"],
        "answer_template": (
            "**Section 41 R&D credit — usually yes if you're writing software, "
            "engineering product, or doing experimental development.**\n\n"
            "### Qualifying activities\n\n"
            "- Software development (product, not internal IT)\n"
            "- Engineering design & prototyping\n"
            "- Formula / process improvement\n"
            "- Technical uncertainty resolution\n\n"
            "### Qualifying costs\n\n"
            "- W-2 wages of people doing QRE (qualified research expense) work\n"
            "- 65% of contractor costs on qualifying work\n"
            "- Supplies consumed in research\n"
            "- Cloud compute (under recent IRS guidance)\n\n"
            "### Payroll offset (big for early-stage)\n\n"
            "If under $5M gross receipts AND less than 5 years old, you "
            "can offset up to $500K of the R&D credit against PAYROLL tax "
            "(Social Security employer portion) instead of waiting to "
            "profit. Cash-positive immediately.\n\n"
            "### Section 174 warning (2022+)\n\n"
            "TCJA requires amortizing R&D expenses over 5 years (15 for "
            "foreign work). This HURTS cash taxes. Plan for this if your "
            "R&D spend is material; it can push a tech company into a "
            "tax bill even while accounting losses.\n\n"
            "### Next step\n\n"
            "Get a credit-specialist CPA to quantify. Studies typically "
            "cost $5-15K and recover 10-50x in credit value for a company "
            "with $500K+ qualifying spend."
        ),
    },
    {
        "id": "faq-us-c-corp-vs-llc",
        "region": "US",
        "category": "legal",
        "question": "Should I be a C-Corp or LLC?",
        "alternates": [
            "C-corp vs LLC",
            "Entity structure",
            "Delaware C-Corp",
            "S-Corp vs LLC",
        ],
        "keywords": ["c-corp", "c corp", "llc", "s-corp", "s corp", "delaware", "entity"],
        "answer_template": (
            "**The right answer depends on what you want from your business:**\n\n"
            "### C-Corp (usually Delaware)\n\n"
            "- **Fundraising**: VCs require it. They can't easily invest in LLCs.\n"
            "- **QSBS benefit**: hold 5+ years and up to $10M of gain can be "
            "federal-tax-free under Section 1202. Huge for founders at exit.\n"
            "- **Employee equity**: clean ISO/NSO stock option grants.\n"
            "- **Cost**: double taxation on profits (corp level + dividend), "
            "so bad for cash-distributing businesses. Franchise tax in DE.\n\n"
            "### LLC (taxed as partnership or S-corp)\n\n"
            "- **Pass-through taxation**: profits taxed once at the owner level\n"
            "- **Flexibility**: customizable operating agreement, no board required\n"
            "- **Distribute cash freely**: no double tax\n"
            "- **Downsides**: can't take VC money cleanly, phantom income on "
            "undistributed profits, less standard for M&A\n\n"
            "### Rule of thumb for SMBs\n\n"
            "- Bootstrapping a profitable services business → **LLC taxed as S-corp**\n"
            "- Raising venture → **Delaware C-Corp** from day one\n"
            "- Need to convert later? Doable but costs $10-30K in legal + tax work"
        ),
    },
]


def all_faqs() -> list[dict]:
    """Return every seed FAQ. Added for future extensibility — we could
    load user-submitted FAQs from DB here and merge with seeds."""
    return SEED_FAQS


def faqs_by_category() -> dict[str, list[dict]]:
    buckets: dict[str, list[dict]] = {}
    for f in SEED_FAQS:
        buckets.setdefault(f["category"], []).append(f)
    return buckets
