/**
 * VYOM — Interactive Configurable 3D Spacecraft Component
 * High-fidelity aerospace 3D models matching Mission Control room real-time missions:
 * 1. Crewed Exploration Capsule (Gaganyaan / Chandrayaan-Crew)
 * 2. Earth Observation Satellite (Cartosat / Sentinel)
 * 3. Planetary Deep Space Probe (Mangalyaan-2 Mars Explorer)
 * 4. Scientific Space Telescope (Astrosat-2 Deep Space Observatory)
 * 5. Communication Satellite (GSAT Telecom Relay)
 * 6. Navigation Satellite (NavIC Positioning)
 *
 * Augmented with continuous exploded view slider, component raycasting, and camera angle controls.
 * Strictly no emojis used.
 */

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { SatelliteCategory, SatelliteComponentId } from '../../types/satelliteConfiguration';
import { SATELLITE_DEFINITIONS } from '../../types/satelliteConfiguration';

export type CameraPreset = 'isometric' | 'front' | 'top' | 'side' | 'nadir' | 'reset';

interface ConfigurableSatellite3DProps {
  category: SatelliteCategory;
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number; // 0.0 to 1.0
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  cameraPreset?: CameraPreset;
  interactive?: boolean;
}

export function ConfigurableSatellite3D({
  category,
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  cameraPreset = 'isometric',
  interactive = true,
}: ConfigurableSatellite3DProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Target camera position and lookAt target for smooth transitions
  const targetCamPos = useRef(new THREE.Vector3(3.2, 2.2, 4.2));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Handle camera angle presets
  useEffect(() => {
    switch (cameraPreset) {
      case 'front':
        targetCamPos.current.set(0, 0, 4.8);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'top':
        targetCamPos.current.set(0, 5.2, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'side':
        targetCamPos.current.set(4.8, 0.4, 0);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'nadir':
        targetCamPos.current.set(0, -5.0, 0.01);
        targetLookAt.current.set(0, 0, 0);
        break;
      case 'isometric':
      case 'reset':
      default:
        targetCamPos.current.set(3.2, 2.2, 4.2);
        targetLookAt.current.set(0, 0, 0);
        break;
    }
  }, [cameraPreset]);

  // Adjust lookAt target toward selected component when exploded
  useEffect(() => {
    if (!selectedComponentId) {
      targetLookAt.current.set(0, 0, 0);
      return;
    }
    const def = SATELLITE_DEFINITIONS[category] || SATELLITE_DEFINITIONS['earth_observation'];
    const comp = def.components.find((c) => c.id === selectedComponentId);
    if (comp) {
      const [ox, oy, oz] = comp.defaultOffset;
      targetLookAt.current.set(ox * explodeProgress * 0.6, oy * explodeProgress * 0.6, oz * explodeProgress * 0.6);
    }
  }, [selectedComponentId, explodeProgress, category]);

  useFrame((_, delta) => {
    if (interactive && controlsRef.current) {
      if (cameraPreset !== 'reset') {
        camera.position.lerp(targetCamPos.current, delta * 3.0);
      }
      controlsRef.current.target.lerp(targetLookAt.current, delta * 4.0);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 8, 6]} intensity={1.8} color="#fff8f0" castShadow />
      <directionalLight position={[-6, -4, -4]} intensity={0.6} color="#7cc4ff" />
      <directionalLight position={[0, 6, -6]} intensity={0.5} color="#4488dd" />
      <pointLight position={[0, 3.5, 0]} intensity={0.8} color="#00d4ff" distance={10} />

      <SatelliteSceneGraph
        category={category}
        selectedOptions={selectedOptions}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      />

      {interactive && (
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.2}
          maxDistance={10.0}
          dampingFactor={0.06}
          rotateSpeed={0.8}
        />
      )}
    </>
  );
}

interface SceneGraphProps {
  category: SatelliteCategory;
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
}

function SatelliteSceneGraph({
  category,
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
}: SceneGraphProps) {
  const masterGroupRef = useRef<THREE.Group>(null);
  const statusLedRef = useRef<THREE.PointLight>(null);

  // Aerospace materials matching DynamicSpacecraftModel from Mission Control
  const materials = useMemo(() => {
    return {
      bodyGold: new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 0.9,
        roughness: 0.25,
      }),
      bodyTitanium: new THREE.MeshStandardMaterial({
        color: '#c0c8d0',
        metalness: 0.85,
        roughness: 0.2,
      }),
      bodyCarbon: new THREE.MeshStandardMaterial({
        color: '#1a1f26',
        metalness: 0.5,
        roughness: 0.4,
      }),
      heatShield: new THREE.MeshStandardMaterial({
        color: '#2b221b',
        metalness: 0.2,
        roughness: 0.85,
      }),
      opticalLens: new THREE.MeshPhysicalMaterial({
        color: '#002244',
        metalness: 0.9,
        roughness: 0.05,
        transmission: 0.6,
        thickness: 0.5,
        reflectivity: 0.9,
      }),
      sunshield: new THREE.MeshStandardMaterial({
        color: '#c5a059',
        metalness: 0.8,
        roughness: 0.3,
        side: THREE.DoubleSide,
      }),
      antennaWhite: new THREE.MeshStandardMaterial({
        color: '#f0f4f8',
        metalness: 0.6,
        roughness: 0.3,
      }),
      thrusterDark: new THREE.MeshStandardMaterial({
        color: '#2a313d',
        metalness: 0.95,
        roughness: 0.3,
      }),
      highlightGlow: new THREE.MeshStandardMaterial({
        color: '#00e5ff',
        emissive: '#00e5ff',
        emissiveIntensity: 0.85,
        metalness: 0.5,
        roughness: 0.2,
      }),
    };
  }, []);

  // Solar panel shader with animated photovoltaic grid and shimmer
  const solarPanelShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        power: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float power;
        void main() {
          vec2 grid = fract(vUv * vec2(12.0, 6.0));
          float cell = step(0.04, grid.x) * step(0.04, grid.y);
          vec3 baseColor = vec3(0.01, 0.04, 0.16);
          vec3 cellColor = vec3(0.04, 0.14, 0.42);
          vec3 color = mix(baseColor, cellColor, cell);
          float shimmer = sin(vUv.x * 25.0 + time * 1.5) * 0.08 + 0.92;
          color *= shimmer * power;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }, []);

  // Gentle idle rotation when assembled and status beacon pulse
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    solarPanelShader.uniforms.time.value = t;

    if (masterGroupRef.current && explodeProgress < 0.05) {
      masterGroupRef.current.rotation.y = t * 0.1;
      masterGroupRef.current.rotation.x = Math.sin(t * 0.08) * 0.03;
    }

    if (statusLedRef.current) {
      statusLedRef.current.intensity = Math.sin(t * 2.0) > 0 ? 1.0 : 0.2;
    }
  });

  return (
    <group ref={masterGroupRef} scale={[1.3, 1.3, 1.3]}>
      {category === 'crewed_capsule' && (
        <CrewedCapsuleSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}
      {category === 'earth_observation' && (
        <EarthObservationSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}
      {category === 'planetary_probe' && (
        <PlanetaryProbeSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}
      {category === 'scientific' && (
        <ScientificSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}
      {category === 'communication' && (
        <CommunicationSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}
      {category === 'navigation' && (
        <NavigationSatellite3D
          selectedOptions={selectedOptions}
          explodeProgress={explodeProgress}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
          materials={materials}
          solarPanelShader={solarPanelShader}
        />
      )}

      {/* Real-time Health Status Beacon Light */}
      <pointLight
        ref={statusLedRef}
        position={[0, 0.7, 0]}
        intensity={0.8}
        distance={3.0}
        color="#00ff88"
      />
    </group>
  );
}

/* =========================================================================
   GENERIC INTERACTIVE SUBSYSTEM NODE (Smooth translation + Raycasting)
   ========================================================================= */
interface SubsystemNodeProps {
  id: SatelliteComponentId;
  defaultOffset: [number, number, number];
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  children: React.ReactNode;
}

function SubsystemNode({
  id,
  defaultOffset,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  children,
}: SubsystemNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedComponentId === id;

  const currentPos = useMemo(() => new THREE.Vector3(), []);
  const targetPos = useMemo(() => {
    return new THREE.Vector3(
      defaultOffset[0] * explodeProgress,
      defaultOffset[1] * explodeProgress,
      defaultOffset[2] * explodeProgress
    );
  }, [defaultOffset, explodeProgress]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      currentPos.lerp(targetPos, delta * 8.0);
      groupRef.current.position.copy(currentPos);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (onSelectComponent) onSelectComponent(id);
  };

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      {/* Visual selection and hover beacon ring */}
      {(isSelected || hovered) && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.55, 0.62, 32]} />
          <meshBasicMaterial
            color="#00d4ff"
            side={THREE.DoubleSide}
            transparent
            opacity={isSelected ? 0.9 : 0.4}
          />
        </mesh>
      )}
    </group>
  );
}

/* =========================================================================
   1. CREWED EXPLORATION CAPSULE (Human Spaceflight / Gaganyaan / Chandrayaan-Crew)
   ========================================================================= */
function CrewedCapsuleSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  const isExtendedWings = selectedOptions['solar_panels'] === 'extended_tri_wing';
  const wingSpan = isExtendedWings ? 1.35 : 0.95;

  return (
    <group>
      {/* 1. CREW COMMAND MODULE BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0.4, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.35, 0]} material={materials.bodyTitanium} castShadow>
          <cylinderGeometry args={[0.22, 0.46, 0.52, 32]} />
        </mesh>
        {/* Cockpit Viewport Window */}
        <mesh position={[0, 0.42, 0.24]} rotation={[0.4, 0, 0]} material={materials.opticalLens}>
          <circleGeometry args={[0.07, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 2. ECLSS LIFE SUPPORT CABIN PAYLOAD */}
      <SubsystemNode
        id="payload"
        defaultOffset={[0, 1.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, 0.4, 0]}>
          <mesh material={materials.antennaWhite}>
            <cylinderGeometry args={[0.18, 0.18, 0.22, 24]} />
          </mesh>
          <mesh position={[0, 0.12, 0]} material={materials.highlightGlow}>
            <torusGeometry args={[0.12, 0.015, 12, 24]} />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 3. DOCKING ADAPTER RING & PHASED ANTENNA */}
      <SubsystemNode
        id="antenna"
        defaultOffset={[0, 2.5, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.63, 0]} material={materials.antennaWhite}>
          <torusGeometry args={[0.13, 0.022, 16, 32]} />
        </mesh>
      </SubsystemNode>

      {/* 4. QUAD-REDUNDANT AVIONICS OBC */}
      <SubsystemNode
        id="obc"
        defaultOffset={[0, 1.9, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.55, 0]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.18, 0.08, 0.18]} />
        </mesh>
      </SubsystemNode>

      {/* 5. ABLATIVE BASE HEAT SHIELD BASE (PICA-X) */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[0, -1.3, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.08, 0]} material={materials.heatShield} castShadow>
          <cylinderGeometry args={[0.48, 0.45, 0.07, 32]} />
        </mesh>
      </SubsystemNode>

      {/* 6. SERVICE MODULE & POWER EPS */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[0, -0.6, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.28, 0]} material={materials.bodyTitanium} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.65, 32]} />
        </mesh>
        {/* Radiator Wrap Strip */}
        <mesh position={[0, -0.28, 0]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.455, 0.455, 0.3, 32, 1, true]} />
        </mesh>
      </SubsystemNode>

      {/* 7. TWIN DEPLOYABLE SOLAR WINGS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[2.2, -0.4, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, -0.28, 0]}>
          <mesh position={[-wingSpan, 0, 0]}>
            <boxGeometry args={[wingSpan * 0.95, 0.02, 0.38]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[wingSpan, 0, 0]}>
            <boxGeometry args={[wingSpan * 0.95, 0.02, 0.38]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 8. SERVICE PROPULSION OMS ENGINE BELL */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, -2.1, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.7, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.08, 0.24, 0.22, 24]} />
        </mesh>
      </SubsystemNode>

      {/* 9. RCS ATTITUDE THRUSTERS */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[-1.4, 0.5, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[-0.48, 0.15, 0]}>
          <mesh material={materials.thrusterDark}>
            <cylinderGeometry args={[0.02, 0.04, 0.08, 12]} />
          </mesh>
          <mesh position={[0.96, 0, 0]} material={materials.thrusterDark}>
            <cylinderGeometry args={[0.02, 0.04, 0.08, 12]} />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 10. COMMUNICATIONS UPLINK */}
      <SubsystemNode
        id="communication"
        defaultOffset={[1.4, 0.5, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0.42, 0.35, 0]}>
          <mesh material={materials.antennaWhite}>
            <sphereGeometry args={[0.09, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
        </group>
      </SubsystemNode>
    </group>
  );
}

/* =========================================================================
   2. EARTH OBSERVATION SATELLITE (Cartosat / Sentinel)
   ========================================================================= */
function EarthObservationSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  const isSAR = selectedOptions['payload'] === 'sar_radar';

  return (
    <group>
      {/* 1. GOLD FOIL BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, 0]} material={materials.bodyGold} castShadow>
          <boxGeometry args={[0.55, 0.45, 0.75]} />
        </mesh>
      </SubsystemNode>

      {/* 2. NADIR OPTICAL CAMERA / SAR PAYLOAD */}
      <SubsystemNode
        id="payload"
        defaultOffset={[0, -1.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        {!isSAR ? (
          <group position={[0, -0.3, 0.15]}>
            <mesh material={materials.bodyCarbon}>
              <cylinderGeometry args={[0.15, 0.18, 0.28, 32]} />
            </mesh>
            <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.opticalLens}>
              <circleGeometry args={[0.14, 32]} />
            </mesh>
          </group>
        ) : (
          <group position={[0, -0.3, 0.15]}>
            <mesh material={materials.antennaWhite}>
              <boxGeometry args={[0.9, 0.04, 0.45]} />
            </mesh>
          </group>
        )}
      </SubsystemNode>

      {/* 3. SAR RADAR ANTENNA BOOM */}
      <SubsystemNode
        id="antenna"
        defaultOffset={[0, 1.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.28, 0]} material={materials.antennaWhite}>
          <boxGeometry args={[0.85, 0.03, 0.42]} />
        </mesh>
      </SubsystemNode>

      {/* 4. DUAL SEGMENT DEPLOYABLE SOLAR WINGS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[2.2, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group>
          <mesh position={[-1.05, 0, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.6]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[1.05, 0, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.6]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 5. STAR TRACKER OPTICAL HOODS (ADCS) */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[1.2, 1.2, -1.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.24, 0.24, -0.22]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.035, 0.045, 0.1, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 6. HYDRAZINE RCS PROPULSION */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, 0, -2.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.045, 0.13, 0.18, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 7. AVIONICS ON-BOARD COMPUTER */}
      <SubsystemNode
        id="obc"
        defaultOffset={[-1.2, 0.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.32, 0.1, 0]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.08, 0.2, 0.25]} />
        </mesh>
      </SubsystemNode>

      {/* 8. POWER SYSTEM BATTERIES */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[0, 1.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.25, 0]} material={materials.bodyTitanium}>
          <boxGeometry args={[0.35, 0.06, 0.45]} />
        </mesh>
      </SubsystemNode>

      {/* 9. COMMUNICATIONS DOWNLINK */}
      <SubsystemNode
        id="communication"
        defaultOffset={[0, -1.0, 1.6]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.15, 0.45]} material={materials.antennaWhite}>
          <cylinderGeometry args={[0.08, 0.02, 0.12, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 10. THERMAL RADIATORS */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[-1.4, -0.6, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.3, -0.1, 0]} material={materials.bodyTitanium}>
          <planeGeometry args={[0.02, 0.35]} />
        </mesh>
      </SubsystemNode>
    </group>
  );
}

/* =========================================================================
   3. PLANETARY DEEP SPACE PROBE (Mangalyaan-2 Mars Explorer)
   ========================================================================= */
function PlanetaryProbeSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  return (
    <group>
      {/* 1. OCTAGONAL DEEP SPACE BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.1, 0]} material={materials.bodyGold} castShadow>
          <cylinderGeometry args={[0.48, 0.48, 0.52, 8]} />
        </mesh>
      </SubsystemNode>

      {/* 2. PARABOLIC HIGH-GAIN ANTENNA DISH */}
      <SubsystemNode
        id="antenna"
        defaultOffset={[0, 2.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, 0.38, 0]} rotation={[-0.25, 0, 0]}>
          <mesh material={materials.antennaWhite}>
            <cylinderGeometry args={[0.48, 0.09, 0.14, 32, 1, true]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} material={materials.antennaWhite}>
            <cylinderGeometry args={[0.015, 0.02, 0.24, 12]} />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 3. MAGNETOMETER SCIENCE BOOM PAYLOAD */}
      <SubsystemNode
        id="payload"
        defaultOffset={[0, -0.3, 2.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.1, 0.7]} rotation={[Math.PI / 2, 0, 0]} material={materials.antennaWhite}>
          <cylinderGeometry args={[0.022, 0.022, 0.65, 8]} />
        </mesh>
      </SubsystemNode>

      {/* 4. LIQUID APOGEE ENGINE (LAM) */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, -2.0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.48, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.065, 0.22, 0.28, 24]} />
        </mesh>
      </SubsystemNode>

      {/* 5. RTG POWER MODULES */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[1.8, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        {[-1, 1].map((dir, i) => (
          <mesh key={i} position={[dir * 0.58, -0.1, 0]} material={materials.bodyCarbon}>
            <boxGeometry args={[0.22, 0.32, 0.06]} />
          </mesh>
        ))}
      </SubsystemNode>

      {/* 6. RADIATION-HARDENED SOLAR WINGS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[-2.2, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group>
          <mesh position={[-1.1, 0, 0]}>
            <boxGeometry args={[0.9, 0.02, 0.5]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[1.1, 0, 0]}>
            <boxGeometry args={[0.9, 0.02, 0.5]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 7. ATTITUDE ADCS SENSORS */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[1.2, 1.2, 1.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.3, 0.25, 0.3]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.03, 0.04, 0.08, 12]} />
        </mesh>
      </SubsystemNode>

      {/* 8. AUTONOMOUS DEEP SPACE OBC */}
      <SubsystemNode
        id="obc"
        defaultOffset={[-1.2, 1.2, -1.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.3, 0.25, -0.3]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
        </mesh>
      </SubsystemNode>

      {/* 9. DEEP SPACE Ka/X-BAND COMMUNICATIONS */}
      <SubsystemNode
        id="communication"
        defaultOffset={[0, 1.4, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.25, 0]} material={materials.bodyTitanium}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 10. THERMAL MULTI-LAYER BLANKETS */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[0, 1.0, -1.4]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.15, -0.5]} material={materials.sunshield}>
          <planeGeometry args={[0.4, 0.4]} />
        </mesh>
      </SubsystemNode>
    </group>
  );
}

/* =========================================================================
   4. SCIENTIFIC SPACE TELESCOPE (Astrosat-2 Deep Space Observatory)
   ========================================================================= */
function ScientificSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  return (
    <group>
      {/* 1. OPTICAL TELESCOPE TUBE ASSEMBLY PAYLOAD */}
      <SubsystemNode
        id="payload"
        defaultOffset={[0, 1.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, 0.15, 0]}>
          <mesh material={materials.bodyTitanium} castShadow>
            <cylinderGeometry args={[0.32, 0.34, 0.98, 32]} />
          </mesh>
          {/* Open Sunshade Door & Optical Lens */}
          <group position={[0, 0.54, 0]} rotation={[0.4, 0, 0]}>
            <mesh material={materials.bodyCarbon}>
              <cylinderGeometry args={[0.33, 0.33, 0.16, 32, 1, true]} />
            </mesh>
            <mesh position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]} material={materials.opticalLens}>
              <circleGeometry args={[0.3, 32]} />
            </mesh>
          </group>
        </group>
      </SubsystemNode>

      {/* 2. MULTI-LAYER CRYOGENIC DIAMOND SUNSHIELD THERMAL */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[0, -1.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, -0.4, 0]}>
          {[-0.05, 0, 0.05].map((offsetY, idx) => (
            <mesh key={idx} position={[0, offsetY, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]} material={materials.sunshield}>
              <planeGeometry args={[1.4 - idx * 0.12, 1.4 - idx * 0.12]} />
            </mesh>
          ))}
        </group>
      </SubsystemNode>

      {/* 3. CENTRAL METERING STRUCTURE BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.2, 0]} material={materials.bodyTitanium}>
          <cylinderGeometry args={[0.35, 0.35, 0.3, 32]} />
        </mesh>
      </SubsystemNode>

      {/* 4. CRYOCOOLER RADIATOR STRIP */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[1.4, 0.5, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.34, 0.1, 0]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.05, 0.48, 0.28]} />
        </mesh>
      </SubsystemNode>

      {/* 5. GIMBALLED SPACE-TO-GROUND COMMS DISH */}
      <SubsystemNode
        id="communication"
        defaultOffset={[0, -1.2, 1.6]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.5, 0.38]} material={materials.antennaWhite}>
          <sphereGeometry args={[0.14, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      </SubsystemNode>

      {/* 6. SOLAR WINGS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[-2.2, -0.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, -0.25, 0]}>
          <mesh position={[-1.0, 0, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.45]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[1.0, 0, 0]}>
            <boxGeometry args={[0.8, 0.02, 0.45]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 7. REACTION CONTROL PROPULSION */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, -2.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.65, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.04, 0.1, 0.14, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 8. FINE GUIDANCE SENSORS (ADCS) */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[1.2, 0, -1.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.25, -0.1, -0.2]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.03, 0.04, 0.08, 12]} />
        </mesh>
      </SubsystemNode>

      {/* 9. SCIENTIFIC DATA COMPUTER OBC */}
      <SubsystemNode
        id="obc"
        defaultOffset={[-1.2, 0, -1.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.25, -0.1, -0.2]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
        </mesh>
      </SubsystemNode>

      {/* 10. HIGH GAIN ANTENNA MAST */}
      <SubsystemNode
        id="antenna"
        defaultOffset={[0, -0.8, -1.6]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.4, -0.3]} material={materials.antennaWhite}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        </mesh>
      </SubsystemNode>
    </group>
  );
}

/* =========================================================================
   5. COMMUNICATION SATELLITE (GSAT Telecom Relay)
   ========================================================================= */
function CommunicationSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  return (
    <group>
      {/* 1. LARGE CUBE BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh material={materials.bodyGold} castShadow>
          <boxGeometry args={[0.7, 0.9, 0.7]} />
        </mesh>
      </SubsystemNode>

      {/* 2. DUAL EAST/WEST REFLECTOR DISHES (PAYLOAD & ANTENNA) */}
      <SubsystemNode
        id="payload"
        defaultOffset={[-1.8, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[-0.6, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <mesh material={materials.antennaWhite}>
            <sphereGeometry args={[0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI / 3]} />
          </mesh>
        </group>
      </SubsystemNode>

      <SubsystemNode
        id="antenna"
        defaultOffset={[1.8, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0.6, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <mesh material={materials.antennaWhite}>
            <sphereGeometry args={[0.42, 24, 24, 0, Math.PI * 2, 0, Math.PI / 3]} />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 3. MULTI-PANEL EXTENDED SOLAR ARRAYS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[0, 0, 2.2]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group>
          <mesh position={[0, -1.1, 0]}>
            <boxGeometry args={[0.5, 0.8, 0.02]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <boxGeometry args={[0.5, 0.8, 0.02]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 4. HIGH POWER PROPULSION ENGINE */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, 0, -2.0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.06, 0.18, 0.22, 24]} />
        </mesh>
      </SubsystemNode>

      {/* 5. POWER SYSTEM */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[0, 1.4, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.52, 0]} material={materials.bodyTitanium}>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
        </mesh>
      </SubsystemNode>

      {/* 6. TRANSPONDERS */}
      <SubsystemNode
        id="communication"
        defaultOffset={[0, -1.4, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.52, 0]} material={materials.antennaWhite}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 7. ADCS */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[1.2, 1.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.3, 0.3, 0.3]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
        </mesh>
      </SubsystemNode>

      {/* 8. OBC */}
      <SubsystemNode
        id="obc"
        defaultOffset={[-1.2, 1.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.3, 0.3, 0.3]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
        </mesh>
      </SubsystemNode>

      {/* 9. THERMAL */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[0, 0, -1.4]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, -0.4]} material={materials.bodyTitanium}>
          <planeGeometry args={[0.6, 0.8]} />
        </mesh>
      </SubsystemNode>
    </group>
  );
}

/* =========================================================================
   6. NAVIGATION SATELLITE (NavIC Positioning)
   ========================================================================= */
function NavigationSatellite3D({
  selectedOptions,
  explodeProgress,
  selectedComponentId,
  onSelectComponent,
  materials,
  solarPanelShader,
}: {
  selectedOptions: Record<SatelliteComponentId, string>;
  explodeProgress: number;
  selectedComponentId: SatelliteComponentId | null;
  onSelectComponent?: (id: SatelliteComponentId) => void;
  materials: any;
  solarPanelShader: THREE.ShaderMaterial;
}) {
  return (
    <group>
      {/* 1. BUS */}
      <SubsystemNode
        id="bus"
        defaultOffset={[0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh material={materials.bodyGold} castShadow>
          <boxGeometry args={[0.6, 0.7, 0.6]} />
        </mesh>
      </SubsystemNode>

      {/* 2. HELIX PHASED ARRAY ANTENNA */}
      <SubsystemNode
        id="antenna"
        defaultOffset={[0, 1.8, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group position={[0, 0.45, 0]}>
          <mesh material={materials.antennaWhite}>
            <cylinderGeometry args={[0.24, 0.24, 0.1, 24]} />
          </mesh>
          {[-0.08, 0.08].map((x, xi) =>
            [-0.08, 0.08].map((z, zi) => (
              <mesh key={`${xi}-${zi}`} position={[x, 0.12, z]} material={materials.highlightGlow}>
                <cylinderGeometry args={[0.015, 0.015, 0.16, 8]} />
              </mesh>
            ))
          )}
        </group>
      </SubsystemNode>

      {/* 3. ATOMIC CLOCK RUBIDIUM FREQUENCY PAYLOAD */}
      <SubsystemNode
        id="payload"
        defaultOffset={[0, -1.5, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, -0.42, 0]} material={materials.bodyTitanium}>
          <boxGeometry args={[0.26, 0.18, 0.26]} />
        </mesh>
      </SubsystemNode>

      {/* 4. DUAL SOLAR WINGS */}
      <SubsystemNode
        id="solar_panels"
        defaultOffset={[2.0, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <group>
          <mesh position={[-0.95, 0, 0]}>
            <boxGeometry args={[0.75, 0.02, 0.45]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
          <mesh position={[0.95, 0, 0]}>
            <boxGeometry args={[0.75, 0.02, 0.45]} />
            <primitive object={solarPanelShader} attach="material" />
          </mesh>
        </group>
      </SubsystemNode>

      {/* 5. PROPULSION */}
      <SubsystemNode
        id="propulsion"
        defaultOffset={[0, 0, -1.8]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} material={materials.thrusterDark}>
          <cylinderGeometry args={[0.05, 0.14, 0.18, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 6. ADCS */}
      <SubsystemNode
        id="adcs"
        defaultOffset={[1.2, 1.0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0.25, 0.25, 0]} material={materials.bodyCarbon}>
          <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
        </mesh>
      </SubsystemNode>

      {/* 7. OBC */}
      <SubsystemNode
        id="obc"
        defaultOffset={[-1.2, 1.0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.25, 0.25, 0]} material={materials.bodyCarbon}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
        </mesh>
      </SubsystemNode>

      {/* 8. POWER */}
      <SubsystemNode
        id="power_system"
        defaultOffset={[0, 1.2, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0.38, 0]} material={materials.bodyTitanium}>
          <boxGeometry args={[0.3, 0.08, 0.3]} />
        </mesh>
      </SubsystemNode>

      {/* 9. COMMUNICATION */}
      <SubsystemNode
        id="communication"
        defaultOffset={[0, -1.0, 1.4]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[0, 0, 0.35]} material={materials.antennaWhite}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        </mesh>
      </SubsystemNode>

      {/* 10. THERMAL */}
      <SubsystemNode
        id="thermal"
        defaultOffset={[-1.2, 0, 0]}
        explodeProgress={explodeProgress}
        selectedComponentId={selectedComponentId}
        onSelectComponent={onSelectComponent}
      >
        <mesh position={[-0.32, 0, 0]} material={materials.bodyTitanium}>
          <planeGeometry args={[0.02, 0.5]} />
        </mesh>
      </SubsystemNode>
    </group>
  );
}

export default ConfigurableSatellite3D;
