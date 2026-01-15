"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaBrain, FaCubes, FaRocket, FaPalette } from "react-icons/fa";
import { apiService, ServiceResponse } from "@/services/api";

const copy = {
  title: "Services",
  subtitle: "Ways I can help you build, launch, and scale ambitious products.",
  empty: "Services are being curated. Check back soon!",
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  brain: FaBrain,
  cubes: FaCubes,
  rocket: FaRocket,
  palette: FaPalette,
};

const fallbackIcons = [FaBrain, FaRocket, FaCubes, FaPalette];

const Services = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const serviceItems = useMemo(() => {
    if (services.length === 0) return [];
    return services.map((service, index) => {
      const Icon = service.icon ? iconMap[service.icon] : undefined;
      const Fallback = fallbackIcons[index % fallbackIcons.length];
      return { ...service, Icon: Icon ?? Fallback };
    });
  }, [services]);

  return (
    <section id="services" className="relative overflow-hidden bg-[#0a0f1f] py-16 sm:py-24">
      <div className="absolute inset-0">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{copy.title}</h2>
          <p className="mt-4 text-base text-gray-300 sm:text-lg">{copy.subtitle}</p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="text-sm text-gray-400">Loading...</div>
          ) : serviceItems.length === 0 ? (
            <div className="text-sm text-gray-400">{copy.empty}</div>
          ) : (
            serviceItems.map((service, index) => (
              <motion.article
                key={service.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-200">
                  <service.Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{service.title}</h3>
                {service.subtitle ? (
                  <p className="mt-2 text-sm text-cyan-200/80">{service.subtitle}</p>
                ) : null}
                {service.description ? (
                  <p className="mt-3 text-sm text-gray-300">{service.description}</p>
                ) : null}
              </motion.article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Services;
