"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  /** 0–1: how far the content chases the cursor relative to offset distance. */
  strength?: number;
  className?: string;
}

const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Pulls its content toward the cursor while hovered, easing back on exit.
 * Deliberately uses state + CSS transition instead of motion values so the
 * behavior is independent of the framer animation pipeline. No-op for
 * prefers-reduced-motion users.
 */
const Magnetic = ({ children, strength = 0.35, className }: MagneticProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const handleMove = (event: MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: Math.round((event.clientX - (rect.left + rect.width / 2)) * strength * 10) / 10,
      y: Math.round((event.clientY - (rect.top + rect.height / 2)) * strength * 10) / 10,
    });
  };

  const reset = () => setPos({ x: 0, y: 0 });
  const settled = pos.x === 0 && pos.y === 0;

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={className}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        transition: settled
          ? `transform 0.55s ${EASE_OUT_CSS}`
          : "transform 0.12s ease-out",
      }}
    >
      {children}
    </div>
  );
};

export default Magnetic;
