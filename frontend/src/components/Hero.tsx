'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { apiService } from '@/services/api';
import { GridPattern } from './decorations/GridPattern';
import { HeroGraphic } from './decorations/sections/HeroGraphic';
import Magnetic from './Magnetic';
import CircularBadge from './CircularBadge';
import CountUp from './CountUp';
import { EASE_OUT } from '@/lib/motion';

const copy = {
  name: 'Giga Hidjrika Aura Adkhy',
  headline: 'Building dependable software for real users.',
  subhead: 'I design and ship full-stack products, backend services, and AI features with an emphasis on reliability, maintainability, and clear product outcomes.',
  ctaPrimary: 'Explore Projects',
  ctaSecondary: 'Get in touch',
};

interface HeroProps {
  /** Server-rendered profile (ISR). When present, skips the client fetch. */
  initialProfile?: { location?: string | null } | null;
}

/** One word rising out of an overflow clip — the site's reveal DNA. */
const MaskedWord = ({
  word,
  delay,
  className = '',
}: {
  word: string;
  delay: number;
  className?: string;
}) => (
  <span className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]">
    <motion.span
      className={`inline-block ${className}`}
      initial={{ y: '112%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.85, ease: EASE_OUT, delay }}
    >
      {word}
    </motion.span>
  </span>
);

const Hero = ({ initialProfile = null }: HeroProps) => {
  const [profile, setProfile] = useState<{ location?: string | null } | null>(initialProfile);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (initialProfile) return; // server data present — no client fetch needed
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const data = await apiService.getProfile();
        if (!cancelled) setProfile(data);
      } catch (error) {
        if (!cancelled) console.error('Failed to load profile data:', error);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [initialProfile]);

  const location = profile?.location || 'Yogyakarta, ID';

  // Scroll-linked exit: layers peel away at different depths.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const cardsRotate = useTransform(scrollYProgress, [0, 1], [0, -4]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // Mouse parallax: orbit layer drifts with the cursor, cards counter-drift.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbitMX = useSpring(useTransform(mouseX, (v) => v * 26), { stiffness: 50, damping: 20 });
  const orbitMY = useSpring(useTransform(mouseY, (v) => v * 26), { stiffness: 50, damping: 20 });
  const cardsMX = useSpring(useTransform(mouseX, (v) => v * -12), { stiffness: 50, damping: 20 });
  const cardsMY = useSpring(useTransform(mouseY, (v) => v * -12), { stiffness: 50, damping: 20 });

  const handleMouseMove = (event: React.MouseEvent) => {
    if (reduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const nameLines = [
    { words: ['Giga'], className: 'text-zinc-900' },
    { words: ['Hidjrika', 'Aura', 'Adkhy'], className: 'text-zinc-500' },
  ];
  let wordDelay = 0.25;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  });

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] md:min-h-screen bg-zinc-50 flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      <GridPattern />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center max-w-6xl mx-auto">

          {/* Left Content */}
          <motion.div style={reduceMotion ? undefined : { y: textY, opacity: textOpacity }} className="max-w-2xl pt-10">
            {/* Availability badge: dot pops with a single arrival ripple,
                then the divider draws itself out. */}
            <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-8">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-emerald-500"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.5 }}
                />
                <motion.span
                  className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.35 }}
                />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Available for work</span>
              <motion.span
                className="hidden sm:block h-px w-8 origin-left bg-zinc-300"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.55 }}
              />
              <motion.span
                className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500"
                {...fadeUp(0.6)}
              >
                {location}
              </motion.span>
            </motion.div>

            {/* Name: per-word masked rise, two lines */}
            <h1
              aria-label={copy.name}
              className="break-words text-[3.5rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight text-zinc-900 leading-[1.05]"
            >
              {nameLines.map((line, lineIdx) => (
                <Fragment key={lineIdx}>
                  <span className={`block ${lineIdx > 0 ? 'sm:pl-[0.04em]' : ''}`}>
                    {line.words.map((word) => {
                      const delay = wordDelay;
                      wordDelay += 0.09;
                      return (
                        <Fragment key={word}>
                          {line.words.indexOf(word) > 0 && ' '}
                          <MaskedWord word={word} delay={delay} className={line.className} />
                        </Fragment>
                      );
                    })}
                  </span>
                </Fragment>
              ))}
            </h1>

            <motion.div {...fadeUp(0.6)} className="mt-8 max-w-xl">
              <h2 className="text-2xl md:text-[1.75rem] font-medium tracking-tight text-zinc-800 mb-4 leading-snug">
                {copy.headline}
              </h2>
              <p className="text-[15px] md:text-base leading-relaxed text-zinc-600">
                {copy.subhead}
              </p>
            </motion.div>

            <motion.div
              {...fadeUp(0.75)}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Magnetic strength={0.3}>
                <Link
                  href="#projects"
                  className="inline-flex items-center justify-center px-6 py-3 text-[13px] font-medium uppercase tracking-wider text-white transition-colors bg-zinc-900 rounded-lg hover:bg-zinc-800 duration-300"
                >
                  {copy.ctaPrimary}
                </Link>
              </Magnetic>
              <Magnetic strength={0.3}>
                <Link
                  href="#contact"
                  className="inline-flex items-center justify-center px-6 py-3 text-[13px] font-medium uppercase tracking-wider transition-colors bg-white border border-zinc-200 rounded-lg text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm duration-300"
                >
                  {copy.ctaSecondary}
                </Link>
              </Magnetic>
            </motion.div>

            {/* Quick Stats: numerals count up as they land */}
            <motion.div
              {...fadeUp(0.9)}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 pt-8 border-t border-zinc-200/60"
            >
              <div>
                <p className="text-2xl font-medium tracking-tight text-zinc-900">
                  <CountUp value={12} suffix="+" />
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Shipped Projects</p>
              </div>
              <div>
                <p className="text-2xl font-medium tracking-tight text-zinc-900">
                  <CountUp value={3} suffix="+" />
                </p>
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
          </motion.div>

          {/* Right Content — orbital system + floating photo cards */}
          <div className="relative hidden w-full h-[560px] items-center justify-center pointer-events-none perspective-[1000px] lg:flex">
            {/* Orbit layer: deepest, drifts with the cursor, peels fastest on scroll */}
            <motion.div
              style={reduceMotion ? undefined : { y: orbitY }}
              className="absolute inset-0 flex items-center justify-center -z-10"
            >
              <motion.div
                style={reduceMotion ? undefined : { x: orbitMX, y: orbitMY }}
                className="w-[115%] max-w-none opacity-70"
              >
                <HeroGraphic />
              </motion.div>
            </motion.div>

            {/* Card layer: counter-drifts against the cursor */}
            <motion.div
              style={reduceMotion ? undefined : { x: cardsMX, y: cardsMY }}
              className="absolute inset-0"
            >
              <motion.div
                style={reduceMotion ? undefined : { y: cardsY, rotate: cardsRotate }}
                className="absolute inset-0"
              >
                {/* Back Card */}
                <motion.div
                  initial={reduceMotion ? { opacity: 1, rotate: -4, x: -30, y: 30 } : { opacity: 0, y: 100, rotate: -15, scale: 0.8 }}
                  animate={{ opacity: 1, y: 30, rotate: -2, x: -30, scale: 1 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                  className="absolute w-[240px] md:w-[280px] aspect-[3/4] rounded-sm bg-white shadow-2xl p-3 z-10 border border-zinc-200"
                >
                  <div className="relative w-full h-[85%] overflow-hidden bg-zinc-100 grayscale hover:grayscale-0 transition-all duration-700">
                    <Image
                      src="/giga-pics/giga-3.webp"
                      alt="Profile photo 2"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 240px, 280px"
                    />
                  </div>
                  <div className="w-full flex items-center justify-between pt-3 px-1 text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Yogyakarta, ID</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">2024</span>
                  </div>
                </motion.div>

                {/* Front Card */}
                <motion.div
                  initial={reduceMotion ? { opacity: 1, rotate: 6, x: 20, y: -20 } : { opacity: 0, y: 150, rotate: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: -20, rotate: 4, x: 20, scale: 1 }}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                  className="absolute w-[260px] md:w-[320px] aspect-[3/4] rounded-sm bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3.5 z-20 border border-zinc-200 pointer-events-auto cursor-pointer"
                  whileHover={{ scale: 1.05, rotate: 6, y: -30 }}
                >
                  <div className="relative w-full h-[85%] overflow-hidden bg-zinc-200">
                    <Image
                      src="/giga-pics/giga-1.webp"
                      alt="Profile photo"
                      fill
                      priority
                      className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 768px) 260px, 320px"
                    />
                  </div>
                  <div className="w-full flex items-center justify-between pt-4 px-1 text-zinc-400">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Giga Hidjrika</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Est. 2022</span>
                  </div>

                  {/* Rotating circular badge pinned to the card's corner */}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.15 }}
                    className="absolute -bottom-9 -left-11 z-30 h-28 w-28 rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] border border-zinc-100"
                  >
                    <CircularBadge className="h-full w-full" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Headline + subhead + CTAs + stats live below the name, outside the
            h1's parallax wrapper so the grid row height stays stable. */}
      </div>

      {/* Scroll cue: fades out as soon as the page starts moving */}
      <motion.div
        style={reduceMotion ? undefined : { opacity: cueOpacity }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 md:flex"
        {...fadeUp(1.3)}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-400">Scroll</span>
        <span className="relative block h-11 w-px overflow-hidden bg-zinc-200">
          <motion.span
            className="absolute left-0 top-0 block h-3 w-px bg-zinc-500"
            animate={reduceMotion ? undefined : { y: [-12, 44] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: EASE_OUT, repeatDelay: 0.5 }}
          />
        </span>
      </motion.div>
    </section>
  );
};

export default Hero;
