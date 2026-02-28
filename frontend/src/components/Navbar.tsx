// components/Navbar.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, ArrowUpRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const { isAdmin, isLoading } = useAuth();
  const pathname = usePathname() || '';
  const reduceMotion = useReducedMotion();

  // --- Scroll-aware hide/show + compact mode ---
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
      // Hide when scrolling down >60 px from top, show on scroll up
      if (currentY > lastScrollY.current + 6 && currentY > 80) {
        setHidden(true);
        setIsMobileMenuOpen(false);
      } else if (currentY < lastScrollY.current - 4) {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Active section tracking via IntersectionObserver ---
  useEffect(() => {
    if (pathname !== '/') return;
    const sectionIds = ['about', 'experience', 'projects', 'skills', 'articles', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [pathname]);

  if (pathname.startsWith('/admin')) return null;

  const copy = {
    brand: 'Giga Hidjrika',
    openMenu: 'Open main menu',
    navLabel: 'Primary',
    cta: 'Get in Touch',
    adminBadge: 'Logged in as Admin',
    links: {
      about: 'About', experience: 'Experience', projects: 'Projects',
      skills: 'Skills', blog: 'Blog', contact: 'Contact', admin: 'Admin',
    },
  };

  const navLinks = [
    { name: copy.links.about,      href: '#about',      sectionId: 'about' },
    { name: copy.links.experience, href: '#experience', sectionId: 'experience' },
    { name: copy.links.projects,   href: '#projects',   sectionId: 'projects' },
    { name: copy.links.skills,     href: '#skills',     sectionId: 'skills' },
    { name: copy.links.blog,       href: '/blog',       sectionId: null },
    { name: copy.links.contact,    href: '#contact',    sectionId: 'contact' },
  ];

  const allLinks: Array<{ name: string; href: string; sectionId: string | null; isAdmin?: boolean }> = [...navLinks];
  if (isAdmin) allLinks.push({ name: copy.links.admin, href: '/admin', sectionId: null, isAdmin: true });

  const isLinkActive = (link: typeof allLinks[number]) => {
    if (link.href === '/blog') return pathname.startsWith('/blog');
    if (link.sectionId) return activeSection === link.sectionId;
    return false;
  };

  // Animation variants
  const navVariants = {
    visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    hidden:  { y: -90, opacity: 0, transition: { duration: 0.28, ease: [0.55, 0, 0.45, 1] } },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } },
    exit:   { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.18, ease: [0.55, 0, 0.45, 1] } },
  };

  return (
    <motion.nav
      className="fixed inset-x-0 top-0 z-50"
      aria-label={copy.navLabel}
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={reduceMotion ? {} : (hidden ? navVariants.hidden : navVariants.visible)}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main pill */}
        <div
          className={[
            'relative mt-4 flex items-center justify-between rounded-[28px] border px-4 transition-all duration-300',
            scrolled
              ? 'border-white/50 bg-white/90 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.10)] backdrop-blur-2xl'
              : 'border-white/40 bg-white/80 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl',
          ].join(' ')}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white text-xs font-bold tracking-tight"
              whileHover={reduceMotion ? {} : { scale: 1.06 }}
              whileTap={reduceMotion ? {} : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              GH
            </motion.div>
            <Link href="/" className="text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors">
              {copy.brand}
            </Link>
          </div>

          {/* Desktop center pill */}
          <div className="hidden md:flex md:items-center absolute left-1/2 -translate-x-1/2 rounded-full border border-gray-100 bg-gray-50/80 px-2 py-1.5 gap-0.5">
            {!isLoading && allLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={[
                    'relative text-xs font-semibold uppercase tracking-[0.14em] px-3.5 py-1.5 rounded-full transition-colors duration-200 flex items-center gap-1',
                    active
                      ? 'text-gray-900 bg-white shadow-sm border border-gray-200/80'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white/60',
                  ].join(' ')}
                >
                  {link.name}
                  {link.isAdmin && (
                    <ShieldCheckIcon className="h-3 w-3 text-emerald-600" aria-label={copy.adminBadge} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <div
                className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                title={copy.adminBadge}
              >
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Admin</span>
              </div>
            )}
            <motion.div whileHover={reduceMotion ? {} : { scale: 1.02 }} whileTap={reduceMotion ? {} : { scale: 0.97 }}>
              <Link
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-gray-700 transition-colors duration-150"
              >
                {copy.cta}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <motion.button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              whileTap={reduceMotion ? {} : { scale: 0.92 }}
            >
              <span className="sr-only">{copy.openMenu}</span>
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <XMarkIcon className="h-5 w-5" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Bars3Icon className="h-5 w-5" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            variants={reduceMotion ? {} : mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden mx-4 mt-2"
          >
            <div className="rounded-2xl border border-gray-200/70 bg-white/96 px-3 py-3 shadow-xl backdrop-blur-xl">
              {isAdmin && (
                <div className="mb-2 mx-1 flex items-center justify-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />
                  <span>Logged in as Admin</span>
                </div>
              )}
              <div className="space-y-0.5">
                {!isLoading && allLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={[
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-150',
                        active
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {link.name}
                      {link.isAdmin && <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" />}
                    </Link>
                  );
                })}
              </div>
              <Link
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-gray-700 transition-colors"
              >
                {copy.cta}
                <ArrowUpRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;