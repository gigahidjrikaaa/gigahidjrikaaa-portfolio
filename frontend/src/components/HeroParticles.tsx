"use client";

import { useMemo, useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function HeroParticles() {
  const particlesInit = useCallback(async (engine: unknown) => {
    // @ts-expect-error tsparticles engine type
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {
    // Optional: You can do something once particles are loaded
  }, []);

  const options = useMemo<unknown>(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 0.5,
              color: "#10b981",
            },
          },
        },
      },
      particles: {
        color: {
          value: ["#10b981", "#0ea5e9", "#a1a1aa"],
        },
        links: {
          color: "#a1a1aa",
          distance: 150,
          enable: true,
          opacity: 0.15,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: true,
          speed: 0.8,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 40,
        },
        opacity: {
          value: 0.3,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      options={options}
      className="absolute inset-0 -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50"
    />
  );
}
