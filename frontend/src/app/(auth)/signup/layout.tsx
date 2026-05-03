import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description:
    "Create your CortexCFO account. 14-day free trial, no credit card required. CPA-signed Quality-of-Earnings pack on your books in minutes.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
