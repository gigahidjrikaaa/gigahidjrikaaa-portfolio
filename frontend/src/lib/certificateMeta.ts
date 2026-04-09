export const CERTIFICATE_TYPE_OPTIONS = [
  {
    value: "professional",
    label: "Professional or License",
    description: "Industry and role-based credentials like PMP, Scrum, or vendor licenses.",
  },
  {
    value: "technical",
    label: "Technical or Cloud",
    description: "Platform, engineering, security, data, and software certifications.",
  },
  {
    value: "academic",
    label: "Academic",
    description: "University, school, or accredited institution certificate programs.",
  },
  {
    value: "language",
    label: "Language Proficiency",
    description: "Language tests such as IELTS, TOEFL, JLPT, HSK, or DELE.",
  },
  {
    value: "compliance",
    label: "Compliance or Safety",
    description: "Regulatory, governance, safety, and mandatory compliance credentials.",
  },
  {
    value: "workshop",
    label: "Workshop or Bootcamp",
    description: "Short-form intensive learning programs and practical workshops.",
  },
  {
    value: "other",
    label: "Other",
    description: "Use this when your credential does not fit standard categories.",
  },
] as const;

export type CertificateTypeValue = (typeof CERTIFICATE_TYPE_OPTIONS)[number]["value"];

export const CREDENTIAL_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "does_not_expire", label: "Does not expire" },
  { value: "in_progress", label: "In progress" },
  { value: "expired", label: "Expired" },
] as const;

export type CredentialStatusValue = (typeof CREDENTIAL_STATUS_OPTIONS)[number]["value"];

type CredentialStatusSource = {
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_status?: string | null;
};

export const CERTIFICATE_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  issuer: "Issuer",
  authority: "Authority",
  issue_date: "Issue date",
  expiry_date: "Expiry date",
  credential_status: "Credential status",
  credential_id: "Credential ID",
  credential_url: "Credential URL",
  specialization: "Specialization",
  level: "Level",
  result: "Result",
  learning_hours: "Learning hours",
  skills: "Skills",
  region: "Region",
  custom_type_label: "Custom type label",
  custom_details: "Custom details",
};

export const IMPORTANT_FIELD_KEYS_BY_TYPE: Record<CertificateTypeValue, string[]> = {
  professional: ["issuer", "authority", "credential_id", "credential_url", "expiry_date", "credential_status"],
  technical: ["issuer", "specialization", "level", "result", "learning_hours", "skills", "credential_url"],
  academic: ["issuer", "authority", "specialization", "level", "result", "issue_date"],
  language: ["issuer", "specialization", "level", "result", "credential_id", "expiry_date"],
  compliance: ["issuer", "authority", "region", "credential_id", "expiry_date", "credential_status"],
  workshop: ["issuer", "specialization", "learning_hours", "skills", "result", "credential_url"],
  other: ["custom_type_label", "custom_details", "issuer", "credential_id", "credential_url", "issue_date"],
};

const TYPE_BADGE_CLASSNAMES: Record<CertificateTypeValue, string> = {
  professional: "border-slate-300 bg-slate-100 text-slate-700",
  technical: "border-zinc-300 bg-zinc-100 text-zinc-700",
  academic: "border-blue-300 bg-blue-50 text-blue-700",
  language: "border-emerald-300 bg-emerald-50 text-emerald-700",
  compliance: "border-amber-300 bg-amber-50 text-amber-700",
  workshop: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700",
  other: "border-stone-300 bg-stone-100 text-stone-700",
};

const STATUS_BADGE_CLASSNAMES: Record<CredentialStatusValue, string> = {
  active: "border-emerald-300 bg-emerald-50 text-emerald-700",
  does_not_expire: "border-sky-300 bg-sky-50 text-sky-700",
  in_progress: "border-violet-300 bg-violet-50 text-violet-700",
  expired: "border-rose-300 bg-rose-50 text-rose-700",
};

export function getCertificateTypeMeta(type?: string) {
  return CERTIFICATE_TYPE_OPTIONS.find((item) => item.value === type) ?? CERTIFICATE_TYPE_OPTIONS[1];
}

export function getCertificateTypeLabel(type?: string, customTypeLabel?: string) {
  if (type === "other" && customTypeLabel) {
    return customTypeLabel;
  }
  return getCertificateTypeMeta(type).label;
}

export function getCertificateTypeBadgeClassName(type?: string) {
  const resolvedType = getCertificateTypeMeta(type).value;
  return TYPE_BADGE_CLASSNAMES[resolvedType];
}

export function getCredentialStatusLabel(status?: string) {
  return CREDENTIAL_STATUS_OPTIONS.find((item) => item.value === status)?.label;
}

export function getCredentialStatusBadgeClassName(status?: string) {
  if (!status) {
    return "border-slate-300 bg-slate-100 text-slate-700";
  }
  return STATUS_BADGE_CLASSNAMES[status as CredentialStatusValue] || "border-slate-300 bg-slate-100 text-slate-700";
}

export function getImportantFieldLabels(type?: string) {
  const resolvedType = getCertificateTypeMeta(type).value;
  const fieldKeys = IMPORTANT_FIELD_KEYS_BY_TYPE[resolvedType];
  return fieldKeys.map((key) => CERTIFICATE_FIELD_LABELS[key] ?? key);
}

function parseDateOnly(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isKnownCredentialStatus(value?: string | null): value is CredentialStatusValue {
  return CREDENTIAL_STATUS_OPTIONS.some((option) => option.value === value);
}

export function deriveCredentialStatus(source: CredentialStatusSource): CredentialStatusValue {
  const today = getTodayStart();
  const issueDate = parseDateOnly(source.issue_date);
  const expiryDate = parseDateOnly(source.expiry_date);

  if (issueDate && issueDate > today) {
    return "in_progress";
  }

  if (expiryDate) {
    return expiryDate < today ? "expired" : "active";
  }

  if (isKnownCredentialStatus(source.credential_status)) {
    return source.credential_status;
  }

  return "does_not_expire";
}

export function getDaysUntilExpiry(expiryDate?: string | null): number | null {
  const parsed = parseDateOnly(expiryDate);
  if (!parsed) {
    return null;
  }

  const today = getTodayStart();
  const diffInMilliseconds = parsed.getTime() - today.getTime();
  return Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
}
