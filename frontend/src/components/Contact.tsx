// src/components/Contact.js
"use client";

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FaGithub, FaLinkedinIn, FaTwitter, FaEnvelope } from 'react-icons/fa';

const copy = {
  title: 'Get In Touch',
  subtitle: 'Interested in collaborating or have a question? Feel free to reach out!',
  form: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'you@example.com',
    messagePlaceholder: 'Your message here...',
    submit: 'Send Message',
  },
  statusPending: 'Thanks! Your message is ready to send. Wire it to the backend when available.',
  socialPrompt: 'Or connect with me on:',
  socials: {
    github: 'GitHub',
    linkedin: 'LinkedIn',
    twitter: 'Twitter',
    email: 'Email',
  },
};

const Contact = () => {
  // NOTE: Form submission requires a backend handler (API Route or 3rd party service)
  const [status, setStatus] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    // Add form submission logic here
    setStatus(copy.statusPending);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl mb-4 font-heading">
            {copy.title}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-secondary/5 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="transition-all duration-300 focus-within:scale-[1.01]">
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                  {copy.form.name}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                  placeholder={copy.form.namePlaceholder}
                  aria-label={copy.form.name}
                />
              </div>
              <div className="transition-all duration-300 focus-within:scale-[1.01]">
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                  {copy.form.email}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                  placeholder={copy.form.emailPlaceholder}
                  aria-label={copy.form.email}
                />
              </div>
            </div>
            <div className="transition-all duration-300 focus-within:scale-[1.01]">
              <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-1">
                {copy.form.message}
              </label>
              <textarea
                name="message"
                id="message"
                rows={5}
                required
                className="block w-full rounded-md border border-gray-200 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm py-3 px-4 bg-background transition-all duration-200"
                placeholder={copy.form.messagePlaceholder}
                aria-label={copy.form.message}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-black shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 hover:scale-[1.01]"
              >
                <span>{copy.form.submit}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
            {status ? (
              <div className="rounded-md border border-cyan-200/60 bg-cyan-50 px-4 py-3 text-sm text-cyan-800" role="status" aria-live="polite">
                {status}
              </div>
            ) : null}
          </form>

            {/* Social Links */}
            <div className="mt-12 text-center">
            <p className="text-text-secondary mb-4">{copy.socialPrompt}</p>
            <div className="flex justify-center space-x-6">
              <a 
              href="https://github.com/gigahidjrikaaa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label={copy.socials.github}
              >
              <span className="sr-only">{copy.socials.github}</span>
              <FaGithub />
              </a>
              <a 
              href="https://linkedin.com/in/gigahidjrikaaa" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label={copy.socials.linkedin}
              >
              <span className="sr-only">{copy.socials.linkedin}</span>
              <FaLinkedinIn />
              </a>
              <a
              href="https://twitter.com/gigahidjrikaaa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label={copy.socials.twitter}
              >
              <span className="sr-only">{copy.socials.twitter}</span>
              <FaTwitter />
              </a>
              <a
              href="mailto:gigahidjrikaaa@gmail.com"
              className="text-text-secondary hover:text-primary transition-colors duration-300"
              aria-label={copy.socials.email}
              >
              <span className="sr-only">{copy.socials.email}</span>
              <FaEnvelope />
              </a>
            </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;