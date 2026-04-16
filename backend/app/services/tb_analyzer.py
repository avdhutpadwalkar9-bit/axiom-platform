"""
Trial Balance Analyzer — Reviews TB data against Indian Accounting Standards (Ind AS)
Generates financial analysis, identifies issues, and produces actionable insights.
"""

import re
from dataclasses import dataclass, field


@dataclass
class TBEntry:
    account_code: str
    account_name: str
    debit: float
    credit: float
    group: str = ""
    schedule: str = ""


@dataclass
class AnalysisResult:
    # Summary
    total_debit: float = 0
    total_credit: float = 0
    is_balanced: bool = False
    variance: float = 0

    # Classified groups
    assets: list = field(default_factory=list)
    liabilities: list = field(default_factory=list)
    equity: list = field(default_factory=list)
    revenue: list = field(default_factory=list)
    expenses: list = field(default_factory=list)

    # Financial statements
    total_assets: float = 0
    total_liabilities: float = 0
    total_equity: float = 0
    total_revenue: float = 0
    total_expenses: float = 0
    net_income: float = 0

    # Ratios — legacy flat numbers, kept for backward compatibility
    current_ratio: float = 0
    debt_to_equity: float = 0
    gross_margin: float = 0
    net_margin: float = 0
    return_on_equity: float = 0
    working_capital: float = 0

    # Ratios — declarative metadata. Each ratio is either
    #   {"value": <number>, "status": "ok"}
    # or
    #   {"value": 0.0, "status": "not_computable", "reason": "<plain-English>"}
    # The dashboard uses this to render "—" + a tooltip instead of a silent 0.
    ratios_meta: dict = field(default_factory=dict)

    # Completeness — how many ratios actually computed vs. total tried.
    completeness: dict = field(default_factory=dict)

    # Which kind of file produced this analysis. Defaults to "TB" because
    # that's the only path today. Downstream parsers (audited FS, GL, P&L,
    # MIS) will override this.
    input_mode: str = "TB"

    # Ind AS observations
    ind_as_observations: list = field(default_factory=list)

    # AI questions (areas of confusion)
    ai_questions: list = field(default_factory=list)

    # Actionable insights
    insights: list = field(default_factory=list)

    # Warnings
    warnings: list = field(default_factory=list)


# Account classification patterns for Indian Chart of Accounts
CLASSIFICATION_RULES = {
    "assets": {
        "current_assets": [
            r"cash", r"bank", r"trade\s*receiv", r"sundry\s*debtor", r"inventor",
            r"stock", r"prepaid", r"advance", r"deposit", r"loan.*given",
            r"short.*term.*invest", r"tds\s*receiv", r"gst\s*input", r"input\s*tax",
            r"accrued.*income",
        ],
        "non_current_assets": [
            r"fixed\s*asset", r"property", r"plant", r"equipment", r"furniture",
            r"vehicle", r"computer", r"building", r"land", r"intangible",
            r"goodwill", r"patent", r"trademark", r"copyright", r"software",
            r"capital.*wip", r"long.*term.*invest", r"depreci",
        ],
    },
    "liabilities": {
        "current_liabilities": [
            r"trade\s*payab", r"sundry\s*creditor", r"outstanding", r"accrued",
            r"provision.*tax", r"gst\s*payab", r"gst\s*output", r"tds\s*payab",
            r"salary\s*payab", r"short.*term.*borrow", r"current.*portion",
            r"unearned", r"deferred\s*rev", r"advance.*from.*customer",
        ],
        "non_current_liabilities": [
            r"long.*term.*loan", r"long.*term.*borrow", r"debenture",
            r"secured\s*loan", r"unsecured\s*loan", r"term\s*loan",
        ],
    },
    "equity": [
        r"capital", r"share\s*capital", r"reserve", r"surplus", r"retain",
        r"partner.*capital", r"proprietor", r"drawing", r"dividend",
        r"premium", r"general\s*reserve",
    ],
    "revenue": [
        r"sale", r"revenue", r"income", r"fee.*earned", r"commission.*earned",
        r"service.*income", r"interest.*income", r"rental.*income",
        r"discount.*received", r"other.*income", r"profit.*on",
    ],
    "expenses": [
        r"purchase", r"cost.*of.*good", r"cogs", r"salary", r"wage", r"rent",
        r"electricity", r"telephone", r"insurance", r"depreciation", r"amortiz",
        r"interest.*expense", r"bank.*charge", r"commission.*paid", r"travel",
        r"conveyance", r"printing", r"stationery", r"repair", r"maintenance",
        r"advertisement", r"marketing", r"legal", r"professional.*fee",
        r"audit.*fee", r"bad.*debt", r"loss.*on", r"discount.*allowed",
        r"freight", r"carriage", r"packing", r"gst.*expense", r"tax.*expense",
        r"provision.*for", r"office.*expense", r"misc.*expense",
        r"software.*expense", r"cloud", r"hosting", r"subscription",
    ],
}


def classify_account(account_name: str, group_hint: str = "") -> tuple[str, str]:
    """Classify an account into group and sub-group.

    group_hint: from Zoho/Tally section headers like "Assets", "Income", "Expense", "Liabilities", "Equities"
    """
    name_lower = account_name.lower().strip()
    hint_lower = group_hint.lower().strip()

    # If we have a group hint from the accounting software, trust it first
    if hint_lower:
        if hint_lower in ("income", "revenue"):
            return "revenue", "revenue"
        if hint_lower in ("expense", "expenses"):
            return "expenses", "expenses"
        if hint_lower in ("assets", "asset"):
            # Sub-classify assets
            for sub, patterns in CLASSIFICATION_RULES["assets"].items():
                for pattern in patterns:
                    if re.search(pattern, name_lower):
                        return "assets", sub
            return "assets", "current_assets"  # default to current
        if hint_lower in ("liabilities", "liability"):
            for sub, patterns in CLASSIFICATION_RULES["liabilities"].items():
                for pattern in patterns:
                    if re.search(pattern, name_lower):
                        return "liabilities", sub
            return "liabilities", "current_liabilities"
        if hint_lower in ("equities", "equity"):
            return "equity", "equity"

    # Fallback: pattern-based classification
    for pattern in CLASSIFICATION_RULES["equity"]:
        if re.search(pattern, name_lower):
            return "equity", "equity"

    for sub, patterns in CLASSIFICATION_RULES["assets"].items():
        for pattern in patterns:
            if re.search(pattern, name_lower):
                return "assets", sub

    for sub, patterns in CLASSIFICATION_RULES["liabilities"].items():
        for pattern in patterns:
            if re.search(pattern, name_lower):
                return "liabilities", sub

    for pattern in CLASSIFICATION_RULES["revenue"]:
        if re.search(pattern, name_lower):
            return "revenue", "revenue"

    for pattern in CLASSIFICATION_RULES["expenses"]:
        if re.search(pattern, name_lower):
            return "expenses", "expenses"

    return "unclassified", "unclassified"


def analyze_trial_balance(entries: list[dict]) -> dict:
    """
    Analyze a trial balance and produce comprehensive financial analysis.

    entries: list of dicts with keys: account_name, debit, credit
    Optional keys: account_code, group
    """
    result = AnalysisResult()

    # Parse and classify entries
    classified_entries = []
    unclassified = []

    for entry in entries:
        name = entry.get("account_name", "").strip()
        debit = float(entry.get("debit", 0) or 0)
        credit = float(entry.get("credit", 0) or 0)
        code = entry.get("account_code", "")
        group_hint = entry.get("group", "")

        group, sub_group = classify_account(name, group_hint)

        tb_entry = TBEntry(
            account_code=code,
            account_name=name,
            debit=debit,
            credit=credit,
            group=group,
            schedule=sub_group,
        )

        if group == "unclassified":
            unclassified.append(tb_entry)
        classified_entries.append(tb_entry)

    # Calculate totals
    result.total_debit = sum(e.debit for e in classified_entries)
    result.total_credit = sum(e.credit for e in classified_entries)
    result.variance = abs(result.total_debit - result.total_credit)
    result.is_balanced = result.variance < 0.01

    # Group by classification
    for e in classified_entries:
        net = e.debit - e.credit
        item = {"name": e.account_name, "code": e.account_code, "debit": e.debit, "credit": e.credit, "net": net, "sub_group": e.schedule}

        if e.group == "assets":
            result.assets.append(item)
        elif e.group == "liabilities":
            result.liabilities.append(item)
        elif e.group == "equity":
            result.equity.append(item)
        elif e.group == "revenue":
            result.revenue.append(item)
        elif e.group == "expenses":
            result.expenses.append(item)

    # Calculate statement totals
    result.total_assets = sum(i["debit"] - i["credit"] for i in result.assets)
    result.total_liabilities = sum(i["credit"] - i["debit"] for i in result.liabilities)
    result.total_equity = sum(i["credit"] - i["debit"] for i in result.equity)
    result.total_revenue = sum(i["credit"] - i["debit"] for i in result.revenue)
    result.total_expenses = sum(i["debit"] - i["credit"] for i in result.expenses)
    result.net_income = result.total_revenue - result.total_expenses

    # Current assets and liabilities for ratios
    current_assets = sum(
        i["debit"] - i["credit"] for i in result.assets if i["sub_group"] == "current_assets"
    )
    current_liabilities = sum(
        i["credit"] - i["debit"] for i in result.liabilities if i["sub_group"] == "current_liabilities"
    )

    # Financial ratios — declarative computation with NotComputable reasons
    # so the dashboard can show "—" + tooltip instead of a silent 0.
    cogs = sum(
        i["debit"] - i["credit"] for i in result.expenses
        if re.search(r"purchase|cost.*good|cogs", i["name"].lower())
    )
    result.ratios_meta = _compute_ratios(
        current_assets=current_assets,
        current_liabilities=current_liabilities,
        total_liabilities=result.total_liabilities,
        total_equity=result.total_equity,
        total_revenue=result.total_revenue,
        net_income=result.net_income,
        cogs=cogs,
    )

    # Mirror computed values into the legacy flat fields so existing callers
    # (analysis page, PDF export, etc.) keep working unchanged. Not-computable
    # ratios mirror as 0.0 — the legacy behaviour.
    result.current_ratio = result.ratios_meta["current_ratio"]["value"]
    result.debt_to_equity = result.ratios_meta["debt_to_equity"]["value"]
    result.return_on_equity = result.ratios_meta["return_on_equity"]["value"]
    result.net_margin = result.ratios_meta["net_margin"]["value"]
    result.gross_margin = result.ratios_meta["gross_margin"]["value"]
    result.working_capital = result.ratios_meta["working_capital"]["value"]

    # Completeness: how many ratios actually computed (for the "5 of 6 ratios"
    # chip on the dashboard).
    computed = sum(
        1 for m in result.ratios_meta.values() if m["status"] == "ok"
    )
    total = len(result.ratios_meta)
    result.completeness = {
        "computed": computed,
        "total": total,
        "pct": round(computed / total * 100, 0) if total else 0,
    }

    # Ind AS Observations
    _check_ind_as(result, classified_entries)

    # Generate AI Questions
    _generate_questions(result, classified_entries, unclassified)

    # Generate Insights
    _generate_insights(result)

    # Warnings
    if not result.is_balanced:
        result.warnings.append({
            "severity": "critical",
            "title": "Trial Balance Does Not Tally",
            "detail": f"Debit total ({result.total_debit:,.2f}) does not match Credit total ({result.total_credit:,.2f}). Variance: {result.variance:,.2f}",
        })

    if len(unclassified) > 0:
        result.warnings.append({
            "severity": "warning",
            "title": f"{len(unclassified)} Accounts Could Not Be Classified",
            "detail": f"The following accounts need manual classification: {', '.join(u.account_name for u in unclassified[:5])}",
        })

    return _to_dict(result)


def _check_ind_as(result: AnalysisResult, entries: list[TBEntry]):
    """Check for Ind AS compliance observations."""
    obs = result.ind_as_observations

    # Check for depreciation
    has_fixed_assets = any(e.schedule == "non_current_assets" and not re.search(r"depreci", e.account_name.lower()) for e in entries)
    has_depreciation = any(re.search(r"depreci", e.account_name.lower()) for e in entries)
    if has_fixed_assets and not has_depreciation:
        obs.append({
            "standard": "Ind AS 16 (Property, Plant & Equipment)",
            "observation": "Fixed assets found but no depreciation account detected. Verify that depreciation is being charged as per the useful life prescribed under Schedule II of Companies Act, 2013.",
            "severity": "high",
        })

    # Check for deferred tax
    has_deferred_tax = any(re.search(r"deferred.*tax", e.account_name.lower()) for e in entries)
    if not has_deferred_tax and result.total_revenue > 500000:
        obs.append({
            "standard": "Ind AS 12 (Income Taxes)",
            "observation": "No deferred tax asset/liability account found. Companies should recognize deferred tax for temporary differences between book and tax values.",
            "severity": "medium",
        })

    # Check revenue recognition
    has_deferred_revenue = any(re.search(r"deferred.*rev|unearned.*rev|advance.*customer", e.account_name.lower()) for e in entries)
    if not has_deferred_revenue and result.total_revenue > 1000000:
        obs.append({
            "standard": "Ind AS 115 (Revenue from Contracts)",
            "observation": "No deferred/unearned revenue account found. If revenue is collected in advance or contracts span multiple periods, revenue recognition per Ind AS 115 performance obligation criteria should be evaluated.",
            "severity": "medium",
        })

    # Check for provision accounts
    has_provisions = any(re.search(r"provision", e.account_name.lower()) for e in entries)
    if not has_provisions:
        obs.append({
            "standard": "Ind AS 37 (Provisions & Contingencies)",
            "observation": "No provision accounts detected. Evaluate whether provisions for gratuity, leave encashment, warranties, or legal claims need to be recognized.",
            "severity": "low",
        })

    # Check for related party disclosures
    has_related_party = any(re.search(r"related\s*party|director.*loan|partner.*loan", e.account_name.lower()) for e in entries)
    if has_related_party:
        obs.append({
            "standard": "Ind AS 24 (Related Party Disclosures)",
            "observation": "Related party transactions detected. Ensure proper disclosure of nature, amounts, and terms as required under Ind AS 24.",
            "severity": "medium",
        })

    # GST compliance check
    has_gst_input = any(re.search(r"gst.*input|input.*tax|igst|cgst|sgst", e.account_name.lower()) for e in entries)
    has_gst_output = any(re.search(r"gst.*output|output.*tax", e.account_name.lower()) for e in entries)
    if has_gst_input and not has_gst_output:
        obs.append({
            "standard": "GST Compliance",
            "observation": "GST Input Credit account found but no GST Output/Liability account. Verify GST is being properly collected on sales and reconcile GSTR-3B with books.",
            "severity": "high",
        })

    if not obs:
        obs.append({
            "standard": "General",
            "observation": "No significant Ind AS deviations detected in the trial balance structure. A detailed review of supporting schedules is recommended.",
            "severity": "low",
        })


def _generate_questions(result: AnalysisResult, entries: list[TBEntry], unclassified: list[TBEntry]):
    """Generate top 5 DATA-DRIVEN clarifying questions based on anomalies found."""
    questions = result.ai_questions

    # 1. Check for SUSPENSE accounts — huge red flag
    suspense_entries = [e for e in entries if re.search(r"suspense|sundry|clearing", e.account_name.lower())]
    suspense_total = sum(max(e.debit, e.credit) for e in suspense_entries)
    if suspense_total > 0:
        big_suspense = [e for e in suspense_entries if max(e.debit, e.credit) > 100000]
        names = ", ".join(f"{e.account_name} (₹{max(e.debit, e.credit):,.0f})" for e in big_suspense[:3])
        questions.append({
            "question": f"We detected significant balances in suspense/clearing accounts: {names}. What is the nature of these balances? Are they pending reconciliation, unallocated receipts, or inter-company transfers that need to be cleared?",
            "reason": "Large suspense balances distort the true financial position and may indicate unreconciled transactions or potential misstatements.",
        })

    # 2. Check for ZERO revenue — anomaly
    if result.total_revenue == 0 and result.total_expenses > 0:
        questions.append({
            "question": "No revenue accounts were detected in the Trial Balance. Is this a pre-revenue company, or is the revenue recorded under a different classification (e.g., 'Other Income', 'Service Charges')? Please confirm how sales/service income is captured.",
            "reason": "Without revenue classification, profitability analysis and margin calculations cannot be performed accurately.",
        })

    # 3. Check for unusual debit/credit balances
    unusual = []
    for e in entries:
        name_lower = e.account_name.lower()
        # Revenue accounts normally have credit balance
        if e.group == "revenue" and e.debit > e.credit and e.debit > 10000:
            unusual.append(f"{e.account_name} (Debit ₹{e.debit:,.0f} — expected Credit)")
        # Expense accounts under Income group (like Discount under Income in Zoho)
        if e.group == "revenue" and e.debit > 0 and e.credit == 0:
            unusual.append(f"{e.account_name} under Income with Debit ₹{e.debit:,.0f}")

    if unusual:
        questions.append({
            "question": f"The following accounts show unusual debit/credit positions: {'; '.join(unusual[:3])}. Can you confirm if these are contra-revenue items (discounts, returns), reclassifications, or posting errors?",
            "reason": "Contra-revenue items affect gross revenue calculation and need proper treatment for accurate top-line reporting.",
        })

    # 4. Check for large unearned revenue / advances
    unearned = [e for e in entries if re.search(r"unearned|deferred|advance.*customer|advance.*from", e.account_name.lower())]
    unearned_total = sum(e.credit - e.debit for e in unearned)
    if unearned_total > 0:
        questions.append({
            "question": f"Unearned/deferred revenue of ₹{unearned_total:,.0f} is recorded. What is the expected timeline for revenue recognition? Are these annual contracts, milestone-based, or usage-based?",
            "reason": "Ind AS 115 requires revenue recognition based on performance obligations. The timing significantly impacts reported revenue.",
        })

    # 5. Check payroll vs total expenses ratio
    payroll = sum(e.debit - e.credit for e in entries if re.search(r"salary|wage|payroll|staff|employee", e.account_name.lower()) and e.debit > 0)
    if payroll > 0 and result.total_expenses > 0:
        payroll_pct = payroll / result.total_expenses * 100
        if payroll_pct > 50:
            questions.append({
                "question": f"Payroll costs represent {payroll_pct:.0f}% of total expenses (₹{payroll:,.0f}). Is this consistent with your headcount plan? Are there any contractor payments classified under professional fees that should be reclassified as employee costs?",
                "reason": "High employee cost ratio impacts operating leverage. Misclassification between employees and contractors has tax and compliance implications.",
            })

    # 6. Related party check
    related = [e for e in entries if re.search(r"director|founder|partner|promoter|related|payable.*name|receivable.*name", e.account_name.lower())]
    if related:
        names = ", ".join(e.account_name for e in related[:3])
        questions.append({
            "question": f"Potential related-party accounts detected: {names}. Are these transactions at arm's length? What are the terms (interest rate, repayment schedule)?",
            "reason": "Ind AS 24 requires disclosure of related party transactions. Non-arm's length terms may need adjustment in QoE analysis.",
        })
    elif not related:
        questions.append({
            "question": "Are there any related-party transactions (founder loans, rent to promoter entities, management fees) that are not separately identified in the TB?",
            "reason": "Ind AS 24 requires separate disclosure. Hidden related-party transactions are a common audit finding.",
        })

    # 7. Unclassified accounts
    if unclassified and len(questions) < 5:
        names = ", ".join(u.account_name for u in unclassified[:3])
        questions.append({
            "question": f"These accounts could not be auto-classified: {names}. Can you confirm their nature (Asset/Liability/Income/Expense)?",
            "reason": "Accurate classification is essential for financial statement preparation.",
        })

    result.ai_questions = questions[:5]


def _generate_insights(result: AnalysisResult):
    """Generate actionable insights."""
    insights = result.insights

    # Profitability
    if result.net_income > 0:
        insights.append({
            "category": "Profitability",
            "title": "Company is Profitable",
            "detail": f"Net income of {result.net_income:,.0f} indicates positive operating performance. Net margin is {result.net_margin}%.",
            "action": "Monitor gross margin trends and identify opportunities for operating leverage.",
            "severity": "positive",
        })
    elif result.net_income < 0:
        insights.append({
            "category": "Profitability",
            "title": "Company is Operating at a Loss",
            "detail": f"Net loss of {abs(result.net_income):,.0f} detected. This represents a {abs(result.net_margin)}% negative margin on revenue.",
            "action": "Conduct a detailed expense analysis. Identify the top 3 cost centers and evaluate cost optimization opportunities. Consider revenue acceleration strategies.",
            "severity": "critical",
        })

    # Liquidity
    if result.current_ratio > 0:
        if result.current_ratio < 1:
            insights.append({
                "category": "Liquidity",
                "title": "Current Ratio Below 1.0 — Liquidity Risk",
                "detail": f"Current ratio of {result.current_ratio}x indicates current liabilities exceed current assets. Working capital is negative at {result.working_capital:,.0f}.",
                "action": "Negotiate extended payment terms with suppliers, accelerate receivable collections, or arrange a working capital facility.",
                "severity": "critical",
            })
        elif result.current_ratio < 1.5:
            insights.append({
                "category": "Liquidity",
                "title": "Adequate but Tight Liquidity",
                "detail": f"Current ratio of {result.current_ratio}x. Working capital of {result.working_capital:,.0f}. Monitor cash conversion cycle closely.",
                "action": "Build a 13-week cash flow forecast. Consider optimizing inventory turnover.",
                "severity": "warning",
            })
        else:
            insights.append({
                "category": "Liquidity",
                "title": "Healthy Liquidity Position",
                "detail": f"Current ratio of {result.current_ratio}x with working capital of {result.working_capital:,.0f}.",
                "action": "Consider deploying excess working capital into short-term investments or growth initiatives.",
                "severity": "positive",
            })

    # Leverage
    if result.debt_to_equity > 2:
        insights.append({
            "category": "Leverage",
            "title": "High Debt-to-Equity Ratio",
            "detail": f"D/E ratio of {result.debt_to_equity}x indicates heavy reliance on debt financing.",
            "action": "Evaluate debt restructuring options. Consider equity infusion or retained earnings accumulation to improve the capital structure.",
            "severity": "warning",
        })

    # Revenue concentration
    if len(result.revenue) == 1:
        insights.append({
            "category": "Revenue",
            "title": "Single Revenue Stream Detected",
            "detail": "Only one revenue account found. This may indicate revenue concentration risk.",
            "action": "Consider diversifying revenue streams. If revenue comes from multiple products/services, break it down into separate accounts for better analysis.",
            "severity": "warning",
        })

    # Expense structure
    if result.total_expenses > 0 and result.total_revenue > 0:
        expense_ratio = result.total_expenses / result.total_revenue
        if expense_ratio > 0.9:
            insights.append({
                "category": "Efficiency",
                "title": "High Expense-to-Revenue Ratio",
                "detail": f"Expenses consume {expense_ratio*100:.1f}% of revenue, leaving minimal margin.",
                "action": "Benchmark against industry peers. Identify non-essential expenses for potential reduction. Focus on unit economics improvement.",
                "severity": "warning",
            })


def _compute_ratios(
    *,
    current_assets: float,
    current_liabilities: float,
    total_liabilities: float,
    total_equity: float,
    total_revenue: float,
    net_income: float,
    cogs: float,
) -> dict:
    """Compute the standard ratio pack declaratively.

    Every ratio is either {"value": number, "status": "ok"} when inputs
    allow a meaningful number, or {"value": 0.0, "status": "not_computable",
    "reason": <plain-English>} when a required input is missing or zero.

    The reasons are user-facing: they surface as tooltips on the dashboard
    when a metric shows "—". Keep them short and actionable.
    """
    meta: dict = {}

    # Current ratio — liquidity
    if current_liabilities <= 0:
        meta["current_ratio"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": "No current liabilities classified in the trial balance.",
        }
    else:
        meta["current_ratio"] = {
            "value": round(current_assets / current_liabilities, 2),
            "status": "ok",
        }

    # Debt-to-equity — leverage
    if total_equity <= 0:
        meta["debt_to_equity"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": (
                "Equity is zero or negative — D/E is not meaningful for this "
                "company right now."
            ),
        }
    else:
        meta["debt_to_equity"] = {
            "value": round(total_liabilities / total_equity, 2),
            "status": "ok",
        }

    # Return on equity
    if total_equity <= 0:
        meta["return_on_equity"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": (
                "Equity is zero or negative — return on equity cannot be "
                "interpreted."
            ),
        }
    else:
        meta["return_on_equity"] = {
            "value": round(net_income / total_equity * 100, 2),
            "status": "ok",
        }

    # Net margin — needs revenue
    if total_revenue <= 0:
        meta["net_margin"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": "No revenue recorded in the trial balance.",
        }
    else:
        meta["net_margin"] = {
            "value": round(net_income / total_revenue * 100, 2),
            "status": "ok",
        }

    # Gross margin — needs revenue AND a COGS / purchase account
    if total_revenue <= 0:
        meta["gross_margin"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": "No revenue recorded in the trial balance.",
        }
    elif cogs <= 0:
        meta["gross_margin"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": (
                "No COGS / purchase account found — gross margin cannot be "
                "separated from total expenses."
            ),
        }
    else:
        meta["gross_margin"] = {
            "value": round((total_revenue - cogs) / total_revenue * 100, 2),
            "status": "ok",
        }

    # Working capital — subtraction, always numerically computable but only
    # meaningful if any current items were classified.
    if current_assets == 0 and current_liabilities == 0:
        meta["working_capital"] = {
            "value": 0.0,
            "status": "not_computable",
            "reason": "No current assets or liabilities classified.",
        }
    else:
        meta["working_capital"] = {
            "value": round(current_assets - current_liabilities, 2),
            "status": "ok",
        }

    return meta


def _to_dict(result: AnalysisResult) -> dict:
    """Convert result to a JSON-serializable dict."""
    return {
        "summary": {
            "total_debit": result.total_debit,
            "total_credit": result.total_credit,
            "is_balanced": result.is_balanced,
            "variance": result.variance,
        },
        "financial_statements": {
            "total_assets": result.total_assets,
            "total_liabilities": result.total_liabilities,
            "total_equity": result.total_equity,
            "total_revenue": result.total_revenue,
            "total_expenses": result.total_expenses,
            "net_income": result.net_income,
        },
        "ratios": {
            "current_ratio": result.current_ratio,
            "debt_to_equity": result.debt_to_equity,
            "gross_margin": result.gross_margin,
            "net_margin": result.net_margin,
            "return_on_equity": result.return_on_equity,
            "working_capital": result.working_capital,
        },
        # NEW — richer per-ratio metadata so the dashboard can render "—"
        # + a tooltip instead of a silent 0 when inputs are missing.
        "ratios_meta": result.ratios_meta,
        "completeness": result.completeness,
        "input_mode": result.input_mode,
        "classified_accounts": {
            "assets": result.assets,
            "liabilities": result.liabilities,
            "equity": result.equity,
            "revenue": result.revenue,
            "expenses": result.expenses,
        },
        "ind_as_observations": result.ind_as_observations,
        "ai_questions": result.ai_questions,
        "insights": result.insights,
        "warnings": result.warnings,
    }
