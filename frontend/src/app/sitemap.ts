import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/blog`, lastModified: new Date().toISOString() },
  ];

  try {
    const response = await fetch(`${apiBase}/blog`, { next: { revalidate: 3600 } });
    if (response.ok) {
      const posts: Array<{ slug: string; updated_at: string }> = await response.json();
      posts.forEach((post) => {
        urls.push({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: post.updated_at,
        });
      });
    }
  } catch {
    // ignore sitemap errors
  }

  return urls;
}
