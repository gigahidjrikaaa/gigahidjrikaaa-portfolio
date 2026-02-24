"use client";

import { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { adminApi, ClientResponse } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Client Logos",
  subtitle: "Manage companies and organizations you've worked with.",
  add: "Add Client",
  delete: "Delete Client",
  edit: "Edit Client",
  confirmDelete: "Are you sure you want to delete this client?",
  name: "Client Name",
  logo: "Logo URL",
  website: "Website URL",
  description: "Description",
  featured: "Featured Client",
  save: "Save",
  cancel: "Cancel",
  loading: "Loading...",
};

const ClientsManagement = () => {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<ClientResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminApi.getClients();
        setClients(data);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingClient(null);
    setFormData({
      name: "",
      logo_url: "",
      website_url: "",
      description: "",
      is_featured: false,
      display_order: clients.length,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (client: ClientResponse) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      logo_url: client.logo_url,
      website_url: client.website_url || "",
      description: client.description || "",
      is_featured: client.is_featured,
      display_order: client.display_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;

    try {
      await adminApi.deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete client", error);
    }
  };

  const handleSave = async () => {
    try {
      if (editingClient) {
        const updated = await adminApi.updateClient(editingClient.id, formData);
        setClients(clients.map((c) => (c.id === editingClient.id ? updated : c)));
      } else {
        const created = await adminApi.createClient(formData);
        setClients([...clients, created]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save client", error);
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

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {clients.map((client) => (
          <Card key={client.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gray-50">
                {client.logo_url ? (
                  <img src={client.logo_url} alt={client.name} className="max-h-20 max-w-full object-contain" />
                ) : (
                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{client.name}</h3>
              {client.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {client.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                {client.website_url && (
                  <a
                    href={client.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Visit Website
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(client)} className="p-1 rounded hover:bg-gray-100">
                    <PencilIcon className="h-4 w-4 text-gray-600" />
                  </button>
                  <button onClick={() => handleDelete(client.id)} className="p-1 rounded hover:bg-gray-100 text-red-600">
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
              {editingClient ? copy.edit : copy.add}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.name}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.logo}
                </label>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.website}
                </label>
                <input
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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

export default ClientsManagement;
