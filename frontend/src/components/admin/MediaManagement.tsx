"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { adminApi, MediaAssetResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { openMediaLibrary, openUploadWidget } from "@/lib/cloudinaryWidget";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Media Library",
  subtitle: "Upload and manage image assets used across your portfolio.",
  searchLabel: "Search",
  tagFilterLabel: "Filter by tag",
  pageSizeLabel: "Items per page",
  uploadButton: "Upload image",
  uploading: "Uploading…",
  fileLabel: "Image file",
  titleLabel: "Title",
  altLabel: "Alt text",
  tagsLabel: "Tags",
  folderLabel: "Folder",
  empty: "No media assets yet. Upload your first image.",
  delete: "Delete",
  deleteSelected: "Delete selected",
  copyUrl: "Copy URL",
  copyThumb: "Copy thumbnail URL",
  copySquare: "Copy square URL",
  openLibrary: "Open Cloudinary Library",
  openUpload: "Upload via Cloudinary",
  error: "Something went wrong. Please try again.",
  copied: "Copied!",
};

const MediaManagement = () => {
  const [assets, setAssets] = useState<MediaAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [tags, setTags] = useState("");
  const [folder, setFolder] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
  const cloudApiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

  const canUpload = useMemo(() => Boolean(file) && !isUploading, [file, isUploading]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const cloudinaryTransform = (url: string, transformation: string) => {
    const marker = "/upload/";
    const index = url.indexOf(marker);
    if (index === -1) {
      return url;
    }
    return `${url.slice(0, index + marker.length)}${transformation}/${url.slice(index + marker.length)}`;
  };

  const loadAssets = useCallback(async () => {
    try {
      setError(null);
      const data = await adminApi.getMediaAssets({
        q: search.trim() || undefined,
        tag: tagFilter.trim() || undefined,
        page: currentPage,
        page_size: pageSize,
      });
      setAssets(data.items);
      setTotal(data.total);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, tagFilter]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleUpload = async () => {
    if (!file) {
      return;
    }
    setIsUploading(true);
    try {
      const uploaded = await adminApi.uploadMediaAsset(file, {
        title: title || undefined,
        alt_text: altText || undefined,
        tags: tags || undefined,
        folder: folder || undefined,
      });
      setAssets((prev) => [uploaded, ...prev]);
      setTotal((prev) => prev + 1);
      setFile(null);
      setTitle("");
      setAltText("");
      setTags("");
      setFolder("");
    } catch {
      setError(copy.error);
    } finally {
      setIsUploading(false);
    }
  };

  const canOpenCloudinaryUpload = Boolean(cloudName && uploadPreset);
  const canOpenCloudinaryLibrary = Boolean(cloudName && cloudApiKey);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) {
      return;
    }
    try {
      await adminApi.deleteMediaAsset(id);
      setAssets((prev) => prev.filter((asset) => asset.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch {
      setError(copy.error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }
    if (!confirm("Delete all selected assets?")) {
      return;
    }
    try {
      const result = await adminApi.bulkDeleteMediaAssets(selectedIds);
      setAssets((prev) => prev.filter((asset) => !result.deleted_ids.includes(asset.id)));
      setTotal((prev) => Math.max(0, prev - result.deleted_ids.length));
      setSelectedIds((prev) => prev.filter((id) => !result.deleted_ids.includes(id)));
      if (result.failed_ids.length > 0) {
        setError(`Failed to delete ${result.failed_ids.length} assets.`);
      }
    } catch {
      setError(copy.error);
    }
  };

  const handleCopyUrl = async (id: number, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setError(copy.error);
    }
  };

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleInsertAssets = async (assetsToInsert: { secure_url?: string; url?: string; public_id?: string; width?: number; height?: number; bytes?: number; folder?: string; tags?: string[] }[]) => {
    try {
      const created = await Promise.all(
        assetsToInsert.map((asset) =>
          adminApi.createMediaAsset({
            url: asset.secure_url || asset.url || "",
            public_id: asset.public_id,
            provider: "cloudinary",
            width: asset.width,
            height: asset.height,
            size_bytes: asset.bytes,
            folder: asset.folder,
            tags: asset.tags?.join(","),
          })
        )
      );
      setAssets((prev) => [...created, ...prev]);
      setTotal((prev) => prev + created.length);
    } catch {
      setError(copy.error);
    }
  };

  const openLibrary = async () => {
    if (!cloudName || !cloudApiKey) {
      setError("Cloudinary is not configured on the frontend.");
      return;
    }
    await openMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: cloudApiKey,
        multiple: true,
        insert_caption: true,
      },
      handleInsertAssets
    );
  };

  const openUpload = async () => {
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary upload preset is missing.");
      return;
    }
    await openUploadWidget(
      {
        cloudName,
        uploadPreset,
        multiple: true,
        folder: folder || undefined,
        tags: tags || undefined,
      },
      (result) => handleInsertAssets([
        {
          secure_url: result.secure_url,
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          folder: folder || undefined,
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
        },
      ])
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <p className="text-sm text-gray-500">{copy.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-file">{copy.fileLabel}</Label>
            <Input
              id="media-file"
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-title">{copy.titleLabel}</Label>
            <Input
              id="media-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Hero banner"
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-alt">{copy.altLabel}</Label>
            <Input
              id="media-alt"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-tags">{copy.tagsLabel}</Label>
            <Input
              id="media-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="banner, hero, project"
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-folder">{copy.folderLabel}</Label>
            <Input
              id="media-folder"
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="portfolio"
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-search">{copy.searchLabel}</Label>
            <Input
              id="media-search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by title or URL"
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-tag-filter">{copy.tagFilterLabel}</Label>
            <Input
              id="media-tag-filter"
              value={tagFilter}
              onChange={(event) => {
                setTagFilter(event.target.value);
                setPage(1);
              }}
              placeholder="e.g. hero"
            />
          </div>
          <div className="md:col-span-1 space-y-3">
            <Label htmlFor="media-page-size">{copy.pageSizeLabel}</Label>
            <select
              id="media-page-size"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
            >
              {[6, 9, 12, 18].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleUpload} disabled={!canUpload}>
            {isUploading ? copy.uploading : copy.uploadButton}
          </Button>
          <Button variant="outline" onClick={openUpload} disabled={!canOpenCloudinaryUpload}>
            {copy.openUpload}
          </Button>
          <Button variant="outline" onClick={openLibrary} disabled={!canOpenCloudinaryLibrary}>
            {copy.openLibrary}
          </Button>
          <Button variant="outline" onClick={handleBulkDelete} disabled={selectedIds.length === 0}>
            {copy.deleteSelected}
          </Button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {loading ? (
          <LoadingAnimation label="Loading media…" size="sm" />
        ) : assets.length === 0 ? (
          <p className="text-sm text-gray-500">{copy.empty}</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
              <div key={asset.id} className="rounded-lg border border-gray-200 p-3">
                <div className="relative aspect-video overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={asset.url}
                    alt={asset.alt_text ?? asset.title ?? "Uploaded asset"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedIds.includes(asset.id)}
                        onChange={() => toggleSelected(asset.id)}
                        aria-label="Select asset"
                      />
                      {asset.title ?? "Untitled"}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 break-all">{asset.url}</p>
                  {asset.tags ? <p className="text-xs text-gray-400">Tags: {asset.tags}</p> : null}
                  {asset.folder ? <p className="text-xs text-gray-400">Folder: {asset.folder}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCopyUrl(asset.id, asset.url)}>
                      {copiedId === asset.id ? copy.copied : copy.copyUrl}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(asset.id, cloudinaryTransform(asset.url, "w_320,h_200,c_fill,q_auto,f_auto"))}
                    >
                      {copy.copyThumb}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(asset.id, cloudinaryTransform(asset.url, "w_400,h_400,c_fill,q_auto,f_auto"))}
                    >
                      {copy.copySquare}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(asset.id)}>
                      {copy.delete}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaManagement;
