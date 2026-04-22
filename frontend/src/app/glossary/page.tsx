"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/Animate";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

const glossaryTerms = [
  { term: "Accounts Payable (AP)", def: "Money your business owes to suppliers and vendors for goods or services received but not yet paid for. Shows as a liability on the balance sheet." },
  { term: "Accounts Receivable (AR)", def: "Money owed to your business by customers for goods or services delivered but not yet paid for. Shows as an asset on the balance sheet." },
  { term: "Accrual Accounting", def: "An accounting method where revenue and expenses are recorded when earned or incurred, not when cash is received or paid. Required under GAAP for most businesses." },
  { term: "Adjusted EBITDA", def: "EBITDA modified to remove one-time, irregular, or non-recurring items. Used by investors to compare businesses on a like-for-like basis." },
  { term: "Balance Sheet", def: "A financial statement showing what a business owns (assets), owes (liabilities), and the owner's share (equity) at a specific point in time." },
  { term: "Burn Rate", def: "The rate at which a startup spends cash. Monthly burn rate equals total monthly expenses minus monthly revenue. Critical for calculating runway." },
  { term: "Cash Conversion Cycle", def: "Days it takes to convert inventory purchases into cash from customers. Calculated as: Inventory Days + Receivable Days minus Payable Days." },
  { term: "Cash Flow Statement", def: "A financial statement showing how cash moves in and out through operating, investing, and financing activities over a period." },
  { term: "COGS (Cost of Goods Sold)", def: "Direct costs of producing goods sold. Includes raw materials, direct labor, and manufacturing overhead. Deducted from revenue to calculate gross profit." },
  { term: "Current Ratio", def: "Current Assets divided by Current Liabilities. Above 1.5 is generally healthy. Measures ability to pay short-term debts." },
  { term: "Deferred Revenue", def: "Money received for goods or services not yet delivered. Recorded as a liability until fulfilled. Common in SaaS businesses." },
  { term: "Depreciation", def: "Gradual reduction in value of a fixed asset over its useful life. Under Indian Companies Act Schedule II, different asset classes have prescribed useful lives." },
  { term: "Debt-to-Equity Ratio", def: "Total Liabilities divided by Total Equity. Below 2.0 is generally considered healthy. Measures how much debt vs equity finances the business." },
  { term: "EBITDA", def: "Earnings Before Interest, Taxes, Depreciation, and Amortization. Measures operating performance independent of financing and accounting decisions." },
  { term: "Gross Margin", def: "Revenue minus COGS as a percentage of revenue. Shows profit retained from each rupee of sales after direct costs." },
  { term: "GST (Goods & Services Tax)", def: "India's unified indirect tax. Businesses must track input tax credit (ITC) and output tax to determine net sales tax liability." },
  { term: "GAAP 12 (Income Taxes)", def: "Standard for income tax accounting. Requires recognition of deferred tax assets and liabilities from temporary differences." },
  { term: "GAAP 16 (Property, Plant & Equipment)", def: "Standard for fixed asset accounting including recognition, measurement, depreciation, and derecognition." },
  { term: "ASC 850 (Related Party) (Related Party Disclosures)", def: "Requires disclosure of transactions between the entity and related parties (directors, key management, subsidiaries)." },
  { term: "ASC 450 (Contingencies) (Provisions & Contingencies)", def: "Standard for recognizing provisions, contingent liabilities, and contingent assets when there is a present obligation." },
  { term: "ASC 606 (Revenue) (Revenue Recognition)", def: "Five-step model: identify contract, identify performance obligations, determine price, allocate price, recognize when satisfied." },
  { term: "Inventory Turnover", def: "COGS divided by Average Inventory. Higher turnover means faster-moving stock and less capital tied up." },
  { term: "LTV/CAC Ratio", def: "Lifetime Value divided by Customer Acquisition Cost. Above 3x indicates sustainable unit economics." },
  { term: "Net Margin", def: "Net income divided by total revenue. The bottom-line profitability showing how much of each rupee becomes profit." },
  { term: "Operating Cash Flow", def: "Cash generated from core business operations. Positive means the business can fund itself without external financing." },
  { term: "Quality of Earnings (QoE)", def: "Analysis examining whether reported earnings are sustainable, recurring, and from core operations. Used in due diligence." },
  { term: "Return on Equity (ROE)", def: "Net income divided by shareholder equity. Measures profit generation from owner investment. Good ROE is above 15%." },
  { term: "Rule of 40", def: "SaaS benchmark: Revenue Growth Rate plus Profit Margin should exceed 40%. Balances growth with profitability." },
  { term: "Runway", def: "Months a startup can operate before running out of cash. Cash Balance divided by Monthly Burn Rate." },
  { term: "Suspense Account", def: "Temporary account for unclassified transactions. Large balances are a red flag in audits." },
  { term: "TDS (Tax Deducted at Source)", def: "Tax deducted by the payer at payment time. Required on salary, rent, professional fees under Income Tax Act." },
  { term: "Trial Balance", def: "Worksheet listing all ledger account balances. Total debits must equal credits. Verifies book accuracy before financial statements." },
  { term: "Working Capital", def: "Current Assets minus Current Liabilities. Positive means the business can fund day-to-day operations." },

  // ── US GAAP & US-specific glossary ──
  { term: "ASC 606 (US GAAP)", def: "US GAAP revenue recognition standard codified by FASB. Five-step model: identify contract, identify performance obligations, determine transaction price, allocate price, recognize revenue as obligations are satisfied. Nearly identical to IFRS 15." },
  { term: "ASC 842 (Leases)", def: "US GAAP lease accounting standard effective for private companies from FY2022. Requires operating leases longer than 12 months to be capitalized on the balance sheet as a right-of-use (ROU) asset and lease liability." },
  { term: "ASC 340-40 (Contract Costs)", def: "US GAAP rule requiring capitalization and amortization of incremental costs of obtaining a customer contract (e.g., sales commissions) over the contract's benefit period." },
  { term: "ASC 718 (Stock Compensation)", def: "US GAAP standard for accounting for share-based payments. Requires fair-value measurement on the grant date and expense recognition over the vesting period." },
  { term: "ASC 805 (Business Combinations)", def: "US GAAP rule for acquisition accounting. Requires purchase price allocation to identifiable assets, liabilities, intangibles, and goodwill at fair value on the acquisition date." },
  { term: "FASB (Financial Accounting Standards Board)", def: "The private, non-profit organization that issues US GAAP standards. Its rulings are codified in the Accounting Standards Codification (ASC)." },
  { term: "SEC (Securities and Exchange Commission)", def: "US federal regulator overseeing public companies' financial reporting. Public-company filings (10-K, 10-Q, 8-K) must comply with SEC rules and US GAAP." },
  { term: "10-K", def: "Annual report filed by public companies with the SEC. Includes audited financial statements, management discussion and analysis, risk factors, and executive compensation disclosures." },
  { term: "10-Q", def: "Quarterly report filed by public companies with the SEC. Contains unaudited financial statements and MD&A for the quarter." },
  { term: "US GAAP (Generally Accepted Accounting Principles)", def: "The accounting standards used in the United States, issued by FASB. Rules-based, more prescriptive than IFRS." },
  { term: "IFRS (International Financial Reporting Standards)", def: "The international accounting standards used in 140+ countries, issued by the IASB. Principles-based, allows more judgment than US GAAP. Closely aligned with Ind AS." },
  { term: "LIFO (Last-In, First-Out)", def: "Inventory costing method where most-recently-acquired inventory is expensed first. Permitted under US GAAP (unlike IFRS) and often elected during inflation to defer tax." },
  { term: "FIFO (First-In, First-Out)", def: "Inventory costing method where oldest inventory is expensed first. Permitted under both US GAAP and IFRS. Tends to produce higher income during inflation." },
  { term: "Section 1202 (QSBS)", def: "US tax code provision allowing exclusion of up to $10M or 10x basis in federal capital gains on sale of Qualified Small Business Stock held for 5+ years. Applies only to C-corps." },
  { term: "Section 41 (R&D Credit)", def: "US federal tax credit of up to 14% on qualified research expenses (engineer wages, contractor costs, supplies). Can be applied against payroll taxes up to $500K/year for startups." },
  { term: "Safe Harbor 401(k)", def: "A 401(k) plan design that skips annual non-discrimination testing in exchange for mandatory employer contributions (either 3% non-elective or basic match of 4%)." },
  { term: "1099-NEC", def: "IRS form used to report non-employee compensation of $600 or more to independent contractors. Due to contractors and IRS by January 31 of the following year." },
  { term: "W-9", def: "IRS form collected from US contractors/vendors capturing their legal name, TIN, and tax classification. Required before issuing 1099-NEC forms." },
  { term: "Form 5500", def: "Annual report that most employer-sponsored retirement plans (401(k), pension) must file with the Department of Labor and IRS by July 31 of the year after the plan year." },
  { term: "Economic Nexus (Sales Tax)", def: "Post-Wayfair standard where out-of-state sellers owe sales tax in a US state once they cross a revenue or transaction threshold (typically $100K or 200 transactions)." },
  { term: "Wayfair Decision", def: "2018 US Supreme Court ruling (South Dakota v. Wayfair) that removed the physical-presence requirement for state sales tax collection, establishing economic nexus." },
  { term: "Delaware C-Corp", def: "The default US corporate structure for VC-backed startups. Delaware's mature corporate law and Court of Chancery provide predictability for investors and acquirers." },
  { term: "Pass-Through Entity", def: "Entity (S-corp, LLC, partnership) whose income passes through to owners' personal tax returns, avoiding corporate-level tax. Not suitable for institutional equity rounds." },
  { term: "Qualified Opportunity Zone (QOZ)", def: "Economically-distressed US area designated under the 2017 Tax Cuts and Jobs Act. Investors can defer or eliminate capital gains tax on investments held in QOZ funds." },
  { term: "EBITDA Margin", def: "EBITDA as a percentage of revenue. Common SMB benchmarks: SaaS 20-40%, services 10-20%, manufacturing 8-15%, distribution 3-8%." },
  { term: "Rule of 40 (SaaS)", def: "SaaS benchmark where revenue growth rate + EBITDA margin should exceed 40%. Balances growth with profitability for US software companies." },
  { term: "NRR (Net Revenue Retention)", def: "Revenue from existing customers one year later, as a percentage of starting revenue (including upsell, minus churn and downgrades). Best-in-class US SaaS: 120%+." },
  { term: "Gross Retention", def: "Revenue retained from existing customers a year later, excluding upsell. Measures churn risk. Best-in-class US SaaS: 90%+." },
  { term: "ARR (Annual Recurring Revenue)", def: "Normalized annual subscription revenue for a US SaaS company. Excludes one-time implementation or professional services fees." },
  { term: "MRR (Monthly Recurring Revenue)", def: "Normalized monthly subscription revenue. ARR divided by 12. The primary KPI for SaaS financial health." },
  { term: "Magic Number (SaaS)", def: "Quarterly revenue growth divided by prior quarter's sales and marketing spend, annualized. Above 0.75 indicates efficient GTM; below 0.5 indicates sales engine problems." },
  { term: "CAC Payback Period", def: "Months required for gross profit from a new customer to recover acquisition cost. US SaaS benchmark: under 12 months for mid-market, under 24 months for enterprise." },
  { term: "Series A / Series B / Series C", def: "US venture financing rounds. Series A typically $5-15M at $20-50M post-money, Series B $15-50M at $60-150M, Series C $50M+ at $200M+. Round sizes have grown meaningfully post-2021." },
  { term: "Convertible Note", def: "Short-term debt that converts into equity at a future priced round, usually with a discount and/or valuation cap. Common pre-seed US fundraising instrument." },
  { term: "SAFE (Simple Agreement for Future Equity)", def: "Y Combinator-designed instrument giving investors rights to future equity at the next priced round. Cleaner than a note (no maturity, no interest) — now the US seed default." },
  { term: "83(b) Election", def: "IRS election filed within 30 days of receiving restricted stock, letting the recipient pay ordinary income tax on the grant-date value instead of the vesting-date value. Critical for US startup founders." },
  { term: "ISO (Incentive Stock Option)", def: "US tax-advantaged stock option grantable only to employees. Exercises within AMT limits avoid ordinary income at exercise; sale after 1+ year post-exercise and 2+ years post-grant qualifies for long-term capital gains." },
  { term: "NSO (Non-Qualified Stock Option)", def: "Stock option with no special tax treatment. Exercise triggers ordinary income tax on the spread (FMV minus strike price). Used for non-employee grants or when ISO limits are exceeded." },

  // ── Due Diligence & M&A working vocabulary ──
  { term: "Proof of Cash", def: "The reconciliation of reported revenue against actual bank deposits, done month by month. A foundational step in any US QoE — variances above 10% become diligence findings; variances above 30% often kill deals." },
  { term: "Seller's Discretionary Earnings (SDE)", def: "A measure of a small business's total financial benefit to a single owner-operator. Calculated as EBITDA plus owner's compensation, benefits, and non-business personal expenses. Used for sub-$3M EBITDA businesses; replaced by Adjusted EBITDA above that threshold." },
  { term: "Working Capital Peg", def: "The level of normalized net working capital a target is expected to deliver at closing of an M&A transaction. Variances from peg trigger dollar-for-dollar purchase price adjustments — often the second-largest dollar item in a deal after EBITDA x multiple." },
  { term: "Normalized Net Working Capital (NWC)", def: "Reported working capital adjusted to exclude non-operating items: intercompany balances, related-party receivables, aged receivables beyond credit terms, property tax accruals, customer deposits tied to non-transferring contracts. The basis for the working-capital peg." },
  { term: "Re-trade", def: "When a buyer reduces their offer after diligence reveals issues not reflected in the original LOI. Common triggers: EBITDA haircuts from rejected add-backs, normalized working-capital adjustments, revenue quality findings. Sophisticated sellers manage re-trade risk through pre-transaction QoE." },
  { term: "Quality of Earnings (QoE)", def: "An analysis distinguishing sustainable, recurring earnings from non-recurring or manipulated earnings. The primary due-diligence output; typically a 40-80 page report covering adjusted EBITDA, working capital, revenue quality, and commercial risks. Required by most PE buyers at LOI to close." },
  { term: "Buy-Side QoE", def: "A QoE commissioned by the prospective buyer to validate the seller's reported earnings. Typically 4-8 weeks; cost $50K-$250K for lower-middle-market deals. Output becomes the basis for price renegotiation." },
  { term: "Sell-Side QoE", def: "A QoE commissioned by the seller prior to running a sale process. Identifies and addresses add-back defensibility issues before the buyer's team finds them. Costs 30-50% of a buy-side QoE but typically saves 3-10x that in avoided re-trade." },
  { term: "Management Fee (Related Party)", def: "Fees paid by the Company to a common-ownership entity for shared services (payroll, IT, HR, procurement). Must be documented, priced at fair-market rates, and disclosed under ASC 850. A recurring diligence adjustment where arrangements above 3% of revenue typically get challenged." },
  { term: "Stark Law (Physician Self-Referral)", def: "US federal law prohibiting physicians from referring Medicare/Medicaid patients to entities in which the physician (or an immediate family member) has a financial relationship, unless an exception applies. Compensation arrangements in PPM deals must be documented as fair-market value." },
  { term: "Anti-Kickback Statute (AKS)", def: "US federal law prohibiting exchange of remuneration to induce referrals for Medicare/Medicaid-reimbursable services. Applies broadly to physician compensation, medical director fees, and space/equipment rentals in healthcare deals. AKS violations trigger False Claims Act exposure." },
  { term: "MGMA Benchmark", def: "Medical Group Management Association annual compensation data, the industry standard for benchmarking physician-owner pay in QoE. Used to determine the 'market replacement' rate against which owner compensation is normalized. Percentiles typically chosen: 50th for low-productivity docs, 65th-75th for productive owners." },
  { term: "RVU (Relative Value Unit)", def: "CMS standard measure of physician work, practice expense, and malpractice risk. Work RVUs (wRVUs) are used for physician productivity benchmarking. A primary care physician produces ~4,500 wRVUs/year; a high-volume surgical specialist 12,000+." },
  { term: "PDGM (Patient-Driven Groupings Model)", def: "The US home-health reimbursement model effective January 2020. Replaced 60-day episodes with 30-day billing cycles, split each period into early vs late, reduced LUPA thresholds, and case-mixed reimbursement by clinical grouping. The single largest structural change in home health economics in 20 years." },
  { term: "LUPA (Low Utilization Payment Adjustment)", def: "A home-health reimbursement penalty where an agency providing fewer than a threshold number of visits per 30-day billing period receives per-visit payment instead of the full period rate. Threshold varies by clinical grouping; LUPA rates above 15% typically indicate structural margin pressure." },
  { term: "PPM (Physician Practice Management)", def: "A PE-backed platform model consolidating independent physician practices into a single operating company. The consolidator provides management services (RCM, IT, HR, marketing) while physicians retain clinical autonomy. Active consolidation across dental, dermatology, ophthalmology, orthopedics, and primary care since 2015." },
  { term: "DSO (Dental Support Organization)", def: "The dental equivalent of a PPM — a PE-backed platform providing management services to consolidated dental practices. Active PE theme since 2018; top 20 DSOs now cover ~10% of the US dental market." },
  { term: "Payer Mix", def: "The distribution of a healthcare provider's revenue across payer types (Medicare, Medicaid, commercial insurance, self-pay, direct contracts). Since different payers reimburse at different rates, payer mix directly drives net yield. A 10-percentage-point shift from commercial to Medicaid can reduce effective margin by 8-12%." },
  { term: "UCR (Usual, Customary, Reasonable)", def: "The rate-setting methodology commercial insurers use to determine payment for out-of-network services. UCR calculations are controlled by the payer, creating leverage for rate cuts at contract renewal. An important diligence area for specialty practices with significant out-of-network exposure." },
  { term: "Value-Based Care (VBC)", def: "Healthcare payment models that tie reimbursement to outcomes rather than volume of services. Includes Medicare Shared Savings Program (MSSP), Medicare Advantage shared-risk contracts, and commercial shared-savings arrangements. In QoE, VBC earnings require distinguishing sustainable run-rate bonuses from episodic outliers." },
  { term: "Medicare Advantage (MA)", def: "The private-plan version of Medicare (Part C). Pays capitated rates to health plans who manage Medicare beneficiary care. A major growth area for provider-owned risk-bearing entities; in QoE, MA revenue requires analysis of STAR ratings, MLR (medical loss ratio), and benchmark trends." },
  { term: "ACO (Accountable Care Organization)", def: "A provider-led organization accepting accountability for Medicare population health outcomes in exchange for shared savings upside (and, in some tracks, shared losses). ACO REACH is the current primary Medicare program. Revenue recognition in QoE requires distinguishing one-time bonuses from run-rate capabilities." },
  { term: "340B Drug Pricing Program", def: "US federal program requiring pharmaceutical manufacturers to provide discounts on outpatient drugs to eligible providers (primarily hospitals serving low-income populations and federally qualified health centers). 340B economics materially affect pharmacy and hospital QoE — scope changes can dramatically shift margins." },
  { term: "DIR (Direct and Indirect Remuneration) Fees", def: "Fees charged by pharmacy benefit managers (PBMs) to pharmacies after the point of sale, often tied to performance metrics set by the PBM. DIR fees have grown dramatically and represent a major margin-compression force in independent pharmacy. A key normalization area for pharmacy QoE." },

  // ── Additional technical diligence terms ──
  { term: "TTM (Trailing Twelve Months)", def: "The most recent 12-month period, used for rolling measurement of revenue, EBITDA, and cash flow. Distinguished from LTM (Last Twelve Months) and FY (Fiscal Year). Most M&A valuations use TTM or LTM EBITDA as the base, often adjusted for known run-rate changes." },
  { term: "CAAP (Cost Accounting Advance Payment)", def: "COVID-era Medicare advance payments to healthcare providers, recouped against future reimbursements starting 2021. The recoupment distorted cash flow through 2023-2024 and is a required normalization in healthcare QoE for that period." },
  { term: "PPP (Paycheck Protection Program)", def: "US COVID-era forgivable loan program. Forgiven amounts are recorded as non-operating income (generally not subject to federal tax). In QoE, PPP forgiveness is always a non-recurring addback since the program has ended." },
  { term: "Provider Relief Fund (PRF)", def: "HHS program distributing $175 billion to US healthcare providers during COVID. Receipts were typically recorded as non-operating income. Like PPP, PRF payments are non-recurring and get normalized out of sustainable EBITDA." },
  { term: "Non-Quantifiable Adjustment (NQ)", def: "A diligence-identified risk or issue that can't be cleanly translated into a dollar adjustment but is material enough to disclose. Examples: high caregiver turnover in home-health, regulatory exposure in cash-pay services. Buyers use NQ adjustments to justify price concessions or structure deal protections (escrows, earnouts)." },
  { term: "Customer Churn Rate", def: "The percentage of customers lost in a period, typically measured annually or monthly. In services and subscription businesses, a critical diligence metric. Average client tenure of 5 months (20% monthly churn) is a deal-level red flag in recurring-revenue services." },
  { term: "Channel Concentration", def: "Revenue dependency on a single sales or marketing channel (Amazon, Shopify, DoorDash, a single wholesale customer). Post-diligence haircut is typically 15-30% on EBITDA multiple when concentration exceeds 60%. A strategic diversification trajectory (even over 24 months) can reclaim most of the haircut." },
  { term: "Geographic Concentration", def: "Revenue dependency on a single city, state, or metro area. In services businesses where delivery is local, geographic concentration creates local-labor-market risk, local-regulation risk, and natural-disaster exposure. A mitigation strategy is a required part of the commercial DD narrative." },
  { term: "Revenue Cut-Off", def: "The accounting procedure ensuring revenue is recognized in the correct period. Revenue-cutoff errors — revenue recorded in the wrong month — are among the most common QoE findings, especially in businesses without formal month-end close procedures." },
  { term: "Revenue Variance Analysis", def: "The analytical process comparing reported revenue against source data (bank statements, platform sales data like Amazon Seller Central, customer confirmations). Variances above 10% typically require explanation; above 30% typically indicate accounting system or control weaknesses." },
  { term: "Management Representation Letter (MRL)", def: "A signed letter from target management representing that financial information provided is complete and accurate. Required by QoE providers as a condition of the engagement. In the US middle market, an MRL is always required before delivery of the final QoE report." },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");

  const filtered = search
    ? glossaryTerms.filter((t) => t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()))
    : glossaryTerms;

  const grouped: Record<string, typeof glossaryTerms> = {};
  filtered.forEach((t) => {
    const letter = t.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteNav />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-4">
              <Link href="/blog" className="text-xs text-white/30 hover:text-white/50">Resources</Link>
              <ChevronRight className="w-3 h-3 text-white/20" />
              <span className="text-xs text-white/50">Glossary</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Financial Glossary</h1>
            </div>
            <p className="text-lg text-white/60 max-w-2xl mb-10">
              Clear definitions of the metrics, ratios, and accounting concepts — US GAAP, Ind AS, and cross-border — that drive SMB decisions.
            </p>
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search terms..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30" />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {Object.keys(grouped).sort().map((letter) => (
            <a key={letter} href={`#letter-${letter}`} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-center text-xs font-semibold text-white/40 transition-colors">{letter}</a>
          ))}
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {Object.keys(grouped).sort().map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-emerald-400">{letter}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              {grouped[letter].map((t) => (
                <div key={t.term} className="group py-4 border-b border-white/3 hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors">
                  <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-emerald-400 transition-colors">{t.term}</h3>
                  <p className="text-sm text-white/35 leading-relaxed">{t.def}</p>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-20"><p className="text-white/30">No terms found</p></div>}
        </div>
      </section>

      <section className="py-20 px-6 border-t border-white/5">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Put these concepts to work</h2>
            <p className="text-white/40 mb-8">Upload your Trial Balance and see these metrics calculated automatically.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 text-sm font-semibold">Start free trial <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </FadeIn>
      </section>

      <SiteFooter />
    </div>
  );
}
