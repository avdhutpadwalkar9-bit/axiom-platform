/* Stealth landing layout · 2026-05-20.
   Doesn't share SiteNav / SiteFooter — those carry CortexCFO branding
   that would break cover for the CA-firm interest test. This route
   stands alone with its own minimal head metadata. */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Early access · for boutique CA firms",
  description:
    "AI handles account clean-up + draft insights for your clients. Your team reviews, signs off, ships faster. In private beta with Indian CA firms working ₹10–50 Cr MSMEs.",
  // Prevent indexing while in stealth · don't want this surfacing in
  // organic search before the user reveals the play.
  robots: {
    index: false,
    follow: false,
  },
};

export default function EarlyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
