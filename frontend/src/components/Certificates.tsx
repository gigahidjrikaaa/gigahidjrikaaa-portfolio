// src/components/Certificates.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiService, CertificateResponse } from '@/services/api';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import ErrorState from '@/components/ui/ErrorState';
import { useApiData } from '@/hooks/useApiData';
import {
  deriveCredentialStatus,
  getDaysUntilExpiry,
  getCertificateTypeBadgeClassName,
  getCertificateTypeLabel,
  getCredentialStatusBadgeClassName,
  getCredentialStatusLabel,
} from '@/lib/certificateMeta';
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

const statusOrder: Record<string, number> = {
  active: 0,
  does_not_expire: 1,
  in_progress: 2,
  expired: 3,
};

const copy = {
  eyebrow: 'CREDENTIALS',
  title: 'Certifications',
  subtitle: 'Type-aware credentials with verifiable proof, practical outcomes, and current status.',
  filterAll: 'All Types',
  stats: {
    total: 'Total Credentials',
    active: 'Currently Active',
    verified: 'Verifiable Links',
  },
  loading: 'Loading certifications...',
  empty: 'Certifications coming soon.',
};

const Certificates = () => {
  const { data: certificatesData, loading, error, retry } = useApiData<CertificateResponse[]>(() => apiService.getCertificates());
  const certificates = useMemo(() => certificatesData ?? [], [certificatesData]);
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const typeFilters = useMemo(
    () => ['all', ...Array.from(new Set(certificates.map((item) => item.certificate_type || 'technical')))],
    [certificates]
  );

  useEffect(() => {
    if (activeTypeFilter === 'all') {
      return;
    }

    if (!typeFilters.includes(activeTypeFilter)) {
      setActiveTypeFilter('all');
    }
  }, [activeTypeFilter, typeFilters]);

  const certificateStats = useMemo(
    () => ({
      total: certificates.length,
      active: certificates.filter((item) => deriveCredentialStatus(item) === 'active').length,
      verified: certificates.filter((item) => Boolean(item.credential_url)).length,
    }),
    [certificates]
  );

  const filteredCertificates = useMemo(() => {
    return certificates
      .filter((item) => activeTypeFilter === 'all' || item.certificate_type === activeTypeFilter)
      .sort((a, b) => {
        const aStatus = deriveCredentialStatus(a);
        const bStatus = deriveCredentialStatus(b);
        const byStatus = (statusOrder[aStatus] ?? 99) - (statusOrder[bStatus] ?? 99);

        if (byStatus !== 0) {
          return byStatus;
        }

        return (a.display_order || 0) - (b.display_order || 0);
      });
  }, [certificates, activeTypeFilter]);

  const handleCertificateClick = (cert: CertificateResponse) => {
    setSelectedCertificate(cert);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCertificate(null);
  };

  return (
    <section id="certificates" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-slate-300/30 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-16 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">{copy.eyebrow}</span>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl">{copy.title}</h2>
            <p className="mt-4 text-zinc-600 leading-relaxed">{copy.subtitle}</p>
          </motion.div>

          {!loading && certificates.length > 0 ? (
            <motion.div variants={itemVariants} className="mb-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{copy.stats.total}</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900">{certificateStats.total}</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">{copy.stats.active}</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-900">{certificateStats.active}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">{copy.stats.verified}</p>
                <p className="mt-2 text-3xl font-semibold text-zinc-900">{certificateStats.verified}</p>
              </div>
            </motion.div>
          ) : null}

          {!loading && typeFilters.length > 1 ? (
            <motion.div variants={itemVariants} className="mb-10 flex flex-wrap items-center gap-2">
              {typeFilters.map((typeValue) => {
                const isActive = activeTypeFilter === typeValue;
                const label = typeValue === 'all' ? copy.filterAll : getCertificateTypeLabel(typeValue);

                return (
                  <button
                    key={typeValue}
                    type="button"
                    onClick={() => setActiveTypeFilter(typeValue)}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </motion.div>
          ) : null}

          {loading ? (
            <LoadingAnimation label={copy.loading} />
          ) : error ? (
            <ErrorState
              title="Certifications couldn't load"
              message={error}
              onRetry={retry}
            />
          ) : filteredCertificates.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCertificates.map((cert, index) => {
                const resolvedStatus = deriveCredentialStatus(cert);
                const daysUntilExpiry = getDaysUntilExpiry(cert.expiry_date);
                const expiringSoon = daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

                return (
                  <motion.article
                    key={cert.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
                      index === 0 && filteredCertificates.length > 1 ? 'sm:col-span-2 xl:col-span-2' : ''
                    }`}
                    onClick={() => handleCertificateClick(cert)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCertificateClick(cert)}
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-1 ${
                        resolvedStatus === 'expired'
                          ? 'bg-rose-400'
                          : resolvedStatus === 'active'
                            ? 'bg-emerald-500'
                            : 'bg-zinc-300'
                      }`}
                    />

                    <div className="relative aspect-[4/3] w-full bg-zinc-100">
                      {cert.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cert.image_url}
                          alt={cert.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-zinc-50">
                          <FileCheck className="h-12 w-12 text-zinc-300" />
                        </div>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className={`rounded-full border bg-white/95 text-[10px] backdrop-blur ${getCertificateTypeBadgeClassName(
                            cert.certificate_type
                          )}`}
                        >
                          {getCertificateTypeLabel(cert.certificate_type, cert.custom_type_label)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`rounded-full border bg-white/95 text-[10px] backdrop-blur ${getCredentialStatusBadgeClassName(
                            resolvedStatus
                          )}`}
                        >
                          {getCredentialStatusLabel(resolvedStatus)}
                        </Badge>
                        {expiringSoon ? (
                          <Badge
                            variant="outline"
                            className="rounded-full border border-amber-300 bg-amber-50 text-[10px] text-amber-700"
                          >
                            Expires in {daysUntilExpiry}d
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{cert.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{cert.issuer || 'Independent issuer'}</p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {cert.issue_date ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                            Issued {cert.issue_date}
                          </span>
                        ) : null}
                        {cert.expiry_date ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                            Expires {cert.expiry_date}
                          </span>
                        ) : null}
                        {cert.level ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {cert.level}
                          </span>
                        ) : null}
                        {cert.result ? (
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {cert.result}
                          </span>
                        ) : null}
                      </div>

                      {cert.specialization ? (
                        <p className="mt-2 line-clamp-2 text-xs text-slate-500">Track: {cert.specialization}</p>
                      ) : null}

                      <div className="mt-auto pt-4">
                        {cert.credential_url ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(cert.credential_url, '_blank');
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                          >
                            Verify credential
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Click to view details</span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500">{copy.empty}</div>
          )}
        </motion.div>
      </div>

      {selectedCertificate && (
        <CertificateModal open={isModalOpen} onClose={handleCloseModal} certificate={selectedCertificate} />
      )}
    </section>
  );
};

export default Certificates;
