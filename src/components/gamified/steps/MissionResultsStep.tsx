/**
 * VYOM — Gamified Mission Results & Debrief Step
 * Comprehensive mission scorecard calculating Design Score, Resource Efficiency,
 * Orbit Selection, Decision Making, and Overall Score (out of 1000).
 * Displays strengths, mistakes made, key learnings, and AI recommendations.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GAMIFIED_MISSIONS } from '../../../constants/gamifiedData';

export function MissionResultsStep() {
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);
  const finalResults = useGamifiedStore((s) => s.finalResults);
  const resetGamifiedMission = useGamifiedStore((s) => s.resetGamifiedMission);
  const setStage = useGamifiedStore((s) => s.setStage);

  const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
  const res = finalResults;

  if (!res) {
    return (
      <div style={{ textAlign: 'center', padding: 80, color: '#fff' }}>
        <h2>Compiling Mission Flight Telemetry...</h2>
      </div>
    );
  }

  const gradeColors = {
    S: '#00ff88',
    A: '#00d4ff',
    B: '#38bdf8',
    C: '#ff9f0a',
  };

  const activeGradeColor = gradeColors[res.grade] || '#00d4ff';

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '30px 24px 80px',
        color: '#ffffff',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#00d4ff', letterSpacing: '0.15em', marginBottom: 6 }}>
          MISSION COMPLETED // FLIGHT DEBRIEFING
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px 0' }}>
          Mission Performance & Scorecard
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13 }}>
          Authoritative aerospace assessment for {mission?.title}.
        </p>
      </div>

      {/* ── HERO SCORECARD BANNER ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(5, 14, 34, 0.9)',
          border: `1.5px solid ${activeGradeColor}55`,
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 28,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${activeGradeColor}15`,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Grade Badge */}
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${activeGradeColor}22, ${activeGradeColor}05)`,
              border: `2px solid ${activeGradeColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: activeGradeColor,
              boxShadow: `0 0 20px ${activeGradeColor}33`,
            }}
          >
            {res.grade}
          </div>

          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: activeGradeColor, fontWeight: 700 }}>
              MISSION FLIGHT EVALUATION
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 6px 0' }}>
              {res.overallScore >= 800 ? 'MISSION SUCCESS' : 'MISSION COMPLETED WITH WARNINGS'}
            </h2>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Overall Score:{' '}
              <strong style={{ color: activeGradeColor, fontSize: 16 }}>{res.overallScore}</strong> / 1000 Points
            </div>
          </div>
        </div>

        {/* 5 Subsystem Scores Summary */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'SATELLITE DESIGN', score: res.designScore, max: 250 },
            { label: 'RESOURCES', score: res.resourceScore, max: 200 },
            { label: 'ORBIT TRAJECTORY', score: res.orbitScore, max: 200 },
            { label: 'DECISION MAKING', score: res.decisionScore, max: 250 },
            { label: 'FLIGHT EFFICIENCY', score: res.efficiencyScore, max: 100 },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '10px 14px',
                textAlign: 'center',
                minWidth: 100,
              }}
            >
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {item.score}
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>/{item.max}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 4 COLUMNS: DONE WELL, MISTAKES, LEARNINGS, RECOMMENDATIONS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 18,
          marginBottom: 36,
        }}
      >
        {/* 1. What you did well */}
        <div
          style={{
            background: 'rgba(5, 12, 26, 0.75)',
            border: '1px solid rgba(0, 255, 136, 0.25)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🌟</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#00ff88', fontWeight: 700 }}>
              WHAT YOU DID WELL
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: '#e2e8f0' }}>
            {res.thingsDoneWell.map((txt, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{txt}</li>
            ))}
          </ul>
        </div>

        {/* 2. Mistakes Made */}
        <div
          style={{
            background: 'rgba(5, 12, 26, 0.75)',
            border: '1px solid rgba(255, 159, 10, 0.25)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#ff9f0a', fontWeight: 700 }}>
              MISTAKES & WARNINGS
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: '#e2e8f0' }}>
            {res.mistakesMade.length > 0 ? (
              res.mistakesMade.map((txt, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{txt}</li>
              ))
            ) : (
              <li style={{ color: '#00ff88' }}>Flawless run! No major engineering blunders detected.</li>
            )}
          </ul>
        </div>

        {/* 3. What You Learned */}
        <div
          style={{
            background: 'rgba(5, 12, 26, 0.75)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🎓</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#00d4ff', fontWeight: 700 }}>
              WHAT YOU LEARNED
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: '#e2e8f0' }}>
            {res.keyLearnings.map((txt, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{txt}</li>
            ))}
          </ul>
        </div>

        {/* 4. AI Recommendations for Improvement */}
        <div
          style={{
            background: 'rgba(5, 12, 26, 0.75)',
            border: '1px solid rgba(155, 93, 229, 0.25)',
            borderRadius: 14,
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🤖</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#9b5de5', fontWeight: 700 }}>
              AI RECOMMENDATIONS
            </span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: '#e2e8f0' }}>
            {res.aiRecommendations.map((txt, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{txt}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── ACTION FOOTER ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
        }}
      >
        <button
          onClick={resetGamifiedMission}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            border: '1px solid rgba(0, 212, 255, 0.4)',
            background: 'rgba(0, 212, 255, 0.1)',
            color: '#00d4ff',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🔄 RETRY THIS MISSION
        </button>

        <button
          onClick={() => {
            resetGamifiedMission();
            setStage('choose-mission');
          }}
          style={{
            padding: '12px 28px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(90deg, #00d4ff, #0284c7)',
            color: '#020409',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.4)',
          }}
        >
          CHOOSE ANOTHER MISSION ➔
        </button>
      </div>
    </div>
  );
}
