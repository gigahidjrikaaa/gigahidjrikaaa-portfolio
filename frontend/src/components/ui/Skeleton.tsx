import { motion } from 'framer-motion';

const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export const SkeletonCard = () => (
  <motion.div
    variants={skeletonVariants}
    animate="pulse"
    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
  >
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <motion.div
          variants={skeletonVariants}
          className="h-12 w-12 rounded-full bg-gray-200"
        />
        <div className="flex-1 space-y-2">
          <motion.div
            variants={skeletonVariants}
            className="h-4 w-3/4 rounded bg-gray-200"
          />
          <motion.div
            variants={skeletonVariants}
            className="h-3 w-1/2 rounded bg-gray-200"
          />
        </div>
      </div>
      <motion.div
        variants={skeletonVariants}
        className="h-4 w-full rounded bg-gray-200"
      />
      <motion.div
        variants={skeletonVariants}
        className="h-4 w-5/6 rounded bg-gray-200"
      />
    </div>
  </motion.div>
);

export const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <motion.div
        key={i}
        variants={skeletonVariants}
        animate="pulse"
        className={`h-4 rounded bg-gray-200 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonAvatar = () => (
  <motion.div
    variants={skeletonVariants}
    animate="pulse"
    className="h-12 w-12 rounded-full bg-gray-200"
  />
);

export const SkeletonProject = () => (
  <motion.div
    variants={skeletonVariants}
    animate="pulse"
    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
  >
    <div className="aspect-video bg-gray-200" />
    <div className="p-6 space-y-4">
      <motion.div variants={skeletonVariants} className="h-6 w-3/4 rounded bg-gray-200" />
      <motion.div variants={skeletonVariants} className="h-4 w-full rounded bg-gray-200" />
      <motion.div variants={skeletonVariants} className="h-4 w-5/6 rounded bg-gray-200" />
    </div>
  </motion.div>
);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);