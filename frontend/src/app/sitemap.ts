import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

interface SitemapConfig {
  sitemap_home_priority: number;
  sitemap_home_changefreq: string;
  sitemap_blog_enabled: boolean;
  sitemap_blog_priority: number;
  sitemap_blog_changefreq: string;
  sitemap_posts_enabled: boolean;
  sitemap_posts_priority: number;
  sitemap_posts_changefreq: string;
  sitemap_custom_pages: string | null;
}

const DEFAULTS: SitemapConfig = {
  sitemap_home_priority: 1.0,
  sitemap_home_changefreq: "daily",
  sitemap_blog_enabled: true,
  sitemap_blog_priority: 0.9,
  sitemap_blog_changefreq: "daily",
  sitemap_posts_enabled: true,
  sitemap_posts_priority: 0.8,
  sitemap_posts_changefreq: "monthly",
  sitemap_custom_pages: null,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch sitemap config from SEO settings (falls back to DEFAULTS on error)
  let cfg: SitemapConfig = DEFAULTS;
  try {
    const res = await fetch(`${apiBase}/seo`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data) cfg = { ...DEFAULTS, ...data };
    }
  } catch {
    // keep defaults
  }

  const toFreq = (v: string): MetadataRoute.Sitemap[number]["changeFrequency"] =>
    v as MetadataRoute.Sitemap[number]["changeFrequency"];

  const urls: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: toFreq(cfg.sitemap_home_changefreq),
      priority: cfg.sitemap_home_priority,
    },
  ];

  // Blog index
  if (cfg.sitemap_blog_enabled) {
    urls.push({
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: toFreq(cfg.sitemap_blog_changefreq),
      priority: cfg.sitemap_blog_priority,
    });
  }

  // Blog posts
  if (cfg.sitemap_posts_enabled) {
    try {
      const response = await fetch(`${apiBase}/blog?status=published&page_size=100`, {
        next: { revalidate: 3600 },
      });
      if (response.ok) {
        const data: { items: Array<{ slug: string; updated_at: string }> } = await response.json();
        if (data.items) {
          data.items.forEach((post) => {
            urls.push({
              url: `${siteUrl}/blog/${post.slug}`,
              lastModified: post.updated_at,
              changeFrequency: toFreq(cfg.sitemap_posts_changefreq),
              priority: cfg.sitemap_posts_priority,
            });
          });
        }
      }
    } catch {
      // ignore
    }
  }

  // Custom static pages added by admin
  if (cfg.sitemap_custom_pages) {
    try {
      const custom: Array<{ url: string; priority: number; changefreq: string }> =
        JSON.parse(cfg.sitemap_custom_pages);
      custom.forEach(({ url, priority, changefreq }) => {
        if (url) {
          const fullUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
          urls.push({
            url: fullUrl,
            lastModified: new Date(),
            changeFrequency: toFreq(changefreq),
            priority,
          });
        }
      });
    } catch {
      // ignore invalid JSON
    }
  }

  return urls;
}
