import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Tell us about you and your business. Upload your trial balance and we'll generate your first CortexCFO pack.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
