"use client";

/**
 * Globe3D — interactive Three.js globe with animated arcs and multi-layer glow dots.
 * Rendered lazily (dynamic import in parent) so it stays out of SSR.
 */

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import * as THREE from "three";

// ─── Location data ────────────────────────────────────────────────────────────

interface GlobeLocation {
  label: string;
  lat: number;
  lon: number;
  intensity: number; // 0–1, controls dot size + glow brightness
}

const LOCATIONS: GlobeLocation[] = [
  { label: "Jakarta",       lat: -6.2,  lon: 106.8,  intensity: 1.0  },
  { label: "Singapore",     lat:  1.35, lon: 103.8,  intensity: 0.9  },
  { label: "Kuala Lumpur",  lat:  3.1,  lon: 101.7,  intensity: 0.75 },
  { label: "Tokyo",         lat: 35.7,  lon: 139.7,  intensity: 0.85 },
  { label: "Seoul",         lat: 37.6,  lon: 127.0,  intensity: 0.75 },
  { label: "Sydney",        lat: -33.9, lon: 151.2,  intensity: 0.70 },
  { label: "Dubai",         lat: 25.2,  lon:  55.3,  intensity: 0.70 },
  { label: "Mumbai",        lat: 19.1,  lon:  72.9,  intensity: 0.65 },
  { label: "London",        lat: 51.5,  lon:  -0.1,  intensity: 0.80 },
  { label: "Amsterdam",     lat: 52.4,  lon:   4.9,  intensity: 0.60 },
  { label: "Paris",         lat: 48.9,  lon:   2.3,  intensity: 0.60 },
  { label: "Berlin",        lat: 52.5,  lon:  13.4,  intensity: 0.55 },
  { label: "San Francisco", lat: 37.8,  lon: -122.4, intensity: 0.80 },
  { label: "New York",      lat: 40.7,  lon:  -74.0, intensity: 0.75 },
  { label: "Toronto",       lat: 43.7,  lon:  -79.4, intensity: 0.60 },
  { label: "São Paulo",     lat: -23.5, lon:  -46.6, intensity: 0.55 },
  { label: "Lagos",         lat:  6.5,  lon:    3.4, intensity: 0.50 },
];

// ─── Coordinate helper ────────────────────────────────────────────────────────

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

interface DotProps {
  position: THREE.Vector3;
  intensity: number;
  phase: number;
}

function GlowDot({ position, intensity, phase }: DotProps) {
  const halo1Ref = useRef<THREE.Mesh>(null);
  const halo2Ref = useRef<THREE.Mesh>(null);
  const baseScale = 0.014 + intensity * 0.018;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p1 = 0.85 + 0.45 * Math.sin(t * 1.8 + phase);
    const p2 = 0.70 + 0.60 * Math.sin(t * 1.2 + phase + Math.PI * 0.6);
    if (halo1Ref.current) {
      halo1Ref.current.scale.setScalar(baseScale * 3.4 * p1);
      (halo1Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.14 + 0.22 * Math.sin(t * 1.8 + phase);
    }
    if (halo2Ref.current) {
      halo2Ref.current.scale.setScalar(baseScale * 6.0 * p2);
      (halo2Ref.current.material as THREE.MeshBasicMaterial).opacity =
        0.03 + 0.05 * Math.sin(t * 1.2 + phase + Math.PI * 0.6);
    }
  });

  return (
    <group position={position}>
      {/* Solid core */}
      <mesh scale={baseScale}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      {/* Inner pulsing halo */}
      <mesh ref={halo1Ref}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#7dd3fc" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      {/* Outer diffuse halo */}
      <mesh ref={halo2Ref}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.05} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ─── Animated arc ─────────────────────────────────────────────────────────────

function AnimatedArc({ from, to, delay = 0 }: { from: THREE.Vector3; to: THREE.Vector3; delay?: number }) {
  const fullPoints = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.56);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return curve.getPoints(60);
  }, [from, to]);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(fullPoints.length * 3);
    fullPoints.forEach((p, i) => {
      positions[i * 3]     = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setDrawRange(0, 2);
    const m = new THREE.LineBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0, depthWrite: false });
    return { geometry: g, material: m };
  }, [fullPoints]);

  useFrame(({ clock }) => {
    const t = Math.max(0, clock.getElapsedTime() - delay);
    const cycle = 7;
    const tc = t % cycle;
    let progress: number;
    let opacity: number;
    if (tc < 2.5) {
      progress = tc / 2.5;
      opacity = 0.4 * progress;
    } else if (tc < 5.0) {
      progress = 1;
      opacity = Math.max(0.1, 0.4 - 0.3 * ((tc - 2.5) / 2.5));
    } else {
      progress = Math.max(0, 1 - (tc - 5.0) / 2.0);
      opacity = Math.max(0, 0.1 * (1 - (tc - 5.0) / 2.0));
    }
    geometry.setDrawRange(0, Math.max(2, Math.floor(progress * fullPoints.length)));
    material.opacity = opacity;
  });

  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);
  return <primitive object={line} />;
}

// ─── Atmosphere shell ─────────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <>
      {/* Inner glow layer */}
      <Sphere args={[1.05, 64, 64]}>
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
      </Sphere>
      {/* Outer diffuse layer */}
      <Sphere args={[1.12, 64, 64]}>
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.03} side={THREE.BackSide} depthWrite={false} />
      </Sphere>
    </>
  );
}

// ─── Globe mesh ───────────────────────────────────────────────────────────────

function GlobeMesh() {
  const groupRef = useRef<THREE.Group>(null);
  // Daylight earth texture — NASA Blue Marble via three-globe CDN
  const earthTexture = useLoader(
    THREE.TextureLoader,
    "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg"
  );
  earthTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
  });

  const positions = useMemo(
    () => LOCATIONS.map((loc) => latLonToVec3(loc.lat, loc.lon, 1.01)),
    []
  );

  // Animated arc pairs: [fromIdx, toIdx, delaySeconds]
  const arcPairs: [number, number, number][] = [
    [0, 12, 0.0],  // Jakarta → San Francisco
    [1,  8, 1.2],  // Singapore → London
    [3,  6, 2.4],  // Tokyo → Dubai
    [4, 13, 3.6],  // Seoul → New York
    [0,  5, 0.6],  // Jakarta → Sydney
    [2, 10, 1.8],  // KL → Paris
  ];

  return (
    <group ref={groupRef}>
      {/* Earth texture sphere */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial map={earthTexture} roughness={0.65} metalness={0.02} />
      </Sphere>

      {/* Subtle lat/lon grid — very low opacity so it doesn't look blocky */}
      <Sphere args={[1.003, 48, 48]}>
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.04} />
      </Sphere>

      {/* Atmosphere */}
      <Atmosphere />

      {/* Location dots */}
      {positions.map((pos, i) => (
        <GlowDot
          key={LOCATIONS[i].label}
          position={pos}
          intensity={LOCATIONS[i].intensity}
          phase={(i * Math.PI * 2) / LOCATIONS.length}
        />
      ))}

      {/* Animated arcs */}
      {arcPairs.map(([a, b, delay]) => (
        <AnimatedArc
          key={`${a}-${b}`}
          from={positions[a]}
          to={positions[b]}
          delay={delay}
        />
      ))}
    </group>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────

interface Globe3DProps {
  className?: string;
}

export default function Globe3D({ className }: Globe3DProps) {
  return (
    <div className={className ?? "h-full w-full"}>
      <Canvas
        camera={{ position: [0, 0, 3.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        {/* Sun-like lighting: strong warm key from upper-right, soft fill */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 3]}  intensity={2.2} color="#fff8f0" />
        <pointLight        position={[-4, -1, -3]} intensity={0.3} color="#dbeafe" />
        <pointLight        position={[0,  4,  2]}  intensity={0.2} color="#bfdbfe" />

        <Suspense fallback={null}>
          <GlobeMesh />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={0.35}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.82}
        />
      </Canvas>
    </div>
  );
}
