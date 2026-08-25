// src/components/Contact.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Download, Loader2 } from 'lucide-react';
import { apiService, ApiError, ProfileResponse } from '@/services/api';
import { toDirectDownloadUrl } from '@/utils/googleDrive';

const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

const copy = {
  eyebrow: 'CONTACT',
  titleLine1: 'Let\u2019s build something',
  titleLine2: 'worth shipping.',
  subtitle: 'Tell me what you\u2019re working on and where you\u2019re stuck. I\u2019ll reply with a practical plan, timeline, and next steps.',
  promise: 'Replies within 1\u20132 business days',
  emailPrompt: 'Prefer email?',
  socialPrompt: 'Elsewhere',
  docsPrompt: 'Prefer documents?',
  form: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    namePlaceholder: 'Ada Lovelace',
    emailPlaceholder: 'you@example.com',
    messagePlaceholder: 'What are you building? What\u2019s blocking you?',
    submit: 'Send message',
    submitting: 'Sending\u2026',
  },
  validation: {
    nameRequired: 'Please enter your name.',
    nameTooLong: 'Name must be 100 characters or fewer.',
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'That email address doesn\u2019t look right. Please check it.',
    messageRequired: 'Please write a short message.',
    messageTooLong: 'Message must be 5,000 characters or fewer.',
  },
  status: {
    successTitle: 'Message received.',
    successBody: 'Thanks for reaching out \u2014 I\u2019ll get back to you within 1\u20132 business days.',
    successNext: 'In the meantime:',
    sendAnother: 'Send another message',
    rateLimited: 'You\u2019ve sent several messages recently. Please wait a few minutes and try again.',
    validation: 'Please review the highlighted fields and try again.',
    network: 'Unable to reach the server right now. Please check your connection and try again.',
    generic: 'Something went wrong while sending your message. Please try again, or email me directly at gigahidjrikaaa@gmail.com.',
  },
  socials: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
  },
  downloads: {
    resume: 'Resume (PDF)',
    cv: 'CV (PDF)',
    portfolio: 'Portfolio (PDF)',
    unavailable: 'Not set',
    portfolioLoading: 'Preparing\u2026',
    portfolioError: 'Unable to generate portfolio PDF right now. Please try again.',
  },
};

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();

  if (!name) errors.name = copy.validation.nameRequired;
  else if (name.length > LIMITS.name) errors.name = copy.validation.nameTooLong;

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
  const [values, setValues] = useState<FormValues>({ name: '', email: '', message: '' });
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

  const setFieldValue = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
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
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      setSubmitStatus('success');
      setValues({ name: '', email: '', message: '' });
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

  const resetToForm = () => {
    setSubmitStatus('idle');
    setSubmitError(null);
  };

  const inputClassName = (hasError: boolean) =>
    `block w-full border-b bg-transparent py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-colors duration-200 focus:outline-none ${
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-zinc-300 focus:border-zinc-900'
    }`;

  const labelClassName = 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500';

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

  const underlineLink =
    'inline-flex items-center gap-1 text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900 disabled:text-zinc-400 disabled:decoration-zinc-200 disabled:no-underline disabled:cursor-not-allowed';

  const socialLink =
    'inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900';

  return (
    <section id="contact" className="border-t border-zinc-200 bg-zinc-50 py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-0">

          {/* ── Statement & direct channels ─────────────────────────── */}
          <div className="lg:pr-14 lg:border-r lg:border-zinc-200">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              {copy.titleLine1}{' '}
              <span className="text-zinc-500">{copy.titleLine2}</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-600">
              {copy.subtitle}
            </p>

            {/* Response promise */}
            <div className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-zinc-200 bg-white px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium text-zinc-700">{copy.promise}</span>
            </div>

            {/* Direct email */}
            <p className="mt-8 text-sm text-zinc-500">
              {copy.emailPrompt}{' '}
              <a
                href="mailto:gigahidjrikaaa@gmail.com"
                className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
              >
                gigahidjrikaaa@gmail.com
              </a>
            </p>

            {/* Socials */}
            <div className="mt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                {copy.socialPrompt}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-2">
                <a href="https://github.com/gigahidjrikaaa" target="_blank" rel="noopener noreferrer" className={socialLink}>
                  {copy.socials.github}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
                <a href="https://linkedin.com/in/gigahidjrikaaa" target="_blank" rel="noopener noreferrer" className={socialLink}>
                  {copy.socials.linkedin}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
                <a href="https://twitter.com/gigahidjrikaaa" target="_blank" rel="noopener noreferrer" className={socialLink}>
                  {copy.socials.twitter}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
          </div>

          {/* ── Form / success ──────────────────────────────────────── */}
          <div className="lg:pl-14">
            <AnimatePresence mode="wait" initial={false}>
              {submitStatus === 'success' ? (
                <motion.div
                  key="success"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex h-full min-h-[320px] flex-col justify-center"
                  aria-live="polite"
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-900">
                    {copy.status.successTitle}
                  </h3>
                  <p className="mt-2 max-w-md text-base leading-relaxed text-zinc-600">
                    {copy.status.successBody}
                  </p>
                  <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                    {copy.status.successNext}
                  </p>
                  <div className="mt-3 flex flex-col items-start gap-2.5">
                    <Link href="/blog" className={underlineLink}>
                      Read the blog
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                    {resumeDownloadUrl ? (
                      <a href={resumeDownloadUrl} target="_blank" rel="noopener noreferrer" className={underlineLink}>
                        Download my resume
                        <Download className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={resetToForm}
                      className={underlineLink}
                    >
                      {copy.status.sendAnother}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-7"
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div>
                    <label htmlFor="name" className={labelClassName}>
                      {copy.form.name}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      autoComplete="name"
                      maxLength={LIMITS.name}
                      placeholder={copy.form.namePlaceholder}
                      value={values.name}
                      onChange={(e) => setFieldValue('name', e.target.value)}
                      aria-invalid={Boolean(fieldErrors.name)}
                      aria-describedby={describedBy('name')}
                      className={inputClassName(Boolean(fieldErrors.name))}
                    />
                    {renderFieldError('name')}
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClassName}>
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
                    <div className="flex items-baseline justify-between gap-3">
                      <label htmlFor="message" className={labelClassName}>
                        {copy.form.message}
                      </label>
                      {values.message.length > 4000 ? (
                        <span
                          className={`text-xs tabular-nums ${
                            values.message.length > LIMITS.message ? 'font-semibold text-red-600' : 'text-zinc-400'
                          }`}
                        >
                          {values.message.length.toLocaleString()} / {LIMITS.message.toLocaleString()}
                        </span>
                      ) : null}
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
                      className={`${inputClassName(Boolean(fieldErrors.message))} resize-none`}
                    />
                    {renderFieldError('message')}
                  </div>

                  {submitStatus === 'error' && submitError ? (
                    <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                      {submitError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitStatus === 'submitting' ? (
                      <>
                        {copy.form.submitting}
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      </>
                    ) : (
                      <>
                        {copy.form.submit}
                        <ArrowRight
                          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* ── Documents ───────────────────────────────────────────── */}
          <div className="lg:pr-14">
            <div className="border-t border-zinc-200 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                {copy.docsPrompt}
              </p>
              <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2.5">
                <a
                  href={resumeDownloadUrl ?? '#'}
                  target={resumeDownloadUrl ? '_blank' : undefined}
                  rel={resumeDownloadUrl ? 'noopener noreferrer' : undefined}
                  aria-disabled={!resumeDownloadUrl}
                  tabIndex={resumeDownloadUrl ? 0 : -1}
                  className={underlineLink}
                  onClick={(event) => {
                    if (!resumeDownloadUrl) event.preventDefault();
                  }}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {resumeDownloadUrl ? copy.downloads.resume : copy.downloads.unavailable}
                </a>
                <a
                  href={cvDownloadUrl ?? '#'}
                  target={cvDownloadUrl ? '_blank' : undefined}
                  rel={cvDownloadUrl ? 'noopener noreferrer' : undefined}
                  aria-disabled={!cvDownloadUrl}
                  tabIndex={cvDownloadUrl ? 0 : -1}
                  className={underlineLink}
                  onClick={(event) => {
                    if (!cvDownloadUrl) event.preventDefault();
                  }}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden />
                  {cvDownloadUrl ? copy.downloads.cv : copy.downloads.unavailable}
                </a>
                <button
                  type="button"
                  disabled={isPortfolioDownloading}
                  className={underlineLink}
                  onClick={handlePortfolioDownload}
                >
                  {isPortfolioDownloading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Download className="h-3.5 w-3.5" aria-hidden />
                  )}
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
