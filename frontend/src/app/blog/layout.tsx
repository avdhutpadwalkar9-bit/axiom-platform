import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Operator-grade notes on Quality of Earnings, M&A diligence, FP&A discipline, and the financial patterns we see across real engagements.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
