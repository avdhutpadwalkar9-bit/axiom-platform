import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "140+ definitions of the terms that show up in QoE engagements: adjusted EBITDA, add-backs, working-capital cycle, ASC 606, Ind AS, related-party transactions, and more.",
};

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
