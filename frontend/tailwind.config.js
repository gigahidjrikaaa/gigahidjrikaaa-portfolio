// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enable class-based dark mode
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/**/*.{js,ts,jsx,tsx,mdx}', // Add src directory
    ],
    theme: {
      extend: {
        colors: {
          'primary': '#1E3A8A', // Example: Deep Blue
          'secondary': '#4B5563', // Example: Cool Gray
          'accent': '#10B981', // Example: Emerald Green (for flashy)
          'background': '#FFFFFF',
          'text-primary': '#111827',
          'text-secondary': '#4B5563',
        },
        fontFamily: {
          // Ensure fonts are linked in layout.js (e.g., Google Fonts)
          heading: ['Poppins', 'sans-serif'], // Example: Modern & clean
          body: ['Roboto', 'sans-serif'],    // Example: Highly readable
        },
        // Define custom spacing, keyframes for animations etc. here
      },
    },
    plugins: [require('@tailwindcss/typography')],
  }