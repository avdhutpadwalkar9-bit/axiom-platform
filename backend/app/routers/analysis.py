import csv
import io
import json

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from openpyxl import load_workbook
from pydantic import BaseModel

from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.tb_analyzer import analyze_trial_balance

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


class TBEntryInput(BaseModel):
    account_code: str = ""
    account_name: str
    debit: float = 0
    credit: float = 0


class TBAnalyzeRequest(BaseModel):
    entries: list[TBEntryInput]


@router.post("/tb/json")
async def analyze_tb_json(
    data: TBAnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    """Analyze a trial balance submitted as JSON."""
    if not data.entries:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No entries provided")

    entries = [e.model_dump() for e in data.entries]
    result = analyze_trial_balance(entries)
    return result


@router.post("/tb/upload")
async def analyze_tb_upload(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Analyze a trial balance uploaded as CSV or JSON file."""
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file provided")

    content = await file.read()

    entries = []

    # For text-based formats, decode content
    text = ""
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xls")):
        text = content.decode("utf-8-sig")  # Handle BOM in Excel exports

    if file.filename.endswith(".json"):
        try:
            data = json.loads(text)
            if isinstance(data, list):
                entries = data
            elif isinstance(data, dict) and "entries" in data:
                entries = data["entries"]
            else:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON format")
        except json.JSONDecodeError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON file")

    elif file.filename.endswith(".csv"):
        reader = csv.DictReader(io.StringIO(text))
        for row in reader:
            # Try common column name variations
            account_name = (
                row.get("account_name") or row.get("Account Name") or
                row.get("AccountName") or row.get("Particulars") or
                row.get("particulars") or row.get("Ledger") or
                row.get("ledger") or row.get("Account") or
                row.get("account") or ""
            )
            account_code = (
                row.get("account_code") or row.get("Account Code") or
                row.get("Code") or row.get("code") or ""
            )
            debit = _parse_number(
                row.get("debit") or row.get("Debit") or row.get("Dr") or row.get("dr") or "0"
            )
            credit = _parse_number(
                row.get("credit") or row.get("Credit") or row.get("Cr") or row.get("cr") or "0"
            )

            if account_name:
                entries.append({
                    "account_code": account_code,
                    "account_name": account_name,
                    "debit": debit,
                    "credit": credit,
                })
    elif file.filename.endswith(".xlsx") or file.filename.endswith(".xls"):
        try:
            wb = load_workbook(io.BytesIO(content), data_only=True)
            ws = wb.active
            if ws is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty Excel file")

            # Smart header detection — scan first 10 rows to find the header row
            header_row = -1
            name_col = -1
            debit_col = -1
            credit_col = -1
            code_col = -1

            header_names = {"account", "account name", "particulars", "ledger", "name"}
            debit_names = {"debit", "net debit", "dr", "debit amount"}
            credit_names = {"credit", "net credit", "cr", "credit amount"}
            code_names = {"account code", "code", "accountcode"}

            for row_idx in range(1, min(11, ws.max_row + 1)):
                cells = [str(c.value or "").strip().lower() for c in ws[row_idx]]
                for i, cell in enumerate(cells):
                    if cell in header_names and name_col == -1:
                        name_col = i
                        header_row = row_idx
                    if cell in debit_names and debit_col == -1:
                        debit_col = i
                    if cell in credit_names and credit_col == -1:
                        credit_col = i
                    if cell in code_names and code_col == -1:
                        code_col = i
                if name_col != -1 and debit_col != -1:
                    break

            if header_row == -1:
                # Fallback: assume col 0=name, 2=debit, 3=credit (common Zoho/Tally format)
                header_row = 1
                name_col = 0
                debit_col = 2
                credit_col = 3

            # Track current group/section from Zoho-style section headers
            current_group = ""
            skip_prefixes = {"total for", "total"}
            section_names = {"assets", "liabilities", "equities", "equity", "income", "revenue", "expense", "expenses"}

            for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
                cells = list(row)
                if name_col >= len(cells):
                    continue

                raw_name = str(cells[name_col] or "").strip()
                if not raw_name:
                    continue

                # Check if this is a section header (Assets, Liabilities, Income, Expense)
                clean_name = raw_name.lower().strip()
                if clean_name in section_names:
                    current_group = raw_name
                    continue

                # Skip "Total for..." rows
                if clean_name.startswith("total for") or clean_name == "total":
                    continue

                # Skip the header row itself if it appears in data
                if clean_name in header_names:
                    continue

                debit = _parse_number(str(cells[debit_col] if debit_col >= 0 and debit_col < len(cells) else 0))
                credit = _parse_number(str(cells[credit_col] if credit_col >= 0 and credit_col < len(cells) else 0))
                account_code = str(cells[code_col] if code_col >= 0 and code_col < len(cells) else "").strip()

                # Skip rows with no debit AND no credit (empty rows or zero-balance accounts)
                if debit == 0 and credit == 0:
                    continue

                # Prefix the account name with the current group for better classification
                # e.g., "Sales" under "Income" group becomes more easily classifiable
                group_hint = ""
                if current_group:
                    group_hint = current_group.strip()

                entries.append({
                    "account_code": account_code,
                    "account_name": raw_name.strip(),
                    "debit": debit,
                    "credit": credit,
                    "group": group_hint,
                })

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error reading Excel file: {str(e)}")

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a .csv, .json, or .xlsx file."
        )

    if not entries:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No valid entries found in file")

    result = analyze_trial_balance(entries)
    return result


class QuickAnalysisRequest(BaseModel):
    company_name: str = ""
    industry: str = ""
    turnover_range: str = ""
    entries: list[TBEntryInput]


@router.post("/tb/quick")
async def quick_analysis(data: QuickAnalysisRequest):
    """
    Quick analysis WITHOUT authentication — the landing page hook.
    Returns ONE painful insight + blurred summary to force signup.
    """
    if not data.entries or len(data.entries) < 3:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Need at least 3 entries")

    entries = [e.model_dump() for e in data.entries]
    full_result = analyze_trial_balance(entries)

    # Extract the ONE most painful insight
    fs = full_result["financial_statements"]
    ratios = full_result["ratios"]
    insights = full_result["insights"]

    # Find the most critical insight
    painful_insight = None
    for ins in insights:
        if ins["severity"] == "critical":
            painful_insight = ins
            break
    if not painful_insight and insights:
        painful_insight = insights[0]

    # Build the teaser response — only partial data
    industry_benchmarks = {
        "Manufacturing": {"gross_margin": 35, "current_ratio": 1.5, "label": "Manufacturing"},
        "SaaS": {"gross_margin": 70, "current_ratio": 2.0, "label": "SaaS/Tech"},
        "Services": {"gross_margin": 45, "current_ratio": 1.3, "label": "Services"},
        "Trading": {"gross_margin": 20, "current_ratio": 1.2, "label": "Trading"},
        "E-commerce": {"gross_margin": 30, "current_ratio": 1.4, "label": "E-commerce"},
    }
    benchmark = industry_benchmarks.get(data.industry, {"gross_margin": 40, "current_ratio": 1.5, "label": "your industry"})

    # Generate the ONE painful line
    pain_lines = []
    if ratios["current_ratio"] > 0 and ratios["current_ratio"] < benchmark["current_ratio"]:
        wc_leak = abs(ratios["working_capital"])
        pain_lines.append(f"We found a potential ₹{wc_leak/100000:.1f}L working capital leak — your current ratio ({ratios['current_ratio']}x) is below the {benchmark['label']} benchmark of {benchmark['current_ratio']}x.")
    if ratios["gross_margin"] > 0 and ratios["gross_margin"] < benchmark["gross_margin"]:
        gap = benchmark["gross_margin"] - ratios["gross_margin"]
        pain_lines.append(f"Your Gross Margin ({ratios['gross_margin']}%) is {gap:.1f}% below the {benchmark['label']} industry average.")
    if ratios["net_margin"] < 0:
        pain_lines.append(f"Your business is operating at a {abs(ratios['net_margin'])}% loss. Immediate cost optimization needed.")
    if fs["net_income"] > 0 and ratios["net_margin"] < 10:
        pain_lines.append(f"Net margin of {ratios['net_margin']}% is thin — one bad quarter could push you into losses.")

    if not pain_lines:
        pain_lines.append(f"Revenue of ₹{fs['total_revenue']/100000:.1f}L with {ratios['net_margin']}% margin — there are optimization opportunities we've identified.")

    return {
        "teaser": {
            "headline": pain_lines[0],
            "supporting": pain_lines[1] if len(pain_lines) > 1 else None,
            "company_name": data.company_name or "Your Company",
        },
        "summary_preview": {
            "total_revenue": fs["total_revenue"],
            "total_expenses": fs["total_expenses"],
            "net_income": fs["net_income"],
            "account_count": len(entries),
        },
        "blurred": {
            "insights_count": len(insights),
            "ind_as_issues": len(full_result["ind_as_observations"]),
            "ai_questions": len(full_result["ai_questions"]),
            "ratios_available": True,
            "balance_sheet_available": True,
        },
        "cta": "Sign up to unlock the full Ind AS review, 5 AI questions, and actionable SOPs →",
    }


def _parse_number(value: str) -> float:
    """Parse a number from string, handling commas and parentheses."""
    if not value:
        return 0.0
    value = str(value).strip()
    # Handle parentheses as negative
    if value.startswith("(") and value.endswith(")"):
        value = "-" + value[1:-1]
    # Remove commas and currency symbols
    value = value.replace(",", "").replace("₹", "").replace("$", "").replace(" ", "")
    try:
        return float(value)
    except ValueError:
        return 0.0
