/**
 * VYOM — Gamified Satellite Design Step
 * Central interactive 3D satellite canvas with category selector (Payload, Power, Comms, Control),
 * component selection cards, real-time resource meters (Unlimited Credits, Weight, Power, Fuel),
 * and view mode toggles (Assembled, Exploded, Internal Systems).
 */

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GamifiedSatellite3D } from '../3d/GamifiedSatellite3D';
import {
  GAMIFIED_MISSIONS,
  SATELLITE_COMPONENTS,
} from '../../../constants/gamifiedData';
import type { SatelliteViewMode } from '../../../types/gamified';

export function SatelliteDesignStep() {
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);
  const design = useGamifiedStore((s) => s.design);
  const setComponent = useGamifiedStore((s) => s.setComponent);
  const viewMode = useGamifiedStore((s) => s.viewMode);
  const setViewMode = useGamifiedStore((s) => s.setViewMode);
  const explodeProgress = useGamifiedStore((s) => s.explodeProgress);
  const setExplodeProgress = useGamifiedStore((s) => s.setExplodeProgress);
  const inspectedComponentId = useGamifiedStore((s) => s.inspectedComponentId);
  const setInspectedComponent = useGamifiedStore((s) => s.setInspectedComponent);
  const getResources = useGamifiedStore((s) => s.getResources);
  const setStage = useGamifiedStore((s) => s.setStage);

  const [activeCategory, setActiveCategory] = useState<'payload' | 'power' | 'communication' | 'control'>('payload');

  const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
  const resources = getResources();

  // Components in active category
  const categoryComponents = Object.values(SATELLITE_COMPONENTS).filter(
    (c) => c.category === activeCategory
  );

  // Inspected component definition
  const inspectedComp = inspectedComponentId ? SATELLITE_COMPONENTS[inspectedComponentId] : null;

  const categories: { id: 'payload' | 'power' | 'communication' | 'control'; label: string; icon: string }[] = [
    { id: 'payload', label: 'PAYLOAD SENSORS', icon: '🔭' },
    { id: 'power', label: 'SOLAR POWER', icon: '☀️' },
    { id: 'communication', label: 'COMMUNICATIONS', icon: '📡' },
    { id: 'control', label: 'ATTITUDE CONTROL', icon: '🧭' },
  ];

  const handleToggleViewMode = (mode: SatelliteViewMode) => {
    setViewMode(mode);
    if (mode === 'exploded') setExplodeProgress(1.0);
    else if (mode === 'assembled') setExplodeProgress(0.0);
  };

  const isReadyForOrbit = design.payload && design.power && design.communication && design.control;

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
      {/* ── TOP RESOURCE CAPACITY BAR ── */}
      <div
        style={{
          background: 'rgba(5, 12, 28, 0.94)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          padding: '5px 16px',
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 212, 255, 0.35) rgba(2, 4, 9, 0.6)',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 20,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Mission Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>{mission?.icon}</span>
          <div>
            <div style={{ fontSize: 8.5, fontFamily: 'var(--font-mono)', color: '#00d4ff', letterSpacing: '0.1em' }}>
              CURRENT MISSION
            </div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{mission?.title}</div>
          </div>
        </div>

        {/* Live Resource Meters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          {/* Credits: Unlimited */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(0, 255, 136, 0.08)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: 6,
              padding: '3px 8px',
            }}
          >
            <span style={{ fontSize: 12 }}>💳</span>
            <div>
              <div style={{ fontSize: 7.5, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                CREDITS
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#00ff88', fontFamily: 'var(--font-mono)' }}>
                ∞ UNLIMITED
              </div>
            </div>
          </div>

          {/* Weight Capacity */}
          <div style={{ minWidth: 105 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              <span style={{ color: resources.isOverweight ? '#ff3b30' : 'rgba(255,255,255,0.7)' }}>
                ⚖️ MASS: {resources.currentWeightKg} kg
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ {resources.maxWeightKg} kg</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (resources.currentWeightKg / resources.maxWeightKg) * 100)}%`,
                  height: '100%',
                  background: resources.isOverweight ? '#ff3b30' : '#00d4ff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Power Capacity */}
          <div style={{ minWidth: 110 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              <span style={{ color: resources.isPowerDeficient ? '#ff9f0a' : '#00ff88' }}>
                ⚡ POWER: {resources.powerGenerationW}W vs {resources.powerConsumptionW}W
              </span>
              <span style={{ color: resources.netPowerW >= 0 ? '#00ff88' : '#ff3b30', fontWeight: 700 }}>
                {resources.netPowerW >= 0 ? `+${resources.netPowerW}W` : `${resources.netPowerW}W`}
              </span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (resources.powerConsumptionW / Math.max(1, resources.powerGenerationW)) * 100)}%`,
                  height: '100%',
                  background: resources.isPowerDeficient ? '#ff9f0a' : '#00ff88',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Fuel Capacity */}
          <div style={{ minWidth: 95 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                ⛽ FUEL: {resources.currentFuelKg} kg
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ {resources.maxFuelKg} kg</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (resources.currentFuelKg / resources.maxFuelKg) * 100)}%`,
                  height: '100%',
                  background: resources.isFuelDeficient ? '#ff3b30' : '#38bdf8',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* View Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(0,0,0,0.35)', padding: 2, borderRadius: 6, flexShrink: 0 }}>
          {(['assembled', 'exploded', 'internal'] as SatelliteViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleToggleViewMode(mode)}
              style={{
                padding: '4px 8px',
                borderRadius: 5,
                border: 'none',
                background: viewMode === mode ? 'rgba(0, 212, 255, 0.25)' : 'transparent',
                color: viewMode === mode ? '#ffffff' : 'rgba(255,255,255,0.5)',
                fontSize: 9.5,
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {mode === 'assembled' ? 'ASSEMBLED' : mode === 'exploded' ? 'EXPLODED' : 'INTERNAL (X-RAY)'}
            </button>
          ))}
        </div>
      </div>

      {/* ── CENTRAL 3D WORKSPACE & SIDE PANELS ── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', overflow: 'hidden' }}>
        {/* LEFT PANEL: COMPONENT CATEGORIES & SELECTOR */}
        <div
          style={{
            width: 350,
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
          {/* Category Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '9px 2px',
                  background: activeCategory === cat.id ? 'rgba(0, 212, 255, 0.12)' : 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeCategory === cat.id ? '#00d4ff' : 'transparent'}`,
                  color: activeCategory === cat.id ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 9.5,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 14 }}>{cat.icon}</span>
                <span>{cat.id.toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Component Options List */}
          <div
            style={{
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 212, 255, 0.35) rgba(2, 4, 9, 0.6)',
            }}
          >
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              AVAILABLE {activeCategory.toUpperCase()} HARDWARE:
            </div>

            {categoryComponents.map((comp) => {
              const isSelected = design[comp.category] === comp.id;
              const isSuitable = comp.suitableMissions.includes(selectedMissionId);

              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    setComponent(comp.category, comp.id);
                    setInspectedComponent(comp.id);
                  }}
                  style={{
                    background: isSelected ? 'rgba(0, 212, 255, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1.5px solid ${isSelected ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10,
                    padding: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 18 }}>{comp.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#00d4ff' : '#ffffff' }}>
                          {comp.name}
                        </div>
                        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.5)' }}>
                          {comp.subtitle}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 8.5,
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: 4,
                        background: isSuitable ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 159, 10, 0.15)',
                        color: isSuitable ? '#00ff88' : '#ff9f0a',
                        fontWeight: 700,
                      }}
                    >
                      {isSuitable ? 'RECOMMENDED' : 'UNRECOMMENDED'}
                    </span>
                  </div>

                  {/* Specs Pill */}
                  <div style={{ display: 'flex', gap: 10, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)', margin: '6px 0' }}>
                    <span>⚖️ {comp.weightKg} kg</span>
                    <span>
                      ⚡ {comp.powerUsageW < 0 ? `+${Math.abs(comp.powerUsageW)}W Gen` : `${comp.powerUsageW}W Draw`}
                    </span>
                    {comp.fuelUsageKg > 0 && <span>⛽ {comp.fuelUsageKg} kg Fuel</span>}
                  </div>

                  {/* Suitability explanation */}
                  <div
                    style={{
                      fontSize: 10,
                      lineHeight: 1.35,
                      color: isSuitable ? '#a7f3d0' : '#fed7aa',
                      background: 'rgba(0,0,0,0.2)',
                      padding: '5px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {comp.suitabilityExplanations[selectedMissionId]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button Footer */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, background: 'rgba(3, 8, 20, 0.95)' }}>
            <button
              disabled={!isReadyForOrbit}
              onClick={() => setStage('select-orbit')}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: 'none',
                background: isReadyForOrbit
                  ? 'linear-gradient(90deg, #00d4ff, #0284c7)'
                  : 'rgba(255,255,255,0.08)',
                color: isReadyForOrbit ? '#020409' : 'rgba(255,255,255,0.3)',
                fontWeight: 700,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10.5,
                letterSpacing: '0.08em',
                cursor: isReadyForOrbit ? 'pointer' : 'not-allowed',
                boxShadow: isReadyForOrbit ? '0 0 15px rgba(0, 212, 255, 0.4)' : 'none',
              }}
            >
              {isReadyForOrbit ? 'SELECT ORBIT IN 3D ➔' : 'SELECT ALL 4 SUBSYSTEMS FIRST'}
            </button>
          </div>
        </div>

        {/* ── CENTRAL 3D SATELLITE CANVAS ── */}
        <div style={{ flex: 1, position: 'relative', background: '#020409' }}>
          <Canvas camera={{ position: [3.5, 2.2, 4.5], fov: 42 }}>
            <GamifiedSatellite3D />
          </Canvas>

          {/* Exploded View Slider Overlay (Shown if in exploded mode) */}
          {viewMode === 'exploded' && (
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(5, 12, 28, 0.85)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: 24,
                padding: '8px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#00d4ff', fontWeight: 700 }}>
                EXPLODE: {Math.round(explodeProgress * 100)}%
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explodeProgress}
                onChange={(e) => setExplodeProgress(parseFloat(e.target.value))}
                style={{ width: 180, cursor: 'pointer' }}
              />
            </div>
          )}

          {/* 3D Interaction Hints */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.5)',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            🖱️ Left Drag: Rotate • Scroll: Zoom • Right Drag: Pan • Click parts to inspect
          </div>
        </div>

        {/* RIGHT PANEL: INSPECTED COMPONENT DETAILS */}
        {inspectedComp && (
          <div
            style={{
              width: 280,
              height: '100%',
              background: 'rgba(5, 12, 26, 0.92)',
              borderLeft: '1px solid rgba(0, 212, 255, 0.15)',
              backdropFilter: 'blur(14px)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 10,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 212, 255, 0.35) rgba(2, 4, 9, 0.6)',
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#00d4ff', marginBottom: 6 }}>
                INSPECTING HARDWARE
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px 0' }}>
                {inspectedComp.name}
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px 0' }}>
                {inspectedComp.subtitle}
              </p>

              {/* Purpose */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  PURPOSE
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: '#e2e8f0' }}>
                  {inspectedComp.purpose}
                </div>
              </div>

              {/* How It Works */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                  HOW IT WORKS IN SPACE
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.45, color: '#94a3b8' }}>
                  {inspectedComp.howItWorks}
                </div>
              </div>

              {/* Specifications */}
              <div
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                    HARDWARE WEIGHT
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                    {inspectedComp.weightKg} kg
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                    POWER BUDGET
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: inspectedComp.powerUsageW < 0 ? '#00ff88' : '#38bdf8' }}>
                    {inspectedComp.powerUsageW < 0 ? `+${Math.abs(inspectedComp.powerUsageW)}W Gen` : `${inspectedComp.powerUsageW}W Draw`}
                  </span>
                </div>
              </div>
            </div>

            {/* Suitability Badge for current mission */}
            <div
              style={{
                background: inspectedComp.suitableMissions.includes(selectedMissionId)
                  ? 'rgba(0, 255, 136, 0.1)'
                  : 'rgba(255, 159, 10, 0.1)',
                border: `1px solid ${inspectedComp.suitableMissions.includes(selectedMissionId) ? '#00ff8844' : '#ff9f0a44'}`,
                borderRadius: 8,
                padding: 10,
                fontSize: 11,
                lineHeight: 1.4,
                color: inspectedComp.suitableMissions.includes(selectedMissionId) ? '#a7f3d0' : '#fed7aa',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {inspectedComp.suitableMissions.includes(selectedMissionId) ? '✓ Mission Match' : '⚠️ Mission Consideration'}
              </div>
              {inspectedComp.suitabilityExplanations[selectedMissionId]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
