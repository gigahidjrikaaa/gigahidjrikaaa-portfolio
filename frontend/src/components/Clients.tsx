"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Building2 } from "lucide-react";
import { apiService, ClientResponse } from "@/services/api";
import LoadingAnimation from "@/components/ui/LoadingAnimation";

// ---------------------------------------------------------------------------
// Featured client card — larger, text description visible
// ---------------------------------------------------------------------------
const FeaturedClientCard = ({
  client,
  index,
}: {
  client: ClientResponse;
  index: number;
}) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.a
      ref={ref}
      href={client.website_url || "#"}
      target={client.website_url ? "_blank" : undefined}
      rel={client.website_url ? "noopener noreferrer" : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="group flex flex-col gap-4 rounded-[24px] border border-gray-100 bg-white p-7 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
    >
      {/* Logo area */}
      <div className="flex h-16 items-center">
        {client.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={client.logo_url}
            alt={client.name}
            className="max-h-12 max-w-[140px] object-contain opacity-75 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-gray-400" />
            <span className="text-base font-semibold text-gray-700">{client.name}</span>
          </div>
        )}
      </div>

      {/* Name + description */}
      <div>
        <p className="text-sm font-semibold text-gray-700">{client.name}</p>
        {client.description && (
          <p className="mt-1 text-xs leading-relaxed text-gray-500">{client.description}</p>
        )}
      </div>

      {/* Link hint */}
      {client.website_url && (
        <div className="mt-auto flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors">
          <ExternalLink className="h-3 w-3" />
          Visit site
        </div>
      )}
    </motion.a>
  );
};

// ---------------------------------------------------------------------------
// Regular client tile — minimal logo box
// ---------------------------------------------------------------------------
const ClientTile = ({
  client,
  index,
}: {
  client: ClientResponse;
  index: number;
}) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.a
      ref={ref}
      href={client.website_url || "#"}
      target={client.website_url ? "_blank" : undefined}
      rel={client.website_url ? "noopener noreferrer" : undefined}
      title={client.description || client.name}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.04 }}
      className="group relative flex h-24 items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
    >
      {client.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={client.logo_url}
          alt={client.name}
          className="max-h-10 max-w-[120px] object-contain opacity-60 transition-opacity group-hover:opacity-100"
        />
      ) : (
        <span className="text-sm font-semibold text-gray-500">{client.name}</span>
      )}
    </motion.a>
  );
};

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const Clients = () => {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });

  useEffect(() => {
    apiService
      .getClients()
      .then(setClients)
      .catch((err) => console.error("Failed to fetch clients", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-24 dark:bg-zinc-900 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingAnimation label="Loading clients…" />
        </div>
      </section>
    );
  }

  if (clients.length === 0) return null;

  const featured = clients.filter((c) => c.is_featured);
  const rest = clients.filter((c) => !c.is_featured);

  return (
    <section
      id="clients"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 dark:bg-zinc-900 md:py-32"
    >
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Track Record
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Trusted By
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">
            Companies and organizations I&apos;ve had the privilege to build with,
            contribute to, and deliver value for.
          </p>

          {clients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 shadow-sm"
            >
              <Building2 className="h-4 w-4 text-gray-400" />
              {clients.length} client{clients.length !== 1 ? "s" : ""} &amp; partners
            </motion.div>
          )}
        </motion.div>

        {/* Featured clients — larger cards with description */}
        {featured.length > 0 && (
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((client, idx) => (
              <FeaturedClientCard key={client.id} client={client} index={idx} />
            ))}
          </div>
        )}

        {/* Regular clients — compact logo grid */}
        {rest.length > 0 && (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {rest.map((client, idx) => (
              <ClientTile key={client.id} client={client} index={idx} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Clients;

