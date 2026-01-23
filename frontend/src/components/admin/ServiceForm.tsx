"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";
import { ServiceBase, ServiceResponse } from "@/services/api";

const copy = {
  addTitle: "Add Service",
  editTitle: "Edit Service",
  fields: {
    title: "Title",
    subtitle: "Subtitle",
    description: "Description",
    icon: "Icon Key",
    featured: "Featured",
    displayOrder: "Display Order",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Service",
  },
};

interface ServiceFormProps {
  service?: ServiceResponse | null;
  onSave: (service: ServiceBase) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ServiceBase>({
    title: "",
    subtitle: "",
    description: "",
    icon: "",
    is_featured: false,
    display_order: 0,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        subtitle: service.subtitle || "",
        description: service.description || "",
        icon: service.icon || "",
        is_featured: service.is_featured || false,
        display_order: service.display_order || 0,
      });
    }
  }, [service]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_featured: checked,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: "Missing required fields",
        description: "Title is required to save a service.",
        variant: "error",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <AdminModal
      title={service ? copy.editTitle : copy.addTitle}
      description="Keep services concise and highlight the value."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">{copy.fields.title}</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="subtitle" className="text-gray-700">{copy.fields.subtitle}</Label>
            <Input id="subtitle" value={formData.subtitle || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700">{copy.fields.description}</Label>
            <Textarea id="description" value={formData.description || ""} onChange={handleChange} rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="icon" className="text-gray-700">{copy.fields.icon}</Label>
            <Input id="icon" value={formData.icon || ""} onChange={handleChange} className="mt-1" placeholder="brain | rocket | cubes | palette" />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="is_featured" checked={formData.is_featured} onCheckedChange={(value) => handleCheckboxChange(Boolean(value))} />
            <Label htmlFor="is_featured" className="text-gray-700">{copy.fields.featured}</Label>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button type="submit">{copy.actions.save}</Button>
          </div>
        </form>
    </AdminModal>
  );
};

export default ServiceForm;
