import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your CortexCFO account. Forgot your password? Reset it from the login screen.",
  // Auth pages don't need to rank — keep them out of search results.
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
