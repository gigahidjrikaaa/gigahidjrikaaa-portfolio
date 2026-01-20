// src/components/AwardModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { XMarkIcon, TrophyIcon, CalendarIcon, BuildingOfficeIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

type Award = {
  id: number;
  title: string;
  issuer?: string;
  award_date?: string;
  description?: string;
  credential_url?: string;
  image_url?: string;
  display_order: number;
};

type AwardModalProps = {
  open: boolean;
  onClose: () => void;
  award: Award;
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

const AwardModal: React.FC<AwardModalProps> = ({ open, onClose, award }) => {
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
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
              aria-label="Close modal"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="relative bg-white px-6 sm:px-8 py-5 sm:py-6 text-gray-900 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row items-start gap-5">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  {award.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={award.image_url}
                      alt={award.title}
                      className="h-10 w-10 object-contain"
                    />
                  ) : (
                    <TrophyIcon className="h-8 w-8 text-amber-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold">{award.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {award.issuer && (
                      <span className="flex items-center gap-2">
                        <BuildingOfficeIcon className="h-4 w-4" />
                        {award.issuer}
                      </span>
                    )}
                    {award.award_date && (
                      <span className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {award.award_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 sm:px-8 py-6">
              {award.description && (
                <div className="rounded-2xl bg-gray-50 p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    About This Achievement
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{award.description}</p>
                </div>
              )}

              {award.credential_url && (
                <div className="mt-4">
                  <a
                    href={award.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                  >
                    View Credential
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

export default AwardModal;
