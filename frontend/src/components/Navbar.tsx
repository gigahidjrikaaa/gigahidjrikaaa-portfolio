// components/Navbar.js
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext'; // Import the useAuth hook

const Navbar = () => {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const copy = {
    brand: '[GigaDev]',
    openMenu: 'Open main menu',
    navLabel: 'Primary',
    links: {
      about: 'About',
      highlights: 'Highlights',
      awards: 'Awards',
      projects: 'Projects',
      skills: 'Skills',
      experience: 'Experience',
      education: 'Education',
      services: 'Services',
      testimonials: 'Testimonials',
      blog: 'Blog',
      contact: 'Contact',
      admin: 'Admin',
    },
  };

  // Navigation links configuration
  const navLinks = [
    { name: copy.links.about, href: '#about' },
    { name: copy.links.highlights, href: '#highlights' },
    { name: copy.links.awards, href: '#awards' },
    { name: copy.links.projects, href: '#projects' },
    { name: copy.links.skills, href: '#skills' },
    { name: copy.links.experience, href: '#experience' },
    { name: copy.links.education, href: '#education' },
    { name: copy.links.services, href: '#services' },
    { name: copy.links.testimonials, href: '#testimonials' },
    { name: copy.links.blog, href: '#blog' },
    { name: copy.links.contact, href: '#contact' },
  ];

  // Conditionally add the Admin link
  const allLinks = [...navLinks];
  if (isAuthenticated) {
    allLinks.push({ name: copy.links.admin, href: '/admin' });
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-200/50" aria-label={copy.navLabel}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold font-heading text-primary hover:text-primary/80 transition-colors duration-200">
              {copy.brand}
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {/* Don't render auth-dependent links until client-side hydration is complete */}
            {!isLoading && allLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-text-secondary hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            {/* The cast below helps TypeScript recognize the button element if JSX intrinsics are not configured correctly. */}
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
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
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200/80">
          {!isLoading && allLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
              className="block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:text-primary hover:bg-gray-50 transition-colors duration-200"
              // Add active link styling here if needed
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;