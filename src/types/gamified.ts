/**
 * VYOM — Gamified Learning Mode Type Definitions
 * Designed for students, young researchers, and space enthusiasts.
 */

export type GamifiedStage =
  | 'choose-mission'
  | 'design-satellite'
  | 'explore-satellite'
  | 'select-orbit'
  | 'test-design'
  | 'launch-simulation'
  | 'mission-simulation'
  | 'mission-results';

export type GamifiedMissionId =
  | 'flood-monitoring'
  | 'weather-monitoring'
  | 'communication'
  | 'forest-fire'
  | 'earth-mapping';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface GamifiedMission {
  id: GamifiedMissionId;
  title: string;
  tagline: string;
  category: string;
  difficulty: DifficultyLevel;
  icon: string;
  objective: string;
  satelliteTask: string;
  recommendedPayload: string;
  recommendedOrbit: 'LEO' | 'MEO' | 'GEO';
  whyOrbit: string;
  whyPayload: string;
  aiIntro: string;
  badge: string;
  accentColor: string;
}

// ── Satellite Components ──────────────────────────────────────────────────────

export type PayloadOptionId = 'optical-camera' | 'thermal-sensor' | 'radar';
export type PowerOptionId = 'standard-solar' | 'advanced-solar';
export type CommsOptionId = 'basic-antenna' | 'high-gain-antenna';
export type ControlOptionId = 'basic-control' | 'advanced-control';

export interface SatelliteComponentItem {
  id: string;
  category: 'payload' | 'power' | 'communication' | 'control';
  name: string;
  icon: string;
  subtitle: string;
  weightKg: number;
  powerUsageW: number; // positive = consumes, negative = generates
  fuelUsageKg: number;
  purpose: string;
  howItWorks: string;
  suitableMissions: GamifiedMissionId[];
  suitabilityExplanations: Record<GamifiedMissionId, string>;
}

export interface SatelliteDesignState {
  payload: PayloadOptionId | null;
  power: PowerOptionId | null;
  communication: CommsOptionId | null;
  control: ControlOptionId | null;
}

export type SatelliteViewMode = 'assembled' | 'exploded' | 'internal';

// ── Orbits ───────────────────────────────────────────────────────────────────

export type OrbitType = 'LEO' | 'MEO' | 'GEO';

export interface OrbitDefinition {
  type: OrbitType;
  name: string;
  altitudeKm: string;
  orbitalPeriod: string;
  coverageDescription: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  groundResolution: 'Ultra-High (< 1m)' | 'Medium (10-50m)' | 'Broad Regional (500m+)';
  recommendedForMissions: GamifiedMissionId[];
}

// ── Diagnostics & Testing ───────────────────────────────────────────────────

export interface DiagnosticCategory {
  name: string;
  score: number; // 0 - 100
  status: 'optimal' | 'acceptable' | 'suboptimal' | 'critical';
  title: string;
  explanation: string;
  recommendation?: string;
}

export interface PreFlightTestReport {
  overallScore: number;
  isFlightReady: boolean;
  payloadSuitability: DiagnosticCategory;
  powerEfficiency: DiagnosticCategory;
  commsStrength: DiagnosticCategory;
  weightBalance: DiagnosticCategory;
  fuelUsage: DiagnosticCategory;
  orbitCompatibility: DiagnosticCategory;
  summaryFeedback: string;
}

// ── Launch Stages ────────────────────────────────────────────────────────────

export type LaunchPhaseIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface LaunchStageInfo {
  index: LaunchPhaseIndex;
  name: string;
  label: string;
  description: string;
  altitudeKm: number;
  velocityKms: number;
  telemetryMsg: string;
}

// ── In-Mission Challenges ───────────────────────────────────────────────────

export type ChallengeId =
  | 'solar-panel-damage'
  | 'communication-failure'
  | 'low-power'
  | 'orbit-deviation'
  | 'sensor-failure';

export interface ChallengeOption {
  id: string;
  label: string;
  description: string;
  isRecommended: boolean;
  healthDelta: number;
  powerDelta: number;
  commsDelta: number;
  feedback: string;
  realWorldAnalogy: string;
}

export interface SpaceChallenge {
  id: ChallengeId;
  title: string;
  system: 'power' | 'communication' | 'attitude' | 'orbit' | 'payload';
  visualEffect: 'solar-sparks' | 'signal-loss' | 'battery-drain' | 'orbit-drift' | 'sensor-glitch';
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  options: ChallengeOption[];
}

// ── Metrics & Consequence System ─────────────────────────────────────────────

export interface LiveMissionMetrics {
  health: number; // 0 - 100
  power: number;  // 0 - 100
  communication: number; // 0 - 100
  satelliteStatus: 'Nominal' | 'Degraded' | 'Critical' | 'Recovered';
  missionProgress: number; // 0 - 100
}

// ── Mission Results & Scoring ────────────────────────────────────────────────

export interface MissionResultReport {
  overallScore: number; // 0 - 1000
  grade: 'S' | 'A' | 'B' | 'C';
  designScore: number;     // 0 - 250
  resourceScore: number;   // 0 - 200
  orbitScore: number;      // 0 - 200
  decisionScore: number;   // 0 - 250
  efficiencyScore: number; // 0 - 100
  thingsDoneWell: string[];
  mistakesMade: string[];
  keyLearnings: string[];
  aiRecommendations: string[];
}

// ── Adaptive Learning State ──────────────────────────────────────────────────

export interface AdaptiveLearningProfile {
  totalMissionsCompleted: number;
  weakSubsystems: ('payload' | 'power' | 'communication' | 'control' | 'orbit')[];
  strongSubsystems: ('payload' | 'power' | 'communication' | 'control' | 'orbit')[];
  hintSensitivity: 'verbose' | 'balanced' | 'autonomous';
  struggleCount: number;
}
