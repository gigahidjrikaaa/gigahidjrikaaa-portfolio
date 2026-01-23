import type { Metadata } from "next";
import { apiService, BlogPostListResponse } from "@/services/api";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";

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

interface BlogPageProps {
  searchParams?: { page?: string; category?: string; q?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Number(searchParams?.page || "1");
  const category = searchParams?.category;
  const q = searchParams?.q;
  const data = await getBlogData(page, category, q);

  const categories = data.categories ?? [];
  const popular = data.popular ?? [];
  const latest = data.latest ?? [];
  const featured = data.featured ?? [];

  const pagination = buildPagination(data.page, data.total_pages);

  return (
    <section className="min-h-screen bg-white py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <header className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Blog</p>
              <h1 className="mt-3 text-4xl font-semibold text-gray-900">Insights & Case Studies</h1>
              <p className="mt-3 text-gray-600">
                Research-backed thinking on AI systems, product strategy, and the future of decentralized tech.
              </p>
            </header>

            <form className="mb-8 flex flex-col gap-3 md:flex-row" action="/blog" method="get">
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search posts..."
                className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:border-gray-900 focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-gray-900 px-6 text-sm font-semibold text-white"
              >
                Search
              </button>
            </form>

            {data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
                No posts yet. Check back soon.
              </div>
            ) : (
              <div className="space-y-10">
                {featured.length > 0 && (
                  <section className="rounded-3xl border border-gray-200 bg-gray-50 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">Featured</h2>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Highlights</span>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {featured.map((post) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                    </div>
                  </section>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  {data.items.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {data.total_pages > 1 && (
              <div className="mt-10 flex flex-wrap items-center gap-2">
                {data.page > 1 && (
                  <Link
                    href={`/blog?page=${data.page - 1}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600"
                  >
                    Previous
                  </Link>
                )}
                {pagination.map((p) => (
                  <Link
                    key={p}
                    href={`/blog?page=${p}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                    className={`rounded-full px-4 py-2 text-sm ${p === data.page ? "bg-gray-900 text-white" : "border border-gray-200 text-gray-600"}`}
                  >
                    {p}
                  </Link>
                ))}
                {data.page < data.total_pages && (
                  <Link
                    href={`/blog?page=${data.page + 1}${category ? `&category=${category}` : ""}${q ? `&q=${q}` : ""}`}
                    className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-8">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/blog"
                  className={`rounded-full px-4 py-2 text-sm ${!category ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}
                >
                  All
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/blog?category=${cat}`}
                    className={`rounded-full px-4 py-2 text-sm ${category === cat ? "bg-gray-900 text-white" : "bg-white text-gray-600"}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Popular</h2>
              <div className="mt-4 space-y-4">
                {popular.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block text-sm text-gray-700 hover:text-gray-900">
                    <div className="font-semibold text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.view_count ?? 0} views</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900">Latest</h2>
              <div className="mt-4 space-y-4">
                {latest.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block text-sm text-gray-700 hover:text-gray-900">
                    <div className="font-semibold text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-500">{post.published_at ?? post.created_at}</div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
