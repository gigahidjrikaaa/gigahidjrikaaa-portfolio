// src/components/About.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { MapPin, Code2, GraduationCap, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import { apiService, ProfileResponse } from '@/services/api';

// ─── Data ─────────────────────────────────────────────────────────────────────

const milestones = [
  { year: '2021', event: 'Started CS at Universitas Gadjah Mada', current: false },
  { year: '2022', event: 'First production freelance app shipped', current: false },
  { year: '2023', event: 'Built & launched first AI product', current: false },
  { year: '2024', event: 'Deep-dived into Web3 & Solidity', current: false },
  { year: '2025', event: 'Building AI-powered developer tools', current: true },
];

const statItems = [
  { target: 12, suffix: '+', label: 'Projects Shipped' },
  { target: 3,  suffix: '+', label: 'Years Experience'   },
  { target: 50,  suffix: 'k+',  label: 'Lines of Code'  },
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
  const availability = profile?.availability || 'Available for work';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 dark:bg-black bg-zinc-50 overflow-hidden md:py-32"
    >
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-sky-500/5 blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 md:mb-20 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4"
          >
            About <span className="text-zinc-400">Me</span>
          </motion.h2>
        </div>

        {/* Bento Grid Layout */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >

          {/* 1. Main Bio Card (col-span-2, row-span-2) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 lg:col-span-2 md:row-span-2 relative overflow-hidden rounded-3xl p-8 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <LayoutGrid className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                </span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Who I Am</h3>
              </div>
              
              <p className="text-xl md:text-2xl font-medium leading-tight text-gray-900 dark:text-zinc-100 mb-6">
                {headline}
              </p>
              
              <div className="mt-auto space-y-4">
                <p className="text-base text-gray-600 dark:text-zinc-400">
                  {bio}
                </p>
                
                <div className="flex flex-wrap gap-3 pt-4">
                  <span className="flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    {availability}
                  </span>
                </div>
              </div>
            </div>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </motion.div>

          {/* 2. Photo/Image Card (col-span-1, row-span-2) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 lg:col-span-1 md:row-span-2 relative overflow-hidden rounded-3xl h-[400px] md:h-auto group"
          >
            <Image
              src={profile?.avatar_url || '/profile.jpg'}
              alt="Profile"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Code2 className="w-4 h-4" />
                <span>Currently Building</span>
              </div>
              <p className="text-white font-medium mt-1 group-hover:text-emerald-400 transition-colors">AI & Full-stack Tools</p>
            </div>
          </motion.div>

          {/* 3. Stats Column (col-span-1, row-span-2 for LG) */}
          <div className="md:col-span-3 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 md:row-span-2">
            {statItems.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`relative overflow-hidden rounded-3xl p-6 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center ${i === 0 ? 'bg-zinc-900 border-none dark:bg-white text-white dark:text-zinc-900' : ''}`}
              >
                <span className={`text-4xl font-bold ${i === 0 ? 'text-white dark:text-zinc-900' : 'text-gray-900 dark:text-white'}`}>
                  <Counter target={stat.target} suffix={stat.suffix} />
                </span>
                <span className={`text-sm mt-2 font-medium ${i === 0 ? 'text-zinc-300 dark:text-zinc-500' : 'text-zinc-500 dark:text-zinc-400'}`}>{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* 4. Timeline / Journey Card (col-span-full, row-span-1) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 relative overflow-hidden rounded-3xl p-8 bg-zinc-900 dark:bg-zinc-900/80 border border-zinc-800 group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity group-hover:-translate-y-2 group-hover:translate-x-2 duration-500">
              <GraduationCap className="w-32 h-32 text-zinc-100" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-8">My Journey</h3>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-4 justify-between relative z-10">
              {milestones.map((m) => (
                <div key={m.year} className="flex-1 relative pl-6 md:pl-0 md:pt-6 border-l md:border-l-0 md:border-t border-zinc-700/50">
                  {/* Timeline dot */}
                  <div className={`absolute left-[-5px] md:left-auto md:top-[-5px] h-2.5 w-2.5 rounded-full ring-4 ring-zinc-900 ${m.current ? 'bg-emerald-500 box-content shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-zinc-600'}`} />
                  
                  <p className={`text-sm font-bold mt-[-4px] md:mt-2 mb-1 ${m.current ? 'text-emerald-400' : 'text-zinc-400'}`}>{m.year}</p>
                  <p className="text-sm text-zinc-300 pr-4">{m.event}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default About;

