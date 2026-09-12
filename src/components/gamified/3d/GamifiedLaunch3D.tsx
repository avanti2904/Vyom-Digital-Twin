/**
 * VYOM — Gamified 7-Stage 3D Launch Sequence
 * Dynamic real-time WebGL rocket launch with camera choreography:
 * 1. Countdown ➔ 2. Liftoff ➔ 3. Booster Staging ➔ 4. Fairing Jettison
 * 5. Satellite Separation ➔ 6. Solar Panel Unfurling ➔ 7. Orbit Insertion
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { Earth, StarField } from '../../three/SpaceScene';

export function GamifiedLaunch3D() {
  const launchPhase = useGamifiedStore((s) => s.launchPhase);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={2.2} />
      <StarField />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={25}
        makeDefault
      />

      {/* Earth background during orbital phases */}
      {launchPhase >= 3 && (
        <group position={[0, -18, -15]}>
          <Earth radius={12} />
        </group>
      )}

      {/* ── STAGE 1 & 2: LAUNCH PAD & LIFTOFF ── */}
      {launchPhase <= 2 && <LaunchPadStage isLiftoff={launchPhase === 2} />}

      {/* ── STAGE 3: EARTH DEPARTURE & BOOSTER STAGING ── */}
      {launchPhase === 3 && <BoosterStagingStage />}

      {/* ── STAGE 4: FAIRING JETTISON ── */}
      {launchPhase === 4 && <FairingJettisonStage />}

      {/* ── STAGE 5: SATELLITE SEPARATION ── */}
      {launchPhase === 5 && <SatelliteSeparationStage />}

      {/* ── STAGE 6 & 7: SOLAR UNVEILING & ORBIT INSERTION ── */}
      {launchPhase >= 6 && <SolarUnfurlingStage isOrbitLocked={launchPhase === 7} />}
    </>
  );
}

// ── Stage 1 & 2: Launch Pad & Liftoff ─────────────────────────────────────────

function LaunchPadStage({ isLiftoff }: { isLiftoff: boolean }) {
  const rocketRef = useRef<THREE.Group>(null);
  const exhaustRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (isLiftoff && rocketRef.current) {
      rocketRef.current.position.y += delta * 4.5;
    }
    if (exhaustRef.current && isLiftoff) {
      const scaleY = 1.0 + Math.random() * 0.4;
      exhaustRef.current.scale.set(1.0 + Math.random() * 0.2, scaleY, 1.0 + Math.random() * 0.2);
    }
  });

  return (
    <group position={[0, -2, 0]}>
      {/* Launch Pad Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[4, 4.5, 0.8, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Umbilical Service Tower */}
      <mesh position={[-1.8, 3.2, 0]}>
        <boxGeometry args={[0.6, 7.5, 0.6]} />
        <meshStandardMaterial color="#ef4444" metalness={0.8} wireframe />
      </mesh>

      {/* Rocket Assembly */}
      <group ref={rocketRef} position={[0, 3.5, 0]}>
        {/* Core Booster Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 7, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.85} roughness={0.2} />
        </mesh>
        {/* Payload Fairing Nosecone */}
        <mesh position={[0, 4.2, 0]}>
          <coneGeometry args={[0.6, 1.6, 32]} />
          <meshStandardMaterial color="#00d4ff" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* 4 Aerodynamic Base Fins */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.7, -3.2, Math.sin(angle) * 0.7]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.4, 0.8, 0.05]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
        ))}

        {/* Liftoff Engine Fire Plume */}
        {isLiftoff && (
          <group position={[0, -4.5, 0]}>
            <mesh ref={exhaustRef}>
              <coneGeometry args={[0.8, 3.5, 24]} />
              <meshBasicMaterial color="#f97316" />
            </mesh>
            <pointLight color="#ffedd5" intensity={4} distance={8} />
          </group>
        )}
      </group>
    </group>
  );
}

// ── Stage 3: Booster Separation ───────────────────────────────────────────────

function BoosterStagingStage() {
  const boosterRef = useRef<THREE.Group>(null);
  const upperStageRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (boosterRef.current) {
      boosterRef.current.position.y -= delta * 2.2;
      boosterRef.current.rotation.z += delta * 0.15;
    }
    if (upperStageRef.current) {
      upperStageRef.current.position.y += delta * 1.5;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Continuing Upper Stage */}
      <group ref={upperStageRef} position={[0, 1.8, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 3.2, 32]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.55, 1.4, 32]} />
          <meshStandardMaterial color="#00d4ff" />
        </mesh>
        {/* Upper Stage Engine Glow */}
        <pointLight position={[0, -1.8, 0]} color="#38bdf8" intensity={3} distance={5} />
      </group>

      {/* Spent First Stage Booster Falling Away */}
      <group ref={boosterRef} position={[0, -2.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.58, 0.58, 5, 32]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// ── Stage 4: Fairing Jettison ─────────────────────────────────────────────────

function FairingJettisonStage() {
  const fairingLeftRef = useRef<THREE.Mesh>(null);
  const fairingRightRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (fairingLeftRef.current) {
      fairingLeftRef.current.position.x -= delta * 1.8;
      fairingLeftRef.current.rotation.z += delta * 0.4;
    }
    if (fairingRightRef.current) {
      fairingRightRef.current.position.x += delta * 1.8;
      fairingRightRef.current.rotation.z -= delta * 0.4;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Exposed Satellite Inside Upper Stage Adapter */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2.2, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
      {/* Satellite Bus Exposed */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.9]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Port Fairing Half Clamshell */}
      <mesh ref={fairingLeftRef} position={[-0.3, 1.2, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 2.5, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Starboard Fairing Half Clamshell */}
      <mesh ref={fairingRightRef} position={[0.3, 1.2, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 2.5, 16, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Stage 5: Satellite Separation ─────────────────────────────────────────────

function SatelliteSeparationStage() {
  const satelliteRef = useRef<THREE.Group>(null);
  const adapterRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (satelliteRef.current) {
      satelliteRef.current.position.y += delta * 1.4;
      satelliteRef.current.rotation.y += delta * 0.2;
    }
    if (adapterRef.current) {
      adapterRef.current.position.y -= delta * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Satellite Drifting Free into Orbit */}
      <group ref={satelliteRef} position={[0, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[0.9, 0.9, 1.0]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        <pointLight color="#00ff88" intensity={1.5} distance={3} />
      </group>

      {/* Expended Upper Stage Rocket Adapter */}
      <mesh ref={adapterRef} position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 2.5, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </mesh>
    </group>
  );
}

// ── Stage 6 & 7: Solar Array Unfurling & Mission Start ─────────────────────────

function SolarUnfurlingStage({ isOrbitLocked }: { isOrbitLocked: boolean }) {
  const wingLeftRef = useRef<THREE.Group>(null);
  const wingRightRef = useRef<THREE.Group>(null);
  const satGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Unfold panels from 0 to 180 degrees
    if (wingLeftRef.current && wingLeftRef.current.rotation.y < 0) {
      wingLeftRef.current.rotation.y += delta * 1.2;
    }
    if (wingRightRef.current && wingRightRef.current.rotation.y > 0) {
      wingRightRef.current.rotation.y -= delta * 1.2;
    }
    if (satGroupRef.current) {
      satGroupRef.current.rotation.y += delta * (isOrbitLocked ? 0.25 : 0.08);
    }
  });

  return (
    <group ref={satGroupRef} position={[0, 0, 0]}>
      {/* Satellite Bus */}
      <mesh>
        <boxGeometry args={[1.1, 1.1, 1.3]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Unfurling Port Solar Array Wing */}
      <group ref={wingLeftRef} position={[-0.55, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[2.0, 0.8, 0.04]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#00d4ff" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* Unfurling Starboard Solar Array Wing */}
      <group ref={wingRightRef} position={[0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[2.0, 0.8, 0.04]} />
          <meshStandardMaterial color="#1e3a8a" emissive="#00d4ff" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* Antenna Dish Pointed Nadir */}
      <mesh position={[0, 0.7, 0]} rotation={[-0.3, 0, 0]}>
        <sphereGeometry args={[0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 3]} />
        <meshStandardMaterial color="#f8fafc" side={THREE.DoubleSide} metalness={0.8} />
      </mesh>

      {/* Mission Active Status Glow */}
      <pointLight color={isOrbitLocked ? '#00ff88' : '#00d4ff'} intensity={2.5} distance={6} />
    </group>
  );
}
