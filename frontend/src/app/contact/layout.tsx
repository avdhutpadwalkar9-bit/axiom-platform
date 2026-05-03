import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Talk to the CortexCFO team. Demo requests, partnership inquiries, technical questions — we respond within 24 hours on business days.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
