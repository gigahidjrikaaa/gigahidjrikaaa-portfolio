"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  /** Seconds; kept short so the reveal never outruns the section's fade-in. */
  duration?: number;
  /** Static tail appended after the number, e.g. "+" or "%". */
  suffix?: string;
  className?: string;
}

/**
 * Counts from 0 to `value` the first time it enters the viewport.
 * Renders the final value immediately for prefers-reduced-motion users.
 */
const CountUp = ({ value, duration = 1.1, suffix = "", className }: CountUpProps) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(() =>
    reduceMotion ? value : 0
  );

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduceMotion]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

export default CountUp;
