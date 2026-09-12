/**
 * VYOM — Gamified Learning Mode Master Screen
 * Mission Academy: Satellite Design, 3D Orbit, Launch, and Operations Simulator.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '../../store/missionStore';
import { useGamifiedStore } from '../../store/gamifiedStore';
import { GamifiedAIAssistant } from '../gamified/ui/GamifiedAIAssistant';
import { MissionSelectionStep } from '../gamified/steps/MissionSelectionStep';
import { SatelliteDesignStep } from '../gamified/steps/SatelliteDesignStep';
import { OrbitSelectionStep } from '../gamified/steps/OrbitSelectionStep';
import { TestDesignStep } from '../gamified/steps/TestDesignStep';
import { LaunchSimulationStep } from '../gamified/steps/LaunchSimulationStep';
import { MissionOperationsStep } from '../gamified/steps/MissionOperationsStep';
import { MissionResultsStep } from '../gamified/steps/MissionResultsStep';
import type { GamifiedStage } from '../../types/gamified';

export function GamifiedMissionScreen() {
  const setAppScreen = useMissionStore((s) => s.setScreen);
  const stage = useGamifiedStore((s) => s.stage);
  const setStage = useGamifiedStore((s) => s.setStage);

  const stages: { id: GamifiedStage; label: string; num: string }[] = [
    { id: 'choose-mission', label: 'MISSION', num: '01' },
    { id: 'design-satellite', label: '3D DESIGN', num: '02' },
    { id: 'select-orbit', label: 'ORBIT', num: '03' },
    { id: 'test-design', label: 'AI TEST', num: '04' },
    { id: 'launch-simulation', label: 'LAUNCH', num: '05' },
    { id: 'mission-simulation', label: 'OPERATIONS', num: '06' },
    { id: 'mission-results', label: 'DEBRIEF', num: '07' },
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#020409',
        color: '#ffffff',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* ── TOP HEADER / STAGE BREADCRUMB ── */}
      <header
        style={{
          height: 60,
          background: 'rgba(5, 12, 28, 0.96)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.18)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        {/* Left: Brand & Return to VYOM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setAppScreen('welcome')}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.8)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 700,
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.2s',
            }}
            title="Return to VYOM Welcome Screen"
          >
            <span>←</span> EXIT ACADEMY
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#00d4ff', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '0.12em' }}>
              VYOM
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              // SATELLITE MISSION ACADEMY
            </span>
          </div>
        </div>

        {/* Center: Stage Steps Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {stages.map((st, i) => {
            const isCurrent = stage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStage(st.id)}
                style={{
                  background: isCurrent ? 'rgba(0, 212, 255, 0.15)' : 'transparent',
                  border: `1px solid ${isCurrent ? '#00d4ff' : 'transparent'}`,
                  borderRadius: 6,
                  padding: '4px 10px',
                  color: isCurrent ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ opacity: 0.5, fontSize: 8 }}>{st.num}</span>
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick Mission Control Jump */}
        <div>
          <button
            onClick={() => setAppScreen('mission-control')}
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 6,
              color: '#00d4ff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 700,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            GO TO MISSION CONTROL ⬡
          </button>
        </div>
      </header>

      {/* ── STAGE CONTENT ROUTER ── */}
      <main style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {stage === 'choose-mission' && <MissionSelectionStep />}
            {(stage === 'design-satellite' || stage === 'explore-satellite') && <SatelliteDesignStep />}
            {stage === 'select-orbit' && <OrbitSelectionStep />}
            {stage === 'test-design' && <TestDesignStep />}
            {stage === 'launch-simulation' && <LaunchSimulationStep />}
            {stage === 'mission-simulation' && <MissionOperationsStep />}
            {stage === 'mission-results' && <MissionResultsStep />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FLOATING AI TEACHER ASSISTANT ── */}
      <GamifiedAIAssistant />
    </div>
  );
}
