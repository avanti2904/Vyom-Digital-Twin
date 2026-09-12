/**
 * VYOM — Gamified Orbit Selection Step
 * Interactive 3D Earth with animated satellite orbits (LEO, MEO, GEO),
 * nadir footprint coverage, advantages/disadvantages, and AI-recommended orbit selector.
 */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GamifiedEarthOrbit3D } from '../3d/GamifiedEarthOrbit3D';
import {
  GAMIFIED_MISSIONS,
  ORBIT_DEFINITIONS,
} from '../../../constants/gamifiedData';
import type { OrbitType } from '../../../types/gamified';

export function OrbitSelectionStep() {
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);
  const selectedOrbit = useGamifiedStore((s) => s.selectedOrbit);
  const selectOrbit = useGamifiedStore((s) => s.selectOrbit);
  const acceptAiOrbit = useGamifiedStore((s) => s.acceptAiOrbit);
  const setStage = useGamifiedStore((s) => s.setStage);

  const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
  const orbits: OrbitType[] = ['LEO', 'MEO', 'GEO'];

  const isAiOrbitMatch = selectedOrbit === mission?.recommendedOrbit;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* ── TOP HEADER / AI RECOMMENDATION BANNER ── */}
      <div
        style={{
          background: 'rgba(5, 12, 28, 0.94)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🌍</span>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#00d4ff', letterSpacing: '0.12em' }}>
              PHASE 02 // ORBITAL TRAJECTORY SELECTION
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>
              Place your satellite in orbit for {mission?.title}
            </div>
          </div>
        </div>

        {/* AI Recommendation Quick Action */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 8,
            padding: '4px 12px',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 14 }}>🤖</span>
          <div style={{ fontSize: 10.5 }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>AI Recommended: </span>
            <strong style={{ color: '#00ff88' }}>{mission?.recommendedOrbit} Orbit</strong>
          </div>
          <button
            onClick={acceptAiOrbit}
            style={{
              padding: '4px 8px',
              borderRadius: 5,
              border: 'none',
              background: isAiOrbitMatch ? 'rgba(0, 255, 136, 0.25)' : '#00d4ff',
              color: isAiOrbitMatch ? '#00ff88' : '#020409',
              fontSize: 9.5,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {isAiOrbitMatch ? '✓ AI ORBIT LOCKED' : 'ACCEPT AI ORBIT'}
          </button>
        </div>
      </div>

      {/* ── CENTRAL 3D EARTH & SIDE ORBIT CARDS ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: ORBIT CARDS (LEO, MEO, GEO) */}
        <div
          style={{
            width: 380,
            height: '100%',
            background: 'rgba(5, 12, 26, 0.92)',
            borderRight: '1px solid rgba(0, 212, 255, 0.15)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px 6px', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
            SELECT ORBITAL ALTITUDE & REGIME:
          </div>

          {/* Scrollable Orbits List */}
          <div
            style={{
              padding: '6px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 212, 255, 0.35) rgba(2, 4, 9, 0.6)',
            }}
          >

            {orbits.map((orbitKey) => {
              const def = ORBIT_DEFINITIONS[orbitKey];
              const isSelected = selectedOrbit === orbitKey;
              const isRecommended = mission?.recommendedOrbit === orbitKey;

              return (
                <motion.div
                  key={orbitKey}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => selectOrbit(orbitKey)}
                  style={{
                    background: isSelected ? 'rgba(0, 212, 255, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1.5px solid ${isSelected ? '#00d4ff' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: 12,
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#00d4ff' : '#ffffff' }}>
                        {def.name}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>
                        {def.altitudeKm}
                      </span>
                    </div>

                    {isRecommended && (
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(0, 255, 136, 0.15)',
                          color: '#00ff88',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          fontWeight: 700,
                        }}
                      >
                        AI PICK
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                    {def.coverageDescription}
                  </p>

                  {/* Period & Ground Resolution */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      background: 'rgba(0,0,0,0.25)',
                      padding: '8px 10px',
                      borderRadius: 6,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>ORBIT PERIOD</span>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{def.orbitalPeriod}</span>
                    </div>
                    <div>
                      <span style={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>RESOLUTION</span>
                      <span style={{ color: '#38bdf8', fontWeight: 600 }}>{def.groundResolution}</span>
                    </div>
                  </div>

                  {/* Advantages & Disadvantages */}
                  <div style={{ fontSize: 11, lineHeight: 1.4 }}>
                    <div style={{ color: '#00ff88', marginBottom: 2 }}>
                      ✓ {def.pros[0]}
                    </div>
                    <div style={{ color: '#ff9f0a' }}>
                      ⚠️ {def.cons[0]}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action Navigation Footer */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(3, 8, 20, 0.95)', flexShrink: 0, display: 'flex', gap: 8 }}>
            <button
              onClick={() => setStage('design-satellite')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              ← MODIFY
            </button>
            <button
              disabled={!selectedOrbit}
              onClick={() => setStage('test-design')}
              style={{
                flex: 1.5,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: selectedOrbit
                  ? 'linear-gradient(90deg, #00d4ff, #0284c7)'
                  : 'rgba(255,255,255,0.08)',
                color: selectedOrbit ? '#020409' : 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                fontSize: 10.5,
                cursor: selectedOrbit ? 'pointer' : 'not-allowed',
                boxShadow: selectedOrbit ? '0 0 15px rgba(0, 212, 255, 0.35)' : 'none',
              }}
            >
              TEST WITH AI ➔
            </button>
          </div>
        </div>

        {/* ── CENTRAL 3D EARTH ORBIT CANVAS ── */}
        <div style={{ flex: 1, position: 'relative', background: '#020409' }}>
          <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
            <GamifiedEarthOrbit3D />
          </Canvas>

          {/* Floating Orbit Info Badge */}
          {selectedOrbit && (
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 24,
                background: 'rgba(5, 12, 28, 0.85)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: 12,
                padding: '12px 18px',
                backdropFilter: 'blur(10px)',
                minWidth: 220,
              }}
            >
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#00d4ff', marginBottom: 2 }}>
                ACTIVE TRAJECTORY
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {ORBIT_DEFINITIONS[selectedOrbit].name}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                Altitude: {ORBIT_DEFINITIONS[selectedOrbit].altitudeKm}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                Coverage: {ORBIT_DEFINITIONS[selectedOrbit].groundResolution}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
