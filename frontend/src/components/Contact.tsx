// src/components/Contact.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Twitter, Mail, FileText, Download } from 'lucide-react';
import { apiService, ApiError, ProfileResponse } from '@/services/api';
import { toDirectDownloadUrl } from '@/utils/googleDrive';
import { OrbitalRings } from './decorations/OrbitalRings';
import { ContactGraphic } from './decorations/sections/ContactGraphic';

const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

const copy = {
  eyebrow: 'GET IN TOUCH',
  title: 'Contact Me',
  subtitle: "Tell me what you are building and where you are stuck. I will reply with a practical plan, timeline, and next steps.",
  form: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    message: 'Message',
    firstNamePlaceholder: 'Giga',
    lastNamePlaceholder: 'Hidjrika',
    emailPlaceholder: 'you@example.com',
    messagePlaceholder: 'Write your message here...',
    submit: 'Send Inquiry',
    submitting: 'Sending…',
  },
  validation: {
    firstNameRequired: 'Please enter your first name.',
    lastNameRequired: 'Please enter your last name.',
    nameTooLong: 'Combined name must be 100 characters or fewer.',
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'That email address doesn\u2019t look right. Please check it.',
    messageRequired: 'Please write a short message.',
    messageTooLong: 'Message must be 5,000 characters or fewer.',
  },
  status: {
    success: 'Thanks! Your message has been received. I usually reply within 1-2 business days.',
    rateLimited: 'You\u2019ve sent several messages recently. Please wait a few minutes and try again.',
    validation: 'Please review the highlighted fields and try again.',
    network: 'Unable to reach the server right now. Please check your connection and try again.',
    generic: 'Something went wrong while sending your message. Please try again, or email me directly at gigahidjrikaaa@gmail.com.',
  },
  characterCount: (used: number, max: number) => `${used.toLocaleString()} / ${max.toLocaleString()}`,
  socialPrompt: 'Get in touch',
  socials: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    email: 'Email',
  },
  downloads: {
    title: 'Resume, CV & Portfolio',
    subtitle: 'Download my latest resume, CV, and portfolio export.',
    resume: 'Download Resume (PDF)',
    cv: 'Download CV (PDF)',
    portfolio: 'Download Portfolio (PDF)',
    resumeUnavailable: 'Resume Link Not Set',
    cvUnavailable: 'CV Link Not Set',
    portfolioLoading: 'Preparing Portfolio PDF...',
    portfolioError: 'Unable to generate portfolio PDF right now. Please try again.',
  },
};

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

  if (!values.firstName.trim()) errors.firstName = copy.validation.firstNameRequired;
  if (!values.lastName.trim()) errors.lastName = copy.validation.lastNameRequired;
  if (fullName.length > LIMITS.name) errors.firstName = copy.validation.nameTooLong;

  const email = values.email.trim();
  if (!email) errors.email = copy.validation.emailRequired;
  else if (email.length > LIMITS.email || !EMAIL_PATTERN.test(email)) errors.email = copy.validation.emailInvalid;

  const message = values.message.trim();
  if (!message) errors.message = copy.validation.messageRequired;
  else if (message.length > LIMITS.message) errors.message = copy.validation.messageTooLong;

  return errors;
}

function toSubmitError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return copy.status.rateLimited;
    if (error.status === 422) return copy.status.validation;
    if (error.status >= 500) return copy.status.generic;
    return error.message || copy.status.generic;
  }
  if (error instanceof Error && error.message) return error.message;
  return copy.status.network;
}

const Contact = () => {
  const [values, setValues] = useState<FormValues>({ firstName: '', lastName: '', email: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isPortfolioDownloading, setIsPortfolioDownloading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;

    apiService
      .getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resumeDownloadUrl = toDirectDownloadUrl(profile?.resume_url);
  const cvDownloadUrl = toDirectDownloadUrl(profile?.cv_url);

  const getDownloadButtonClass = (isEnabled: boolean) =>
    `flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
      isEnabled
        ? 'border border-gray-300 bg-white text-gray-900 transition hover:border-gray-400 hover:shadow-md'
        : 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500'
    }`;

  const setFieldValue = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear the field-level error as soon as the user edits that field.
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
      setSubmitError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitStatus === 'submitting') return; // double-submit guard

    const nextErrors = validate(values);
    setFieldErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitStatus('error');
      setSubmitError(copy.status.validation);
      return;
    }

    setSubmitStatus('submitting');
    setSubmitError(null);

    try {
      await apiService.submitContactMessage({
        name: `${values.firstName.trim()} ${values.lastName.trim()}`.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSubmitStatus('success');
      setValues({ firstName: '', lastName: '', email: '', message: '' });
      setFieldErrors({});
    } catch (error) {
      setSubmitStatus('error');
      setSubmitError(toSubmitError(error));
      // Values are intentionally preserved so the user can retry without retyping.
    }
  };

  const handlePortfolioDownload = async () => {
    setPortfolioError(null);
    setIsPortfolioDownloading(true);

    try {
      const { blob, filename } = await apiService.downloadPortfolioPdf();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setPortfolioError(copy.downloads.portfolioError);
    } finally {
      setIsPortfolioDownloading(false);
    }
  };

  const inputClassName = (hasError: boolean) =>
    `block w-full rounded-lg border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-0 ${
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-gray-400'
    }`;

  const renderFieldError = (field: FieldName) => {
    const message = fieldErrors[field];
    if (!message) return null;
    return (
      <p id={`${field}-error`} className="mt-1.5 text-xs font-medium text-red-600">
        {message}
      </p>
    );
  };

  const describedBy = (field: FieldName) => (fieldErrors[field] ? `${field}-error` : undefined);

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-24 md:py-32">
      <OrbitalRings />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm md:p-12"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
            {/* Left: Heading & socials */}
            <div className="flex flex-col">
              <div className="mb-6 space-y-2 relative">
                <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/4 opacity-20 pointer-events-none hidden lg:block">
                  <ContactGraphic />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                  {copy.eyebrow}
                </span>
                <h2 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  {copy.title}
                </h2>
              </div>
              <p className="mb-8 text-gray-500 leading-relaxed max-w-md">{copy.subtitle}</p>

              <div className="pt-4">
                <p className="text-xs uppercase tracking-wider text-gray-400">{copy.socialPrompt}</p>
                <div className="mt-3 flex gap-4">
                  <a
                    href="https://github.com/gigahidjrikaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.github}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com/in/gigahidjrikaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.linkedin}
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com/gigahidjrikaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.twitter}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="mailto:gigahidjrikaaa@gmail.com"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.email}
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {copy.downloads.title}
                  </h3>
                </div>
                <p className="mb-4 text-sm text-gray-600">{copy.downloads.subtitle}</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <a
                    href={resumeDownloadUrl ?? '#'}
                    target={resumeDownloadUrl ? '_blank' : undefined}
                    rel={resumeDownloadUrl ? 'noopener noreferrer' : undefined}
                    aria-disabled={!resumeDownloadUrl}
                    tabIndex={resumeDownloadUrl ? 0 : -1}
                    className={getDownloadButtonClass(Boolean(resumeDownloadUrl))}
                    onClick={(event) => {
                      if (!resumeDownloadUrl) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {resumeDownloadUrl ? copy.downloads.resume : copy.downloads.resumeUnavailable}
                  </a>
                  <a
                    href={cvDownloadUrl ?? '#'}
                    target={cvDownloadUrl ? '_blank' : undefined}
                    rel={cvDownloadUrl ? 'noopener noreferrer' : undefined}
                    aria-disabled={!cvDownloadUrl}
                    tabIndex={cvDownloadUrl ? 0 : -1}
                    className={getDownloadButtonClass(Boolean(cvDownloadUrl))}
                    onClick={(event) => {
                      if (!cvDownloadUrl) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    {cvDownloadUrl ? copy.downloads.cv : copy.downloads.cvUnavailable}
                  </a>

                  <button
                    type="button"
                    disabled={isPortfolioDownloading}
                    className={getDownloadButtonClass(!isPortfolioDownloading)}
                    onClick={handlePortfolioDownload}
                  >
                    <Download className="h-4 w-4" />
                    {isPortfolioDownloading ? copy.downloads.portfolioLoading : copy.downloads.portfolio}
                  </button>
                </div>

                {portfolioError ? (
                  <p className="mt-3 text-xs text-red-600" role="status" aria-live="polite">
                    {portfolioError}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Right: Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                    {copy.form.firstName}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    maxLength={LIMITS.name}
                    placeholder={copy.form.firstNamePlaceholder}
                    value={values.firstName}
                    onChange={(e) => setFieldValue('firstName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    aria-describedby={describedBy('firstName')}
                    className={inputClassName(Boolean(fieldErrors.firstName))}
                  />
                  {renderFieldError('firstName')}
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                    {copy.form.lastName}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    autoComplete="family-name"
                    maxLength={LIMITS.name}
                    placeholder={copy.form.lastNamePlaceholder}
                    value={values.lastName}
                    onChange={(e) => setFieldValue('lastName', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    aria-describedby={describedBy('lastName')}
                    className={inputClassName(Boolean(fieldErrors.lastName))}
                  />
                  {renderFieldError('lastName')}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                  {copy.form.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  maxLength={LIMITS.email}
                  placeholder={copy.form.emailPlaceholder}
                  value={values.email}
                  onChange={(e) => setFieldValue('email', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={describedBy('email')}
                  className={inputClassName(Boolean(fieldErrors.email))}
                />
                {renderFieldError('email')}
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    {copy.form.message}
                  </label>
                  <span
                    className={`text-xs tabular-nums ${
                      values.message.length > LIMITS.message ? 'font-semibold text-red-600' : 'text-gray-400'
                    }`}
                  >
                    {copy.characterCount(values.message.length, LIMITS.message)}
                  </span>
                </div>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  maxLength={LIMITS.message}
                  placeholder={copy.form.messagePlaceholder}
                  value={values.message}
                  onChange={(e) => setFieldValue('message', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={describedBy('message')}
                  className={inputClassName(Boolean(fieldErrors.message))}
                />
                {renderFieldError('message')}
              </div>

              <button
                type="submit"
                disabled={submitStatus === 'submitting'}
                className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                aria-live="polite"
              >
                {submitStatus === 'submitting' ? copy.form.submitting : copy.form.submit}
              </button>

              <div role="status" aria-live="polite">
                {submitStatus === 'success' ? (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                    {copy.status.success}
                  </div>
                ) : null}
                {submitStatus === 'error' && submitError ? (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
