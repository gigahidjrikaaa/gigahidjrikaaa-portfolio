"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { apiService, TestimonialSubmit } from "@/services/api";
import Link from "next/link";
import Image from "next/image";

// ─── Constants & Copy ─────────────────────────────────────────────────────────

const copy = {
  badge: "Testimonial",
  heading: "Vouch for Giga.",
  subheading:
    "We've collaborated—now let the internet know. Your words help future partners understand what it's like to build together.",
  namePlaceholder: "Ada Lovelace",
  nameLabel: "Your Name",
  roleLabel: "Your Role / Title",
  rolePlaceholder: "Software Engineer",
  companyLabel: "Company (optional)",
  companyPlaceholder: "Acme Corp",
  howWeWorkedLabel: "How did we work together?",
  howWeWorkedPlaceholder: "e.g. We built a real-time dashboard...",
  howWeWorkedHint: "A short note on the context—project, company, or role.",
  ratingLabel: "How would you rate our collaboration?",
  testimonialLabel: "Your Testimonial",
  testimonialPlaceholder: "Working with Giga was... (tell it like you'd tell a friend)",
  testimonialHint: "Be honest, be specific. The best testimonials are stories.",
  linkedinLabel: "Your LinkedIn URL (optional)",
  linkedinPlaceholder: "https://linkedin.com/in/...",
  emailLabel: "Your Email",
  emailPlaceholder: "you@example.com",
  emailHint: "For confirmation when your testimonial goes live.",
  submit: "Submit Testimonial",
  submitting: "Sending...",
  successHeading: "Thank you.",
  successBody: "Your words mean a lot. I'll review your testimonial shortly. Expect a confirmation email when it's live.",
  backLink: "Back to portfolio",
  shareHeading: "Know someone else who's worked with me?",
  shareBody: "Share this page with them.",
  copyLink: "Copy link",
  copied: "Copied!",
};

const CHAR_MAX = 2000;

const ratingLabels: Record<number, string> = {
  1: "Not great",
  2: "It was okay",
  3: "Good experience",
  4: "Really enjoyed it",
  5: "Absolutely stellar",
};

// ─── Form State ───────────────────────────────────────────────────────────────

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
    errors.submitter_email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitter_email))
    errors.submitter_email = "Please enter a valid email address.";
  return errors;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

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
      
      const firstErrorKey = Object.keys(errs)[0];
      const element = document.getElementById(`field-${firstErrorKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
      setTimeout(() => setSubmitted(true), 400); // Slight delay for perceived performance
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
    <main className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-gray-900 selection:bg-gray-900 selection:text-white md:flex-row">
      
      {/* ── Left Sidebar (Sticky Context) ─────────────────────────────────── */}
      <motion.div 
        className="flex w-full flex-col justify-between border-b border-gray-200 bg-white p-8 md:sticky md:top-0 md:h-screen md:w-2/5 md:border-b-0 md:border-r md:p-12 lg:p-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <Link
            href="/"
            className="group mb-12 inline-flex items-center text-xs font-semibold uppercase tracking-widest text-gray-400 transition hover:text-gray-900"
          >
            <span className="mr-2 inline-block transition-transform group-hover:-translate-x-1">←</span>
            {copy.backLink}
          </Link>
          

          <motion.div variants={fadeUp} className="mb-8">
            <Image 
              src="/giga-pics/giga-5.jpg" 
              alt="Giga" 
              width={96} 
              height={96} 
              priority
              className="rounded-full object-cover shadow-sm ring-1 ring-gray-200"
            />
          </motion.div>

          <h1 className="text-4xl font-light tracking-tighter text-gray-900 sm:text-5xl lg:text-6xl xl:text-7xl">
            {copy.heading}
          </h1>
          <p className="mt-8 max-w-sm text-lg leading-relaxed text-gray-500">
            {copy.subheading}
          </p>
        </div>

        <div className="hidden pb-4 text-xs font-medium uppercase tracking-widest text-gray-300 md:block">
          <p>© {new Date().getFullYear()} Gigahi. All rights reserved.</p>
        </div>
      </motion.div>

      {/* ── Right Content (Scrollable Form) ──────────────────────────────── */}
      <div className="w-full md:w-3/5">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success State ─────────────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex min-h-[70vh] flex-col items-center justify-center p-8 text-center md:h-full md:p-16 lg:p-24"
            >
              <div className="max-w-md">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm"
                >
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </motion.div>
                <h2 className="text-4xl font-light tracking-tighter text-gray-900 sm:text-5xl">
                  {copy.successHeading}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-gray-500">
                  {copy.successBody}
                </p>

                <div className="mt-16 sm:mt-24">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    {copy.shareHeading}
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-gray-900 bg-gray-900 px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
                  >
                    <span>{copied ? copy.copied : copy.copyLink}</span>
                    {!copied && (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── Form State ────────────────────────────────────────────── */
            <motion.div
              key="form"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
              className="p-8 pb-32 md:p-12 lg:p-20"
            >
              <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-2xl space-y-16">
                
                <motion.div variants={fadeUp} className="grid gap-12 sm:grid-cols-2">
                  <Field id="name" label={copy.nameLabel} error={errors.name} required>
                    <input
                      id="field-name"
                      type="text"
                      placeholder={copy.namePlaceholder}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputClass(!!errors.name)}
                      aria-required="true"
                    />
                  </Field>
                  <Field id="role" label={copy.roleLabel} error={errors.role} required>
                    <input
                      id="field-role"
                      type="text"
                      placeholder={copy.rolePlaceholder}
                      value={form.role}
                      onChange={(e) => set("role", e.target.value)}
                      className={inputClass(!!errors.role)}
                      aria-required="true"
                    />
                  </Field>
                </motion.div>

                <motion.div variants={fadeUp} className="grid gap-12 sm:grid-cols-2">
                  <Field id="company" label={copy.companyLabel}>
                    <input
                      type="text"
                      placeholder={copy.companyPlaceholder}
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field id="project_relation" label={copy.howWeWorkedLabel}>
                    <input
                      type="text"
                      placeholder={copy.howWeWorkedPlaceholder}
                      value={form.project_relation}
                      onChange={(e) => set("project_relation", e.target.value)}
                      className={inputClass(false)}
                    />
                  </Field>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Field
                    id="content"
                    label={copy.testimonialLabel}
                    hint={copy.testimonialHint}
                    error={errors.content}
                    required
                  >
                    <div className="relative mt-2">
                      <textarea
                        id="field-content"
                        placeholder={copy.testimonialPlaceholder}
                        value={form.content}
                        onChange={(e) => set("content", e.target.value)}
                        maxLength={CHAR_MAX}
                        rows={5}
                        className={`${inputClass(!!errors.content)} resize-none`}
                        aria-required="true"
                      />
                      <span className="absolute bottom-4 right-0 text-xs font-semibold uppercase tracking-widest text-gray-300">
                        {form.content.length} / {CHAR_MAX}
                      </span>
                    </div>
                  </Field>
                </motion.div>

                <motion.fieldset variants={fadeUp} className="group">
                  <legend className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors group-hover:text-gray-900">
                    {copy.ratingLabel} <span className="text-red-500">*</span>
                  </legend>
                  <div className="flex items-center gap-1">
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
                          className="p-1 transition-transform hover:scale-125 focus-visible:outline-none"
                        >
                          {filled ? (
                            <StarIcon className="h-10 w-10 text-gray-900" />
                          ) : (
                            <StarOutlineIcon className="h-10 w-10 text-gray-200 transition-colors hover:text-gray-300" />
                          )}
                        </button>
                      );
                    })}
                    {(hoveredStar || form.rating) > 0 && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-5 text-sm font-medium text-gray-500"
                      >
                        {ratingLabels[hoveredStar || form.rating]}
                      </motion.span>
                    )}
                  </div>
                </motion.fieldset>

                <motion.div variants={fadeUp} className="grid gap-12 sm:grid-cols-2">
                  <Field id="linkedin_url" label={copy.linkedinLabel}>
                    <input
                      type="url"
                      placeholder={copy.linkedinPlaceholder}
                      value={form.linkedin_url}
                      onChange={(e) => set("linkedin_url", e.target.value)}
                      className={inputClass(false)}
                    />
                  </Field>
                  <Field id="submitter_email" label={copy.emailLabel} error={errors.submitter_email} required>
                    <input
                      id="field-submitter_email"
                      type="email"
                      placeholder={copy.emailPlaceholder}
                      value={form.submitter_email}
                      onChange={(e) => set("submitter_email", e.target.value)}
                      className={inputClass(!!errors.submitter_email)}
                      aria-required="true"
                    />
                  </Field>
                </motion.div>

                {serverError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-red-500" role="alert">
                    {serverError}
                  </motion.p>
                )}

                <motion.div variants={fadeUp} className="pt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-between overflow-hidden bg-gray-900 p-6 text-left font-medium text-white transition-transform active:scale-[0.99] disabled:opacity-70 sm:w-auto sm:min-w-[280px]"
                  >
                    <span className="relative z-10 text-sm uppercase tracking-widest">
                      {loading ? copy.submitting : copy.submit}
                    </span>
                    <span className="relative z-10 transition-transform group-hover:translate-x-2">
                      →
                    </span>
                    <div className="absolute inset-0 z-0 origin-left scale-x-0 bg-gray-800 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:scale-x-100" />
                  </button>
                </motion.div>

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return [
    "w-full bg-transparent border-b py-4 px-0 text-xl font-light placeholder-gray-300",
    "transition-colors duration-300 focus:outline-none focus:ring-0 md:text-2xl",
    hasError
      ? "border-red-400 text-red-600 focus:border-red-600"
      : "border-gray-200 focus:border-gray-900 text-gray-900",
  ].join(" ");
}

function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex flex-col">
      <label htmlFor={id} className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400 transition-colors group-focus-within:text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <div className="mt-3 min-h-[20px]">
        {error ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-medium text-red-500">
            {error}
          </motion.p>
        ) : hint ? (
          <p className="text-sm text-gray-400">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
