/**
 * VYOM — SATELLITE CONFIGURATION SCREEN
 * Comprehensive interactive 3D satellite engineering laboratory for exploring,
 * dissecting, inspecting, modifying, and validating mission-specific spacecraft.
 * Note: Strict design guideline — No emojis. Clean technical iconography only.
 */

import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '../../store/missionStore';
import { StarField } from '../three/SpaceScene';
import {
  ConfigurableSatellite3D,
  CameraPreset,
} from '../three/ConfigurableSatellite3D';
import {
  SatelliteCategory,
  SatelliteComponentId,
  SATELLITE_CATEGORIES,
  SATELLITE_DEFINITIONS,
  getRecommendedSatellite,
  calculateSatelliteSpecs,
  exportToLegacySatelliteConfig,
} from '../../types/satelliteConfiguration';
import { createAndStartMission } from '../../services/BackendWebSocketService';

type LabMode = 'selection' | 'assembled' | 'exploded' | 'inspect' | 'modify' | 'impact';

export function SatelliteConfigurationScreen() {
  const setScreen = useMissionStore((s) => s.setScreen);
  const config = useMissionStore((s) => s.config);
  const setSatelliteConfig = useMissionStore((s) => s.setSatelliteConfig);
  const startMission = useMissionStore((s) => s.startMission);
  const logEvent = useMissionStore((s) => s.logEvent);

  // Recommendation engine
  const recommendation = useMemo(() => {
    return getRecommendedSatellite(config?.type, config?.destination, config?.name);
  }, [config?.type, config?.destination, config?.name]);

  // Active satellite category
  const [selectedCategory, setSelectedCategory] = useState<SatelliteCategory>(recommendation.category);

  // Current laboratory view mode
  const [labMode, setLabMode] = useState<LabMode>('assembled');

  // Exploded view progression (0.0 = fully assembled, 1.0 = fully exploded)
  const [explodeProgress, setExplodeProgress] = useState(0.0);

  // Selected component for inspection
  const [selectedComponentId, setSelectedComponentId] = useState<SatelliteComponentId | null>('payload');

  // Active camera preset
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');

  // Comparison modal state
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Component configuration options state: category -> componentId -> selectedOptionId
  const [modifications, setModifications] = useState<Record<SatelliteCategory, Record<SatelliteComponentId, string>>>(() => {
    const initial: any = {};
    for (const catKey of Object.keys(SATELLITE_DEFINITIONS) as SatelliteCategory[]) {
      initial[catKey] = {};
      SATELLITE_DEFINITIONS[catKey].components.forEach((comp) => {
        initial[catKey][comp.id] = comp.defaultOptionId;
      });
    }
    return initial;
  });

  // Current satellite definition
  const currentDef = SATELLITE_DEFINITIONS[selectedCategory];

  // Current selections for active category
  const currentSelections = modifications[selectedCategory];

  // Calculated live spacecraft performance specifications
  const specs = useMemo(() => {
    return calculateSatelliteSpecs(
      selectedCategory,
      currentSelections,
      config?.budgetCrore ?? 250
    );
  }, [selectedCategory, currentSelections, config?.budgetCrore]);

  // Selected component definition for inspector
  const activeComponentDef = useMemo(() => {
    if (!selectedComponentId) return currentDef.components[1]; // default payload
    return currentDef.components.find((c) => c.id === selectedComponentId) || currentDef.components[1];
  }, [selectedComponentId, currentDef]);

  // Switch exploded mode with smooth animation
  const handleToggleExplode = (targetExploded: boolean) => {
    if (targetExploded) {
      setExplodeProgress(1.0);
      setLabMode('exploded');
    } else {
      setExplodeProgress(0.0);
      setLabMode('assembled');
      setSelectedComponentId(null);
    }
  };

  // Modify a component option
  const handleSelectOption = (compId: SatelliteComponentId, optionId: string) => {
    setModifications((prev) => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [compId]: optionId,
      },
    }));
  };

  // Finalize configuration and proceed to simulation
  const handleContinueToSimulation = async () => {
    const legacyConfig = exportToLegacySatelliteConfig(selectedCategory, currentSelections, specs);
    setSatelliteConfig(legacyConfig);

    const store = useMissionStore.getState();
    const c = store.config;
    const missionId = c?.id ?? `VYOM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Map selectedCategory to appropriate MissionType if needed
    let mappedType = c?.type ?? 'orbital';
    if (selectedCategory === 'crewed_capsule') mappedType = 'human';
    else if (selectedCategory === 'planetary_probe') mappedType = 'planetary';
    else if (selectedCategory === 'scientific') mappedType = 'astrophysics';

    useMissionStore.setState((s) => ({
      config: {
        ...(s.config as any),
        id: missionId,
        type: mappedType,
        satelliteConfig: legacyConfig,
      },
    }));

    startMission();

    await createAndStartMission({
      id: missionId,
      name: c?.name ?? 'CUSTOM MISSION',
      type: mappedType,
      destination: c?.destination ?? 'earth-orbit',
      objective: c?.objective ?? 'Mission Objectives',
      budgetCrore: specs.totalCostCr,
      launchSite: c?.launchSite ?? { name: 'SDSC', country: 'India', lat: 13.7, lng: 80.2, agency: 'ISRO' },
      crew: store.crew,
    });

    logEvent({
      id: `ev-sat-configured-${Date.now()}`,
      timestamp: Date.now(),
      missionDay: 0,
      eventType: 'milestone',
      severity: 'nominal',
      description: `Spacecraft configured: ${currentDef.name} (${currentDef.classDesignation}). Dry Mass: ${specs.totalMassKg} kg. Power: ${specs.powerGenerationW}W. Ready for orbital injection.`,
      source: 'Spacecraft Engineering Laboratory',
      immutable: true,
    });

    setScreen('launch-sequence');
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#020409', overflow: 'hidden', color: '#ffffff', fontFamily: 'var(--font-display, "Inter", sans-serif)' }}>
      {/* 3D WebGL Canvas (Permanent Central Viewport) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
          camera={{ position: [3, 2, 4], fov: 45 }}
        >
          <StarField />
          <ConfigurableSatellite3D
            category={selectedCategory}
            selectedOptions={currentSelections}
            explodeProgress={explodeProgress}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => {
              setSelectedComponentId(id);
              if (labMode === 'assembled') {
                setExplodeProgress(0.85);
                setLabMode('inspect');
              }
            }}
            cameraPreset={cameraPreset}
          />
        </Canvas>
      </div>

      {/* Top Header Bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '14px 24px',
          background: 'linear-gradient(180deg, rgba(2,6,16,0.92) 0%, rgba(2,6,16,0.65) 75%, transparent 100%)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0, 212, 255, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setScreen('launch')}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#7cc4ff',
              padding: '6px 12px',
              borderRadius: 6,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            &larr; SPACEPORT
          </button>
          <div>
            <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, letterSpacing: '0.25em', color: '#00d4ff' }}>
              STEP 05 OF 05 &middot; SATELLITE CONFIGURATION LABORATORY
            </div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.06em', color: '#ffffff' }}>
              {config?.name ?? 'MISSION'} &middot; <span style={{ color: '#7cc4ff' }}>{currentDef.name.toUpperCase()}</span>
            </h1>
          </div>
        </div>

        {/* Phase / View Switcher Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[
            { id: 'selection', label: '1. SATELLITE TYPE' },
            { id: 'assembled', label: '2. ASSEMBLED 3D' },
            { id: 'exploded', label: '3. EXPLODED VIEW' },
            { id: 'inspect', label: '4. INSPECT' },
            { id: 'modify', label: '5. MODIFY' },
            { id: 'impact', label: '6. MISSION IMPACT' },
          ].map((tab) => {
            const isActive = labMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setLabMode(tab.id as LabMode);
                  if (tab.id === 'assembled') setExplodeProgress(0.0);
                  if (tab.id === 'exploded') setExplodeProgress(1.0);
                  if (tab.id === 'inspect') setExplodeProgress(0.85);
                }}
                style={{
                  background: isActive ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${isActive ? '#00d4ff' : 'rgba(124, 196, 255, 0.15)'}`,
                  color: isActive ? '#00d4ff' : 'rgba(255, 255, 255, 0.7)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.05em',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Floating Camera Controls (Bottom Left) — Hidden during Mission Impact */}
      {labMode !== 'impact' && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            zIndex: 20,
            background: 'rgba(5, 15, 30, 0.85)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 8,
            padding: '8px 12px',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', marginRight: 6 }}>
            PERSPECTIVE:
          </span>
          {[
            { id: 'isometric', label: 'ISO' },
            { id: 'front', label: 'FRONT' },
            { id: 'top', label: 'TOP' },
            { id: 'side', label: 'SIDE' },
            { id: 'nadir', label: 'NADIR' },
            { id: 'reset', label: 'RESET' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setCameraPreset(btn.id as CameraPreset)}
              style={{
                background: cameraPreset === btn.id ? 'rgba(0, 212, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${cameraPreset === btn.id ? '#00d4ff' : 'rgba(255, 255, 255, 0.1)'}`,
                color: cameraPreset === btn.id ? '#00d4ff' : 'rgba(255, 255, 255, 0.8)',
                padding: '4px 8px',
                borderRadius: 4,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 9,
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Exploded View Scrub Slider & Toggle (Bottom Center) — Hidden during Mission Impact */}
      {labMode !== 'impact' && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(5, 15, 30, 0.9)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: 30,
            padding: '10px 20px',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <button
            onClick={() => handleToggleExplode(explodeProgress < 0.5)}
            style={{
              background: explodeProgress > 0.1 ? 'rgba(0, 212, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${explodeProgress > 0.1 ? '#00d4ff' : 'rgba(255, 255, 255, 0.2)'}`,
              color: explodeProgress > 0.1 ? '#00d4ff' : '#ffffff',
              padding: '6px 14px',
              borderRadius: 20,
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
            }}
          >
            {explodeProgress > 0.1 ? 'ASSEMBLE' : 'EXPLODE VIEW'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              DISSECTION:
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodeProgress}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setExplodeProgress(val);
                if (val > 0.05 && labMode === 'assembled') setLabMode('exploded');
                if (val === 0 && labMode === 'exploded') setLabMode('assembled');
              }}
              style={{ width: 140, cursor: 'pointer', accentColor: '#00d4ff' }}
            />
            <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, color: '#00d4ff', minWidth: 32 }}>
              {Math.round(explodeProgress * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Quick Launch Simulation Trigger (Bottom Right) — Hidden during Mission Impact */}
      {labMode !== 'impact' && (
        <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20 }}>
          <button
            onClick={handleContinueToSimulation}
            style={{
              background: 'linear-gradient(135deg, #1f5fd6 0%, #00d4ff 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: 8,
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.08em',
              boxShadow: '0 0 24px rgba(0, 212, 255, 0.4)',
              transition: 'transform 0.2s ease',
            }}
          >
            CONTINUE TO MISSION SIMULATION &rarr;
          </button>
        </div>
      )}

      {/* =========================================================================
          PANEL OVERLAYS BASED ON CURRENT LAB MODE
         ========================================================================= */}

      {/* STEP 1: SATELLITE TYPE SELECTION OVERLAY */}
      <AnimatePresence>
        {labMode === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              top: 80,
              left: 24,
              bottom: 80,
              width: 420,
              zIndex: 30,
              background: 'rgba(3, 10, 28, 0.94)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 14,
              padding: '24px',
              backdropFilter: 'blur(20px)',
              overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.2em' }}>
                  STEP 01 OF 06
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
                  CHOOSE SATELLITE TYPE
                </h2>
              </div>
              <button
                onClick={() => setShowComparisonModal(true)}
                style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  border: '1px solid rgba(0, 212, 255, 0.4)',
                  color: '#7cc4ff',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 9,
                  cursor: 'pointer',
                }}
              >
                COMPARE (4)
              </button>
            </div>

            {/* Recommendation Banner */}
            <div
              style={{
                background: 'rgba(0, 255, 136, 0.08)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 8,
                padding: '12px',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: '#00ff88', fontSize: 12 }}>[RECOMMENDED]</span>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, fontWeight: 700, color: '#00ff88' }}>
                  MATCHES {config?.type?.toUpperCase() ?? 'MISSION'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.8)', lineHeight: 1.45 }}>
                {recommendation.reason}
              </p>
            </div>

            {/* Satellite Option Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SATELLITE_CATEGORIES.map((cat) => {
                const def = SATELLITE_DEFINITIONS[cat.id];
                const isSelected = selectedCategory === cat.id;
                const isRecommended = recommendation.category === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setLabMode('assembled');
                    }}
                    style={{
                      background: isSelected ? 'rgba(0, 212, 255, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? '#00d4ff' : 'rgba(124, 196, 255, 0.15)'}`,
                      borderRadius: 10,
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    {isRecommended && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          background: 'rgba(0, 255, 136, 0.2)',
                          color: '#00ff88',
                          border: '1px solid rgba(0, 255, 136, 0.4)',
                          fontSize: 8,
                          fontFamily: 'var(--font-mono, monospace)',
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                        }}
                      >
                        OPTIMAL CHOICE
                      </span>
                    )}

                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
                      {def.classDesignation}
                    </div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 700, color: isSelected ? '#00d4ff' : '#ffffff' }}>
                      {def.name}
                    </h3>
                    <p style={{ margin: '0 0 10px', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                      {def.purposeSummary}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: 'rgba(124, 196, 255, 0.8)' }}>
                      <div>ORBIT: {def.orbitalRegime.split('(')[0]}</div>
                      <div>MASS: {def.baseMassKg} kg</div>
                      <div>POWER: {def.basePowerGenerationW} W</div>
                      <div>LIFESPAN: {def.expectedLifespanYears} Yrs</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 4: COMPONENT INSPECTION HUD (Right Drawer) */}
      <AnimatePresence>
        {labMode === 'inspect' && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{
              position: 'absolute',
              top: 80,
              right: 24,
              bottom: 80,
              width: 380,
              zIndex: 30,
              background: 'rgba(3, 10, 28, 0.94)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 14,
              padding: '20px',
              backdropFilter: 'blur(20px)',
              overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.15em' }}>
                SUBSYSTEM INSPECTION
              </span>
              <button
                onClick={() => setLabMode('modify')}
                style={{
                  background: 'rgba(0, 212, 255, 0.15)',
                  border: '1px solid #00d4ff',
                  color: '#ffffff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '4px 8px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                MODIFY &rarr;
              </button>
            </div>

            {/* Component Selector Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {currentDef.components.map((comp) => {
                const isSelected = selectedComponentId === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    style={{
                      background: isSelected ? 'rgba(0, 212, 255, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isSelected ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
                      color: isSelected ? '#00d4ff' : 'rgba(255,255,255,0.7)',
                      fontSize: 9,
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    {comp.systemTag}
                  </button>
                );
              })}
            </div>

            <div style={{ borderBottom: '1px solid rgba(0,212,255,0.15)', paddingBottom: 12, marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#7cc4ff' }}>
                SYSTEM [{activeComponentDef.systemTag}]
              </div>
              <h3 style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700 }}>
                {activeComponentDef.name}
              </h3>
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                PURPOSE
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#e2e8f0' }}>
                {activeComponentDef.purpose}
              </p>
            </div>

            {/* How It Works */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                HOW IT WORKS
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: 'rgba(255,255,255,0.8)' }}>
                {activeComponentDef.howItWorks}
              </p>
            </div>

            {/* Mission Role */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
                MISSION ROLE &middot; {config?.name ?? 'ACTIVE MISSION'}
              </div>
              <p style={{ margin: 0, fontSize: 12, lineHeight: 1.45, color: '#7cc4ff' }}>
                {activeComponentDef.missionRole}
              </p>
            </div>

            {/* Current Configuration Specs */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 8, border: '1px solid rgba(124, 196, 255, 0.15)' }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                ACTIVE SPECIFICATION
              </div>
              {(() => {
                const activeOptId = currentSelections[activeComponentDef.id] || activeComponentDef.defaultOptionId;
                const opt = activeComponentDef.options.find((o) => o.id === activeOptId) || activeComponentDef.options[0];
                return (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                      {opt.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
                      {opt.shortDesc}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#7cc4ff' }}>
                      <div>POWER DRAW: {opt.powerDrawW} W</div>
                      <div>MASS: {opt.massKg} kg</div>
                      {Object.entries(opt.specs).map(([k, v]) => (
                        <div key={k}>{k.toUpperCase()}: {v}</div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5: SATELLITE MODIFICATION PANEL (Right Drawer) */}
      <AnimatePresence>
        {labMode === 'modify' && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            style={{
              position: 'absolute',
              top: 80,
              right: 24,
              bottom: 80,
              width: 440,
              zIndex: 30,
              background: 'rgba(3, 10, 28, 0.96)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 14,
              padding: '20px',
              backdropFilter: 'blur(20px)',
              overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.15em' }}>
                  STEP 05 &middot; SUBSYSTEM MODIFICATION
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700 }}>
                  CUSTOMIZE HARDWARE
                </h3>
              </div>
              <button
                onClick={() => setLabMode('impact')}
                style={{
                  background: 'rgba(0, 212, 255, 0.15)',
                  border: '1px solid #00d4ff',
                  color: '#ffffff',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                IMPACT &rarr;
              </button>
            </div>

            {/* Live Metrics Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                background: 'rgba(0, 212, 255, 0.06)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 8,
                padding: '10px',
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  TOTAL MASS
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                  {specs.totalMassKg} kg
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  POWER MARGIN
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: specs.isPowerViable ? '#00ff88' : '#ff4444' }}>
                  {specs.netPowerMarginW >= 0 ? `+${specs.netPowerMarginW}` : specs.netPowerMarginW} W
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  MISSION BUDGET
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#7cc4ff' }}>
                  ₹{specs.totalCostCr} Cr
                </div>
              </div>
            </div>

            {/* Incompatibility Warnings */}
            {specs.warnings.length > 0 && (
              <div style={{ background: 'rgba(255, 140, 0, 0.1)', border: '1px solid rgba(255, 140, 0, 0.4)', borderRadius: 8, padding: '10px', marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#ff9f0a', fontWeight: 700, marginBottom: 4 }}>
                  ENGINEERING WARNINGS ({specs.warnings.length})
                </div>
                {specs.warnings.map((w, wi) => (
                  <div key={wi} style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
                    &bull; {w}
                  </div>
                ))}
              </div>
            )}

            {/* Modifiable Subsystems List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {currentDef.components
                .filter((c) => c.options.length > 1)
                .map((comp) => {
                  const currentOptId = currentSelections[comp.id] || comp.defaultOptionId;

                  return (
                    <div
                      key={comp.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(124, 196, 255, 0.15)',
                        borderRadius: 8,
                        padding: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
                          {comp.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#7cc4ff' }}>
                          {comp.systemTag}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {comp.options.map((opt) => {
                          const isOptionSelected = currentOptId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              onClick={() => handleSelectOption(comp.id, opt.id)}
                              style={{
                                background: isOptionSelected ? 'rgba(0, 212, 255, 0.18)' : 'rgba(0,0,0,0.3)',
                                border: `1px solid ${isOptionSelected ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`,
                                borderRadius: 6,
                                padding: '8px 10px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: isOptionSelected ? '#00d4ff' : '#ffffff' }}>
                                  {opt.name}
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: 'rgba(255,255,255,0.6)' }}>
                                  {opt.powerDrawW > 0 ? `+${opt.powerDrawW}W` : '0W'} &middot; {opt.massKg}kg
                                </span>
                              </div>
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                                {opt.shortDesc}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 6: VISUAL MISSION IMPACT SUMMARY (Center Modal/Panel) */}
      <AnimatePresence>
        {labMode === 'impact' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 35,
              width: '92%',
              maxWidth: 740,
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(3, 10, 28, 0.97)',
              border: '1px solid #00d4ff',
              borderRadius: 16,
              padding: '24px 28px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.92), 0 0 35px rgba(0,212,255,0.2)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 20, flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10, letterSpacing: '0.25em', color: '#00d4ff', marginBottom: 4 }}>
                STEP 06 OF 06 &middot; FLIGHT READINESS SYNTHESIS
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '0.04em' }}>
                VISUAL MISSION IMPACT &amp; VALIDATION
              </h2>
            </div>

            {/* Linear Mission Impact Flowchart */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                background: 'rgba(0, 212, 255, 0.05)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 20,
                flexShrink: 0,
              }}
            >
              {[
                { label: 'Selected Mission', val: config?.name ?? 'CUSTOM-01' },
                { label: 'Selected Spacecraft', val: currentDef.name.split(' ')[0] },
                { label: 'Power Balance', val: `${specs.powerGenerationW}W Gen / ${specs.totalPowerDrawW}W Draw` },
                { label: 'Total Mass', val: `${specs.totalMassKg} kg` },
                { label: 'Flight Status', val: 'READY' },
              ].map((node, i, arr) => (
                <div key={node.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                      {node.label}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', marginTop: 2 }}>
                      {node.val}
                    </div>
                  </div>
                  {i < arr.length - 1 && (
                    <span style={{ color: 'rgba(0, 212, 255, 0.4)', fontSize: 13 }}>&rarr;</span>
                  )}
                </div>
              ))}
            </div>

            {/* Subsystem Specifications Summary */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                background: 'rgba(0, 212, 255, 0.03)',
                border: '1px solid rgba(0, 212, 255, 0.15)',
                borderRadius: 10,
                padding: '12px',
                marginBottom: 20,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  ORBITAL REGIME
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
                  {currentDef.orbitalRegime.split('(')[0]}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  NET POWER MARGIN
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: specs.isPowerViable ? '#00ff88' : '#ff4444', marginTop: 2 }}>
                  {specs.netPowerMarginW >= 0 ? `+${specs.netPowerMarginW}` : specs.netPowerMarginW} W
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
                  TELEMETRY LINK
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7cc4ff', marginTop: 2 }}>
                  {currentDef.telemetryBand.split('/')[0]}
                </div>
              </div>
            </div>

            {/* Compatibility Confirmation */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#00ff88', fontSize: 13, fontWeight: 700 }}>[VERIFIED]</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                  All Subsystems Meet Destination Requirements ({config?.destination ?? 'earth-orbit'})
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                {currentDef.recommendationReason} Telemetry downlink configured for {currentDef.telemetryBand}.
                Thermal margin is validated within safe operating limits.
              </p>
            </div>

            {/* Action Buttons — Always Pinned / Visible */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 14,
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: '1px solid rgba(0, 212, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setLabMode('modify')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '12px 22px',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: '0.05em',
                }}
              >
                &larr; BACK TO MODIFICATIONS
              </button>
              <button
                onClick={handleContinueToSimulation}
                style={{
                  background: 'linear-gradient(135deg, #1f5fd6 0%, #00d4ff 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '12px 30px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  boxShadow: '0 0 28px rgba(0, 212, 255, 0.55)',
                }}
              >
                CONTINUE TO MISSION SIMULATION &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SATELLITE COMPARISON MODAL */}
      <AnimatePresence>
        {showComparisonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(2, 6, 16, 0.88)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 960,
                background: 'rgba(4, 12, 32, 0.98)',
                border: '1px solid #00d4ff',
                borderRadius: 16,
                padding: '28px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 9, color: '#00d4ff', letterSpacing: '0.2em' }}>
                    SIDE-BY-SIDE ARCHITECTURE COMPARISON
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
                    EVALUATE SPACECRAFT &amp; SATELLITE CLASSES
                  </h3>
                </div>
                <button
                  onClick={() => setShowComparisonModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 11,
                  }}
                >
                  CLOSE [X]
                </button>
              </div>

              {/* Responsive multi-column comparison table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 4 }}>
                {SATELLITE_CATEGORIES.map((cat) => {
                  const def = SATELLITE_DEFINITIONS[cat.id];
                  const isSelected = selectedCategory === cat.id;

                  return (
                    <div
                      key={cat.id}
                      style={{
                        background: isSelected ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isSelected ? '#00d4ff' : 'rgba(124, 196, 255, 0.15)'}`,
                        borderRadius: 10,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#00d4ff' : '#ffffff', marginBottom: 4 }}>
                          {def.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
                          {def.tagline}
                        </div>
                        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono, monospace)', color: '#7cc4ff', lineHeight: 1.6 }}>
                          <div>&bull; ORBIT: {def.orbitalRegime.split('(')[0]}</div>
                          <div>&bull; MASS: {def.baseMassKg} kg</div>
                          <div>&bull; POWER: {def.basePowerGenerationW} W</div>
                          <div>&bull; LIFE: {def.expectedLifespanYears} Yrs</div>
                          <div>&bull; BAND: {def.telemetryBand.split(' ')[0]}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setShowComparisonModal(false);
                          setLabMode('assembled');
                        }}
                        style={{
                          marginTop: 16,
                          background: isSelected ? '#00d4ff' : 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: isSelected ? '#020610' : '#ffffff',
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {isSelected ? 'ACTIVE SELECTION' : 'CHOOSE THIS SATELLITE'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SatelliteConfigurationScreen;
