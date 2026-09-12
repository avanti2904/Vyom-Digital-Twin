/**
 * VYOM — Gamified 3D Earth & Orbit Visualizer
 * Shows interactive 3D Earth, animated satellite paths in LEO, MEO, and GEO,
 * nadir ground coverage footprint cones, ground station radio links, and orbit deviation effects.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { Earth, StarField } from '../../three/SpaceScene';

export function GamifiedEarthOrbit3D() {
  const selectedOrbit = useGamifiedStore((s) => s.selectedOrbit) || 'LEO';
  const stage = useGamifiedStore((s) => s.stage);
  const activeChallengeIndex = useGamifiedStore((s) => s.activeChallengeIndex);

  const isOrbitDrifting = stage === 'mission-simulation' && activeChallengeIndex === 3;

  // Orbit parameters: radius, speed multiplier, color
  const orbitConfigs = {
    LEO: { radius: 2.8, speed: 0.8, color: '#00d4ff', label: 'LEO (500 km)', coneAngle: 0.45 },
    MEO: { radius: 4.8, speed: 0.4, color: '#9b5de5', label: 'MEO (12,000 km)', coneAngle: 0.9 },
    GEO: { radius: 7.2, speed: 0.15, color: '#ff9f0a', label: 'GEO (35,786 km)', coneAngle: 1.45 },
  };

  const activeConfig = orbitConfigs[selectedOrbit];

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 5, 10]} intensity={2.0} />
      <StarField />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3.5}
        maxDistance={22}
        makeDefault
      />

      {/* ── 3D EARTH WITH ATMOSPHERE ── */}
      <Earth radius={2.0} />

      {/* ── ORBIT TRAJECTORY RINGS ── */}
      <OrbitRing
        radius={orbitConfigs.LEO.radius}
        color={orbitConfigs.LEO.color}
        isActive={selectedOrbit === 'LEO'}
        isWobbly={isOrbitDrifting && selectedOrbit === 'LEO'}
      />
      <OrbitRing
        radius={orbitConfigs.MEO.radius}
        color={orbitConfigs.MEO.color}
        isActive={selectedOrbit === 'MEO'}
        isWobbly={isOrbitDrifting && selectedOrbit === 'MEO'}
      />
      <OrbitRing
        radius={orbitConfigs.GEO.radius}
        color={orbitConfigs.GEO.color}
        isActive={selectedOrbit === 'GEO'}
        isWobbly={isOrbitDrifting && selectedOrbit === 'GEO'}
      />

      {/* ── ANIMATED SATELLITE & COVERAGE CONE ── */}
      <AnimatedOrbitSatellite
        radius={activeConfig.radius}
        speed={activeConfig.speed}
        color={activeConfig.color}
        coneAngle={activeConfig.coneAngle}
        isWobbly={isOrbitDrifting}
      />
    </>
  );
}

// ── Orbit Trajectory Ring ─────────────────────────────────────────────────────

function OrbitRing({
  radius,
  color,
  isActive,
  isWobbly,
}: {
  radius: number;
  color: string;
  isActive: boolean;
  isWobbly?: boolean;
}) {
  const lineRef = useRef<THREE.LineLoop>(null);

  const points = useMemo(() => {
    const pts = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  useFrame(({ clock }) => {
    if (lineRef.current && isWobbly) {
      const t = clock.getElapsedTime();
      lineRef.current.position.y = Math.sin(t * 4) * 0.15;
      lineRef.current.rotation.x = Math.sin(t * 3) * 0.08;
    }
  });

  const lineColor = isWobbly ? '#ef4444' : isActive ? color : 'rgba(255,255,255,0.2)';

  return (
    <primitive
      object={
        new THREE.LineLoop(
          geometry,
          new THREE.LineBasicMaterial({
            color: new THREE.Color(lineColor),
            transparent: true,
            opacity: isActive ? 0.9 : 0.25,
            linewidth: isActive ? 2 : 1,
          })
        )
      }
      ref={lineRef}
    />
  );
}

// ── Animated Orbiting Spacecraft & Nadir Footprint ────────────────────────────

function AnimatedOrbitSatellite({
  radius,
  speed,
  color,
  coneAngle,
  isWobbly,
}: {
  radius: number;
  speed: number;
  color: string;
  coneAngle: number;
  isWobbly?: boolean;
}) {
  const satelliteGroupRef = useRef<THREE.Group>(null);
  const radioWaveRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (satelliteGroupRef.current) {
      const angle = t;
      const wobbleY = isWobbly ? Math.sin(t * 5) * 0.35 : 0;
      const currentRadius = isWobbly ? radius + Math.sin(t * 3) * 0.2 : radius;

      satelliteGroupRef.current.position.set(
        Math.cos(angle) * currentRadius,
        wobbleY,
        Math.sin(angle) * currentRadius
      );
      // Face towards Earth nadir
      satelliteGroupRef.current.lookAt(0, 0, 0);
    }

    // Radio signal pulse animation
    if (radioWaveRef.current) {
      const pulse = 0.5 + Math.sin(clock.getElapsedTime() * 6) * 0.5;
      (radioWaveRef.current.material as THREE.MeshBasicMaterial).opacity = 0.15 + pulse * 0.25;
    }
  });

  return (
    <group ref={satelliteGroupRef}>
      {/* Mini 3D Satellite Model */}
      <mesh>
        <boxGeometry args={[0.2, 0.2, 0.25]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Solar Wings */}
      <mesh position={[-0.28, 0, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.02]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#00d4ff" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.28, 0, 0]}>
        <boxGeometry args={[0.3, 0.12, 0.02]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#00d4ff" emissiveIntensity={0.2} />
      </mesh>

      {/* ── NADIR COVERAGE FOOTPRINT CONE ── */}
      <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -radius * 0.45]}>
        <mesh ref={radioWaveRef}>
          <coneGeometry args={[coneAngle * 1.6, radius * 0.9, 32, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent={true}
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Orbit Beacon Light */}
      <pointLight color={color} intensity={1.2} distance={2.5} />
    </group>
  );
}
