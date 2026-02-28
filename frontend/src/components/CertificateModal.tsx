// src/components/CertificateModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, BadgeCheck, Calendar, Hash, ArrowUpRight } from 'lucide-react';

type Certificate = {
  id: number;
  title: string;
  issuer?: string;
  issue_date?: string;
  credential_id?: string;
  credential_url?: string;
  image_url?: string;
  description?: string;
  display_order: number;
};

type CertificateModalProps = {
  open: boolean;
  onClose: () => void;
  certificate: Certificate;
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: 20, scale: 0.97, transition: { duration: 0.2 } },
};

const CertificateModal: React.FC<CertificateModalProps> = ({ open, onClose, certificate }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4 md:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl"
            style={{ maxHeight: 'min(92vh, 820px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── CERTIFICATE IMAGE (hero) ───────────────────────────── */}
            <div className="relative w-full shrink-0 overflow-hidden bg-zinc-100 dark:bg-zinc-800" style={{ aspectRatio: '4/3' }}>
              {certificate.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={certificate.image_url}
                  alt={certificate.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BadgeCheck className="h-24 w-24 text-zinc-300 dark:text-zinc-600" />
                </div>
              )}

              {/* Top gradient band for close button legibility */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ───────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Header info */}
              <div className="border-b border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <h2 className="text-lg font-bold leading-tight text-zinc-900 dark:text-white sm:text-xl">
                  {certificate.title}
                </h2>
                {certificate.issuer && (
                  <p className="mt-1 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Issued by <span className="text-zinc-700 dark:text-zinc-200">{certificate.issuer}</span>
                  </p>
                )}

                {/* Meta chips */}
                <div className="mt-3 flex flex-wrap gap-3">
                  {certificate.issue_date && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <Calendar className="h-3.5 w-3.5" />
                      {certificate.issue_date}
                    </span>
                  )}
                  {certificate.credential_id && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <Hash className="h-3.5 w-3.5" />
                      {certificate.credential_id}
                    </span>
                  )}
                </div>
              </div>

              {/* Description + CTA */}
              <div className="space-y-4 px-6 py-5">
                {certificate.description && (
                  <div>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      About this credential
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                      {certificate.description}
                    </p>
                  </div>
                )}

                {certificate.credential_url && (
                  <a
                    href={certificate.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    Verify Credential
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-zinc-100 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CertificateModal;
