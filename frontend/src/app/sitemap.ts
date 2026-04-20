import type { MetadataRoute } from "next";

/**
 * Programmatic sitemap — one entry per public URL we want Google to
 * crawl. Logged-in / app routes (/dashboard, /analysis, etc.) are
 * intentionally omitted; they live under Disallow in robots.ts.
 *
 * Priority and changeFrequency are hints, not promises. Google
 * decides; we just suggest. Landing pages get priority 1.0 (most
 * important), marketing pages 0.7, reference pages (terms, privacy,
 * glossary) 0.4.
 *
 * The three regional landings (/, /us, /in) each declare each other
 * as hreflang alternates so Google can serve the right one per
 * locale without duplicate-content penalties.
 */

const SITE_URL = "https://axiom-platform.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // The three region landings share hreflang alternates so Google
  // understands / = x-default, /us = en-US, /in = en-IN.
  const regionAlternates = {
    languages: {
      "en-US": `${SITE_URL}/us`,
      "en-IN": `${SITE_URL}/in`,
      "x-default": SITE_URL,
    },
  };

  return [
    // Region landings — top priority, weekly-ish update cadence as we
    // iterate on copy + tiers.
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: regionAlternates,
    },
    {
      url: `${SITE_URL}/us`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: regionAlternates,
    },
    {
      url: `${SITE_URL}/in`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
      alternates: regionAlternates,
    },
    // Core marketing pages — high intent
    {
      url: `${SITE_URL}/product`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Content / SEO pages — likely to bring organic traffic
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/glossary`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/knowledge-base`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/careers`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    // Legal — rarely changes, low priority but still crawlable
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
