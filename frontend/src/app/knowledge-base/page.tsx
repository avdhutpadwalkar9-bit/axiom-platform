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
} from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

type Category =
  | "Core Concepts"
  | "Playbooks"
  | "Compliance & Standards"
  | "Integrations & Data";

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
];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);

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

  // Group filtered articles by category for the main list
  const grouped: Record<Category, Article[]> = {
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
                                <h3 className="text-[16px] font-semibold text-white mb-2 leading-snug">
                                  {a.title}
                                </h3>
                                <p className="text-[13px] text-white/45 leading-relaxed">
                                  {a.summary}
                                </p>
                                <p className="text-[11px] text-white/30 mt-3 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {a.readMin} min read
                                </p>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-white/30 flex-shrink-0 transition-transform ${
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
