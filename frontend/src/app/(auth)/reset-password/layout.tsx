import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password",
  description:
    "Choose a new CortexCFO password. The reset link expires 60 minutes after it was sent and can only be used once.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
