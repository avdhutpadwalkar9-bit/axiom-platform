import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Three plans, no setup fees, cancel any time. Trial (14 days, free), Retainer ($299/month), Diligence (event-driven). What Big-4 charges for one engagement, we run continuously.",
  openGraph: {
    title: "CortexCFO Pricing — From $299/month",
    description:
      "Trial · Retainer · Diligence. Continuous Quality-of-Earnings, CPA-signed every month.",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
