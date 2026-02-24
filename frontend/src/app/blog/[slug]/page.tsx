import type { Metadata } from "next";
import { apiService } from "@/services/api";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import ViewTracker from "./ViewTracker";
import LikeButton from "./LikeButton";
import BlogCard from "@/components/BlogCard";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await apiService.getBlogPostBySlug(slug);
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "";
  const ogImage = post.og_image_url || post.cover_image_url || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    keywords: post.seo_keywords ? post.seo_keywords.split(",").map((k) => k.trim()) : undefined,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const post = await apiService.getBlogPostBySlug(slug);

  if (post.is_external && post.external_url) {
    redirect(post.external_url);
  }

  const related = await apiService.getRelatedBlogPosts(slug);
  const publishedAt = post.published_at || post.created_at;
  const imageUrl = post.og_image_url || post.cover_image_url || undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    datePublished: publishedAt,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: "Giga Hidjrika",
    },
    image: imageUrl ? [imageUrl] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`,
    },
  };

  return (
    <article className="min-h-screen bg-white py-24">
      <ViewTracker slug={slug} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <Link href="/blog" className="font-semibold text-gray-900 hover:underline">Blog</Link>
          <span>/</span>
          <span>{post.category || "Insights"}</span>
        </div>

        <header className="max-w-3xl">
          {post.is_featured && (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Featured
            </span>
          )}
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {publishedAt ? (
              <span>{formatDate(publishedAt)}</span>
            ) : null}
            {post.reading_time_minutes ? <span>{post.reading_time_minutes} min read</span> : null}
            {post.view_count ? <span>{post.view_count} views</span> : null}
          </div>
          <div className="mt-4">
            <LikeButton slug={post.slug} initialCount={post.like_count ?? 0} />
          </div>
        </header>

        {post.cover_image_url && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-3xl">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <section
          className="prose prose-lg mt-10 max-w-3xl text-gray-800"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {post.tags && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.split(",").map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold text-gray-900">Related posts</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
