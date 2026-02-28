"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { apiService, BlogPostResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { ExternalLink } from "lucide-react";

const copy = {
  eyebrow: "BLOG",
  title: "Read my articles",
  subtitle: "Short reads on engineering, product, and problem-solving.",
  cta: "View all articles",
  loading: "Loading articles…",
  empty: "No articles published yet.",
  openBlog: "Open blog",
  readOnBlog: "Read on blog →",
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function ArticlesPreview() {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = async () => {
      try {
        const data = await apiService.getBlogPostsPaged({ page: 1, page_size: 3 });
        const candidates = data.latest?.length ? data.latest : data.items;
        if (!cancelled) setPosts(candidates.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch blog posts", error);
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPosts();

    return () => { cancelled = true; };
  }, []);

  const fadeUp = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="articles" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="mb-12 flex flex-wrap items-end justify-between gap-4"
          {...fadeUp(0)}
        >
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">{copy.subtitle}</p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-gray-700"
            aria-label={copy.openBlog}
          >
            {copy.cta}
          </Link>
        </motion.div>

        {loading ? (
          <LoadingAnimation label={copy.loading} />
        ) : posts.length === 0 ? (
          <motion.div
            className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-gray-600"
            {...fadeUp(0.1)}
          >
            <p>{copy.empty}</p>
            <Link href="/blog" className="mt-3 inline-block text-sm font-semibold text-gray-900 hover:underline">
              {copy.cta} →
            </Link>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((post, index) => {
              const publishedAt = formatDate(post.published_at || post.created_at);
              const isExternal = post.is_external && post.external_url;
              const href = isExternal ? post.external_url! : `/blog/${post.slug}`;

              const CardContent = (
                <>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {publishedAt ? <span>{publishedAt}</span> : null}
                    {post.category ? (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{post.category}</span>
                    ) : null}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{post.title}</h3>
                  {post.excerpt ? (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                  ) : null}

                  <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:underline">
                    {isExternal ? `Read on ${post.external_source || "External Site"}` : copy.readOnBlog}
                    {isExternal && <ExternalLink className="h-3 w-3" />}
                  </div>
                </>
              );

              const cardClasses =
                "group block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg";

              return (
                <motion.div key={post.id} {...fadeUp(0.1 + index * 0.07)}>
                  {isExternal ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClasses}
                      aria-label={post.title}
                    >
                      {CardContent}
                    </a>
                  ) : (
                    <Link
                      href={href}
                      className={cardClasses}
                      aria-label={post.title}
                    >
                      {CardContent}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
