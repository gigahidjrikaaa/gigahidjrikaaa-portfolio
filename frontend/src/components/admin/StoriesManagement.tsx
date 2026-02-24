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
} from "@heroicons/react/24/outline";
import { adminApi, StoryResponse } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Stories & BTS Photos",
  subtitle: "Manage your behind-the-scenes stories and photos.",
  add: "Add Story",
  delete: "Delete Story",
  edit: "Edit Story",
  confirmDelete: "Are you sure you want to delete this story?",
  upload: "Upload Image",
  thumbnail: "Thumbnail URL",
  image: "Image URL",
  caption: "Caption",
  featured: "Featured Story",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading...",
};

const StoriesManagement = () => {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStory, setEditingStory] = useState<StoryResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    image_url: "",
    thumbnail_url: "",
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.getStories();
        setStories(data);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingStory(null);
    setFormData({
      title: "",
      caption: "",
      image_url: "",
      thumbnail_url: "",
      is_featured: false,
      display_order: stories.length,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (story: StoryResponse) => {
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
    if (!confirm(copy.confirmDelete)) return;

    try {
      await adminApi.deleteStory(id);
      setStories(stories.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to delete story", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingStory) {
        const updated = await adminApi.updateStory(editingStory.id, formData);
        setStories(stories.map((s) => (s.id === editingStory.id ? updated : s)));
      } else {
        const created = await adminApi.createStory(formData);
        setStories([...stories, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save story", error);
    }
  };

  const handleMove = async (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= stories.length) return;

    const newStories = [...stories];
    [newStories[index], newStories[newIndex]] = [newStories[newIndex], newStories[index]];

    const updated = await Promise.all(
      newStories.map((s, i) => adminApi.updateStory(s.id, { ...s, display_order: i }))
    );

    setStories(updated);
  };

  if (loading) {
    return <LoadingAnimation label={copy.loading} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{copy.title}</h2>
          <p className="text-sm text-gray-500">{copy.subtitle}</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <PlusIcon className="h-4 w-4" />
          {copy.add}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {stories.map((story, index) => (
          <Card key={story.id} className="overflow-hidden">
            <div className="relative aspect-[9/16] bg-gray-100">
              {story.thumbnail_url || story.image_url ? (
                <img
                  src={story.thumbnail_url || story.image_url}
                  alt={story.title || "Story"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {story.is_featured && (
                <div className="absolute top-2 right-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                  Featured
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {story.title || "Untitled"}
              </p>
              {story.caption && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {story.caption}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === stories.length - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDownIcon className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(story)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="p-1 rounded hover:bg-gray-100 text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {editingStory ? copy.edit : copy.add}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    value={formData.caption}
                    onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thumbnail URL (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    {copy.featured}
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  {copy.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  {copy.save}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesManagement;
