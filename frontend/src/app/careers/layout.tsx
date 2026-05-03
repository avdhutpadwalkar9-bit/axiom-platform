import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join CortexCFO. We're hiring engineers, designers, and CAs/CPAs who care about getting financial analysis right. Remote-first, Mumbai + US time zones.",
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
