import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '../../store/missionStore';
import { DynamicSpacecraftModel, resolveSpacecraftModelType } from '../three/DynamicSpacecraftModel';
import { StarField } from '../three/SpaceScene';
import { threatEngine } from '../../engines/ThreatEngine';
import { backendWS, injectFaultViaBackend } from '../../services/BackendWebSocketService';
import { WhatIfComparison } from '../three/WhatIfComparison';
import { stopAndResetSimulation } from '../../engines/SimulationEngine';

const THREATS = [
  {
    id: 'solar-storm',
    name: 'SOLAR STORM',
    icon: '☀',
    description: 'Intense solar particle event — radiation spike, communication interference, thermal increase.',
    severity: 'critical' as const,
    affectedSubsystem: 'Thermal & Power (TCS/EPS)',
    effects: { radiation: 8, solar: 6, thermal: 5 },
    color: '#ff8c00',
  },
  {
    id: 'asteroid',
    name: 'ASTEROID IMPACT',
    icon: '☄',
    description: 'Near-miss asteroid debris — microimpact damage to outer panels, attitude disturbance.',
    severity: 'critical' as const,
    affectedSubsystem: 'Structural & ADCS Gyros',
    effects: { asteroid: 4 },
    color: '#ff2d55',
  },
  {
    id: 'debris',
    name: 'SPACE DEBRIS',
    icon: '⚙',
    description: 'High-density debris field — evasive maneuvers required, fuel consumption elevated.',
    severity: 'warning' as const,
    affectedSubsystem: 'Propulsion (OMS) & Shielding',
    effects: { debris: 5 },
    color: '#ff8c00',
  },
  {
    id: 'power-failure',
    name: 'POWER FAILURE',
    icon: '⚡',
    description: 'Solar panel degradation — battery drain, emergency load shedding required.',
    severity: 'critical' as const,
    affectedSubsystem: 'Electrical Power (EPS / Solar Arrays)',
    effects: { power: 7 },
    color: '#ff2d55',
  },
  {
    id: 'thermal-failure',
    name: 'THERMAL EVENT',
    icon: '🌡',
    description: 'Extreme thermal excursion — payload cooling failure, temperature thresholds exceeded.',
    severity: 'critical' as const,
    affectedSubsystem: 'Cryogenic Radiators & Heat Shield (TCS)',
    effects: { thermal: 8 },
    color: '#ff8c00',
  },
  {
    id: 'communication-failure',
    name: 'COMM FAILURE',
    icon: '📡',
    description: 'Communication blackout — antenna fault or severe signal interference.',
    severity: 'warning' as const,
    affectedSubsystem: 'High-Gain Antenna (HGA/RF Transponder)',
    effects: { comms: 9 },
    color: '#9b5de5',
  },
  {
    id: 'attitude-failure',
    name: 'ATTITUDE ERROR',
    icon: '🎯',
    description: 'Attitude control system anomaly — spacecraft tumbling, solar panel misalignment.',
    severity: 'warning' as const,
    affectedSubsystem: 'Reaction Wheels & Star Trackers (ADCS)',
    effects: { attitude: 8 },
    color: '#ff8c00',
  },
];

// ── Safe Thresholds for Telemetry Parameters ─────────────────────────────────
const SAFE_THRESHOLDS = {
  temperature: { warn: 55, critical: 65, label: 'TEMPERATURE', unit: '°C' },
  pressure: { warn: 95, critical: 90, label: 'PRESSURE', unit: 'kPa', inverted: true },
  oxygen: { warn: 96, critical: 93, label: 'OXYGEN SpO₂', unit: '%', inverted: true },
  radiation: { warn: 35, critical: 60, label: 'RADIATION', unit: 'mSv/hr' },
  battery: { warn: 40, critical: 20, label: 'BATTERY', unit: '%', inverted: true },
  structural: { warn: 60, critical: 35, label: 'STRUCT. INTEGRITY', unit: '%', inverted: true },
  missionTime: { warn: Infinity, critical: Infinity, label: 'MISSION TIME', unit: 'days' },
};

// ── AI Decision Flow Stages ──────────────────────────────────────────────────
// Telemetry -> Analysis -> Anomaly Detection -> Risk Assessment -> Prediction -> Recommendation
const AI_PIPELINE_STAGES = [
  { key: 'telemetry',  label: 'TELEMETRY', icon: '📡' },
  { key: 'analysis',   label: 'ANALYSIS',  icon: '🔬' },
  { key: 'anomaly',    label: 'ANOMALY',   icon: '⚠️' },
  { key: 'risk',       label: 'RISK',      icon: '📊' },
  { key: 'predict',    label: 'PREDICT',   icon: '🔮' },
  { key: 'action',     label: 'ACTION',    icon: '🛡️' },
];

// Map AI pipeline phase to pipeline stage index
function getActivePipelineStage(phase: string | undefined, anomalyDetected: boolean): number {
  if (!anomalyDetected && phase === 'monitoring') return -1; // idle
  switch (phase) {
    case 'ingesting':  return 0; // Telemetry Ingest
    case 'analyzing':  return 1; // Analysis
    case 'diagnosing': return 2; // Anomaly Detection
    case 'optimizing': return 3; // Risk Assessment
    case 'executing':  return 4; // Prediction & Execution
    case 'verifying':  return 5; // Action & Recommendation Verification
    default:           return anomalyDetected ? 0 : -1;
  }
}

// ── AI Analysis Message Interface ────────────────────────────────────────────
interface AIMessage {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  timestamp: number;
}

// ── Danger Alert Interface ───────────────────────────────────────────────────
interface DangerAlert {
  parameter: string;
  title: string;
  detail: string;
  recommendation: string;
  severity: 'warning' | 'critical';
}

export function ScenariosScreen() {
  const activeThreats = useMissionStore((s) => s.activeThreats);
  const satellite = useMissionStore((s) => s.satellite);
  const blackBox = useMissionStore((s) => s.blackBox);
  const setScreen = useMissionStore((s) => s.setScreen);
  const telemetry = useMissionStore((s) => s.telemetry);
  const missionDay = useMissionStore((s) => s.missionDay);
  const environment = useMissionStore((s) => s.environment);
  const [triggered, setTriggered] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const ai = useMissionStore((s) => s.aiAnalysis);

  // ── AI Analysis Message Feed ─────────────────────────────────────────────
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [dangerAlerts, setDangerAlerts] = useState<DangerAlert[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<number>(0);

  // Track whether simulation is actively running (threats active or AI processing)
  const isLive = activeThreats.length > 0 || ai.anomalyDetected;

  // Vyom AI dynamic current state description
  const aiStateDescription = useMemo(() => {
    if (!isLive) return 'Standby · Monitoring Paused';
    switch (ai.phase) {
      case 'ingesting': return 'Ingesting telemetry stream...';
      case 'analyzing': return 'Analyzing cross-subsystem variance...';
      case 'diagnosing': return 'Detecting anomalies & evaluating impact...';
      case 'optimizing': return 'Evaluating risk & predicting failure time...';
      case 'executing': return 'Recommending & executing countermeasures...';
      case 'verifying': return 'Verifying sensor stabilization...';
      default:
        return ai.liveStage || 'Continuous telemetry monitoring active';
    }
  }, [isLive, ai.phase, ai.liveStage]);

  const handleStopReset = useCallback(() => {
    stopAndResetSimulation();
    setAiMessages(prev => [
      ...prev,
      {
        id: `msg-stop-${Date.now()}`,
        text: 'Simulation stopped by operator. Telemetry and subsystems returned to safe nominal baseline.',
        type: 'info',
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // ── Extract 7 telemetry parameters from store ────────────────────────────
  const tempValue = telemetry?.thermal?.cpuTempC ?? 42;
  const pressureValue = telemetry?.crew?.[0]?.suitPressureKpa ?? 101.3;
  const oxygenValue = telemetry?.crew?.[0]?.spo2Percent ?? 99;
  const radiationValue = environment?.radiationLevel ?? 14;
  const batteryValue = telemetry?.power?.batteryPercent ?? 96;
  const structuralValue = telemetry?.overallHealth ?? 98;
  const missionTimeValue = missionDay ?? 0;

  const telemetryMetrics = [
    { key: 'temperature', value: tempValue, ...SAFE_THRESHOLDS.temperature },
    { key: 'pressure', value: pressureValue, ...SAFE_THRESHOLDS.pressure },
    { key: 'oxygen', value: oxygenValue, ...SAFE_THRESHOLDS.oxygen },
    { key: 'radiation', value: radiationValue, ...SAFE_THRESHOLDS.radiation },
    { key: 'battery', value: batteryValue, ...SAFE_THRESHOLDS.battery },
    { key: 'structural', value: structuralValue, ...SAFE_THRESHOLDS.structural },
    { key: 'missionTime', value: missionTimeValue, ...SAFE_THRESHOLDS.missionTime },
  ];

  // Determine status color for each metric
  const getMetricStatus = useCallback((metric: typeof telemetryMetrics[0]): 'nominal' | 'warning' | 'critical' => {
    const inv = (metric as any).inverted;
    if (inv) {
      if (metric.value <= metric.critical) return 'critical';
      if (metric.value <= metric.warn) return 'warning';
      return 'nominal';
    } else {
      if (metric.value >= metric.critical) return 'critical';
      if (metric.value >= metric.warn) return 'warning';
      return 'nominal';
    }
  }, []);

  const statusColors = { nominal: '#00ff88', warning: '#ff9500', critical: '#ff2d55' };

  // ── AI Message Generation (contextual, based on live telemetry) ──────────
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastMessageRef.current < 1800) return; // Min 1.8s between messages
      lastMessageRef.current = now;

      const msgs: { text: string; type: AIMessage['type'] }[] = [];

      // Check telemetry anomalies
      if (tempValue > 55) {
        msgs.push({ text: `Detecting abnormal temperature rise — CPU at ${tempValue.toFixed(1)}°C`, type: 'warning' });
      }
      if (batteryValue < 40) {
        msgs.push({ text: `Battery reserves declining — ${batteryValue.toFixed(1)}% remaining`, type: 'warning' });
      }
      if (oxygenValue < 96) {
        msgs.push({ text: `Crew oxygen saturation below nominal — SpO₂ ${oxygenValue.toFixed(1)}%`, type: 'danger' });
      }
      if (structuralValue < 60) {
        msgs.push({ text: `Structural integrity degraded — ${structuralValue.toFixed(1)}% health`, type: 'danger' });
      }
      if (radiationValue > 35) {
        msgs.push({ text: `Elevated radiation levels detected — ${radiationValue.toFixed(0)} mSv/hr`, type: 'warning' });
      }
      if (pressureValue < 95) {
        msgs.push({ text: `Cabin pressure deviation detected — ${pressureValue.toFixed(1)} kPa`, type: 'warning' });
      }

      // Pipeline stage messages based on AI phase
      const phase = ai.phase;
      if (phase === 'ingesting') msgs.push({ text: 'Ingesting telemetry stream — isolating anomaly signal...', type: 'info' });
      else if (phase === 'analyzing') msgs.push({ text: 'Analyzing cross-subsystem telemetry correlation...', type: 'info' });
      else if (phase === 'diagnosing') msgs.push({ text: 'Diagnosing root cause — pattern-matching fault matrix...', type: 'info' });
      else if (phase === 'optimizing') msgs.push({ text: 'Evaluating mission impact — optimizing recovery strategy...', type: 'info' });
      else if (phase === 'executing') msgs.push({ text: 'Executing autonomous corrective action...', type: 'info' });
      else if (phase === 'verifying') msgs.push({ text: 'Verifying sensor stabilization — confirming recovery...', type: 'success' });
      else if (phase === 'monitoring' && ai.anomalyDetected) msgs.push({ text: 'Monitoring environmental conditions...', type: 'info' });

      // Contextual filler messages when no specific anomaly
      if (msgs.length === 0) {
        const fillers = [
          { text: 'Analyzing environmental conditions...', type: 'info' as const },
          { text: 'Monitoring pressure stability...', type: 'info' as const },
          { text: 'Scanning telemetry channels for variance...', type: 'info' as const },
          { text: 'Evaluating thermal envelope boundaries...', type: 'info' as const },
          { text: 'Cross-referencing subsystem health vectors...', type: 'info' as const },
        ];
        msgs.push(fillers[Math.floor(Math.random() * fillers.length)]);
      }

      // Pick one message to add
      const chosen = msgs[Math.floor(Math.random() * msgs.length)];
      setAiMessages(prev => {
        const next = [...prev, { id: `msg-${now}`, text: chosen.text, type: chosen.type, timestamp: now }];
        return next.slice(-20); // Keep last 20 messages
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive, tempValue, batteryValue, oxygenValue, structuralValue, radiationValue, pressureValue, ai.phase, ai.anomalyDetected]);

  // Auto-scroll AI feed to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // ── Danger Alert Generation ──────────────────────────────────────────────
  useEffect(() => {
    if (!isLive) {
      setDangerAlerts([]);
      return;
    }

    const alerts: DangerAlert[] = [];

    if (tempValue >= 65) {
      alerts.push({
        parameter: 'TEMPERATURE',
        title: '⚠ TEMPERATURE ANOMALY DETECTED',
        detail: `CPU temperature has risen to ${tempValue.toFixed(1)}°C, exceeding the safe operating range (< 55°C).`,
        recommendation: 'Vyom AI is activating thermal shunt valves and reducing non-critical compute load to stabilize temperatures.',
        severity: 'critical',
      });
    } else if (tempValue >= 55) {
      alerts.push({
        parameter: 'TEMPERATURE',
        title: '⚠ TEMPERATURE WARNING',
        detail: `CPU temperature at ${tempValue.toFixed(1)}°C — approaching critical threshold.`,
        recommendation: 'Vyom AI is monitoring thermal trend and preparing preventive cooling measures.',
        severity: 'warning',
      });
    }

    if (batteryValue <= 20) {
      alerts.push({
        parameter: 'BATTERY',
        title: '⚠ CRITICAL POWER LEVEL',
        detail: `Battery at ${batteryValue.toFixed(1)}% — below safe minimum. Risk of life support interruption.`,
        recommendation: 'Vyom AI is shedding non-essential loads and rerouting solar array output to primary bus.',
        severity: 'critical',
      });
    } else if (batteryValue <= 40) {
      alerts.push({
        parameter: 'BATTERY',
        title: '⚠ LOW POWER WARNING',
        detail: `Battery reserves at ${batteryValue.toFixed(1)}% — below nominal operating range.`,
        recommendation: 'Vyom AI is optimizing power distribution and scheduling charge cycles.',
        severity: 'warning',
      });
    }

    if (structuralValue <= 35) {
      alerts.push({
        parameter: 'STRUCTURAL',
        title: '⚠ STRUCTURAL INTEGRITY CRITICAL',
        detail: `Spacecraft health at ${structuralValue.toFixed(1)}% — severe structural compromise detected.`,
        recommendation: 'Vyom AI is isolating damaged sections and activating emergency containment protocols.',
        severity: 'critical',
      });
    }

    if (oxygenValue <= 93) {
      alerts.push({
        parameter: 'OXYGEN',
        title: '⚠ OXYGEN ANOMALY DETECTED',
        detail: `Crew SpO₂ has dropped to ${oxygenValue.toFixed(1)}%. Hypoxia risk is elevated.`,
        recommendation: 'Vyom AI is evaluating crew safety and recommending supplemental O₂ activation.',
        severity: 'critical',
      });
    }

    if (radiationValue >= 60) {
      alerts.push({
        parameter: 'RADIATION',
        title: '⚠ RADIATION SPIKE DETECTED',
        detail: `Radiation levels at ${radiationValue.toFixed(0)} mSv/hr — significantly above safe limits.`,
        recommendation: 'Vyom AI recommends directing crew to radiation shelter and angling solar arrays edge-on.',
        severity: 'critical',
      });
    }

    if (pressureValue <= 90) {
      alerts.push({
        parameter: 'PRESSURE',
        title: '⚠ PRESSURE ANOMALY DETECTED',
        detail: `Cabin pressure has dropped to ${pressureValue.toFixed(1)} kPa — below the safe operating range.`,
        recommendation: 'Vyom AI is evaluating impact on crew safety and recommending emergency pressurization.',
        severity: 'critical',
      });
    }

    setDangerAlerts(alerts);
  }, [isLive, tempValue, batteryValue, structuralValue, oxygenValue, radiationValue, pressureValue]);

  // ── Clear messages when simulation stops ─────────────────────────────────
  useEffect(() => {
    if (!isLive) {
      // Keep existing messages frozen (don't clear them) but stop generating new ones
    }
  }, [isLive]);

  const handleTrigger = async (threat: typeof THREATS[0]) => {
    if (activeThreats.length > 0) return; // Only one threat at a time
    setTriggered(threat.id);
    setAiMessages([
      {
        id: `msg-start-${Date.now()}`,
        text: `Scenario initiated: ${threat.name} — Vyom AI commencing live telemetry ingestion & anomaly analysis...`,
        type: 'info',
        timestamp: Date.now(),
      },
    ]);
    const store = useMissionStore.getState();
    let injected = false;
    if (backendWS.isConnected && store.config?.id) {
      injected = await injectFaultViaBackend(store.config.id, threat.id);
    }
    if (!injected) {
      threatEngine.triggerThreat(
        threat.id,
        threat.name,
        threat.description,
        threat.effects
      );
    }
    setTimeout(() => setTriggered(null), 3000);
  };

  const recentEvents = blackBox.slice(-6).reverse();
  const activeThreatData = activeThreats[0] ? THREATS.find(t => t.id === activeThreats[0].type || t.id === activeThreats[0].id) : null;
  const activePipelineStage = getActivePipelineStage(ai.phase, ai.anomalyDetected);

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', background: '#020409',
      paddingBottom: 56, overflow: 'hidden', color: '#fff',
    }}>
      {/* Left: Interactive 3D spacecraft scenario view */}
      <div style={{ flex: '0 0 32%', position: 'relative', borderRight: '1px solid rgba(255,45,85,0.15)', background: '#020409' }}>
        <Canvas gl={{ antialias: true }} dpr={[1, 1.5]}>
          <PerspectiveCamera makeDefault position={[0, 0.5, 3.8]} fov={45} />
          <ambientLight intensity={activeThreats.length > 0 ? 0.15 : 0.3} />
          <directionalLight
            position={[3, 3, 3]}
            intensity={activeThreats.length > 0 ? 0.7 : 1.2}
            color={activeThreats.some((t) => t.type === 'solar-storm' || t.id === 'solar-storm') ? '#ff8c00' : '#fff5e8'}
          />
          <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#00e5ff" />
          <StarField />
          <DynamicSpacecraftModel
            modelType={resolveSpacecraftModelType(satellite?.type, useMissionStore.getState().config?.type)}
            scale={1.3}
            interactive={true}
            activeThreatOverride={hoveredId || (activeThreats[0]?.type || activeThreats[0]?.id)}
          />
          <OrbitControls enablePan={true} enableZoom={true} autoRotate autoRotateSpeed={activeThreats.length > 0 ? 1.5 : 0.4} />
        </Canvas>

        {/* Threat Banner & Affected Subsystem Diagnostic Card */}
        <div style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(5, 14, 30, 0.85)', backdropFilter: 'blur(12px)',
          border: `1px solid ${activeThreats.length > 0 ? '#ff2d55' : 'rgba(0, 212, 255, 0.2)'}`,
          borderRadius: 8, padding: '8px 14px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: activeThreats.length > 0 ? '#ff2d55' : '#00d4ff', letterSpacing: '0.15em', fontWeight: 700 }}>
              {activeThreats.length > 0 ? '⚠ DIGITAL TWIN UNDER THREAT' : 'DIGITAL TWIN NOMINAL'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: '#fff', marginTop: 2 }}>
              {activeThreatData ? `Target: ${activeThreatData.affectedSubsystem}` : 'Subsystems Operating Within Bounds'}
            </div>
          </div>
          {activeThreats.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleStopReset}
                style={{
                  background: 'rgba(255, 45, 85, 0.2)', border: '1px solid #ff2d55',
                  borderRadius: 4, padding: '4px 10px', color: '#ff2d55',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                title="Stop scenario and restore baseline"
              >
                ⏹ STOP SIM
              </button>
              <button
                onClick={() => setScreen('ai')}
                style={{
                  background: 'rgba(155, 93, 229, 0.25)', border: '1px solid #9b5de5',
                  borderRadius: 4, padding: '4px 10px', color: '#fff',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                AI RECOVERY →
              </button>
            </div>
          )}
        </div>

        {/* Hover / Active Telemetry Diagnostics Overlay */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          background: 'rgba(2, 6, 14, 0.88)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 8, padding: '10px 14px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'rgba(255,255,255,0.45)' }}>3D VISUAL FEEDBACK:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: activeThreats.length > 0 ? '#ff3b30' : '#00ff88', fontWeight: 700 }}>
              {activeThreats.length > 0 ? 'ANOMALOUS SUBSYSTEM HIGHLIGHTED' : 'READY FOR STRESS INJECTION'}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 10.5, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.4 }}>
            Subsystem colors reflect physical health: <span style={{ color: '#ff3b30' }}>Red/Orange (Thermal/Excursion)</span>, <span style={{ color: '#ff9f0a' }}>Amber (Power Brownout)</span>, <span style={{ color: '#bf5af2' }}>Purple (Comms Loss)</span>.
          </p>
        </div>
      </div>

      {/* Center: Scenarios + Log */}
      <div style={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,45,85,0.7)', letterSpacing: '0.2em', marginBottom: 4 }}>
              CONNECTED DIGITAL TWIN STRESS TESTING
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff' }}>
              DANGER SIMULATOR
            </div>
          </div>
          {activeThreats.length > 0 && (
            <div style={{
              padding: '8px 16px',
              background: ai.isTimeout ? 'rgba(255,45,85,0.2)' : 'rgba(155,93,229,0.15)',
              border: `1px solid ${ai.isTimeout ? '#ff2d55' : '#9b5de5'}`,
              borderRadius: 6, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: ai.isTimeout ? '#ff2d55' : '#9b5de5',
                animation: !ai.isTimeout ? 'ai-pulse 1s infinite' : 'none',
              }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#fff' }}>
                STAGE: <strong style={{ color: ai.isTimeout ? '#ff2d55' : '#9b5de5' }}>{(ai.liveStage ?? 'ANALYSING').toUpperCase()}</strong>
                {' · '}AI TIME: <strong style={{ color: '#00d4ff' }}>{(ai.realElapsedSeconds ?? 0).toFixed(1)}s</strong> / 6.0s
                {ai.virtualRecoveryTimeStr && (
                  <span style={{ marginLeft: 10, opacity: 0.8, color: '#00ff88' }}>
                    (Virtual: {ai.virtualRecoveryTimeStr})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '14px 20px', display: 'flex', gap: 16 }}>
          {/* Threat cards */}
          <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
              SELECT A THREAT SCENARIO TO TRIGGER
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {THREATS.map((threat) => {
                const isActive = activeThreats.some((t) => t.type === threat.id || t.id === threat.id);
                const isTriggering = triggered === threat.id;
                const disabled = activeThreats.length > 0 && !isActive;
                return (
                  <motion.div
                    key={threat.id}
                    whileHover={!disabled && !isActive ? { scale: 1.02, y: -2 } : {}}
                    onClick={() => !disabled && !isActive && handleTrigger(threat)}
                    onMouseEnter={() => setHoveredId(threat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      padding: '14px',
                      background: isActive ? `rgba(${threat.color === '#ff2d55' ? '255,45,85' : threat.color === '#ff8c00' ? '255,140,0' : '155,93,229'},0.1)` : 'rgba(0,0,0,0.4)',
                      border: `1px solid ${isActive ? threat.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 8,
                      cursor: disabled ? 'not-allowed' : isActive ? 'default' : 'pointer',
                      opacity: disabled ? 0.3 : 1,
                      transition: 'all 0.2s',
                      animation: isActive ? 'threat-alert 1s ease-in-out infinite' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{threat.icon}</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                      color: isActive ? threat.color : '#fff', letterSpacing: '0.05em', marginBottom: 3,
                    }}>
                      {isActive ? '⚡ ACTIVE: ' : ''}{threat.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, marginBottom: 4 }}>
                      {threat.description}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(0, 212, 255, 0.7)', marginBottom: 6 }}>
                      Impact: {threat.affectedSubsystem}
                    </div>
                    {!isActive && !disabled && (
                      <div style={{
                        marginTop: 4, padding: '4px 8px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 8.5,
                        color: threat.color, textAlign: 'center', letterSpacing: '0.1em',
                      }}>
                        {isTriggering ? 'TRIGGERING…' : `[ TRIGGER ${threat.name} ]`}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}>
                CONNECTED DIGITAL TWIN · Triggering causes real-time telemetry shifts, visual 3D degradation, incident alerts, and AI Guardian auto-diagnosis.
              </span>
            </div>

            {/* Recent events (collapsed into compact view) */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                RECENT DIGITAL TWIN EVENTS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 140, overflowY: 'auto' }}>
                <AnimatePresence>
                  {recentEvents.map((ev, idx) => (
                    <motion.div
                      key={`${ev.id || 'ev'}-${idx}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(0,0,0,0.3)',
                        borderLeft: `2px solid ${ev.severity === 'critical' ? 'var(--critical)' : ev.severity === 'warning' ? 'var(--warning)' : 'var(--nominal)'}`,
                        borderRadius: '0 6px 6px 0',
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'rgba(255,255,255,0.3)', marginBottom: 2 }}>
                        DAY {Math.floor(ev.missionDay)} · {ev.eventType.toUpperCase()} · {ev.source}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
                        {ev.description}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {recentEvents.length === 0 && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: 14, textAlign: 'center' }}>
                    No events yet — trigger a scenario
                  </div>
                )}
              </div>
            </div>

            {/* AI vs Manual Performance Card */}
            <div style={{ marginTop: 14, padding: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.1em', marginBottom: 8 }}>
                📊 AI VS MANUAL PERFORMANCE METRICS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>VYOM AI GUARDIAN AVG</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#00ff88', fontWeight: 700 }}>
                    {useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'ai' && i.total_resolution_ms).length > 0 
                      ? (useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'ai' && i.total_resolution_ms).reduce((a, b) => a + (b.total_resolution_ms || 0), 0) / useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'ai' && i.total_resolution_ms).length / 1000).toFixed(1) + 's' 
                      : '--'}
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>MANUAL CONTROL AVG</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: '#ff8c00', fontWeight: 700 }}>
                    {useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'manual' && i.total_resolution_ms).length > 0 
                      ? (useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'manual' && i.total_resolution_ms).reduce((a, b) => a + (b.total_resolution_ms || 0), 0) / useMissionStore.getState().incidents.filter(i => i.recovery_mode === 'manual' && i.total_resolution_ms).length / 1000).toFixed(1) + 's' 
                      : '--'}
                  </div>
                </div>
              </div>

              {/* ── v3.0 additive: Mission What-If / Scenario Comparison ── */}
              <WhatIfComparison />
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: VYOM AI REAL-TIME MONITORING ─── */}
      <div style={{
        flex: '0 0 310px',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid rgba(0,240,255,0.15)',
        background: 'linear-gradient(180deg, rgba(2,8,18,0.95) 0%, rgba(1,4,10,0.98) 100%)',
        overflow: 'hidden',
      }}>
        {/* ── Live Monitoring Indicator ── */}
        <div style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(0,240,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: isLive
            ? 'linear-gradient(90deg, rgba(0,255,136,0.06), rgba(0,240,255,0.04))'
            : 'rgba(255,255,255,0.02)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Scanning line effect when live */}
          {isLive && (
            <div style={{
              position: 'absolute',
              top: 0, width: '30%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.08), transparent)',
              animation: 'vyom-scan 3s linear infinite',
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isLive ? '#00ff88' : '#555',
              color: isLive ? '#00ff88' : '#555',
              animation: isLive ? 'live-pulse 1.5s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 900,
                color: isLive ? '#00ff88' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.12em',
              }}>
                ● VYOM AI — {isLive ? 'LIVE MONITORING' : 'MONITORING PAUSED'}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 7,
                color: isLive ? '#00f0ff' : 'rgba(255,255,255,0.25)',
                marginTop: 2, display: 'flex', alignItems: 'center', gap: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: isLive ? '#00ff88' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>STATE:</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{aiStateDescription}</span>
              </div>
            </div>
          </div>
          {isLive && (
            <button
              onClick={handleStopReset}
              style={{
                background: 'rgba(255,45,85,0.15)',
                border: '1px solid #ff2d55',
                borderRadius: 4, padding: '3px 8px',
                color: '#ff2d55',
                fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                cursor: 'pointer', zIndex: 2, flexShrink: 0, marginLeft: 8,
                transition: 'all 0.2s ease',
              }}
              title="Stop simulation and restore telemetry to safe nominal baseline"
            >
              ⏹ STOP
            </button>
          )}
        </div>

        {/* ── Scrollable monitoring content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── Live Telemetry Dashboard ── */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, color: '#00f0ff',
              letterSpacing: '0.15em', marginBottom: 8, fontWeight: 700,
            }}>
              LIVE TELEMETRY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {telemetryMetrics.map((metric) => {
                const status = getMetricStatus(metric);
                const col = statusColors[status];
                const isDanger = status === 'critical' || status === 'warning';
                const displayVal = metric.key === 'missionTime'
                  ? `Day ${metric.value.toFixed(1)}`
                  : `${metric.value.toFixed(1)} ${metric.unit}`;

                return (
                  <div
                    key={metric.key}
                    style={{
                      padding: '6px 10px',
                      background: isDanger && isLive
                        ? `rgba(${status === 'critical' ? '255,45,85' : '255,149,0'},0.1)`
                        : 'rgba(0,14,28,0.5)',
                      border: `1px solid ${isDanger && isLive ? col + '40' : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 5,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.4s ease',
                      animation: isDanger && isLive && status === 'critical' ? 'telemetry-flash 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 7.5,
                      color: isDanger && isLive ? col : 'rgba(255,255,255,0.5)',
                      fontWeight: isDanger && isLive ? 700 : 400,
                      letterSpacing: '0.05em',
                    }}>
                      {metric.label}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                      color: isDanger && isLive ? col : '#fff',
                      transition: 'color 0.3s ease',
                    }}>
                      {displayVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── AI Decision Flow Pipeline ── */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, color: '#00f0ff',
              letterSpacing: '0.15em', marginBottom: 8, fontWeight: 700,
            }}>
              AI DECISION FLOW
            </div>
            <div style={{
              display: 'flex', gap: 2, alignItems: 'center',
              padding: '6px 8px',
              background: 'rgba(0,14,28,0.5)',
              border: '1px solid rgba(0,240,255,0.1)',
              borderRadius: 6,
            }}>
              {AI_PIPELINE_STAGES.map((stage, idx) => {
                const isActive = idx === activePipelineStage;
                const isCompleted = activePipelineStage >= 0 && idx < activePipelineStage;
                const stageCol = isActive ? '#00f0ff' : isCompleted ? '#00ff88' : 'rgba(255,255,255,0.15)';

                return (
                  <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: isActive ? 'rgba(0,240,255,0.2)' : isCompleted ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${stageCol}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9,
                        transition: 'all 0.3s ease',
                        animation: isActive ? 'ai-pulse 1.2s ease-in-out infinite' : 'none',
                      }}>
                        {isCompleted ? '✓' : stage.icon}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 5.5,
                        color: isActive ? '#00f0ff' : isCompleted ? '#00ff88' : 'rgba(255,255,255,0.2)',
                        marginTop: 3, fontWeight: isActive ? 700 : 400,
                        letterSpacing: '0.05em', textAlign: 'center',
                      }}>
                        {stage.label}
                      </div>
                    </div>
                    {idx < AI_PIPELINE_STAGES.length - 1 && (
                      <div style={{
                        width: 8, height: 1,
                        background: isCompleted ? '#00ff88' : 'rgba(255,255,255,0.1)',
                        flexShrink: 0,
                        transition: 'background 0.3s ease',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Danger Detection Alerts ── */}
          <AnimatePresence>
            {dangerAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                {dangerAlerts.slice(0, 2).map((alert, idx) => (
                  <div
                    key={`alert-${alert.parameter}-${idx}`}
                    style={{
                      padding: '10px 12px',
                      background: alert.severity === 'critical'
                        ? 'rgba(255,45,85,0.12)'
                        : 'rgba(255,149,0,0.1)',
                      border: `1px solid ${alert.severity === 'critical' ? '#ff2d55' : '#ff9500'}`,
                      borderRadius: 6,
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 900,
                      color: alert.severity === 'critical' ? '#ff2d55' : '#ff9500',
                      marginBottom: 4, letterSpacing: '0.08em',
                    }}>
                      {alert.title}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 7.5,
                      color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, marginBottom: 6,
                    }}>
                      {alert.detail}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 7.5,
                      color: '#00f0ff', lineHeight: 1.3,
                      padding: '5px 8px',
                      background: 'rgba(0,240,255,0.06)',
                      borderRadius: 4,
                      borderLeft: '2px solid #00f0ff',
                    }}>
                      🛡️ {alert.recommendation}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Vyom AI Analysis Feed ── */}
          <div style={{ flex: 1, minHeight: 100 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8, color: '#00f0ff',
              letterSpacing: '0.15em', marginBottom: 6, fontWeight: 700,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>VYOM AI ANALYSIS</span>
              {isLive && (
                <span style={{
                  fontSize: 6.5, color: '#00ff88',
                  animation: 'ai-pulse 2s ease-in-out infinite',
                }}>
                  ● PROCESSING
                </span>
              )}
            </div>
            <div
              ref={feedRef}
              style={{
                maxHeight: 200,
                overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: 3,
                position: 'relative',
                background: 'rgba(0,8,18,0.4)',
                border: '1px solid rgba(0,240,255,0.08)',
                borderRadius: 6,
                padding: '6px 8px',
              }}
            >
              {aiMessages.length === 0 && (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8,
                  color: 'rgba(255,255,255,0.2)', padding: '12px 0', textAlign: 'center',
                }}>
                  {isLive ? 'Initializing analysis...' : 'Waiting for simulation start...'}
                </div>
              )}
              {aiMessages.map((msg) => {
                const msgColor = msg.type === 'danger' ? '#ff2d55'
                  : msg.type === 'warning' ? '#ff9500'
                  : msg.type === 'success' ? '#00ff88'
                  : 'rgba(0,240,255,0.8)';
                const ts = new Date(msg.timestamp);
                const timeStr = `${ts.getHours().toString().padStart(2, '0')}:${ts.getMinutes().toString().padStart(2, '0')}:${ts.getSeconds().toString().padStart(2, '0')}`;

                return (
                  <div
                    key={msg.id}
                    style={{
                      padding: '4px 6px',
                      borderLeft: `2px solid ${msgColor}`,
                      borderRadius: '0 3px 3px 0',
                      background: 'rgba(0,0,0,0.2)',
                      animation: 'vyom-message-in 0.3s ease forwards',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 7.5,
                        color: msgColor, lineHeight: 1.3,
                      }}>
                        {msg.type === 'danger' ? '⚠ ' : msg.type === 'warning' ? '⚡ ' : msg.type === 'success' ? '✓ ' : '› '}{msg.text}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 6,
                        color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginLeft: 6,
                      }}>
                        {timeStr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── System Summary (when threat resolved) ── */}
          {!isLive && aiMessages.length > 0 && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 6,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                color: '#00ff88', marginBottom: 4, letterSpacing: '0.08em',
              }}>
                ✓ SYSTEM STABLE — MONITORING PAUSED
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 7.5,
                color: 'rgba(255,255,255,0.5)', lineHeight: 1.3,
              }}>
                Vyom AI has completed analysis. All subsystems within nominal parameters. Trigger a new scenario to resume monitoring.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
