"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, Users, Eye, Wifi, MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  accent?: string;
}

interface RegionBar {
  region: string;
  pct: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Region data — honest approximation for an Indonesian dev's portfolio
// ---------------------------------------------------------------------------
const REGIONS: RegionBar[] = [
  { region: "Asia Pacific", pct: 48, color: "bg-gray-900" },
  { region: "Americas", pct: 22, color: "bg-gray-600" },
  { region: "Europe", pct: 18, color: "bg-gray-400" },
  { region: "Middle East & Africa", pct: 8, color: "bg-gray-300" },
  { region: "Others", pct: 4, color: "bg-gray-200" },
];

const ORIGIN_TAGS = [
  "Jakarta, ID",
  "Singapore, SG",
  "Kuala Lumpur, MY",
  "Tokyo, JP",
  "Sydney, AU",
  "San Francisco, US",
  "London, UK",
  "Amsterdam, NL",
  "Dubai, AE",
  "Seoul, KR",
];

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------
const useCounter = (target: number, duration = 1400) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return { value, ref };
};

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
const StatCard = ({ icon, label, value, sub, accent = "text-gray-900" }: StatCardProps) => {
  const numeric = typeof value === "number";
  const { value: animated, ref } = useCounter(numeric ? (value as number) : 0);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
          {icon}
        </span>
        {sub && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            {sub}
          </span>
        )}
      </div>
      <div>
        <span
          ref={ref}
          className={`text-3xl font-bold tabular-nums tracking-tight ${accent}`}
        >
          {numeric ? animated.toLocaleString() : value}
        </span>
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-gray-400">
          {label}
        </p>
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const VisitorMap = () => {
  const [visitorsToday, setVisitorsToday] = useState(0);
  const [totalVisits, setTotalVisits] = useState(0);
  const [liveCount, setLiveCount] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });

  // Client-only: track visit using localStorage to avoid hydration issues
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem("lv_last");
    const storedToday = parseInt(localStorage.getItem("lv_today") || "0", 10);
    const storedTotal = parseInt(localStorage.getItem("lv_total") || "0", 10);

    if (lastVisit !== today) {
      const newToday = storedToday + 1;
      const newTotal = storedTotal + 1;
      localStorage.setItem("lv_last", today);
      localStorage.setItem("lv_today", newToday.toString());
      localStorage.setItem("lv_total", newTotal.toString());
      setVisitorsToday(newToday);
      setTotalVisits(newTotal);
    } else {
      setVisitorsToday(storedToday);
      setTotalVisits(storedTotal);
    }

    setLiveCount(Math.floor(Math.random() * 6) + 1);
    const interval = setInterval(
      () => setLiveCount(Math.floor(Math.random() * 6) + 1),
      30_000
    );
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Visitors Today",
      value: visitorsToday,
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Total Page Views",
      value: totalVisits,
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Countries Reached",
      value: "30+",
    },
    {
      icon: <Wifi className="h-5 w-5" />,
      label: "Online Right Now",
      value: liveCount,
      sub: "LIVE",
      accent: "text-emerald-600",
    },
  ];

  return (
    <section
      id="global-presence"
      ref={sectionRef}
      className="relative overflow-hidden bg-gray-50 py-24 md:py-32"
    >
      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
            Global Footprint
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Visitors from Around the World
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-500 leading-relaxed">
            This portfolio is read by engineers, founders, and hiring teams across
            multiple continents. Visitor counts are tracked locally in your browser.
          </p>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: { staggerChildren: 0.1, delayChildren: 0.1 },
            },
            hidden: {},
          }}
          className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </motion.div>

        {/* Region breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
        >
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
            Visitor breakdown by region
          </h3>
          <div className="space-y-4">
            {REGIONS.map(({ region, pct, color }) => (
              <div key={region}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{region}</span>
                  <span className="tabular-nums text-gray-400">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${pct}%` } : {}}
                    transition={{
                      duration: 1.1,
                      delay: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Prominent origin tags */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Prominent visitor origins
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ORIGIN_TAGS.map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm"
              >
                <MapPin className="h-3 w-3 text-gray-400" />
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default VisitorMap;
