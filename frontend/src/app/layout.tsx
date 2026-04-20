import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Poppins — consistent sans across marketing + app. Pulled at 400/500/600/700
// so we don't need to hand-tune weights per surface.
const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Canonical production URL — used as the base for hreflang alternates
// below. When we split to cortexcfo.com later, swap this one string.
const SITE_URL = "https://axiom-platform.vercel.app";

export const metadata: Metadata = {
  title: "CortexCFO — The FP&A Platform for High-Growth Teams",
  description:
    "CortexCFO is the FP&A platform for high-growth teams. Build flexible financial models, collaborate across departments, and turn data into confident decisions.",
  // Hreflang alternates tell Google which version to serve to which
  // locale. "en-US" → /us (M&A-Readiness positioning, USD pricing).
  // "x-default" points to / (the regionally-neutral landing) so
  // everyone else lands there by default. Adding "/in" later is one
  // more line — and the SEO accrues to the single domain either way.
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": `${SITE_URL}/us`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: "CortexCFO — The FP&A Platform for High-Growth Teams",
    description:
      "AI FP&A for $1M-$10M SMBs. GAAP-clean financials, QoE-ready reports, strategic CFO advisor on call.",
    url: SITE_URL,
    siteName: "CortexCFO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
