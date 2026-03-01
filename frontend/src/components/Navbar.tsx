// components/Navbar.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
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
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out"
      aria-label={copy.navLabel}
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={reduceMotion ? {} : (hidden ? navVariants.hidden : navVariants.visible)}
    >
      <div
        className={[
          'mx-auto w-full transition-all duration-300',
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-zinc-200/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)]'
            : 'bg-transparent border-b border-transparent'
        ].join(' ')}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs font-bold tracking-tight transition-transform group-hover:scale-105">
                GH
              </div>
              <span className="text-[15px] font-medium tracking-tight text-zinc-900 transition-colors hidden sm:block">
                {copy.brand}
              </span>
            </Link>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {!isLoading && allLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={[
                    'relative text-[13px] font-medium uppercase tracking-[0.08em] transition-colors duration-200 flex items-center gap-1.5',
                    active
                      ? 'text-zinc-900'
                      : 'text-zinc-500 hover:text-zinc-900',
                  ].join(' ')}
                >
                  {link.name}
                  {link.isAdmin && (
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-600" aria-label={copy.adminBadge} />
                  )}
                  {active && (
                    <span className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-zinc-900 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <div
                className="flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-emerald-700"
                title={copy.adminBadge}
              >
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                <span>Admin</span>
              </div>
            )}
            <Link
              href="#contact"
              className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-2.5 text-[13px] font-medium uppercase tracking-[0.08em] text-white hover:bg-zinc-800 transition-colors duration-150"
            >
              {copy.cta}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">{copy.openMenu}</span>
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <XMarkIcon className="h-6 w-6" aria-hidden />
                  </motion.span>
                ) : (
                  <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Bars3Icon className="h-6 w-6" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
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
            className="md:hidden absolute top-full left-0 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-xl shadow-lg"
          >
            <div className="px-4 pb-6 pt-4 space-y-2">
              {isAdmin && (
                <div className="mb-4 flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-emerald-700">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>Logged in as Admin</span>
                </div>
              )}
              <div className="flex flex-col space-y-1">
                {!isLoading && allLinks.map((link) => {
                  const active = isLinkActive(link);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={[
                        'flex items-center gap-2 px-3 py-3 rounded-lg text-sm font-medium uppercase tracking-[0.1em] transition-colors duration-150',
                        active
                          ? 'text-zinc-900 bg-zinc-100/80'
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50',
                      ].join(' ')}
                    >
                      {link.name}
                      {link.isAdmin && <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />}
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4">
                <Link
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white hover:bg-zinc-800 transition-colors"
                >
                  {copy.cta}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;