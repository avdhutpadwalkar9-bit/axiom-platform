import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The Cognitive Engine architecture — eight specialist models that parse your ledger, classify entries, reason about your numbers, verify against the source GL, and ship a CPA-signed pack.",
};

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
