"use client";

/**
 * Globe3D — an interactive Three.js globe with glowing origin markers.
 * Rendered lazily (dynamic import in parent) so it stays out of SSR.
 */

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, useTexture } from "@react-three/drei";
import * as THREE from "three";

// ─── Location data ────────────────────────────────────────────────────────────

interface GlobeLocation {
  label: string;
  lat: number;
  lon: number;
  intensity: number; // 0–1, controls dot size + glow brightness
}

const LOCATIONS: GlobeLocation[] = [
  { label: "Jakarta", lat: -6.2, lon: 106.8, intensity: 1.0 },
  { label: "Singapore", lat: 1.35, lon: 103.8, intensity: 0.9 },
  { label: "Kuala Lumpur", lat: 3.1, lon: 101.7, intensity: 0.75 },
  { label: "Tokyo", lat: 35.7, lon: 139.7, intensity: 0.8 },
  { label: "Seoul", lat: 37.6, lon: 127.0, intensity: 0.7 },
  { label: "Sydney", lat: -33.9, lon: 151.2, intensity: 0.65 },
  { label: "Dubai", lat: 25.2, lon: 55.3, intensity: 0.65 },
  { label: "London", lat: 51.5, lon: -0.1, intensity: 0.7 },
  { label: "Amsterdam", lat: 52.4, lon: 4.9, intensity: 0.55 },
  { label: "Paris", lat: 48.9, lon: 2.3, intensity: 0.55 },
  { label: "Munich", lat: 48.2, lon: 11.6, intensity: 0.45 },
  { label: "San Francisco", lat: 37.8, lon: -122.4, intensity: 0.7 },
  { label: "New York", lat: 40.7, lon: -74.0, intensity: 0.65 },
  { label: "São Paulo", lat: -23.5, lon: -46.6, intensity: 0.5 },
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
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const baseScale = 0.018 + intensity * 0.016;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.9 + 0.4 * Math.sin(t * 1.6 + phase);
    if (outerRef.current) {
      const s = baseScale * 2.8 * pulse;
      outerRef.current.scale.setScalar(s);
      const mat = outerRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + 0.18 * Math.sin(t * 1.6 + phase);
    }
  });

  return (
    <group position={position}>
      {/* Solid inner dot */}
      <mesh ref={innerRef} scale={baseScale}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#6ee7b7" />
      </mesh>
      {/* Outer glow halo */}
      <mesh ref={outerRef} scale={baseScale * 2.4}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial
          color="#34d399"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ─── Arc between two points ───────────────────────────────────────────────────

function Arc({ from, to, color = "#6ee7b7" }: { from: THREE.Vector3; to: THREE.Vector3; color?: string }) {
  const points = useMemo(() => {
    const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(1.5);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    return curve.getPoints(40);
  }, [from, to]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.18} depthWrite={false} />
    </line>
  );
}

// ─── Atmosphere shell ─────────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <Sphere args={[1.12, 64, 64]}>
      <meshBasicMaterial
        color="#1e3a5f"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </Sphere>
  );
}

// ─── Globe mesh ───────────────────────────────────────────────────────────────

function GlobeMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const earthTexture = useTexture('/earth-dark.jpg');

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  const positions = useMemo(
    () => LOCATIONS.map((loc) => latLonToVec3(loc.lat, loc.lon, 1.01)),
    []
  );

  // A few long-distance arcs (Jakarta → SF, Singapore → London, Tokyo → UAE)
  const arcPairs: [number, number][] = [
    [0, 11], // Jakarta → San Francisco
    [1, 7],  // Singapore → London
    [3, 6],  // Tokyo → Dubai
    [4, 13], // Seoul → São Paulo
  ];

  return (
    <group ref={groupRef}>
      {/* Earth texture sphere */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.05}
        />
      </Sphere>

      {/* Wireframe overlay (latitude / longitude lines) */}
      <Sphere args={[1.003, 36, 36]}>
        <meshBasicMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.22}
        />
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

      {/* Connection arcs */}
      {arcPairs.map(([a, b]) => (
        <Arc
          key={`${a}-${b}`}
          from={positions[a]}
          to={positions[b]}
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
        camera={{ position: [0, 0, 2.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        {/* Ambient + directional light for the globe surface */}
        <ambientLight intensity={0.15} />
        <directionalLight position={[4, 3, 3]} intensity={0.8} color="#e0f2fe" />
        <pointLight position={[-4, -2, -4]} intensity={0.3} color="#6366f1" />

        <Suspense fallback={null}>
          <GlobeMesh />
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          rotateSpeed={0.4}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />
      </Canvas>
    </div>
  );
}
