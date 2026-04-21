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
