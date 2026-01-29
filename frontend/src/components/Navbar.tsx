// components/Navbar.js
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, PhoneIcon, CameraIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext'; // Import the useAuth hook

const Navbar = () => {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state
  const pathname = usePathname() || '';

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const copy = {
    brand: 'Giga Hidjrika',
    openMenu: 'Open main menu',
    navLabel: 'Primary',
    links: {
      about: 'About',
      experience: 'Experience',
      projects: 'Projects',
      skills: 'Skills',
      blog: 'Blog',
      contact: 'Contact',
      admin: 'Admin',
    },
    cta: 'Get in Touch',
    social: {
      phone: 'Call',
      socials: 'Socials',
    },
  };

  // Navigation links configuration
  const navLinks = [
    { name: copy.links.about, href: '#about' },
    { name: copy.links.experience, href: '#experience' },
    { name: copy.links.projects, href: '#projects' },
    { name: copy.links.skills, href: '#skills' },
    { name: copy.links.blog, href: '/blog' },
    { name: copy.links.contact, href: '#contact' },
  ];

  // Conditionally add the Admin link
  const allLinks = [...navLinks];
  if (isAuthenticated) {
    allLinks.push({ name: copy.links.admin, href: '/admin' });
  }

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label={copy.navLabel}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mt-4 flex items-center justify-between rounded-[28px] border border-white/40 bg-white/80 px-4 py-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white text-xs font-semibold">
              GH
            </div>
            <Link href="/" className="text-base font-semibold text-gray-900">
              {copy.brand}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-2 absolute left-1/2 -translate-x-1/2 rounded-full border border-gray-200 bg-white/90 px-4 py-2 shadow-sm">
            {/* Don't render auth-dependent links until client-side hydration is complete */}
            {!isLoading && allLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-600 hover:text-gray-900 transition-colors duration-200 px-3 py-2 rounded-full"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <a
              href="tel:+628000000000"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:text-gray-900"
              aria-label={copy.social.phone}
            >
              <PhoneIcon className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:text-gray-900"
              aria-label={copy.social.socials}
            >
              <CameraIcon className="h-4 w-4" />
            </a>
            <Link
              href="#contact"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              {copy.cta}
              <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {/* The cast below helps TypeScript recognize the button element if JSX intrinsics are not configured correctly. */}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen ? 'true' : 'false'} // Accessibility attribute
            >
              <span className="sr-only">{copy.openMenu}</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {/* Use a transition library like Headless UI or Framer Motion for smoother animations */}
      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden transition-all duration-300 ease-out`}
        id="mobile-menu"
      >
        <div className="mt-2 rounded-2xl border border-gray-200/60 bg-white/95 px-3 py-3 shadow-lg">
          {!isLoading && allLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
              className="block px-3 py-2 rounded-md text-sm font-semibold uppercase tracking-[0.15em] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              // Add active link styling here if needed
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="#contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            {copy.cta}
            <ArrowUpRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;