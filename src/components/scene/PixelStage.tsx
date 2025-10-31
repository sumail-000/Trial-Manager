"use client";

import type { ReactNode } from "react";
import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { cn } from "@/lib/utils";

type PixelStageProps = {
  className?: string;
  accentColor?: string;
  autoRotate?: boolean;
  children?: ReactNode;
};

const BASE_LAYOUT: Array<[number, number, number]> = [
  [0, 0, 0],
  [1, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [0, 1, 1],
  [0, -1, -1],
  [2, 0, 0],
  [-2, 0, 0],
  [0, 0, 2],
  [0, 0, -2],
];

const palette = [
  "#6fdcff",
  "#ff7fe5",
  "#8df5b6",
  "#f7d774",
  "#c1a0ff",
];

const PixelCube = ({
  position,
  color,
  emissive = color,
  size = 0.82,
}: {
  position: [number, number, number];
  color: string;
  emissive?: string;
  size?: number;
}) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[size, size, size]} />
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={0.8}
      roughness={0.35}
      metalness={0.1}
    />
  </mesh>
);

const VoxelCluster = ({ accentColor = "#6fdcff" }: { accentColor?: string }) => {
  const nodes = useMemo(() => {
    const accent = new THREE.Color(accentColor);

    return BASE_LAYOUT.map<[number, number, number, string]>(
      ([x, y, z], index) => {
        const offset = (seed: number) => Math.sin((index + 1) * seed) * 0.18;
        const tone = new THREE.Color(palette[index % palette.length]);
        const influence = 0.35 + (Math.sin(index * 1.732) + 1) * 0.1;
        tone.lerp(accent, influence);

        return [
          x + offset(0.93),
          y + offset(1.37),
          z + offset(1.11),
          `#${tone.getHexString()}`,
        ];
      },
    );
  }, [accentColor]);

  return (
    <group>
      {nodes.map(([x, y, z, color], idx) => (
        <PixelCube key={`${color}-${idx}`} position={[x, y, z]} color={color} />
      ))}
    </group>
  );
};

export const PixelStage = ({
  className,
  accentColor,
  autoRotate = true,
  children,
}: PixelStageProps) => {
  return (
    <div
      className={cn(
        "pixel-card pixel-border relative flex h-[320px] w-full max-w-full overflow-hidden",
        className,
      )}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [4, 4, 4.5], fov: 45 }}
        className="pixel-grid"
      >
        <color attach="background" args={["#04060f"]} />
        <ambientLight intensity={0.55} />
        <pointLight position={[5, 8, 6]} intensity={1.15} color="#6fdcff" />
        <pointLight position={[-6, -4, -2]} intensity={0.45} color="#ff7fe5" />
        <Suspense fallback={null}>
          <Float floatIntensity={0.9} rotationIntensity={0.35} speed={1.8}>
            <VoxelCluster accentColor={accentColor} />
          </Float>
          {autoRotate ? (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.8}
            />
          ) : (
            <OrbitControls enablePan={false} enableZoom={false} />
          )}
        </Suspense>
      </Canvas>
      {children ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center text-xs font-mono uppercase tracking-[0.5em] text-foreground-muted">
          <span className="pixel-glass rounded-full px-4 py-2">
            {children}
          </span>
        </div>
      ) : null}
      <span className="pixel-noise" />
    </div>
  );
};

