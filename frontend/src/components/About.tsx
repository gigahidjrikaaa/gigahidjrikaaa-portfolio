// src/components/About.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Code2, Zap } from 'lucide-react';
import Image from 'next/image';
import { apiService, ProfileResponse } from '@/services/api';

// ─── Data ─────────────────────────────────────────────────────────────────────

const milestones = [
  { year: '2021', event: 'Started CS at Universitas Gadjah Mada' },
  { year: '2022', event: 'First production freelance app shipped' },
  { year: '2023', event: 'Built & launched first AI product' },
  { year: '2024', event: 'Deep-dived into Web3 & Solidity' },
  { year: '2025', event: 'Building AI-powered developer tools' },
];

const techStack = [
  'TypeScript', 'Python', 'React', 'Next.js',
  'FastAPI', 'PyTorch', 'Solidity', 'PostgreSQL',
];

const statItems = [
  { target: 12, suffix: '+', label: 'Projects shipped' },
  { target: 3,  suffix: '+', label: 'Years building'   },
  { target: 8,  suffix: '',  label: 'Core tech stacks'  },
];

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const frames = 40;
    const increment = target / frames;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) { setValue(target); clearInterval(interval); }
      else setValue(Math.floor(current));
    }, 1000 / frames);
    return () => clearInterval(interval);
  }, [inView, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const About = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  useEffect(() => {
    apiService.getProfile().then(setProfile).catch(console.error);
  }, []);

  const headline = profile?.headline || 'A software engineer working across AI, blockchain, and modern web development — building products from concept to production.';
  const bio = profile?.bio || 'My work covers the full product lifecycle — from user interfaces and backend systems to AI integrations. I focus on writing clean code and shipping things that actually hold up.';
  const location = profile?.location || 'Yogyakarta, Indonesia';
  const availability = profile?.availability;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-32"
    >
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 right-0 h-[500px] w-[500px] rounded-full bg-emerald-50 opacity-60 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-sky-50 opacity-60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">

          {/* ── LEFT ──────────────────────────────────────────────────────── */}
          <div className="space-y-8">

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-400">
                About Me
              </span>
              <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
                I build things<br />
                <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                  that matter.
                </span>
              </h2>
            </motion.div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg leading-relaxed text-gray-600"
            >
              {headline}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="text-base leading-relaxed text-gray-400"
            >
              {bio}
            </motion.p>

            {/* Location + availability */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-2"
            >
              <span className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                {location}
              </span>
              {availability && (
                <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  {availability}
                </span>
              )}
            </motion.div>

            {/* Animated stats row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 divide-x divide-gray-100 rounded-2xl border border-gray-100 bg-gray-50 py-6"
            >
              {statItems.map(({ target, suffix, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-3">
                  <span className="text-3xl font-bold text-gray-900">
                    <Counter target={target} suffix={suffix} />
                  </span>
                  <span className="text-center text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Journey timeline */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">
                My Journey
              </p>
              <div className="relative space-y-4 pl-5">
                <div className="absolute left-[5px] top-1 bottom-1 w-px bg-gradient-to-b from-emerald-300 via-sky-200 to-transparent" />
                {milestones.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: -12 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.32 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative"
                  >
                    <div className="absolute -left-5 top-[3px] h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">{m.year}</p>
                    <p className="text-sm text-gray-600">{m.event}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT: Photo ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:sticky lg:top-24"
          >
            {/* Profile photo */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-gray-100 shadow-2xl">
              <Image
                src={profile?.avatar_url || '/profile.jpg'}
                alt="Giga Hidjrika Aura Adkhy"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 600px"
                quality={95}
                priority
              />
              {/* Bottom vignette */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-gray-900/70 to-transparent" />
            </div>

            {/* Left-side floating tech badges (desktop only) */}
            <div className="absolute left-0 top-10 -translate-x-[calc(100%+10px)] hidden flex-col gap-2 lg:flex">
              {techStack.slice(0, 4).map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.09, duration: 0.4 }}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md ring-1 ring-gray-900/5"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            {/* Right-side floating tech badges (desktop only) */}
            <div className="absolute right-0 bottom-36 translate-x-[calc(100%+10px)] hidden flex-col gap-2 lg:flex">
              {techStack.slice(4).map((tech, i) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 + i * 0.09, duration: 0.4 }}
                  className="whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md ring-1 ring-gray-900/5"
                >
                  {tech}
                </motion.span>
              ))}
            </div>

            {/* Mobile tech stack pills */}
            <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Bottom overlay "Currently Building" card */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur-sm ring-1 ring-white/60">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <Code2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900">Currently Building</p>
                <p className="truncate text-xs text-gray-500">AI-powered portfolio management platform</p>
              </div>
              <Zap className="ml-auto h-4 w-4 shrink-0 text-amber-400" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
