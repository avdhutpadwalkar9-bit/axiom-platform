import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge base",
  description:
    "Articles drawn from real US diligence engagements. Quality of Earnings, add-back schedules, sector-specific patterns, working-capital normalization — operator-grade, no theory, no templates.",
};

export default function KnowledgeBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
