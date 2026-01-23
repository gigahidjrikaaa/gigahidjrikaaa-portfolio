"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";
import { adminApi, BlogPostBase, BlogPostResponse } from "@/services/api";

const copy = {
  addTitle: "Add Blog Post",
  editTitle: "Edit Blog Post",
  fields: {
    title: "Title",
    slug: "Slug",
    excerpt: "Excerpt",
    content: "Content",
    coverImage: "Cover Image",
    coverImageHint: "Upload a wide image (1200x630 recommended) or paste a URL.",
    status: "Status",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Post",
    upload: "Upload",
    uploading: "Uploading...",
  },
  validation: {
    titleRequired: "Title is required.",
    slugRequired: "Slug is required.",
    slugFormat: "Use lowercase letters, numbers, and dashes only.",
    contentRequired: "Content is required to publish a post.",
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

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blogPostSchema = z
  .object({
    title: z.string().min(1, copy.validation.titleRequired),
    slug: z
      .string()
      .min(1, copy.validation.slugRequired)
      .regex(slugRegex, copy.validation.slugFormat),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    cover_image_url: z.string().url().optional().or(z.literal("")),
    status: z.enum(["draft", "coming_soon", "published"]),
  })
  .refine(
    (data) => {
      if (data.status !== "published") return true;
      const text = (data.content || "").replace(/<[^>]*>/g, "").trim();
      return text.length > 0;
    },
    { path: ["content"], message: copy.validation.contentRequired }
  );

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, onSave, onCancel }) => {
  const { toast } = useToast();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostBase>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image_url: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (post) {
      reset({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        cover_image_url: post.cover_image_url || "",
        status: post.status || "draft",
      });
    }
  }, [post, reset]);

  const coverImageUrl = watch("cover_image_url");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      ImageExtension,
      Placeholder.configure({
        placeholder: "Write your post here...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setValue("content", editor.getHTML(), { shouldValidate: true });
    },
  });

  const handleCoverUpload = async (file: File) => {
    try {
      setIsUploadingCover(true);
      const uploaded = await adminApi.uploadMediaAsset(file, {
        title: file.name,
        folder: "blog",
      });
      setValue("cover_image_url", uploaded.url, { shouldValidate: true });
      toast({ title: "Cover image uploaded", description: "Image ready for the post." });
    } catch (error) {
      console.error("Failed to upload cover image", error);
      toast({
        title: "Upload failed",
        description: "Could not upload the cover image. Please try again.",
        variant: "error",
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleInlineImageUpload = async (file: File) => {
    try {
      setIsUploadingInline(true);
      const uploaded = await adminApi.uploadMediaAsset(file, {
        title: file.name,
        folder: "blog",
      });
      editor?.chain().focus().setImage({ src: uploaded.url }).run();
    } catch (error) {
      console.error("Failed to upload inline image", error);
      toast({
        title: "Inline upload failed",
        description: "Could not insert image into the editor.",
        variant: "error",
      });
    } finally {
      setIsUploadingInline(false);
    }
  };

  const onSubmit = (data: BlogPostBase) => {
    onSave({
      ...data,
      excerpt: data.excerpt || undefined,
      content: data.content || undefined,
      cover_image_url: data.cover_image_url || undefined,
    });
  };

  useEffect(() => {
    if (!editor) return;
    const content = post?.content || "";
    editor.commands.setContent(content, false);
  }, [editor, post?.content]);

  return (
    <AdminModal
      title={post ? copy.editTitle : copy.addTitle}
      description="Write a full post with rich text, upload images, and prepare a cover image for previews."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">{copy.fields.title}</Label>
            <Input id="title" {...register("title")} required className="mt-1" />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="slug" className="text-gray-700">{copy.fields.slug}</Label>
            <Input id="slug" {...register("slug")} required className="mt-1" />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
            <p className="mt-1 text-xs text-gray-500">Use kebab-case, e.g. <span className="font-medium">my-new-post</span>.</p>
          </div>
          <div>
            <Label htmlFor="excerpt" className="text-gray-700">{copy.fields.excerpt}</Label>
            <Textarea id="excerpt" {...register("excerpt")} rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cover_image_url" className="text-gray-700">{copy.fields.coverImage}</Label>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="cover_image_url"
                  placeholder="https://..."
                  {...register("cover_image_url")}
                  className="flex-1"
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCoverUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  {isUploadingCover ? copy.actions.uploading : copy.actions.upload}
                </Button>
              </div>
              <p className="text-xs text-gray-500">{copy.fields.coverImageHint}</p>
            </div>
            {coverImageUrl ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={coverImageUrl}
                  alt="Cover preview"
                  width={120}
                  height={70}
                  unoptimized
                  className="h-16 w-28 rounded-md object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Cover preview</p>
                  <p className="text-xs text-gray-500">Wide images look best.</p>
                </div>
              </div>
            ) : null}
            {errors.cover_image_url && (
              <p className="mt-1 text-xs text-red-600">{errors.cover_image_url.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="content" className="text-gray-700">{copy.fields.content}</Label>
            <input type="hidden" {...register("content")} />
            <input
              ref={inlineImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleInlineImageUpload(file);
              }}
            />
            <div className="mt-2 rounded-lg border border-gray-200 bg-white">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 px-3 py-2">
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  Bold
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  Italic
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                  Underline
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  H2
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                  H3
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  Bullets
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                  Numbered
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                  Quote
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => inlineImageInputRef.current?.click()}
                >
                  Image
                </button>
              </div>
              <div className="min-h-[220px] px-3 py-2">
                <EditorContent editor={editor} />
              </div>
            </div>
            {isUploadingInline ? (
              <p className="mt-2 text-xs text-gray-500">Uploading image...</p>
            ) : null}
            {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
          </div>
          <div>
            <Label htmlFor="status" className="text-gray-700">{copy.fields.status}</Label>
            <select
              id="status"
              {...register("status")}
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
    </AdminModal>
  );
};

export default BlogPostForm;
