"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { apiService, AwardResponse, CertificateResponse } from "@/services/api";

const copy = {
  title: "Awards & Certificates",
  subtitle:
    "Recognition, credentials, and milestones that reflect continuous growth in AI, blockchain, and full-stack engineering.",
  awardsTitle: "Awards",
  certificatesTitle: "Certificates",
  emptyAwards: "Awards will be added soon.",
  emptyCertificates: "Certificates will be added soon.",
  viewCredential: "View credential",
};

const AwardsCertificates = () => {
  const [awards, setAwards] = useState<AwardResponse[]>([]);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const [awardsData, certificatesData] = await Promise.all([
          apiService.getAwards(),
          apiService.getCertificates(),
        ]);
        setAwards(awardsData);
        setCertificates(certificatesData);
      } catch (error) {
        console.error("Failed to fetch awards/certificates", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section id="awards" className="relative overflow-hidden bg-white py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base text-gray-600 sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">{copy.awardsTitle}</h3>
            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : awards.length === 0 ? (
                <div className="text-sm text-gray-500">{copy.emptyAwards}</div>
              ) : (
                awards.map((award) => (
                  <motion.div
                    key={award.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{award.title}</div>
                        <div className="text-sm text-gray-500">
                          {award.issuer} {award.award_date ? `• ${award.award_date}` : ""}
                        </div>
                      </div>
                      {award.image_url ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                          <Image src={award.image_url} alt={award.title} fill className="object-cover" />
                        </div>
                      ) : null}
                    </div>
                    {award.description ? <p className="text-sm text-gray-600">{award.description}</p> : null}
                    {award.credential_url ? (
                      <a
                        href={award.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                      >
                        {copy.viewCredential}
                      </a>
                    ) : null}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">{copy.certificatesTitle}</h3>
            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : certificates.length === 0 ? (
                <div className="text-sm text-gray-500">{copy.emptyCertificates}</div>
              ) : (
                certificates.map((certificate) => (
                  <motion.div
                    key={certificate.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-semibold text-gray-900">{certificate.title}</div>
                        <div className="text-sm text-gray-500">
                          {certificate.issuer} {certificate.issue_date ? `• ${certificate.issue_date}` : ""}
                        </div>
                      </div>
                      {certificate.image_url ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                          <Image src={certificate.image_url} alt={certificate.title} fill className="object-cover" />
                        </div>
                      ) : null}
                    </div>
                    {certificate.description ? <p className="text-sm text-gray-600">{certificate.description}</p> : null}
                    {certificate.credential_url ? (
                      <a
                        href={certificate.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-cyan-600 hover:text-cyan-700"
                      >
                        {copy.viewCredential}
                      </a>
                    ) : null}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardsCertificates;
