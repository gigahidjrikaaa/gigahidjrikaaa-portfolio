import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  try {
    const response = await fetch(`${apiBase}/blog?status=published&page_size=100`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const data: { items: Array<{ slug: string; updated_at: string }> } = await response.json();
      if (data.items) {
        data.items.forEach((post) => {
          urls.push({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: post.updated_at,
            changeFrequency: 'monthly',
            priority: 0.8,
          });
        });
      }
    }
  } catch {
    // ignore sitemap errors
  }

  return urls;
}
