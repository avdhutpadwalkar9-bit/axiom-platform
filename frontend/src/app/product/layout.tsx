import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description:
    "From raw trial balance to boardroom-ready analysis. CortexCFO automates parsing, classification, ratio analysis, compliance checks, and Quality-of-Earnings adjustments — every figure traced back to your GL.",
  openGraph: {
    title: "CortexCFO Product — Trial balance in, boardroom-ready analysis out",
    description:
      "Upload xlsx, csv, PDF, or Tally XML. CortexCFO handles 400+ header variants, tags every account to GAAP / Ind AS, and ships a CPA-signed pack.",
    type: "website",
  },
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
