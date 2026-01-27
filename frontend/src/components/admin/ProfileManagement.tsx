"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi, ProfileResponse, ProfileUpdate } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

const copy = {
  title: "Profile details",
  subtitle: "These fields power the landing page (Hero / About).",
  tabs: {
    quick: "Quick start",
    identity: "Identity",
    about: "About",
    links: "Links",
    preview: "Preview",
  },
  sections: {
    suggestions: "Suggestions",
    required: "Basics",
  },
  importTitle: "Import from LinkedIn PDF",
  importHint: "Upload a LinkedIn Resume PDF to auto-fill the form.",
  importHint2:
    "Tip: If the PDF is scanned (no selectable text), you’ll need OCR first.",
  importButton: "Import PDF",
  importing: "Importing...",
  save: "Save profile",
  saving: "Saving...",
  clear: "Clear",
  loading: "Loading profile...",
  success: "Profile updated successfully.",
  error: "Failed to update profile. Please try again.",
  importError: "Failed to import the PDF.",
  invalidUrl: "Please enter a valid URL.",
  toggles: {
    enableAvatar: "Enable avatar",
    enableResume: "Enable resume link",
  },
  hints: {
    avatar:
      "Use an absolute URL (e.g. GitHub, Cloudinary, LinkedIn). Leave disabled to hide.",
    resume:
      "Link to your resume PDF or portfolio page. Leave disabled to hide.",
    availability:
      "Pick a preset for consistency, or choose Custom to type your own.",
    location:
      "Pick a suggestion to auto-fill, or type any location you want.",
  },
  fields: {
    full_name: "Full name",
    headline: "Headline",
    bio: "Bio",
    location: "Location",
    availability: "Availability",
    avatar_url: "Avatar URL",
    resume_url: "Resume URL",
  },
  placeholders: {
    full_name: "Your full name",
    headline: "Short professional headline",
    bio: "Short bio or summary",
    location: "City, Country",
    availability: "Open for freelance, full-time, etc.",
    avatar_url: "https://...",
    resume_url: "https://...",
  },
  preview: {
    title: "Landing preview",
    hint: "This is a quick preview of how the profile may appear on the site.",
    noAvatar: "No avatar",
    viewResume: "View resume",
    emptyName: "Your name",
    emptyHeadline: "Your headline",
    emptyBio: "Your bio",
  },
  ui: {
    chooseSuggestion: "Choose a suggestion",
    suggestionsHint: "Use presets and toggles to reduce typing.",
  },
};

const profileSchema = z.object({
  full_name: z.string().max(200).optional().or(z.literal("")),
  headline: z.string().max(200).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  availability: z.string().max(200).optional().or(z.literal("")),
  avatar_url: z.string().url(copy.invalidUrl).optional().or(z.literal("")),
  resume_url: z.string().url(copy.invalidUrl).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const normalizeField = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const normalizePayload = (values: ProfileFormValues): ProfileUpdate => ({
  full_name: normalizeField(values.full_name),
  headline: normalizeField(values.headline),
  bio: normalizeField(values.bio),
  location: normalizeField(values.location),
  availability: normalizeField(values.availability),
  avatar_url: normalizeField(values.avatar_url),
  resume_url: normalizeField(values.resume_url),
});

const toFormValues = (profile: ProfileResponse): ProfileFormValues => ({
  full_name: profile.full_name ?? "",
  headline: profile.headline ?? "",
  bio: profile.bio ?? "",
  location: profile.location ?? "",
  availability: profile.availability ?? "",
  avatar_url: profile.avatar_url ?? "",
  resume_url: profile.resume_url ?? "",
});

type AvailabilityPresetId = "open" | "freelance" | "collab" | "unavailable" | "custom";

const availabilityPresets: Array<{
  id: AvailabilityPresetId;
  label: string;
  value?: string;
  description: string;
}> = [
  {
    id: "open",
    label: "Open to opportunities",
    value: "Open to opportunities",
    description: "Best default if you’re actively looking.",
  },
  {
    id: "freelance",
    label: "Available for freelance",
    value: "Available for freelance",
    description: "Great for short-term or contract work.",
  },
  {
    id: "collab",
    label: "Open to collaboration",
    value: "Open to collaboration",
    description: "Nice for open-source and side projects.",
  },
  {
    id: "unavailable",
    label: "Not currently available",
    value: "Not currently available",
    description: "Signals you’re heads-down right now.",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Type any availability text you want.",
  },
];

const locationSuggestions = [
  "Remote",
  "Jakarta, Indonesia",
  "Bandung, Indonesia",
  "Surabaya, Indonesia",
  "Yogyakarta, Indonesia",
  "Singapore",
  "Kuala Lumpur, Malaysia",
];

const matchAvailabilityPreset = (availability: string): AvailabilityPresetId => {
  const normalized = availability.trim();
  if (!normalized) return "custom";
  const match = availabilityPresets.find((p) => p.value === normalized);
  return match?.id ?? "custom";
};

const ProfileManagement = () => {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "error">("idle");
  const [importError, setImportError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [avatarEnabled, setAvatarEnabled] = useState(true);
  const [resumeEnabled, setResumeEnabled] = useState(true);
  const [availabilityPreset, setAvailabilityPreset] = useState<AvailabilityPresetId>("custom");

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      full_name: "",
      headline: "",
      bio: "",
      location: "",
      availability: "",
      avatar_url: "",
      resume_url: "",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    control,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onBlur",
  });

  const avatarUrl = watch("avatar_url");
  const resumeUrl = watch("resume_url");
  const availability = watch("availability");
  const fullName = watch("full_name");
  const headline = watch("headline");
  const bio = watch("bio");
  const location = watch("location");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await adminApi.getProfile();
        const values = toFormValues(profile);
        reset(values);
        setAvatarEnabled(Boolean(values.avatar_url?.trim()));
        setResumeEnabled(Boolean(values.resume_url?.trim()));
        setAvailabilityPreset(matchAvailabilityPreset(values.availability ?? ""));
      } catch {
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    setStatus("idle");
    try {
      await adminApi.updateProfile(normalizePayload(values));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleImportPdf = async () => {
    if (!pdfFile) return;
    setImportStatus("loading");
    setImportError(null);
    try {
      const result = await adminApi.importProfileFromLinkedInPdf(pdfFile);
      reset((current) => ({
        ...current,
        ...{
          full_name: result.profile.full_name ?? current.full_name,
          headline: result.profile.headline ?? current.headline,
          bio: result.profile.bio ?? current.bio,
          location: result.profile.location ?? current.location,
          availability: result.profile.availability ?? current.availability,
          avatar_url: result.profile.avatar_url ?? current.avatar_url,
          resume_url: result.profile.resume_url ?? current.resume_url,
        },
      }));
      setAvatarEnabled(Boolean((result.profile.avatar_url ?? avatarUrl)?.trim()));
      setResumeEnabled(Boolean((result.profile.resume_url ?? resumeUrl)?.trim()));
      setAvailabilityPreset(
        matchAvailabilityPreset(
          (result.profile.availability ?? availability ?? "").toString()
        )
      );
      setImportStatus("idle");
    } catch (e) {
      const message = e instanceof Error ? e.message : copy.importError;
      setImportError(message || copy.importError);
      setImportStatus("error");
    }
  };

  const applyAvailabilityPreset = (id: AvailabilityPresetId) => {
    setAvailabilityPreset(id);
    const preset = availabilityPresets.find((p) => p.id === id);
    if (preset?.value) {
      setValue("availability", preset.value, { shouldDirty: true, shouldTouch: true });
    }
  };

  const handleAvatarEnabledChange = (next: boolean) => {
    setAvatarEnabled(next);
    if (!next) {
      setValue("avatar_url", "", { shouldDirty: true, shouldTouch: true });
    }
  };

  const handleResumeEnabledChange = (next: boolean) => {
    setResumeEnabled(next);
    if (!next) {
      setValue("resume_url", "", { shouldDirty: true, shouldTouch: true });
    }
  };

  const handleClearAll = () => {
    reset(defaultValues);
    setStatus("idle");
    setImportError(null);
    setPdfFile(null);
    setAvatarEnabled(false);
    setResumeEnabled(false);
    setAvailabilityPreset("custom");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {loading ? (
            <LoadingAnimation label={copy.loading} size="sm" />
          ) : (
            <Tabs defaultValue="quick" className="gap-4">
              <TabsList className="w-full">
                <TabsTrigger value="quick">{copy.tabs.quick}</TabsTrigger>
                <TabsTrigger value="identity">{copy.tabs.identity}</TabsTrigger>
                <TabsTrigger value="about">{copy.tabs.about}</TabsTrigger>
                <TabsTrigger value="links">{copy.tabs.links}</TabsTrigger>
                <TabsTrigger value="preview">{copy.tabs.preview}</TabsTrigger>
              </TabsList>

              <TabsContent value="quick" className="grid gap-6">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold">{copy.importTitle}</h3>
                    <p className="text-xs text-muted-foreground">{copy.importHint}</p>
                    <p className="text-xs text-muted-foreground">{copy.importHint2}</p>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                      className="w-full text-sm"
                      aria-label={copy.importTitle}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!pdfFile || importStatus === "loading"}
                      onClick={handleImportPdf}
                    >
                      {importStatus === "loading" ? copy.importing : copy.importButton}
                    </Button>
                  </div>

                  {importError ? (
                    <p className="mt-2 text-xs text-destructive" role="alert">
                      {importError}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                  <div className="text-sm">
                    <div className="font-medium">{copy.sections.suggestions}</div>
                    <div className="text-xs text-muted-foreground">
                      {copy.ui.suggestionsHint}
                    </div>
                  </div>

                  <Button type="button" variant="ghost" onClick={handleClearAll}>
                    {copy.clear}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="identity" className="grid gap-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">{copy.fields.full_name}</Label>
                    <Input
                      id="full_name"
                      placeholder={copy.placeholders.full_name}
                      {...register("full_name")}
                      aria-invalid={Boolean(errors.full_name)}
                    />
                    {errors.full_name ? (
                      <p className="text-xs text-destructive">{errors.full_name.message}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="headline">{copy.fields.headline}</Label>
                    <Input
                      id="headline"
                      placeholder={copy.placeholders.headline}
                      {...register("headline")}
                      aria-invalid={Boolean(errors.headline)}
                    />
                    {errors.headline ? (
                      <p className="text-xs text-destructive">{errors.headline.message}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>{copy.fields.location}</Label>
                      <div className="grid gap-2">
                        <Select
                          onValueChange={(value) =>
                            setValue("location", value, {
                              shouldDirty: true,
                              shouldTouch: true,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={copy.ui.chooseSuggestion} />
                          </SelectTrigger>
                          <SelectContent>
                            {locationSuggestions.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          id="location"
                          placeholder={copy.placeholders.location}
                          {...register("location")}
                          aria-invalid={Boolean(errors.location)}
                        />
                        <p className="text-xs text-muted-foreground">{copy.hints.location}</p>
                      </div>
                      {errors.location ? (
                        <p className="text-xs text-destructive">{errors.location.message}</p>
                      ) : null}
                    </div>

                    <div className="grid gap-2">
                      <Label>{copy.fields.availability}</Label>
                      <p className="text-xs text-muted-foreground">{copy.hints.availability}</p>
                      <Controller
                        control={control}
                        name="availability"
                        render={({ field }) => (
                          <div className="grid gap-3">
                            <RadioGroup
                              value={availabilityPreset}
                              onValueChange={(v) =>
                                applyAvailabilityPreset(v as AvailabilityPresetId)
                              }
                            >
                              {availabilityPresets.map((preset) => (
                                <div
                                  key={preset.id}
                                  className="flex items-start gap-3 rounded-md border p-3"
                                >
                                  <RadioGroupItem value={preset.id} id={`availability-${preset.id}`} />
                                  <div className="grid gap-0.5">
                                    <Label
                                      htmlFor={`availability-${preset.id}`}
                                      className="cursor-pointer"
                                    >
                                      {preset.label}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                      {preset.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </RadioGroup>

                            {availabilityPreset === "custom" ? (
                              <div className="grid gap-2">
                                <Input
                                  id="availability"
                                  placeholder={copy.placeholders.availability}
                                  value={field.value ?? ""}
                                  onChange={field.onChange}
                                  onBlur={field.onBlur}
                                  aria-invalid={Boolean(errors.availability)}
                                />
                              </div>
                            ) : null}
                          </div>
                        )}
                      />
                      {errors.availability ? (
                        <p className="text-xs text-destructive">{errors.availability.message}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="about" className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="bio">{copy.fields.bio}</Label>
                  <Textarea
                    id="bio"
                    rows={7}
                    placeholder={copy.placeholders.bio}
                    {...register("bio")}
                    aria-invalid={Boolean(errors.bio)}
                  />
                  {errors.bio ? (
                    <p className="text-xs text-destructive">{errors.bio.message}</p>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="links" className="grid gap-6">
                <div className="grid gap-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <div className="text-sm font-medium">{copy.fields.avatar_url}</div>
                        <p className="text-xs text-muted-foreground">{copy.hints.avatar}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="avatar-enabled" className="text-sm">
                          {copy.toggles.enableAvatar}
                        </Label>
                        <Switch
                          id="avatar-enabled"
                          checked={avatarEnabled}
                          onCheckedChange={handleAvatarEnabledChange}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <Input
                        id="avatar_url"
                        placeholder={copy.placeholders.avatar_url}
                        disabled={!avatarEnabled}
                        {...register("avatar_url")}
                        aria-invalid={Boolean(errors.avatar_url)}
                      />
                      {errors.avatar_url ? (
                        <p className="text-xs text-destructive">{errors.avatar_url.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-1">
                        <div className="text-sm font-medium">{copy.fields.resume_url}</div>
                        <p className="text-xs text-muted-foreground">{copy.hints.resume}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="resume-enabled" className="text-sm">
                          {copy.toggles.enableResume}
                        </Label>
                        <Switch
                          id="resume-enabled"
                          checked={resumeEnabled}
                          onCheckedChange={handleResumeEnabledChange}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2">
                      <Input
                        id="resume_url"
                        placeholder={copy.placeholders.resume_url}
                        disabled={!resumeEnabled}
                        {...register("resume_url")}
                        aria-invalid={Boolean(errors.resume_url)}
                      />
                      {errors.resume_url ? (
                        <p className="text-xs text-destructive">{errors.resume_url.message}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="grid gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold">{copy.preview.title}</div>
                    <p className="text-xs text-muted-foreground">{copy.preview.hint}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
                    <div className="shrink-0">
                      {avatarEnabled && avatarUrl?.trim() ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt={fullName?.trim() || copy.preview.emptyName}
                          className="h-20 w-20 rounded-full border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-muted text-xs text-muted-foreground">
                          {copy.preview.noAvatar}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-1">
                      <div className="text-lg font-semibold">
                        {fullName?.trim() || copy.preview.emptyName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {headline?.trim() || copy.preview.emptyHeadline}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {location?.trim() ? <span>{location.trim()}</span> : null}
                        {availability?.trim() ? <span>{availability.trim()}</span> : null}
                      </div>
                      <div className="mt-3 max-w-prose text-sm">
                        {bio?.trim() || copy.preview.emptyBio}
                      </div>

                      {resumeEnabled && resumeUrl?.trim() ? (
                        <div className="mt-3">
                          <a
                            className="text-sm text-primary underline underline-offset-4"
                            href={resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {copy.preview.viewResume}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>

        <CardFooter className="border-t justify-between gap-4">
          <div aria-live="polite" className="text-sm">
            {status === "success" ? (
              <span className="text-emerald-600">{copy.success}</span>
            ) : null}
            {status === "error" ? <span className="text-destructive">{copy.error}</span> : null}
          </div>

          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? copy.saving : copy.save}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ProfileManagement;
