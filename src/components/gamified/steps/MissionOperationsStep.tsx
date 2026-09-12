/**
 * VYOM — Gamified Mission Operations Step
 * Interactive in-flight space challenges with 3D visualization,
 * multi-choice engineering actions, real-time consequence engine,
 * and live mission telemetry status bars.
 */

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GamifiedSatellite3D } from '../3d/GamifiedSatellite3D';
import { GamifiedEarthOrbit3D } from '../3d/GamifiedEarthOrbit3D';
import { SPACE_CHALLENGES } from '../../../constants/gamifiedData';

export function MissionOperationsStep() {
  const activeChallengeIndex = useGamifiedStore((s) => s.activeChallengeIndex);
  const liveMetrics = useGamifiedStore((s) => s.liveMetrics);
  const answerChallenge = useGamifiedStore((s) => s.answerChallenge);
  const nextChallenge = useGamifiedStore((s) => s.nextChallenge);
  const challengeDecisions = useGamifiedStore((s) => s.challengeDecisions);
  const setStage = useGamifiedStore((s) => s.setStage);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const currentChallenge = SPACE_CHALLENGES[activeChallengeIndex];
  const isLastChallenge = activeChallengeIndex >= SPACE_CHALLENGES.length - 1;

  // Decide 3D scene type based on challenge nature
  // Earth view for Orbit & Comms; Satellite view for Solar, Power, Sensor
  const isEarthScene = currentChallenge?.system === 'orbit' || currentChallenge?.system === 'communication';

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmAction = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);
    answerChallenge(selectedOptionId);
  };

  const handleProceedNext = () => {
    setHasSubmitted(false);
    setSelectedOptionId(null);
    nextChallenge();
  };

  const chosenOption = currentChallenge?.options.find((o) => o.id === selectedOptionId);

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
      {/* ── TOP LIVE TELEMETRY BAR (CONSEQUENCE SYSTEM) ── */}
      <div
        style={{
          background: 'rgba(5, 12, 28, 0.94)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          padding: '10px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 20,
        }}
      >
        {/* Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                liveMetrics.satelliteStatus === 'Nominal'
                  ? '#00ff88'
                  : liveMetrics.satelliteStatus === 'Recovered'
                  ? '#00d4ff'
                  : liveMetrics.satelliteStatus === 'Degraded'
                  ? '#ff9f0a'
                  : '#ff3b30',
              boxShadow: '0 0 10px currentColor',
            }}
          />
          <div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
              SATELLITE HEALTH INTEGRITY
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              STATUS: {liveMetrics.satelliteStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* 4 Live Metrics Bars */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Mission Health */}
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
              <span>❤️ HEALTH</span>
              <span style={{ color: liveMetrics.health > 70 ? '#00ff88' : '#ff3b30', fontWeight: 700 }}>
                {liveMetrics.health}%
              </span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${liveMetrics.health}%`,
                  height: '100%',
                  background: liveMetrics.health > 70 ? '#00ff88' : '#ff3b30',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Power Level */}
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
              <span>⚡ POWER</span>
              <span style={{ color: liveMetrics.power > 60 ? '#00d4ff' : '#ff9f0a', fontWeight: 700 }}>
                {liveMetrics.power}%
              </span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${liveMetrics.power}%`,
                  height: '100%',
                  background: liveMetrics.power > 60 ? '#00d4ff' : '#ff9f0a',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Communication Link */}
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
              <span>📡 COMMS</span>
              <span style={{ color: liveMetrics.communication > 50 ? '#38bdf8' : '#ef4444', fontWeight: 700 }}>
                {liveMetrics.communication}%
              </span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${liveMetrics.communication}%`,
                  height: '100%',
                  background: liveMetrics.communication > 50 ? '#38bdf8' : '#ef4444',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>

          {/* Mission Progress */}
          <div style={{ minWidth: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
              <span>PROGRESS</span>
              <span style={{ color: '#00ff88', fontWeight: 700 }}>{liveMetrics.missionProgress}%</span>
            </div>
            <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${liveMetrics.missionProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CENTRAL 3D SCENE & INTERACTIVE CHALLENGE CARD ── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {/* 3D Visualizer Canvas (Switches between Satellite and Earth) */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Canvas camera={{ position: isEarthScene ? [0, 4, 15] : [3.2, 2.0, 4.2], fov: 45 }}>
            {isEarthScene ? <GamifiedEarthOrbit3D /> : <GamifiedSatellite3D />}
          </Canvas>

          {/* Perspective Indicator Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: 20,
              background: 'rgba(0,0,0,0.5)',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              color: '#00d4ff',
            }}
          >
            {isEarthScene ? 'ORBITAL ENVIRONMENT PERSPECTIVE' : 'SPACECRAFT TELEMETRY VIEW'}
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTIVE CHALLENGE MODAL */}
        {currentChallenge && (
          <div
            style={{
              width: 440,
              background: 'rgba(5, 12, 26, 0.94)',
              borderLeft: '1px solid rgba(0, 212, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 10,
              overflowY: 'auto',
            }}
          >
            <div>
              {/* Challenge Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#ff9f0a', fontWeight: 700 }}>
                  CHALLENGE {activeChallengeIndex + 1} OF {SPACE_CHALLENGES.length}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 800,
                  }}
                >
                  URGENCY: {currentChallenge.urgency.toUpperCase()}
                </span>
              </div>

              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px 0', color: '#ffffff' }}>
                {currentChallenge.title}
              </h2>

              <p style={{ fontSize: 12.5, color: '#e2e8f0', lineHeight: 1.5, margin: '0 0 18px 0' }}>
                {currentChallenge.description}
              </p>

              {/* Options List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
                  CHOOSE YOUR ENGINEERING ACTION:
                </div>

                {currentChallenge.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;

                  return (
                    <motion.div
                      key={opt.id}
                      whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                      onClick={() => handleSelectOption(opt.id)}
                      style={{
                        background: isSelected
                          ? 'rgba(0, 212, 255, 0.14)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: `1.5px solid ${isSelected ? '#00d4ff' : 'rgba(255, 255, 255, 0.08)'}`,
                        borderRadius: 10,
                        padding: 12,
                        cursor: hasSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? '#00d4ff' : '#ffffff', marginBottom: 4 }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>
                        {opt.description}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Post-Decision Feedback & Real-World Analogy */}
              {hasSubmitted && chosenOption && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: chosenOption.isRecommended
                      ? 'rgba(0, 255, 136, 0.1)'
                      : 'rgba(255, 159, 10, 0.1)',
                    border: `1px solid ${chosenOption.isRecommended ? '#00ff8844' : '#ff9f0a44'}`,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: chosenOption.isRecommended ? '#00ff88' : '#ff9f0a',
                      marginBottom: 4,
                    }}
                  >
                    {chosenOption.isRecommended ? '✓ Effective Solution!' : '⚠️ Cautionary Decision'}
                  </div>
                  <p style={{ fontSize: 11.5, color: '#e2e8f0', lineHeight: 1.45, margin: '0 0 8px 0' }}>
                    {chosenOption.feedback}
                  </p>
                  <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
                    🚀 Real World Analogy: {chosenOption.realWorldAnalogy}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Action Footer */}
            <div>
              {!hasSubmitted ? (
                <button
                  disabled={!selectedOptionId}
                  onClick={handleConfirmAction}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: selectedOptionId
                      ? 'linear-gradient(90deg, #00d4ff, #0284c7)'
                      : 'rgba(255,255,255,0.08)',
                    color: selectedOptionId ? '#020409' : 'rgba(255,255,255,0.3)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: selectedOptionId ? 'pointer' : 'not-allowed',
                    boxShadow: selectedOptionId ? '0 0 15px rgba(0, 212, 255, 0.4)' : 'none',
                  }}
                >
                  EXECUTE DECISION ➔
                </button>
              ) : (
                <button
                  onClick={handleProceedNext}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                    color: '#020409',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
                  }}
                >
                  {isLastChallenge ? 'VIEW MISSION RESULTS ➔' : 'NEXT ORBITAL CHALLENGE ➔'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
