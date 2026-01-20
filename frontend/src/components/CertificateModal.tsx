// src/components/CertificateModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XMarkIcon, DocumentCheckIcon, CalendarIcon, IdentificationIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-white px-6 sm:px-8 py-5 sm:py-6 text-gray-900 border-b border-gray-100">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="flex flex-col gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">{certificate.title}</h2>
                {certificate.issuer && (
                  <p className="text-base sm:text-lg text-gray-600">Issued by {certificate.issuer}</p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  {certificate.issue_date && (
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {certificate.issue_date}
                    </span>
                  )}
                  {certificate.credential_id && (
                    <span className="flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4" />
                      ID: {certificate.credential_id}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Certificate Image */}
            <div className="relative aspect-[16/10] w-full bg-gray-50">
              {certificate.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={certificate.image_url}
                  alt={certificate.title}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <DocumentCheckIcon className="h-24 w-24 text-emerald-300" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 py-6">
              {certificate.description && (
                <div className="rounded-2xl bg-gray-50 p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{certificate.description}</p>
                </div>
              )}

              {certificate.credential_url && (
                <div className="mt-4">
                  <a
                    href={certificate.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    Verify Credential
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 sm:px-8 py-4">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
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
