"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Brain,
  ClipboardList,
  Shield,
  Database,
  Clock,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  Mail,
} from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

type Category =
  | "Core Concepts"
  | "Playbooks"
  | "Compliance & Standards"
  | "Integrations & Data"
  | "US Deal Pitfalls"
  | "Healthcare Sector";

type Article = {
  slug: string;
  title: string;
  category: Category;
  readMin: number;
  summary: string;
  body: string[];
  featured?: boolean;
};

const categories: { label: Category; icon: React.ElementType; desc: string }[] = [
  {
    label: "Core Concepts",
    icon: Brain,
    desc: "The building blocks of modern FP&A, translated for SMBs.",
  },
  {
    label: "Playbooks",
    icon: ClipboardList,
    desc: "Step-by-step guides from finance operators who have run these cycles.",
  },
  {
    label: "US Deal Pitfalls",
    icon: AlertTriangle,
    desc: "The findings we see again and again in US QoE — ranked by how often they kill deals.",
  },
  {
    label: "Healthcare Sector",
    icon: Stethoscope,
    desc: "Sector-specific diligence patterns for US healthcare — payer mix, physician comp, value-based care.",
  },
  {
    label: "Compliance & Standards",
    icon: Shield,
    desc: "GAAP, Schedule III, sales tax and withholding tax — explained without jargon.",
  },
  {
    label: "Integrations & Data",
    icon: Database,
    desc: "Getting clean data out of your accounting stack and into decisions.",
  },
];

const articles: Article[] = [
  // ---------------- Core Concepts ----------------
  {
    slug: "why-financial-analysis-matters-msmes",
    title: "Why financial analysis matters for SMBs",
    category: "Core Concepts",
    readMin: 6,
    featured: true,
    summary:
      "SMBs power a third of Indian GDP, yet most run on instinct and quarterly sales tax deadlines. Financial analysis is what turns raw bookkeeping into the decisions that compound into scale.",
    body: [
      "India's 63 million SMBs contribute close to a third of GDP and nearly 40% of exports. Yet the gap between the best-run and the median SMB is enormous — and almost always traced to one thing: how well the promoter can read their own numbers.",
      "Bookkeeping tells you what happened. Financial analysis tells you what it means. Without it, every price change is a guess, every hire is a risk, and every bank conversation is defensive.",
      "Four questions a basic analysis pack answers every month — which products or customers are actually profitable after overhead, where cash is trapped in the working-capital cycle, whether gross margin is holding or slipping, and whether the business is earning above its real cost of capital.",
      "The SMB-specific stakes are bigger than they look. Thin margins mean a 2% leak compounds into survival risk. Family ownership mixes personal and business flows, hiding the real picture. Bank dependence means weak numbers cost you interest points every year.",
      "The cost of not doing it is never an invoice. It shows up as a vendor you could not negotiate harder with, a banker who charged you 80 bps more, an investor who walked away, a product line you kept alive two years too long. Financial analysis is how you stop paying that tax.",
    ],
  },
  {
    slug: "budgeting-for-msmes",
    title: "Budgeting for SMBs: from spreadsheet to strategy",
    category: "Core Concepts",
    readMin: 5,
    featured: true,
    summary:
      "A budget is not a forecast. It is a commitment to a plan — and the ritual of comparing it to reality every month is how disciplined SMBs outgrow their peers.",
    body: [
      "Most SMBs skip budgeting because \"we are too small\" or \"things change too fast\". Neither is true. The smallest promoter-led business benefits more from a budget than a $500M enterprise — because cash is tighter and every rupee has to earn its keep.",
      "A working SMB budget has five parts: revenue targets split by segment, product or customer; a fixed-versus-variable cost split; a capex plan tied to growth milestones; a month-by-month cash plan; and at minimum two scenarios — base and downside — with trigger points that swap you from one to the other.",
      "The monthly variance ritual is where budgeting becomes leadership. Sit with the numbers on the fifth working day. Flag any line where actuals deviate more than 10% from budget. Ask why. The answer is always either a lesson (the budget was wrong) or an action (something in the business needs fixing).",
      "Rolling budgets beat annual budgets for SMBs. A 12-month rolling view, refreshed every quarter, reflects reality. An annual budget frozen in March stops being useful by June.",
      "The payoff is compounding. With a budget, pricing decisions have anchors. Hiring conversations have limits. Bankers and investors see a promoter who runs the business, not one who hopes it runs itself.",
    ],
  },
  {
    slug: "what-is-quality-of-earnings",
    title: "What is Quality of Earnings (QoE)?",
    category: "Core Concepts",
    readMin: 5,
    featured: true,
    summary:
      "QoE separates the profit your business actually generates from the profit that happens to show up on paper this year.",
    body: [
      "QoE is the lens investors apply to a P&L before they write a cheque. It asks one question: if we acquire this business, how much of the profit shown here is likely to repeat next year?",
      "A QoE teardown normalises for one-time items (asset sales, insurance claims, government grants), strips non-operating income out of EBITDA, and pulls working-capital leakage into view.",
      "For SMBs three issues repeat: promoter-salary distortion, related-party transactions parked at non-market prices, and inventory or receivable build-ups that hide margin leaks.",
      "A continuous QoE — run every month instead of only during diligence — means the first time an investor asks is not the first time you answer. That is the core bet behind CortexCFO.",
    ],
  },
  {
    slug: "fpna-101",
    title: "FP&A 101: Why SMBs need it",
    category: "Core Concepts",
    readMin: 4,
    summary:
      "FP&A turns bookkeeping into a decision-making muscle — the gap between reporting what happened and shaping what happens next.",
    body: [
      "Financial Planning & Analysis sits between the accounting team and the CEO. Where accounting closes the books, FP&A reads them: variance to budget, lead indicators, scenario plans, unit economics.",
      "SMBs often skip FP&A because the team is small. That is the mistake. FP&A is what lets a $15M business spend like a $50M business without blowing its cash runway.",
      "A working FP&A function produces three outputs every month: a variance dashboard against plan, a rolling 12-month cash forecast, and a scenario model for the next strategic decision — a price increase, a new geography, a senior hire.",
      "You do not need a five-person FP&A team to get there. You need consistent data, a driver-based model, and someone who owns the number.",
    ],
  },
  {
    slug: "drivers-vs-line-items",
    title: "Drivers vs. line items",
    category: "Core Concepts",
    readMin: 4,
    summary:
      "If your forecast is a spreadsheet of \"last year plus 10%\", you are missing the whole point of a financial model.",
    body: [
      "Line-item models project every row from historical averages. They are easy to build and useless when the business actually changes.",
      "Driver-based models identify the two-to-five inputs that shape your business — units sold, ASP, gross margin, customer churn, field-force productivity — and compute everything else from those.",
      "The payoff is leverage. Change one driver and the whole P&L and cash flow move. You can pressure-test a price cut, a new salary band or a geographic expansion in minutes instead of days.",
      "For an industrial parts SMB, typical drivers are tonnes shipped × realisation per tonne, raw-material yield and DPO stretch. For a B2B services firm: billable headcount × utilisation × bill rate, and DSO. Different industries, same principle.",
    ],
  },
  {
    slug: "continuous-close",
    title: "Continuous close: what it means, why it matters",
    category: "Core Concepts",
    readMin: 3,
    summary:
      "The best-run SMBs do not wait until the year-end audit to know their numbers. They close every month — and in the best cases, every week.",
    body: [
      "A continuous close is the discipline of keeping your books in audit-ready shape all year, not just in March. Each month ends with a variance review, a reconciled bank and a fresh cash forecast.",
      "The payoff is speed. Investor diligence that used to take eight weeks becomes a two-day exchange. Bankers who ask for provisional numbers get them the same week. Your own decisions get better because the data behind them is fresh.",
      "It does not have to be manual. A continuous close depends on two things: a clean chart of accounts and automated reconciliation. CortexCFO handles the second; we can help you fix the first.",
    ],
  },

  // ---------------- Playbooks ----------------
  {
    slug: "prepare-books-for-diligence",
    title: "Preparing your books for investor diligence",
    category: "Playbooks",
    readMin: 7,
    summary:
      "Investors buy certainty, not stories. A diligence-ready book turns the conversation from \"can we trust your numbers\" to \"what do we do with this business next\".",
    body: [
      "Start with the P&L. Rebuild the last 36 months under Schedule III format. Any line that is not Ind-AS-aligned gets reclassified or flagged. Related-party transactions move into a separate schedule.",
      "Reconstruct EBITDA from reported profit. Strip out one-time gains (government grants, asset sales, insurance claims), promoter-salary adjustments and non-operating income. What you are left with is the number an investor will model.",
      "Pull together a customer concentration schedule (top 10 and top 20, by revenue and gross margin), a vendor concentration schedule, and a month-on-month working-capital schedule (DSO, DIO, DPO).",
      "Finally, a data room: sales tax returns, income-tax returns, bank statements, MOA and AOA, customer and vendor contracts, and the last three years of audited financials. Everything tagged, everything indexed.",
    ],
  },
  {
    slug: "read-pnl-investor-lens",
    title: "Reading your P&L through an investor's lens",
    category: "Playbooks",
    readMin: 5,
    summary:
      "The same P&L that looks healthy on your dashboard can look alarming to an investor. Learning to see it their way is a competitive advantage.",
    body: [
      "Investors read gross margin first, not revenue. A 40% gross-margin business at $1M is more valuable than a 15% business at $25M. Margin shows product-market fit and pricing power; revenue alone does not.",
      "Next they look at operating leverage — how fast do fixed costs grow relative to revenue? A business where every $1 of new revenue flows 50 paise to EBITDA scales beautifully. One where it flows 10 paise does not.",
      "Working capital is the third lens. Revenue growth is meaningless if it is funded by stretched payables and a ballooning receivable book. The cash conversion cycle tells the real story.",
      "Finally, quality. Which lines are recurring, which are one-time? Which are tied to contracts, which to handshakes? A well-structured P&L answers these if you look at it long enough — or CortexCFO will answer them for you in seconds.",
    ],
  },
  {
    slug: "month-end-close-checklist",
    title: "The month-end close checklist",
    category: "Playbooks",
    readMin: 4,
    summary:
      "A five-day close is not a luxury — it is the difference between reactive bookkeeping and proactive finance leadership.",
    body: [
      "Day 1 — Bank reconciliation. Pull all statements, match to books, resolve exceptions before anything else touches the ledger.",
      "Day 2 — AR and AP. Age the receivables, post invoices that were raised but not recorded, and reconcile vendor ledgers against your books.",
      "Day 3 — Inventory and fixed assets. Close the inventory count, run depreciation and capitalise work-in-progress that went live.",
      "Day 4 — Accruals, prepayments, payroll, withholding tax and sales tax entries. This is where most months fall apart — build a checklist and never miss a line.",
      "Day 5 — Management P&L, balance sheet, cash-flow statement and variance pack. Sign off and publish. By the fifth working day of the new month, you are done.",
    ],
  },

  // ---------------- Compliance & Standards ----------------
  {
    slug: "ind-as-115-revenue",
    title: "ASC 606 (Revenue) — Revenue recognition in five steps",
    category: "Compliance & Standards",
    readMin: 6,
    featured: true,
    summary:
      "ASC 606 (Revenue) replaced a patchwork of older rules with one five-step model. Getting it right protects your revenue from both auditors and investors.",
    body: [
      "Step 1 — Identify the contract. Oral understandings can count, but you need enforceability. Document scope, price and payment terms.",
      "Step 2 — Identify performance obligations. A software licence plus annual support is two obligations, not one. A sale-with-installation can also be two.",
      "Step 3 — Determine the transaction price. Strip out variable consideration (discounts, rebates, penalties) and estimate it separately.",
      "Step 4 — Allocate the price to each obligation. Use standalone selling prices; where those do not exist, build a cost-plus or residual estimate.",
      "Step 5 — Recognise revenue when — or as — each obligation is satisfied. Point-in-time for goods that transfer on delivery, over-time for services or long-term contracts.",
      "Two places where SMBs trip: AMCs recognised on billing date instead of pro-rata over the contract period, and project milestones billed but not earned. Both understate liability and overstate EBITDA.",
    ],
  },
  {
    slug: "schedule-iii-pnl",
    title: "Schedule III — the P&L format investors expect",
    category: "Compliance & Standards",
    readMin: 4,
    summary:
      "Every Indian company under the Companies Act 2013 must present financials in Schedule III format. For investor-grade books, this is the starting line, not the finish line.",
    body: [
      "Schedule III prescribes the order and classification of every line in your P&L and balance sheet. Revenue from operations sits above Other income. Expenses are grouped under specific heads: cost of materials consumed, employee benefits, finance costs, depreciation & amortisation and other expenses.",
      "Done right, the Schedule III P&L lets an investor compute EBITDA in under a minute. Done wrong — with revenue buried under Other income, finance costs bundled into Other expenses, or related-party flows lumped in — it triggers diligence flags.",
      "The most common SMB slip is the \"Other expenses\" bucket. It should be a catch-all, not a hiding place. Anything above 5% of total expenses deserves its own line or a disclosure note.",
    ],
  },
  {
    slug: "gst-reconciliation",
    title: "GST reconciliation essentials",
    category: "Compliance & Standards",
    readMin: 5,
    summary:
      "Your books, your Sales tax invoices and your Sales tax return should tell the same story every month. When they drift, the next sales tax notice is already being written.",
    body: [
      "There are three sales tax numbers that must match: revenue recognised in your books, output liability in Sales tax invoices, and net tax paid in Sales tax return. A gap of even 2-3% across months compounds into a meaningful assessment risk.",
      "Build a monthly reconciliation with four rows: revenue per books, revenue per Sales tax invoices, taxable value in Sales tax return, and the net differences with reasons. Typical causes of gap: credit notes posted in the wrong month, advances received, export invoices without LUT, and free-of-cost supplies.",
      "Input tax credit is the other leg. Your purchase register should match input tax reports. Any vendor invoice missing from input tax reports is an ITC your supplier has not paid — and therefore an ITC you will lose.",
    ],
  },

  // ---------------- Integrations & Data ----------------
  {
    slug: "export-trial-balance-tally",
    title: "Exporting Trial Balance from QuickBooks Online",
    category: "Integrations & Data",
    readMin: 2,
    summary:
      "CortexCFO reads any Trial Balance. QuickBooks Online exports one in four clicks — here is the clean way to do it.",
    body: [
      "Open QuickBooks Online and select the company. From Gateway of QuickBooks, go to Display More Reports > Trial Balance.",
      "Press F2 to set the period (the last closed month is the usual choice) and F5 for a detailed, account-level view.",
      "Press Ctrl+E to export. In the export window choose Excel (.xlsx) as the format, set \"Show vouchers\" to No and \"Closing balance only\" to Yes.",
      "Save the file and upload it to CortexCFO. We classify every account, run the ratio pack and generate the QoE lens automatically. The round-trip takes under a minute.",
    ],
  },
  {
    slug: "clean-chart-of-accounts",
    title: "What a clean chart of accounts looks like",
    category: "Integrations & Data",
    readMin: 4,
    summary:
      "A messy chart of accounts is the single biggest silent tax on decision speed in an SMB. Cleaning it up pays dividends every month.",
    body: [
      "A clean chart of accounts has three properties: every account maps to exactly one Schedule III line, related-party accounts are named rather than hidden inside regular vendor groups, and one-time or non-operating items have their own accounts so they can be stripped for EBITDA at will.",
      "Typical rot in an SMB chart: a \"Miscellaneous expenses\" account that absorbs five years of unclassified charges; a single \"Bank charges\" account that mixes forex losses with actual bank fees; promoter personal expenses posted to business accounts.",
      "The fix is mechanical but unglamorous. Run an exception list of any account with more than six distinct transaction types in a year. Reclassify or split. Then freeze the chart and document the rules. CortexCFO can generate this exception list from your trial balance in seconds.",
    ],
  },

  // ---------------- US GAAP & US-specific articles ----------------
  {
    slug: "us-gaap-vs-ifrs-essentials",
    title: "US GAAP vs IFRS — the essentials for US SMBs",
    category: "Compliance & Standards",
    readMin: 6,
    summary:
      "You don't need to know every FASB vs IASB nuance, but if you're raising from a cross-border investor you need to know where they diverge — inventory costing, lease accounting, R&D, and revenue.",
    body: [
      "US GAAP is rules-based and maintained by FASB; IFRS is principles-based and maintained by IASB. For a privately-held US SMB that isn't filing with the SEC, GAAP is functionally the only standard that matters — but cross-border investors and acquirers will ask how your books would look under IFRS.",
      "Inventory costing is the most famous divergence. US GAAP still permits LIFO; IFRS does not. Many US SMBs elected LIFO during inflationary periods to defer tax — if you later want IFRS-comparable statements, you'll recompute to FIFO or weighted average.",
      "Lease accounting under ASC 842 (GAAP) and IFRS 16 are more aligned than they used to be — both now bring operating leases onto the balance sheet. Practical difference: GAAP still distinguishes operating vs finance leases in the P&L (straight-line vs front-loaded), while IFRS collapses them.",
      "R&D costs are expensed immediately under US GAAP. IFRS lets you capitalize development-phase costs once they meet six technical and commercial criteria. For a US SaaS company capitalizing internal-use software under ASC 350-40, this is closer to IFRS than people realize.",
      "Revenue recognition under ASC 606 (GAAP) and IFRS 15 are nearly identical — both use the five-step model. If you're ASC 606-compliant, you're 95% of the way to IFRS 15.",
    ],
  },
  {
    slug: "asc-606-revenue-recognition-us",
    title: "ASC 606 revenue recognition for US SaaS and services",
    category: "Compliance & Standards",
    readMin: 7,
    featured: true,
    summary:
      "The five-step model turns every contract into disclosable performance obligations. For SaaS and multi-element services, this is the rule book that auditors and due-diligence teams run you through first.",
    body: [
      "ASC 606 applies to every US company with customer contracts, regardless of size. The five steps: (1) identify the contract, (2) identify the performance obligations, (3) determine the transaction price, (4) allocate that price to each obligation, (5) recognize revenue as you satisfy each one.",
      "For SaaS subscriptions, the typical treatment is a single performance obligation (access to the platform) satisfied over time, with revenue recognized ratably over the subscription term. Setup fees are usually rolled into the subscription if they don't transfer a distinct good or service.",
      "Multi-element arrangements are where auditors spend the most time. If your contract bundles a SaaS subscription with implementation services and training, each distinct element gets its own transaction-price allocation using the standalone selling price method.",
      "Variable consideration — usage-based fees, performance bonuses, volume discounts — has to be estimated and constrained so it's 'probable' that a significant reversal won't occur. This is the single most common 606 audit finding: overly aggressive variable-consideration estimates.",
      "Contract costs under ASC 340-40 must be capitalized and amortized. Sales commissions paid on a multi-year contract are spread over the contract's benefit period, not expensed in the month they're paid. This alone reshapes many SMB P&Ls.",
    ],
  },
  {
    slug: "asc-842-lease-accounting",
    title: "ASC 842 — bringing operating leases onto the balance sheet",
    category: "Compliance & Standards",
    readMin: 6,
    summary:
      "Effective for private companies from FY2022, ASC 842 forces every lease longer than 12 months onto the balance sheet as a right-of-use asset and lease liability. Most SMBs are still catching up.",
    body: [
      "Under the old standard (ASC 840), operating lease payments hit rent expense and the obligation sat off-balance-sheet. Under ASC 842, operating leases create a right-of-use (ROU) asset and a lease liability on day one, using the present value of remaining payments discounted at the incremental borrowing rate.",
      "The P&L still looks similar: operating leases continue to show a straight-line rent expense. Finance leases (mostly equipment financing dressed as a lease) split into depreciation + interest, with front-loaded expense.",
      "For SMBs, the balance-sheet impact is the surprise. A five-year office lease at $120K/year adds roughly $500K to both assets and liabilities on day one. Covenant ratios that reference total debt suddenly look very different — and most SMB loan covenants aren't written to exclude ROU liabilities.",
      "The practical lift: extract every lease with a term over 12 months, discount the remaining payments, and capitalize. Month-over-month, amortize the ROU asset and unwind the liability against each payment. We automate this for clients — it's one of the quickest quality-of-earnings wins on US engagements.",
    ],
  },
  {
    slug: "us-sales-tax-nexus",
    title: "US sales tax: nexus rules and the Wayfair test",
    category: "Compliance & Standards",
    readMin: 5,
    summary:
      "Since South Dakota v. Wayfair (2018), online sellers owe sales tax in every state where they cross an economic-nexus threshold — typically $100K of in-state sales or 200 transactions.",
    body: [
      "Pre-2018, sales tax obligations required physical presence (an office, warehouse, or employee). Wayfair replaced that with economic nexus: cross a revenue or transaction threshold in a state and you owe its sales tax, even with no boots on the ground.",
      "Thresholds vary by state but the most common are $100K of gross receipts OR 200 separate transactions in the prior or current calendar year. Some states use only dollars (California is $500K); a handful use only transactions.",
      "Sales of services are often exempt, but SaaS is the gray zone. Twenty states now tax SaaS as tangible personal property — New York, Texas, Washington, Pennsylvania, and Massachusetts are the high-dollar jurisdictions where SaaS companies most often trip up.",
      "For US SMBs expanding fast, the playbook: run a monthly nexus-exposure report against a tool like Avalara or TaxJar; register proactively in states where you're within 20% of threshold; and build sales-tax collection into your billing engine before volume forces the issue. A voluntary disclosure program costs 10% of what a look-back assessment does.",
    ],
  },
  {
    slug: "1099-filing-for-contractors",
    title: "1099-NEC filing — the contractor compliance most SMBs get wrong",
    category: "Compliance & Standards",
    readMin: 4,
    summary:
      "If you paid any non-employee contractor over $600 in the year, you owe them a 1099-NEC by January 31. Get this wrong and the IRS fines you per form.",
    body: [
      "Form 1099-NEC (re-introduced in 2020) is for reporting payments of $600+ to independent contractors, freelancers, and other non-employees. The old 1099-MISC is still used for rent, royalties, and miscellaneous payments — but contractor payments now belong on NEC.",
      "Before you can file, you need a Form W-9 on file for every contractor showing their legal name, TIN, and entity type. Collect W-9s BEFORE issuing the first payment, not at year-end — chasing a contractor for a W-9 in January is a well-known nightmare.",
      "Deadlines are tight: 1099-NECs are due to contractors AND the IRS by January 31. Late filing penalties range from $60 to $630 per form depending on how late, capped at $3.5M/year for larger filers.",
      "Common traps: payments to LLCs taxed as partnerships DO require a 1099; payments to S-corps and C-corps generally don't; payments via credit card or a third-party network like PayPal are reported by the payment processor on 1099-K, so you don't double-report; but payments via check, ACH, or wire DO require you to file.",
    ],
  },
  {
    slug: "delaware-c-corp-fundamentals",
    title: "Why most US startups are Delaware C-corps",
    category: "Core Concepts",
    readMin: 5,
    summary:
      "For a US SMB planning an institutional raise or exit, Delaware C-corp is the default structure — not because it's best for taxes, but because it's what sophisticated investors expect.",
    body: [
      "Delaware's Court of Chancery has spent 200+ years developing case law on corporate governance. That precedent creates certainty: M&A lawyers, VC funds, and acquirers all know exactly how disputes will be adjudicated. Incorporating elsewhere means buying uncertainty you don't need.",
      "The C-corp structure itself is chosen over LLC or S-corp because C-corps can issue multiple classes of stock (preferred vs common — essential for venture rounds), accommodate unlimited shareholders including foreign and institutional, and qualify for QSBS exclusion under Section 1202 (up to $10M or 10x basis in federal cap-gains exclusion on sale).",
      "Downsides: double taxation (corporate tax then dividend tax on distributions), more compliance (annual franchise tax in Delaware + the state where you operate), and board formalities. For a bootstrapped SMB with no fundraising plans, an LLC taxed as an S-corp is usually simpler.",
      "When to convert: if you're raising a priced round, most term sheets will require a Delaware C-corp conversion as a closing condition. The conversion is mechanical (file a Certificate of Conversion, issue new stock certificates, update the cap table) but legal fees run $5-15K, so plan for it.",
    ],
  },
  {
    slug: "adjusted-ebitda-addbacks-us",
    title: "US QoE: the add-backs buyers scrutinize most",
    category: "Playbooks",
    readMin: 6,
    featured: true,
    summary:
      "Every PE buyer and strategic acquirer builds their own adjusted-EBITDA bridge. Knowing which add-backs hold up to diligence — and which get rejected — protects your valuation.",
    body: [
      "US QoE diligence focuses on quality and sustainability of earnings. The buyer's adjusted-EBITDA starts with reported EBITDA and adds back: (1) one-time legal and M&A costs, (2) owner compensation in excess of market rate, (3) personal expenses run through the business, (4) discontinued product lines, (5) rent paid to owner-related entities above market.",
      "Owner compensation add-backs are the single biggest bucket and the most contested. Buyers will benchmark your owner's salary against BLS data for your industry and geography, then add back only the premium. A founder taking $500K in a role BLS says pays $250K will see a $250K add-back — not $500K.",
      "Related-party rent is aggressive when the building is owned by the founder's holding company. Buyers want to see a fair-market-rent analysis before accepting any adjustment; self-serving numbers get cut.",
      "The category most often rejected: 'growth investments.' Founders try to add back marketing spend they consider 'strategic' rather than operating. Buyers almost never allow this — if the spend was necessary to produce the revenue being bought, it's an operating cost, period.",
      "What holds up consistently: true one-time events with documentation (a discrete lawsuit settlement, a one-off system migration, a completed pre-sale restructuring). Build a schedule at close-of-books each month so the trail is real, not reconstructed.",
    ],
  },
  {
    slug: "us-401k-setup-for-smbs",
    title: "Setting up a 401(k) for a growing US SMB",
    category: "Playbooks",
    readMin: 5,
    summary:
      "At 10+ employees a 401(k) becomes table stakes for hiring. The Safe Harbor design simplifies compliance and keeps highly-compensated employees eligible without annual discrimination testing.",
    body: [
      "Three plan designs dominate US SMBs: traditional 401(k) (flexible match but annual non-discrimination testing), Safe Harbor 401(k) (mandatory 3-4% employer contribution, skips testing), and SIMPLE IRA (under 100 employees, lower contribution limits, no loans).",
      "Safe Harbor is the most common pick at the 10-50 employee stage. Employer contributes either a 3% non-elective contribution for all eligible employees, OR a basic match (100% of first 3%, 50% of next 2%). Trade-off: mandatory contribution but no ADP/ACP testing stress.",
      "Cost structure: setup is $1-3K, ongoing plan administration runs $2-5K/year for a provider like Guideline or Human Interest, plus 0.05-0.15% of AUM in participant fees. Employer match typically costs 3-4% of payroll if maxed.",
      "Compliance deadlines to calendar: plan document in place before year starts, participant notices 30-90 days before plan year, Form 5500 by July 31 of year after. A TPA (third-party administrator) handles most of this — don't try to DIY after first 20 employees.",
    ],
  },
  {
    slug: "r-and-d-tax-credit-us",
    title: "The R&D tax credit (Section 41) — an under-claimed SMB benefit",
    category: "Playbooks",
    readMin: 5,
    summary:
      "The federal R&D credit gives you 6-14% back on qualifying research wages, supplies, and contractor costs. Most SMB founders don't realize their product engineering qualifies.",
    body: [
      "Section 41 rewards 'qualified research activities' — work intended to discover technological information, involving a process of experimentation, aimed at a new or improved product, process, or software. In practice this covers a huge portion of what SaaS and engineering-driven SMBs do daily.",
      "Qualifying costs: W-2 wages for engineers, designers, and QA; contractor payments (at 65% of gross); supplies consumed in R&D; and cloud-compute costs used in development. Non-qualifying: routine maintenance, customer support, sales and marketing, and general admin.",
      "The credit is 14% of the amount by which current-year QREs exceed a base period (alternative simplified credit). For a pre-profit startup, Section 41 also allows up to $500K/year to be applied against payroll taxes — so the credit is usable even without income-tax liability.",
      "Documentation is the gating issue. Build a project tracker showing the technical uncertainty, the experiments run, and the employees' time allocated. If you can't produce project-level contemporaneous records, the IRS denies the claim in audit — this is the single most common loss in R&D credit disputes.",
    ],
  },
  {
    slug: "us-financial-statement-format",
    title: "The US GAAP financial statement format investors expect",
    category: "Core Concepts",
    readMin: 4,
    summary:
      "A clean, comparable set of US financials has three statements — balance sheet, income statement, cash flow — plus a statement of stockholders' equity. Notes are where diligence lives.",
    body: [
      "The balance sheet is presented in a classified format: current assets / non-current assets / current liabilities / non-current liabilities / equity. Most SMBs botch the current/non-current split — anything expected to convert to cash or be settled within 12 months is current.",
      "The income statement (under GAAP) can use a single-step or multi-step format. Multi-step is investor-preferred because it separates gross profit (revenue minus COGS), operating income (gross profit minus operating expenses), and net income (operating income plus/minus non-operating items and taxes).",
      "The cash flow statement under ASC 230 reconciles net income to actual cash movement, with three sections: operating, investing, financing. The indirect method is used by 99% of US SMBs and is what auditors expect to see.",
      "The statement of stockholders' equity tracks share issuances, repurchases, and retained earnings over time. Neglected by most SMBs but the first thing a venture-backed company's auditor asks for — it's how they verify cap table activity flows through to the books.",
    ],
  },
  {
    slug: "export-trial-balance-quickbooks",
    title: "Exporting Trial Balance from QuickBooks Online",
    category: "Integrations & Data",
    readMin: 2,
    summary:
      "CortexCFO reads any Trial Balance. QuickBooks Online exports one in under a minute — here's the cleanest path.",
    body: [
      "In QuickBooks Online, navigate to Reports > Accountant & Taxes > Trial Balance. Click the report name to open.",
      "Set the date range to the period you want to upload (last closed month is the usual choice). Leave 'Accounting method' on Accrual unless you specifically file on a cash basis.",
      "Click the Export icon (top right), choose 'Export to Excel'. Save as .xlsx.",
      "Upload the file to CortexCFO. Our GL parser auto-detects QuickBooks Online's column format (Account / Debit / Credit), classifies every account into a clean chart, runs the ratio pack, and generates the QoE lens automatically. Under a minute end-to-end.",
    ],
  },

  // ==================================================================
  //  US DEAL PITFALLS — patterns we see repeatedly in US QoE
  //  engagements. Each entry is written from real findings across
  //  multiple diligence engagements; the advice is operator-grade, not
  //  textbook. Ranked roughly by how often each pitfall kills a deal.
  // ==================================================================
  {
    slug: "revenue-bank-statement-variance",
    title: "When your P&L and your bank statements tell different stories",
    category: "US Deal Pitfalls",
    readMin: 6,
    featured: true,
    summary:
      "The first thing any competent QoE team does is a proof-of-cash — reconcile reported revenue against actual bank deposits. We regularly see 20–65% variances. If you can't close that gap in an hour, buyers walk.",
    body: [
      "Proof of cash is the single most important — and most under-appreciated — step in US financial due diligence. The logic is simple: if the revenue in your P&L exceeds what actually hit the bank, something is either mistimed or misstated. Every serious buyer will reconcile your top-line revenue against your bank statements month by month before they discuss valuation.",
      "What we typically find: a 10–15% variance that's explained by legitimate timing (credit card batches, platform holdback periods, intercompany sweeps). A 30–65% variance that's explained by revenue booked but never collected, aggressive cut-off manipulation, or misapplied customer deposits. Either way, the buyer's team marks it for further investigation — and re-trades the purchase price if the gap isn't closed.",
      "The remedy is mechanical: pull 24 months of bank statements, tag every deposit against the invoice or customer it represents, flag unreconciled items. In a healthy business, 95%+ of revenue ties cleanly to a bank deposit within 7–45 days. In a problematic one, the trail goes cold — and that's the exact moment a deal enters re-trade territory.",
      "For founders preparing for exit: run your own proof of cash before the buyer's team does. When the gap surfaces in your own pre-diligence, it's a correctable accounting issue. When it surfaces in the buyer's diligence, it's a valuation haircut.",
    ],
  },
  {
    slug: "marketplace-revenue-concentration",
    title: "One-channel revenue: the 90% Amazon problem",
    category: "US Deal Pitfalls",
    readMin: 5,
    featured: true,
    summary:
      "We've worked engagements where 90%+ of revenue came from a single marketplace (Amazon, Shopify, DoorDash). Buyers treat this as a platform-risk discount of 15–30% on multiple — and sometimes refuse to close at all.",
    body: [
      "Channel concentration is one of the most under-appreciated value killers in US lower-middle-market deals. A business selling $4M a year looks the same on paper whether the customers come from one channel or twenty. But to a buyer, those are two completely different businesses — and the valuation reflects that.",
      "The pattern we see: a D2C brand or aggregator that built on Amazon or Shopify gets 85–95% of revenue from that one platform. Marketing spend is 35–45% of sales, with 90%+ of that going to the same platform's ad network. The platform can change fees (Amazon's referral fee, FBA storage, closing fee), tighten attribution, suspend the listing, or launch a competing private-label SKU any quarter. A single policy change can wipe out 30% of EBITDA overnight.",
      "The buyer math: if the platform holds the gun, the seller loses the multiple. A business with 60%+ channel concentration trades at 3–4x vs a diversified peer at 6–7x. That's a 30–40% valuation haircut — on top of any operational flags from the diligence.",
      "The fix takes 12–24 months. Launch a D2C site and drive 15% of revenue through it. Open a wholesale channel (Walmart Marketplace, Target Plus, Faire). Build an email list with direct replenishment. Diversify ad spend beyond the platform's own ad product. Buyers reward the diversification trajectory, not just the endpoint — start early.",
    ],
  },
  {
    slug: "owner-compensation-normalization-us",
    title: "Owner pay is the add-back buyers scrutinize first",
    category: "US Deal Pitfalls",
    readMin: 5,
    featured: true,
    summary:
      "Every US founder we've taken to market has an above-market salary. The buyer's team will benchmark it, add back the premium, and reject the add-back of the base. Here's how to structure it so the adjustment holds.",
    body: [
      "In nearly every US lower-middle-market QoE we've run, the single biggest EBITDA add-back is owner compensation. It's also the most contested. Founders and management both know the number is inflated — but what the add-back should be, and how it's documented, decides whether the buyer accepts it or rejects it at the committee review.",
      "The rule buyers actually use: benchmark the owner's role against BLS data (or a sector-specific comp study) for their city and industry, then add back only the premium. A founder paying himself $500K in a role BLS pegs at $250K gets a $250K add-back — not $500K. Buyers that see the full $500K proposed will reject it entirely, which is worse than a conservative starting position.",
      "Related-party rent and management fees are the close second. If the founder owns the building through a separate entity and the Company pays above-market rent, the excess is an add-back. If there's a shared-services LLC charging 3% of revenue for 'management services' without a clear deliverable, that's an add-back too. We've seen $3.3M a year flagged in one engagement — where the shared-services entity ran payroll, IT, and HR for five related companies and inflated the fee to keep a specific margin at the parent.",
      "What doesn't hold: 'strategic investments' the founder wants added back as one-time. Marketing spend that drove the revenue being purchased, consulting fees that recur every year, and travel that's clearly both business and personal. Documentation is the gating criterion — without a contemporaneous record, buyers cut the add-back to zero.",
    ],
  },
  {
    slug: "related-party-transactions-us",
    title: "Related-party flows: the hidden discount on every founder-led business",
    category: "US Deal Pitfalls",
    readMin: 5,
    summary:
      "A third of the closely-held US businesses we've diligenced had material related-party flows not separately disclosed. Buyers price this as risk — and the pricing is conservative.",
    body: [
      "Related-party transactions show up in three flavors in US lower-middle-market deals: above-market rent to owner-held real estate, management fees to a shared-services entity under common control, and inventory or services from a sister company at non-arm's-length pricing. All three require disclosure, documentation, and normalization before a buyer will accept the headline EBITDA.",
      "The FASB framework is ASC 850. It requires disclosure of the nature of the relationship, the nature and amount of the transactions, and the terms. In practice, what we find in unaudited financials: a rent line item with no supporting lease document, a 'consulting fee' that goes to the founder's wife's LLC, a purchase of inventory from a sister entity at a markup embedded in COGS, or management fees that compound to 5–8% of revenue with no clear deliverable.",
      "The buyer's playbook: if the amounts are material (>1% of revenue or >5% of EBITDA), require a fair-market-rate analysis before accepting any add-back. If the arrangement continues post-close, bake the new rate into the forecast. If the arrangement ends at close (because the related entity is excluded from the transaction), model the replacement cost — because you WILL need to pay market for that service going forward.",
      "For founders: disclose early, disclose comprehensively, and be ready with the fair-market analysis. Related-party flows that surface mid-diligence don't just reduce EBITDA — they introduce trust issues that compound every other finding. Transparency up front is worth 0.5–1.0x of multiple.",
    ],
  },
  {
    slug: "personal-expenses-in-business",
    title: "The personal-expense audit: $50K in add-backs, $200K in buyer skepticism",
    category: "US Deal Pitfalls",
    readMin: 5,
    summary:
      "Company cars, club memberships, 'client entertainment' trips, spouse on payroll — every US diligence finds them. The problem isn't the expenses themselves. It's what they signal about everything else in the books.",
    body: [
      "In every closely-held US business we've diligenced, management has run some personal expenses through the entity. It's so common that buyers don't moralize about it — they just adjust for it. But the size and type of the personal-expense pattern tells the buyer a great deal about the rigor of the financial reporting, and therefore about what ELSE might be misstated.",
      "The categories that almost always need normalization: personal auto (company car used 100% personally but deducted as business), club and gym memberships, personal travel coded as 'client entertainment,' charitable donations in the founder's name, gifts to family, home office expenses for a home that isn't a home office, subscriptions the business doesn't use. A typical lower-middle-market QoE will identify $30K–$80K of these per year across 10–15 line items.",
      "Legitimate add-backs all share three features: (1) they don't recur post-close because the buyer won't incur them, (2) the nature is clearly non-operating (a founder's sailing club membership vs an industry conference), and (3) management can document the personal vs business split. Without those three, the add-back is rejected.",
      "The cumulative effect on buyer confidence is where it hurts. A business with well-organized add-backs and clear documentation gets a 0.5x premium on multiple vs one that has to be forensically unpacked. Run the exercise yourself 12 months before going to market — put the personal expenses on an owner distribution line where they belong.",
    ],
  },
  {
    slug: "working-capital-intercompany-ar",
    title: "Normalized working capital: the deal's other price tag",
    category: "US Deal Pitfalls",
    readMin: 6,
    summary:
      "Buyers buy cash flow, but they also inherit working capital. The NWC peg — set during diligence — is the second-largest dollar item in most US M&A deals. Getting it wrong costs more than getting the EBITDA wrong.",
    body: [
      "Every US M&A transaction includes a working-capital peg: the level of NWC the business is expected to deliver at closing. The buyer and seller negotiate a target (usually the trailing 12-month average). If actual NWC at closing exceeds the target, the seller gets more cash; if it's below, the buyer does. A $50M deal can easily swing $1–3M based on the peg calculation alone.",
      "What gets adjusted out of reported NWC to arrive at 'normalized' NWC: intercompany due-to / due-from balances (we've seen single entries of $357K excluded), trade receivables aged beyond their stated credit term (typically 30 days past due), related-party receivables where recoverability is uncertain, non-operating accruals like property tax and TDS, customer deposits tied to contracts that won't transfer, and inventory that's obsolete or consigned.",
      "What gets added back in: accrued payroll if it's within normal cycles, current-period tax accruals that the seller is responsible for, accrued bonuses and commissions tied to revenue earned pre-close. Every one of these requires documentation — and the documentation needs to be contemporaneous, not reconstructed.",
      "For sellers: run a 24-month NWC trend before going to market. If trailing 12-month NWC is rising (bad — cash is being consumed by the cycle), understand why and be ready to explain. If it's falling (good — cycle is tightening), showcase it. The peg gets set in diligence; the story gets set before diligence.",
    ],
  },
  {
    slug: "unaudited-financials-year-end",
    title: "Unaudited financials: what buyers do with the 6-month gap",
    category: "US Deal Pitfalls",
    readMin: 4,
    summary:
      "Most lower-middle-market US businesses run unaudited. Trailing twelve months includes a period without year-end adjustments. The gap is where the surprises hide.",
    body: [
      "US lower-middle-market businesses typically don't carry a full audit. They have a bookkeeper producing monthly financials, a CPA preparing the tax return, and a year-end set of adjusting entries that happens 3–6 months after year-end. When a buyer looks at TTM (trailing twelve months) data, half of it usually reflects pre-adjustment bookkeeping — not final numbers.",
      "The adjustments that typically materialize at year-end and get missed in interim data: revenue cutoff (receivables recorded in the wrong period), inventory count adjustments, prepaid amortization, accrued expenses (commissions, bonuses, payroll taxes, legal fees), depreciation catch-up, deferred revenue true-ups, and bad-debt provisions. The cumulative effect is often 1–3% of revenue in net EBITDA.",
      "The way professional buyers handle it: assume that TTM EBITDA will be re-stated down by 1–3% after year-end adjustments. Either build that into the valuation, require an adjusted TTM before close, or hold a portion of the purchase price in escrow until the year-end close is complete and adjustments are known.",
      "For founders: if you're going to market with a TTM that includes unaudited months, have your CPA run a preliminary year-end review before the data room opens. The cost is $5–10K; the value in pricing defense is 3–5x that.",
    ],
  },
  {
    slug: "capex-replacement-under-reporting",
    title: "The $0 balance sheet: when your assets are 'fully depreciated' but still running",
    category: "US Deal Pitfalls",
    readMin: 4,
    summary:
      "We've seen businesses where 100% of the fixed asset base is fully depreciated and carries $0 net book value — yet the assets are still the backbone of operations. Buyers see a major capex overhang no one has priced in.",
    body: [
      "One of the cleanest signals of under-reported capex is a fixed asset schedule where 95–100% of assets are fully depreciated. The P&L looks great (no depreciation hit to EBITDA, no capex line in the cash flow), but the buyer's operational team sees a business about to need a major asset refresh — and prices it accordingly.",
      "The pattern typically has three drivers: (1) the owner bought equipment 8–12 years ago and has been running it hard, (2) the accounting depreciation schedule (often 5–7 years MACRS) completed well before the economic useful life, and (3) maintenance capex has been booked through repairs and maintenance expense rather than capitalized. Each of those is defensible on its own. Together, they create a significant capex overhang the buyer has to fund post-close.",
      "The way the buyer models it: estimate replacement cost for each critical asset category (production equipment, delivery vehicles, IT infrastructure, real estate mechanicals), amortize the replacement over the remaining useful life, and treat that amortization as a normalized capex subtraction from EBITDA. In one recent engagement, this single adjustment was $2M annually on a $12M EBITDA business — a 17% EBITDA haircut, worth $8–12M of enterprise value at typical multiples.",
      "For sellers: if you have fully depreciated assets still in service, get a third-party replacement-cost appraisal before diligence. Including the appraisal in the data room preempts the most aggressive buyer adjustment — you'll keep 0.25x–0.5x of the multiple.",
    ],
  },
  {
    slug: "franchise-compliance-risks",
    title: "Franchise deals: the minimum-revenue clause most sellers miss",
    category: "US Deal Pitfalls",
    readMin: 4,
    summary:
      "Franchise agreements almost always include minimum revenue or billing-hours clauses. Miss them and the franchisor can terminate or revoke exclusivity. We regularly find non-compliance buried in the fine print.",
    body: [
      "US franchise agreements — especially in home health, senior care, restaurants, and fitness — typically include protected-territory clauses coupled with minimum-performance obligations. If the franchisee fails to hit minimum gross sales, minimum client hours, or minimum billing volumes, the franchisor has the right to reduce the protected area, appoint an adjacent franchisee, or terminate the agreement.",
      "The diligence flag we find most often: unaudited internal reports show the franchisee has been at 70–80% of the minimum for multiple consecutive periods, but no notice has been issued by the franchisor. That's not a safety signal — it's a ticking clock. Once the franchisor flags non-compliance (often triggered by a change-of-control request), the buyer is suddenly acquiring a business with an unstable territorial moat.",
      "The second common flag: insurance coverage mismatches. The franchise agreement requires specific coverages (EPLI, umbrella liability, professional/E&O, abuse and molestation for care businesses), and the Company has let one lapse. Reinstating costs are usually minor; the deal risk is that the franchisor uses the lapse as a termination hook during the change-of-control review.",
      "For franchisee-sellers: pull the full franchise agreement 90 days before going to market. Pull your trailing 24 months of performance against every stated minimum. Pull current insurance certificates and compare against the schedule of required coverages. Fix everything before the buyer's lawyers read it. The cost of repair is 1/10 the cost of renegotiating purchase price after a finding.",
    ],
  },

  // ==================================================================
  //  HEALTHCARE SECTOR — adapted from the blog corpus (27 sector
  //  topics). These are the healthcare-specific QoE patterns that
  //  don't get covered by generic templates. Useful for both PE
  //  buyers screening targets and sector-specialist sellers.
  // ==================================================================
  {
    slug: "healthcare-qoe-sector-specific",
    title: "Why generic QoE templates fail in US healthcare",
    category: "Healthcare Sector",
    readMin: 6,
    featured: true,
    summary:
      "Healthcare deals carry risks no other sector does — payer concentration, coding clawbacks, physician-owner pay, value-based care performance bonuses. A generic QoE misses most of them.",
    body: [
      "Healthcare is the sector where a generic QoE template does the most damage. The revenue engine runs on reimbursement codes from payers with different rules, timing, and denial rates. Earnings are materially affected by coding accuracy (upcoding risk), payer mix shifts, and bundled-payment contracts whose economics change every contract cycle. A template designed for manufacturing or services will systematically under-weight the risks that actually drive valuation.",
      "The four healthcare-specific adjustments that are almost always needed: (1) normalization of physician-owner compensation against BLS MGMA benchmarks, not peer private-company averages; (2) adjusted EBITDA for COVID-era relief income (PPP, Provider Relief Fund, ARP) which is non-recurring; (3) treatment of value-based-care performance bonuses — are they sustainable run-rate or episodic upside?; and (4) denial rates and bad-debt provisions normalized to sector averages (3–5% for commercial, 8–12% for Medicaid).",
      "The diligence areas generic templates miss entirely: coding practices (upcoding vs undercoding, and what a CMS Recovery Audit Contractor would find), payer-mix variance (a drop from 60% commercial to 45% commercial changes net yield by 8–12%), reimbursement-delay exposure (claims in the Medicare appeals process), and the regulatory landscape for any stipend arrangements (Stark Law, Anti-Kickback Statute).",
      "For PE buyers: engage a sector-specialist QoE team for any healthcare deal above $5M EBITDA. For sellers: a pre-transaction healthcare-specific QoE is worth 2–3x the buyer's generic QoE in your own pricing defense.",
    ],
  },
  {
    slug: "physician-compensation-normalization",
    title: "Normalizing physician-owner compensation: the MGMA benchmark trap",
    category: "Healthcare Sector",
    readMin: 5,
    summary:
      "Every PE buyer in physician practice management uses MGMA (Medical Group Management Association) benchmarks to normalize owner pay. Miss the percentile conversation and you leave multiple on the table.",
    body: [
      "In physician practice management (PPM) deals, owner-physician compensation is almost always the largest add-back — and the most contested. The benchmark everyone uses is MGMA (or AMGA, or Sullivan Cotter for academic settings). The conversation is about which percentile your physician's true market comp sits at: 50th, 65th, 75th, 90th. That single decision can swing EBITDA by $200–500K per physician.",
      "The factors that move a physician up the percentile ladder: specialty (cardiology >= primary care), geography (NYC / Bay Area > rural), productivity (wRVUs in top quartile), subspecialty board certification, and book of business (established patient panel). A family physician at $300K in a low-cost market is probably at 60th percentile. The same number in San Francisco is 40th percentile.",
      "How buyers actually structure the adjustment: calculate the physician's current compensation, pull MGMA median and 75th percentile for their specialty and region, use the 65th percentile as the 'market replacement' rate unless the physician has documented top-quartile productivity. The delta between current pay and the replacement rate is the add-back. Pay above 90th percentile almost never gets fully added back — buyers assume some portion is deserved productivity compensation.",
      "The Stark-Law / Anti-Kickback overlay: if the physician-owner has ownership interest in ancillary services (imaging, labs, PT) and refers patients to those services, the compensation structure has to be documented as fair market value (FMV) under Stark. Post-close, buyers require FMV opinions for every compensation arrangement — factoring that cost into deal economics.",
    ],
  },
  {
    slug: "payer-mix-concentration",
    title: "Payer mix: the concentration risk buyers actually care about",
    category: "Healthcare Sector",
    readMin: 5,
    summary:
      "'Top 10 customers = 80% of revenue' is one kind of concentration. Healthcare has a worse kind: payer concentration, where a single Medicare rate change can wipe out 20% of EBITDA overnight.",
    body: [
      "Customer concentration in healthcare means something different from any other sector. Customers are patients, but the people actually paying are insurance carriers — and five of them (Medicare, Medicaid, United, Anthem, BCBS affiliates) pay for the vast majority of US care. A healthcare business can have 20,000 patients and still have 60% of revenue riding on a single payer's reimbursement decision.",
      "Why this is different from channel concentration: payer rates can change unilaterally. Medicare's annual Physician Fee Schedule update can move a specialty's reimbursement by 3–8% in either direction. Medicaid rates vary by state and can be cut mid-year in a budget crisis. Commercial payers renegotiate contracts every 2–3 years, usually demanding rate concessions tied to UCR (usual, customary, reasonable) benchmarks the payer controls.",
      "What professional buyers look for: net yield per unit (visit, procedure, RVU) broken out by payer, trend over trailing 36 months, and scenario modeling of a 5% cut to the top-two payers. If the business can't survive a 5% cut without falling below covenant thresholds, the payer mix is a deal-structure issue, not a commercial risk.",
      "The mitigation strategies buyers reward: (1) growth of self-pay / concierge / direct-contract segments, (2) participation in value-based-care contracts that include upside, (3) entry into employer-direct or narrow-network contracts where pricing is negotiated individually, and (4) geographic diversification across states with different Medicaid rates. A 10-percentage-point move toward any of these typically gets 0.25–0.5x of multiple credit.",
    ],
  },
  {
    slug: "home-health-pdgm-lupa",
    title: "Home health post-PDGM: the 30-day billing reality",
    category: "Healthcare Sector",
    readMin: 5,
    summary:
      "The Patient-Driven Groupings Model (PDGM) changed home health reimbursement from 60-day episodes to 30-day billing cycles. LUPA thresholds moved. Margin compression is real. QoE has to map it.",
    body: [
      "The Patient-Driven Groupings Model (PDGM) took effect January 2020 and remains the most significant change in home health reimbursement in 20 years. It moved the unit of payment from a 60-day episode to a 30-day billing cycle, split each period into early vs late (with lower rates for late), reduced the LUPA (Low Utilization Payment Adjustment) threshold structure, and introduced case-mix adjustment based on clinical grouping.",
      "The margin impact has been significant and uneven. Agencies with a high mix of behavioral-diagnosis referrals (PDGM clinical group 5, 6) gained. Agencies dependent on musculoskeletal / neuro rehab cases (groups 1–4) lost. Agencies that couldn't staff a sufficient number of visits per period fell into LUPA more frequently — each LUPA flip costs $1,200–1,800 in reimbursement per period.",
      "What healthcare QoE has to map: trailing 36-month revenue broken by clinical grouping, LUPA rate trend (industry is 8–12%, above 15% is a structural problem), visits per period trend (productivity signal), staffing cost per visit, and referral-source mix (hospitals vs physician offices vs SNFs). The goal is to distinguish a business that's adapting to PDGM from one that's bleeding margin and hasn't realized it yet.",
      "The specific add-backs buyers will challenge: any treatment of LUPA losses as 'one-time,' any value-based-payment performance incentives booked as recurring, CAAP (Cost Accounting Advance Payment) repayments pushing through working capital, and labor cost inflation that outpaces Medicare's annual market-basket update (which it has, in 2023, 2024, and 2025).",
    ],
  },
  {
    slug: "value-based-care-earnings",
    title: "Value-based care EBITDA: sustainable run-rate or shiny episode?",
    category: "Healthcare Sector",
    readMin: 5,
    summary:
      "As healthcare moves from fee-for-service to value-based care, QoE has to distinguish the shared-savings bonus that shows up every year from the one that landed once and won't return.",
    body: [
      "Value-based-care (VBC) contracts — Medicare ACO participation, Medicare Advantage shared savings, commercial shared-risk arrangements — are increasingly common in US primary care, specialist practices, and health systems. They also distort EBITDA in ways a generic QoE misses.",
      "The structure: the provider earns fee-for-service as a floor, plus a shared-savings bonus if their attributed patient population costs less than benchmarks. Bonuses arrive 12–18 months after the performance year, lump-sum, and can be 5–30% of total revenue in a single quarter when they land. They also reverse — if the next year's cost comes in above benchmark, shared losses claw back previous income.",
      "QoE treatment: distinguish the sustainable run-rate VBC bonus (consistent year-over-year, evidence of actuarial capability, strong primary-care infrastructure) from an episodic outlier (one lucky year of benign utilization). Buyers use a 36-month rolling average for run-rate, excluding any single year that's more than 2 standard deviations from trend.",
      "The specific disclosure and documentation requirements: the provider must be able to produce (1) the benchmark methodology for each VBC contract, (2) the true-up timing — when performance-year bonuses are recognized vs when cash arrives, (3) the two-sided risk exposure — what happens in a bad year, and (4) the capability evidence: case-management staffing, care-coordination infrastructure, clinical protocols. Without the infrastructure, the bonus isn't repeatable.",
    ],
  },
  {
    slug: "behavioral-health-authorization-limits",
    title: "Behavioral health diligence: authorization limits and the retention problem",
    category: "Healthcare Sector",
    readMin: 4,
    summary:
      "Behavioral health and substance-use clinics look high-margin on paper, but authorization limits, state-funding exposure, and patient retention create earnings volatility generic QoE can't catch.",
    body: [
      "Behavioral health — outpatient therapy, IOP (intensive outpatient), PHP (partial hospitalization), substance-use treatment — has been a high-flow PE investment area since 2019. The margin profile looks attractive: 55–65% gross, 20–30% EBITDA. But the underlying business has three risks that compound in diligence.",
      "First: authorization limits. Most commercial payers cap the number of therapy sessions, IOP/PHP days, or substance-use episodes per member per year. Revenue growth can reflect volume growth OR it can reflect patients running up to their authorization ceiling. The QoE has to distinguish new-patient growth from continuing-patient-to-ceiling growth — the latter is much less sustainable.",
      "Second: state funding. Many behavioral-health providers are heavily exposed to Medicaid and state block grants. Medicaid rate changes vary by state and can happen mid-year. Substance-use providers specifically are exposed to Opioid Settlement Funds, SAMHSA grants, and state-specific recovery funds — all of which are time-limited and policy-dependent.",
      "Third: patient retention and outcomes. Behavioral health has the highest voluntary drop-off rate in healthcare — often 30–50% of referrals never complete an initial assessment, and another 30% drop out before treatment goals are met. QoE needs to map cohort retention by diagnosis, and verify that trailing revenue isn't propped up by one cohort that's finishing out.",
    ],
  },
  {
    slug: "dental-mso-chain-diligence",
    title: "Dental MSO diligence: lab cost variance and the doctor-turnover trap",
    category: "Healthcare Sector",
    readMin: 4,
    summary:
      "Dental support organizations (DSOs) have been one of the most active PE consolidation themes of the last five years. They also have three specific diligence traps generic QoE misses.",
    body: [
      "Dental MSO / DSO (dental support organization) consolidation has been one of the most active PE themes of the last five years. The thesis is simple: individual dental practices generate predictable cash with low regulatory risk, buy enough of them and you get scale economies on marketing, supplies, and back office. The diligence is more complex than it looks.",
      "Trap one: revenue recognition on treatment plans. Ortho and implant cases are typically multi-phase with upfront payments. A practice that recognizes revenue on the initial payment rather than over the treatment period inflates current-period revenue. Post-ASC 606 this should be consistent — but many independent practices weren't fully compliant. The QoE needs to restate treatment-plan revenue to percentage-of-completion.",
      "Trap two: lab cost variance. Crown, bridge, and implant cases have lab costs of 15–30% of the case fee. Lab costs are typically coded to COGS, but timing of when the lab bills the practice (30–90 days post-case) creates a working-capital risk and distorts monthly GM. Normalized GM requires matching lab costs to the treatment period, not the invoice date.",
      "Trap three: doctor turnover. The asset that produces the revenue is the dentist. If the dentist in a practice retires, dies, or leaves for a competitor, the patient list goes with them within 6–12 months. Roll-up platforms that don't have documented non-compete and retention agreements for acquired dentists have a structural churn problem the trailing financials don't show.",
    ],
  },

  // ==================================================================
  //  (existing articles continue below if any — this new block sits
  //  at the end of the array before the closing bracket)
  // ==================================================================
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  // Newsletter subscribe — local state machine so the form can flip
  // between idle / submitting / success / error without needing a store.
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [subMessage, setSubMessage] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subStatus === "submitting") return;
    setSubStatus("submitting");
    setSubMessage(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || `Subscription failed (${res.status})`);
      }
      setSubStatus("ok");
      setSubEmail("");
    } catch (err) {
      setSubStatus("error");
      setSubMessage(
        err instanceof Error
          ? err.message
          : "Subscription failed. Please try again.",
      );
    }
  };

  const filtered = articles.filter((a) => {
    const matchesCategory = activeCategory === "All" || a.category === activeCategory;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.body.some((p) => p.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const featured = articles.filter((a) => a.featured);

  // Group filtered articles by category for the main list. Order
  // matters here — this dictates the vertical section ordering on the
  // page. US Deal Pitfalls + Healthcare lead because they're the
  // highest-credibility content.
  const grouped: Record<Category, Article[]> = {
    "US Deal Pitfalls": [],
    "Healthcare Sector": [],
    "Core Concepts": [],
    "Playbooks": [],
    "Compliance & Standards": [],
    "Integrations & Data": [],
  };
  filtered.forEach((a) => grouped[a.category].push(a));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/blog" className="text-xs text-white/30 hover:text-white/50">Resources</Link>
              <ChevronRight className="w-3 h-3 text-white/20" />
              <span className="text-xs text-white/50">Knowledge Base</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Knowledge Base</h1>
            </div>
            <p className="text-lg text-white/45 max-w-2xl leading-relaxed mb-8">
              A growing library of field notes, playbooks and compliance
              explainers for finance teams inside SMBs &mdash;
              written by operators who have run these cycles many times over.
            </p>
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles, concepts, standards..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30 transition-colors"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Category tabs */}
      <section className="px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-2 py-4">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              activeCategory === "All"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                : "bg-white/5 text-white/50 border border-white/5 hover:text-white/80"
            }`}
          >
            All ({articles.length})
          </button>
          {categories.map((c) => {
            const count = articles.filter((a) => a.category === c.label).length;
            const active = activeCategory === c.label;
            return (
              <button
                key={c.label}
                onClick={() => setActiveCategory(c.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : "bg-white/5 text-white/50 border border-white/5 hover:text-white/80"
                }`}
              >
                <c.icon className="w-3.5 h-3.5" />
                {c.label} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured (only when no filter/search active) */}
      {activeCategory === "All" && !search && (
        <section className="py-14 px-6">
          <div className="max-w-5xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-400">
                  Start here
                </p>
              </div>
            </FadeIn>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map((a, i) => (
                <FadeIn key={a.slug} delay={i * 80}>
                  <button
                    onClick={() => {
                      setExpanded(a.slug);
                      setActiveCategory(a.category);
                      setTimeout(() => {
                        document.getElementById(`article-${a.slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 50);
                    }}
                    className="text-left w-full h-full bg-[#111] rounded-2xl p-6 border border-white/5 hover:border-emerald-500/20 hover:bg-white/[0.02] transition-all group"
                  >
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-emerald-400/80 mb-3">
                      {a.category}
                    </p>
                    <h3 className="text-[16px] font-semibold text-white mb-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {a.title}
                    </h3>
                    <p className="text-[13px] text-white/40 leading-relaxed mb-4 line-clamp-3">
                      {a.summary}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-white/30">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {a.readMin} min read
                      </span>
                      <span className="text-emerald-400/70 group-hover:text-emerald-400 flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full article list */}
      <section className="py-14 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          {(Object.keys(grouped) as Category[])
            .filter((cat) => grouped[cat].length > 0)
            .map((cat) => {
              const catMeta = categories.find((c) => c.label === cat)!;
              return (
                <div key={cat} className="mb-14 last:mb-0">
                  <FadeIn>
                    <div className="flex items-start gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <catMeta.icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-1">{cat}</h2>
                        <p className="text-sm text-white/40 leading-relaxed max-w-2xl">
                          {catMeta.desc}
                        </p>
                      </div>
                    </div>
                  </FadeIn>

                  <div className="space-y-3">
                    {grouped[cat].map((a) => {
                      const isOpen = expanded === a.slug;
                      return (
                        <FadeIn key={a.slug}>
                          <article
                            id={`article-${a.slug}`}
                            className={`bg-[#111] rounded-2xl border transition-all ${
                              isOpen
                                ? "border-emerald-500/20"
                                : "border-white/5 hover:border-white/10"
                            }`}
                          >
                            <button
                              onClick={() => setExpanded(isOpen ? null : a.slug)}
                              className="w-full text-left p-6 flex items-start justify-between gap-6"
                            >
                              <div className="flex-1 min-w-0">
                                {/* Bain-style pill tag row: category +
                                    featured badge if applicable. Gives
                                    the eye an anchor before the headline. */}
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                                    {a.category}
                                  </span>
                                  {a.featured && (
                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      Featured
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-[17px] font-semibold text-white mb-2 leading-snug">
                                  {a.title}
                                </h3>
                                <p className="text-[14px] text-white/55 leading-relaxed">
                                  {a.summary}
                                </p>
                                <p className="text-[12px] text-white/45 mt-3 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {a.readMin} min read
                                </p>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform ${
                                  isOpen ? "rotate-180 text-emerald-400" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="px-6 pb-6 -mt-2">
                                <div className="border-t border-white/5 pt-5 space-y-3.5">
                                  {a.body.map((p, i) => (
                                    <p
                                      key={i}
                                      className="text-[14px] text-white/60 leading-[1.75]"
                                    >
                                      {p}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </article>
                        </FadeIn>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/30 text-sm">
                No articles match that search. Try a different term or clear the filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter signup — Bain-inspired. Deliberate, low-friction
          email capture that gives a reason to come back. Not a hard
          sell; a "pick up the thread" moment. */}
      <section className="py-16 px-6 border-t border-white/5">
        <FadeIn>
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.02] to-transparent p-8 lg:p-10">
              <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
              <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 mb-4">
                    <Mail className="w-3 h-3" />
                    The CortexCFO Brief
                  </div>
                  <h3 className="text-[24px] lg:text-[28px] font-bold tracking-tight mb-2 leading-tight">
                    One deal pattern. One Friday. Nothing else.
                  </h3>
                  <p className="text-[14px] text-white/65 leading-relaxed max-w-lg">
                    A weekly email with one diligence finding we see over
                    and over — and how to avoid it. Written for founders,
                    CFOs, and PE associates who read fast and skip the
                    rest. Unsubscribe in one click.
                  </p>
                </div>
                {subStatus === "ok" ? (
                  /* Success state — friendly acknowledgement. Copy matches
                     the transactional email we just sent so the user sees
                     the same story inside and outside their inbox. */
                  <div
                    role="status"
                    aria-live="polite"
                    className="w-full lg:max-w-sm rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
                  >
                    <p className="text-[13px] font-semibold text-emerald-200 mb-1">
                      Thanks for subscribing.
                    </p>
                    <p className="text-[13px] text-emerald-100/80 leading-relaxed">
                      We&rsquo;re still building the program and it&rsquo;ll take
                      a few more months to ship — we want to be double-sure on
                      the encryption and the analysis that comes out of it.
                      We&rsquo;ll email you the moment the first issue is ready.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubscribe}
                    className="flex flex-col gap-2 w-full lg:w-auto"
                  >
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        required
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        disabled={subStatus === "submitting"}
                        placeholder="you@company.com"
                        className="flex-1 lg:w-64 px-4 py-3 rounded-full bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-[14px] focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.06] transition-colors disabled:opacity-60"
                      />
                      <button
                        type="submit"
                        disabled={subStatus === "submitting" || !subEmail.trim()}
                        className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-3 rounded-full transition-all text-[14px] hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {subStatus === "submitting" ? "Subscribing…" : "Subscribe"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {subStatus === "error" && subMessage && (
                      <p
                        role="alert"
                        className="text-[12px] text-rose-300 leading-snug"
                      >
                        {subMessage}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* CTA footer */}
      <section className="py-20 px-6 border-t border-white/5 bg-[#080808]">
        <FadeIn>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to apply these ideas to your own books?
            </h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">
              Upload a trial balance and CortexCFO will produce a
              boardroom-ready analysis &mdash; QoE lens, ratio pack, GAAP
              flags and an AI consultant ready to answer your follow-ups.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 text-sm font-semibold transition-colors"
              >
                Start free analysis <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/glossary"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-7 py-3.5 rounded-xl text-sm font-semibold border border-white/10 transition-colors"
              >
                Browse glossary
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
