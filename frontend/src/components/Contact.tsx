// src/components/Contact.tsx
"use client";

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope, FaFilePdf, FaDownload } from 'react-icons/fa';

const copy = {
  eyebrow: 'GET IN TOUCH',
  title: 'Contact Me',
  subtitle: "Let's align on scope, timelines, and the right engagement model for your team.",
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
    title: 'Resume & CV',
    subtitle: 'Download my resume or view more details.',
    resume: 'Download Resume (PDF)',
    cv: 'Download CV (PDF)',
  },
};

const Contact = () => {
  const [status, setStatus] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setStatus(copy.statusPending);
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-gray-100 py-24 md:py-32">
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
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
                {copy.eyebrow}
              </span>
              <h2 className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
                {copy.title}
              </h2>
              <p className="text-gray-500 leading-relaxed">{copy.subtitle}</p>

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
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="/resume.pdf"
                    download
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:shadow-md"
                  >
                    <FaDownload className="h-4 w-4" />
                    {copy.downloads.resume}
                  </a>
                  <a
                    href="/cv.pdf"
                    download
                    className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:shadow-md"
                  >
                    <FaDownload className="h-4 w-4" />
                    {copy.downloads.cv}
                  </a>
                </div>
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
