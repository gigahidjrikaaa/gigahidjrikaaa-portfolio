"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CertificateBase, CertificateResponse } from "@/services/api";

const copy = {
  addTitle: "Add Certificate",
  editTitle: "Edit Certificate",
  fields: {
    title: "Title",
    issuer: "Issuer",
    issueDate: "Issue Date",
    credentialId: "Credential ID",
    credentialUrl: "Credential URL",
    imageUrl: "Image URL",
    description: "Description",
    displayOrder: "Display Order",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Certificate",
  },
};

interface CertificateFormProps {
  certificate?: CertificateResponse | null;
  onSave: (certificate: CertificateBase) => void;
  onCancel: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ certificate, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CertificateBase>({
    title: "",
    issuer: "",
    issue_date: "",
    credential_id: "",
    credential_url: "",
    image_url: "",
    description: "",
    display_order: 0,
  });

  useEffect(() => {
    if (certificate) {
      setFormData({
        title: certificate.title || "",
        issuer: certificate.issuer || "",
        issue_date: certificate.issue_date || "",
        credential_id: certificate.credential_id || "",
        credential_url: certificate.credential_url || "",
        image_url: certificate.image_url || "",
        description: certificate.description || "",
        display_order: certificate.display_order || 0,
      });
    }
  }, [certificate]);

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
          {certificate ? copy.editTitle : copy.addTitle}
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
            <Label htmlFor="issue_date" className="text-gray-700">{copy.fields.issueDate}</Label>
            <Input id="issue_date" value={formData.issue_date || ""} onChange={handleChange} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="credential_id" className="text-gray-700">{copy.fields.credentialId}</Label>
            <Input id="credential_id" value={formData.credential_id || ""} onChange={handleChange} className="mt-1" />
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

export default CertificateForm;
