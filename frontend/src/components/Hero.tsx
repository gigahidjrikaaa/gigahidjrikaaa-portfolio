'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { apiService, ProfileResponse } from '@/services/api';
import HeroParticles from './HeroParticles';

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const copy = {
  name: 'Giga Hidjrika Aura Adkhy',
  headline: 'Engineering scalable systems & intelligent products.',
  subhead: 'I design and build robust full-stack applications, distributed systems, and AI-enabled tools with a focus on performance, clean architecture, and practical solutions.',
  ctaPrimary: 'Explore Projects',
  ctaSecondary: 'Get in touch',
};

const Hero = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const reduceMotion = useReducedMotion();

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

  const location = profile?.location || 'Yogyakarta, ID';

  return (
    <section id="hero" className="relative min-h-[90vh] md:min-h-screen bg-zinc-50 flex items-center justify-center overflow-hidden pt-24 pb-16">
      {/* Structural Minimal Background with Interactive Particles */}
      <HeroParticles />
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 m-auto h-[400px] w-[400px] rounded-full bg-emerald-200/40 opacity-50 blur-[120px]"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center max-w-6xl mx-auto">
          
          {/* Left Content */}
          <div className="max-w-2xl pt-10">
            <motion.div 
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
              variants={heroVariants}
              className="flex items-center gap-3 mb-8"
            >
              <div className="flex items-center justify-center relative w-2 h-2">
                <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Available for work</span>
              <span className="hidden sm:block w-8 h-px bg-zinc-300"></span>
              <span className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{location}</span>
            </motion.div>

            <motion.h1 
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
              variants={heroVariants}
              className="text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-zinc-900 leading-[1.05]"
            >
               {copy.name.split(' ')[0]} <br className="md:hidden" />
               <span className="text-zinc-400">{copy.name.split(' ').slice(1).join(' ')}</span>
            </motion.h1>

            <motion.div
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
              variants={{...heroVariants, visible: { ...heroVariants.visible, transition: { ...heroVariants.visible.transition, delay: 0.1 } }}}
              className="mt-8 max-w-xl"
            >
              <h2 className="text-2xl md:text-[1.75rem] font-medium tracking-tight text-zinc-800 mb-4 leading-snug">
                {copy.headline}
              </h2>
              <p className="text-[15px] md:text-base leading-relaxed text-zinc-600">
                {copy.subhead}
              </p>
            </motion.div>

            <motion.div 
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
              variants={{...heroVariants, visible: { ...heroVariants.visible, transition: { ...heroVariants.visible.transition, delay: 0.2 } }}}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#projects"
                className="inline-flex items-center justify-center px-6 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-all bg-zinc-900 rounded-lg hover:bg-zinc-800 hover:shadow-md hover:-translate-y-0.5 duration-300"
              >
                {copy.ctaPrimary}
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-6 py-3 text-[13px] font-medium uppercase tracking-wider transition-all bg-white border border-zinc-200 rounded-lg text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 hover:-translate-y-0.5 duration-300 shadow-sm"
              >
                {copy.ctaSecondary}
              </Link>
            </motion.div>

            {/* Quick Stats / Metadata Grid */}
            <motion.div
               initial={reduceMotion ? "visible" : "hidden"}
               animate="visible"
               variants={{...heroVariants, visible: { ...heroVariants.visible, transition: { ...heroVariants.visible.transition, delay: 0.3 } }}}
               className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 pt-8 border-t border-zinc-200/60"
            >
               <div>
                 <p className="text-2xl font-medium tracking-tight text-zinc-900">12+</p>
                 <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Shipped Projects</p>
               </div>
               <div>
                 <p className="text-2xl font-medium tracking-tight text-zinc-900">3+</p>
                 <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Years Building</p>
               </div>
               <div>
                 <p className="text-2xl font-medium tracking-tight text-zinc-900">AI / ML</p>
                 <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">System Design</p>
               </div>
               <div>
                 <p className="text-2xl font-medium tracking-tight text-zinc-900">Web3</p>
                 <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Decentralization</p>
               </div>
            </motion.div>
          </div>

          {/* Right Content - Floating Image Cards */}
          <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center pointer-events-none perspective-[1000px]">
             
             {/* Back Card */}
             <motion.div 
               initial={reduceMotion ? { opacity: 1, rotate: -4, x: -30, y: 30 } : { opacity: 0, y: 100, rotate: -15, scale: 0.8 }}
               animate={{ opacity: 1, y: 30, rotate: -2, x: -30, scale: 1 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
               className="absolute w-[240px] md:w-[280px] aspect-[3/4] rounded-sm bg-white shadow-2xl p-3 z-10 border border-zinc-200"
             >
               <div className="relative w-full h-[85%] overflow-hidden bg-zinc-100 grayscale hover:grayscale-0 transition-all duration-700">
                 <Image 
                   src="/giga-pics/giga-5.jpg" 
                   alt="Profile photo 2" 
                   fill 
                   className="object-cover"
                   sizes="(max-width: 768px) 240px, 280px"
                 />
               </div>
               <div className="w-full flex items-center justify-between pt-3 px-1 text-zinc-400">
                 <span className="text-[10px] font-mono uppercase tracking-wider">IMG_9042</span>
                 <span className="text-[10px] font-mono">2024</span>
               </div>
             </motion.div>

             {/* Front Card */}
             <motion.div 
               initial={reduceMotion ? { opacity: 1, rotate: 6, x: 20, y: -20 } : { opacity: 0, y: 150, rotate: 20, scale: 0.8 }}
               animate={{ opacity: 1, y: -20, rotate: 4, x: 20, scale: 1 }}
               transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
               className="absolute w-[260px] md:w-[320px] aspect-[3/4] rounded-sm bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3.5 z-20 border border-zinc-200 pointer-events-auto cursor-pointer"
               whileHover={{ scale: 1.05, rotate: 6, y: -30 }}
             >
               <div className="relative w-full h-[85%] overflow-hidden bg-zinc-200">
                  <Image 
                    src="/giga-pics/giga-1.jpg" 
                    alt="Profile photo" 
                    fill 
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 260px, 320px"
                  />
               </div>
               <div className="w-full flex items-center justify-between pt-4 px-1 text-zinc-400">
                 <span className="text-[10px] font-mono uppercase tracking-wider">SYS_INIT_OK</span>
                 <span className="text-[10px] font-mono">ACT_1</span>
               </div>
             </motion.div>

             {/* Little decorative technical overlay (replacing generic chip) */}
             <motion.div
               initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
               className="absolute -left-6 md:-left-12 bottom-32 z-30 pointer-events-auto flex flex-col gap-1 backdrop-blur-sm bg-white/40 p-3 shadow-sm border-l-2 border-emerald-500"
             >
               <span className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-zinc-600">
                 <span className="w-1.5 h-1.5 bg-emerald-500 inline-block animate-pulse" />
                 sys.status.online
               </span>
               <span className="text-[9px] font-mono text-zinc-400">LOC: -43.20 106.8</span>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;