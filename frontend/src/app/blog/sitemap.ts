import { MetadataRoute } from "next";
import { apiService, type BlogPostResponse } from "@/services/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let posts: BlogPostResponse[] = [];

  try {
    posts = await apiService.getBlogPosts();
  } catch {
    // Keep sitemap generation resilient when backend is unavailable at build time.
    posts = [];
  }

  const urls = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updated_at,
  }));

  return [
    { url: `${siteUrl}/blog`, lastModified: new Date().toISOString() },
    ...urls,
  ];
}
