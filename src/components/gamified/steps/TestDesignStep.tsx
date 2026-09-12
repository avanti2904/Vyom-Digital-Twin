/**
 * VYOM — Gamified Pre-Flight AI Test Step
 * Evaluates 6 critical dimensions (Payload, Power, Comms, Weight, Fuel, Orbit)
 * with educational explanations, score indicators, and 3 actionable paths.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';
import { GAMIFIED_MISSIONS } from '../../../constants/gamifiedData';

export function TestDesignStep() {
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);
  const design = useGamifiedStore((s) => s.design);
  const runPreFlightTest = useGamifiedStore((s) => s.runPreFlightTest);
  const preFlightReport = useGamifiedStore((s) => s.preFlightReport);
  const setComponent = useGamifiedStore((s) => s.setComponent);
  const acceptAiOrbit = useGamifiedStore((s) => s.acceptAiOrbit);
  const setStage = useGamifiedStore((s) => s.setStage);
  const setLaunchPhase = useGamifiedStore((s) => s.setLaunchPhase);
  const setAiMessage = useGamifiedStore((s) => s.setAiMessage);

  const [isDiagnosing, setIsDiagnosing] = useState(true);

  const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);

  // Run test on mount with brief diagnostic scan animation
  useEffect(() => {
    const timer = setTimeout(() => {
      runPreFlightTest();
      setIsDiagnosing(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAiRecommendations = () => {
    // Automatically apply optimal mission components & orbit
    if (selectedMissionId === 'flood-monitoring') {
      setComponent('payload', 'radar');
      setComponent('power', 'advanced-solar');
      setComponent('communication', 'high-gain-antenna');
      setComponent('control', 'advanced-control');
    } else if (selectedMissionId === 'weather-monitoring') {
      setComponent('payload', 'thermal-sensor');
      setComponent('power', 'advanced-solar');
      setComponent('communication', 'high-gain-antenna');
      setComponent('control', 'basic-control');
    } else if (selectedMissionId === 'communication') {
      setComponent('payload', 'optical-camera'); // Secondary or general
      setComponent('power', 'advanced-solar');
      setComponent('communication', 'high-gain-antenna');
      setComponent('control', 'basic-control');
    } else if (selectedMissionId === 'forest-fire') {
      setComponent('payload', 'thermal-sensor');
      setComponent('power', 'standard-solar');
      setComponent('communication', 'high-gain-antenna');
      setComponent('control', 'advanced-control');
    } else if (selectedMissionId === 'earth-mapping') {
      setComponent('payload', 'optical-camera');
      setComponent('power', 'advanced-solar');
      setComponent('communication', 'high-gain-antenna');
      setComponent('control', 'advanced-control');
    }
    acceptAiOrbit();
    // Re-run test
    setTimeout(() => {
      runPreFlightTest();
    }, 100);
  };

  const handleProceedToLaunch = () => {
    setStage('launch-simulation');
    setAiMessage('Initiating satellite overview broadcast. Review mission spacecraft specifications and operational profiles.', 'happy');
  };

  const getStatusBadge = (status: 'optimal' | 'acceptable' | 'suboptimal' | 'critical') => {
    const colors = {
      optimal: { bg: 'rgba(0, 255, 136, 0.15)', text: '#00ff88', border: '#00ff8844', label: 'OPTIMAL' },
      acceptable: { bg: 'rgba(0, 212, 255, 0.15)', text: '#00d4ff', border: '#00d4ff44', label: 'ACCEPTABLE' },
      suboptimal: { bg: 'rgba(255, 159, 10, 0.15)', text: '#ff9f0a', border: '#ff9f0a44', label: 'SUBOPTIMAL' },
      critical: { bg: 'rgba(255, 59, 48, 0.15)', text: '#ff3b30', border: '#ff3b3044', label: 'CRITICAL DEFICIT' },
    };
    const c = colors[status];
    return (
      <span
        style={{
          fontSize: 9,
          fontFamily: 'var(--font-mono)',
          padding: '2px 8px',
          borderRadius: 4,
          background: c.bg,
          color: c.text,
          border: `1px solid ${c.border}`,
          fontWeight: 700,
        }}
      >
        {c.label}
      </span>
    );
  };

  const report = preFlightReport;

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
          PHASE 03 // PRE-FLIGHT READINESS DIAGNOSTIC
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px 0' }}>
          Test Mission Design with VYOM AI
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 13, maxWidth: 620, margin: '0 auto' }}>
          Simulating orbital thermodynamics, radio link margin, mass properties, and sensing geometry
          for {mission?.title}.
        </p>
      </div>

      {isDiagnosing ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🤖</div>
          <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: '#00d4ff' }}>
            RUNNING MULTI-SUBSYSTEM PHYSICS SIMULATION...
          </div>
        </div>
      ) : report ? (
        <div>
          {/* Readiness Score Banner */}
          <div
            style={{
              background: report.isFlightReady ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 159, 10, 0.08)',
              border: `1.5px solid ${report.isFlightReady ? '#00ff8855' : '#ff9f0a55'}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              backdropFilter: 'blur(10px)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{report.isFlightReady ? '🚀' : '⚠️'}</span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: report.isFlightReady ? '#00ff88' : '#ff9f0a',
                  }}
                >
                  {report.isFlightReady ? 'MISSION DESIGN FLIGHT-READY' : 'ENGINEERING ADJUSTMENTS RECOMMENDED'}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                {report.summaryFeedback}
              </p>
            </div>

            {/* Overall Score Dial */}
            <div style={{ textAlign: 'center', minWidth: 120 }}>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: report.overallScore >= 80 ? '#00ff88' : report.overallScore >= 60 ? '#00d4ff' : '#ff9f0a',
                }}
              >
                {report.overallScore}
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>/100</span>
              </div>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
                READINESS INDEX
              </div>
            </div>
          </div>

          {/* 6 Subsystem Diagnostic Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              report.payloadSuitability,
              report.powerEfficiency,
              report.commsStrength,
              report.weightBalance,
              report.fuelUsage,
              report.orbitCompatibility,
            ].map((cat, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(5, 12, 26, 0.75)',
                  border: '1px solid rgba(0, 212, 255, 0.15)',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#00d4ff', fontWeight: 700 }}>
                      {cat.name.toUpperCase()}
                    </span>
                    {getStatusBadge(cat.status)}
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                    {cat.title}
                  </div>

                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                    {cat.explanation}
                  </p>
                </div>

                {cat.recommendation && (
                  <div
                    style={{
                      fontSize: 10.5,
                      color: '#00ff88',
                      background: 'rgba(0, 255, 136, 0.08)',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(0, 255, 136, 0.2)',
                    }}
                  >
                    💡 {cat.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── 3 ACTION BUTTONS ── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              justifyContent: 'center',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 24,
            }}
          >
            {/* 1. Modify Satellite */}
            <button
              onClick={() => setStage('design-satellite')}
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🛠️ MODIFY SATELLITE
            </button>

            {/* 2. Accept AI Recommendation */}
            <button
              onClick={handleAcceptAiRecommendations}
              style={{
                padding: '12px 20px',
                borderRadius: 8,
                border: '1px solid rgba(0, 212, 255, 0.4)',
                background: 'rgba(0, 212, 255, 0.12)',
                color: '#00d4ff',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🤖 ACCEPT AI RECOMMENDATION
            </button>

            {/* 3. Continue to Launch */}
            <button
              onClick={handleProceedToLaunch}
              style={{
                padding: '12px 28px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                color: '#020409',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
              }}
            >
              CONTINUE TO SATELLITE OVERVIEW 🛰️
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
