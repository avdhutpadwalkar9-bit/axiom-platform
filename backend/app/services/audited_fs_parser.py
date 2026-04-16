"""
Audited Financial Statements parser — extracts summary BS + P&L numbers
from a Schedule III Indian audited FS PDF (and, if required, Excel export).

The goal is NOT a line-by-line faithful reconstruction. It's to pull the
totals + major heads so we can feed a synthetic TB into
`analyze_trial_balance` and get ratios + Ind AS observations for free.

Strategy
========
1.  Try `pypdf` text extraction. Most Indian audit PDFs (Tohands included)
    have selectable text — no OCR needed.
2.  Detect unit multiplier. Indian audits typically say "(Amounts in
    lakhs)" or "(Amounts in ₹)" in the header. Multiply accordingly.
3.  Use regex heuristics against canonical Schedule III line items to
    extract individual totals. This is deliberately loose — if a number
    is missed we just skip that head; downstream `ratios_meta` already
    handles not_computable gracefully.
4.  Build a synthetic TB (list of {account_name, debit, credit}) and hand
    it to `analyze_trial_balance`.
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass, field


_BS_HEADER_RE = re.compile(r"balance\s+sheet\s+as\s+at", re.IGNORECASE)
_PL_HEADER_RE = re.compile(
    r"(?:statement\s+of\s+profit\s+and\s+loss|profit\s+and\s+loss\s+(?:account|statement))",
    re.IGNORECASE,
)
_CASHFLOW_HEADER_RE = re.compile(r"cash\s+flow\s+statement", re.IGNORECASE)
_NOTES_HEADER_RE = re.compile(
    r"(?:notes?\s+to\s+(?:the\s+)?financial\s+statements?|significant\s+accounting\s+policies)",
    re.IGNORECASE,
)


def _split_bs_pl_regions(text: str) -> tuple[str, str]:
    """Slice the PDF text into (balance_sheet_region, pnl_region).

    We use the section headings that almost every Schedule III audit uses
    as anchors. Notes section is explicitly excluded from both regions to
    avoid double-counting. If a heading can't be located, we fall back to
    returning the full text for that region — the matchers are tight
    enough that spill-over is usually harmless."""
    bs_match = _BS_HEADER_RE.search(text)
    pl_match = _PL_HEADER_RE.search(text)
    cf_match = _CASHFLOW_HEADER_RE.search(text)
    notes_match = _NOTES_HEADER_RE.search(text)

    if bs_match and pl_match:
        bs_start = bs_match.start()
        bs_end = pl_match.start()
        bs_text = text[bs_start:bs_end]
    elif bs_match:
        bs_text = text[bs_match.start():]
    else:
        bs_text = text

    if pl_match:
        pl_start = pl_match.start()
        # End at whichever comes first: cash flow header, notes header, or EOF.
        ends = [
            m.start()
            for m in (cf_match, notes_match)
            if m is not None and m.start() > pl_start
        ]
        pl_end = min(ends) if ends else len(text)
        pl_text = text[pl_start:pl_end]
    else:
        pl_text = text

    return bs_text, pl_text


# -------------------------------------------------------------------------
# Unit detection
# -------------------------------------------------------------------------
#
# Indian audit PDFs extracted via pypdf often collapse whitespace, yielding
# strings like "in lakhsParticulars". We match without requiring a trailing
# word-boundary, but we DO require a leading word boundary so "crookedness"
# doesn't match "crore".
_UNIT_PATTERNS: list[tuple[re.Pattern[str], float]] = [
    (re.compile(r"\bcrores?\b", re.IGNORECASE), 10_000_000.0),
    (re.compile(r"\bcrores?", re.IGNORECASE), 10_000_000.0),
    (re.compile(r"\blakhs?\b", re.IGNORECASE), 100_000.0),
    (re.compile(r"\blakhs?", re.IGNORECASE), 100_000.0),
    (re.compile(r"\bmillions?\b", re.IGNORECASE), 1_000_000.0),
    (re.compile(r"\bthousands?\b", re.IGNORECASE), 1_000.0),
]


def detect_unit_multiplier(text: str) -> float:
    """Return the multiplier implied by the 'amounts in ...' header.

    Default to 1.0 (raw ₹) if nothing matches."""
    # Look at the first ~5000 chars — pypdf sometimes loses line breaks
    # between the title banner and the actual statement.
    head = text[:5000]
    for pattern, multiplier in _UNIT_PATTERNS:
        if pattern.search(head):
            return multiplier
    return 1.0


# -------------------------------------------------------------------------
# Number parsing
# -------------------------------------------------------------------------

# Token that looks like an amount in an Indian FS:
#   - parenthesised negatives like (37.09)
#   - negatives prefixed with - or en-dash
#   - Indian 1,23,456 or western 1,234,567 grouping
#   - always carries a decimal OR grouping separator — bare integers like
#     "2", "13" are note numbers / dates, not amounts
#
# Critical guardrails for pypdf-merged output:
#   - negative lookbehind `(?<![\d.])` prevents re-anchoring inside a
#     concatenated number like "1.52116.68" (which is really "1.52" +
#     "116.68" in the original PDF; without this the engine happily
#     matches "52116.68")
#   - decimals capped at 2 places (Indian statutory convention) and
#     must not be followed by another digit
_NUMBER_TOKEN = re.compile(
    r"""
    (?<![\d.])                          # no preceding digit or dot
    \(?                                 # optional leading paren
    [-\u2013]?                          # optional leading minus / en-dash
    (?:
        \d{1,3}(?:,\d{2,3})+(?:\.\d{1,2})?(?!\d)  # has grouping separator(s)
      | \d+\.\d{1,2}(?!\d)                        # decimal, bounded length
    )
    \)?                                 # optional trailing paren
    """,
    re.VERBOSE,
)


def _parse_number(token: str) -> float | None:
    """Parse a single number token. Returns None if invalid."""
    if not token:
        return None
    s = token.strip()
    neg = False
    if s.startswith("(") and s.endswith(")"):
        neg = True
        s = s[1:-1]
    if s.startswith(("-", "\u2013")):
        neg = True
        s = s[1:]
    s = s.replace(",", "")
    try:
        n = float(s)
    except ValueError:
        return None
    return -n if neg else n


def _extract_trailing_numbers(line: str, max_numbers: int = 4) -> list[float]:
    """Pull amount-looking tokens off a line (left to right)."""
    tokens = _NUMBER_TOKEN.findall(line)
    parsed: list[float] = []
    for t in tokens:
        val = _parse_number(t)
        if val is not None:
            parsed.append(val)
    return parsed[:max_numbers]


# -------------------------------------------------------------------------
# Line-item matchers
# -------------------------------------------------------------------------
# Each matcher is (account_name, is_debit, list_of_regex_patterns).
# We search line-by-line; first match wins for each account_name.
# The "is_debit" flag tells us whether the amount should hit the debit or
# credit side of the synthetic TB.

@dataclass
class LineMatcher:
    account_name: str
    is_debit: bool          # True => debit side (asset/expense-like), False => credit side
    patterns: list[re.Pattern[str]]

    @classmethod
    def make(cls, account: str, is_debit: bool, *raw: str) -> "LineMatcher":
        # pypdf commonly concatenates adjacent words ("2024Revenue"), so
        # we cannot rely on \b word boundaries. Patterns are compiled
        # case-insensitive and anchored on the label itself — callers
        # supply patterns without leading \b.
        return cls(
            account_name=account,
            is_debit=is_debit,
            patterns=[re.compile(p, re.IGNORECASE) for p in raw],
        )


# Balance sheet — credit side (equity, liabilities). Patterns deliberately
# omit leading \b since pypdf concatenates adjacent words.
_BS_CREDIT_MATCHERS = [
    LineMatcher.make("Share Capital", False,
                     r"share\s+capital",
                     r"equity\s+share\s+capital"),
    LineMatcher.make("Reserves and Surplus", False,
                     r"reserves?\s+and\s+surplus",
                     r"retained\s+earnings",
                     r"other\s+equity"),
    LineMatcher.make("Long-term Borrowings", False,
                     r"long[-\s]?term\s+borrowings?",
                     r"non[-\s]?current\s+borrowings?"),
    LineMatcher.make("Short-term Borrowings", False,
                     r"short[-\s]?term\s+borrowings?"),
    LineMatcher.make("Trade Payables", False,
                     r"trade\s+payables?",
                     r"sundry\s+creditors?"),
    LineMatcher.make("Other Current Liabilities", False,
                     r"other\s+current\s+liabilit"),
    LineMatcher.make("Short-term Provisions", False,
                     r"short[-\s]?term\s+provisions?"),
    LineMatcher.make("Long-term Provisions", False,
                     r"long[-\s]?term\s+provisions?"),
    LineMatcher.make("Deferred Tax Liability", False,
                     r"deferred\s+tax\s+liabilit"),
]

# Balance sheet — debit side (assets)
_BS_DEBIT_MATCHERS = [
    LineMatcher.make("Property, Plant and Equipment", True,
                     r"property\s*,?\s*plant\s+and\s+equipment",
                     r"tangible\s+assets?",
                     r"fixed\s+assets?"),
    LineMatcher.make("Intangible Assets", True,
                     r"intangible\s+assets?"),
    LineMatcher.make("Capital Work in Progress", True,
                     r"capital\s+work[-\s]*in[-\s]*progress",
                     r"cwip"),
    LineMatcher.make("Non-current Investments", True,
                     r"non[-\s]?current\s+investments?"),
    LineMatcher.make("Long-term Loans and Advances", True,
                     r"long[-\s]?term\s+loans?\s+and\s+advances"),
    LineMatcher.make("Inventories", True,
                     r"inventor(?:y|ies)",
                     r"stock[-\s]?in[-\s]?trade"),
    LineMatcher.make("Trade Receivables", True,
                     r"trade\s+receivables?",
                     r"sundry\s+debtors?"),
    LineMatcher.make("Cash and Cash Equivalents", True,
                     r"cash\s+and\s+(?:cash\s+)?equivalents?",
                     r"cash\s+and\s+bank\s+balances?"),
    LineMatcher.make("Short-term Loans and Advances", True,
                     r"short[-\s]?term\s+loans?\s+and\s+advances"),
    LineMatcher.make("Other Current Assets", True,
                     r"other\s+current\s+assets?"),
    LineMatcher.make("Deferred Tax Asset", True,
                     r"deferred\s+tax\s+assets?"),
]

# Profit & loss
_PL_CREDIT_MATCHERS = [
    LineMatcher.make("Revenue from Operations", False,
                     r"revenue\s+from\s+operations?",
                     r"sales?\s+of\s+products?",
                     r"sales?\s+of\s+services?",
                     r"gross\s+revenue"),
    LineMatcher.make("Other Income", False,
                     r"other\s+income"),
]

_PL_DEBIT_MATCHERS = [
    LineMatcher.make("Cost of Materials Consumed", True,
                     r"cost\s+of\s+materials?\s+consumed"),
    LineMatcher.make("Purchases of Stock-in-Trade", True,
                     r"purchases?\s+of\s+stock[-\s]?in[-\s]?trade"),
    LineMatcher.make("Changes in Inventories", True,
                     r"changes?\s+in\s+inventor"),
    LineMatcher.make("Employee Benefits Expense", True,
                     r"employee\s+benefits?\s+expense",
                     r"employee\s+costs?",
                     r"salaries?\s+and\s+wages?"),
    LineMatcher.make("Finance Costs", True,
                     r"finance\s+costs?",
                     r"interest\s+expense"),
    LineMatcher.make("Depreciation and Amortization", True,
                     r"depreciation\s+and\s+amorti(?:s|z)ation",
                     r"depreciation"),
    LineMatcher.make("Other Expenses", True,
                     r"other\s+expenses?"),
    LineMatcher.make("Tax Expense", True,
                     r"tax\s+expense",
                     r"current\s+tax",
                     r"income\s+tax\s+expense"),
]


# -------------------------------------------------------------------------
# Top-level parser
# -------------------------------------------------------------------------

@dataclass
class AuditedFSParseResult:
    tb_entries: list[dict] = field(default_factory=list)
    unit_multiplier: float = 1.0
    pages_parsed: int = 0
    warnings: list[str] = field(default_factory=list)
    raw_text_length: int = 0


def _extract_pdf_text(content: bytes) -> tuple[str, int, list[str]]:
    """Return (concatenated_text, page_count, warnings)."""
    warnings: list[str] = []
    try:
        from pypdf import PdfReader  # local import so backend still boots if pypdf missing
    except Exception as e:
        return "", 0, [f"pypdf not installed: {e}"]

    try:
        reader = PdfReader(io.BytesIO(content))
    except Exception as e:
        return "", 0, [f"Could not open PDF: {e}"]

    chunks: list[str] = []
    for page in reader.pages:
        try:
            chunks.append(page.extract_text() or "")
        except Exception as e:
            warnings.append(f"Page extraction failed: {e}")
            chunks.append("")
    return "\n".join(chunks), len(reader.pages), warnings


def _line_matches(matcher: LineMatcher, line: str) -> bool:
    return any(p.search(line) for p in matcher.patterns)


def _extract_entries(text: str, matchers: list[LineMatcher]) -> dict[str, float]:
    """For each matcher, find the first occurrence in the text and grab
    the FIRST amount-looking number immediately after the label.

    pypdf frequently collapses line breaks, producing strings like
    "Share capital 2 11.78 10.95Reserves and surplus 3 (37.09) 80.78".
    So we can't rely on line-splitting; we search the whole text for the
    earliest label match and pick up the first 2 numeric tokens (current
    year and prior year) from that point forward, taking only the first
    (current year).

    To avoid "leak" from empty rows (e.g. `Long-term borrowingsDeferred
    tax liabilitiesOther long-term liabilitiesLong-term provisions 4
    7.80` where the 7.80 actually belongs to provisions), we REJECT a
    candidate number if any OTHER known matcher's label appears between
    the matched label and the number. That pushes "no amount" rows
    safely into the `not_computable` bucket downstream."""
    # Flatten every pattern from every matcher so we can test "is there
    # another label between the match and the number?"
    all_patterns: list[tuple[str, re.Pattern[str]]] = []
    for m in matchers:
        for p in m.patterns:
            all_patterns.append((m.account_name, p))

    found: dict[str, float] = {}
    for matcher in matchers:
        if matcher.account_name in found:
            continue
        best_start = -1
        best_end = -1
        for pattern in matcher.patterns:
            match = pattern.search(text)
            if match and (best_start == -1 or match.start() < best_start):
                best_start = match.start()
                best_end = match.end()
        if best_end < 0:
            continue
        window = text[best_end : best_end + 150]
        # Locate the first amount token in the window
        num_match = _NUMBER_TOKEN.search(window)
        if not num_match:
            continue
        prefix = window[: num_match.start()]
        # Reject if any OTHER known matcher's label appears between the
        # start of the window and the first number — that's a tell-tale
        # sign that the number belongs to a different row.
        leaks_from_other = False
        for other_name, other_pattern in all_patterns:
            if other_name == matcher.account_name:
                continue
            if other_pattern.search(prefix):
                leaks_from_other = True
                break
        if leaks_from_other:
            continue
        # Also reject if the nearest preceding keyword in the prefix is
        # a subtotal marker ("Total", "Less:", "Net revenue"). That tends
        # to happen when an empty line item's label is directly followed
        # by a Schedule III subtotal row that inherits the same number.
        if re.search(r"(?i)\b(?:total|less\s*:|net\s+revenue)\b", prefix):
            continue
        value = _parse_number(num_match.group(0))
        if value is None or value == 0:
            continue
        found[matcher.account_name] = value
    return found


def parse_audited_fs_pdf(content: bytes) -> AuditedFSParseResult:
    """Parse an audited Schedule III Indian FS PDF into a synthetic TB."""
    result = AuditedFSParseResult()
    text, page_count, warnings = _extract_pdf_text(content)
    result.pages_parsed = page_count
    result.raw_text_length = len(text)
    result.warnings.extend(warnings)

    if not text.strip():
        result.warnings.append(
            "PDF yielded no extractable text. It may be scanned (image-only). "
            "OCR / Vision LLM path not wired yet — please upload an Excel export "
            "or TB in the meantime."
        )
        return result

    unit = detect_unit_multiplier(text)
    result.unit_multiplier = unit

    # Balance sheet and P&L live in different regions of the doc; scoping
    # to the appropriate region avoids P&L line labels accidentally
    # matching inside BS notes and vice versa.
    bs_text, pl_text = _split_bs_pl_regions(text)

    bs_credit = _extract_entries(bs_text, _BS_CREDIT_MATCHERS)
    bs_debit = _extract_entries(bs_text, _BS_DEBIT_MATCHERS)
    pl_credit = _extract_entries(pl_text, _PL_CREDIT_MATCHERS)
    pl_debit = _extract_entries(pl_text, _PL_DEBIT_MATCHERS)

    for name, amount in bs_credit.items():
        result.tb_entries.append({
            "account_name": name, "debit": 0.0, "credit": amount * unit,
            "group": "Equity and Liabilities",
        })
    for name, amount in bs_debit.items():
        result.tb_entries.append({
            "account_name": name, "debit": amount * unit, "credit": 0.0,
            "group": "Assets",
        })
    for name, amount in pl_credit.items():
        result.tb_entries.append({
            "account_name": name, "debit": 0.0, "credit": amount * unit,
            "group": "Income",
        })
    for name, amount in pl_debit.items():
        result.tb_entries.append({
            "account_name": name, "debit": amount * unit, "credit": 0.0,
            "group": "Expenses",
        })

    if not result.tb_entries:
        result.warnings.append(
            "Could not match any Schedule III line items. The PDF layout may "
            "be non-standard — try uploading the Excel / CSV export instead."
        )

    return result
