"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminModal from "@/components/admin/AdminModal";
import { useToast } from "@/components/ui/toast";
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
  const { toast } = useToast();
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
    if (!formData.title) {
      toast({
        title: "Missing required fields",
        description: "Title is required to save a certificate.",
        variant: "error",
      });
      return;
    }
    onSave(formData);
  };

  return (
    <AdminModal
      title={certificate ? copy.editTitle : copy.addTitle}
      description="Add the credential URL for verification when possible."
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
            <Label htmlFor="issue_date" className="text-gray-700">{copy.fields.issueDate}</Label>
            <Input id="issue_date" type="date" value={formData.issue_date || ""} onChange={handleChange} className="mt-1" />
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
            {formData.image_url ? (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Image
                  src={formData.image_url}
                  alt="Certificate preview"
                  width={60}
                  height={60}
                  unoptimized
                  className="h-14 w-14 rounded-md object-cover"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">Image preview</p>
                  <p className="text-xs text-gray-500">Use clear, readable images.</p>
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

export default CertificateForm;
