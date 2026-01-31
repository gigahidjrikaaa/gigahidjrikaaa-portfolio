"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronUpIcon } from "@heroicons/react/24/solid";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-8 left-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 px-3 py-3 shadow-lg transition hover:bg-gray-700 hover:scale-110 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Back to top"
    >
      <ChevronUpIcon className="h-5 w-5 text-white dark:text-gray-900" />
    </motion.button>
  );
};

export default BackToTop;