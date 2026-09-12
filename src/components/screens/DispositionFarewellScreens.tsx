import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMissionStore } from '../../store/missionStore';
import type { DispositionType } from '../../types/mission';

const DISPOSITIONS: {
  type: DispositionType;
  name: string;
  icon: string;
  description: string;
  detail: string;
  color: string;
}[] = [
  {
    type: 'return',
    name: 'RETURN TO EARTH',
    icon: '🌍',
    description: 'Controlled atmospheric re-entry and recovery.',
    detail: 'The spacecraft executes a deorbit burn, enters the atmosphere, deploys parachutes, and is recovered on the surface. Mission data and hardware are preserved.',
    color: '#00ff88',
  },
  {
    type: 'deorbit',
    name: 'CONTROLLED DEORBIT',
    icon: '🌊',
    description: 'Guided orbital decay into designated disposal zone.',
    detail: 'The spacecraft performs a controlled deorbit burn to ensure re-entry over a designated ocean disposal zone, minimizing risk to populated areas.',
    color: '#00d4ff',
  },
  {
    type: 'retirement',
    name: 'ORBITAL RETIREMENT',
    icon: '⭐',
    description: 'Spacecraft continues in stable retirement orbit.',
    detail: 'The spacecraft is passivated (fuel vented, batteries discharged) and placed in a stable graveyard orbit above operational zones, where it will remain indefinitely.',
    color: '#9b5de5',
  },
];

export function DispositionScreen() {
  const setScreen          = useMissionStore((s) => s.setScreen);
  const setDisposition     = useMissionStore((s) => s.setDisposition);
  const archiveMission     = useMissionStore((s) => s.archiveMission);
  const config             = useMissionStore((s) => s.config);
  const stats              = useMissionStore((s) => s.stats);
  const farewellAssessment = useMissionStore((s) => s.farewellAssessment);
  const telemetry          = useMissionStore((s) => s.telemetry);
  const missionDay         = useMissionStore((s) => s.missionDay);
  const rulDays            = useMissionStore((s) => s.rulDays);
  const resourceReserve    = useMissionStore((s) => s.resourceReservePercent);
  const aiAnalysis         = useMissionStore((s) => s.aiAnalysis);
  const milestones         = useMissionStore((s) => s.milestones);
  const objectiveProgress  = useMissionStore((s) => s.objectiveProgress);
  const [selected, setSelected] = useState<DispositionType | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Compute best recommended option if no farewellAssessment
  const health = telemetry?.overallHealth ?? 0;
  const computedRecommendation: DispositionType =
    farewellAssessment?.recommended_option ??
    (health > 60 && rulDays > 30 ? 'retirement' : rulDays < 10 ? 'deorbit' : 'return');

  const handleConfirm = () => {
    if (!selected) return;
    setDisposition(selected);
    archiveMission();
    setConfirming(true);
    setTimeout(() => setScreen('farewell'), 2500);
  };

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'flex-start',
      background: '#020409', padding: '32px', paddingBottom: 80, overflowY: 'auto',
    }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 20, maxWidth: 700, width: '100%' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.3em', color: 'rgba(0,212,255,0.6)', marginBottom: 12 }}>
          MISSION COMPLETE
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', marginBottom: 10 }}>
          {config?.name}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
          The mission has reached its final condition. Review the spacecraft status below and select the end-of-mission disposition.
        </p>
      </motion.div>

      {/* Live Mission Final Status Dashboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        style={{ width: '100%', maxWidth: 800, background: 'rgba(5,12,25,0.85)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.2em', marginBottom: 16 }}>
          SPACECRAFT FINAL STATUS — LIVE TELEMETRY
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { label: 'SPACECRAFT HEALTH', value: `${(telemetry?.overallHealth ?? 0).toFixed(1)}%`, color: (telemetry?.overallHealth ?? 0) > 70 ? '#00ff88' : (telemetry?.overallHealth ?? 0) > 40 ? '#ff8c00' : '#ff2d55' },
            { label: 'MISSION DURATION', value: `DAY ${missionDay.toFixed(1)}`, color: '#00d4ff' },
            { label: 'EST. RUL', value: `${Math.max(0, rulDays).toFixed(1)} DAYS`, color: rulDays > 30 ? '#00ff88' : rulDays > 10 ? '#ff8c00' : '#ff2d55' },
            { label: 'RESOURCES', value: `${resourceReserve.toFixed(0)}%`, color: resourceReserve > 50 ? '#00ff88' : resourceReserve > 20 ? '#ff8c00' : '#ff2d55' },
            { label: 'MISSION RISK', value: (aiAnalysis.riskLevel ?? 'low').toUpperCase(), color: aiAnalysis.riskLevel === 'critical' ? '#ff2d55' : aiAnalysis.riskLevel === 'high' ? '#ff8c00' : '#00ff88' },
            { label: 'OBJECTIVES', value: `${Math.round(objectiveProgress)}%`, color: objectiveProgress >= 100 ? '#00ff88' : '#00d4ff' },
            { label: 'TRAJECTORY', value: (telemetry?.orbit?.phaseDesc ?? 'NOMINAL').toUpperCase().slice(0, 18), color: '#00d4ff' },
            { label: 'MILESTONES', value: `${milestones.filter(m => m.completed).length}/${milestones.length}`, color: '#00ff88' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7.5, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* VYOM AI Farewell Assessment Panel */}
      {farewellAssessment && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(5,12,25,0.8)', border: '1px solid rgba(155,93,229,0.3)',
            borderRadius: 12, padding: '16px 24px', marginBottom: 32, maxWidth: 700, width: '100%',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9b5de5', letterSpacing: '0.15em' }}>VYOM AI DISPOSITION ASSESSMENT</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00ff88' }}>CONFIDENCE: {(farewellAssessment.confidence * 100).toFixed(0)}%</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>RECOMMENDED ACTION</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff' }}>
                {DISPOSITIONS.find(d => d.type === farewellAssessment.recommended_option)?.name ?? 'UNKNOWN'}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>RELIABILITY SCORE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#00d4ff' }}>
                {(farewellAssessment.readiness_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 4 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>DECISION FACTORS</div>
            <ul style={{ margin: 0, paddingLeft: 16, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
              {farewellAssessment.factors.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Disposition options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, width: '100%', maxWidth: 900, marginBottom: 40 }}>
        {DISPOSITIONS.map((d, i) => {
          const isRecommended = computedRecommendation === d.type;
          return (
          <motion.div
            key={d.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            onClick={() => !confirming && setSelected(d.type)}
            style={{
              position: 'relative',
              padding: '32px 28px',
              background: selected === d.type ? `rgba(${d.color === '#00ff88' ? '0,255,136' : d.color === '#00d4ff' ? '0,212,255' : '155,93,229'},0.1)` : 'rgba(5,12,25,0.9)',
              border: `1px solid ${selected === d.type ? d.color + '50' : isRecommended ? 'rgba(155,93,229,0.5)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14,
              cursor: confirming ? 'default' : 'pointer',
              transition: 'all 0.3s',
              transform: selected === d.type ? 'scale(1.02)' : 'scale(1)',
              boxShadow: selected === d.type ? `0 0 40px ${d.color}15` : isRecommended ? '0 0 20px rgba(155,93,229,0.1)' : 'none',
            }}
          >
            {isRecommended && (
              <div style={{ position: 'absolute', top: -10, left: 24, background: '#9b5de5', color: '#fff', fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.1em' }}>
                AI RECOMMENDED
              </div>
            )}
            <div style={{ fontSize: 40, marginBottom: 16 }}>{d.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
              color: selected === d.type ? d.color : '#fff',
              letterSpacing: '0.06em', marginBottom: 8,
            }}>
              {d.name}
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              {selected === d.type ? d.detail : d.description}
            </p>
          </motion.div>
        )})}
      </div>

      {/* Mission stats summary */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ display: 'flex', gap: 32, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        {[
          { label: 'MISSION DURATION', value: 'COMPLETE' },
          { label: 'THREATS MITIGATED', value: String(stats.threatsEncountered) },
          { label: 'AI INTERVENTIONS', value: String(stats.aiInterventions) },
          { label: 'PEAK HEALTH', value: `${stats.maxHealth.toFixed(0)}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#00d4ff' }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* Confirm button */}
      {selected && !confirming && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleConfirm}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em',
            padding: '18px 60px',
            background: DISPOSITIONS.find((d) => d.type === selected)?.color ?? '#00d4ff',
            border: 'none', borderRadius: 8, color: '#000',
            cursor: 'pointer',
            boxShadow: `0 0 40px ${DISPOSITIONS.find((d) => d.type === selected)?.color ?? '#00d4ff'}40`,
          }}
        >
          CONFIRM: {DISPOSITIONS.find((d) => d.type === selected)?.name} →
        </motion.button>
      )}

      {/* Direct link to Farewell if no option selected yet */}
      {!confirming && (
        <button
          onClick={() => setScreen('farewell')}
          style={{
            marginTop: 16,
            background: 'transparent',
            border: '1px solid rgba(155,93,229,0.35)',
            borderRadius: 6,
            color: '#d8b4fe',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.1em',
            padding: '8px 18px',
            cursor: 'pointer',
          }}
        >
          ★ SKIP DIRECTLY TO FAREWELL SCREEN →
        </button>
      )}

      {confirming && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#00d4ff', textAlign: 'center' }}
        >
          DISPOSITION CONFIRMED · ARCHIVING MISSION · PREPARING FAREWELL…
        </motion.div>
      )}
    </div>
  );
}

export function FarewellScreen() {
  const setScreen = useMissionStore((s) => s.setScreen);
  const config = useMissionStore((s) => s.config);
  const stats = useMissionStore((s) => s.stats);
  const telemetry = useMissionStore((s) => s.telemetry);
  const missionDay = useMissionStore((s) => s.missionDay);
  const disposition = useMissionStore((s) => s.disposition);
  const resetMission = useMissionStore((s) => s.resetMission);
  const archiveMission = useMissionStore((s) => s.archiveMission);

  const [isPausedCountdown, setIsPausedCountdown] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(45);

  const missionName = config?.name || 'VYOM SPACECRAFT';
  const missionType = (config?.type || 'orbital').toUpperCase();
  const dispositionLabel = (disposition || 'orbital-retirement').replace('-', ' ').toUpperCase();

  // Guarantee mission is archived
  useEffect(() => {
    archiveMission();
  }, [archiveMission]);

  // Automatic countdown to navigate to landing page (can be paused or canceled)
  useEffect(() => {
    if (autoRedirectCountdown === null || isPausedCountdown) return;
    if (autoRedirectCountdown <= 0) {
      resetMission();
      setScreen('welcome');
      return;
    }
    const timer = setInterval(() => {
      setAutoRedirectCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [autoRedirectCountdown, isPausedCountdown, setScreen, resetMission]);

  const handleNewMission = () => {
    resetMission();
    setScreen('welcome');
  };

  const handleGoToArchive = () => {
    setScreen('archive');
  };

  return (
    <div style={{
      width: '100%', minHeight: '100vh', height: 'auto', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, #020409 75%)',
      position: 'relative', overflowY: 'auto', padding: '36px 20px 100px',
    }}>
      {/* Stars animation */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 90 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 13.7) % 100}%`,
            top: `${(i * 23.3) % 100}%`,
            width: (i % 3) + 1,
            height: (i % 3) + 1,
            borderRadius: '50%',
            background: i % 4 === 0 ? '#00d4ff' : 'white',
            opacity: 0.3 + ((i % 5) / 10),
            animation: `star-twinkle ${2 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${(i % 3)}s`,
          }} />
        ))}
      </div>

      <div style={{ textAlign: 'center', zIndex: 1, padding: '24px', maxWidth: 860, width: '100%' }}>
        {/* Mission Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 12 }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em',
            color: '#00d4ff', background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.3)', borderRadius: 20,
            padding: '4px 14px',
          }}>
            MISSION ACCOMPLISHED · {missionType} FLIGHT
          </span>
        </motion.div>

        {/* Mission Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 6vw, 76px)',
            fontWeight: 900, color: '#fff', marginBottom: 12, letterSpacing: '0.05em',
            textShadow: '0 0 50px rgba(0,212,255,0.35)',
          }}>
            {missionName}
          </div>
        </motion.div>

        {/* Farewell Poetry Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 1.8vw, 18px)',
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 560,
            margin: '0 auto 24px',
          }}
        >
          "Every mission has an end.<br />Every journey leaves a permanent mark among the stars."
        </motion.p>

        {/* Final Mission Highlights Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 10, maxWidth: 700, margin: '0 auto 24px',
          }}
        >
          {[
            { label: 'MISSION DURATION', value: `DAY ${missionDay.toFixed(1)}`, color: '#00d4ff' },
            { label: 'PEAK HEALTH', value: `${(telemetry?.overallHealth ?? 98.5).toFixed(1)}%`, color: '#00ff88' },
            { label: 'THREATS MITIGATED', value: String(stats?.threatsEncountered ?? 0), color: '#38bdf8' },
            { label: 'AI INTERVENTIONS', value: String(stats?.aiInterventions ?? 0), color: '#a855f7' },
          ].map((m) => (
            <div key={m.label} style={{
              background: 'rgba(5,12,25,0.85)',
              border: '1px solid rgba(0,212,255,0.18)',
              borderRadius: 8, padding: '10px 12px',
              textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>
                {m.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 800, color: m.color }}>
                {m.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Farewell message & Archive acknowledgment card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            marginBottom: 26, padding: '18px 24px',
            background: 'rgba(5,12,25,0.85)', border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 12, backdropFilter: 'blur(12px)',
            maxWidth: 700, margin: '0 auto 26px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#00d4ff', letterSpacing: '0.18em', marginBottom: 6 }}>
            ✓ MISSION TELEMETRY &amp; BLACK BOX ARCHIVED
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, color: '#fff', fontWeight: 800 }}>
            "Thank you, {missionName}."
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 8, lineHeight: 1.6 }}>
            The spacecraft operations and flight team have completed all objectives with distinction.
            All flight telemetry, black box data, and scientific logs have been permanently archived.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
            FINAL DISPOSITION: <span style={{ color: '#00ff88', fontWeight: 700 }}>{dispositionLabel}</span>
          </div>
        </motion.div>

        {/* Auto-Redirect Notice with Pause Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ maxWidth: 480, margin: '0 auto 24px' }}
        >
          {autoRedirectCountdown !== null ? (
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#00d4ff' }}>
                  {isPausedCountdown ? '⏸ REDIRECT PAUSED' : `◫ RETURNING TO VYOM IN ${autoRedirectCountdown}s`}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => setIsPausedCountdown(!isPausedCountdown)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 4,
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {isPausedCountdown ? '▶ RESUME' : '⏸ PAUSE'}
                  </button>
                  <button
                    onClick={() => setAutoRedirectCountdown(null)}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 4,
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      padding: '2px 8px',
                      cursor: 'pointer',
                    }}
                    title="Dismiss automatic countdown and stay on Farewell page"
                  >
                    ✕ STAY HERE
                  </button>
                </div>
              </div>
              <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(autoRedirectCountdown / 45) * 100}%`,
                  background: 'linear-gradient(90deg, #00d4ff, #00ff88)',
                  transition: 'width 1s linear',
                }} />
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'rgba(255,255,255,0.4)' }}>
              Standby mode: Auto-redirect disabled. Take your time reviewing the mission.
            </div>
          )}
        </motion.div>

        {/* Interactive Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                resetMission();
                setScreen('welcome');
              }}
              className="btn btn-primary btn-lg"
              style={{ padding: '12px 26px', fontSize: 11, letterSpacing: '0.1em', boxShadow: '0 0 25px rgba(0,212,255,0.4)', cursor: 'pointer' }}
            >
              ← BACK TO VYOM
            </button>
            <button
              onClick={handleGoToArchive}
              className="btn btn-lg"
              style={{ padding: '12px 22px', fontSize: 11, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', cursor: 'pointer' }}
            >
              ▫ VIEW ARCHIVE
            </button>
            <button
              onClick={() => setScreen('replay')}
              className="btn btn-lg"
              style={{ padding: '12px 22px', fontSize: 11, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', cursor: 'pointer' }}
            >
              ▶ REPLAY MISSION
            </button>
            <button
              onClick={() => setScreen('reports')}
              className="btn btn-lg"
              style={{ padding: '12px 22px', fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
            >
              ≡ PDF REPORT
            </button>
            <button
              onClick={() => setScreen('academy')}
              className="btn btn-lg"
              style={{ padding: '12px 22px', fontSize: 11, background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.35)', color: '#00ff88', cursor: 'pointer' }}
            >
              🎮 ACADEMY
            </button>
            <button
              onClick={handleNewMission}
              className="btn btn-lg"
              style={{ padding: '12px 22px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
            >
              + NEW MISSION
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

