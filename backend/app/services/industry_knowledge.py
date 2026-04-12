"""
Industry-specific knowledge base for CortexCFO AI.
Contains benchmarks, KPIs, red flags, and strategic advice for 10+ industries.
"""

INDUSTRY_PROFILES = {
    "Manufacturing": {
        "key_kpis": [
            "COGS Ratio (typically 55-70% of revenue)",
            "Inventory Turnover (ideal: 6-12x/year)",
            "Working Capital Cycle (aim for <60 days)",
            "Raw Material % of COGS",
            "Capacity Utilization (benchmark: >75%)",
            "Gross Margin (benchmark: 25-40%)",
            "Debtor Days (ideal: <45 days)",
            "Creditor Days (ideal: 30-60 days)",
        ],
        "benchmarks": {
            "gross_margin": {"low": 20, "avg": 32, "good": 40},
            "net_margin": {"low": 3, "avg": 8, "good": 15},
            "current_ratio": {"low": 1.0, "avg": 1.5, "good": 2.0},
            "inventory_turnover": {"low": 4, "avg": 8, "good": 12},
            "debt_to_equity": {"low": 2.0, "avg": 1.2, "good": 0.5},
        },
        "red_flags": [
            "Inventory growing faster than revenue — possible obsolescence",
            "COGS ratio increasing YoY — supplier cost creep or production inefficiency",
            "High finished goods inventory with low raw material — production bottleneck",
            "Debtor days > 90 — collection risk in Indian manufacturing",
            "No depreciation on plant & machinery — Schedule II non-compliance",
        ],
        "strategic_focus": "For manufacturing, focus on unit economics: cost per unit produced, yield rates, and working capital optimization. In India, monitor GST input credit utilization on raw materials — blocked ITC is a common cash trap.",
        "common_accounts": ["Raw Materials", "Work-in-Progress", "Finished Goods", "Plant & Machinery", "Factory Overhead", "Power & Fuel", "Freight Inward"],
    },

    "SaaS": {
        "key_kpis": [
            "MRR / ARR (Monthly/Annual Recurring Revenue)",
            "Customer Acquisition Cost (CAC)",
            "Lifetime Value (LTV) — aim for LTV/CAC > 3x",
            "Monthly Churn Rate (benchmark: <2%)",
            "Net Revenue Retention (NRR) — aim for >110%",
            "Burn Rate & Cash Runway",
            "Gross Margin (benchmark: >70%)",
            "Rule of 40 (Growth % + Profit % > 40)",
        ],
        "benchmarks": {
            "gross_margin": {"low": 60, "avg": 72, "good": 85},
            "net_margin": {"low": -50, "avg": -15, "good": 20},
            "current_ratio": {"low": 1.5, "avg": 2.5, "good": 4.0},
            "employee_cost_ratio": {"low": 60, "avg": 45, "good": 35},
            "debt_to_equity": {"low": 1.0, "avg": 0.3, "good": 0.1},
        },
        "red_flags": [
            "Employee costs > 50% of revenue — overhired for current ARR",
            "Marketing spend growing but CAC increasing — channel saturation",
            "High receivables relative to ARR — annual contracts not collected upfront",
            "No deferred revenue account — revenue recognition risk under Ind AS 115",
            "Cloud/hosting costs growing faster than revenue — architecture inefficiency",
        ],
        "strategic_focus": "For SaaS, the primary cost is people, not COGS. Focus on revenue per employee, sales efficiency (new ARR per sales rep), and gross margin improvement through infrastructure optimization. In Indian SaaS, watch for GST on SaaS exports (zero-rated but compliance-heavy).",
        "common_accounts": ["Subscription Revenue", "Professional Services", "Cloud Infrastructure", "Salaries", "Marketing", "R&D"],
    },

    "Services": {
        "key_kpis": [
            "Revenue per Employee (benchmark varies by service type)",
            "Employee Cost Ratio (typically 50-65% of revenue)",
            "Utilization Rate (billable hours / total hours — aim for >75%)",
            "Average Billing Rate",
            "Project Profitability",
            "Debtor Days (critical — aim for <30 days)",
            "Gross Margin (benchmark: 35-55%)",
        ],
        "benchmarks": {
            "gross_margin": {"low": 30, "avg": 42, "good": 55},
            "net_margin": {"low": 5, "avg": 12, "good": 22},
            "current_ratio": {"low": 1.2, "avg": 1.8, "good": 2.5},
            "employee_cost_ratio": {"low": 65, "avg": 52, "good": 40},
            "debt_to_equity": {"low": 1.5, "avg": 0.8, "good": 0.3},
        },
        "red_flags": [
            "Employee costs growing faster than revenue — pricing not keeping up with salary inflation",
            "High outstanding invoices — service industry collection is always a challenge in India",
            "No TDS receivable — clients should deduct TDS on professional fees (Section 194J)",
            "Subcontractor costs classified as employee expenses — misclassification risk",
            "Revenue concentration — single client >30% of revenue is risky",
        ],
        "strategic_focus": "For professional services, the business IS the team. Focus on utilization rates, billing rate optimization, and collection efficiency. In India, ensure TDS compliance on both inward (from clients) and outward (to subcontractors) payments.",
        "common_accounts": ["Professional Fees Income", "Salaries", "Subcontractor Costs", "Travel", "Office Rent", "Professional Development"],
    },

    "Trading": {
        "key_kpis": [
            "Gross Margin (typically thin: 8-20%)",
            "Inventory Turnover (higher is better — aim for >12x)",
            "Stock Days (aim for <30 days)",
            "Debtor Days (aim for <30 days)",
            "Creditor Days (negotiate for >45 days)",
            "Cash Conversion Cycle (aim for negative)",
            "Working Capital as % of Revenue",
        ],
        "benchmarks": {
            "gross_margin": {"low": 5, "avg": 12, "good": 20},
            "net_margin": {"low": 1, "avg": 3, "good": 7},
            "current_ratio": {"low": 1.0, "avg": 1.3, "good": 1.8},
            "inventory_turnover": {"low": 6, "avg": 12, "good": 24},
            "debt_to_equity": {"low": 2.5, "avg": 1.5, "good": 0.8},
        },
        "red_flags": [
            "Gross margin < 5% — unsustainable without massive volume",
            "Inventory turnover declining — dead stock accumulation",
            "Trade discounts > 5% of revenue — pricing power erosion",
            "Large sundry creditors with no ageing — potential disputes",
            "GST mismatch between purchases and sales — audit risk",
        ],
        "strategic_focus": "Trading is a volume game with razor-thin margins. Cash conversion cycle is king — get paid before you pay suppliers. In India, GST reconciliation (GSTR-2A matching) is critical for trading businesses due to high transaction volumes.",
        "common_accounts": ["Purchases", "Sales", "Trade Discounts", "Freight", "Customs Duty", "Warehouse Rent", "Commission"],
    },

    "E-commerce": {
        "key_kpis": [
            "Gross Merchandise Value (GMV)",
            "Average Order Value (AOV)",
            "Customer Acquisition Cost (CAC)",
            "Return Rate (benchmark: <10% for non-fashion)",
            "Fulfillment Cost as % of Revenue (aim for <15%)",
            "Contribution Margin (after returns, discounts, delivery)",
            "ROAS (Return on Ad Spend — aim for >4x)",
        ],
        "benchmarks": {
            "gross_margin": {"low": 15, "avg": 30, "good": 45},
            "net_margin": {"low": -30, "avg": -5, "good": 8},
            "current_ratio": {"low": 0.8, "avg": 1.2, "good": 2.0},
            "marketing_ratio": {"low": 30, "avg": 18, "good": 10},
            "debt_to_equity": {"low": 2.0, "avg": 1.0, "good": 0.5},
        },
        "red_flags": [
            "Marketing costs > 25% of revenue — CAC too high, need organic growth",
            "Return rate > 15% — product quality or listing accuracy issues",
            "Delivery charges eating into margin — negotiate better logistics rates",
            "Large marketplace clearing account balances — reconciliation needed",
            "Discount-driven sales > 40% of GMV — brand value erosion",
        ],
        "strategic_focus": "E-commerce profitability requires contribution margin discipline: Revenue - COGS - Returns - Discounts - Delivery - Marketing must be positive per order. In India, reconcile marketplace settlements (Amazon, Flipkart) monthly — delayed settlements trap working capital.",
        "common_accounts": ["Online Sales", "Marketplace Commissions", "Delivery Charges", "Returns & Refunds", "Packaging", "Marketing/Advertising", "Payment Gateway Charges"],
    },

    "Healthcare": {
        "key_kpis": [
            "Revenue per Bed (for hospitals)",
            "Average Revenue per Patient/Visit",
            "Occupancy Rate (benchmark: >70%)",
            "Operating Margin (benchmark: 12-20%)",
            "Drug/Consumable Cost as % of Revenue",
            "Doctor/Staff Cost Ratio",
            "Insurance vs. Cash Collection Mix",
        ],
        "benchmarks": {
            "gross_margin": {"low": 40, "avg": 55, "good": 70},
            "net_margin": {"low": 5, "avg": 12, "good": 20},
            "current_ratio": {"low": 1.0, "avg": 1.5, "good": 2.5},
            "staff_cost_ratio": {"low": 45, "avg": 35, "good": 28},
            "debt_to_equity": {"low": 2.0, "avg": 1.0, "good": 0.5},
        },
        "red_flags": [
            "Insurance receivables > 60 days — TPA settlement delays",
            "Consumable costs rising faster than revenue — procurement inefficiency",
            "No provisions for medical malpractice contingencies",
            "High capital expenditure without proportional revenue growth",
            "Low occupancy with high fixed costs — operational leverage working against you",
        ],
        "strategic_focus": "Healthcare in India is capital-intensive with long payback periods. Focus on asset utilization (revenue per bed, per machine), and optimize the payer mix between insurance, government schemes (Ayushman Bharat), and cash patients.",
        "common_accounts": ["Patient Revenue", "Pharmacy Sales", "Doctor Fees", "Consumables", "Medical Equipment Depreciation", "TPA Receivables"],
    },

    "Education": {
        "key_kpis": [
            "Revenue per Student",
            "Student Acquisition Cost",
            "Retention Rate / Drop-off Rate",
            "Teacher/Content Cost as % of Revenue",
            "Gross Margin (benchmark: 50-70% for edtech)",
            "LTV per Student",
            "Course Completion Rate",
        ],
        "benchmarks": {
            "gross_margin": {"low": 40, "avg": 58, "good": 72},
            "net_margin": {"low": -20, "avg": 5, "good": 18},
            "current_ratio": {"low": 1.0, "avg": 1.8, "good": 3.0},
            "marketing_ratio": {"low": 35, "avg": 22, "good": 12},
            "debt_to_equity": {"low": 1.5, "avg": 0.5, "good": 0.2},
        },
        "red_flags": [
            "High acquisition cost with low completion rates — product-market fit issue",
            "Deferred revenue not recognized — upfront annual fee collection needs Ind AS 115 treatment",
            "Content costs capitalized but should be expensed — watch for aggressive accounting",
            "Refund rate > 10% — course quality or mismatched expectations",
            "Heavy dependence on paid marketing with declining ROAS",
        ],
        "strategic_focus": "For edtech, unit economics per student are everything: CAC, revenue per student, retention, and upsell. In India, watch for GST on educational services (some exemptions apply for formal education) and TDS on instructor payments.",
        "common_accounts": ["Course Fee Revenue", "Content Development", "Instructor Costs", "Platform/Tech Costs", "Marketing", "Refunds"],
    },

    "Real Estate": {
        "key_kpis": [
            "Revenue Recognition (% of completion vs. project completion)",
            "Project-wise Margin",
            "Advance from Customers / Unearned Revenue",
            "Construction Cost per Sq.Ft.",
            "Land Cost as % of Project Value",
            "Debt Service Coverage Ratio",
            "Unsold Inventory (months of supply)",
        ],
        "benchmarks": {
            "gross_margin": {"low": 15, "avg": 28, "good": 40},
            "net_margin": {"low": 5, "avg": 12, "good": 22},
            "current_ratio": {"low": 0.8, "avg": 1.2, "good": 1.8},
            "debt_to_equity": {"low": 3.0, "avg": 1.8, "good": 0.8},
        },
        "red_flags": [
            "Revenue recognized but cash not collected — aggressive revenue recognition",
            "Land advances with no project approvals — capital at risk",
            "High inter-company transactions — potential related party issues",
            "RERA compliance costs not provisioned",
            "GST on under-construction vs. completed property — different rates",
        ],
        "strategic_focus": "Real estate accounting in India is complex due to Ind AS 115 (revenue recognition), RERA compliance, and GST on under-construction properties. Focus on project-wise profitability and cash flow, not just P&L.",
        "common_accounts": ["Property Sales", "Construction Costs", "Land Cost", "Advance from Customers", "Construction WIP", "Interest on Construction Loans"],
    },

    "Agriculture": {
        "key_kpis": [
            "Yield per Acre/Hectare",
            "Input Cost per Quintal",
            "Gross Margin per Crop",
            "Post-Harvest Loss %",
            "Working Capital Cycle (seasonal)",
            "Subsidy & Grant Income",
            "Crop Insurance Coverage",
        ],
        "benchmarks": {
            "gross_margin": {"low": 15, "avg": 28, "good": 40},
            "net_margin": {"low": 3, "avg": 10, "good": 20},
            "current_ratio": {"low": 0.8, "avg": 1.3, "good": 2.0},
        },
        "red_flags": [
            "No provision for crop failure — agriculture is inherently risky",
            "Input costs (seeds, fertilizer) capitalised instead of expensed",
            "Government subsidies not properly accounted for",
            "Seasonal cash flow mismatch — income in harvest, expenses year-round",
            "No crop insurance — single season failure can wipe out the business",
        ],
        "strategic_focus": "Agricultural businesses in India benefit from income tax exemptions (Section 10(1)) but must properly segregate agricultural vs. non-agricultural income. Focus on post-harvest value addition to improve margins.",
        "common_accounts": ["Crop Sales", "Seeds & Planting", "Fertilizer", "Labor", "Equipment Depreciation", "Crop Insurance", "Government Subsidies"],
    },
}

# Industry aliases for matching
INDUSTRY_ALIASES = {
    "Manufacturing": ["manufacturing", "factory", "production", "industrial"],
    "SaaS": ["saas", "software", "tech", "technology", "it services", "cloud"],
    "Services": ["services", "consulting", "professional", "advisory", "staffing"],
    "Trading": ["trading", "wholesale", "retail", "distribution", "import", "export"],
    "E-commerce": ["e-commerce", "ecommerce", "online retail", "d2c", "marketplace"],
    "Healthcare": ["healthcare", "hospital", "pharma", "pharmaceutical", "medical", "clinic"],
    "Education": ["education", "edtech", "training", "coaching", "university", "school"],
    "Real Estate": ["real estate", "construction", "property", "builder", "developer"],
    "Agriculture": ["agriculture", "farming", "agri", "agribusiness", "dairy"],
}


def get_industry_profile(industry: str) -> dict | None:
    """Get the industry profile by name or alias."""
    # Direct match
    if industry in INDUSTRY_PROFILES:
        return INDUSTRY_PROFILES[industry]

    # Alias match
    industry_lower = industry.lower().strip()
    for key, aliases in INDUSTRY_ALIASES.items():
        for alias in aliases:
            if alias in industry_lower:
                return INDUSTRY_PROFILES[key]

    return None


def get_industry_context(industry: str) -> str:
    """Generate a context string with industry benchmarks for the AI."""
    profile = get_industry_profile(industry)
    if not profile:
        return f"Industry: {industry} (no specific benchmarks available — using general analysis)"

    ctx = f"\n### Industry Intelligence: {industry}\n\n"
    ctx += f"**Key KPIs for this industry:**\n"
    for kpi in profile["key_kpis"]:
        ctx += f"- {kpi}\n"

    if "benchmarks" in profile:
        ctx += f"\n**Industry Benchmarks:**\n"
        for metric, vals in profile["benchmarks"].items():
            ctx += f"- {metric}: Low={vals.get('low')}%, Avg={vals.get('avg')}%, Good={vals.get('good')}%\n"

    ctx += f"\n**Red Flags to Watch:**\n"
    for flag in profile["red_flags"]:
        ctx += f"- ⚠️ {flag}\n"

    ctx += f"\n**Strategic Focus:** {profile['strategic_focus']}\n"

    return ctx


def get_all_industries() -> list[str]:
    """Return list of all supported industries."""
    return list(INDUSTRY_PROFILES.keys())
