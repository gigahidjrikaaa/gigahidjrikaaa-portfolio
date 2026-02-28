"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Eye, UploadCloud, FileText, Download } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { adminApi, BlogPostBase, BlogPostResponse, ScrapeResult } from "@/services/api";
import BlogPostForm from "@/components/admin/BlogPostForm";
import ImportPlatformModal from "@/components/admin/ImportPlatformModal";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Posts",
  subtitle: "Create, edit, and publish your articles with complete control.",
  add: "New Post",
  searchPlaceholder: "Search by title, slug, or tag",
  empty: "No blog posts yet. Create the first one to get started.",
  confirmDelete: "Are you sure you want to delete this post?",
  status: {
    all: "All",
    draft: "Drafts",
    comingSoon: "Coming Soon",
    published: "Published",
  },
  quick: {
    publish: "Publish",
    unpublish: "Move to Draft",
  },
};

const statusLabelMap: Record<string, string> = {
  draft: "Draft",
  coming_soon: "Coming Soon",
  published: "Published",
};

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700";
    case "coming_soon":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const BlogPostsManagement = () => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selected, setSelected] = useState<BlogPostResponse | null>(null);
  const [importedData, setImportedData] = useState<ScrapeResult["data"] | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const data = await adminApi.getBlogPosts();
      setPosts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts().catch((error) => console.error("Failed to fetch blog posts", error));
  }, []);

  const categories = useMemo(() => {
    const values = posts
      .map((post) => post.category)
      .filter((value): value is string => Boolean(value && value.trim()))
      .map((value) => value.trim());
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const stats = useMemo(() => {
    const draft = posts.filter((post) => post.status === "draft").length;
    const comingSoon = posts.filter((post) => post.status === "coming_soon").length;
    const published = posts.filter((post) => post.status === "published").length;
    return { draft, comingSoon, published, total: posts.length };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const statusMatch = statusFilter === "all" || post.status === statusFilter;
      const categoryMatch =
        categoryFilter === "all" || (post.category || "").toLowerCase() === categoryFilter.toLowerCase();
      const searchTarget = `${post.title} ${post.slug} ${post.tags ?? ""}`.toLowerCase();
      const searchMatch = searchTarget.includes(query.toLowerCase());
      return statusMatch && categoryMatch && searchMatch;
    });
  }, [posts, statusFilter, categoryFilter, query]);

  const toastForSave = (
    action: "created" | "updated",
    payload: BlogPostBase,
  ) => {
    const title = payload.title || "Post";
    if (payload.status === "published") {
      if (payload.is_external) {
        toast({
          title: action === "created" ? "External article added" : "External article updated",
          description: `\u201c${title}\u201d is published \u2014 clicking the card will open the original ${payload.external_source ?? "article"}.`,
          variant: "success",
        });
      } else {
        toast({
          title: action === "created" ? "Published \u2713" : "Published \u2713",
          description: `\u201c${title}\u201d is now live on your blog.`,
          variant: "success",
        });
      }
    } else if (payload.status === "coming_soon") {
      toast({
        title: "Scheduled \u2014 Coming Soon",
        description: `\u201c${title}\u201d is queued and will show as \u201cComing Soon\u201d to visitors.`,
        variant: "success",
      });
    } else {
      // draft
      toast({
        title: action === "created" ? "Draft saved" : "Draft updated",
        description: `\u201c${title}\u201d has been saved as a draft. Publish it when you\u2019re ready.`,
        variant: "success",
      });
    }
  };

  const handleSave = async (payload: BlogPostBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateBlogPost(selected.id, payload);
        setPosts((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
        toastForSave("updated", payload);
      } else {
        const created = await adminApi.createBlogPost(payload);
        setPosts((prev) => [created, ...prev]);
        toastForSave("created", payload);
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save blog post", error);
      const message = error instanceof Error ? error.message : undefined;
      toast({
        title: "Unable to save post",
        description: message && !message.startsWith("API Error") ? message : "Please review the fields and try again.",
        variant: "error",
      });
      // Re-throw so the form's isSubmitting resets and the button re-enables
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteBlogPost(id);
      setPosts((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Post deleted",
        description: "The blog post has been removed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete blog post", error);
      toast({
        title: "Unable to delete post",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  const handleStatusChange = async (post: BlogPostResponse, status: "draft" | "published") => {
    try {
      const updated = await adminApi.updateBlogPost(post.id, { status });
      setPosts((prev) => prev.map((item) => (item.id === post.id ? updated : item)));
      toast({
        title: status === "published" ? "Post published" : "Post moved to draft",
        description: status === "published" ? "Your post is now live." : "Post is saved as a draft.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to update status", error);
      toast({
        title: "Unable to update status",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{copy.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{copy.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Download className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button
            onClick={() => {
              setSelected(null);
              setImportedData(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {copy.add}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Coming Soon</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.comingSoon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.published}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Filters</CardTitle>
          <div className="flex flex-wrap gap-3">
            {[
              { label: copy.status.all, value: "all" },
              { label: copy.status.draft, value: "draft" },
              { label: copy.status.comingSoon, value: "coming_soon" },
              { label: copy.status.published, value: "published" },
            ].map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={statusFilter === item.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full md:max-w-xs"
            />
            <select
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingAnimation label="Loading posts…" size="sm" />
          ) : filteredPosts.length === 0 ? (
            <p className="text-center text-slate-500">{copy.empty}</p>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900">{post.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(post.status)}`}>
                        {statusLabelMap[post.status] ?? post.status}
                      </span>
                      {post.is_featured ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">/{post.slug}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {post.category ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                          {post.category}
                        </span>
                      ) : null}
                      {post.reading_time_minutes ? <span>{post.reading_time_minutes} min read</span> : null}
                      {post.view_count ? <span>{post.view_count} views</span> : null}
                      {post.like_count ? <span>{post.like_count} likes</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {post.status !== "published" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(post, "published")}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {copy.quick.publish}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(post, "draft")}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {copy.quick.unpublish}
                      </Button>
                    )}
                    {post.status === "published" ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" /> Preview
                      </Link>
                    ) : null}
                    <Tooltip content="Edit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(post);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isImportModalOpen && (
        <ImportPlatformModal
          onImport={(_platform, data) => {
            setSelected(null);
            setImportedData(data);
            setIsImportModalOpen(false);
            setIsModalOpen(true);
          }}
          onClose={() => setIsImportModalOpen(false)}
        />
      )}

      {isModalOpen ? (
        <BlogPostForm
          post={selected}
          importedData={importedData}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelected(null);
            setImportedData(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default BlogPostsManagement;
