import type { Metadata } from "next";
import { apiService, BlogPostResponse } from "@/services/api";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | Giga Hidjrika",
  description: "Articles on AI, blockchain, product strategy, and engineering leadership.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Giga Hidjrika",
    description: "Articles on AI, blockchain, product strategy, and engineering leadership.",
    url: "/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Giga Hidjrika",
    description: "Articles on AI, blockchain, product strategy, and engineering leadership.",
  },
};

const pageSize = 9;

const getBlogData = async (page: number, category?: string, q?: string) => {
  const data = await apiService.getBlogPostsPaged({
    page,
    page_size: pageSize,
    category,
    q,
  });
  return data;
};

const buildPagination = (page: number, totalPages: number) => {
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i += 1) pages.push(i);
  return pages;
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

/** Large editorial hero card for the featured post. Server-rendered. */
function FeaturedCard({ post }: { post: BlogPostResponse }) {
  const publishedAt = formatDate(post.published_at || post.created_at);
  const isExternal = post.is_external && post.external_url;
  const href = isExternal ? post.external_url! : `/blog/${post.slug}`;
  const cover = post.og_image_url || post.cover_image_url;
  const readTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : null;

  const body = (
    <>
      <div className={cover ? "relative min-h-[280px] overflow-hidden lg:min-h-full" : "hidden"}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.02] group-hover:grayscale-0"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
            Featured
          </span>
          {post.category ? (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-600">
              {post.category}
            </span>
          ) : null}
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="mt-3 text-[15px] leading-relaxed text-gray-600 line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
          {publishedAt ? <span>{publishedAt}</span> : null}
          {readTime ? (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{readTime}</span>
            </>
          ) : null}
        </div>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          {isExternal ? `Read on ${post.external_source || "External Site"}` : "Read the article"}
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );

  const classes =
    "group grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl lg:grid-cols-[1fr_1.1fr]";
  const label = `Read "${post.title}"`;

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes} aria-label={label}>
      {body}
    </a>
  ) : (
    <Link href={href} className={classes} aria-label={label}>
      {body}
    </Link>
  );
}

interface BlogPageProps {
  searchParams?: Promise<{ page?: string; category?: string; q?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page || "1");
  const category = resolvedSearchParams?.category;
  const q = resolvedSearchParams?.q;
  const data = await getBlogData(page, category, q);

  const categories = data.categories ?? [];
  const featured = data.featured ?? [];
  const featuredIds = new Set(featured.map((p) => p.id));

  // Posts already shown in the featured hero don't repeat in the grid.
  const gridItems = data.items.filter((p) => !featuredIds.has(p.id));
  const pagination = buildPagination(data.page, data.total_pages);
  const querySuffix = `${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`;

  return (
    <section className="min-h-screen bg-white pt-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header */}
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Blog</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900 md:text-5xl">
            Insights &amp; Case Studies
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Research-backed thinking on AI systems, product strategy, and the future of
            decentralized tech.
          </p>
        </header>

        {/* Filter row: category pills + search */}
        <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-gray-100 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/blog"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !category ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${cat}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
          <form action="/blog" method="get" className="ml-auto flex items-center gap-2">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search posts..."
                className="h-10 w-48 rounded-full border border-gray-200 bg-white pl-10 pr-4 text-sm transition-colors focus:border-gray-900 focus:outline-none md:w-56"
              />
            </div>
            <button
              type="submit"
              className="h-10 rounded-full bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content */}
        {data.items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-gray-300 p-14 text-center text-gray-500">
            No posts yet. Check back soon.
          </div>
        ) : (
          <div className="mt-12 space-y-12">
            {featured.length > 0 && <FeaturedCard post={featured[0]} />}

            {gridItems.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {gridItems.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {gridItems.length === 0 && featured.length === 0 && (
              <div className="rounded-3xl border border-dashed border-gray-300 p-14 text-center text-gray-500">
                Nothing here yet.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data.total_pages > 1 && (
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-10">
            {data.page > 1 && (
              <Link
                href={`/blog?page=${data.page - 1}${querySuffix}`}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
              >
                Previous
              </Link>
            )}
            {pagination.map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}${querySuffix}`}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  p === data.page
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </Link>
            ))}
            {data.page < data.total_pages && (
              <Link
                href={`/blog?page=${data.page + 1}${querySuffix}`}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
