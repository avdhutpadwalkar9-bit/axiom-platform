import type { Metadata } from "next";

const SITE_URL = "https://axiom-platform.vercel.app";

export const metadata: Metadata = {
  title: "PE-ready financials for ₹10–50 Cr MSMEs",
  description:
    "Upload your Tally, Zoho, or QuickBooks trial balance. Get adjusted EBITDA, Ind AS-clean financials, and a CA-reviewed Quality-of-Earnings pack ready for PE diligence — in minutes.",
  alternates: {
    canonical: `${SITE_URL}/in`,
  },
  openGraph: {
    title: "CortexCFO India — PE-ready financials for ₹10–50 Cr MSMEs",
    description:
      "CA-reviewed QoE on your Tally / Zoho / QuickBooks ledger. For Indian MSMEs raising growth capital or preparing for PE / strategic exit.",
    url: `${SITE_URL}/in`,
    locale: "en_IN",
    type: "website",
  },
};

export default function InLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
