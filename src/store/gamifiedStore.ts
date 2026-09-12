/**
 * VYOM — Gamified Learning Mode Zustand Store
 * Clean, modular state management for mission design, 3D visualization,
 * resource tracking, AI diagnostics, launch simulation, and adaptive scoring.
 */

import { create } from 'zustand';
import type {
  GamifiedStage,
  GamifiedMissionId,
  PayloadOptionId,
  PowerOptionId,
  CommsOptionId,
  ControlOptionId,
  SatelliteDesignState,
  SatelliteViewMode,
  OrbitType,
  PreFlightTestReport,
  LaunchPhaseIndex,
  LiveMissionMetrics,
  MissionResultReport,
  AdaptiveLearningProfile,
} from '../types/gamified';
import {
  GAMIFIED_MISSIONS,
  SATELLITE_COMPONENTS,
  ORBIT_DEFINITIONS,
  SPACE_CHALLENGES,
} from '../constants/gamifiedData';

export interface GamifiedResources {
  credits: 'unlimited';
  maxWeightKg: number;
  currentWeightKg: number;
  powerGenerationW: number;
  powerConsumptionW: number;
  netPowerW: number;
  maxFuelKg: number;
  currentFuelKg: number;
  isOverweight: boolean;
  isPowerDeficient: boolean;
  isFuelDeficient: boolean;
}

interface GamifiedStoreState {
  // Navigation & Mission
  stage: GamifiedStage;
  selectedMissionId: GamifiedMissionId;
  
  // Satellite Design & 3D Visualizer
  design: SatelliteDesignState;
  viewMode: SatelliteViewMode;
  explodeProgress: number; // 0.0 to 1.0
  inspectedComponentId: string | null;
  
  // Orbit Selection
  selectedOrbit: OrbitType | null;
  acceptedAiOrbit: boolean;

  // Pre-Flight Diagnostics
  preFlightReport: PreFlightTestReport | null;

  // 7-Stage Launch
  launchPhase: LaunchPhaseIndex;
  isLaunchPlaying: boolean;

  // In-Mission Challenges & Metrics
  activeChallengeIndex: number;
  completedChallenges: string[];
  challengeDecisions: { challengeId: string; optionId: string; isRecommended: boolean }[];
  liveMetrics: LiveMissionMetrics;

  // Floating VYOM AI Assistant
  aiMessage: string;
  aiMood: 'neutral' | 'happy' | 'thinking' | 'warning';
  isAiExpanded: boolean;

  // Adaptive Learning & Final Results
  adaptiveProfile: AdaptiveLearningProfile;
  finalResults: MissionResultReport | null;

  // Computed Resources
  getResources: () => GamifiedResources;

  // Actions
  setStage: (stage: GamifiedStage) => void;
  selectMission: (missionId: GamifiedMissionId) => void;
  setComponent: (category: 'payload' | 'power' | 'communication' | 'control', id: string) => void;
  setViewMode: (mode: SatelliteViewMode) => void;
  setExplodeProgress: (val: number) => void;
  setInspectedComponent: (id: string | null) => void;
  selectOrbit: (orbit: OrbitType) => void;
  acceptAiOrbit: () => void;
  runPreFlightTest: () => PreFlightTestReport;
  setLaunchPhase: (phase: LaunchPhaseIndex) => void;
  setIsLaunchPlaying: (playing: boolean) => void;
  answerChallenge: (optionId: string) => void;
  nextChallenge: () => void;
  setAiMessage: (msg: string, mood?: 'neutral' | 'happy' | 'thinking' | 'warning') => void;
  toggleAiExpanded: () => void;
  calculateFinalScores: () => MissionResultReport;
  resetGamifiedMission: () => void;
}

const DEFAULT_DESIGN: SatelliteDesignState = {
  payload: null,
  power: null,
  communication: null,
  control: null,
};

const DEFAULT_METRICS: LiveMissionMetrics = {
  health: 100,
  power: 100,
  communication: 100,
  satelliteStatus: 'Nominal',
  missionProgress: 0,
};

export const useGamifiedStore = create<GamifiedStoreState>((set, get) => ({
  stage: 'choose-mission',
  selectedMissionId: 'flood-monitoring',

  design: { ...DEFAULT_DESIGN },
  viewMode: 'assembled',
  explodeProgress: 0.0,
  inspectedComponentId: 'optical-camera',

  selectedOrbit: null,
  acceptedAiOrbit: false,

  preFlightReport: null,

  launchPhase: 1,
  isLaunchPlaying: false,

  activeChallengeIndex: 0,
  completedChallenges: [],
  challengeDecisions: [],
  liveMetrics: { ...DEFAULT_METRICS },

  aiMessage:
    'Welcome to the VYOM Satellite Academy! Choose an active space mission to begin your aerospace journey.',
  aiMood: 'happy',
  isAiExpanded: true,

  adaptiveProfile: {
    totalMissionsCompleted: 0,
    weakSubsystems: [],
    strongSubsystems: [],
    hintSensitivity: 'verbose',
    struggleCount: 0,
  },
  finalResults: null,

  // Live dynamic resource calculations
  getResources: () => {
    const { design } = get();
    const baseBusWeight = 120; // kg for structural bus frame & avionics
    const basePowerConsumption = 20; // W for onboard computer & sensors
    const baseFuel = 20; // kg default propellant reserve

    let componentWeight = 0;
    let powerGeneration = 0;
    let powerConsumption = basePowerConsumption;
    let fuelUsage = baseFuel;

    Object.values(design).forEach((compKey) => {
      if (!compKey) return;
      const comp = SATELLITE_COMPONENTS[compKey];
      if (!comp) return;

      componentWeight += comp.weightKg;
      if (comp.powerUsageW < 0) {
        powerGeneration += Math.abs(comp.powerUsageW);
      } else {
        powerConsumption += comp.powerUsageW;
      }
      fuelUsage += comp.fuelUsageKg;
    });

    const currentWeightKg = baseBusWeight + componentWeight;
    const maxWeightKg = 400; // SmallSat launch vehicle payload fairing limit
    const maxFuelKg = 80;

    const netPowerW = powerGeneration - powerConsumption;

    return {
      credits: 'unlimited',
      maxWeightKg,
      currentWeightKg,
      powerGenerationW: powerGeneration,
      powerConsumptionW: powerConsumption,
      netPowerW,
      maxFuelKg,
      currentFuelKg: fuelUsage,
      isOverweight: currentWeightKg > maxWeightKg,
      isPowerDeficient: powerGeneration < powerConsumption,
      isFuelDeficient: fuelUsage > maxFuelKg,
    };
  },

  setStage: (stage) => set({ stage }),

  selectMission: (missionId) => {
    const mission = GAMIFIED_MISSIONS.find((m) => m.id === missionId);
    set({
      selectedMissionId: missionId,
      design: { ...DEFAULT_DESIGN },
      selectedOrbit: null,
      acceptedAiOrbit: false,
      preFlightReport: null,
      launchPhase: 1,
      liveMetrics: { ...DEFAULT_METRICS },
      aiMessage: mission
        ? `Great mission choice! For ${mission.title}: ${mission.aiIntro}`
        : 'Select your mission parameters to begin.',
      aiMood: 'happy',
    });
  },

  setComponent: (category, id) => {
    const comp = SATELLITE_COMPONENTS[id];
    const { selectedMissionId, design } = get();
    const newDesign = { ...design, [category]: id };

    let aiFeedback = '';
    let aiMood: 'happy' | 'thinking' | 'warning' = 'happy';

    if (comp) {
      const isSuitable = comp.suitableMissions.includes(selectedMissionId);
      const explanation = comp.suitabilityExplanations[selectedMissionId];
      if (isSuitable) {
        aiFeedback = `Excellent pick! ${comp.name}: ${explanation}`;
        aiMood = 'happy';
      } else {
        aiFeedback = `Attention engineer: ${explanation}`;
        aiMood = 'warning';
      }
    }

    set({
      design: newDesign,
      inspectedComponentId: id,
      aiMessage: aiFeedback,
      aiMood,
    });
  },

  setViewMode: (mode) => {
    let progress = 0.0;
    if (mode === 'exploded') progress = 1.0;
    if (mode === 'assembled') progress = 0.0;
    set({ viewMode: mode, explodeProgress: progress });
  },

  setExplodeProgress: (val) => set({ explodeProgress: Math.max(0, Math.min(1, val)) }),

  setInspectedComponent: (id) => set({ inspectedComponentId: id }),

  selectOrbit: (orbit) => {
    const { selectedMissionId } = get();
    const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
    const orbitDef = ORBIT_DEFINITIONS[orbit];

    let aiComment = '';
    let aiMood: 'happy' | 'warning' | 'thinking' = 'thinking';

    if (mission && orbit === mission.recommendedOrbit) {
      aiComment = `Spot on! ${orbitDef.name} is the optimal orbit for ${mission.title}. ${mission.whyOrbit}`;
      aiMood = 'happy';
    } else {
      aiComment = `You chose ${orbitDef.name}. For ${mission?.title}, our primary recommendation is ${mission?.recommendedOrbit} because ${mission?.whyOrbit}`;
      aiMood = 'warning';
    }

    set({
      selectedOrbit: orbit,
      aiMessage: aiComment,
      aiMood,
    });
  },

  acceptAiOrbit: () => {
    const { selectedMissionId } = get();
    const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
    if (!mission) return;

    set({
      selectedOrbit: mission.recommendedOrbit,
      acceptedAiOrbit: true,
      aiMessage: `AI recommendation accepted: ${mission.recommendedOrbit} orbit locked in! ${mission.whyOrbit}`,
      aiMood: 'happy',
    });
  },

  runPreFlightTest: () => {
    const { design, selectedMissionId, selectedOrbit, getResources } = get();
    const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);
    const res = getResources();

    // 1. Payload Suitability
    const payloadComp = design.payload ? SATELLITE_COMPONENTS[design.payload] : null;
    const isPayloadMatch = payloadComp?.suitableMissions.includes(selectedMissionId);
    const payloadScore = !payloadComp ? 0 : isPayloadMatch ? 98 : 45;
    const payloadCat = {
      name: 'Payload Suitability',
      score: payloadScore,
      status: (payloadScore > 80 ? 'optimal' : payloadScore > 50 ? 'acceptable' : 'suboptimal') as any,
      title: payloadComp ? payloadComp.name : 'No Payload Selected',
      explanation: payloadComp
        ? payloadComp.suitabilityExplanations[selectedMissionId]
        : 'Your satellite cannot complete its mission without a primary instrument.',
      recommendation: !isPayloadMatch ? `Recommended: ${mission?.recommendedPayload}` : undefined,
    };

    // 2. Power Efficiency
    const powerScore = res.isPowerDeficient ? 35 : res.netPowerW > 50 ? 95 : 75;
    const powerCat = {
      name: 'Power Balance & Capacity',
      score: powerScore,
      status: (res.isPowerDeficient ? 'critical' : powerScore > 80 ? 'optimal' : 'acceptable') as any,
      title: `${res.powerGenerationW}W Generated vs ${res.powerConsumptionW}W Consumed`,
      explanation: res.isPowerDeficient
        ? `Warning: Instruments consume ${res.powerConsumptionW}W but solar panels only generate ${res.powerGenerationW}W. The satellite will deplete its batteries rapidly in orbit!`
        : `Healthy power margin of +${res.netPowerW}W surplus to charge batteries during sunny passes.`,
      recommendation: res.isPowerDeficient ? 'Upgrade to Advanced Solar Arrays for higher energy generation.' : undefined,
    };

    // 3. Communication Strength
    const commsComp = design.communication ? SATELLITE_COMPONENTS[design.communication] : null;
    const commsScore = !commsComp ? 0 : commsComp.id === 'high-gain-antenna' ? 95 : 65;
    const commsCat = {
      name: 'Communication Link Strength',
      score: commsScore,
      status: (commsScore > 80 ? 'optimal' : commsScore > 50 ? 'acceptable' : 'critical') as any,
      title: commsComp ? commsComp.name : 'No Antenna Selected',
      explanation: commsComp
        ? commsComp.suitabilityExplanations[selectedMissionId]
        : 'Radio connection missing. Ground controllers will be unable to command the satellite.',
      recommendation: commsComp?.id === 'basic-antenna' && selectedMissionId === 'communication'
        ? 'Upgrade to High-Gain Dish for broadband mission requirements.'
        : undefined,
    };

    // 4. Weight Balance
    const weightScore = res.isOverweight ? 30 : res.currentWeightKg < 280 ? 95 : 80;
    const weightCat = {
      name: 'Total Spacecraft Mass',
      score: weightScore,
      status: (res.isOverweight ? 'critical' : weightScore > 85 ? 'optimal' : 'acceptable') as any,
      title: `${res.currentWeightKg} kg / ${res.maxWeightKg} kg Capacity`,
      explanation: res.isOverweight
        ? `Overweight by ${res.currentWeightKg - res.maxWeightKg} kg! The rocket cannot lift this payload into target orbit.`
        : `Weight is well within the ${res.maxWeightKg} kg launcher fairing lift capacity.`,
    };

    // 5. Fuel Reserve
    const controlComp = design.control ? SATELLITE_COMPONENTS[design.control] : null;
    const fuelScore = !controlComp ? 40 : controlComp.id === 'advanced-control' ? 95 : 80;
    const fuelCat = {
      name: 'Attitude Control & Propellant',
      score: fuelScore,
      status: (fuelScore > 80 ? 'optimal' : 'acceptable') as any,
      title: `${res.currentFuelKg} kg Propellant Reserve`,
      explanation: controlComp
        ? controlComp.suitabilityExplanations[selectedMissionId]
        : 'Basic drift stabilization. Advanced RCS thrusters allow emergency collision avoidance and precision pointing.',
    };

    // 6. Orbit Compatibility
    const isOrbitMatch = selectedOrbit === mission?.recommendedOrbit;
    const orbitScore = !selectedOrbit ? 0 : isOrbitMatch ? 100 : 55;
    const orbitCat = {
      name: 'Orbital Path Compatibility',
      score: orbitScore,
      status: (!selectedOrbit ? 'critical' : isOrbitMatch ? 'optimal' : 'suboptimal') as any,
      title: selectedOrbit ? `${selectedOrbit} Orbit` : 'Orbit Unassigned',
      explanation: selectedOrbit
        ? isOrbitMatch
          ? `${selectedOrbit} is the ideal operating regime for this mission profile. ${mission?.whyOrbit}`
          : `${selectedOrbit} provides suboptimal coverage geometry for ${mission?.title}. Recommended: ${mission?.recommendedOrbit}.`
        : 'Spacecraft has not been assigned to an orbital trajectory.',
      recommendation: !isOrbitMatch ? `Switch to ${mission?.recommendedOrbit}` : undefined,
    };

    const overallScore = Math.round(
      (payloadScore * 0.25) +
      (powerScore * 0.2) +
      (commsScore * 0.15) +
      (weightScore * 0.15) +
      (fuelScore * 0.1) +
      (orbitScore * 0.15)
    );

    const isFlightReady = overallScore >= 65 && !res.isOverweight && !res.isPowerDeficient;

    const report: PreFlightTestReport = {
      overallScore,
      isFlightReady,
      payloadSuitability: payloadCat,
      powerEfficiency: powerCat,
      commsStrength: commsCat,
      weightBalance: weightCat,
      fuelUsage: fuelCat,
      orbitCompatibility: orbitCat,
      summaryFeedback: isFlightReady
        ? `VYOM AI Pre-Flight Diagnostic: Your mission design achieves a readiness index of ${overallScore}/100! Core subsystems are balanced and flight-ready.`
        : `VYOM AI Pre-Flight Diagnostic: Mission Readiness is ${overallScore}/100. Resolve the critical highlighted warnings before proceeding to launch.`,
    };

    set({ preFlightReport: report });
    return report;
  },

  setLaunchPhase: (phase) => {
    set({ launchPhase: phase });
  },

  setIsLaunchPlaying: (playing) => set({ isLaunchPlaying: playing }),

  answerChallenge: (optionId) => {
    const { activeChallengeIndex, challengeDecisions, liveMetrics } = get();
    const challenge = SPACE_CHALLENGES[activeChallengeIndex];
    if (!challenge) return;

    const chosenOption = challenge.options.find((o) => o.id === optionId);
    if (!chosenOption) return;

    const newDecisions = [
      ...challengeDecisions,
      {
        challengeId: challenge.id,
        optionId,
        isRecommended: chosenOption.isRecommended,
      },
    ];

    const newHealth = Math.max(15, Math.min(100, liveMetrics.health + chosenOption.healthDelta));
    const newPower = Math.max(10, Math.min(100, liveMetrics.power + chosenOption.powerDelta));
    const newComms = Math.max(10, Math.min(100, liveMetrics.communication + chosenOption.commsDelta));

    let satelliteStatus: 'Nominal' | 'Degraded' | 'Critical' | 'Recovered' = 'Nominal';
    if (newHealth < 40 || newPower < 30) satelliteStatus = 'Critical';
    else if (newHealth < 75 || newPower < 60) satelliteStatus = 'Degraded';
    else if (chosenOption.isRecommended) satelliteStatus = 'Recovered';

    const progressStep = 100 / SPACE_CHALLENGES.length;
    const newProgress = Math.min(100, Math.round((activeChallengeIndex + 1) * progressStep));

    set({
      challengeDecisions: newDecisions,
      liveMetrics: {
        health: newHealth,
        power: newPower,
        communication: newComms,
        satelliteStatus,
        missionProgress: newProgress,
      },
      aiMessage: chosenOption.feedback,
      aiMood: chosenOption.isRecommended ? 'happy' : 'warning',
    });
  },

  nextChallenge: () => {
    const { activeChallengeIndex, challengeDecisions } = get();
    const nextIdx = activeChallengeIndex + 1;

    if (nextIdx < SPACE_CHALLENGES.length) {
      set({
        activeChallengeIndex: nextIdx,
        aiMessage: `Alert! New orbital challenge detected: ${SPACE_CHALLENGES[nextIdx].title}. Review satellite telemetry and choose an action.`,
        aiMood: 'thinking',
      });
    } else {
      // Complete all challenges -> calculate final scores and transition to results
      get().calculateFinalScores();
      set({ stage: 'mission-results' });
    }
  },

  setAiMessage: (msg, mood = 'neutral') => set({ aiMessage: msg, aiMood: mood }),

  toggleAiExpanded: () => set((state) => ({ isAiExpanded: !state.isAiExpanded })),

  calculateFinalScores: () => {
    const { design, selectedMissionId, selectedOrbit, challengeDecisions, liveMetrics, getResources } = get();
    const res = getResources();
    const mission = GAMIFIED_MISSIONS.find((m) => m.id === selectedMissionId);

    // 1. Design Score (max 250)
    let designScore = 50;
    if (design.payload) {
      const p = SATELLITE_COMPONENTS[design.payload];
      if (p?.suitableMissions.includes(selectedMissionId)) designScore += 80;
      else designScore += 40;
    }
    if (design.power) designScore += 40;
    if (design.communication) designScore += 40;
    if (design.control) designScore += 40;

    // 2. Resource Score (max 200)
    let resourceScore = 200;
    if (res.isOverweight) resourceScore -= 60;
    if (res.isPowerDeficient) resourceScore -= 80;
    if (res.isFuelDeficient) resourceScore -= 40;
    if (res.netPowerW > 50) resourceScore += 20;
    resourceScore = Math.max(40, Math.min(200, resourceScore));

    // 3. Orbit Score (max 200)
    let orbitScore = 100;
    if (selectedOrbit === mission?.recommendedOrbit) orbitScore = 200;
    else if (selectedOrbit) orbitScore = 130;

    // 4. Decision Score (max 250)
    let correctDecisions = challengeDecisions.filter((d) => d.isRecommended).length;
    let decisionScore = Math.round((correctDecisions / Math.max(1, challengeDecisions.length)) * 250);

    // 5. Efficiency Score (max 100)
    let efficiencyScore = Math.round((liveMetrics.health * 0.4) + (liveMetrics.power * 0.3) + (liveMetrics.communication * 0.3));

    const totalScore = designScore + resourceScore + orbitScore + decisionScore + efficiencyScore;

    let grade: 'S' | 'A' | 'B' | 'C' = 'B';
    if (totalScore >= 900) grade = 'S';
    else if (totalScore >= 780) grade = 'A';
    else if (totalScore >= 650) grade = 'B';
    else grade = 'C';

    const thingsDoneWell: string[] = [];
    const mistakesMade: string[] = [];
    const keyLearnings: string[] = [];
    const aiRecommendations: string[] = [];

    if (design.payload && SATELLITE_COMPONENTS[design.payload]?.suitableMissions.includes(selectedMissionId)) {
      thingsDoneWell.push(`Optimal primary payload selection (${SATELLITE_COMPONENTS[design.payload].name}) tailored to mission objectives.`);
    } else {
      mistakesMade.push('Suboptimal primary payload choice reduced observation effectiveness.');
      aiRecommendations.push(`For ${mission?.title}, ${mission?.recommendedPayload} provides superior sensing capabilities.`);
    }

    if (selectedOrbit === mission?.recommendedOrbit) {
      thingsDoneWell.push(`Correct orbital trajectory (${selectedOrbit}) provided ideal coverage geometry.`);
    } else {
      mistakesMade.push(`Operating in ${selectedOrbit} limited mission performance compared to recommended ${mission?.recommendedOrbit}.`);
      aiRecommendations.push(`${mission?.whyOrbit}`);
    }

    if (res.netPowerW >= 0) {
      thingsDoneWell.push('Positive power balance maintained satellite battery reserves during eclipse.');
    } else {
      mistakesMade.push('Satellite ran a negative power budget, risking electrical blackout.');
    }

    if (correctDecisions >= 3) {
      thingsDoneWell.push(`Decisive orbital problem-solving: successfully resolved ${correctDecisions} emergency challenges.`);
    } else {
      mistakesMade.push('Certain challenge decisions stressed satellite avionics and drained energy reserves.');
    }

    keyLearnings.push('Satellite design is a balancing act between instrument mass, electrical power generation, and launch capabilities.');
    keyLearnings.push('Different orbits serve different physics: LEO for high spatial resolution, GEO for continuous hemisphere staring.');
    keyLearnings.push('Space operations require load-shedding and calibration routines to withstand the harsh space environment.');

    const report: MissionResultReport = {
      overallScore: Math.min(1000, totalScore),
      grade,
      designScore,
      resourceScore,
      orbitScore,
      decisionScore,
      efficiencyScore,
      thingsDoneWell,
      mistakesMade,
      keyLearnings,
      aiRecommendations,
    };

    set({ finalResults: report });
    return report;
  },

  resetGamifiedMission: () => {
    set({
      stage: 'choose-mission',
      design: { ...DEFAULT_DESIGN },
      viewMode: 'assembled',
      explodeProgress: 0.0,
      inspectedComponentId: null,
      selectedOrbit: null,
      acceptedAiOrbit: false,
      preFlightReport: null,
      launchPhase: 1,
      isLaunchPlaying: false,
      activeChallengeIndex: 0,
      completedChallenges: [],
      challengeDecisions: [],
      liveMetrics: { ...DEFAULT_METRICS },
      finalResults: null,
      aiMessage: 'Ready to embark on another space engineering mission! Select your next target.',
      aiMood: 'happy',
    });
  },
}));
