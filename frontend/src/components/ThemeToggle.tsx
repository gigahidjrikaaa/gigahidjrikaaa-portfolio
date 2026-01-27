"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme, isMounted } = useTheme();

  if (!isMounted) {
    return null;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-gray-900/10 transition-colors hover:bg-gray-50 dark:bg-gray-800 dark:ring-white/10 dark:hover:bg-gray-700"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FaMoon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <FaSun className="h-5 w-5 text-yellow-500" />
      )}
    </motion.button>
  );
};

export default ThemeToggle;
