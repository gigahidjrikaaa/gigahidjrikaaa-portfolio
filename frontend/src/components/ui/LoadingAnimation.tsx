"use client";

import Lottie from "lottie-react";
import animationData from "@/assets/lottie/loading-arc.json";
import { cn } from "@/lib/utils";

type LoadingSize = "sm" | "md" | "lg";

const sizeMap: Record<LoadingSize, number> = {
  sm: 56,
  md: 84,
  lg: 110,
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
    <Lottie animationData={animationData} loop style={{ width: sizeMap[size], height: sizeMap[size] }} />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export default LoadingAnimation;
