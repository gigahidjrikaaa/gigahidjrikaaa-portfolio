// components/Footer.js
import React from 'react';
// import Link from 'next/link';

// Example Social Icons (using simple text, replace with actual SVG icons)
interface IconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

const GitHubIcon = (props: IconProps) => <span className={`sr-only ${props.className || ''}`} {...props}>GitHub</span>; // Replace with actual SVG
const LinkedInIcon = (props: IconProps) => <span className={`sr-only ${props.className || ''}`} {...props}>LinkedIn</span>; // Replace with actual SVG

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Replace with your actual social links
  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/yourusername', icon: GitHubIcon },
    { name: 'LinkedIn', href: 'https://linkedin.com/in/yourusername', icon: LinkedInIcon },
    // Add other relevant links (e.g., Twitter, personal blog)
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200/80 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright Notice */}
          <div className="text-sm text-text-secondary text-center md:text-left">
            © {currentYear} [Your Name]. All Rights Reserved.
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer" // Security best practice for external links
                className="text-text-secondary hover:text-primary transition-colors duration-200"
              >
                <item.icon className="h-6 w-6" aria-hidden="true" /> {/* Replace with actual icons */}
                <span className="sr-only">{item.name}</span> {/* Accessibility */}
              </a>
            ))}
          </div>

          {/* Optional: Add links to Privacy Policy, etc. */}
          {/* <div className="text-sm text-text-secondary">
            <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
              Privacy Policy
            </Link>
          </div> */}

        </div>
      </div>
    </footer>
  );
};

export default Footer;