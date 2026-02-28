"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";
import { adminApi, BlogPostBase, BlogPostResponse, ScrapeResult } from "@/services/api";
import ImportFromUrl from "@/components/admin/ImportFromUrl";
import { openGoogleDrivePicker } from "@/lib/googleDrivePicker";
import { openMediaLibrary } from "@/lib/cloudinaryWidget";
import Tooltip from "@/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { ExternalLink, Loader2 } from "lucide-react";

const copy = {
  addTitle: "Add Blog Post",
  editTitle: "Edit Blog Post",
  fields: {
    title: "Title",
    slug: "Slug",
    excerpt: "Excerpt",
    content: "Content",
    category: "Category",
    tags: "Tags",
    coverImage: "Cover Image",
    coverImageHint: "Upload a wide image (1200x630 recommended) or paste a URL.",
    ogImage: "Open Graph Image",
    seoTitle: "SEO Title",
    seoDescription: "SEO Description",
    seoKeywords: "SEO Keywords",
    featured: "Feature this post",
    status: "Status",
    isExternal: "External Article",
    externalUrl: "External URL",
    externalSource: "External Source",
    metrics: "Post Metrics",
    readingTime: "Reading time (auto)",
    views: "Views",
    likes: "Likes",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Post",
    upload: "Upload",
    uploading: "Uploading...",
  },
  hints: {
    title: "Use a clear, benefit-driven headline with your main keyword.",
    slug: "Short, lowercase, and descriptive (auto-generated from title).",
    excerpt: "1–2 sentences that summarize the value of the post.",
    category: "Choose 1–3 high-level themes for discovery.",
    tags: "Add 3–6 specific keywords. Use ; to separate tags.",
    coverImage: "1200×630 works best for cards and social previews.",
    ogImage: "If empty, the cover image will be used for sharing.",
    content: "Use headings, bullets, and short paragraphs for readability.",
    seoTitle: "Aim for 50–60 characters with the primary keyword.",
    seoDescription: "150–160 characters, include a clear benefit or CTA.",
    seoKeywords: "Optional. Use 3–6 keywords separated by ;.",
    featured: "Highlight a flagship post on the blog landing page.",
    status: "Drafts are private. Published posts show on the site.",
  },
  preview: {
    title: "Live preview",
    subtitle: "See how the post will look on the public blog page.",
    contentPlaceholder: "Start writing to see the content preview.",
    excerptPlaceholder: "Add an excerpt to preview the summary.",
    titlePlaceholder: "Untitled article",
  },
  validation: {
    titleRequired: "Title is required.",
    slugRequired: "Slug is required.",
    slugFormat: "Use lowercase letters, numbers, and dashes only.",
    contentRequired: "Content is required to publish a post.",
    seoTitleMax: "SEO title should be 60 characters or fewer.",
    seoDescriptionMax: "SEO description should be 160 characters or fewer.",
  },
  statusOptions: [
    { value: "draft", label: "Draft" },
    { value: "coming_soon", label: "Coming Soon" },
    { value: "published", label: "Published" },
  ],
};

const FieldLabel = ({
  htmlFor,
  label,
  tooltip,
}: {
  htmlFor: string;
  label: string;
  tooltip?: string;
}) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={htmlFor} className="text-gray-700">
      {label}
    </Label>
    {tooltip ? (
      <Tooltip content={tooltip}>
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          aria-label={`${label} help`}
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
      </Tooltip>
    ) : null}
  </div>
);

interface BlogPostFormProps {
  post?: BlogPostResponse | null;
  /** Pre-filled data from an external import (e.g. ImportPlatformModal). Applied once on mount when `post` is null. */
  importedData?: ScrapeResult["data"] | null;
  onSave: (post: BlogPostBase) => Promise<void>;
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
    category: z.string().optional(),
    tags: z.string().optional(),
    cover_image_url: z.string().url().optional().or(z.literal("")),
    og_image_url: z.string().url().optional().or(z.literal("")),
    seo_title: z.string().max(60, copy.validation.seoTitleMax).optional(),
    seo_description: z.string().max(160, copy.validation.seoDescriptionMax).optional(),
    seo_keywords: z.string().optional(),
    reading_time_minutes: z.number().optional(),
    view_count: z.number().optional(),
    like_count: z.number().optional(),
    is_featured: z.boolean().optional(),
    status: z.enum(["draft", "coming_soon", "published"]),
    is_external: z.boolean().optional(),
    external_url: z.string().url().optional().or(z.literal("")),
    external_source: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status !== "published") return true;
      if (data.is_external) return !!data.external_url;
      return true;
    },
    { path: ["external_url"], message: "External URL is required to publish an external post." }
  )
  .refine(
    (data) => {
      if (data.status !== "published") return true;
      if (data.is_external) return true;
      const text = (data.content || "").replace(/<[^>]*>/g, "").trim();
      return text.length > 0;
    },
    { path: ["content"], message: copy.validation.contentRequired }
  );

const BlogPostForm: React.FC<BlogPostFormProps> = ({ post, importedData, onSave, onCancel }) => {
  const { toast } = useToast();
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [autosaveId, setAutosaveId] = useState<number | null>(post?.id ?? null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCreatingDraftRef = useRef(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostBase>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      cover_image_url: "",
      og_image_url: "",
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      reading_time_minutes: undefined,
      view_count: 0,
      like_count: 0,
      is_featured: false,
      status: "draft",
      is_external: false,
      external_url: "",
      external_source: "",
    },
  });

  // Apply data from an external import (only for new posts, not edits)
  useEffect(() => {
    if (!importedData || post) return;
    const d = importedData;
    if (d.title)           setValue("title",           d.title           as string, { shouldValidate: true });
    if (d.slug)            setValue("slug",            d.slug            as string, { shouldValidate: true, shouldDirty: true });
    if (d.excerpt)         setValue("excerpt",         d.excerpt         as string, { shouldValidate: true });
    if (d.category)        setValue("category",        d.category        as string, { shouldValidate: true });
    if (d.tags) {
      const tags = Array.isArray(d.tags) ? (d.tags as string[]).join("; ") : (d.tags as string);
      setValue("tags", tags, { shouldValidate: true });
    }
    if (d.cover_image_url) setValue("cover_image_url", d.cover_image_url as string, { shouldValidate: true });
    if (d.is_external)     setValue("is_external",     true,                         { shouldValidate: true });
    if (d.external_url)    setValue("external_url",    d.external_url    as string, { shouldValidate: true });
    if (d.external_source) setValue("external_source", d.external_source as string, { shouldValidate: true });
    setIsSlugEdited(true); // prevent auto-slug from overwriting the imported slug
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedData]);

  useEffect(() => {
    if (post) {
      reset({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "",
        tags: post.tags || "",
        cover_image_url: post.cover_image_url || "",
        og_image_url: post.og_image_url || "",
        seo_title: post.seo_title || "",
        seo_description: post.seo_description || "",
        seo_keywords: post.seo_keywords || "",
        reading_time_minutes: post.reading_time_minutes || undefined,
        view_count: post.view_count ?? 0,
        like_count: post.like_count ?? 0,
        is_featured: post.is_featured ?? false,
        status: post.status || "draft",
        is_external: post.is_external ?? false,
        external_url: post.external_url || "",
        external_source: post.external_source || "",
      });
      setIsSlugEdited(true);
      setAutosaveId(post.id);
    } else {
      setIsSlugEdited(false);
      setAutosaveId(null);
    }
  }, [post, reset]);

  const coverImageUrl = watch("cover_image_url");
  const ogImageUrl = watch("og_image_url");
  const categoryValue = watch("category") || "";
  const tagsValue = watch("tags") || "";
  const slugValue = watch("slug") || "";
  const excerptValue = watch("excerpt") || "";
  const statusValue = watch("status");
  const seoTitleValue = watch("seo_title") || "";
  const seoDescriptionValue = watch("seo_description") || "";
  const seoKeywordsValue = watch("seo_keywords") || "";
  const isFeaturedValue = !!watch("is_featured");
  const previewTitle = watch("title") || copy.preview.titlePlaceholder;
  const previewExcerpt = watch("excerpt");
  const previewCategories = (watch("category") || "")
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const previewTags = (watch("tags") || "")
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
  const previewContent = watch("content") || "";
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const canOpenCloudinaryLibrary = Boolean(cloudName && cloudApiKey);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
  const canOpenGoogleDrive = Boolean(googleClientId && googleApiKey);
  const titleValue = watch("title");
  const isExternalValue = watch("is_external") || false;
  const externalUrlValue = watch("external_url") || undefined;
  const externalSourceValue = watch("external_source") || undefined;

  const draftKey = useMemo(() => {
    if (post?.id) return `blog-draft-${post.id}`;
    return "blog-draft-new";
  }, [post?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (post) return;
    const raw = window.localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { payload?: BlogPostBase };
      if (!parsed.payload) return;
      const hasExistingInput = Boolean(titleValue || slugValue || previewContent);
      if (hasExistingInput) return;
      reset({
        title: parsed.payload.title || "",
        slug: parsed.payload.slug || "",
        excerpt: parsed.payload.excerpt || "",
        content: parsed.payload.content || "",
        category: parsed.payload.category || "",
        tags: parsed.payload.tags || "",
        cover_image_url: parsed.payload.cover_image_url || "",
        og_image_url: parsed.payload.og_image_url || "",
        seo_title: parsed.payload.seo_title || "",
        seo_description: parsed.payload.seo_description || "",
        seo_keywords: parsed.payload.seo_keywords || "",
        is_featured: parsed.payload.is_featured ?? false,
        status: parsed.payload.status || "draft",
        reading_time_minutes: parsed.payload.reading_time_minutes || undefined,
        view_count: parsed.payload.view_count ?? 0,
        like_count: parsed.payload.like_count ?? 0,
        is_external: parsed.payload.is_external ?? false,
        external_url: parsed.payload.external_url || "",
        external_source: parsed.payload.external_source || "",
      });
    } catch (error) {
      console.error("Failed to restore draft", error);
    }
  }, [draftKey, post, reset, slugValue, titleValue, previewContent]);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      // normalise unicode dashes (em-dash, en-dash, etc.) to a regular hyphen
      .replace(/[\u2012-\u2015\u2212\u2E3A\u2E3B\uFE58\uFE63\uFF0D]/g, "-")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, ""); // strip leading/trailing dashes

  const parseDelimited = (value: string) =>
    value
      .split(/[;,]/)
      .map((item) => item.trim())
      .filter(Boolean);

  const currentTags = useMemo(() => parseDelimited(tagsValue), [tagsValue]);
  const currentCategories = useMemo(() => parseDelimited(categoryValue), [categoryValue]);

  const updateTags = (nextTags: string[]) => {
    setValue("tags", nextTags.join("; "), { shouldValidate: true, shouldDirty: true });
  };

  const updateCategories = (nextCategories: string[]) => {
    setValue("category", nextCategories.join("; "), { shouldValidate: true, shouldDirty: true });
  };

  const handleAddTag = (tag: string) => {
    if (currentTags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
    updateTags([...currentTags, tag]);
  };

  const handleRemoveTag = (tag: string) => {
    updateTags(currentTags.filter((item) => item.toLowerCase() !== tag.toLowerCase()));
  };

  const handleAddCategory = (value: string) => {
    if (currentCategories.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    updateCategories([...currentCategories, value]);
  };

  const handleRemoveCategory = (value: string) => {
    updateCategories(currentCategories.filter((item) => item.toLowerCase() !== value.toLowerCase()));
  };

  useEffect(() => {
    if (!titleValue || isSlugEdited) return;
    setValue("slug", slugify(titleValue), { shouldValidate: true });
  }, [titleValue, isSlugEdited, setValue]);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .getBlogPosts()
      .then((posts) => {
        if (cancelled) return;
        const categories = Array.from(
          new Set(
            posts
              .flatMap((item) => (item.category || "").split(/[;,]/))
              .map((item) => item.trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        const tags = Array.from(
          new Set(
            posts
              .flatMap((item) => (item.tags || "").split(/[;,]/))
              .map((item) => item.trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setCategorySuggestions(categories);
        setTagSuggestions(tags);
      })
      .catch((error) => console.error("Failed to fetch blog taxonomy", error));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: BlogPostBase = {
      title: titleValue || "",
      slug: slugValue || "",
      excerpt: excerptValue || undefined,
      content: previewContent || undefined,
      category: categoryValue || undefined,
      tags: tagsValue || undefined,
      cover_image_url: coverImageUrl || undefined,
      og_image_url: ogImageUrl || undefined,
      seo_title: seoTitleValue || undefined,
      seo_description: seoDescriptionValue || undefined,
      seo_keywords: seoKeywordsValue || undefined,
      reading_time_minutes: undefined,
      view_count: undefined,
      like_count: undefined,
      is_featured: isFeaturedValue,
      status: statusValue || "draft",
      is_external: isExternalValue,
      external_url: externalUrlValue,
      external_source: externalSourceValue,
    };

    const hasAnyInput = Boolean(
      payload.title ||
        payload.slug ||
        payload.excerpt ||
        payload.content ||
        payload.category ||
        payload.tags ||
        payload.cover_image_url ||
        payload.og_image_url ||
        payload.seo_title ||
        payload.seo_description ||
        payload.seo_keywords ||
        payload.external_url
    );

    if (!hasAnyInput) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ payload, savedAt: new Date().toISOString() })
        );
      } catch (error) {
        console.error("Failed to write draft locally", error);
      }

      if (autosaveId) {
        setAutosaveStatus("saving");
        try {
          await adminApi.updateBlogPost(autosaveId, {
            title: payload.title,
            slug: payload.slug,
            excerpt: payload.excerpt,
            content: payload.content,
            category: payload.category,
            tags: payload.tags,
            cover_image_url: payload.cover_image_url,
            og_image_url: payload.og_image_url,
            seo_title: payload.seo_title,
            seo_description: payload.seo_description,
            seo_keywords: payload.seo_keywords,
            is_featured: payload.is_featured,
          });
          setAutosaveStatus("saved");
          return;
        } catch (error) {
          console.error("Failed to autosave post", error);
          setAutosaveStatus("error");
          return;
        }
      }

      if (isCreatingDraftRef.current) return;
      if (!payload.title || !payload.slug) return;

      isCreatingDraftRef.current = true;
      setAutosaveStatus("saving");
      try {
        const created = await adminApi.createBlogPost({
          ...payload,
          status: "draft",
        });
        setAutosaveId(created.id);
        setAutosaveStatus("saved");
      } catch (error) {
        console.error("Failed to create autosave draft", error);
        setAutosaveStatus("error");
      } finally {
        isCreatingDraftRef.current = false;
      }
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [
    titleValue,
    slugValue,
    excerptValue,
    previewContent,
    categoryValue,
    tagsValue,
    coverImageUrl,
    ogImageUrl,
    seoTitleValue,
    seoDescriptionValue,
    seoKeywordsValue,
    isFeaturedValue,
    statusValue,
    isExternalValue,
    externalUrlValue,
    externalSourceValue,
    autosaveId,
    draftKey,
  ]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      HorizontalRule,
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

  const openGooglePicker = (onSelect: (url: string) => void) => {
    if (!canOpenGoogleDrive) {
      toast({
        title: "Google Drive not connected",
        description: "Set NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.",
        variant: "error",
      });
      return;
    }
    void openGoogleDrivePicker({
      clientId: googleClientId,
      apiKey: googleApiKey,
      onPick: onSelect,
      onError: (message) =>
        toast({
          title: "Google Drive error",
          description: message,
          variant: "error",
        }),
    });
  };

  const openCloudinaryPicker = async (onSelect: (url: string) => void) => {
    if (!canOpenCloudinaryLibrary) {
      toast({
        title: "Cloudinary not connected",
        description: "Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY.",
        variant: "error",
      });
      return;
    }
    await openMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: cloudApiKey,
        multiple: false,
      },
      (assets) => {
        const asset = assets?.[0];
        if (asset?.secure_url || asset?.url) {
          onSelect(asset.secure_url || asset.url || "");
        }
      }
    );
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

  const onSubmit = async (data: BlogPostBase) => {
    await onSave({
      ...data,
      excerpt: data.excerpt || undefined,
      content: data.content || undefined,
      category: data.category || undefined,
      tags: data.tags || undefined,
      cover_image_url: data.cover_image_url || undefined,
      og_image_url: data.og_image_url || undefined,
      seo_title: data.seo_title || undefined,
      seo_description: data.seo_description || undefined,
      seo_keywords: data.seo_keywords || undefined,
      is_featured: data.is_featured ?? false,
      is_external: data.is_external ?? false,
      external_url: data.external_url || undefined,
      external_source: data.external_source || undefined,
    });
  };

  useEffect(() => {
    if (!editor) return;
    const content = post?.content || "";
    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, post?.content]);

  return (
    <AdminModal
      title={post ? copy.editTitle : copy.addTitle}
      description="Write a full post with rich text, upload images, and prepare a cover image for previews."
      onClose={onCancel}
      maxWidthClass="max-w-7xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <div className="space-y-4">
          <ImportFromUrl
            contentType="blog_article"
            onImport={(d) => {
              if (d.title) setValue("title", d.title as string, { shouldValidate: true });
              if (d.slug) setValue("slug", d.slug as string, { shouldValidate: true });
              if (d.excerpt) setValue("excerpt", d.excerpt as string, { shouldValidate: true });
              if (d.category) setValue("category", d.category as string, { shouldValidate: true });
              if (d.tags && Array.isArray(d.tags)) setValue("tags", (d.tags as string[]).join("; "), { shouldValidate: true });
              if (d.cover_image_url) setValue("cover_image_url", d.cover_image_url as string, { shouldValidate: true });
              if (d.is_external) setValue("is_external", true, { shouldValidate: true });
              if (d.external_url) setValue("external_url", d.external_url as string, { shouldValidate: true });
              if (d.external_source) setValue("external_source", d.external_source as string, { shouldValidate: true });
            }}
            className="mb-2"
          />
          <div>
            <FieldLabel htmlFor="title" label={`${copy.fields.title} *`} tooltip={copy.hints.title} />
            <Input id="title" {...register("title")} required className="mt-1" placeholder="e.g., Designing Trust in Web3" />
            <p className="mt-1 text-xs text-gray-500">{copy.hints.title}</p>
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <FieldLabel htmlFor="slug" label={`${copy.fields.slug} *`} tooltip={copy.hints.slug} />
            <Input
              id="slug"
              {...register("slug", {
                onChange: () => setIsSlugEdited(true),
              })}
              required
              className="mt-1"
              placeholder="e.g., designing-trust-web3"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
            <p className="mt-1 text-xs text-gray-500">{copy.hints.slug}</p>
          </div>
          <div>
            <FieldLabel htmlFor="excerpt" label={copy.fields.excerpt} tooltip={copy.hints.excerpt} />
            <Textarea id="excerpt" {...register("excerpt")} rows={4} className="mt-1" placeholder="Short summary shown on cards" />
            <p className="mt-1 text-xs text-gray-500">{copy.hints.excerpt}</p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{copy.fields.featured}</p>
              <p className="text-xs text-gray-500">{copy.hints.featured}</p>
            </div>
            <Switch
              checked={!!watch("is_featured")}
              onCheckedChange={(value) => setValue("is_featured", value, { shouldValidate: true })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{copy.fields.isExternal}</p>
              <p className="text-xs text-gray-500">Link to an article published elsewhere (e.g., Medium, LinkedIn).</p>
            </div>
            <Switch
              checked={!!watch("is_external")}
              onCheckedChange={(value) => setValue("is_external", value, { shouldValidate: true })}
            />
          </div>
          {watch("is_external") && (
            <>
              {/* Info banner: explain redirect behaviour to the admin */}
              <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <div>
                  <p className="text-sm font-medium text-sky-800">External article — redirects to original URL</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-sky-700">
                    Clicking this card on the blog will open the article on the original platform in a new tab.
                    Fill in the metadata below so it appears correctly on the card.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div>
                  <FieldLabel htmlFor="external_url" label={`${copy.fields.externalUrl} *`} />
                  <Input id="external_url" {...register("external_url")} className="mt-1" placeholder="https://medium.com/..." />
                  {errors.external_url && <p className="mt-1 text-xs text-red-600">{errors.external_url.message}</p>}
                </div>
                <div>
                  <FieldLabel htmlFor="external_source" label={copy.fields.externalSource} />
                  <Input id="external_source" {...register("external_source")} className="mt-1" placeholder="e.g., Medium, LinkedIn" />
                </div>
              </div>
            </>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel htmlFor="category" label={copy.fields.category} tooltip={copy.hints.category} />
              <Input id="category" {...register("category")} className="mt-1" placeholder="e.g. AI; Blockchain; Product" />
              <p className="mt-1 text-xs text-gray-500">{copy.hints.category}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleRemoveCategory(item)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    aria-label={`Remove category ${item}`}
                  >
                    {item}
                    <span className="text-slate-400">×</span>
                  </button>
                ))}
                {categorySuggestions
                  .filter((item) => !currentCategories.some((cat) => cat.toLowerCase() === item.toLowerCase()))
                  .slice(0, 8)
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddCategory(item)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    >
                      {item}
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <FieldLabel htmlFor="tags" label={copy.fields.tags} tooltip={copy.hints.tags} />
              <Input id="tags" {...register("tags")} className="mt-1" placeholder="ai; product; design" />
              <p className="mt-1 text-xs text-gray-500">{copy.hints.tags}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    aria-label={`Remove tag ${tag}`}
                  >
                    #{tag}
                    <span className="text-slate-400">×</span>
                  </button>
                ))}
                {tagSuggestions
                  .filter((item) => !currentTags.some((tag) => tag.toLowerCase() === item.toLowerCase()))
                  .slice(0, 10)
                  .map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddTag(item)}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    >
                      #{item}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div>
            <FieldLabel htmlFor="cover_image_url" label={copy.fields.coverImage} tooltip={copy.hints.coverImage} />
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openCloudinaryPicker((url) => setValue("cover_image_url", url, { shouldValidate: true }))}
                >
                  Pick from Cloudinary
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openGooglePicker((url) => setValue("cover_image_url", url, { shouldValidate: true }))}
                >
                  Pick from Google Drive
                </Button>
              </div>
              <p className="text-xs text-gray-500">{copy.hints.coverImage}</p>
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
            <FieldLabel htmlFor="og_image_url" label={copy.fields.ogImage} tooltip={copy.hints.ogImage} />
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <Input id="og_image_url" {...register("og_image_url")} className="flex-1" placeholder="https://..." />
              <Button
                type="button"
                variant="outline"
                onClick={() => openCloudinaryPicker((url) => setValue("og_image_url", url, { shouldValidate: true }))}
              >
                Pick from Cloudinary
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => openGooglePicker((url) => setValue("og_image_url", url, { shouldValidate: true }))}
              >
                Pick from Google Drive
              </Button>
            </div>
            {errors.og_image_url && (
              <p className="mt-1 text-xs text-red-600">{errors.og_image_url.message}</p>
            )}
          </div>
          {!watch("is_external") && (
            <div>
              <FieldLabel htmlFor="content" label={copy.fields.content} tooltip={copy.hints.content} />
              <p className="mt-1 text-xs text-gray-500">{copy.hints.content}</p>
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
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  >
                    H1
                  </button>
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
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                >
                  Separator
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
                  onClick={() => {
                    const url = window.prompt("Paste a URL to link", "https://");
                    if (!url) return;
                    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                  }}
                >
                  URL
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => inlineImageInputRef.current?.click()}
                >
                  Image
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    const caption = window.prompt("Caption text", "Image caption");
                    if (!caption) return;
                    editor?.chain().focus().insertContent(`<p><em>${caption}</em></p>`).run();
                  }}
                >
                  Caption
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => {
                    const url = window.prompt("Paste YouTube URL", "https://www.youtube.com/watch?v=");
                    if (!url) return;
                    const match = url.match(/[?&]v=([^&]+)|youtu\.be\/([^?]+)/);
                    const videoId = match?.[1] || match?.[2];
                    if (!videoId) return;
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                    editor
                      ?.chain()
                      .focus()
                      .insertContent(
                        `<iframe src="${embedUrl}" width="560" height="315" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                      )
                      .run();
                  }}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => openCloudinaryPicker((url) => editor?.chain().focus().setImage({ src: url }).run())}
                >
                  Cloudinary
                </button>
                <button
                  type="button"
                  className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  onClick={() => openGooglePicker((url) => editor?.chain().focus().setImage({ src: url }).run())}
                >
                  Google Drive
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
          )}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700">SEO</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <FieldLabel htmlFor="seo_title" label={copy.fields.seoTitle} tooltip={copy.hints.seoTitle} />
                <Input id="seo_title" {...register("seo_title")} className="mt-1" placeholder="Max 60 chars" />
                <p className="mt-1 text-xs text-gray-500">{copy.hints.seoTitle}</p>
                {errors.seo_title && <p className="mt-1 text-xs text-red-600">{errors.seo_title.message}</p>}
              </div>
              <div>
                <FieldLabel htmlFor="seo_keywords" label={copy.fields.seoKeywords} tooltip={copy.hints.seoKeywords} />
                <Input id="seo_keywords" {...register("seo_keywords")} className="mt-1" placeholder="keyword1; keyword2" />
                <p className="mt-1 text-xs text-gray-500">{copy.hints.seoKeywords}</p>
              </div>
              <div className="md:col-span-2">
                <FieldLabel htmlFor="seo_description" label={copy.fields.seoDescription} tooltip={copy.hints.seoDescription} />
                <Textarea id="seo_description" {...register("seo_description")} rows={3} className="mt-1" placeholder="Max 160 chars" />
                <p className="mt-1 text-xs text-gray-500">{copy.hints.seoDescription}</p>
                {errors.seo_description && (
                  <p className="mt-1 text-xs text-red-600">{errors.seo_description.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 text-sm font-semibold text-gray-700">{copy.fields.metrics}</div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="reading_time_minutes" className="text-gray-700">{copy.fields.readingTime}</Label>
                <Input
                  id="reading_time_minutes"
                  type="number"
                  {...register("reading_time_minutes", { valueAsNumber: true })}
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="view_count" className="text-gray-700">{copy.fields.views}</Label>
                <Input
                  id="view_count"
                  type="number"
                  {...register("view_count", { valueAsNumber: true })}
                  className="mt-1"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="like_count" className="text-gray-700">{copy.fields.likes}</Label>
                <Input
                  id="like_count"
                  type="number"
                  {...register("like_count", { valueAsNumber: true })}
                  className="mt-1"
                  disabled
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">Reading time will auto-calculate when content changes.</p>
          </div>
          <div>
            <FieldLabel htmlFor="status" label={`${copy.fields.status} *`} tooltip={copy.hints.status} />
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
            <p className="mt-1 text-xs text-gray-500">{copy.hints.status}</p>
          </div>

          {/* Validation error summary — shown near Save so users know why submit blocked */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">Please fix the following before saving:</p>
              <ul className="mt-2 list-disc pl-5 text-xs text-red-600 space-y-1">
                {Object.entries(errors).map(([field, err]) => (
                  <li key={field}>
                    <span className="font-semibold capitalize">{field.replace(/_/g, " ")}</span>
                    {(err as { message?: string })?.message ? `: ${(err as { message?: string }).message}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              {autosaveStatus === "saving" && "Autosaving draft…"}
              {autosaveStatus === "saved" && "Draft saved"}
              {autosaveStatus === "error" && "Autosave failed — saved locally"}
            </p>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                {copy.actions.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  copy.actions.save
                )}
              </Button>
            </div>
          </div>
        </div>

        <aside className="order-first xl:order-none">
          <div className="sticky top-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {copy.preview.title}
              </p>
              <p className="mt-2 text-sm text-slate-500">{copy.preview.subtitle}</p>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {coverImageUrl ? (
                <div className="relative h-40 w-full">
                  <Image
                    src={coverImageUrl}
                    alt="Cover preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center bg-slate-100 text-xs text-slate-400">
                  Cover image preview
                </div>
              )}
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {previewCategories.map((item) => (
                    <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      {item}
                    </span>
                  ))}
                  {previewTags.slice(0, 2).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{previewTitle}</h3>
                <p className="text-sm text-slate-600">
                  {previewExcerpt || copy.preview.excerptPlaceholder}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {previewContent.trim() ? (
                <div
                  className="prose prose-lg max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              ) : (
                <p className="text-sm text-slate-500">{copy.preview.contentPlaceholder}</p>
              )}
            </div>
          </div>
        </aside>
      </form>
    </AdminModal>
  );
};

export default BlogPostForm;
