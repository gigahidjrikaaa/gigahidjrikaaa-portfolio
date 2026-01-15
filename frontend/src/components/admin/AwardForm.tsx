"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          {award ? copy.editTitle : copy.addTitle}
        </h2>
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
            <Input id="award_date" value={formData.award_date || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="credential_url" className="text-gray-700">{copy.fields.credentialUrl}</Label>
            <Input id="credential_url" value={formData.credential_url || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="image_url" className="text-gray-700">{copy.fields.imageUrl}</Label>
            <Input id="image_url" value={formData.image_url || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description" className="text-gray-700">{copy.fields.description}</Label>
            <Textarea id="description" value={formData.description || ""} onChange={handleChange} rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="display_order" className="text-gray-700">{copy.fields.displayOrder}</Label>
            <Input id="display_order" type="number" value={formData.display_order} onChange={handleChange} required className="mt-1" />
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button type="submit">{copy.actions.save}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AwardForm;
