import type { MetadataRoute } from "next";

/**
 * robots.txt — tells crawlers what to index and what to leave alone.
 *
 * Allow: public marketing + landing pages (the entire indexable site).
 * Disallow: authenticated app routes. These either 404 or require a
 * JWT, so Google indexing them would just pollute results with login
 * walls. Also blocks Next.js internal routes and the API surface.
 */

const SITE_URL = "https://axiom-platform.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Auth flow — sign-in walls aren't useful in search results.
          "/login",
          "/signup",
          "/verify-email",
          // App shell — gated by JWT; Google sees only a login redirect.
          "/dashboard",
          "/analysis",
          "/onboarding",
          "/profile",
          "/uploads",
          "/scenarios",
          "/integrations",
          "/industries",
          "/qoe",
          "/feedback",
          "/models",
          // Next.js internals
          "/api/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
