"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeProvider from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/ui/toast";
import ThemeToggle from "@/components/ThemeToggle";
import SmoothScroll from "@/components/SmoothScroll";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SmoothScroll />
          {children}
          <ThemeToggle />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppProviders;
