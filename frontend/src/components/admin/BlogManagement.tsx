"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { adminApi, BlogPostBase, BlogPostResponse } from "@/services/api";
import BlogPostForm from "./BlogPostForm";

const copy = {
  title: "Blog",
  empty: "No blog posts found. Add one to get started!",
  add: "Add Post",
  confirmDelete: "Are you sure you want to delete this post?",
};

const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPostResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<BlogPostResponse | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    const data = await adminApi.getBlogPosts();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts().catch((error) => console.error("Failed to fetch blog posts", error));
  }, []);

  const handleSave = async (payload: BlogPostBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateBlogPost(selected.id, payload);
        setPosts((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
        toast({
          title: "Post updated",
          description: "Blog post saved successfully.",
          variant: "success",
        });
      } else {
        const created = await adminApi.createBlogPost(payload);
        setPosts((prev) => [...prev, created]);
        toast({
          title: "Post added",
          description: "New blog post created.",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save blog post", error);
      toast({
        title: "Unable to save post",
        description: "Please review the fields and try again.",
        variant: "error",
      });
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

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{copy.title}</CardTitle>
        <Button
          onClick={() => {
            setSelected(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {copy.add}
        </Button>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{post.title}</h3>
                  <p className="text-sm text-gray-500">{post.slug} • {post.status}</p>
                </div>
                <div className="flex items-center gap-2">
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
      {isModalOpen ? (
        <BlogPostForm
          post={selected}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelected(null);
          }}
        />
      ) : null}
    </Card>
  );
};

export default BlogManagement;
