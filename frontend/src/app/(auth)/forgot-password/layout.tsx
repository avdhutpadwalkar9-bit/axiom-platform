import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot password",
  description:
    "Reset your CortexCFO password. Enter your email and we'll send you a one-time reset link.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
