"use client";

import { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import SmoothScroll from "@/components/SmoothScroll";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {/* Honor the OS reduce-motion setting globally: transform/reveal
            animations collapse to instant states, opacity still eases. */}
        <MotionConfig reducedMotion="user">
          <SmoothScroll />
          {children}
        </MotionConfig>
      </ToastProvider>
    </AuthProvider>
  );
};

export default AppProviders;
