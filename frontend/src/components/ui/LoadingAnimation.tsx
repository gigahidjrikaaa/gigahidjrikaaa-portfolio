"use client";

import { cn } from "@/lib/utils";

type LoadingSize = "sm" | "md" | "lg";

const sizeMap: Record<LoadingSize, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

interface LoadingAnimationProps {
  label?: string;
  size?: LoadingSize;
  className?: string;
}

const LoadingAnimation = ({ label = "Loading…", size = "md", className }: LoadingAnimationProps) => (
  <div
    className={cn("flex flex-col items-center justify-center gap-3 text-slate-500", className)}
    role="status"
    aria-live="polite"
  >
    <span className={cn("block animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-600", sizeMap[size])} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingAnimation;
