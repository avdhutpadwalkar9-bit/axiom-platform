import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How CortexCFO collects, stores, and uses your financial data. We never train models on your books. Encryption, data residency, and deletion policy.",
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
