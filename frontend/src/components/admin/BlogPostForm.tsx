"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlogPostBase, BlogPostResponse } from "@/services/api";

const copy = {
  addTitle: "Add Blog Post",
  editTitle: "Edit Blog Post",
  fields: {
    title: "Title",
    slug: "Slug",
    excerpt: "Excerpt",
    coverImage: "Cover Image URL",
    status: "Status",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Post",
  },
  statusOptions: [
    { value: "draft", label: "Draft" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "published", label: "Published" },
  ],
};

interface BlogPostFormProps {
  post?: BlogPostResponse | null;
  onSave: (post: BlogPostBase) => void;
  onCancel: () => void;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState<BlogPostBase>({
    title: "",
    slug: "",
    excerpt: "",
    cover_image_url: "",
    status: "draft",
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        cover_image_url: post.cover_image_url || "",
        status: post.status || "draft",
      });
    }
  }, [post]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {post ? copy.editTitle : copy.addTitle}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">{copy.fields.title}</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="slug" className="text-gray-700">{copy.fields.slug}</Label>
            <Input id="slug" value={formData.slug} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="excerpt" className="text-gray-700">{copy.fields.excerpt}</Label>
            <Textarea id="excerpt" value={formData.excerpt || ""} onChange={handleChange} rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cover_image_url" className="text-gray-700">{copy.fields.coverImage}</Label>
            <Input id="cover_image_url" value={formData.cover_image_url || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="status" className="text-gray-700">{copy.fields.status}</Label>
            <select
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none"
            >
              {copy.statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button type="submit">{copy.actions.save}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogPostForm;
