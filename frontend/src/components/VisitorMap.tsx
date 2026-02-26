"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Globe, Users, Eye, Wifi, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { apiService, AnalyticsStats } from "@/services/api";

// Lazy-load Three.js globe — keeps it out of SSR and reduces initial bundle
const Globe3D = dynamic(() => import("./Globe3D"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-48 w-48 animate-pulse rounded-full bg-slate-800/60" />
    </div>
  ),
});

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------
const useCounter = (target: number, duration = 1200, enabled = true) => {
  const [value, setValue] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(spanRef, { once: true });

  useEffect(() => {
    if (!inView || !enabled || target === 0) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration, enabled]);

  return { value, ref: spanRef };
};

// ---------------------------------------------------------------------------
// Micro stat pill
// ---------------------------------------------------------------------------
interface MicroStatProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  badge?: string;
  accentColor?: string;
  animated?: boolean;
}

function MicroStat({ icon, label, value, badge, accentColor = "#e2e8f0", animated = false }: MicroStatProps) {
  const numeric = typeof value === "number" && animated;
  const { value: animated_val, ref } = useCounter(numeric ? (value as number) : 0, 1200, animated);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <span className="text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{label}</p>
        <span
          ref={ref}
          className="text-lg font-bold tabular-nums leading-tight"
          style={{ color: accentColor }}
        >
          {numeric ? animated_val.toLocaleString() : value}
        </span>
      </div>
      {badge && (
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          {badge}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Micro bar chart for regions
// ---------------------------------------------------------------------------
interface RegionMicroChartProps {
  regions: AnalyticsStats['regions'];
}
function RegionMicroChart({ regions }: RegionMicroChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-2.5">
      {regions.map(({ region, pct, color }, i) => (
        <div key={region} className="flex items-center gap-3">
          <span className="w-[130px] truncate text-right text-[11px] text-slate-400">{region}</span>
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : {}}
              transition={{ duration: 1.1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="w-8 text-right text-[11px] tabular-nums text-slate-500">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------
const VisitorMap = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  // On mount: record visit + start 60s heartbeat
  useEffect(() => {
    let sid = sessionStorage.getItem('v_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('v_sid', sid);
    }
    apiService.recordVisit(sid).catch(() => {});
    const iv = setInterval(() => apiService.recordVisit(sid!).catch(() => {}), 60_000);
    return () => clearInterval(iv);
  }, []);

  // When section enters view: fetch stats
  useEffect(() => {
    if (!inView) return;
    apiService.getAnalyticsStats().then(setStats).catch(console.error);
  }, [inView]);

  return (
    <section
      id="global-presence"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#0a0f1e] py-24 md:py-32"
    >
      {/* Background radial glow blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-sky-600/10 blur-[100px]" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/5 blur-[80px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400/80">
            Global Footprint
          </span>
          <h2 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            Visitors from Around the World
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400 leading-relaxed">
            Read by engineers, founders, and hiring teams across every continent.
          </p>
        </motion.div>

        {/* Main 2-column grid: globe left, stats right */}
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">

          {/* ── Globe ────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center"
          >
            <div className="relative h-[420px] w-full max-w-[420px] sm:h-[500px] sm:max-w-[500px]">
              {/* Outer glow ring */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)",
                }}
              />
              <Globe3D className="h-full w-full" />
            </div>

            {/* Floating location pills */}
            {[
              { label: "Jakarta, ID", style: "top-[18%] left-[2%]", delay: 0.2 },
              { label: "San Francisco, US", style: "top-[30%] right-[0%]", delay: 0.35 },
              { label: "London, UK", style: "top-[55%] right-[3%]", delay: 0.5 },
              { label: "Tokyo, JP", style: "bottom-[22%] left-[4%]", delay: 0.45 },
            ].map(({ label, style, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay }}
                className={`absolute ${style} flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-300 shadow-lg backdrop-blur-sm`}
              >
                <MapPin className="h-3 w-3 text-sky-400" />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* ── Stats panel ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            {/* Micro stat pills (2×2 grid) */}
            <div className="grid grid-cols-2 gap-3">
              <MicroStat
                icon={<Eye className="h-4 w-4" />}
                label="Today"
                value={stats?.today ?? 0}
                accentColor="#e2e8f0"
                animated={inView && stats !== null}
              />
              <MicroStat
                icon={<Users className="h-4 w-4" />}
                label="Total"
                value={stats?.total ?? 0}
                accentColor="#e2e8f0"
                animated={inView && stats !== null}
              />
              <MicroStat
                icon={<Globe className="h-4 w-4" />}
                label="Countries"
                value={stats ? `${stats.countries_count}+` : "—"}
                accentColor="#e2e8f0"
              />
              <MicroStat
                icon={<Wifi className="h-4 w-4" />}
                label="Online now"
                value={stats?.online_now ?? 0}
                badge="LIVE"
                accentColor="#34d399"
                animated={inView && stats !== null}
              />
            </div>

            {/* 7-day sparkline card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  7-Day Trend
                </p>
              </div>
              {(() => {
                const sparkValues = stats?.sparkline ?? [0, 0, 0, 0, 0, 0, 0];
                const maxVal = Math.max(...sparkValues, 1);
                return (
                  <div className="flex items-end justify-between gap-1">
                    {sparkValues.map((v, i) => {
                      const pct = (v / maxVal) * 100;
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${pct * 0.48}px`,
                            background: i === sparkValues.length - 1
                              ? "linear-gradient(to top, #0ea5e9, #38bdf8)"
                              : "rgba(148,163,184,0.2)",
                            minHeight: 4,
                            maxHeight: 48,
                          }}
                          initial={{ scaleY: 0, originY: 1 }}
                          animate={inView ? { scaleY: 1 } : {}}
                          transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                        />
                      );
                    })}
                  </div>
                );
              })()}
              <div className="mt-3 flex justify-between text-[10px] text-slate-600">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>

            {/* Region breakdown */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                By Region
              </p>
              <RegionMicroChart regions={stats?.regions ?? []} />
            </div>

            {/* Origin tags */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Prominent origins
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(stats?.top_cities.map(c => c.label) ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex cursor-default items-center gap-1 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400"
                  >
                    <MapPin className="h-2.5 w-2.5 text-sky-500/70" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisitorMap;

