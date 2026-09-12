/**
 * VYOM — Gamified Satellite Overview & Mission Video Player (Academy Stage 05)
 * Seamlessly merges user-uploaded satellite overview broadcasts:
 * 1. Orbital Observation Satellite Overview (Earth Observation / Radar / LEO)
 * 2. Human Exploration Mission Satellite Overview (Crewed Habitat / Life Support Relay)
 * 3. Planetary & Astrophysics Mission Satellite Overview (Deep Space / Cosmic Probes)
 *
 * Supports continuous auto-play merged broadcast, direct segment switching,
 * aerospace telemetry HUD, and seamless progression to Mission Operations.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamifiedStore } from '../../../store/gamifiedStore';

interface SatelliteVideoSegment {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  category: string;
  tag: string;
  videoSrc: string;
  icon: string;
  accentColor: string;
  description: string;
  primaryRole: string;
  specifications: { label: string; value: string }[];
  keyPayloads: string[];
  aiMessage: string;
}

const SATELLITE_SEGMENTS: SatelliteVideoSegment[] = [
  {
    id: 'orbital-observation',
    num: '01',
    title: 'Orbital Observation Satellite Overview',
    shortTitle: 'Orbital Observation',
    category: 'Earth Observation & Remote Sensing',
    tag: 'EARTH OBSERVATION // LEO',
    videoSrc: '/animations/Orbital obervation satellite overview.mp4',
    icon: '📡',
    accentColor: '#00d4ff',
    description:
      'High-resolution multi-spectral earth observation platform equipped with Synthetic Aperture Radar (SAR) and thermal radiometers for real-time weather, flood mapping, and environmental tracking.',
    primaryRole: '24/7 Planetary surface scanning and cloud-penetrating radar remote sensing in Low Earth Orbit.',
    specifications: [
      { label: 'OPERATING ORBIT', value: 'LEO (500 - 800 km)' },
      { label: 'INCLINATION', value: '98.2° Sun-Synchronous' },
      { label: 'VELOCITY', value: '7.52 km/s' },
      { label: 'GROUND RESOLUTION', value: '0.8 m / pixel' },
    ],
    keyPayloads: [
      'Synthetic Aperture Radar (SAR)',
      'High-Resolution Optical Camera',
      'Infrared Thermal Radiometer',
      'Multispectral Atmospheric Sounder',
    ],
    aiMessage:
      'Reviewing the Orbital Observation Satellite! Notice how its solar wings power active radar chirps to image ground floods and cyclones through thick cloud cover.',
  },
  {
    id: 'human-exploration',
    num: '02',
    title: 'Human Exploration Satellite Overview',
    shortTitle: 'Human Exploration',
    category: 'Crewed Spacecraft & Habitat Relay',
    tag: 'CREWED MISSIONS // HABITAT',
    videoSrc: '/animations/Human exploration staellite overview.mp4',
    icon: '🧑‍🚀',
    accentColor: '#00ff88',
    description:
      'Mission-critical spacecraft infrastructure engineered for astronaut safety, life-support telemetry monitoring (ECLSS), autonomous rendezvous docking, and high-gain ground communication relays.',
    primaryRole: 'Astronaut module guidance, station communications, and orbital crew telemetry logistics.',
    specifications: [
      { label: 'OPERATING ORBIT', value: 'LEO / Crew Orbit (400 - 450 km)' },
      { label: 'INCLINATION', value: '51.6° Station Path' },
      { label: 'VELOCITY', value: '7.66 km/s' },
      { label: 'COMMS BANDWIDTH', value: '1.2 Gbps Phased Array' },
    ],
    keyPayloads: [
      'ECLSS Life Support Telemetry',
      'High-Gain Steering Phased Array',
      'Autonomous Optical Docking Lidar',
      'Thermal Re-entry Shield Sensors',
    ],
    aiMessage:
      'Inspecting the Human Exploration Mission Satellite: this vehicle is built for human spaceflight support, high-gain communication links, and astronaut habitat systems.',
  },
  {
    id: 'astrophysics-planetary',
    num: '03',
    title: 'Planetary & Astrophysics Satellite Overview',
    shortTitle: 'Astrophysics & Planetary',
    category: 'Deep Space Exploration & Cosmic Observatory',
    tag: 'DEEP SPACE // ASTROPHYSICS',
    videoSrc: '/animations/astrophysics and planetory mission satellite.mp4',
    icon: '🔭',
    accentColor: '#a855f7',
    description:
      'Deep-space scientific explorer equipped with high-precision optical telescopes, cosmic ray spectrometers, and interplanetary navigation sensors to study distant planets and cosmic origins.',
    primaryRole: 'Cosmic radiation analysis, planetary exploration, gravitational studies, and deep-space science.',
    specifications: [
      { label: 'OPERATING ORBIT', value: 'Lagrange L2 / Interplanetary' },
      { label: 'DISTANCE', value: '1,500,000 km from Earth' },
      { label: 'VELOCITY', value: '11.2 km/s (Escape Trajectory)' },
      { label: 'DETECTOR COOLING', value: 'Liquid Helium Cryo 4.2K' },
    ],
    keyPayloads: [
      'Deep Space Optical & IR Telescope',
      'Cosmic Ray & Particle Spectrometer',
      'Magnetometer Deployable Boom',
      'Ion Thruster Propulsion Matrix',
    ],
    aiMessage:
      'Examining the Planetary & Astrophysics Satellite: designed for deep space voyages and astrophysics sensors to explore distant planetary bodies and cosmic rays.',
  },
];

export function LaunchSimulationStep() {
  const setStage = useGamifiedStore((s) => s.setStage);
  const setAiMessage = useGamifiedStore((s) => s.setAiMessage);
  const selectedMissionId = useGamifiedStore((s) => s.selectedMissionId);

  // Determine initial segment based on selected mission
  const initialIndex = React.useMemo(() => {
    if (selectedMissionId === 'flood-monitoring' || selectedMissionId === 'earth-mapping' || selectedMissionId === 'weather-monitoring') {
      return 0;
    }
    if (selectedMissionId === 'communication') {
      return 1;
    }
    if (selectedMissionId === 'forest-fire') {
      return 2;
    }
    return 0;
  }, [selectedMissionId]);

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(initialIndex);
  const [isMergedContinuous, setIsMergedContinuous] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isHudOpen, setIsHudOpen] = useState(true);
  const [transitionNotice, setTransitionNotice] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSegment = SATELLITE_SEGMENTS[currentSegmentIndex];

  // Update AI Mentor message when segment changes
  useEffect(() => {
    if (currentSegment) {
      setAiMessage(currentSegment.aiMessage, 'happy');
    }
  }, [currentSegmentIndex]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Autoplay policy fallback: mute and play
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  };

  const handleVideoEnded = () => {
    if (isMergedContinuous) {
      if (currentSegmentIndex < SATELLITE_SEGMENTS.length - 1) {
        const nextIndex = currentSegmentIndex + 1;
        setTransitionNotice(`Advancing to Segment 0${nextIndex + 1}: ${SATELLITE_SEGMENTS[nextIndex].shortTitle}...`);
        setTimeout(() => {
          setTransitionNotice(null);
          setCurrentSegmentIndex(nextIndex);
          setIsPlaying(true);
        }, 1200);
      } else {
        // Completed all 3 merged segments!
        setAiMessage(
          'Merged satellite mission briefing complete! You have reviewed all orbital, human, and planetary satellite architectures. Ready for live operations!',
          'happy'
        );
        setTransitionNotice('Broadcast Complete! All 3 Satellite Overviews Watched.');
        setTimeout(() => setTransitionNotice(null), 3000);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const selectSegment = (index: number) => {
    setCurrentSegmentIndex(index);
    setIsPlaying(true);
    setTransitionNotice(null);
  };

  const handleNextStage = () => {
    setStage('mission-simulation');
    setAiMessage(
      'Satellite systems active and operational in orbit! Standby for live telemetry feeds and orbital flight challenges.',
      'happy'
    );
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#020409',
        color: '#ffffff',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      {/* ── TOP MERGED PLAYLIST & SEGMENT TABS BAR ── */}
      <div
        style={{
          padding: '8px 16px',
          background: 'rgba(5, 12, 28, 0.94)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexShrink: 0,
          zIndex: 25,
          backdropFilter: 'blur(12px)',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Segment Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {SATELLITE_SEGMENTS.map((seg, idx) => {
            const isActive = currentSegmentIndex === idx;
            return (
              <button
                key={seg.id}
                onClick={() => selectSegment(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '5px 12px',
                  borderRadius: 6,
                  border: isActive
                    ? `1px solid ${seg.accentColor}`
                    : '1px solid rgba(255,255,255,0.12)',
                  background: isActive ? `${seg.accentColor}22` : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  fontWeight: isActive ? 800 : 600,
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 12px ${seg.accentColor}44` : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{seg.icon}</span>
                <span>
                  {seg.num}. {seg.shortTitle.toUpperCase()}
                </span>
                {isActive && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: seg.accentColor,
                      boxShadow: `0 0 6px ${seg.accentColor}`,
                      display: 'inline-block',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Merged Mode Toggle & Segment Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setIsMergedContinuous(!isMergedContinuous)}
            title={
              isMergedContinuous
                ? 'Continuous broadcast enabled: Auto-advances across all 3 videos'
                : 'Single clip mode: Will stop when video finishes'
            }
            style={{
              padding: '5px 11px',
              borderRadius: 6,
              border: isMergedContinuous
                ? '1px solid rgba(0, 255, 136, 0.4)'
                : '1px solid rgba(255,255,255,0.15)',
              background: isMergedContinuous ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.04)',
              color: isMergedContinuous ? '#00ff88' : 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{isMergedContinuous ? '🔁' : '⏹️'}</span>
            <span>{isMergedContinuous ? 'MERGED BROADCAST: ON' : 'PLAY ALL: OFF'}</span>
          </button>

          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-mono, monospace)',
              color: 'rgba(255,255,255,0.5)',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 8px',
              borderRadius: 4,
            }}
          >
            SEGMENT {currentSegmentIndex + 1} / {SATELLITE_SEGMENTS.length}
          </span>
        </div>
      </div>

      {/* ── MAIN CINEMATIC VIDEO WORKSPACE ── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#010204',
          overflow: 'hidden',
        }}
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          key={currentSegment.videoSrc}
          src={currentSegment.videoSrc}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnded}
          onClick={togglePlay}
          playsInline
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
        />

        {/* Transition / Status Notification Toast */}
        <AnimatePresence>
          {transitionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 40,
                background: 'rgba(5, 12, 28, 0.92)',
                border: '1px solid #00d4ff',
                borderRadius: 8,
                padding: '10px 20px',
                color: '#00d4ff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 12,
                fontWeight: 700,
                boxShadow: '0 0 24px rgba(0, 212, 255, 0.35)',
                backdropFilter: 'blur(12px)',
                pointerEvents: 'none',
              }}
            >
              🚀 {transitionNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top-Left Satellite Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 20,
            background: 'rgba(5, 12, 28, 0.85)',
            border: `1px solid ${currentSegment.accentColor}55`,
            borderRadius: 8,
            padding: '8px 14px',
            backdropFilter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--font-mono, monospace)',
              color: currentSegment.accentColor,
              fontWeight: 800,
              letterSpacing: '0.12em',
            }}
          >
            {currentSegment.tag}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', marginTop: 2 }}>
            {currentSegment.title}
          </div>
        </div>

        {/* Floating Telemetry & Specification HUD (Left) */}
        <AnimatePresence>
          {isHudOpen && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 75,
                left: 14,
                zIndex: 20,
                width: 320,
                background: 'rgba(5, 12, 28, 0.88)',
                border: '1px solid rgba(0, 212, 255, 0.22)',
                borderRadius: 12,
                padding: '14px 16px',
                backdropFilter: 'blur(14px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: currentSegment.accentColor,
                    fontWeight: 800,
                  }}
                >
                  SPACECRAFT TELEMETRY SPECIFICATION
                </span>
                <button
                  onClick={() => setIsHudOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0,
                  }}
                  title="Close specifications drawer"
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                {currentSegment.description}
              </p>

              {/* 4 Telemetry Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                {currentSegment.specifications.map((spec) => (
                  <div
                    key={spec.label}
                    style={{
                      background: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 6,
                      padding: '6px 8px',
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        fontSize: 8.5,
                        fontFamily: 'var(--font-mono, monospace)',
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {spec.label}
                    </span>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 10.5,
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        color: '#ffffff',
                        marginTop: 1,
                      }}
                    >
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Onboard Payloads List */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'rgba(255,255,255,0.5)',
                    display: 'block',
                    marginBottom: 5,
                  }}
                >
                  ACTIVE SCIENTIFIC PAYLOADS:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {currentSegment.keyPayloads.map((payload) => (
                    <span
                      key={payload}
                      style={{
                        fontSize: 9,
                        fontFamily: 'var(--font-mono, monospace)',
                        background: 'rgba(0, 212, 255, 0.08)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        color: '#7dd3fc',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {payload}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle HUD button if closed */}
        {!isHudOpen && (
          <button
            onClick={() => setIsHudOpen(true)}
            style={{
              position: 'absolute',
              top: 75,
              left: 14,
              zIndex: 20,
              background: 'rgba(5, 12, 28, 0.85)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: 6,
              color: '#00d4ff',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 10,
              fontWeight: 700,
              padding: '6px 10px',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
            }}
          >
            📊 SHOW SATELLITE SPECS
          </button>
        )}

        {/* Center Pause Play Indicator when paused */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(0, 212, 255, 0.25)',
              border: '2px solid #00d4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(0, 212, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              zIndex: 22,
            }}
          >
            <span style={{ fontSize: 24, marginLeft: 4, color: '#00d4ff' }}>▶</span>
          </div>
        )}
      </div>

      {/* ── BOTTOM AEROSPACE CONTROLS DOCK ── */}
      <div
        style={{
          padding: '10px 16px',
          background: 'rgba(5, 12, 28, 0.96)',
          borderTop: '1px solid rgba(0, 212, 255, 0.18)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flexShrink: 0,
          zIndex: 30,
          backdropFilter: 'blur(14px)',
        }}
      >
        {/* Timeline Scrubber & Timestamps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', color: '#00d4ff', minWidth: 38 }}>
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            style={{
              flex: 1,
              accentColor: currentSegment.accentColor,
              cursor: 'pointer',
              height: 4,
            }}
          />

          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono, monospace)', color: 'rgba(255,255,255,0.4)', minWidth: 38 }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          {/* Left: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Prev Segment */}
            <button
              onClick={() => selectSegment(Math.max(0, currentSegmentIndex - 1))}
              disabled={currentSegmentIndex === 0}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: currentSegmentIndex === 0 ? 'rgba(255,255,255,0.2)' : '#ffffff',
                cursor: currentSegmentIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: 11,
              }}
              title="Previous Satellite Video"
            >
              ⏮ PREV
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: `1px solid ${currentSegment.accentColor}88`,
                background: `${currentSegment.accentColor}22`,
                color: '#ffffff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            {/* Next Segment */}
            <button
              onClick={() => selectSegment(Math.min(SATELLITE_SEGMENTS.length - 1, currentSegmentIndex + 1))}
              disabled={currentSegmentIndex === SATELLITE_SEGMENTS.length - 1}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: currentSegmentIndex === SATELLITE_SEGMENTS.length - 1 ? 'rgba(255,255,255,0.2)' : '#ffffff',
                cursor: currentSegmentIndex === SATELLITE_SEGMENTS.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: 11,
              }}
              title="Next Satellite Video"
            >
              NEXT ⏭
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: isMuted ? '#ff9f0a' : '#ffffff',
                cursor: 'pointer',
                fontSize: 11,
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? '🔇 MUTED' : '🔊 AUDIO'}
            </button>

            {/* Speed Toggle */}
            <button
              onClick={handleSpeedChange}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#38bdf8',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Change Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreen}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.05)',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="Fullscreen"
            >
              ⛶
            </button>
          </div>

          {/* Right: Proceed to Next Stage (Stage 06 - Mission Operations) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={handleNextStage}
              style={{
                padding: '9px 18px',
                borderRadius: 7,
                border: 'none',
                background: 'linear-gradient(90deg, #00d4ff, #0284c7)',
                color: '#020409',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.04em',
                boxShadow: '0 0 16px rgba(0, 212, 255, 0.45)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              <span>ENTER MISSION OPERATIONS</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
