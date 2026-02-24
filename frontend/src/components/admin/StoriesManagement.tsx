"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";
import { adminApi, StoryResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";


const EMPTY_FORM = {
  title: "",
  caption: "",
  image_url: "",
  thumbnail_url: "",
  is_featured: false,
  display_order: 0,
};

const INPUT_CLS =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition";

const StoriesManagement = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getStories();
      setStories(data);
    } catch {
      toast({ variant: "error", title: "Failed to load stories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStories(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditingStory(null);
    setFormData({ ...EMPTY_FORM, display_order: stories.length });
    setIsModalOpen(true);
  };

  const openEdit = (story: StoryResponse) => {
    setEditingStory(story);
    setFormData({
      title: story.title || "",
      caption: story.caption || "",
      image_url: story.image_url,
      thumbnail_url: story.thumbnail_url || "",
      is_featured: story.is_featured,
      display_order: story.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await adminApi.deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast({ variant: "success", title: "Story deleted" });
    } catch {
      toast({ variant: "error", title: "Failed to delete story" });
    }
  };

  const handleSave = async () => {
    if (!formData.image_url.trim()) {
      toast({ variant: "error", title: "Image URL is required" });
      return;
    }
    setSaving(true);
    try {
      if (editingStory) {
        const updated = await adminApi.updateStory(editingStory.id, formData);
        setStories((prev) => prev.map((s) => (s.id === editingStory.id ? updated : s)));
        toast({ variant: "success", title: "Story updated" });
      } else {
        const created = await adminApi.createStory(formData);
        setStories((prev) => [...prev, created]);
        toast({ variant: "success", title: "Story added" });
      }
      setIsModalOpen(false);
    } catch {
      toast({ variant: "error", title: "Failed to save story. Check your inputs and try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stories.length) return;
    const reordered = [...stories];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    try {
      const updated = await Promise.all(
        reordered.map((s, i) => adminApi.updateStory(s.id, { ...s, display_order: i }))
      );
      setStories(updated);
    } catch {
      toast({ variant: "error", title: "Failed to reorder stories" });
    }
  };

  if (loading) return <LoadingAnimation label="Loading stories…" />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Stories & BTS Photos</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your behind-the-scenes stories and photos.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Story
        </button>
      </div>

      {/* Empty state */}
      {stories.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <FilmIcon className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No stories yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add your first behind-the-scenes story or photo.</p>
          <button
            onClick={openAdd}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <PlusIcon className="h-4 w-4" />
            Add Story
          </button>
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence>
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
            >
              <Card className="overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[9/16] bg-slate-100">
                  {story.thumbnail_url || story.image_url ? (
                    <img
                      src={story.thumbnail_url || story.image_url}
                      alt={story.title || "Story"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                  {story.is_featured && (
                    <span className="absolute right-2 top-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                      Featured
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                    {story.title || "Untitled"}
                  </p>
                  {story.caption && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{story.caption}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMove(index, -1)}
                        disabled={index === 0}
                        aria-label="Move up"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowUpIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 1)}
                        disabled={index === stories.length - 1}
                        aria-label="Move down"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ArrowDownIcon className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(story)}
                        aria-label="Edit story"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100"
                      >
                        <PencilIcon className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(story.id)}
                        aria-label="Delete story"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-rose-600 transition hover:bg-rose-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <AdminModal
            title={editingStory ? "Edit Story" : "Add Story"}
            description={editingStory ? "Update the story details below." : "Fill in the details for the new story."}
            onClose={() => setIsModalOpen(false)}
            maxWidthClass="max-w-lg"
          >
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="story-title">
                  Title
                </label>
                <input
                  id="story-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="E.g. Recording session at studio"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="story-caption">
                  Caption
                </label>
                <textarea
                  id="story-caption"
                  value={formData.caption}
                  onChange={(e) => setFormData((f) => ({ ...f, caption: e.target.value }))}
                  rows={3}
                  placeholder="A short description of the story…"
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="story-image">
                  Image URL <span className="text-rose-500">*</span>
                </label>
                <input
                  id="story-image"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="story-thumb">
                  Thumbnail URL <span className="text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="story-thumb"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData((f) => ({ ...f, thumbnail_url: e.target.value }))}
                  placeholder="https://..."
                  className={INPUT_CLS}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm font-medium text-slate-700">Mark as Featured</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingStory ? "Update Story" : "Add Story"}
                </button>
              </div>
            </div>
          </AdminModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesManagement;

