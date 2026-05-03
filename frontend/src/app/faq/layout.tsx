import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about CortexCFO — pricing, security, accuracy, integrations, sectors covered, and what makes our QoE different from a generic AI tool.",
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
