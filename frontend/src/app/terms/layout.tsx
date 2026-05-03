import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms governing your use of CortexCFO — advisory disclaimer, E&O coverage, data ownership, billing, and our service-level commitments.",
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
