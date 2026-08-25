"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import SmoothScroll from "@/components/SmoothScroll";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <SmoothScroll />
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};

export default AppProviders;
