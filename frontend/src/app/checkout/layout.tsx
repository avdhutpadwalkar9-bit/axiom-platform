import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your CortexCFO subscription. Region-aware pricing, encrypted checkout, no card data stored on our servers.",
  // Don't index the checkout flow itself — it's transactional, not content.
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
