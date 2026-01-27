"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { adminApi, BlogPostResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Organization",
  subtitle: "Manage categories and tags across your blog posts.",
  categoryHelp: "Categories help group posts into higher-level themes.",
  tagHelp: "Tags add granular topics for filtering and discovery.",
  rename: "Rename",
  save: "Save",
  cancel: "Cancel",
  empty: "No categories yet. Add a category when editing a post.",
  emptyTags: "No tags yet. Add tags in any post editor.",
  updateSuccess: "Organization updated",
  updateDescription: "Posts have been updated with your new taxonomy.",
  updateError: "Unable to update taxonomy. Please try again.",
};

const normalize = (value: string) => value.trim().toLowerCase();

const BlogOrganizationManager = () => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [categoryValue, setCategoryValue] = useState("");
  const [tagValue, setTagValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    adminApi
      .getBlogPosts()
      .then(setPosts)
      .catch((error) => console.error("Failed to fetch blog posts", error))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      if (!post.category) return;
      const key = post.category.trim();
      if (!key) return;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [posts]);

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((post) => {
      const raw = post.tags || "";
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .forEach((tag) => {
          map.set(tag, (map.get(tag) ?? 0) + 1);
        });
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [posts]);

  const closeCategoryEdit = () => {
    setActiveCategory(null);
    setCategoryValue("");
  };

  const closeTagEdit = () => {
    setActiveTag(null);
    setTagValue("");
  };

  const handleCategoryRename = async () => {
    if (!activeCategory) return;
    const newValue = categoryValue.trim();
    if (!newValue) return;

    try {
      const updatedPosts: BlogPostResponse[] = [];
      for (const post of posts) {
        if ((post.category || "").trim().toLowerCase() !== normalize(activeCategory)) {
          updatedPosts.push(post);
          continue;
        }
        const updated = await adminApi.updateBlogPost(post.id, { category: newValue });
        updatedPosts.push(updated);
      }
      setPosts(updatedPosts);
      toast({
        title: copy.updateSuccess,
        description: copy.updateDescription,
        variant: "success",
      });
      closeCategoryEdit();
    } catch (error) {
      console.error("Failed to rename category", error);
      toast({
        title: copy.updateError,
        description: "Category rename failed.",
        variant: "error",
      });
    }
  };

  const handleTagRename = async () => {
    if (!activeTag) return;
    const newValue = tagValue.trim();
    if (!newValue) return;

    try {
      const updatedPosts: BlogPostResponse[] = [];
      for (const post of posts) {
        const tagList = (post.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

        if (!tagList.some((tag) => normalize(tag) === normalize(activeTag))) {
          updatedPosts.push(post);
          continue;
        }

        const nextTags = tagList.map((tag) =>
          normalize(tag) === normalize(activeTag) ? newValue : tag
        );
        const updated = await adminApi.updateBlogPost(post.id, { tags: nextTags.join(", ") });
        updatedPosts.push(updated);
      }
      setPosts(updatedPosts);
      toast({
        title: copy.updateSuccess,
        description: copy.updateDescription,
        variant: "success",
      });
      closeTagEdit();
    } catch (error) {
      console.error("Failed to rename tag", error);
      toast({
        title: copy.updateError,
        description: "Tag rename failed.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">{copy.title}</h2>
        <p className="mt-2 text-sm text-slate-500">{copy.subtitle}</p>
      </div>

      {loading ? (
        <LoadingAnimation label="Loading taxonomy…" size="sm" />
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <p className="text-sm text-slate-500">{copy.categoryHelp}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">{copy.empty}</p>
            ) : (
              categories.map(([category, count]) => (
                <div key={category} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{category}</p>
                    <p className="text-xs text-slate-500">{count} posts</p>
                  </div>
                  {activeCategory === category ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={categoryValue}
                        onChange={(event) => setCategoryValue(event.target.value)}
                        className="h-9"
                      />
                      <Button size="sm" onClick={handleCategoryRename}>{copy.save}</Button>
                      <Button size="sm" variant="outline" onClick={closeCategoryEdit}>{copy.cancel}</Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveCategory(category);
                        setCategoryValue(category);
                      }}
                    >
                      {copy.rename}
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <p className="text-sm text-slate-500">{copy.tagHelp}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {tags.length === 0 ? (
              <p className="text-sm text-slate-500">{copy.emptyTags}</p>
            ) : (
              tags.map(([tag, count]) => (
                <div key={tag} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{tag}</p>
                    <p className="text-xs text-slate-500">{count} posts</p>
                  </div>
                  {activeTag === tag ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        value={tagValue}
                        onChange={(event) => setTagValue(event.target.value)}
                        className="h-9"
                      />
                      <Button size="sm" onClick={handleTagRename}>{copy.save}</Button>
                      <Button size="sm" variant="outline" onClick={closeTagEdit}>{copy.cancel}</Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveTag(tag);
                        setTagValue(tag);
                      }}
                    >
                      {copy.rename}
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
};

export default BlogOrganizationManager;
