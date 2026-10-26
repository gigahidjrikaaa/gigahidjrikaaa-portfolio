// Canonical origin of the deployed site and API. Every public SEO surface
// (robots, sitemap, canonical/OG tags, JSON-LD) must render these URLs.
// The fallbacks intentionally point at production: if the env var is missing
// at build time (e.g. a fresh hosting setup), emitting localhost URLs would
// tell search engines the canonical copy of the site lives on 127.0.0.1.
// Local development overrides both via .env.local.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.gigahidjrikaaa.my.id"
).replace(/\/+$/, "");

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://portfolio-giga.onrender.com/api/v1"
).replace(/\/+$/, "");
