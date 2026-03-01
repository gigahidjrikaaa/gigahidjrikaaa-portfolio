"use client";

import { motion } from 'framer-motion';
import {
  FaReact, FaNodeJs, FaPython, FaGithub, FaDocker, FaAws, FaJsSquare
} from 'react-icons/fa';
import {
  SiNextdotjs, SiTypescript, SiTailwindcss, SiVuedotjs, SiGraphql,
  SiTensorflow, SiPytorch, SiSolidity, SiPostgresql, SiMongodb,
  SiFirebase, SiVercel, SiFigma
} from 'react-icons/si';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const techStack = [
  { name: "React", icon: FaReact, className: "text-blue-500 dark:text-white" },
  { name: "Next.js", icon: SiNextdotjs, className: "text-black dark:text-white" },
  { name: "TypeScript", icon: SiTypescript, className: "text-blue-600 dark:text-white" },
  { name: "Tailwind", icon: SiTailwindcss, className: "text-cyan-500 dark:text-cyan-400" },
  { name: "Vue.js", icon: SiVuedotjs, className: "text-green-500 dark:text-green-400" },
  { name: "Node.js", icon: FaNodeJs, className: "text-green-600 dark:text-green-400" },
  { name: "Python", icon: FaPython, className: "text-yellow-500 dark:text-yellow-400" },
  { name: "PostgreSQL", icon: SiPostgresql, className: "text-blue-700 dark:text-blue-500" },
  { name: "GraphQL", icon: SiGraphql, className: "text-pink-500 dark:text-pink-400" },
  { name: "TensorFlow", icon: SiTensorflow, className: "text-orange-600 dark:text-orange-400" },
  { name: "PyTorch", icon: SiPytorch, className: "text-red-600 dark:text-red-400" },
  { name: "Solidity", icon: SiSolidity, className: "text-gray-700 dark:text-gray-300" },
  { name: "Docker", icon: FaDocker, className: "text-blue-500 dark:text-blue-500" },
  { name: "AWS", icon: FaAws, className: "text-orange-500 dark:text-orange-500" },
  { name: "Vercel", icon: SiVercel, className: "text-gray-900 dark:text-white" },
  { name: "GitHub", icon: FaGithub, className: "text-gray-800 dark:text-white" },
  { name: "JavaScript", icon: FaJsSquare, className: "text-yellow-500 dark:text-yellow-400" },
  { name: "MongoDB", icon: SiMongodb, className: "text-green-600 dark:text-green-400" },
  { name: "Firebase", icon: SiFirebase, className: "text-orange-500 dark:text-orange-400" },
  { name: "Figma", icon: SiFigma, className: "text-pink-600 dark:text-pink-400" },
];

const TechStackMarquee = () => {
  return (
    <section className="border-b border-gray-200 bg-white py-24 dark:bg-zinc-900 md:py-32 dark:border-gray-700">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          variants={itemVariants}
          className="mb-12 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            Tech Stack
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
            Technologies I Work With
          </h2>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white via-transparent to-transparent z-10 dark:from-gray-900"></div>
          <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white via-transparent to-transparent z-10 dark:from-gray-900"></div>

          <div className="flex overflow-hidden">
            <motion.div
              className="flex gap-8 whitespace-nowrap"
              animate={{
                x: [0, -1000],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {[...techStack, ...techStack, ...techStack].map((tech, index) => (
                <motion.div
                  key={`${tech.name}-marquee-${index}`}
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-6 py-4 transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
                >
                  <tech.icon className="h-8 w-8" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TechStackMarquee;