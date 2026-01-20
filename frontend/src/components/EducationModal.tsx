// src/components/EducationModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { XMarkIcon, AcademicCapIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

type Education = {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  gpa?: string;
  institution_logo_url?: string;
  is_current: boolean;
  display_order: number;
};

type EducationModalProps = {
  open: boolean;
  onClose: () => void;
  education: Education;
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

const EducationModal: React.FC<EducationModalProps> = ({ open, onClose, education }) => {
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

  // Parse description into bullet points if it contains newlines or bullet characters
  const descriptionLines = education.description
    ? education.description
        .split(/[\n•\-]/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
    : [];

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
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-white px-6 sm:px-8 py-5 sm:py-6 text-gray-900 border-b border-gray-100">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Institution logo */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                  {education.institution_logo_url ? (
                    <Image
                      src={education.institution_logo_url}
                      alt={education.institution}
                      width={64}
                      height={64}
                      className="rounded-xl object-contain"
                    />
                  ) : (
                    <AcademicCapIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold">{education.degree}</h2>
                    {education.is_current && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-base sm:text-lg text-gray-600">{education.institution}</p>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      {education.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {education.period}
                    </span>
                  </div>

                  {education.gpa && (
                    <div className="mt-3">
                      <span className="rounded-full bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-700">
                        GPA: {education.gpa}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
              {descriptionLines.length > 0 && (
                <>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Activities & Achievements
                  </h3>
                  
                  {descriptionLines.length > 1 ? (
                    <ul className="space-y-3">
                      {descriptionLines.map((line, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                          <span className="text-gray-600 leading-relaxed">{line}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600 leading-relaxed">{education.description}</p>
                  )}
                </>
              )}

              {descriptionLines.length === 0 && (
                <p className="text-center text-gray-400">No additional details available.</p>
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

export default EducationModal;
