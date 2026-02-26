'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { apiService, ProfileResponse } from '@/services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.01, 0.05, 0.95],
    },
  },
};

const copy = {
  eyebrow: 'YOGYAKARTA',
  headline: 'Hi, I\'m Giga Hidjrika Aura Adkhy — Building AI-Powered Products and Full-Stack Solutions.',
  subhead: 'I build across AI, web3, and full-stack engineering — with a focus on practical, well-crafted solutions.',
  ctaPrimary: 'Let\'s Connect',
  heroAlt: 'Modern interior workspace',
};

const heroStats = [
  {
    value: '12+',
    label: 'Projects shipped. End-to-end builds from concept to production.',
    icon: ClockIcon,
  },
  {
    value: '3+',
    label: 'Years building. Focused on AI, Web3, and product design.',
    icon: ChartBarIcon,
  },
];

const Hero = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiService.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile data:', error);
      }
    };

    loadProfile();
  }, []);

  const heroLocation = profile?.location || copy.eyebrow;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-bg.jpg"
          alt={copy.heroAlt}
          fill
          priority
          className="object-cover"
        />
        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-end pb-16 pt-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left column: Text content */}
            <div className="space-y-6">
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {heroLocation}
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {copy.headline}
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
              >
                {copy.subhead}
              </motion.p>

              <motion.div variants={itemVariants}>
                <Link
                  href="#contact"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {copy.ctaPrimary}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            </div>

            {/* Right column: Stat cards */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 lg:items-end"
            >
              {heroStats.map((stat) => (
                <div
                  key={stat.value}
                  className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md lg:max-w-xs"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl font-semibold text-white sm:text-4xl">
                      {stat.value}
                    </span>
                    <stat.icon className="h-5 w-5 text-white/60" />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;