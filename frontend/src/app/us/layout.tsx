import type { Metadata } from "next";

const SITE_URL = "https://axiom-platform.vercel.app";

export const metadata: Metadata = {
  title: "M&A-ready Quality of Earnings for US SMBs",
  description:
    "Upload your QuickBooks or Xero trial balance. Get a CPA-signed QoE pack — adjusted EBITDA, add-back schedule, ASC 606 cut-off flags, sector comparables — for under $300/month.",
  alternates: {
    canonical: `${SITE_URL}/us`,
  },
  openGraph: {
    title: "CortexCFO US — M&A-ready Quality of Earnings",
    description:
      "CPA-signed QoE on your QuickBooks / Xero ledger. Pre-diligence prep before you hire Big-4 or enter buyer diligence.",
    url: `${SITE_URL}/us`,
    locale: "en_US",
    type: "website",
  },
};

export default function UsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
