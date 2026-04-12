"use client";

import { useState } from "react";
import { FadeIn } from "@/components/Animate";
import {
  Factory,
  Monitor,
  Briefcase,
  ShoppingCart,
  Globe,
  HeartPulse,
  GraduationCap,
  Building,
  Wheat,
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
  ChevronDown,
  Download,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Industry data — comprehensive benchmarks and insights              */
/* ------------------------------------------------------------------ */
const industries = [
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    color: "bg-blue-50 text-blue-600",
    marketSize: "₹44 Lakh Cr",
    growth: "11.5%",
    msmePct: "20.93%",
    overview: "India's manufacturing sector contributes around 17% to GDP. MSMEs account for 35.4% of total manufacturing output. The sector is benefiting from PLI schemes, Make in India, and China+1 sourcing shifts. Key challenge remains working capital management and raw material price volatility.",
    kpis: [
      { label: "Gross Margin", low: "20%", avg: "32%", good: "40%", note: "Below 20% signals raw material cost pressure" },
      { label: "Net Margin", low: "3%", avg: "8%", good: "15%", note: "Top performers maintain 12-15% through operational efficiency" },
      { label: "Current Ratio", low: "1.0x", avg: "1.5x", good: "2.0x", note: "Below 1.0 signals working capital stress" },
      { label: "Inventory Turnover", low: "4x", avg: "8x", good: "12x", note: "Low turnover means dead stock accumulation" },
      { label: "Debt-to-Equity", low: "2.0x", avg: "1.2x", good: "0.5x", note: "High leverage common in capex-heavy units" },
      { label: "COGS Ratio", low: "70%", avg: "60%", good: "55%", note: "Raw material typically 55-70% of revenue" },
    ],
    redFlags: [
      "Inventory growing faster than revenue. Possible obsolescence risk.",
      "COGS ratio increasing year-over-year. Check supplier costs and production efficiency.",
      "Debtor days exceeding 90. Collection risk is high in Indian manufacturing.",
      "No depreciation on plant and machinery. Schedule II non-compliance under Companies Act.",
      "High finished goods with low raw material. Indicates production bottleneck.",
    ],
    insights: [
      "Working capital cycle optimization is the single biggest lever for manufacturing MSMEs. Aim for less than 60 days.",
      "GST input credit utilization on raw materials deserves close monitoring. Blocked ITC is a common cash trap.",
      "Capacity utilization above 75% is the threshold where unit economics start improving significantly.",
      "PLI scheme eligibility can provide 4-6% incremental margin. Review thresholds against current production.",
    ],
  },
  {
    id: "saas",
    name: "SaaS & Technology",
    icon: Monitor,
    color: "bg-purple-50 text-purple-600",
    marketSize: "₹5.3 Lakh Cr",
    growth: "18.2%",
    msmePct: "Growing fastest",
    overview: "India's SaaS sector is projected to reach $50B by 2030. Gross margins above 70% are standard for product companies. The key challenge is balancing growth investment (people, marketing) with path to profitability. Employee costs are the primary expense line.",
    kpis: [
      { label: "Gross Margin", low: "60%", avg: "72%", good: "85%", note: "Below 60% means service-heavy, not pure SaaS" },
      { label: "Net Margin", low: "-50%", avg: "-15%", good: "20%", note: "Early stage losses are normal; track improvement" },
      { label: "Employee Cost Ratio", low: "60%", avg: "45%", good: "35%", note: "Above 50% means overhired for current ARR" },
      { label: "Burn Rate", low: "High", avg: "Moderate", good: "Cash positive", note: "Track months of runway at current burn" },
      { label: "Rule of 40", low: "<20", avg: "30", good: ">40", note: "Growth % + Profit % should exceed 40" },
      { label: "LTV/CAC Ratio", low: "1x", avg: "2.5x", good: ">3x", note: "Below 3x means acquisition isn't profitable" },
    ],
    redFlags: [
      "Employee costs above 50% of revenue. Team is too large for current ARR.",
      "Marketing spend growing but CAC increasing. Signals channel saturation.",
      "No deferred revenue account. Revenue recognition risk under Ind AS 115.",
      "Cloud hosting costs growing faster than revenue. Architecture inefficiency.",
      "High receivables relative to ARR. Annual contracts not collected upfront.",
    ],
    insights: [
      "Revenue per employee is the key metric for SaaS efficiency. Top Indian SaaS companies achieve Rs 50-80L per employee.",
      "Net Revenue Retention above 110% means existing customers grow faster than churn. This is the best indicator of product-market fit.",
      "Indian SaaS exports are zero-rated for GST but compliance is heavy. Maintain proper documentation for LUT filing.",
      "Focus on contribution margin per customer before scaling marketing. Unprofitable growth accelerates cash burn.",
    ],
  },
  {
    id: "services",
    name: "Professional Services",
    icon: Briefcase,
    color: "bg-emerald-50 text-emerald-600",
    marketSize: "₹12 Lakh Cr",
    growth: "14.3%",
    msmePct: "35.27%",
    overview: "Services represent the largest MSME segment in India at 35.27% of all registered MSMEs. The business model is people-intensive with employee costs typically at 50-65% of revenue. Utilization rates and billing rates are the primary levers for profitability.",
    kpis: [
      { label: "Gross Margin", low: "30%", avg: "42%", good: "55%", note: "Directly tied to utilization rates" },
      { label: "Net Margin", low: "5%", avg: "12%", good: "22%", note: "Top firms achieve 20%+ through premium pricing" },
      { label: "Employee Cost Ratio", low: "65%", avg: "52%", good: "40%", note: "Below 50% indicates good leverage" },
      { label: "Revenue per Employee", low: "₹8L", avg: "₹15L", good: "₹25L+", note: "Varies widely by service type" },
      { label: "Debtor Days", low: "60+", avg: "45", good: "<30", note: "Cash collection is the biggest challenge" },
      { label: "Utilization Rate", low: "60%", avg: "72%", good: ">80%", note: "Billable hours vs total hours" },
    ],
    redFlags: [
      "Employee costs growing faster than revenue. Pricing not keeping up with salary inflation.",
      "Outstanding invoices beyond 60 days. Collection is always a challenge in Indian services.",
      "No TDS receivable. Clients should deduct TDS on professional fees under Section 194J.",
      "Revenue concentration above 30% from a single client. Dependency risk.",
      "Subcontractor costs misclassified as employee expenses. Creates compliance risk.",
    ],
    insights: [
      "Utilization rate improvement of even 5% can translate to 10-15% margin improvement in services businesses.",
      "Annual rate revision of 8-12% is essential to keep pace with Indian salary inflation, which averages 9-10% for skilled professionals.",
      "TDS compliance is critical. Both inward (from clients) and outward (to subcontractors) need Section 194J compliance.",
      "Services MSMEs supplying directly to end-users enjoy better margins than those supplying through intermediaries.",
    ],
  },
  {
    id: "trading",
    name: "Trading & Distribution",
    icon: ShoppingCart,
    color: "bg-amber-50 text-amber-600",
    marketSize: "₹18 Lakh Cr",
    growth: "9.8%",
    msmePct: "43.79%",
    overview: "Trading is the largest MSME segment at 43.79% of registered MSMEs. Margins are thin (8-20%) and the business is volume-driven. Working capital management and cash conversion cycle optimization are the primary success factors. GST reconciliation is critical due to high transaction volumes.",
    kpis: [
      { label: "Gross Margin", low: "5%", avg: "12%", good: "20%", note: "Below 5% is unsustainable without massive volume" },
      { label: "Net Margin", low: "1%", avg: "3%", good: "7%", note: "Thin margins require tight cost control" },
      { label: "Inventory Turnover", low: "6x", avg: "12x", good: "24x", note: "Higher is better. Dead stock kills margins" },
      { label: "Cash Conversion Cycle", low: "45+ days", avg: "20 days", good: "Negative", note: "Get paid before you pay suppliers" },
      { label: "Stock Days", low: "45+", avg: "30", good: "<20", note: "Lower means faster inventory movement" },
      { label: "Debt-to-Equity", low: "2.5x", avg: "1.5x", good: "0.8x", note: "Working capital loans are common" },
    ],
    redFlags: [
      "Gross margin below 5%. Not sustainable even with high volume.",
      "Inventory turnover declining quarter over quarter. Dead stock accumulation.",
      "Trade discounts exceeding 5% of revenue. Pricing power eroding.",
      "GST mismatch between purchases and sales. Audit risk from GSTR-2A discrepancies.",
      "Large sundry creditors without aging analysis. Potential disputes building up.",
    ],
    insights: [
      "Cash conversion cycle is the most important metric for traders. Aim to collect from customers before paying suppliers.",
      "GST reconciliation (GSTR-2A matching) is critical for trading businesses due to high transaction volumes.",
      "Over 85% of trading MSMEs integrated with e-commerce platforms report increased sales and profit margins.",
      "Negotiating creditor days to 45-60 days while maintaining debtor days under 30 creates a powerful working capital advantage.",
    ],
  },
  {
    id: "ecommerce",
    name: "E-commerce & D2C",
    icon: Globe,
    color: "bg-pink-50 text-pink-600",
    marketSize: "₹7.5 Lakh Cr",
    growth: "25.5%",
    msmePct: "Fast growing",
    overview: "India's e-commerce market is growing at 25%+ annually. Unit economics discipline is the key differentiator between surviving and failing brands. Contribution margin per order (after returns, discounts, delivery) must be tracked rigorously. Marketplace reconciliation is a common accounting gap.",
    kpis: [
      { label: "Gross Margin", low: "15%", avg: "30%", good: "45%", note: "After COGS, before marketing/delivery" },
      { label: "Net Margin", low: "-30%", avg: "-5%", good: "8%", note: "Path to profitability matters more than current loss" },
      { label: "CAC (Customer Acquisition)", low: "₹800+", avg: "₹400", good: "<₹200", note: "Must be lower than first-order margin" },
      { label: "Return Rate", low: "20%+", avg: "12%", good: "<8%", note: "Above 15% signals product/listing issues" },
      { label: "ROAS", low: "2x", avg: "3.5x", good: ">5x", note: "Return on Ad Spend. Below 3x is concerning" },
      { label: "Fulfillment Cost %", low: "20%+", avg: "12%", good: "<8%", note: "Logistics costs eat into thin margins" },
    ],
    redFlags: [
      "Marketing costs above 25% of revenue. Customer acquisition cost is too high.",
      "Return rate exceeding 15%. Product quality or listing accuracy issues.",
      "Discount-driven sales above 40% of GMV. Brand value eroding.",
      "Large marketplace clearing account balances. Reconciliation gaps building.",
      "Payment gateway charges not separately tracked. Hidden cost center.",
    ],
    insights: [
      "Contribution margin per order is the most important metric. Revenue minus COGS minus returns minus discounts minus delivery minus marketing must be positive.",
      "Reconcile marketplace settlements (Amazon, Flipkart) monthly. Delayed settlements trap working capital.",
      "D2C brands with 30%+ repeat purchase rate are 3x more likely to achieve profitability.",
      "In India, consider GST implications carefully. E-commerce operators must collect TCS at 1% under GST.",
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare & Pharma",
    icon: HeartPulse,
    color: "bg-red-50 text-red-600",
    marketSize: "₹8.5 Lakh Cr",
    growth: "16.8%",
    msmePct: "Growing",
    overview: "India's healthcare sector is expected to reach $372B by 2027. The sector is capital-intensive with long payback periods. Asset utilization (revenue per bed, per machine) and payer mix optimization are key. Pharma MSMEs benefit from India's position as the world's pharmacy.",
    kpis: [
      { label: "Gross Margin", low: "40%", avg: "55%", good: "70%", note: "Higher for speciality, lower for general" },
      { label: "Net Margin", low: "5%", avg: "12%", good: "20%", note: "Capital costs impact net margins" },
      { label: "Occupancy Rate", low: "50%", avg: "65%", good: ">75%", note: "For hospitals and clinics" },
      { label: "Staff Cost Ratio", low: "45%", avg: "35%", good: "28%", note: "Doctors and nurses are the biggest cost" },
      { label: "Revenue per Bed", low: "₹15L/yr", avg: "₹25L/yr", good: "₹40L+/yr", note: "Key efficiency metric for hospitals" },
      { label: "Insurance Collection Days", low: "90+", avg: "60", good: "<45", note: "TPA delays are a cash flow killer" },
    ],
    redFlags: [
      "Insurance receivables exceeding 60 days. TPA settlement delays impacting cash flow.",
      "Consumable costs rising faster than revenue. Procurement inefficiency or wastage.",
      "No provisions for medical malpractice contingencies. Legal exposure risk.",
      "Low occupancy with high fixed costs. Operational leverage working against you.",
      "High capital expenditure without proportional revenue growth from new equipment.",
    ],
    insights: [
      "Payer mix optimization is critical. Balance between insurance, government schemes (Ayushman Bharat), and cash patients.",
      "Asset utilization benchmarking (revenue per bed, per OT hour, per diagnostic machine) directly correlates to profitability.",
      "Generic pharma MSMEs in India enjoy 60-70% gross margins but face pricing pressure from DPCO regulations.",
      "Healthcare GST is complex. Most services are exempt but medical devices and consumables attract 12-18% GST.",
    ],
  },
  {
    id: "education",
    name: "Education & EdTech",
    icon: GraduationCap,
    color: "bg-indigo-50 text-indigo-600",
    marketSize: "₹4.2 Lakh Cr",
    growth: "20.1%",
    msmePct: "Growing",
    overview: "India's education sector is one of the largest in the world. EdTech saw explosive growth and is now focused on sustainable unit economics. Student acquisition cost, retention, and revenue per student are the key metrics. Revenue recognition (Ind AS 115) is complex for annual fee models.",
    kpis: [
      { label: "Gross Margin", low: "40%", avg: "58%", good: "72%", note: "Higher for digital, lower for physical" },
      { label: "Net Margin", low: "-20%", avg: "5%", good: "18%", note: "EdTech losses normalizing post-2023" },
      { label: "Student Acquisition Cost", low: "₹5000+", avg: "₹2500", good: "<₹1000", note: "Must be below first-year revenue" },
      { label: "Retention Rate", low: "50%", avg: "70%", good: ">85%", note: "Drop-off rate is the real cost killer" },
      { label: "Revenue per Student", low: "₹5K", avg: "₹15K", good: "₹30K+", note: "Annual, varies by program" },
      { label: "Refund Rate", low: "15%+", avg: "8%", good: "<5%", note: "High refunds signal course quality issues" },
    ],
    redFlags: [
      "High acquisition cost with low course completion rates. Product-market fit issue.",
      "Deferred revenue not properly recognized. Upfront annual fees need Ind AS 115 treatment.",
      "Content development costs capitalized but should be expensed. Watch for aggressive accounting.",
      "Heavy dependence on paid marketing with declining returns on ad spend.",
      "Refund rate above 10%. Course quality or mismatched student expectations.",
    ],
    insights: [
      "Student lifetime value modeling is essential. Factor in upsell potential across courses and programs.",
      "GST exemptions apply to formal educational institutions but not most edtech platforms. Verify classification carefully.",
      "Content reusability ratio (students served per content investment) directly drives margin improvement.",
      "Cohort-based analysis of student outcomes drives organic referrals, reducing CAC by 40-60% for top platforms.",
    ],
  },
  {
    id: "realestate",
    name: "Real Estate & Construction",
    icon: Building,
    color: "bg-slate-50 text-slate-600",
    marketSize: "₹16 Lakh Cr",
    growth: "8.5%",
    msmePct: "Significant",
    overview: "India's real estate sector is the second largest employer after agriculture. Accounting is complex due to Ind AS 115 (revenue recognition on percentage of completion), RERA compliance, and GST on under-construction properties. Project-wise profitability tracking is essential.",
    kpis: [
      { label: "Gross Margin", low: "15%", avg: "28%", good: "40%", note: "Varies significantly by location and segment" },
      { label: "Net Margin", low: "5%", avg: "12%", good: "22%", note: "After interest on project loans" },
      { label: "Debt-to-Equity", low: "3.0x", avg: "1.8x", good: "0.8x", note: "Real estate is inherently leveraged" },
      { label: "DSCR", low: "1.0x", avg: "1.5x", good: ">2.0x", note: "Debt Service Coverage Ratio. Below 1.2 is risky" },
      { label: "Unsold Inventory", low: "24+ months", avg: "15 months", good: "<9 months", note: "Months of supply at current sales pace" },
      { label: "Construction Cost/Sq.Ft.", low: "Varies", avg: "₹2000-3500", good: "Below avg", note: "Monitor against project budgets" },
    ],
    redFlags: [
      "Revenue recognized but cash not collected. Aggressive revenue recognition under Ind AS 115.",
      "Land advances without project approvals. Capital at risk.",
      "High inter-company transactions. Related party issues under Ind AS 24.",
      "RERA compliance costs not provisioned. Regulatory penalty exposure.",
      "GST on under-construction vs completed property not properly differentiated.",
    ],
    insights: [
      "Project-wise profitability is more important than consolidated P&L for real estate MSMEs.",
      "Cash flow forecasting by project milestone prevents the common trap of diverting funds between projects.",
      "RERA compliance creates cost obligations that must be provisioned upfront in project budgets.",
      "Interest capitalization during construction phase (Ind AS 23) can materially impact project margins if not tracked properly.",
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture & Agri-Processing",
    icon: Wheat,
    color: "bg-lime-50 text-lime-600",
    marketSize: "₹32 Lakh Cr",
    growth: "4.2%",
    msmePct: "Large informal",
    overview: "Agriculture contributes 17.5% to India's GDP and employs 42% of the workforce. Agricultural income enjoys tax exemptions under Section 10(1) but must be properly segregated from non-agricultural income. Seasonality and weather risk are inherent challenges. Post-harvest value addition improves margins significantly.",
    kpis: [
      { label: "Gross Margin", low: "15%", avg: "28%", good: "40%", note: "Much higher for processed vs raw produce" },
      { label: "Net Margin", low: "3%", avg: "10%", good: "20%", note: "Weather and price volatility affect this" },
      { label: "Post-Harvest Loss", low: "25%+", avg: "15%", good: "<8%", note: "India loses 10-16% of produce post-harvest" },
      { label: "Working Capital Cycle", low: "180+ days", avg: "120 days", good: "<90 days", note: "Seasonal income creates cash gaps" },
      { label: "Input Cost Ratio", low: "70%+", avg: "55%", good: "<45%", note: "Seeds, fertilizer, labor" },
      { label: "Yield per Hectare", low: "Below avg", avg: "National avg", good: "Above avg", note: "Varies by crop and region" },
    ],
    redFlags: [
      "No provision for crop failure. Agriculture is inherently risky and needs contingency planning.",
      "Input costs (seeds, fertilizer) capitalized instead of expensed. Accounting irregularity.",
      "Government subsidies not properly accounted for. Creates audit trail issues.",
      "Seasonal cash flow mismatch with no bridge financing arrangement.",
      "No crop insurance. Single season failure can wipe out the business.",
    ],
    insights: [
      "Post-harvest value addition (grading, packaging, processing) can improve margins from 15% to 40%+.",
      "Agricultural income tax exemption under Section 10(1) requires proper segregation of agri vs non-agri income.",
      "Government subsidies (PM-KISAN, state schemes) should be recognized as income in the period received.",
      "Cold chain infrastructure investment, while capital-intensive, reduces post-harvest losses by 60-70% and commands premium pricing.",
    ],
  },
  {
    id: "fmcg",
    name: "FMCG & Consumer Goods",
    icon: Package,
    color: "bg-orange-50 text-orange-600",
    marketSize: "₹6.5 Lakh Cr",
    growth: "10.8%",
    msmePct: "Significant",
    overview: "India's FMCG sector is the 4th largest globally. The Union Budget 2025-26 boosted the sector through increased disposable income and rural development focus. Distribution reach, brand building, and working capital efficiency are the key success factors. Rural markets now contribute over 36% of FMCG revenue.",
    kpis: [
      { label: "Gross Margin", low: "25%", avg: "40%", good: "55%", note: "Premium brands command higher margins" },
      { label: "Net Margin", low: "5%", avg: "12%", good: "20%", note: "Distribution costs compress margins" },
      { label: "Distribution Cost %", low: "15%+", avg: "10%", good: "<7%", note: "Logistics and channel margins" },
      { label: "Inventory Days", low: "45+", avg: "30", good: "<20", note: "Perishables need faster turnover" },
      { label: "Ad Spend % of Revenue", low: "15%+", avg: "8%", good: "<5%", note: "Brand building vs performance" },
      { label: "Revenue per SKU", low: "Low", avg: "Medium", good: "High", note: "SKU rationalization drives efficiency" },
    ],
    redFlags: [
      "Distribution costs exceeding 15% of revenue. Channel inefficiency or over-reliance on intermediaries.",
      "Inventory days increasing. Risk of expiry or obsolescence, especially for perishable goods.",
      "Trade scheme expenses growing faster than revenue. Channel dependence increasing.",
      "Returns and damaged goods exceeding 3% of revenue. Quality or logistics issues.",
      "Raw material costs highly volatile with no hedging strategy. Margin risk.",
    ],
    insights: [
      "Rural India contributes 36% of FMCG revenue and is growing faster than urban. Distribution reach in Tier 3-4 towns is a competitive moat.",
      "SKU rationalization typically improves working capital efficiency by 15-20%. Focus on top 20% of SKUs that drive 80% of revenue.",
      "Direct-to-consumer (D2C) channel can improve gross margins by 15-25% compared to traditional trade.",
      "GST has streamlined distribution. Companies with strong GST compliance and e-way bill processes have a logistics advantage.",
    ],
  },
  {
    id: "logistics",
    name: "Logistics & Supply Chain",
    icon: Truck,
    color: "bg-teal-50 text-teal-600",
    marketSize: "₹11 Lakh Cr",
    growth: "12.5%",
    msmePct: "Growing",
    overview: "India's logistics sector is transforming with GST unification, dedicated freight corridors, and digital adoption. The sector contributes 14% to GDP. Asset-heavy (fleet owners) vs asset-light (3PL brokers) models have very different financial profiles. Fuel costs and vehicle utilization are the primary margin drivers.",
    kpis: [
      { label: "Gross Margin", low: "12%", avg: "22%", good: "35%", note: "Asset-light models have higher margins" },
      { label: "Net Margin", low: "2%", avg: "6%", good: "12%", note: "Fuel cost volatility impacts this" },
      { label: "Fleet Utilization", low: "55%", avg: "70%", good: ">82%", note: "Empty miles destroy profitability" },
      { label: "Fuel Cost %", low: "45%+", avg: "35%", good: "<30%", note: "Biggest variable cost for fleet owners" },
      { label: "Revenue per Vehicle/Month", low: "₹80K", avg: "₹1.5L", good: "₹2.5L+", note: "Net of fuel and driver costs" },
      { label: "Debtor Days", low: "60+", avg: "40", good: "<25", note: "Large shippers often delay payments" },
    ],
    redFlags: [
      "Fleet utilization below 60%. Too many empty return trips. Optimize with load matching.",
      "Fuel costs above 40% of revenue without hedging. Margin vulnerable to oil price spikes.",
      "Driver costs increasing without productivity improvement. Consider fleet management tech.",
      "Large receivables from a few major clients. Concentration and payment delay risk.",
      "Vehicle depreciation policy not aligned with actual useful life. Review asset schedules.",
    ],
    insights: [
      "Fleet utilization optimization from 65% to 80% can improve margins by 6-8% through reduced empty miles.",
      "Digital load matching platforms can reduce empty trips by 30-40%. Consider technology adoption.",
      "GST e-way bill compliance has reduced transit times by 20-30%. Efficient compliance is a competitive advantage.",
      "Electric vehicle transition for last-mile delivery can reduce per-km costs by 40% despite higher upfront investment.",
    ],
  },
];

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */
export default function IndustryExpertisePage() {
  const [expandedId, setExpandedId] = useState<string | null>("manufacturing");
  const [activeSection, setActiveSection] = useState<Record<string, string>>({});

  const toggleIndustry = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSection = (id: string) => activeSection[id] || "benchmarks";

  return (
    <div className="p-6 lg:p-8 max-w-[1200px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Industry Expertise</h1>
        <p className="text-sm text-[#666]">
          Financial benchmarks, KPIs, and strategic insights across {industries.length} Indian industry sectors.
          Use these to benchmark your business performance.
        </p>
      </div>

      {/* Market overview cards */}
      <FadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Industries Covered", value: `${industries.length}`, sub: "Sectors" },
          { label: "MSME Contribution to GDP", value: "31.1%", sub: "FY2025" },
          { label: "Registered MSMEs", value: "4.7 Cr+", sub: "Udyam portal" },
          { label: "MSME Manufacturing Output", value: "35.4%", sub: "Of total mfg" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-[#e5e5e5] p-4">
            <p className="text-2xl font-bold text-[#1a1a1a]">{card.value}</p>
            <p className="text-xs text-[#666] mt-0.5">{card.label}</p>
            <p className="text-[10px] text-[#bbb]">{card.sub}</p>
          </div>
        ))}
      </div>
      </FadeIn>

      {/* Industry accordion list */}
      <div className="space-y-3">
        {industries.map((ind, idx) => {
          const Icon = ind.icon;
          const isOpen = expandedId === ind.id;
          const section = getSection(ind.id);

          return (
            <FadeIn key={ind.id} delay={idx * 50}>
            <div className="bg-white rounded-xl border border-[#e5e5e5] overflow-hidden hover-lift">
              {/* Header */}
              <button
                onClick={() => toggleIndustry(ind.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${ind.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-[#1a1a1a]">{ind.name}</h3>
                  <div className="flex items-center gap-4 mt-0.5">
                    <span className="text-[11px] text-[#999]">Market: {ind.marketSize}</span>
                    <span className="text-[11px] text-emerald-600">Growth: {ind.growth}</span>
                    <span className="text-[11px] text-[#bbb]">MSMEs: {ind.msmePct}</span>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#ccc] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-[#f0f0f0]">
                  {/* Overview */}
                  <div className="px-6 py-4 bg-[#fafafa]">
                    <p className="text-sm text-[#444] leading-relaxed">{ind.overview}</p>
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-1 px-6 py-3 border-b border-[#f0f0f0]">
                    {[
                      { key: "benchmarks", label: "Benchmarks", icon: BarChart3 },
                      { key: "redflags", label: "Red Flags", icon: AlertTriangle },
                      { key: "insights", label: "Insights", icon: Target },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveSection((prev) => ({ ...prev, [ind.id]: tab.key }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            section === tab.key ? "bg-[#1a1a1a] text-white" : "text-[#999] hover:bg-[#f0f0f0]"
                          }`}
                        >
                          <TabIcon className="w-3 h-3" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Benchmarks */}
                  {section === "benchmarks" && (
                    <div className="px-6 py-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[11px] text-[#999] uppercase tracking-wider border-b border-[#f0f0f0]">
                            <th className="text-left py-2 font-medium">KPI</th>
                            <th className="text-center py-2 font-medium text-red-400">Needs Work</th>
                            <th className="text-center py-2 font-medium text-amber-500">Average</th>
                            <th className="text-center py-2 font-medium text-emerald-500">Good</th>
                            <th className="text-left py-2 font-medium pl-4">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ind.kpis.map((kpi) => (
                            <tr key={kpi.label} className="border-b border-[#f5f5f5]">
                              <td className="py-3 font-medium text-[#1a1a1a]">{kpi.label}</td>
                              <td className="py-3 text-center text-red-500 font-mono text-xs">{kpi.low}</td>
                              <td className="py-3 text-center text-amber-600 font-mono text-xs">{kpi.avg}</td>
                              <td className="py-3 text-center text-emerald-600 font-mono text-xs">{kpi.good}</td>
                              <td className="py-3 text-[#999] text-xs pl-4">{kpi.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Red Flags */}
                  {section === "redflags" && (
                    <div className="px-6 py-4 space-y-2">
                      {ind.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-100">
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-[#444] leading-relaxed">{flag}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insights */}
                  {section === "insights" && (
                    <div className="px-6 py-4 space-y-2">
                      {ind.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <div className="w-5 h-5 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-[#444] leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
