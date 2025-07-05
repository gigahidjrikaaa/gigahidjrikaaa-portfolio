// components/Navbar.js
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation links configuration
  const navLinks = [
    { name: 'About', href: '#about' }, // Using hash links for potential single-page navigation
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md shadow-sm border-b border-gray-200/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold font-heading text-primary hover:text-primary/80 transition-colors duration-200">
              [GigaDev]
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-medium text-text-secondary hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm"
                // Add active link styling here if needed (requires scrollspy for hash links or usePathname for page routes)
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
              <span className="sr-only">Open main menu</span>
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
          {navLinks.map((link) => (
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