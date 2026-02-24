"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, NewspaperIcon } from "@heroicons/react/24/outline";
import { adminApi, PressMentionResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Press & Media Mentions",
  subtitle: "Manage articles, podcasts, and interviews featuring you.",
  add: "Add Mention",
  delete: "Delete Mention",
  edit: "Edit Mention",
  confirmDelete: "Are you sure you want to delete this mention?",
  title: "Title",
  publication: "Publication Name",
  publicationUrl: "Publication URL",
  publicationDate: "Publication Date",
  excerpt: "Excerpt",
  imageUrl: "Image URL",
  featured: "Featured",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading...",
};

const PressMentionsManagement = () => {
  const [mentions, setMentions] = useState<PressMentionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMention, setEditingMention] = useState<PressMentionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    publication: "",
    publication_url: "",
    publication_date: "",
    excerpt: "",
    image_url: "",
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.getPressMentions();
        setMentions(data);
      } catch (error) {
        console.error("Failed to fetch press mentions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingMention(null);
    setFormData({
      title: "",
      publication: "",
      publication_url: "",
      publication_date: "",
      excerpt: "",
      image_url: "",
      is_featured: false,
      display_order: mentions.length,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (mention: PressMentionResponse) => {
    setEditingMention(mention);
    setFormData({
      title: mention.title,
      publication: mention.publication || "",
      publication_url: mention.publication_url || "",
      publication_date: mention.publication_date || "",
      excerpt: mention.excerpt || "",
      image_url: mention.image_url || "",
      is_featured: mention.is_featured,
      display_order: mention.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;

    try {
      await adminApi.deletePressMention(id);
      setMentions(mentions.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete press mention", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingMention) {
        const updated = await adminApi.updatePressMention(editingMention.id, formData);
        setMentions(mentions.map((m) => (m.id === editingMention.id ? updated : m)));
      } else {
        const created = await adminApi.createPressMention(formData);
        setMentions([...mentions, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save press mention", error);
    }
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {mentions.map((mention) => (
          <Card key={mention.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-purple-50">
                <NewspaperIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {mention.title}
              </h3>
              {mention.publication && (
                <p className="text-sm text-purple-700 font-medium mb-2">
                  {mention.publication}
                </p>
              )}
              {mention.publication_date && (
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(mention.publication_date).toLocaleDateString()}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mention.is_featured && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Featured
                    </span>
                  )}
                  {mention.publication_url && (
                    <a
                      href={mention.publication_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:underline"
                    >
                      View
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(mention)} className="p-1 rounded hover:bg-gray-100">
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(mention.id)} className="p-1 rounded hover:bg-gray-100 text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {editingMention ? copy.edit : copy.add}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.title}
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.publication}
                </label>
                <input
                  type="text"
                  value={formData.publication}
                  onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.publicationUrl}
                </label>
                <input
                  type="text"
                  value={formData.publication_url}
                  onChange={(e) => setFormData({ ...formData, publication_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.publicationDate}
                </label>
                <input
                  type="date"
                  value={formData.publication_date}
                  onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.excerpt}
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.imageUrl}
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
                {copy.cancel}
              </button>
              <button onClick={handleSave} className="rounded-full bg-gray-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">
                {copy.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PressMentionsManagement;
