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

  const stagesRef = React.useRef<HTMLDivElement>(null);

  const scrollStages = (amount: number) => {
    if (stagesRef.current) {
      stagesRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    if (stagesRef.current) {
      const activeBtn = stagesRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [stage]);

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
          minHeight: 60,
          background: 'rgba(5, 12, 28, 0.96)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.18)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          gap: 12,
          zIndex: 100,
          flexShrink: 0,
          flexWrap: 'nowrap',
          overflowX: 'hidden',
        }}
      >
        {/* Left: Brand & Return to VYOM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
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
              whiteSpace: 'nowrap',
            }}
            title="Return to VYOM Welcome Screen"
          >
            <span>←</span> EXIT
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#00d4ff', fontFamily: 'var(--font-display, sans-serif)', letterSpacing: '0.12em' }}>
              VYOM
            </span>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              // ACADEMY
            </span>
          </div>
        </div>

        {/* Center: Scrollable Stage Steps with Left/Right Scroll Arrows */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <button
            onClick={() => scrollStages(-180)}
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 4,
              color: '#00d4ff',
              padding: '4px 6px',
              fontSize: 10,
              cursor: 'pointer',
              marginRight: 6,
              flexShrink: 0,
            }}
            title="Scroll stages left"
          >
            ◀
          </button>

          <div
            ref={stagesRef}
            onWheel={(e) => {
              if (stagesRef.current) {
                stagesRef.current.scrollLeft += e.deltaY;
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 212, 255, 0.3) rgba(2, 4, 9, 0.5)',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              padding: '4px 2px',
              maxWidth: '100%',
            }}
          >
            {stages.map((st, i) => {
              const isCurrent = stage === st.id;
              return (
                <button
                  key={st.id}
                  data-active={isCurrent ? 'true' : 'false'}
                  onClick={() => setStage(st.id)}
                  style={{
                    background: isCurrent ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${isCurrent ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 6,
                    padding: '5px 11px',
                    color: isCurrent ? '#00d4ff' : 'rgba(255,255,255,0.6)',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ opacity: 0.5, fontSize: 8 }}>{st.num}</span>
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollStages(180)}
            style={{
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              borderRadius: 4,
              color: '#00d4ff',
              padding: '4px 6px',
              fontSize: 10,
              cursor: 'pointer',
              marginLeft: 6,
              flexShrink: 0,
            }}
            title="Scroll stages right"
          >
            ▶
          </button>
        </div>

        {/* Right: Quick Mission Control Jump */}
        <div style={{ flexShrink: 0 }}>
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
              whiteSpace: 'nowrap',
            }}
          >
            MISSION CONTROL ⬡
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
