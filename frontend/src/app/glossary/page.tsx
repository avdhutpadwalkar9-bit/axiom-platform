"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp, Search, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/Animate";

const glossaryTerms = [
  { term: "Accounts Payable (AP)", def: "Money your business owes to suppliers and vendors for goods or services received but not yet paid for. Shows as a liability on the balance sheet." },
  { term: "Accounts Receivable (AR)", def: "Money owed to your business by customers for goods or services delivered but not yet paid for. Shows as an asset on the balance sheet." },
  { term: "Accrual Accounting", def: "An accounting method where revenue and expenses are recorded when earned or incurred, not when cash is received or paid. Required under Ind AS for most businesses." },
  { term: "Adjusted EBITDA", def: "EBITDA modified to remove one-time, irregular, or non-recurring items. Used by investors to compare businesses on a like-for-like basis." },
  { term: "Balance Sheet", def: "A financial statement showing what a business owns (assets), owes (liabilities), and the owner's share (equity) at a specific point in time. Assets must equal Liabilities plus Equity." },
  { term: "Burn Rate", def: "The rate at which a startup or growing business spends cash. Monthly burn rate equals total monthly expenses minus monthly revenue. Critical for calculating runway." },
  { term: "Cash Conversion Cycle", def: "The number of days it takes to convert inventory purchases into cash from customers. A shorter cycle means faster cash generation. Calculated as: Inventory Days + Receivable Days minus Payable Days." },
  { term: "Cash Flow Statement", def: "A financial statement showing how cash moves in and out of the business through operating, investing, and financing activities over a period." },
  { term: "COGS (Cost of Goods Sold)", def: "The direct costs of producing goods sold by a business. Includes raw materials, direct labor, and manufacturing overhead. Deducted from revenue to calculate gross profit." },
  { term: "Current Ratio", def: "A liquidity ratio measuring ability to pay short-term debts. Calculated as Current Assets divided by Current Liabilities. Above 1.5 is generally healthy for most industries." },
  { term: "Deferred Revenue", def: "Money received from customers for goods or services not yet delivered. Recorded as a liability until the obligation is fulfilled. Common in SaaS and subscription businesses." },
  { term: "Depreciation", def: "The gradual reduction in value of a fixed asset over its useful life. Under Indian Companies Act Schedule II, different asset classes have prescribed useful lives." },
  { term: "Debt-to-Equity Ratio", def: "A leverage ratio measuring how much debt a business uses relative to equity. Calculated as Total Liabilities divided by Total Equity. Below 2.0 is generally considered healthy." },
  { term: "EBITDA", def: "Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of operating performance that strips out the effects of financing, tax, and accounting decisions." },
  { term: "Gross Margin", def: "Revenue minus Cost of Goods Sold, expressed as a percentage of revenue. Shows how much profit you retain from each rupee of sales after direct costs." },
  { term: "GST (Goods & Services Tax)", def: "India's unified indirect tax replacing multiple state and central taxes. Businesses must track input tax credit (ITC) and output tax to determine net GST liability." },
  { term: "Ind AS 12 (Income Taxes)", def: "Indian accounting standard for income tax accounting. Requires recognition of deferred tax assets and liabilities arising from temporary differences between book and tax values." },
  { term: "Ind AS 15 (Employee Benefits)", def: "Standard covering all forms of employee compensation except share-based payments. Requires provisioning for gratuity, leave encashment, and other post-employment benefits." },
  { term: "Ind AS 16 (Property, Plant & Equipment)", def: "Standard for accounting of fixed assets including recognition, measurement, depreciation, and derecognition. Requires component-wise depreciation for significant parts." },
  { term: "Ind AS 19 (Employee Benefits)", def: "Covers defined benefit plans, defined contribution plans, and other long-term employee benefits. Requires actuarial valuation for gratuity and pension obligations." },
  { term: "Ind AS 24 (Related Party Disclosures)", def: "Requires disclosure of transactions between the entity and its related parties (directors, key management, subsidiaries). Ensures transparency in financial reporting." },
  { term: "Ind AS 37 (Provisions & Contingencies)", def: "Standard for recognizing provisions, contingent liabilities, and contingent assets. A provision is recognized when there is a present obligation with probable outflow." },
  { term: "Ind AS 115 (Revenue Recognition)", def: "The five-step model for recognizing revenue: identify the contract, identify performance obligations, determine transaction price, allocate price, and recognize revenue when obligations are satisfied." },
  { term: "Inventory Turnover", def: "How many times inventory is sold and replaced over a period. Calculated as COGS divided by Average Inventory. Higher turnover means faster-moving stock." },
  { term: "LTV (Lifetime Value)", def: "The total revenue a business expects from a single customer over the entire relationship. For SaaS: Average Revenue Per Account times Average Customer Lifespan." },
  { term: "LTV/CAC Ratio", def: "Lifetime Value divided by Customer Acquisition Cost. Measures the return on customer acquisition investment. A ratio above 3x indicates sustainable unit economics." },
  { term: "Net Margin", def: "Net income divided by total revenue, expressed as a percentage. The bottom-line profitability metric showing how much of each rupee of revenue becomes profit." },
  { term: "Net Revenue Retention (NRR)", def: "Measures revenue retained from existing customers including expansion, contraction, and churn. NRR above 110% means existing customers grow faster than they churn." },
  { term: "Operating Cash Flow", def: "Cash generated from core business operations, excluding investing and financing activities. A positive operating cash flow means the business can fund itself." },
  { term: "Profit & Loss Statement (P&L)", def: "A financial statement summarizing revenues, costs, and expenses over a period. Also called the Income Statement. Shows whether the business made or lost money." },
  { term: "Quality of Earnings (QoE)", def: "An analysis examining whether reported earnings are sustainable, recurring, and from core operations. Used by investors and acquirers during due diligence." },
  { term: "Return on Equity (ROE)", def: "Net income divided by shareholder equity. Measures how effectively the business generates profit from the money invested by owners. Good ROE is above 15%." },
  { term: "Rule of 40", def: "A SaaS benchmark where Revenue Growth Rate plus Profit Margin should exceed 40%. Helps balance growth investment with profitability." },
  { term: "Runway", def: "The number of months a startup can continue operating before running out of cash. Calculated as Cash Balance divided by Monthly Burn Rate." },
  { term: "Suspense Account", def: "A temporary account used to hold transactions that cannot be classified immediately. Should be cleared regularly. Large suspense balances are a red flag in audits." },
  { term: "TDS (Tax Deducted at Source)", def: "Tax deducted by the payer at the time of payment. Under various sections of the Income Tax Act, businesses must deduct TDS on salary, rent, professional fees, etc." },
  { term: "Trial Balance", def: "A bookkeeping worksheet listing all general ledger account balances. Total debits must equal total credits. Used to verify the accuracy of the books before preparing financial statements." },
  { term: "Working Capital", def: "Current Assets minus Current Liabilities. Measures short-term financial health and operational efficiency. Positive working capital means the business can fund day-to-day operations." },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const filtered = search
    ? glossaryTerms.filter((t) => t.term.toLowerCase().includes(search.toLowerCase()) || t.def.toLowerCase().includes(search.toLowerCase()))
    : glossaryTerms;

  // Group by first letter
  const grouped: Record<string, typeof glossaryTerms> = {};
  filtered.forEach((t) => {
    const letter = t.term[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(t);
  });

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 20));
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/5" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-white" /></div>
            <span className="text-[15px] font-semibold tracking-tight">CortexCFO</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-white/50">
            <Link href="/#capabilities" className="hover:text-white transition-colors">Product</Link>
            <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Resources</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-white/50 hover:text-white">Log in</Link>
            <Link href="/signup" className="text-[13px] bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400 font-medium">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
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
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Financial Glossary</h1>
              </div>
            </div>
            <p className="text-lg text-white/40 max-w-2xl mb-10">
              Build your financial planning and analysis vocabulary. Clear definitions of the metrics,
              ratios, and Indian accounting concepts that drive business decisions.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/30"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Quick nav */}
      <section className="px-6 pb-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {Object.keys(grouped).sort().map((letter) => (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-center text-xs font-semibold text-white/40 transition-colors"
              >
                {letter}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary entries */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {Object.keys(grouped).sort().map((letter) => (
            <div key={letter} id={`letter-${letter}`} className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold text-emerald-400">{letter}</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="space-y-0">
                {grouped[letter].map((t) => (
                  <div key={t.term} className="group py-4 border-b border-white/3 hover:bg-white/[0.02] px-4 -mx-4 rounded-lg transition-colors">
                    <h3 className="text-[15px] font-semibold text-white mb-1.5 group-hover:text-emerald-400 transition-colors">{t.term}</h3>
                    <p className="text-sm text-white/35 leading-relaxed">{t.def}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/30">No terms match &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Put these concepts to work</h2>
            <p className="text-white/40 mb-8">Upload your Trial Balance and see these metrics calculated automatically for your business.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-emerald-500 text-white px-7 py-3.5 rounded-xl hover:bg-emerald-400 transition-all text-sm font-semibold">
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-t border-white/5 pt-6 flex items-center justify-between">
            <p className="text-xs text-white/20">&copy; 2026 CortexCFO Financial Intelligence Pvt. Ltd.</p>
            <div className="flex gap-4 text-xs text-white/20">
              <Link href="/privacy" className="hover:text-white/40">Privacy</Link>
              <Link href="/terms" className="hover:text-white/40">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
