// src/components/Contact.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope, FaFilePdf, FaDownload } from 'react-icons/fa';
import { apiService, ProfileResponse } from '@/services/api';
import { toDirectDownloadUrl } from '@/utils/googleDrive';
import { OrbitalRings } from './decorations/OrbitalRings';
import { ContactGraphic } from './decorations/sections/ContactGraphic';

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
  },
  statusPending: 'Thanks! Your message has been received.',
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

const Contact = () => {
  const [status, setStatus] = useState<string | null>(null);
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

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setStatus(copy.statusPending);
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

  return (
    <section id="contact" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32">
      <OrbitalRings />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl rounded-[32px] bg-white p-8 shadow-sm md:p-12"
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
                    <FaGithub className="h-4 w-4" />
                  </a>
                  <a
                    href="https://linkedin.com/in/gigahidjrikaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.linkedin}
                  >
                    <FaLinkedinIn className="h-4 w-4" />
                  </a>
                  <a
                    href="https://twitter.com/gigahidjrikaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.twitter}
                  >
                    <FaTwitter className="h-4 w-4" />
                  </a>
                  <a
                    href="mailto:gigahidjrikaaa@gmail.com"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    aria-label={copy.socials.email}
                  >
                    <FaEnvelope className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <FaFilePdf className="text-gray-600" />
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
                    <FaDownload className="h-4 w-4" />
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
                    <FaDownload className="h-4 w-4" />
                    {cvDownloadUrl ? copy.downloads.cv : copy.downloads.cvUnavailable}
                  </a>

                  <button
                    type="button"
                    disabled={isPortfolioDownloading}
                    className={getDownloadButtonClass(!isPortfolioDownloading)}
                    onClick={handlePortfolioDownload}
                  >
                    <FaDownload className="h-4 w-4" />
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
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder={copy.form.firstNamePlaceholder}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
                  />
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
                    placeholder={copy.form.lastNamePlaceholder}
                    className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
                  />
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
                  placeholder={copy.form.emailPlaceholder}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
                  {copy.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  placeholder={copy.form.messagePlaceholder}
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:ring-0"
                />
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                {copy.form.submit}
              </button>

              {status ? (
                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700" role="status" aria-live="polite">
                  {status}
                </div>
              ) : null}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
