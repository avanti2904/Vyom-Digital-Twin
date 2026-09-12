/**
 * VYOM — Gamified 3D Satellite Component
 * Interactive WebGL spacecraft supporting real-time component attachments,
 * continuous 3D exploded view, internal systems x-ray inspection, raycasting,
 * and challenge damage animations.
 */

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { SATELLITE_COMPONENTS } from '../../../constants/gamifiedData';

export function GamifiedSatellite3D() {
  const design = useGamifiedStore((s) => s.design);
  const viewMode = useGamifiedStore((s) => s.viewMode);
  const explodeProgress = useGamifiedStore((s) => s.explodeProgress);
  const inspectedComponentId = useGamifiedStore((s) => s.inspectedComponentId);
  const setInspectedComponent = useGamifiedStore((s) => s.setInspectedComponent);
  const activeChallengeIndex = useGamifiedStore((s) => s.activeChallengeIndex);
  const stage = useGamifiedStore((s) => s.stage);

  const groupRef = useRef<THREE.Group>(null);
  const [hoveredComp, setHoveredComp] = useState<string | null>(null);

  // Smooth rotation when in assembled mode
  useFrame((_, delta) => {
    if (groupRef.current && viewMode === 'assembled' && explodeProgress < 0.05) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  // Calculate exploded offsets based on explodeProgress
  const ep = explodeProgress;
  const payloadOffset = new THREE.Vector3(0, 0, 1.8 * ep);
  const powerPortOffset = new THREE.Vector3(-2.4 * ep, 0, 0);
  const powerStarboardOffset = new THREE.Vector3(2.4 * ep, 0, 0);
  const commsOffset = new THREE.Vector3(0, 1.6 * ep, 0);
  const controlOffset = new THREE.Vector3(0, 0, -1.5 * ep);

  const isInternalView = viewMode === 'internal';
  const showDamage = stage === 'mission-simulation' && activeChallengeIndex === 0;

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 8, 7]} intensity={1.8} castShadow />
      <pointLight position={[-6, -4, -5]} intensity={0.4} color="#00d4ff" />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2.5}
        maxDistance={14}
        makeDefault
      />

      <group ref={groupRef}>
        {/* ── CENTRAL SATELLITE BUS ── */}
        <SatelliteBus
          isInternalView={isInternalView}
          isHovered={hoveredComp === 'bus'}
          onPointerOver={() => setHoveredComp('bus')}
          onPointerOut={() => setHoveredComp(null)}
        />

        {/* ── INTERNAL SYSTEMS (VISIBLE IN INTERNAL VIEW) ── */}
        {isInternalView && <InternalSystemsGroup />}

        {/* ── PAYLOAD COMPONENT ── */}
        {design.payload && (
          <group position={payloadOffset}>
            <PayloadComponent
              type={design.payload}
              isSelected={inspectedComponentId === design.payload}
              isHovered={hoveredComp === design.payload}
              onClick={() => setInspectedComponent(design.payload)}
              onPointerOver={() => setHoveredComp(design.payload)}
              onPointerOut={() => setHoveredComp(null)}
            />
          </group>
        )}

        {/* ── POWER COMPONENT (SOLAR ARRAYS) ── */}
        {design.power && (
          <>
            <group position={powerPortOffset}>
              <SolarWing
                type={design.power}
                side="port"
                isSelected={inspectedComponentId === design.power}
                isHovered={hoveredComp === design.power}
                hasDamage={showDamage}
                onClick={() => setInspectedComponent(design.power)}
                onPointerOver={() => setHoveredComp(design.power)}
                onPointerOut={() => setHoveredComp(null)}
              />
            </group>
            <group position={powerStarboardOffset}>
              <SolarWing
                type={design.power}
                side="starboard"
                isSelected={inspectedComponentId === design.power}
                isHovered={hoveredComp === design.power}
                hasDamage={false}
                onClick={() => setInspectedComponent(design.power)}
                onPointerOver={() => setHoveredComp(design.power)}
                onPointerOut={() => setHoveredComp(null)}
              />
            </group>
          </>
        )}

        {/* ── COMMUNICATION COMPONENT ── */}
        {design.communication && (
          <group position={commsOffset}>
            <CommunicationComponent
              type={design.communication}
              isSelected={inspectedComponentId === design.communication}
              isHovered={hoveredComp === design.communication}
              onClick={() => setInspectedComponent(design.communication)}
              onPointerOver={() => setHoveredComp(design.communication)}
              onPointerOut={() => setHoveredComp(null)}
            />
          </group>
        )}

        {/* ── CONTROL COMPONENT ── */}
        {design.control && (
          <group position={controlOffset}>
            <ControlComponent
              type={design.control}
              isSelected={inspectedComponentId === design.control}
              isHovered={hoveredComp === design.control}
              onClick={() => setInspectedComponent(design.control)}
              onPointerOver={() => setHoveredComp(design.control)}
              onPointerOut={() => setHoveredComp(null)}
            />
          </group>
        )}
      </group>
    </>
  );
}

// ── Satellite Bus Mesh ────────────────────────────────────────────────────────

function SatelliteBus({
  isInternalView,
  isHovered,
  onPointerOver,
  onPointerOut,
}: {
  isInternalView: boolean;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  return (
    <group onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Main Structural Frame */}
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.4]} />
        <meshStandardMaterial
          color={isInternalView ? '#00d4ff' : '#d4af37'} // Gold foil or translucent cyan
          metalness={isInternalView ? 0.2 : 0.85}
          roughness={isInternalView ? 0.1 : 0.3}
          transparent={isInternalView}
          opacity={isInternalView ? 0.25 : 1.0}
          wireframe={isInternalView}
          emissive={isHovered ? '#00d4ff' : '#000000'}
          emissiveIntensity={isHovered ? 0.3 : 0}
        />
      </mesh>

      {/* Structural Corner Ribs */}
      {!isInternalView && (
        <>
          <mesh position={[0.6, 0, 0]}>
            <boxGeometry args={[0.04, 1.22, 1.42]} />
            <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[-0.6, 0, 0]}>
            <boxGeometry args={[0.04, 1.22, 1.42]} />
            <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

// ── Internal Systems (X-Ray Mode) ─────────────────────────────────────────────

function InternalSystemsGroup() {
  const wheelRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (wheelRef.current) wheelRef.current.rotation.x += delta * 4.0;
    if (pulseRef.current) {
      const scale = 1.0 + Math.sin(Date.now() * 0.006) * 0.08;
      pulseRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Central Onboard Computer (OBC) */}
      <mesh ref={pulseRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.4]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.6} />
      </mesh>

      {/* Lithium-Ion Battery Packs (2 modules) */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[0.7, 0.22, 0.6]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.38, 0]}>
        <boxGeometry args={[0.7, 0.22, 0.6]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Titanium Propellant Tank */}
      <mesh position={[0, 0, -0.35]}>
        <sphereGeometry args={[0.26, 24, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Spinning 3-Axis Reaction Wheels */}
      <group ref={wheelRef} position={[0.28, 0, 0.25]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
      </group>
    </group>
  );
}

// ── Payload Subsystems ────────────────────────────────────────────────────────

function PayloadComponent({
  type,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  type: string;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const highlightColor = isSelected ? '#00ff88' : isHovered ? '#00d4ff' : '#000000';
  const highlightIntensity = isSelected ? 0.6 : isHovered ? 0.35 : 0;

  return (
    <group
      position={[0, 0, 0.7]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={onPointerOut}
    >
      {type === 'optical-camera' && (
        // Optical Telescope Barrel with front lens
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.28, 0.35, 0.8, 32]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.8}
              roughness={0.2}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Front Optical Aperture & Glass Reflection */}
          <mesh position={[0, 0.81, 0]}>
            <cylinderGeometry args={[0.24, 0.24, 0.04, 32]} />
            <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      )}

      {type === 'thermal-sensor' && (
        // Thermal Radiometer Shroud with Germanium IR Lens
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.6, 0.6, 0.5]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.7}
              roughness={0.2}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Germanium Amber Optical Shroud */}
          <mesh position={[0, 0.61, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.15, 24]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      )}

      {type === 'radar' && (
        // Synthetic Aperture Radar (SAR) Phased Array Panel
        <group position={[0, 0, 0.3]}>
          <mesh>
            <boxGeometry args={[1.6, 0.9, 0.08]} />
            <meshStandardMaterial
              color="#334155"
              metalness={0.85}
              roughness={0.25}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Golden Microwave Lattice Strip */}
          <mesh position={[0, 0, 0.05]}>
            <planeGeometry args={[1.5, 0.8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ── Solar Array Wings ─────────────────────────────────────────────────────────

function SolarWing({
  type,
  side,
  isSelected,
  isHovered,
  hasDamage,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  type: string;
  side: 'port' | 'starboard';
  isSelected: boolean;
  isHovered: boolean;
  hasDamage: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const dir = side === 'port' ? -1 : 1;
  const highlightColor = isSelected ? '#00ff88' : isHovered ? '#00d4ff' : '#000000';
  const highlightIntensity = isSelected ? 0.6 : isHovered ? 0.35 : 0;

  // Sparks animation if damaged
  const sparksRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (sparksRef.current && hasDamage) {
      sparksRef.current.rotation.z += delta * 8;
      const flicker = 0.5 + Math.random() * 0.8;
      (sparksRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = flicker;
    }
  });

  return (
    <group
      position={[dir * 0.6, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={onPointerOut}
    >
      {/* Boom Yoke / Rotary Joint */}
      <mesh position={[dir * 0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* Main Solar Wing Panel */}
      <mesh position={[dir * 1.3, 0, 0]}>
        <boxGeometry args={[1.8, 0.8, 0.04]} />
        <meshStandardMaterial
          color={hasDamage ? '#451a03' : '#1e3a8a'} // Scorched brown if damaged
          metalness={0.7}
          roughness={0.2}
          emissive={hasDamage ? '#ef4444' : highlightColor}
          emissiveIntensity={hasDamage ? 0.8 : highlightIntensity}
        />
      </mesh>

      {/* Advanced Wing: Second Outboard Articulated Panel */}
      {type === 'advanced-solar' && (
        <group position={[dir * 2.2, 0, 0]}>
          <mesh position={[dir * 0.9, 0, 0]}>
            <boxGeometry args={[1.6, 0.8, 0.04]} />
            <meshStandardMaterial
              color="#1e3a8a"
              metalness={0.7}
              roughness={0.2}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
        </group>
      )}

      {/* Damage Spark Particles Effect */}
      {hasDamage && (
        <mesh ref={sparksRef} position={[dir * 1.2, 0.1, 0.08]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#f97316" emissive="#ef4444" emissiveIntensity={1.5} />
        </mesh>
      )}
    </group>
  );
}

// ── Communication Subsystem ───────────────────────────────────────────────────

function CommunicationComponent({
  type,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  type: string;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const highlightColor = isSelected ? '#00ff88' : isHovered ? '#00d4ff' : '#000000';
  const highlightIntensity = isSelected ? 0.6 : isHovered ? 0.35 : 0;

  return (
    <group
      position={[0, 0.6, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={onPointerOut}
    >
      {type === 'basic-antenna' ? (
        // Omnidirectional Whip Antenna
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.015, 0.02, 0.7, 16]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.9}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.5} />
          </mesh>
        </group>
      ) : (
        // High-Gain Parabolic Dish with Sub-Reflector
        <group position={[0, 0.4, 0]} rotation={[-0.4, 0, 0]}>
          {/* Steerable Gimbal Arm */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.3, 16]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Curved Parabolic Bowl */}
          <mesh>
            <sphereGeometry args={[0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.8]} />
            <meshStandardMaterial
              color="#f8fafc"
              side={THREE.DoubleSide}
              metalness={0.7}
              roughness={0.3}
              emissive={highlightColor}
              emissiveIntensity={highlightIntensity}
            />
          </mesh>
          {/* Feed Horn Pod */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 12]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ── Control Subsystem ─────────────────────────────────────────────────────────

function ControlComponent({
  type,
  isSelected,
  isHovered,
  onClick,
  onPointerOver,
  onPointerOut,
}: {
  type: string;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
}) {
  const highlightColor = isSelected ? '#00ff88' : isHovered ? '#00d4ff' : '#000000';
  const highlightIntensity = isSelected ? 0.6 : isHovered ? 0.35 : 0;

  return (
    <group
      position={[0, 0, -0.7]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver();
      }}
      onPointerOut={onPointerOut}
    >
      {type === 'basic-control' ? (
        // 4-Corner Cold Gas Thruster Quads
        <group>
          {[-0.45, 0.45].map((x, i) =>
            [-0.45, 0.45].map((y, j) => (
              <mesh key={`${i}-${j}`} position={[x, y, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.06, 0.14, 16]} />
                <meshStandardMaterial
                  color="#94a3b8"
                  metalness={0.85}
                  emissive={highlightColor}
                  emissiveIntensity={highlightIntensity}
                />
              </mesh>
            ))
          )}
        </group>
      ) : (
        // Advanced RCS Cluster & Dual Star Trackers
        <group>
          {/* Hydrazine RCS Rocket Thruster Nozzles */}
          {[-0.45, 0.45].map((x, i) =>
            [-0.45, 0.45].map((y, j) => (
              <mesh key={`rcs-${i}-${j}`} position={[x, y, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.08, 0.18, 20]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  metalness={0.95}
                  roughness={0.1}
                  emissive={highlightColor}
                  emissiveIntensity={highlightIntensity}
                />
              </mesh>
            ))
          )}
          {/* Dual Star Tracker Optical Baffles */}
          <group position={[0, 0.45, 0.1]} rotation={[0.4, 0, 0]}>
            <mesh position={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
            <mesh position={[0.15, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
              <meshStandardMaterial color="#0f172a" metalness={0.8} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
