// src/components/Certificates.tsx
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DocumentCheckIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { apiService, CertificateResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import CertificateModal from './CertificateModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

const copy = {
  eyebrow: 'CREDENTIALS',
  title: 'Certifications',
  subtitle: 'Professional certifications and credentials validating expertise across domains.',
  loading: 'Loading certifications...',
  empty: 'Certifications coming soon.',
};

const Certificates = () => {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiService.getCertificates();
        setCertificates(data);
      } catch (error) {
        console.error('Failed to fetch certificates', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCertificateClick = (cert: CertificateResponse) => {
    setSelectedCertificate(cert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  return (
    <section id="certificates" className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-16 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
              {copy.eyebrow}
            </span>
            <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {copy.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : certificates.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {certificates.map((cert) => (
                <motion.article
                  key={cert.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-[24px] border border-gray-200/60 bg-gray-50/50 transition-shadow hover:shadow-xl"
                  onClick={() => handleCertificateClick(cert)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCertificateClick(cert)}
                >
                  {/* Image or placeholder */}
                  <div className="relative aspect-[4/3] w-full bg-gray-100">
                    {cert.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cert.image_url}
                        alt={cert.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <DocumentCheckIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {/* Issuer badge */}
                    {cert.issuer && (
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow backdrop-blur-sm">
                        {cert.issuer}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                      {cert.title}
                    </h3>
                    {cert.issue_date && (
                      <p className="mt-1 text-xs text-gray-500">Issued {cert.issue_date}</p>
                    )}
                    {cert.credential_id && (
                      <p className="mt-1 text-xs text-gray-400">ID: {cert.credential_id}</p>
                    )}

                    <div className="mt-auto pt-4">
                      {cert.credential_url ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(cert.credential_url, '_blank');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-900 hover:underline"
                        >
                          Verify credential
                          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">Click to view details</span>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">{copy.empty}</div>
          )}
        </motion.div>
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && (
        <CertificateModal
          open={isModalOpen}
          onClose={handleCloseModal}
          certificate={selectedCertificate}
        />
      )}
    </section>
  );
};

export default Certificates;
