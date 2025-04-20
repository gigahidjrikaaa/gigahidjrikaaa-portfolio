'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: [0.6, 0.01, 0.05, 0.95],
    },
  },
};

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex items-center min-h-screen overflow-hidden bg-background"
    >
      {/* Background Image with overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.jpg"
          alt="Futuristic cyberpunk city"
          fill
          priority
          className="object-cover w-full h-full opacity-80"
          style={{ filter: 'blur(2px) brightness(0.7)' }}
        />
        {/* Neon gradient overlays for cyberpunk effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-transparent to-pink-600/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-pink-500/20 rounded-full blur-2xl" />
      </div>

      {/* Animated Neon Grid */}
      <motion.svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        aria-hidden="true"
        initial={{ opacity: 0.7 }}
        animate={{ opacity: [0.7, 1, 0.7], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Vertical lines */}
        {[...Array(18)].map((_, i) => (
          <motion.line
            key={`v-${i}`}
            x1={80 * i}
            y1="0"
            x2={80 * i}
            y2="800"
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.05, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
        {/* Horizontal lines */}
        {[...Array(11)].map((_, i) => (
          <motion.line
            key={`h-${i}`}
            x1="0"
            y1={80 * i}
            x2="1440"
            y2={80 * i}
            stroke={i % 2 === 0 ? "#00fff7" : "#ff00cc"}
            strokeWidth="1"
            strokeOpacity="0.13"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.07, duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
          />
        ))}
      </motion.svg>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="max-w-2xl text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Glassmorphism Panel */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8 md:p-12 mb-8">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 font-heading drop-shadow-[0_2px_16px_rgba(0,255,255,0.25)]"
              variants={itemVariants}
            >
              <span className="text-cyan-400">Giga Hidjrikaaa</span>
              <br />
              <span className="text-pink-400">Digital Visionary</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl text-gray-200 mb-8 font-light"
              variants={itemVariants}
            >
              Building the future at the intersection of <span className="text-cyan-300 font-semibold">AI</span> & <span className="text-pink-300 font-semibold">Blockchain</span>.<br />
              <span className="text-white/80">Information Engineering Student & Creative Technologist.</span>
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4"
              variants={itemVariants}
            >
              <Link
                href="#projects"
                className="inline-block rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-black font-semibold px-7 py-3 shadow-lg neon-glow-cyan transition-all duration-200"
              >
                View Projects
              </Link>
              <Link
                href="#contact"
                className="inline-block rounded-full border border-pink-400 text-pink-300 hover:bg-pink-500/20 font-semibold px-7 py-3 shadow-lg neon-glow-pink transition-all duration-200"
              >
                Get In Touch
              </Link>
            </motion.div>
          </div>
          {/* Subtle 3D avatar or logo */}
          <motion.div
            className="flex items-center gap-4 mt-4"
            variants={itemVariants}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-pink-400 to-purple-500 border-4 border-white/20 shadow-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/hero-bg.jpg"
                alt="Avatar"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <span className="block text-sm text-gray-300">Based in Tokyo, Japan</span>
              <span className="block text-xs text-cyan-400/80">Open for freelance & collab</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;