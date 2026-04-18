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
            <p className="text-lg text-white/40 max-w-2xl mb-10">
              Clear definitions of the metrics, ratios, and Indian accounting concepts that drive business decisions.
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
