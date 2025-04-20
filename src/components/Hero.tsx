// src/components/Hero.js
import Link from 'next/link';

const Hero = () => {
  return (
    // Using <section> for semantic structure
    // Adding padding, text alignment, and ensuring minimum height
    // NOTE: Parallax background implementation is separate (see notes below)
    <section
      id="hero" // Optional ID if you want to link directly to the top
      className="relative flex items-center justify-center min-h-screen py-20 text-center text-white px-4 sm:px-6 lg:px-8"
      // Style for background (simple example, replace/enhance for parallax)
      style={{
        backgroundImage: 'url("/placeholder-hero-bg.jpg")', // Replace with your background image URL
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for text contrast */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Content Container - positioned above overlay */}
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Animated Headline Idea: Add animation classes if desired */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl mb-4 font-heading">
          Giga Hidjrika Aura Adkhy
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-xl mx-auto">
          Information Engineering Student | Building the Future with AI & Blockchain
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="#projects"
            className="inline-block rounded-md bg-accent px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-accent/80 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors duration-200"
          >
            View Projects
          </Link>
          <Link
            href="#contact"
            className="inline-block rounded-md bg-secondary/70 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-secondary/90 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-secondary transition-colors duration-200"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;