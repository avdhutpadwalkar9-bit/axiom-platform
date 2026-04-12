// Dummy data for TechFlow Solutions - a B2B SaaS company
// Series A funded, 42 employees, $1.44M ARR

export const company = {
  name: "TechFlow Solutions",
  industry: "B2B SaaS",
  stage: "Series A",
  employees: 42,
  founded: "2022",
};

export const kpis = {
  cashRunway: { value: 18.2, unit: "months", change: -1.3, trend: "down" },
  adjustedEbitda: { value: -68500, unit: "USD", change: 12.4, trend: "up" },
  burnRate: { value: 85200, unit: "USD/mo", change: -5.2, trend: "up" },
  mrr: { value: 124500, unit: "USD", change: 8.3, trend: "up" },
  arr: { value: 1494000, unit: "USD", change: 8.3, trend: "up" },
  grossMargin: { value: 0.723, unit: "%", change: 1.2, trend: "up" },
  ltv: { value: 18500, unit: "USD", change: 3.1, trend: "up" },
  cac: { value: 4200, unit: "USD", change: -8.5, trend: "up" },
  ltvCacRatio: { value: 4.4, unit: "x", change: 12.7, trend: "up" },
  nrr: { value: 1.12, unit: "%", change: 2.1, trend: "up" },
  churnRate: { value: 0.024, unit: "%", change: -0.3, trend: "up" },
  cashBalance: { value: 1552000, unit: "USD", change: -5.2, trend: "down" },
};

export const monthlyRevenue = [
  { month: "Jul 2025", revenue: 82000, cogs: 24600, opex: 142000, ebitda: -84600, customers: 68 },
  { month: "Aug 2025", revenue: 86500, cogs: 25100, opex: 145000, ebitda: -83600, customers: 72 },
  { month: "Sep 2025", revenue: 91200, cogs: 25800, opex: 148000, ebitda: -82600, customers: 76 },
  { month: "Oct 2025", revenue: 97800, cogs: 27400, opex: 150000, ebitda: -79600, customers: 82 },
  { month: "Nov 2025", revenue: 103500, cogs: 28500, opex: 152000, ebitda: -77000, customers: 87 },
  { month: "Dec 2025", revenue: 108200, cogs: 29700, opex: 155000, ebitda: -76500, customers: 91 },
  { month: "Jan 2026", revenue: 112800, cogs: 30800, opex: 157000, ebitda: -75000, customers: 95 },
  { month: "Feb 2026", revenue: 117500, cogs: 31200, opex: 158000, ebitda: -71700, customers: 99 },
  { month: "Mar 2026", revenue: 120300, cogs: 32100, opex: 159000, ebitda: -70800, customers: 102 },
  { month: "Apr 2026", revenue: 124500, cogs: 34500, opex: 158700, ebitda: -68700, customers: 106 },
];

export const waterfallData = [
  { name: "Beginning Cash", value: 1637200, fill: "#6366f1" },
  { name: "Revenue", value: 124500, fill: "#22c55e" },
  { name: "COGS", value: -34500, fill: "#ef4444" },
  { name: "Salaries", value: -89200, fill: "#ef4444" },
  { name: "Marketing", value: -28400, fill: "#ef4444" },
  { name: "Infrastructure", value: -18700, fill: "#ef4444" },
  { name: "G&A", value: -22200, fill: "#ef4444" },
  { name: "Other Income", value: 3300, fill: "#22c55e" },
  { name: "Tax Refund", value: 12000, fill: "#22c55e" },
  { name: "Ending Cash", value: 1552000, fill: "#6366f1" },
];

export const expenseBreakdown = [
  { category: "Engineering Salaries", amount: 52000, percent: 30.1 },
  { category: "Sales & Marketing", amount: 28400, percent: 16.4 },
  { category: "Cloud Infrastructure", amount: 18700, percent: 10.8 },
  { category: "General & Admin", amount: 22200, percent: 12.8 },
  { category: "Customer Support", amount: 14200, percent: 8.2 },
  { category: "Non-Eng Salaries", amount: 23000, percent: 13.3 },
  { category: "Other OpEx", amount: 14500, percent: 8.4 },
];

export const aiInsights = [
  {
    id: 1,
    severity: "warning",
    title: "Marketing ROI Declining",
    description: "Marketing spend increased 15% but customer acquisition dropped 3%. CAC rose from $3,870 to $4,200. Recommend reviewing channel allocation — paid search CPA up 28%.",
    action: "View Channel Analysis",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    severity: "success",
    title: "Gross Margin Improving",
    description: "Gross margin expanded from 70.8% to 72.3% over the past quarter due to infrastructure optimization. Annual savings projected at $38K.",
    action: "View Breakdown",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    severity: "info",
    title: "Revenue Recognition Adjustment",
    description: "₹2.1L in deferred revenue from annual contracts should be recognized this quarter. 3 contracts meet ASC 606 criteria for recognition.",
    action: "Review Contracts",
    timestamp: "1 day ago",
  },
  {
    id: 4,
    severity: "warning",
    title: "GST Input Credit Blocked",
    description: "₹4.8L in input tax credits are blocked due to vendor non-compliance on GSTR-2A. Working capital impact: 2.1% of monthly burn.",
    action: "View GST Health",
    timestamp: "1 day ago",
  },
  {
    id: 5,
    severity: "success",
    title: "Cash Runway Extended",
    description: "Burn rate decreased 5.2% month-over-month. At current trajectory, runway extends from 17 months to 18.2 months without additional funding.",
    action: "View Forecast",
    timestamp: "3 days ago",
  },
];

export const scenarioEvents = [
  {
    id: "evt-1",
    title: "Hire 3 Sales Reps",
    month: "Jun 2026",
    impact: { burnRate: 21000, revenue: 15000, delay: 3 },
    type: "hiring",
    color: "#8b5cf6",
  },
  {
    id: "evt-2",
    title: "Price Increase 10%",
    month: "Aug 2026",
    impact: { burnRate: 0, revenue: 12450, delay: 0 },
    type: "pricing",
    color: "#22c55e",
  },
  {
    id: "evt-3",
    title: "Series B Raise ($5M)",
    month: "Oct 2026",
    impact: { burnRate: 0, revenue: 0, cash: 5000000 },
    type: "funding",
    color: "#3b82f6",
  },
  {
    id: "evt-4",
    title: "Office Expansion",
    month: "Sep 2026",
    impact: { burnRate: 8000, revenue: 0, delay: 0 },
    type: "opex",
    color: "#f59e0b",
  },
];

export const forecastData = {
  base: [
    { month: "May 2026", cash: 1466800, revenue: 128000, burn: 85200 },
    { month: "Jun 2026", cash: 1381600, revenue: 131500, burn: 85200 },
    { month: "Jul 2026", cash: 1296400, revenue: 135200, burn: 85200 },
    { month: "Aug 2026", cash: 1211200, revenue: 139100, burn: 85200 },
    { month: "Sep 2026", cash: 1126000, revenue: 143000, burn: 85200 },
    { month: "Oct 2026", cash: 1040800, revenue: 147100, burn: 85200 },
    { month: "Nov 2026", cash: 955600, revenue: 151300, burn: 85200 },
    { month: "Dec 2026", cash: 870400, revenue: 155800, burn: 85200 },
  ],
  best: [
    { month: "May 2026", cash: 1466800, revenue: 134400, burn: 80000 },
    { month: "Jun 2026", cash: 1421200, revenue: 141100, burn: 80000 },
    { month: "Jul 2026", cash: 1382300, revenue: 148200, burn: 80000 },
    { month: "Aug 2026", cash: 1350500, revenue: 163000, burn: 80000 },
    { month: "Sep 2026", cash: 1333500, revenue: 179300, burn: 80000 },
    { month: "Oct 2026", cash: 6332800, revenue: 197200, burn: 80000 },
    { month: "Nov 2026", cash: 6450000, revenue: 217000, burn: 80000 },
    { month: "Dec 2026", cash: 6587000, revenue: 238700, burn: 80000 },
  ],
  worst: [
    { month: "May 2026", cash: 1466800, revenue: 121600, burn: 92000 },
    { month: "Jun 2026", cash: 1346400, revenue: 118000, burn: 113000 },
    { month: "Jul 2026", cash: 1201400, revenue: 114700, burn: 113000 },
    { month: "Aug 2026", cash: 1053100, revenue: 111400, burn: 113000 },
    { month: "Sep 2026", cash: 901500, revenue: 108100, burn: 121000 },
    { month: "Oct 2026", cash: 738600, revenue: 104900, burn: 121000 },
    { month: "Nov 2026", cash: 572500, revenue: 101800, burn: 121000 },
    { month: "Dec 2026", cash: 403300, revenue: 98800, burn: 121000 },
  ],
};

export const qoeAdjustments = [
  {
    category: "Revenue Recognition",
    items: [
      { description: "Reclassify prepaid annual contracts (ASC 606)", amount: 210000, type: "adjustment", status: "flagged" },
      { description: "Remove one-time consulting revenue", amount: -45000, type: "addback", status: "approved" },
      { description: "Normalize seasonal revenue spike (Q4)", amount: -32000, type: "normalization", status: "pending" },
    ],
  },
  {
    category: "Working Capital",
    items: [
      { description: "GST input credit stuck (vendor non-compliance)", amount: 480000, type: "blocked", status: "flagged" },
      { description: "TDS receivable pending refund", amount: 125000, type: "receivable", status: "pending" },
      { description: "Advance to suppliers (non-trade)", amount: 85000, type: "adjustment", status: "approved" },
    ],
  },
  {
    category: "Operating Expenses",
    items: [
      { description: "One-time legal fee (IP filing)", amount: 180000, type: "addback", status: "approved" },
      { description: "Founder excess compensation vs. market", amount: 240000, type: "addback", status: "flagged" },
      { description: "Related party rent above market rate", amount: 60000, type: "addback", status: "pending" },
    ],
  },
  {
    category: "Compliance",
    items: [
      { description: "GSTR-1 vs GSTR-3B mismatch (Q3)", amount: 0, type: "compliance", status: "flagged" },
      { description: "TDS short deduction on professional fees", amount: 12000, type: "compliance", status: "pending" },
      { description: "PF/ESI late deposit penalty risk", amount: 8500, type: "compliance", status: "flagged" },
    ],
  },
];

export const integrations = [
  { name: "Tally Prime", logo: "T", category: "Accounting", status: "connected", lastSync: "2 min ago", color: "#ef4444" },
  { name: "Zoho Books", logo: "Z", category: "Accounting", status: "available", lastSync: null, color: "#f59e0b" },
  { name: "Razorpay", logo: "R", category: "Payments", status: "connected", lastSync: "5 min ago", color: "#3b82f6" },
  { name: "GSTN Portal", logo: "G", category: "Compliance", status: "connected", lastSync: "1 hour ago", color: "#22c55e" },
  { name: "ICICI Bank", logo: "I", category: "Banking", status: "connected", lastSync: "30 min ago", color: "#6366f1" },
  { name: "HDFC Bank", logo: "H", category: "Banking", status: "available", lastSync: null, color: "#0ea5e9" },
  { name: "QuickBooks", logo: "Q", category: "Accounting", status: "available", lastSync: null, color: "#22c55e" },
  { name: "Stripe", logo: "S", category: "Payments", status: "available", lastSync: null, color: "#6366f1" },
  { name: "Chargebee", logo: "C", category: "Billing", status: "available", lastSync: null, color: "#8b5cf6" },
  { name: "Cashfree", logo: "CF", category: "Payments", status: "available", lastSync: null, color: "#10b981" },
  { name: "MCA Portal", logo: "M", category: "Compliance", status: "available", lastSync: null, color: "#f97316" },
  { name: "Income Tax", logo: "IT", category: "Compliance", status: "connected", lastSync: "1 day ago", color: "#14b8a6" },
];
