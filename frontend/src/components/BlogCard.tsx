"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPostResponse } from "@/services/api";

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const BlogCard = ({ post }: { post: BlogPostResponse }) => {
  const publishedAt = formatDate(post.published_at || post.created_at);
  const tags = post.tags ? post.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {post.cover_image_url ? (
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Cover image pending
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {post.is_featured && (
            <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white shadow">
              Featured
            </span>
          )}
          {post.category && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow">
              {post.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {publishedAt && <span>{publishedAt}</span>}
          {post.reading_time_minutes ? <span>{post.reading_time_minutes} min read</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">{post.title}</h3>
        {post.excerpt && <p className="mt-3 text-sm text-gray-600">{post.excerpt}</p>}

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-6">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-semibold text-gray-900 hover:underline"
          >
            Read more →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
