"use client";

import { motion } from 'framer-motion';

interface TechStackExplorerProps {
  technologies: string[];
  onFilter: (tech: string | null) => void;
  activeFilter: string | null;
}

const TechStackExplorer: React.FC<TechStackExplorerProps> = ({
  technologies,
  onFilter,
  activeFilter,
}) => {
  const uniqueTechs = Array.from(new Set(technologies)).sort();

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Filter by Technology
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <motion.button
          onClick={() => onFilter(null)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeFilter === null
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>
        
        {uniqueTechs.map((tech) => (
          <motion.button
            key={tech}
            onClick={() => onFilter(tech)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === tech
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tech}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default TechStackExplorer;
