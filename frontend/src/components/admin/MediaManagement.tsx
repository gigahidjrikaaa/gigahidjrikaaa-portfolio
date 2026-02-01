"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { adminApi, MediaAssetResponse } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  PhotoIcon,
  MagnifyingGlassIcon,
  TagIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  DocumentArrowDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const copy = {
  title: "Media Library",
  subtitle: "Manage your image assets for portfolio and blog posts.",
  search: "Search images...",
  filter: "Filter by tag",
  sort: "Sort by",
  upload: "Upload Image",
  uploading: "Uploading...",
  selectAll: "Select All",
  deselectAll: "Deselect All",
  delete: "Delete Selected",
  edit: "Edit",
  copy: "Copy URL",
  empty: "No images yet. Upload your first image to get started.",
  loadMore: "Load More",
  selectedCount: "selected",
  details: "Image Details",
  save: "Save Changes",
  cancel: "Cancel",
  dragDrop: "Drag & drop images here, or click to browse",
  altLabel: "Alt text",
  tagsLabel: "Tags",
  folderLabel: "Folder",
};

type SortOption = 'newest' | 'oldest' | 'name' | 'name-asc' | 'size' | 'size-asc';
type ViewMode = 'grid' | 'list';

const sortOptions: { label: string; value: SortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name-asc' },
  { label: 'Size (Smallest)', value: 'size' },
  { label: 'Size (Largest)', value: 'size-asc' },
];

const MediaManagement = () => {
  const [assets, setAssets] = useState<MediaAssetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sort, setSort] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const pageSize = 32;
  const [total, setTotal] = useState(0);
  const [editingAsset, setEditingAsset] = useState<MediaAssetResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', alt_text: '', tags: '', folder: '' });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = !search || 
        asset.title?.toLowerCase().includes(search.toLowerCase()) ||
        asset.url?.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !tagFilter || asset.tags?.includes(tagFilter);
      return matchesSearch && matchesTag;
    });
  }, [assets, search, tagFilter]);

  const sortedAssets = useMemo(() => {
    const sorted = [...filteredAssets];
    switch (sort) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'name':
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'name-asc':
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'size':
        return sorted.sort((a, b) => {
          const sizeA = a.size_bytes || 0;
          const sizeB = b.size_bytes || 0;
          return sizeA - sizeB;
        });
      case 'size-asc':
        return sorted.sort((a, b) => {
          const sizeA = a.size_bytes || 0;
          const sizeB = b.size_bytes || 0;
          return sizeB - sizeA;
        });
      default:
        return sorted;
    }
  }, [filteredAssets, sort]);

  const paginatedAssets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, page, pageSize]);

  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    assets.forEach((asset) => {
      asset.tags?.split(',').forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) tags.add(trimmed);
      });
    });
    return Array.from(tags).sort();
  }, [assets]);

  const loadAssets = useCallback(async () => {
    try {
      const data = await adminApi.getMediaAssets({
        q: search || undefined,
        tag: tagFilter || undefined,
        page,
        page_size: pageSize,
      });
      setAssets(data.items);
      setTotal(data.total);
    } catch {
      setError('Failed to load media assets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, tagFilter, page, pageSize]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleBulkDelete = () => {
    setSelectedIds(new Set());
  };

  const handleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleCopyUrl = async (url: string, id: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast({
        title: 'Copied',
        description: 'URL copied to clipboard.',
        variant: 'success',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError('Failed to copy URL.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await adminApi.deleteMediaAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setTotal((prev) => prev - 1);
      toast({
        title: 'Deleted',
        description: 'Image has been deleted successfully.',
        variant: 'success',
      });
    } catch {
      setError('Failed to delete image. Please try again.');
    }
  };

  const handleEdit = (asset: MediaAssetResponse) => {
    setEditingAsset(asset);
    setEditForm({
      title: asset.title || '',
      alt_text: asset.alt_text || '',
      tags: asset.tags || '',
      folder: asset.folder || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAsset) return;

    try {
      await adminApi.updateMediaAsset(editingAsset.id, {
        title: editForm.title || undefined,
        alt_text: editForm.alt_text || undefined,
        tags: editForm.tags || undefined,
        folder: editForm.folder || undefined,
      });
      
      setAssets((prev) => prev.map((a) => a.id === editingAsset.id ? { ...a, ...editForm } : a));
      setShowEditModal(false);
      setEditingAsset(null);
      
      toast({
        title: 'Updated',
        description: 'Image details updated successfully.',
        variant: 'success',
      });
    } catch {
      setError('Failed to update image. Please try again.');
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploaded = await adminApi.uploadMediaAsset(file, {
        title: editForm.title || undefined,
        alt_text: editForm.alt_text || undefined,
        tags: editForm.tags || undefined,
        folder: editForm.folder || undefined,
      });
      setAssets((prev) => [uploaded, ...prev]);
      setTotal((prev) => prev + 1);
      setPage(1);
      
      toast({
        title: 'Uploaded',
        description: 'Image uploaded successfully.',
        variant: 'success',
      });
    } catch {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingAnimation label="Loading media library..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500">
            {total} total image{total === 1 ? '' : 's'}
            {selectedIds.size > 0 && (
              <span className="ml-2 text-blue-600">({selectedIds.size} {copy.selectedCount})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="upload-input"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                const file = files[0];
                handleUpload(file);
                e.target.value = '';
              }
            }}
          />
          <Button
            onClick={() => document.getElementById('upload-input')?.click()}
            disabled={isUploading}
          >
            <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
            {isUploading ? copy.uploading : copy.upload}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">{copy.search}</Label>
              <Input
                id="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title or URL..."
              />
            </div>

            <div>
              <Label htmlFor="tag-filter">{copy.filter}</Label>
              <Input
                id="tag-filter"
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by tag..."
              />
            </div>

            {uniqueTags.length > 0 && (
              <div>
                <Label>Quick Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setTagFilter(tag === tagFilter ? '' : tag);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                        tagFilter === tag
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <Label>{copy.sort}</Label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <Label>View Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  List
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Grid */}
        <Card>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm font-medium underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {paginatedAssets.length === 0 ? (
              <div className="flex h-96 items-center justify-center">
                <PhotoIcon className="h-16 w-16 text-gray-300" />
                <p className="mt-4 text-sm text-gray-500">{copy.empty}</p>
              </div>
            ) : (
              <>
                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-700">
                        {selectedIds.size} image{selectedIds.size === 1 ? '' : 's'} {copy.selectedCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        {copy.deselectAll}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4" />
                        {copy.delete}
                      </Button>
                    </div>
                  </div>
                )}

                {viewMode === 'grid' ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-blue-300 hover:shadow-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asset.id)}
                          onChange={() => handleSelect(asset.id)}
                          className="absolute top-3 left-3 z-10 h-4 w-4 cursor-pointer"
                        />
                        <div
                          onClick={() => handleEdit(asset)}
                          className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white border border-gray-200 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-50"
                        >
                          <PencilIcon className="h-3.5 w-3.5 text-gray-600" />
                        </div>
                        <div className="aspect-square bg-gray-100">
                          <Image
                            src={asset.url}
                            alt={asset.alt_text || asset.title || 'Uploaded asset'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3 space-y-2 bg-white">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {asset.title || 'Untitled'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{asset.url}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {asset.tags && asset.tags.split(',').map((tag) => (
                              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                <TagIcon className="h-2.5 w-2.5" />
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {new Date(asset.created_at).toLocaleDateString()}
                            </div>
                            <span>{formatFileSize(asset.size_bytes)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(asset.id)}
                          onChange={() => handleSelect(asset.id)}
                          className="h-4 w-4 flex-shrink-0 cursor-pointer"
                        />
                        <div
                          onClick={() => handleEdit(asset)}
                          className="h-12 w-12 flex-shrink-0 cursor-pointer flex items-center justify-center rounded-lg bg-gray-100 transition-colors hover:bg-gray-200"
                        >
                          <Image
                            src={asset.url}
                            alt={asset.alt_text || asset.title || 'Uploaded asset'}
                            width={48}
                            height={48}
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {asset.title || 'Untitled'}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">{asset.url}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <TagIcon className="h-3 w-3" />
                                {asset.tags || 'No tags'}
                              </span>
                              {asset.folder && (
                                <span className="flex items-center gap-1">
                                  <PhotoIcon className="h-3 w-3" />
                                  {asset.folder}
                                </span>
                              )}
                            </div>
                            <span>{formatFileSize(asset.size_bytes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyUrl(asset.url, asset.id)}
                            >
                              {copiedId === asset.id ? (
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowPathIcon className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(asset.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between gap-2 border-t border-gray-200 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      disabled={page === 1}
                    >
                      <ArrowUpTrayIcon className="mr-1.5 h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages} ({(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total})
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ArrowDownTrayIcon className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-title">{copy.details}</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Image title"
              />
            </div>
            <div>
              <Label htmlFor="edit-alt">Alt text</Label>
              <Textarea
                id="edit-alt"
                value={editForm.alt_text}
                onChange={(e) => setEditForm((prev) => ({ ...prev, alt_text: e.target.value }))}
                placeholder="Describe the image for accessibility"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-tags">{copy.tagsLabel}</Label>
              <Input
                id="edit-tags"
                value={editForm.tags}
                onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="comma-separated tags"
              />
            </div>
            <div>
              <Label htmlFor="edit-folder">{copy.folderLabel}</Label>
              <Input
                id="edit-folder"
                value={editForm.folder}
                onChange={(e) => setEditForm((prev) => ({ ...prev, folder: e.target.value }))}
                placeholder="portfolio, hero, blog"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                {copy.cancel}
              </Button>
              <Button onClick={handleSaveEdit}>
                {copy.save}
              </Button>
            </div>
            {editingAsset && (
              <div className="mt-4 flex justify-center">
                <Image
                  src={editingAsset.url}
                  alt={editingAsset.alt_text || editingAsset.title || 'Image preview'}
                  width={150}
                  height={150}
                  className="rounded-lg border border-gray-200 object-cover"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaManagement;
