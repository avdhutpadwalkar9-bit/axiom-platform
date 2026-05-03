import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind CortexCFO — built by an ex-US-diligence operator. The team running CPA review on every monthly QoE pack, the engagements that shaped the product, and how we got here.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
