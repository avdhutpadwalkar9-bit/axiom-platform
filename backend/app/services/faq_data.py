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
