"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";
import { AwardBase, AwardResponse } from "@/services/api";

const copy = {
  addTitle: "Add Award",
  editTitle: "Edit Award",
  fields: {
    title: "Title",
    issuer: "Issuer",
    awardDate: "Award Date",
    credentialUrl: "Credential URL",
    imageUrl: "Image URL",
    description: "Description",
    displayOrder: "Display Order",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Award",
  },
};

interface AwardFormProps {
  award?: AwardResponse | null;
  onSave: (award: AwardBase) => void;
  onCancel: () => void;
}

const AwardForm: React.FC<AwardFormProps> = ({ award, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<AwardBase>({
    title: "",
    issuer: "",
    award_date: "",
    credential_url: "",
    image_url: "",
    description: "",
    display_order: 0,
  });

  useEffect(() => {
    if (award) {
      setFormData({
        title: award.title || "",
        issuer: award.issuer || "",
        award_date: award.award_date || "",
        credential_url: award.credential_url || "",
        image_url: award.image_url || "",
        description: award.description || "",
        display_order: award.display_order || 0,
      });
    }
  }, [award]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast({
        title: "Missing required fields",
        description: "Title is required to save an award.",
        variant: "error",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <AdminModal
      title={award ? copy.editTitle : copy.addTitle}
      description="Highlight the award impact and include a credential link."
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-700">{copy.fields.title}</Label>
            <Input id="title" value={formData.title} onChange={handleChange} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="issuer" className="text-gray-700">{copy.fields.issuer}</Label>
            <Input id="issuer" value={formData.issuer || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="award_date" className="text-gray-700">{copy.fields.awardDate}</Label>
            <Input id="award_date" type="date" value={formData.award_date || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="credential_url" className="text-gray-700">{copy.fields.credentialUrl}</Label>
            <Input id="credential_url" value={formData.credential_url || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="image_url" className="text-gray-700">{copy.fields.imageUrl}</Label>
            <Input id="image_url" value={formData.image_url || ""} onChange={handleChange} className="mt-1" />
            {formData.image_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={formData.image_url}
                  alt="Award preview"
                  width={60}
                  height={60}
                  unoptimized
                  className="h-14 w-14 rounded-md object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Image preview</p>
                  <p className="text-xs text-gray-500">Square or landscape works best.</p>
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700">{copy.fields.description}</Label>
            <Textarea id="description" value={formData.description || ""} onChange={handleChange} rows={4} className="mt-1" />
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button type="submit">{copy.actions.save}</Button>
          </div>
        </form>
    </AdminModal>
  );
};

export default AwardForm;
