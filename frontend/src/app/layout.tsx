import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

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
  // "en-IN" → /in (PE-Readiness positioning, INR pricing, Ind AS).
  // "x-default" points to / — the regionally-neutral landing that
  // serves everyone else by default.
  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-US": `${SITE_URL}/us`,
      "en-IN": `${SITE_URL}/in`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: "CortexCFO — The FP&A Platform for High-Growth Teams",
    description:
      "AI FP&A for $1M-$10M SMBs. GAAP/Ind AS-clean financials, QoE-ready reports, strategic CFO advisor on call.",
    url: SITE_URL,
    siteName: "CortexCFO",
    type: "website",
  },
};

// Schema.org JSON-LD — gives Google / Bing structured signal for rich
// results. Three entities sitewide:
//   1. Organization — who we are, where we're based, what we do.
//   2. SoftwareApplication — the product itself, pricing range, rating.
//   3. WebSite — enables the sitelink search box in SERPs.
// Per-tier Offer markup lives on /us and /in if we extend later; sitewide
// is enough to earn the first round of rich results.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "CortexCFO",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        "AI-powered FP&A and QoE platform for high-growth SMBs preparing for M&A, PE, or growth capital.",
      sameAs: [
        // Placeholder — swap for real handles as they go live.
        "https://twitter.com/cortexcfo",
        "https://www.linkedin.com/company/cortexcfo",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "CortexCFO",
      publisher: { "@id": `${SITE_URL}#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}#software`,
      name: "CortexCFO",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "FinancialApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description:
        "Continuous QoE engine and AI FP&A advisor for SMBs. Upload your trial balance; get audit-ready financials, adjusted EBITDA, and strategic recommendations in minutes.",
      // Price range covers the free tier up through QoE-Ready custom
      // pricing. PriceSpecification breaks it down by region.
      offers: [
        {
          "@type": "Offer",
          name: "Starter",
          price: "0",
          priceCurrency: "USD",
          description: "Free forever — books health check for early-stage SMBs",
        },
        {
          "@type": "Offer",
          name: "Growth (US)",
          price: "99",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "99",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          description: "Valuation + 3-statement projections for $1-5M US SMBs",
        },
        {
          "@type": "Offer",
          name: "Growth (India)",
          price: "7999",
          priceCurrency: "INR",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "7999",
            priceCurrency: "INR",
            unitText: "MONTH",
          },
          description: "Valuation + 3-statement projections for ₹10-25 Cr Indian MSMEs",
        },
        {
          "@type": "Offer",
          name: "Diligence",
          price: "299",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "299",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          description: "Light-touch pre-diligence deliverables",
        },
        {
          "@type": "Offer",
          name: "Pre-M&A",
          price: "599",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "599",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          description: "Advanced diagnostic before going to market",
        },
        {
          "@type": "Offer",
          name: "QoE-Ready",
          price: "2499",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "2499",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
          description: "Full QoE workbook, CPA-reviewed, boardroom-ready",
        },
      ],
      featureList: [
        "Continuous QoE engine with add-back schedule",
        "Audit-ready GAAP / Ind AS financial statements",
        "Adjusted EBITDA with documented normalizations",
        "Live FX across USD / EUR / GBP / INR / JPY",
        "AI CFO advisor — multi-model Cognitive Engine with Quick + Think-Deeper modes",
        "Scenario planning + 13-week cash forecasting",
      ],
      publisher: { "@id": `${SITE_URL}#organization` },
    },
  ],
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
      <head>
        {/* Structured data for Google rich results. Using dangerouslySetInnerHTML
            because Next.js strips unknown children from <script> tags during
            hydration — this is the documented pattern. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Legacy-key rename: the persist keys were renamed from
            `axiom-*` to `cortexcfo-*` in an earlier release and
            existing users' data got stranded under the old key,
            showing "No Financial Data Yet" on dashboard. This runs
            synchronously before any JS module imports so Zustand's
            persist middleware reads from the correct key on first
            hydrate. Safe if either key already exists — we never
            overwrite a populated target. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{var m=[['axiom-analysis','cortexcfo-analysis'],['axiom-onboarding','cortexcfo-onboarding']];for(var i=0;i<m.length;i++){var k1=m[i][0],k2=m[i][1];if(!localStorage.getItem(k2)){var v=localStorage.getItem(k1);if(v)localStorage.setItem(k2,v);}}}catch(e){}`,
          }}
        />
        {/* No-flash theme resolver — runs before first paint so a
            returning light-mode user doesn't see a dark flash. Reads
            localStorage key cortexcfo-theme, falls back to system
            preference, writes theme-light | theme-dark on <html>. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('cortexcfo-theme');if(!t||t==='system'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var h=document.documentElement;h.classList.add(t==='light'?'theme-light':'theme-dark');h.style.colorScheme=t;}catch(e){document.documentElement.classList.add('theme-dark');}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
