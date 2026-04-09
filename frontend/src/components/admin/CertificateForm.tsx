"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  ClipboardCheck,
  Cpu,
  GraduationCap,
  Languages,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminModal from "@/components/admin/AdminModal";
import ImageMediaField from "@/components/admin/ImageMediaField";
import { useToast } from "@/components/ui/toast";
import { CertificateBase, CertificateResponse } from "@/services/api";
import {
  CERTIFICATE_TYPE_OPTIONS,
  CREDENTIAL_STATUS_OPTIONS,
  deriveCredentialStatus,
  getCertificateTypeMeta,
  getCredentialStatusLabel,
  getImportantFieldLabels,
  type CertificateTypeValue,
} from "@/lib/certificateMeta";

const copy = {
  addTitle: "Add Certificate",
  editTitle: "Edit Certificate",
  description:
    "Choose a certificate type first. The form reveals the most important fields for that credential category.",
  sections: {
    type: "Certificate Type",
    core: "Core Credential Details",
    specific: "Type-Specific Details",
    media: "Certificate Visual",
    summary: "Context and Notes",
  },
  fields: {
    title: "Title",
    certificateType: "Certificate Type",
    customTypeLabel: "Custom Type Label",
    issuer: "Issuer",
    authority: "Authority",
    issueDate: "Issue Date",
    expiryDate: "Expiry Date",
    credentialStatus: "Credential Status",
    credentialId: "Credential ID",
    credentialUrl: "Credential URL",
    specialization: "Specialization",
    level: "Level",
    result: "Result",
    learningHours: "Learning Hours",
    skills: "Skills",
    region: "Region",
    customDetails: "Custom Details",
    imageUrl: "Image URL",
    description: "Description",
  },
  actions: {
    cancel: "Cancel",
    save: "Save Certificate",
  },
  hints: {
    statusAuto:
      "Auto mode derives status from dates: future issue date = In progress, past expiry = Expired, future expiry = Active, no expiry = Does not expire.",
  },
  toggles: {
    toManual: "Switch to manual",
    toAuto: "Use auto status",
  },
  placeholders: {
    title: "e.g., AWS Certified Solutions Architect - Associate",
    issuer: "e.g., Amazon Web Services",
    authority: "e.g., PMI, ISACA, Government Agency",
    credentialId: "e.g., ABCD-1234",
    credentialUrl: "https://...",
    specialization: "e.g., Cloud Architecture, Data Analytics, Information Security",
    level: "e.g., Associate, Professional, CEFR B2",
    result: "e.g., Passed, 92%, Grade A, Band 8.0",
    skills: "e.g., AWS, Terraform, Networking",
    region: "e.g., Global, Indonesia, EU",
    customTypeLabel: "e.g., Internal Corporate Credential",
    customDetails: "Add any fields that do not fit standard certificates.",
    description: "Highlight practical outcomes, projects, or capability gained.",
  },
};

const TYPE_ICONS: Record<CertificateTypeValue, LucideIcon> = {
  professional: Award,
  technical: Cpu,
  academic: GraduationCap,
  language: Languages,
  compliance: ShieldCheck,
  workshop: ClipboardCheck,
  other: Sparkles,
};

type DynamicFieldKey =
  | "custom_type_label"
  | "specialization"
  | "level"
  | "result"
  | "learning_hours"
  | "skills"
  | "region"
  | "credential_status"
  | "expiry_date"
  | "custom_details";

const DYNAMIC_FIELDS_BY_TYPE: Record<CertificateTypeValue, DynamicFieldKey[]> = {
  professional: ["specialization", "level", "credential_status", "expiry_date", "region", "skills"],
  technical: ["specialization", "level", "result", "learning_hours", "skills", "credential_status"],
  academic: ["specialization", "level", "result", "skills"],
  language: ["specialization", "level", "result", "credential_status", "expiry_date"],
  compliance: ["region", "credential_status", "expiry_date", "result", "skills"],
  workshop: ["specialization", "learning_hours", "result", "skills"],
  other: [
    "custom_type_label",
    "custom_details",
    "specialization",
    "level",
    "result",
    "learning_hours",
    "skills",
    "region",
    "credential_status",
    "expiry_date",
  ],
};

const DEFAULT_FORM_DATA: CertificateBase = {
  title: "",
  certificate_type: "technical",
  custom_type_label: "",
  issuer: "",
  authority: "",
  issue_date: "",
  expiry_date: "",
  credential_status: "active",
  credential_id: "",
  credential_url: "",
  specialization: "",
  level: "",
  result: "",
  learning_hours: undefined,
  skills: "",
  region: "",
  custom_details: "",
  image_url: "",
  description: "",
  display_order: 0,
};

interface CertificateFormProps {
  certificate?: CertificateResponse | null;
  onSave: (certificate: CertificateBase) => void;
  onCancel: () => void;
}

const CertificateForm: React.FC<CertificateFormProps> = ({ certificate, onSave, onCancel }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CertificateBase>(DEFAULT_FORM_DATA);
  const [statusMode, setStatusMode] = useState<"auto" | "manual">("auto");

  useEffect(() => {
    if (certificate) {
      const nextData: CertificateBase = {
        title: certificate.title || "",
        certificate_type: certificate.certificate_type || "technical",
        custom_type_label: certificate.custom_type_label || "",
        issuer: certificate.issuer || "",
        authority: certificate.authority || "",
        issue_date: certificate.issue_date || "",
        expiry_date: certificate.expiry_date || "",
        credential_status: certificate.credential_status || "active",
        credential_id: certificate.credential_id || "",
        credential_url: certificate.credential_url || "",
        specialization: certificate.specialization || "",
        level: certificate.level || "",
        result: certificate.result || "",
        learning_hours: certificate.learning_hours,
        skills: certificate.skills || "",
        region: certificate.region || "",
        custom_details: certificate.custom_details || "",
        image_url: certificate.image_url || "",
        description: certificate.description || "",
        display_order: certificate.display_order || 0,
      };

      setFormData(nextData);

      const derivedStatus = deriveCredentialStatus(nextData);
      const hasManualStatus =
        Boolean(certificate.credential_status) && certificate.credential_status !== derivedStatus;
      setStatusMode(hasManualStatus ? "manual" : "auto");
    } else {
      setFormData(DEFAULT_FORM_DATA);
      setStatusMode("auto");
    }
  }, [certificate]);

  const autoStatus = useMemo(
    () =>
      deriveCredentialStatus({
        issue_date: formData.issue_date,
        expiry_date: formData.expiry_date,
      }),
    [formData.issue_date, formData.expiry_date]
  );

  useEffect(() => {
    if (statusMode !== "auto") {
      return;
    }

    setFormData((prev) => {
      if (prev.credential_status === autoStatus) {
        return prev;
      }

      return {
        ...prev,
        credential_status: autoStatus,
      };
    });
  }, [autoStatus, statusMode]);

  const certificateTypeMeta = getCertificateTypeMeta(formData.certificate_type);
  const importantFieldLabels = useMemo(
    () => getImportantFieldLabels(formData.certificate_type),
    [formData.certificate_type]
  );
  const dynamicFields = useMemo(() => {
    const type = certificateTypeMeta.value;
    return DYNAMIC_FIELDS_BY_TYPE[type] || DYNAMIC_FIELDS_BY_TYPE.other;
  }, [certificateTypeMeta.value]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;

    let nextValue: string | number | undefined = value;
    if (id === "learning_hours") {
      nextValue = value === "" ? undefined : Number(value);
    } else if (type === "number") {
      nextValue = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [id]: nextValue,
    }));

    if (id === "credential_status") {
      setStatusMode("manual");
    }
  };

  const handleTypeSelection = (type: CertificateTypeValue) => {
    setFormData((prev) => ({
      ...prev,
      certificate_type: type,
      custom_type_label: type === "other" ? prev.custom_type_label : "",
    }));
  };

  const renderDynamicField = (field: DynamicFieldKey) => {
    if (field === "custom_details") {
      return (
        <div key={field} className="sm:col-span-2">
          <Label htmlFor={field} className="text-gray-700">
            {copy.fields.customDetails}
          </Label>
          <Textarea
            id={field}
            value={formData.custom_details || ""}
            onChange={handleChange}
            rows={4}
            className="mt-1"
            placeholder={copy.placeholders.customDetails}
          />
        </div>
      );
    }

    if (field === "credential_status") {
      return (
        <div key={field} className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={field} className="text-gray-700">
              {copy.fields.credentialStatus}
            </Label>
            <button
              type="button"
              onClick={() => setStatusMode((prev) => (prev === "auto" ? "manual" : "auto"))}
              className="text-xs font-semibold text-slate-600 underline-offset-2 transition hover:text-slate-900 hover:underline"
            >
              {statusMode === "auto" ? copy.toggles.toManual : copy.toggles.toAuto}
            </button>
          </div>
          <select
            id={field}
            value={statusMode === "auto" ? autoStatus : formData.credential_status || ""}
            onChange={handleChange}
            disabled={statusMode === "auto"}
            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-sm focus:border-gray-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">Select status</option>
            {CREDENTIAL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {statusMode === "auto"
              ? `Auto status: ${getCredentialStatusLabel(autoStatus)}. ${copy.hints.statusAuto}`
              : "Manual mode enabled. Status will not be changed automatically."}
          </p>
        </div>
      );
    }

    if (field === "skills") {
      return (
        <div key={field} className="sm:col-span-2">
          <Label htmlFor={field} className="text-gray-700">
            {copy.fields.skills}
          </Label>
          <Input
            id={field}
            value={formData.skills || ""}
            onChange={handleChange}
            className="mt-1"
            placeholder={copy.placeholders.skills}
          />
        </div>
      );
    }

    const isNumberField = field === "learning_hours";
    const fieldLabelMap: Record<Exclude<DynamicFieldKey, "credential_status" | "custom_details" | "skills" | "expiry_date">, string> = {
      custom_type_label: copy.fields.customTypeLabel,
      specialization: copy.fields.specialization,
      level: copy.fields.level,
      result: copy.fields.result,
      learning_hours: copy.fields.learningHours,
      region: copy.fields.region,
    };

    const fieldPlaceholderMap: Record<Exclude<DynamicFieldKey, "credential_status" | "custom_details" | "skills" | "expiry_date">, string> = {
      custom_type_label: copy.placeholders.customTypeLabel,
      specialization: copy.placeholders.specialization,
      level: copy.placeholders.level,
      result: copy.placeholders.result,
      learning_hours: "e.g., 40",
      region: copy.placeholders.region,
    };

    const value = formData[field];

    return (
      <div key={field}>
        <Label htmlFor={field} className="text-gray-700">
          {fieldLabelMap[field as keyof typeof fieldLabelMap]}
        </Label>
        <Input
          id={field}
          type={isNumberField ? "number" : "text"}
          value={typeof value === "number" ? value : value || ""}
          onChange={handleChange}
          className="mt-1"
          min={isNumberField ? 0 : undefined}
          placeholder={fieldPlaceholderMap[field as keyof typeof fieldPlaceholderMap]}
        />
      </div>
    );
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

    if (formData.certificate_type === "other" && !formData.custom_type_label) {
      toast({
        title: "Missing custom type label",
        description: "Please add a short name for your custom certificate type.",
        variant: "error",
      });
      return;
    }

    const payload: CertificateBase = {
      ...formData,
      credential_status:
        statusMode === "auto"
          ? autoStatus
          : formData.credential_status || autoStatus,
    };

    onSave(payload);
  };

  return (
    <AdminModal
      title={certificate ? copy.editTitle : copy.addTitle}
      description={copy.description}
      onClose={onCancel}
      maxWidthClass="max-w-5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{copy.sections.type}</p>
              <p className="mt-1 text-sm text-slate-600">
                Most common credential groups and their important fields.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full border-slate-300 bg-white text-slate-700">
              {copy.fields.certificateType}: {certificateTypeMeta.label}
            </Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {CERTIFICATE_TYPE_OPTIONS.map((option) => {
              const Icon = TYPE_ICONS[option.value];
              const selected = option.value === certificateTypeMeta.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleTypeSelection(option.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-slate-900 bg-slate-900 text-white shadow-md"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <p className="text-sm font-semibold">{option.label}</p>
                  </div>
                  <p className={`mt-1 text-xs ${selected ? "text-slate-200" : "text-slate-500"}`}>
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Most Important Fields</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {importantFieldLabels.map((label) => (
                <Badge key={label} variant="secondary" className="rounded-full">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{copy.sections.core}</p>
          </div>

          <div>
            <Label htmlFor="title" className="text-gray-700">{copy.fields.title} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder={copy.placeholders.title}
            />
          </div>

          <div>
            <Label htmlFor="issuer" className="text-gray-700">{copy.fields.issuer}</Label>
            <Input
              id="issuer"
              value={formData.issuer || ""}
              onChange={handleChange}
              className="mt-1"
              placeholder={copy.placeholders.issuer}
            />
          </div>

          <div>
            <Label htmlFor="authority" className="text-gray-700">{copy.fields.authority}</Label>
            <Input
              id="authority"
              value={formData.authority || ""}
              onChange={handleChange}
              className="mt-1"
              placeholder={copy.placeholders.authority}
            />
          </div>

          <div>
            <Label htmlFor="issue_date" className="text-gray-700">{copy.fields.issueDate}</Label>
            <Input id="issue_date" type="date" value={formData.issue_date || ""} onChange={handleChange} className="mt-1" />
          </div>

          <div>
            <Label htmlFor="credential_id" className="text-gray-700">{copy.fields.credentialId}</Label>
            <Input
              id="credential_id"
              value={formData.credential_id || ""}
              onChange={handleChange}
              className="mt-1"
              placeholder={copy.placeholders.credentialId}
            />
          </div>

          <div>
            <Label htmlFor="credential_url" className="text-gray-700">{copy.fields.credentialUrl}</Label>
            <Input
              id="credential_url"
              value={formData.credential_url || ""}
              onChange={handleChange}
              className="mt-1"
              placeholder={copy.placeholders.credentialUrl}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{copy.sections.specific}</p>
          </div>

          {dynamicFields.map((field) => {
            if (field === "expiry_date") {
              return (
                <div key={field}>
                  <Label htmlFor="expiry_date" className="text-gray-700">
                    {copy.fields.expiryDate}
                  </Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date || ""}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              );
            }

            return renderDynamicField(field);
          })}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{copy.sections.media}</p>

          <ImageMediaField
            id="image_url"
            label={copy.fields.imageUrl}
            value={formData.image_url || ""}
            onChange={(nextValue) => setFormData((prev) => ({ ...prev, image_url: nextValue }))}
            previewAlt="Certificate preview"
            uploadFolder="certificates"
            previewHint="Use clear, readable images."
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{copy.sections.summary}</p>

          <div>
            <Label htmlFor="description" className="text-gray-700">{copy.fields.description}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              className="mt-1"
              placeholder={copy.placeholders.description}
            />
          </div>
        </section>

          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>{copy.actions.cancel}</Button>
            <Button type="submit">{copy.actions.save}</Button>
          </div>
      </form>
    </AdminModal>
  );
};

export default CertificateForm;
