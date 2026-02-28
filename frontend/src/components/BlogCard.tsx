"use client";

import Image from "next/image";
import Link from "next/link";
import { BlogPostResponse } from "@/services/api";
import { ExternalLink } from "lucide-react";

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const CardBody = ({ post }: { post: BlogPostResponse }) => {
  const publishedAt = formatDate(post.published_at || post.created_at);
  const tags = post.tags ? post.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
  const isExternal = post.is_external && post.external_url;

  return (
    <>
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
        {/* Top-left badges */}
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
        {/* External source badge — top-right */}
        {isExternal && (
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur-sm">
              {post.external_source || "External"} <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {publishedAt && <span>{publishedAt}</span>}
          {post.reading_time_minutes ? <span>{post.reading_time_minutes} min read</span> : null}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">{post.title}</h3>
        {post.excerpt && <p className="mt-3 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>}

        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-1 pt-6 text-sm font-semibold text-gray-900 group-hover:underline">
          {isExternal ? (
            <>Read on {post.external_source || "External Site"} <ExternalLink className="h-3 w-3" /></>
          ) : (
            "Read more →"
          )}
        </div>
      </div>
    </>
  );
};

const BlogCard = ({ post }: { post: BlogPostResponse }) => {
  const isExternal = post.is_external && post.external_url;
  const sharedClass =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg";

  if (isExternal) {
    return (
      <a
        href={post.external_url!}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClass}
        aria-label={`Read "${post.title}" on ${post.external_source ?? "external site"} (opens in new tab)`}
      >
        <CardBody post={post} />
      </a>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className={sharedClass} aria-label={`Read "${post.title}"`}>
      <CardBody post={post} />
    </Link>
  );
};

export default BlogCard;
