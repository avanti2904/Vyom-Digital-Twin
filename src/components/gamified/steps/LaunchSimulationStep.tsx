/**
 * VYOM — Gamified 3D Launch Simulation Step
 * Controls the 7-stage launch sequence:
 * 1. Countdown ➔ 2. Liftoff ➔ 3. Staging ➔ 4. Fairing ➔ 5. Separation ➔ 6. Solar Deploy ➔ 7. Mission Start
 */

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GamifiedLaunch3D } from '../3d/GamifiedLaunch3D';
import { LAUNCH_STAGES } from '../../../constants/gamifiedData';
import type { LaunchPhaseIndex } from '../../../types/gamified';

export function LaunchSimulationStep() {
  const launchPhase = useGamifiedStore((s) => s.launchPhase);
  const setLaunchPhase = useGamifiedStore((s) => s.setLaunchPhase);
  const setStage = useGamifiedStore((s) => s.setStage);
  const setAiMessage = useGamifiedStore((s) => s.setAiMessage);

  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [countdownNum, setCountdownNum] = useState(5);

  const currentStageInfo = LAUNCH_STAGES.find((s) => s.index === launchPhase) || LAUNCH_STAGES[0];

  // Stage 1 countdown timer
  useEffect(() => {
    if (launchPhase === 1) {
      setCountdownNum(5);
      const interval = setInterval(() => {
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setLaunchPhase(2);
            setAiMessage('Liftoff! Main rocket engines ignited. Reaching orbital velocity!', 'happy');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [launchPhase]);

  // Auto-progression through stages 2 to 7
  useEffect(() => {
    if (!isAutoPlaying || launchPhase === 1) return;

    const timer = setTimeout(() => {
      if (launchPhase < 7) {
        const next = (launchPhase + 1) as LaunchPhaseIndex;
        setLaunchPhase(next);
        const nextInfo = LAUNCH_STAGES.find((s) => s.index === next);
        if (nextInfo) {
          setAiMessage(`Stage ${next}: ${nextInfo.name} — ${nextInfo.description}`, 'happy');
        }
      } else {
        // Complete launch -> transition to Mission Simulation
        setTimeout(() => {
          setStage('mission-simulation');
          setAiMessage('Orbital deployment complete! Spacecraft is operational. Standby for live telemetry and flight challenges.', 'happy');
        }, 3000);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [launchPhase, isAutoPlaying]);

  const handleNextStage = () => {
    if (launchPhase < 7) {
      setLaunchPhase((launchPhase + 1) as LaunchPhaseIndex);
    } else {
      setStage('mission-simulation');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: 'calc(100vh - 120px)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#020409',
        color: '#ffffff',
      }}
    >
      {/* ── TOP STAGE PROGRESS BAR ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          background: 'rgba(5, 12, 28, 0.88)',
          border: '1px solid rgba(0, 212, 255, 0.25)',
          borderRadius: 24,
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 'calc(100vw - 32px)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          backdropFilter: 'blur(12px)',
        }}
      >
        {LAUNCH_STAGES.map((s) => {
          const isDone = launchPhase > s.index;
          const isCurrent = launchPhase === s.index;

          return (
            <div key={s.index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                onClick={() => setLaunchPhase(s.index)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: isDone
                    ? '#00ff88'
                    : isCurrent
                    ? '#00d4ff'
                    : 'rgba(255,255,255,0.1)',
                  color: isDone || isCurrent ? '#020409' : 'rgba(255,255,255,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: isCurrent ? '0 0 12px #00d4ff' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? '✓' : s.index}
              </div>
              {s.index < 7 && (
                <div
                  style={{
                    width: 18,
                    height: 2,
                    background: isDone ? '#00ff88' : 'rgba(255,255,255,0.15)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── CENTRAL 3D LAUNCH CANVAS ── */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 2, 9], fov: 45 }}>
          <GamifiedLaunch3D />
        </Canvas>

        {/* Stage 1 Large Countdown Overlay */}
        {launchPhase === 1 && countdownNum > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontSize: 84,
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                color: '#00d4ff',
                textShadow: '0 0 30px #00d4ff, 0 0 60px #0284c7',
                lineHeight: 1,
              }}
            >
              T - {countdownNum}
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', color: '#fff', marginTop: 10 }}>
              TERMINAL COUNTDOWN SEQUENCE INITIATED
            </div>
          </div>
        )}

        {/* Telemetry HUD (Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            zIndex: 20,
            background: 'rgba(5, 12, 28, 0.88)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 14,
            padding: '16px 20px',
            backdropFilter: 'blur(12px)',
            maxWidth: 380,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#00d4ff', fontWeight: 700 }}>
              STAGE {currentStageInfo.index} // {currentStageInfo.name}
            </span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
              {currentStageInfo.label}
            </span>
          </div>

          <p style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.45, margin: '0 0 12px 0' }}>
            {currentStageInfo.description}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              background: 'rgba(0,0,0,0.3)',
              padding: '8px 10px',
              borderRadius: 6,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              <span style={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>ALTITUDE</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{currentStageInfo.altitudeKm} km</span>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.4)', display: 'block' }}>VELOCITY</span>
              <span style={{ color: '#00ff88', fontWeight: 700 }}>{currentStageInfo.velocityKms} km/s</span>
            </div>
          </div>
        </div>

        {/* Manual Stage Control & Skip (Bottom Right) */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.2)',
              background: isAutoPlaying ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.05)',
              color: isAutoPlaying ? '#00d4ff' : '#ffffff',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isAutoPlaying ? '⏸️ PAUSE AUTOPLAY' : '▶️ RESUME AUTOPLAY'}
          </button>

          <button
            onClick={handleNextStage}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(90deg, #00d4ff, #0284c7)',
              color: '#020409',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
            }}
          >
            {launchPhase < 7 ? 'NEXT STAGE ➔' : 'ENTER MISSION OPERATIONS ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}
