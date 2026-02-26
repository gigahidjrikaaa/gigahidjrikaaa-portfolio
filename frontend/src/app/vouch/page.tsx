"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { apiService, TestimonialSubmit } from "@/services/api";
import Link from "next/link";

// ─── Copy ─────────────────────────────────────────────────────────────────────

const copy = {
  badge: "Testimonial",
  heading: "Vouch for Gigahi",
  subheading:
    "We collaborated — now let the internet know about it. Your words help future collaborators understand what it's like to work with me.",
  namePlaceholder: "Ada Lovelace",
  nameLabel: "Your Name",
  roleLabel: "Your Role / Title",
  rolePlaceholder: "Software Engineer at Acme Co.",
  companyLabel: "Company (optional)",
  companyPlaceholder: "Acme Corporation",
  howWeWorkedLabel: "How did we work together?",
  howWeWorkedPlaceholder:
    "e.g. We built a real-time dashboard together for 3 months at Acme Co.",
  howWeWorkedHint:
    "A short note on the context — what project, company, or role.",
  ratingLabel: "How would you rate our collaboration?",
  testimonialLabel: "Your Testimonial",
  testimonialPlaceholder:
    "Working with Gigahi was... (tell it like you'd tell a friend)",
  testimonialHint: "Be honest, be specific. The best testimonials are stories.",
  linkedinLabel: "Your LinkedIn URL (optional)",
  linkedinPlaceholder: "https://linkedin.com/in/yourname",
  emailLabel: "Your Email",
  emailPlaceholder: "you@example.com",
  emailHint: "We'll send you a thank-you note once your testimonial goes live.",
  submit: "Submit Testimonial",
  submitting: "Sending...",
  successHeading: "Thank you! 🙌",
  successBody:
    "Your testimonial has been received. It'll show up on the site once reviewed — expect a confirmation email shortly.",
  backLink: "← Back to portfolio",
  shareHeading: "Know someone else who's worked with Gigahi?",
  shareBody: "Share this page with them!",
  copyLink: "Copy link",
  copied: "Copied!",
};

const CHAR_MAX = 2000;

const ratingLabels: Record<number, string> = {
  1: "Not great",
  2: "It was okay",
  3: "Good experience",
  4: "Really enjoyed it",
  5: "Absolutely stellar ✨",
};

// ─── Forms ────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  role: string;
  company: string;
  project_relation: string;
  rating: number;
  content: string;
  linkedin_url: string;
  submitter_email: string;
};

const initial: FormState = {
  name: "",
  role: "",
  company: "",
  project_relation: "",
  rating: 0,
  content: "",
  linkedin_url: "",
  submitter_email: "",
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Your name is required.";
  if (!form.role.trim()) errors.role = "Your role is required.";
  if (!form.content.trim() || form.content.trim().length < 10)
    errors.content = "Please write at least 10 characters.";
  if (!form.submitter_email.trim())
    errors.submitter_email = "Email is required so we can confirm receipt.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email))
    errors.submitter_email = "Please enter a valid email address.";
  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VouchPage() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = (field: keyof FormState, value: string | number) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const payload: TestimonialSubmit = {
        name: form.name.trim(),
        role: form.role.trim(),
        company: form.company.trim() || undefined,
        content: form.content.trim(),
        rating: form.rating || undefined,
        project_relation: form.project_relation.trim() || undefined,
        linkedin_url: form.linkedin_url.trim() || undefined,
        submitter_email: form.submitter_email.trim(),
      };
      await apiService.submitTestimonial(payload);
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5]">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-gray-900 pb-24 pt-12 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-gray-400 transition hover:text-white"
          >
            {copy.backLink}
          </Link>
          <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gray-300">
            {copy.badge}
          </span>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{copy.heading}</h1>
          <p className="mt-4 text-base text-gray-400 sm:text-lg">
            {copy.subheading}
          </p>
        </div>
      </header>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto -mt-16 max-w-2xl px-4 pb-20 sm:px-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success state ─────────────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:p-12"
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-4xl">
                  🙌
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                  {copy.successHeading}
                </h2>
                <p className="mt-3 text-base text-gray-500">{copy.successBody}</p>

                <div className="mt-10 w-full rounded-2xl bg-gray-50 p-6">
                  <p className="text-sm font-medium text-gray-700">{copy.shareHeading}</p>
                  <p className="mt-1 text-xs text-gray-500">{copy.shareBody}</p>
                  <button
                    onClick={handleCopyLink}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                  >
                    {copied ? copy.copied : copy.copyLink}
                  </button>
                </div>

                <Link
                  href="/"
                  className="mt-8 text-sm text-gray-400 underline transition hover:text-gray-700"
                >
                  {copy.backLink}
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ── Form ─────────────────────────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-3xl bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] sm:p-12"
            >
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Name + Role */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={copy.nameLabel} error={errors.name} required>
                    <input
                      type="text"
                      placeholder={copy.namePlaceholder}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputClass(!!errors.name)}
                      aria-required="true"
                    />
                  </Field>
                  <Field label={copy.roleLabel} error={errors.role} required>
                    <input
                      type="text"
                      placeholder={copy.rolePlaceholder}
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                      className={inputClass(!!errors.role)}
                      aria-required="true"
                    />
                  </Field>
                </div>

                {/* Company */}
                <Field label={copy.companyLabel}>
                  <input
                    type="text"
                    placeholder={copy.companyPlaceholder}
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>

                {/* How we worked together */}
                <Field
                  label={copy.howWeWorkedLabel}
                  hint={copy.howWeWorkedHint}
                >
                  <input
                    type="text"
                    placeholder={copy.howWeWorkedPlaceholder}
                    value={form.project_relation}
                    onChange={(e) => set("project_relation", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>

                {/* Star rating */}
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-gray-700">
                    {copy.ratingLabel}
                  </legend>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = star <= (hoveredStar || form.rating);
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => set("rating", star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          aria-label={`Rate ${star} stars`}
                          className="transition-transform hover:scale-110 focus-visible:outline-none"
                        >
                          {filled ? (
                            <StarIcon className="h-8 w-8 text-amber-400" />
                          ) : (
                            <StarOutlineIcon className="h-8 w-8 text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                    {(hoveredStar || form.rating) > 0 && (
                      <span className="ml-2 text-sm text-gray-500">
                        {ratingLabels[hoveredStar || form.rating]}
                      </span>
                    )}
                  </div>
                </fieldset>

                {/* Testimonial body */}
                <Field
                  label={copy.testimonialLabel}
                  hint={copy.testimonialHint}
                  error={errors.content}
                  required
                >
                  <div className="relative">
                    <textarea
                      placeholder={copy.testimonialPlaceholder}
                      value={form.content}
                      onChange={(e) => set("content", e.target.value)}
                      maxLength={CHAR_MAX}
                      rows={5}
                      className={`${inputClass(!!errors.content)} resize-none`}
                      aria-required="true"
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-gray-400">
                      {form.content.length}/{CHAR_MAX}
                    </span>
                  </div>
                </Field>

                {/* LinkedIn */}
                <Field label={copy.linkedinLabel}>
                  <input
                    type="url"
                    placeholder={copy.linkedinPlaceholder}
                    value={form.linkedin_url}
                    onChange={(e) => set("linkedin_url", e.target.value)}
                    className={inputClass(false)}
                  />
                </Field>

                {/* Email */}
                <Field
                  label={copy.emailLabel}
                  hint={copy.emailHint}
                  error={errors.submitter_email}
                  required
                >
                  <input
                    type="email"
                    placeholder={copy.emailPlaceholder}
                    value={form.submitter_email}
                    onChange={(e) => set("submitter_email", e.target.value)}
                    className={inputClass(!!errors.submitter_email)}
                    aria-required="true"
                  />
                </Field>

                {/* Server error */}
                {serverError && (
                  <p className="text-sm text-red-500" role="alert">
                    {serverError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-gray-900 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-gray-700 focus-visible:ring-2 focus-visible:ring-gray-900/40 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {loading ? copy.submitting : copy.submit}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400",
    "transition focus:outline-none focus:ring-2 focus:ring-gray-900/30",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500"
      : "border-gray-200 bg-white focus:border-gray-400",
  ].join(" ");
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
