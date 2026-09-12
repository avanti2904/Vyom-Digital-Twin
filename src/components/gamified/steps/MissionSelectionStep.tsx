/**
 * VYOM — Gamified Mission Selection Step
 * 5 interactive mission cards displaying objectives, required capabilities,
 * recommended payloads, recommended orbits, and difficulty ratings.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GAMIFIED_MISSIONS } from '../../../constants/gamifiedData';

export function MissionSelectionStep() {
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);
  const selectMission = useGamifiedStore((s) => s.selectMission);
  const setStage = useGamifiedStore((s) => s.setStage);

  const handleStartDesign = (missionId: any) => {
    selectMission(missionId);
    setStage('design-satellite');
  };

  const difficultyColors = {
    Beginner: '#00ff88',
    Intermediate: '#00d4ff',
    Advanced: '#ff9f0a',
  };

  return (
    <div
      style={{
        maxWidth: 1300,
        margin: '0 auto',
        padding: '30px 24px 80px',
        color: '#ffffff',
      }}
    >
      {/* Title & Subtitle */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            color: '#00d4ff',
            letterSpacing: '0.2em',
            marginBottom: 8,
          }}
        >
          PHASE 01 // MISSION BRIEFING
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 10px 0',
            background: 'linear-gradient(180deg, #ffffff 40%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Choose Your Satellite Mission
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.65)',
            fontSize: 14,
            maxWidth: 680,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Each mission presents unique physics, environmental challenges, and orbital constraints.
          Select an objective to design and launch your custom space digital twin.
        </p>
      </div>

      {/* 5 Mission Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 40,
        }}
      >
        {GAMIFIED_MISSIONS.map((m) => {
          const isSelected = selectedMissionId === m.id;
          const diffColor = difficultyColors[m.difficulty];

          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -5, boxShadow: `0 12px 30px rgba(0, 212, 255, 0.15)` }}
              onClick={() => selectMission(m.id)}
              style={{
                background: isSelected ? 'rgba(5, 18, 42, 0.92)' : 'rgba(5, 12, 26, 0.75)',
                border: `1.5px solid ${isSelected ? m.accentColor : 'rgba(0, 212, 255, 0.18)'}`,
                borderRadius: 16,
                padding: '22px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'border 0.2s ease, background 0.2s ease',
              }}
            >
              {/* Card Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{m.icon}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 20,
                        background: `${diffColor}18`,
                        color: diffColor,
                        border: `1px solid ${diffColor}44`,
                      }}
                    >
                      {m.difficulty.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono, monospace)',
                        padding: '3px 8px',
                        borderRadius: 20,
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {m.badge}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: 12, color: m.accentColor, margin: '0 0 14px 0', fontWeight: 500 }}>
                  {m.tagline}
                </p>

                {/* Mission Objective */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '10px 12px',
                    borderRadius: 8,
                    marginBottom: 14,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                    MISSION OBJECTIVE
                  </div>
                  <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.45 }}>
                    {m.objective}
                  </div>
                </div>

                {/* Satellite Task */}
                <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginBottom: 16 }}>
                  <strong style={{ color: '#fff' }}>What Satellite Does: </strong>
                  {m.satelliteTask}
                </div>
              </div>

              {/* Recommended Specs Footer */}
              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    paddingTop: 12,
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                      RECOMMENDED PAYLOAD
                    </span>
                    <span style={{ fontSize: 11, color: '#00ff88', fontWeight: 600 }}>
                      {m.recommendedPayload}
                    </span>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', display: 'block' }}>
                      RECOMMENDED ORBIT
                    </span>
                    <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 600 }}>
                      {m.recommendedOrbit} Orbit
                    </span>
                  </div>
                </div>

                {/* Start Design Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartDesign(m.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: isSelected
                      ? 'linear-gradient(90deg, #00d4ff, #0284c7)'
                      : 'rgba(0, 212, 255, 0.12)',
                    color: isSelected ? '#020409' : '#00d4ff',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected ? 'DESIGN SATELLITE ➔' : 'SELECT MISSION'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
