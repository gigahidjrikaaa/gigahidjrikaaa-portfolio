"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { apiService, BlogPostResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import ErrorState from "@/components/ui/ErrorState";
import { useApiData } from "@/hooks/useApiData";
import { ArrowUpRight, Newspaper } from "lucide-react";

const copy = {
  eyebrow: "BLOG",
  title: "Read my articles",
  subtitle: "Notes from real projects: architecture decisions, mistakes, and what worked in production.",
  cta: "View all articles",
  loading: "Loading articles…",
  empty: "No articles published yet.",
  openBlog: "Open blog",
  readOnBlog: "Read on blog →",
};

const formatDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

export default function ArticlesPreview() {
  const { data: postsData, loading, error, retry } = useApiData<BlogPostResponse[]>(() =>
    apiService.getBlogPostsPaged({ page: 1, page_size: 3 }).then((data) => {
      const candidates = data.latest?.length ? data.latest : data.items;
      return candidates.slice(0, 3);
    })
  );
  const posts = postsData ?? [];
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: reduceMotion ? undefined : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section id="articles" className="relative overflow-hidden bg-white py-24 md:py-32">
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
        ) : error ? (
          <ErrorState
            title="Articles couldn't load"
            message={error}
            onRetry={retry}
          />
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
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
            {/* Featured article: cover-led, grayscale-to-color on hover */}
            {(() => {
              const post = posts[0];
              const publishedAt = formatDate(post.published_at || post.created_at);
              const isExternal = post.is_external && post.external_url;
              const href = isExternal ? post.external_url! : `/blog/${post.slug}`;
              const cover = post.og_image_url || post.cover_image_url;
              const readTime = post.reading_time_minutes
                ? `${post.reading_time_minutes} min read`
                : null;
              const Inner = (
                <>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
                        <Newspaper className="h-10 w-10 text-zinc-300" />
                      </div>
                    )}
                    {post.category ? (
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm backdrop-blur">
                        {post.category}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {publishedAt ? <span>{publishedAt}</span> : null}
                      {readTime ? (
                        <>
                          <span aria-hidden>·</span>
                          <span className="tabular-nums">{readTime}</span>
                        </>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                        {post.excerpt}
                      </p>
                    ) : null}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-gray-900">
                      {isExternal
                        ? `Read on ${post.external_source || "External Site"}`
                        : copy.readOnBlog}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </>
              );
              const featuredClasses =
                "group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl";
              return (
                <motion.div
                  key={post.id}
                  {...fadeUp(0.1)}
                  className="lg:row-span-1"
                >
                  {isExternal ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={featuredClasses} aria-label={post.title}>
                      {Inner}
                    </a>
                  ) : (
                    <Link href={href} className={featuredClasses} aria-label={post.title}>
                      {Inner}
                    </Link>
                  )}
                </motion.div>
              );
            })()}

            {/* Remaining posts: numbered editorial list */}
            <div className="flex flex-col">
              {posts.slice(1).map((post, index) => {
                const publishedAt = formatDate(post.published_at || post.created_at);
                const isExternal = post.is_external && post.external_url;
                const href = isExternal ? post.external_url! : `/blog/${post.slug}`;
                const readTime = post.reading_time_minutes
                  ? `${post.reading_time_minutes} min`
                  : null;

                const Row = (
                  <>
                    <span aria-hidden className="text-sm font-semibold tabular-nums text-zinc-300">
                      {String(index + 2).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {post.category ? (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-gray-600">
                            {post.category}
                          </span>
                        ) : null}
                        {publishedAt ? <span>{publishedAt}</span> : null}
                        {readTime ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="tabular-nums">{readTime}</span>
                          </>
                        ) : null}
                      </div>
                      <h3 className="mt-2.5 text-lg font-semibold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-zinc-600">
                        {post.title}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </span>
                    <span className="self-center rounded-full border border-gray-200 p-2 text-gray-400 transition-all duration-300 group-hover:border-gray-900 group-hover:bg-gray-900 group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </>
                );
                const rowClasses =
                  "group flex w-full items-start gap-5 border-t border-gray-200 px-2 py-6 text-left transition-colors first:border-t-0 hover:bg-gray-50/60";
                const rowMotion = { ...fadeUp(0.18 + index * 0.08) };

                return isExternal ? (
                  <motion.a
                    key={post.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClasses}
                    aria-label={post.title}
                    {...rowMotion}
                  >
                    {Row}
                  </motion.a>
                ) : (
                  <motion.div key={post.id} {...rowMotion}>
                    <Link href={href} className={rowClasses} aria-label={post.title}>
                      {Row}
                    </Link>
                  </motion.div>
                );
              })}

              <Link
                href="/blog"
                className="mt-2 inline-flex items-center gap-2 px-2 text-sm font-semibold text-gray-900 hover:underline"
              >
                {copy.cta}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
