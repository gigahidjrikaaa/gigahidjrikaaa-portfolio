import { MetadataRoute } from "next";
import { apiService } from "@/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posts = await apiService.getBlogPosts();
  const urls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
  }));

  return [
    { url: `${siteUrl}/blog`, lastModified: new Date().toISOString() },
    ...urls,
  ];
}
