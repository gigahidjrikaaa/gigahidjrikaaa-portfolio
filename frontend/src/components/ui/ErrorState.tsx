"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  tone?: "light" | "dark";
  className?: string;
}

const ErrorState = ({
  title = "Couldn't load this content",
  message,
  onRetry,
  retryLabel = "Try again",
  tone = "light",
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center",
      tone === "dark" ? "border-white/15 bg-white/5" : "border-zinc-200 bg-zinc-50",
      className
    )}
  >
    <p
      className={cn(
        "text-sm font-semibold",
        tone === "dark" ? "text-zinc-200" : "text-zinc-800"
      )}
    >
      {title}
    </p>
    {message ? (
      <p
        className={cn(
          "max-w-md text-sm leading-relaxed",
          tone === "dark" ? "text-zinc-400" : "text-zinc-500"
        )}
      >
        {message}
      </p>
    ) : null}
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className={cn(
          "mt-1 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          tone === "dark"
            ? "bg-white/10 text-white hover:bg-white/20"
            : "bg-zinc-900 text-white hover:bg-zinc-700"
        )}
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        {retryLabel}
      </button>
    ) : null}
  </div>
);

export default ErrorState;
