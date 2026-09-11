/**
 * VYOM — Satellite Configuration Data Architecture
 * Multi-category satellite definitions, component exploded offsets, educational descriptions,
 * dynamic modifications, and mission compatibility evaluation.
 * Note: Strict design guideline — No emojis.
 */

import type { MissionType, SatelliteConfig } from './mission';

export type SatelliteCategory =
  | 'crewed_capsule'
  | 'earth_observation'
  | 'planetary_probe'
  | 'scientific'
  | 'communication'
  | 'navigation';

export type SatelliteComponentId =
  | 'bus'
  | 'payload'
  | 'solar_panels'
  | 'power_system'
  | 'communication'
  | 'antenna'
  | 'obc'
  | 'adcs'
  | 'thermal'
  | 'propulsion';

export interface ComponentOption {
  id: string;
  name: string;
  shortDesc: string;
  powerDrawW: number;
  massKg: number;
  costModifierCr: number;
  specs: Record<string, string>;
  compatibleMissionTypes: (MissionType | SatelliteCategory | string)[];
  incompatibleWarning?: string;
}

export interface SatelliteComponentDefinition {
  id: SatelliteComponentId;
  name: string;
  systemTag: string;
  defaultOffset: [number, number, number]; // [x, y, z] vector in exploded view
  purpose: string;
  howItWorks: string;
  missionRole: string;
  options: ComponentOption[];
  defaultOptionId: string;
}

export interface SatelliteTypeDefinition {
  category: SatelliteCategory;
  name: string;
  classDesignation: string;
  tagline: string;
  purposeSummary: string;
  recommendedMissionTypes: MissionType[];
  orbitalRegime: string;
  baseMassKg: number;
  basePowerGenerationW: number;
  expectedLifespanYears: number;
  telemetryBand: string;
  recommendationReason: string;
  detailedOverview: string;
  components: SatelliteComponentDefinition[];
}

export interface ConfiguredSatelliteState {
  category: SatelliteCategory;
  componentSelections: Record<SatelliteComponentId, string>;
  explodeProgress: number; // 0.0 (fully assembled) to 1.0 (fully exploded)
  selectedComponentId: SatelliteComponentId | null;
}

export const SATELLITE_CATEGORIES: { id: SatelliteCategory; label: string; code: string; missionModel: string }[] = [
  { id: 'crewed_capsule', label: 'Crewed Exploration Capsule', code: 'CREW-CAPSULE', missionModel: 'Gaganyaan / Chandrayaan-Crew' },
  { id: 'earth_observation', label: 'Earth Observation Satellite', code: 'EOS-SURVEILLANCE', missionModel: 'Cartosat-3D / Sentinel' },
  { id: 'planetary_probe', label: 'Planetary Deep Space Probe', code: 'DEEP-PROBE', missionModel: 'Mangalyaan-2 Explorer' },
  { id: 'scientific', label: 'Scientific Space Telescope', code: 'ASTRO-TELESCOPE', missionModel: 'Astrosat-2 Observatory' },
  { id: 'communication', label: 'Communication Satellite', code: 'COM-RELAY', missionModel: 'GSAT High-Throughput Relay' },
  { id: 'navigation', label: 'Navigation Satellite', code: 'NAV-CONSTELLATION', missionModel: 'NavIC Positioning' },
];

export const SATELLITE_DEFINITIONS: Record<SatelliteCategory, SatelliteTypeDefinition> = {
  crewed_capsule: {
    category: 'crewed_capsule',
    name: 'Crewed Exploration Capsule',
    classDesignation: 'VYOM Gaganyaan-Crew / Chandrayaan-CM',
    tagline: 'Autonomous Human Spaceflight & Environmental Life Support Vehicle',
    purposeSummary: 'Engineered for human orbital exploration, lunar transit trajectories, autonomous life support, and extreme ablative atmospheric re-entry.',
    recommendedMissionTypes: ['human'],
    orbitalRegime: 'Low Earth Orbit (400 km) / Trans-Lunar Trajectory',
    baseMassKg: 5300,
    basePowerGenerationW: 3200,
    expectedLifespanYears: 1.5,
    telemetryBand: 'S-Band Telemetry / Ku-Band Crew Video Relay',
    recommendationReason: 'Crucial for crewed exploration missions requiring redundant ECLSS life support, active re-entry thermal shields, and human-rated avionics.',
    detailedOverview: 'Comprises a pressurized conical titanium crew command module, ablative PICA-X heat shield base, cylindrical service module with dual solar arrays, and high-thrust OMS orbital maneuvering propulsion.',
    components: [
      {
        id: 'bus',
        name: 'Pressurized Crew Command Module (CM)',
        systemTag: 'CREW CABIN',
        defaultOffset: [0, 0.4, 0],
        purpose: 'Houses crew astronauts, cockpit flight instruments, and isolates the pressure cabin against vacuum.',
        howItWorks: 'Fabricated from high-strength titanium and aluminum-lithium alloy with internal micro-meteoroid armor blankets.',
        missionRole: 'Guarantees structural containment and internal pressure of 101.3 kPa across all flight phases.',
        defaultOptionId: 'cm_ti_alli',
        options: [
          {
            id: 'cm_ti_alli',
            name: 'Titanium & Al-Li Welded Vessel',
            shortDesc: 'Flight-proven human-rated pressure vessel with multi-layer armor',
            powerDrawW: 0,
            massKg: 1450,
            costModifierCr: 0,
            specs: { Material: 'Ti-6Al-4V / Al-Li 2195', Volume: '10.5 m³', SafetyFactor: '1.5x Human-Rated' },
            compatibleMissionTypes: ['human', 'orbital'],
          },
          {
            id: 'cm_composite',
            name: 'Carbon-Bismaleimide Composite Vessel',
            shortDesc: 'Advanced low-mass composite structure with integrated sensor grid',
            powerDrawW: 0,
            massKg: 1200,
            costModifierCr: 15,
            specs: { Material: 'BMI Carbon Composite', Volume: '11.2 m³', MassReduction: '-250 kg' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Environmental Control & Life Support (ECLSS)',
        systemTag: 'LIFE SUPPORT',
        defaultOffset: [0, 1.2, 0],
        purpose: 'Regulates oxygen partial pressure, removes CO2, filters trace contaminants, and maintains breathable atmosphere.',
        howItWorks: 'Uses solid-amine vacuum-desorbed CO2 scrubbers, catalytic trace contaminant oxidizers, and cryogenic O2/N2 storage.',
        missionRole: 'Supplies continuous breathable air and potable water for a crew of up to 3 astronauts for 14+ mission days.',
        defaultOptionId: 'eclss_closed_loop',
        options: [
          {
            id: 'eclss_closed_loop',
            name: 'Closed-Loop O2 & H2O Recycling',
            shortDesc: 'Regenerative life support with water reclamation and Sabatier CO2 reduction',
            powerDrawW: 450,
            massKg: 380,
            costModifierCr: 8,
            specs: { O2Recovery: '92%', H2ORecovery: '95%', CrewCapacity: '3 Astronauts' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'eclss_open_canister',
            name: 'Open-Cycle LiOH Canister System',
            shortDesc: 'Simplified consumable chemical absorbent canisters for short-duration sorties',
            powerDrawW: 220,
            massKg: 460,
            costModifierCr: 0,
            specs: { O2Recovery: 'Open Expendable', Duration: '7 Days Max', CrewCapacity: '2 Astronauts' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'Deployable Solar Wings (EPS Power)',
        systemTag: 'SOLAR ARRAYS',
        defaultOffset: [2.2, -0.4, 0],
        purpose: 'Generates electrical energy from solar irradiance to power crew systems and charge service module batteries.',
        howItWorks: 'Twin deployable rigid wings with gallium arsenide (GaAs) triple-junction photovoltaic cells.',
        missionRole: 'Generates 3200 W continuous electrical power during sunlit orbital arcs.',
        defaultOptionId: 'dual_wing_gaas',
        options: [
          {
            id: 'dual_wing_gaas',
            name: 'Dual Deployable GaAs Solar Wings',
            shortDesc: 'Twin 3.2 kW solar array wings with sun-tracking gimbal drives',
            powerDrawW: 0,
            massKg: 180,
            costModifierCr: 0,
            specs: { Efficiency: '30.5%', Generation: '3200 W', Tracking: 'Dual-Axis' },
            compatibleMissionTypes: ['human', 'orbital'],
          },
          {
            id: 'extended_tri_wing',
            name: 'Extended Triple-Junction UltraFlex',
            shortDesc: 'High-output 4.8 kW flexible fold-out arrays for extended lunar transit',
            powerDrawW: 0,
            massKg: 240,
            costModifierCr: 12,
            specs: { Efficiency: '32.5%', Generation: '4800 W', Architecture: 'UltraFlex Circular' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'Service Module Power & Cryogenic Fuel Cells',
        systemTag: 'POWER EPS',
        defaultOffset: [0, -0.6, 0],
        purpose: 'Conditions raw bus power, distributes 28V/120V regulated power rails, and provides stored energy during eclipse.',
        howItWorks: 'Combines dual cryogenic hydrogen-oxygen PEM fuel cells with high-density lithium-ion battery banks.',
        missionRole: 'Powers life support, guidance computers, and communication suites during Earth occultation and re-entry.',
        defaultOptionId: 'fuel_cell_cryo',
        options: [
          {
            id: 'fuel_cell_cryo',
            name: 'Dual Cryogenic LOX/LH2 Fuel Cells',
            shortDesc: 'Generates electrical power and pure drinking water as a byproduct',
            powerDrawW: 50,
            massKg: 390,
            costModifierCr: 6,
            specs: { Output: '5.0 kW Peak', Byproduct: 'Potable H2O 1.2 L/hr', BusVoltage: '28V / 120V DC' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'solid_state_array',
            name: 'Solid-State Li-Ion 120 kWh Bank',
            shortDesc: 'Non-flammable solid-electrolyte lithium-ion battery system',
            powerDrawW: 35,
            massKg: 350,
            costModifierCr: 10,
            specs: { Capacity: '120 kWh', CycleLife: '5000 Cycles', EnergyDensity: '380 Wh/kg' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Ablative Base Heat Shield (TPS)',
        systemTag: 'HEAT SHIELD',
        defaultOffset: [0, -1.3, 0],
        purpose: 'Protects the crew module and astronauts from aerodynamic heating exceeding 2,800°C during atmospheric re-entry.',
        howItWorks: 'Uses Phenolic-Impregnated Carbon Ablator (PICA-X) tiles that dissipate heat through controlled endothermic pyrolytic ablation.',
        missionRole: 'Ensures the inner pressure vessel temperature remains below 35°C during hypersonic entry at 11 km/s.',
        defaultOptionId: 'picax_ablative',
        options: [
          {
            id: 'picax_ablative',
            name: 'PICA-X Phenolic Carbon Ablative Shield',
            shortDesc: 'High-enthalpy ablator rated for super-orbital lunar return trajectories',
            powerDrawW: 0,
            massKg: 520,
            costModifierCr: 0,
            specs: { MaxTemp: '3000°C', HeatFlux: '1200 W/cm²', Material: 'PICA-X Composite' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'csic_reusable',
            name: 'C/SiC Ceramic Matrix Reusable TPS',
            shortDesc: 'Refractory carbon silicon carbide tiles for multi-mission orbital reusability',
            powerDrawW: 0,
            massKg: 460,
            costModifierCr: 16,
            specs: { MaxTemp: '2200°C', HeatFlux: '850 W/cm²', Reusability: '10 Flights' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Service Propulsion Engine (OMS)',
        systemTag: 'PROPULSION',
        defaultOffset: [0, -2.1, 0],
        purpose: 'Executes orbital insertion burns, orbit adjustments, translunar injection trims, and de-orbit retro burns.',
        howItWorks: 'Pressure-fed hypergolic bipropellant engine utilizing monomethylhydrazine (MMH) and nitrogen tetroxide (NTO).',
        missionRole: 'Provides 45 kN thrust with restart capability for precision lunar injection and de-orbit maneuvers.',
        defaultOptionId: 'biprop_oms_engine',
        options: [
          {
            id: 'biprop_oms_engine',
            name: '45 kN Bipropellant MMH/NTO Engine',
            shortDesc: 'Hypergolic restartable service engine for high-thrust orbital maneuvering',
            powerDrawW: 160,
            massKg: 680,
            costModifierCr: 0,
            specs: { Thrust: '45.0 kN', Isp: '322 s', RestartCapability: '24 Starts' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'dual_mode_hybrid',
            name: 'Dual-Mode High-Isp Staged Engine',
            shortDesc: 'High-efficiency bipropellant system with regenerative cooling nozzle',
            powerDrawW: 220,
            massKg: 610,
            costModifierCr: 14,
            specs: { Thrust: '38.0 kN', Isp: '338 s', DeltaV: '+180 m/s' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Reaction Control System (RCS) & Star Trackers',
        systemTag: 'ATTITUDE RCS',
        defaultOffset: [-1.4, 0.5, 0],
        purpose: 'Provides 3-axis rotational attitude control, station-keeping alignment, and precise orientation for re-entry.',
        howItWorks: '16 pulse-firing hydrazine thrusters paired with optical star trackers and autonomous inertial measurement units.',
        missionRole: 'Maintains spacecraft pointing accuracy of 0.05° and re-entry angle of attack within 0.1° tolerances.',
        defaultOptionId: 'rcs_16_cluster',
        options: [
          {
            id: 'rcs_16_cluster',
            name: '16-Nozzle Hydrazine RCS Cluster',
            shortDesc: 'Redundant quad-quadrant attitude control thrusters for 3-axis orientation',
            powerDrawW: 90,
            massKg: 110,
            costModifierCr: 0,
            specs: { Nozzles: '16 x 22N', ResponseTime: '15 ms', Propellant: 'Hydrazine' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'rcs_cold_gas',
            name: 'Dual-Redundant Cold Gas Micro-Thrusters',
            shortDesc: 'Ultra-pure nitrogen cold gas system for contamination-free proximity maneuvering',
            powerDrawW: 60,
            massKg: 95,
            costModifierCr: 4,
            specs: { Nozzles: '12 x 10N', ResponseTime: '10 ms', Contamination: 'Zero Residue' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Quad-Redundant Human-Rated Avionics (OBC)',
        systemTag: 'AVIONICS OBC',
        defaultOffset: [0, 1.9, 0],
        purpose: 'Runs guidance, navigation, control (GNC), crew telemetry, autonomous fault detection, and abort sequencing.',
        howItWorks: 'Quadruple-modular redundant processors with 2-out-of-4 hardware majority voting logic.',
        missionRole: 'Executes critical mission timelines with zero single-point failure tolerance.',
        defaultOptionId: 'quad_voting_obc',
        options: [
          {
            id: 'quad_voting_obc',
            name: 'Quad-Modular Voting Flight Computer',
            shortDesc: 'Human-rated fault-tolerant architecture with automated emergency abort logic',
            powerDrawW: 160,
            massKg: 45,
            costModifierCr: 0,
            specs: { Redundancy: 'Quad 4x Voting', ClockSpeed: '1.2 GHz', Reliability: '99.9999%' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'triple_rad_hard',
            name: 'Rad-Hard Triple PowerPC Architecture',
            shortDesc: 'Heavy-ion hardened processors for deep-space lunar transit radiation environments',
            powerDrawW: 120,
            massKg: 38,
            costModifierCr: 8,
            specs: { Redundancy: 'Triple TMR', RadTolerance: '300 krad', Architecture: 'PowerPC 750' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'S/Ku-Band Voice, Video & Telemetry Uplink',
        systemTag: 'COMMUNICATIONS',
        defaultOffset: [1.4, 0.5, 0],
        purpose: 'Maintains uninterrupted two-way voice communications, live HD crew cabin video, and real-time medical biometrics.',
        howItWorks: 'Dual S-band transponders for command/telemetry and steerable Ku-band antenna for high-data-rate video relays.',
        missionRole: 'Ensures 100% communication continuity with Mission Control via ground stations and data relay satellites.',
        defaultOptionId: 'ku_video_voice',
        options: [
          {
            id: 'ku_video_voice',
            name: 'Ku-Band HD Crew Relay & S-Band',
            shortDesc: 'High-throughput dual-band communication with tracking satellite support',
            powerDrawW: 190,
            massKg: 35,
            costModifierCr: 0,
            specs: { Downlink: '150 Mbps', Channels: '4x HD Video + Audio', Tracking: 'Auto-Steered' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'optical_laser_relay',
            name: 'Optical Laser Downlink + S-Band',
            shortDesc: 'Laser optical communication terminal delivering gigabit-rate video and telemetry',
            powerDrawW: 230,
            massKg: 44,
            costModifierCr: 12,
            specs: { Downlink: '1.2 Gbps Laser', Range: 'Lunar Distance', RFBackup: 'S-Band' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
      {
        id: 'antenna',
        name: 'Docking Adapter Ring & Phased Arrays',
        systemTag: 'DOCKING / ANT',
        defaultOffset: [0, 2.5, 0],
        purpose: 'Enables orbital docking with space stations / lunar landers and transmits omnidirectional telemetry during abort.',
        howItWorks: 'Androgynous peripheral docking mechanism equipped with laser rangefinders, alignment latches, and hatch seal seals.',
        missionRole: 'Provides physical structural connection and pressurized crew transfer tunnel between space vehicles.',
        defaultOptionId: 'androgynous_docking',
        options: [
          {
            id: 'androgynous_docking',
            name: 'Androgynous Peripheral Docking Ring',
            shortDesc: 'International standard APAS-compatible docking system with passive/active capture',
            powerDrawW: 60,
            massKg: 180,
            costModifierCr: 0,
            specs: { Mechanism: 'APAS / IDSS Compatible', TunnelDiameter: '0.8 m', CaptureVel: '0.1 m/s' },
            compatibleMissionTypes: ['human'],
          },
          {
            id: 'soft_capture_lids',
            name: 'Low-Impact Soft-Capture Docking System',
            shortDesc: 'Electromechanical attenuation system minimizing docking force loads',
            powerDrawW: 45,
            massKg: 155,
            costModifierCr: 6,
            specs: { Mechanism: 'Low Impact LIDS', ForceAtten: '95%', LaserGuidance: 'Dual LiDAR' },
            compatibleMissionTypes: ['human'],
          },
        ],
      },
    ],
  },
  planetary_probe: {
    category: 'planetary_probe',
    name: 'Planetary Deep Space Probe',
    classDesignation: 'VYOM Mangalyaan-2 Deep Space Explorer',
    tagline: 'Autonomous Interplanetary Science & Radiation-Hardened Deep Space Platform',
    purposeSummary: 'Equipped with a high-gain parabolic reflector dish, radiation-hardened autonomous navigation, RTG thermal generators, and planetary science booms.',
    recommendedMissionTypes: ['planetary'],
    orbitalRegime: 'Interplanetary Heliocentric & Mars/Lunar Insertion',
    baseMassKg: 1350,
    basePowerGenerationW: 1800,
    expectedLifespanYears: 8.0,
    telemetryBand: 'Deep Space Network (DSN) Ka-Band / X-Band',
    recommendationReason: 'Engineered for long-baseline interplanetary voyages requiring autonomous anomaly survival, high-gain communications, and liquid apogee insertion.',
    detailedOverview: 'Built around an octagonal gold MLI bus with high-thrust liquid apogee motor, steerable parabolic high-gain antenna, deployable magnetometer science boom, and RTG power modules.',
    components: [
      {
        id: 'bus',
        name: 'Octagonal Deep Space Bus (CFRP / Titanium)',
        systemTag: 'STRUCTURE',
        defaultOffset: [0, 0, 0],
        purpose: 'Provides rigid structural core supporting propellant tanks, science payloads, and parabolic antenna.',
        howItWorks: 'Octagonal prism structure composed of carbon-fiber sandwich panels and titanium corner longerons.',
        missionRole: 'Absorbs launch acoustics and maintains alignment across multi-year interplanetary voyages.',
        defaultOptionId: 'octagonal_cfrp',
        options: [
          {
            id: 'octagonal_cfrp',
            name: 'Octagonal CFRP Deep Space Bus',
            shortDesc: 'Proven multi-mission deep space chassis with integrated propellant tank bays',
            powerDrawW: 0,
            massKg: 310,
            costModifierCr: 0,
            specs: { Shape: 'Octagonal Prism', Width: '1.6 m', Rigidity: 'High' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'beryllium_shielded',
            name: 'Beryllium-Reinforced Radiation Bus',
            shortDesc: 'Radiation-shielded bus optimized for Jovian or high-flux interplanetary environments',
            powerDrawW: 0,
            massKg: 280,
            costModifierCr: 14,
            specs: { Shielding: 'Graded-Z Beryllium', RadProtection: '500 krad', Rigidity: 'Extreme' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Magnetometer & Science Instrument Boom',
        systemTag: 'SCIENCE BOOM',
        defaultOffset: [0, -0.3, 1.8],
        purpose: 'Measures planetary magnetic fields, solar wind plasma interactions, and surface composition.',
        howItWorks: 'Articulated 3-meter boom isolating sensitive fluxgate magnetometers from spacecraft electrical currents.',
        missionRole: 'Conducts primary surface and atmospheric science observations at planetary destinations.',
        defaultOptionId: 'fluxgate_mag_boom',
        options: [
          {
            id: 'fluxgate_mag_boom',
            name: 'Triaxial Fluxgate Magnetometer & Plasma Boom',
            shortDesc: '3m deployable carbon mast with twin fluxgate sensors and ion mass spectrometer',
            powerDrawW: 85,
            massKg: 45,
            costModifierCr: 0,
            specs: { MastLength: '3.0 m', Range: '±65,000 nT', Sensitivity: '0.01 nT' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'radar_sounder_boom',
            name: 'Subsurface Radar Sounder & Spectrometer',
            shortDesc: 'Deep penetrating radar antenna capable of mapping subsurface ice and aquifers',
            powerDrawW: 140,
            massKg: 65,
            costModifierCr: 9,
            specs: { DepthPenetration: '3.0 km', Freq: '20 MHz', IceDetection: 'High Sensitivity' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'Radiation-Hardened Solar Wings',
        systemTag: 'SOLAR ARRAYS',
        defaultOffset: [-2.2, 0, 0],
        purpose: 'Generates electrical energy even at large heliocentric distances (up to 1.5 AU Mars distance).',
        howItWorks: 'Triple-junction InGaP/InGaAs/Ge cells protected with cerium-doped coverglass against cosmic radiation.',
        missionRole: 'Supplies 1800 W at 1 AU, degrading to 800 W at Mars orbit.',
        defaultOptionId: 'mars_rad_wings',
        options: [
          {
            id: 'mars_rad_wings',
            name: 'Rad-Hard Triple-Junction Solar Wings',
            shortDesc: 'Radiation-shielded solar panels optimized for low-illumination interplanetary environments',
            powerDrawW: 0,
            massKg: 120,
            costModifierCr: 0,
            specs: { Area: '8.4 m²', Efficiency: '31%', LowTempPerformance: 'Optimized' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'concentrator_wings',
            name: 'Optical Concentrator Solar Wings',
            shortDesc: 'Fresnel lens micro-concentrators providing high specific power at deep-space distances',
            powerDrawW: 0,
            massKg: 140,
            costModifierCr: 10,
            specs: { Concentration: '4x Optical', Area: '11.0 m²', Reach: 'Up to 2.2 AU' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'Radioisotope Thermoelectric Generator (RTG)',
        systemTag: 'RTG POWER',
        defaultOffset: [1.6, 0, 0],
        purpose: 'Provides continuous baseline thermal and electrical power unaffected by solar distance or planetary shadow.',
        howItWorks: 'Converts decay heat from Plutonium-238 dioxide pellets directly into electricity using silicon-germanium thermopiles.',
        missionRole: 'Guarantees uninterrupted spacecraft operations through multi-hour eclipse periods and dust storms.',
        defaultOptionId: 'rtg_mmrtg',
        options: [
          {
            id: 'rtg_mmrtg',
            name: 'Multi-Mission RTG (MMRTG)',
            shortDesc: 'Nuclear decay power source delivering 125W continuous electrical and 2000W thermal energy',
            powerDrawW: 0,
            massKg: 45,
            costModifierCr: 18,
            specs: { Output: '125 W Electric', ThermalOutput: '2000 W Thermal', Lifespan: '14+ Years' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'hybrid_battery_sup',
            name: 'Lithium-Ion Deep-Discharge Battery Bank',
            shortDesc: 'High-capacity solid electrolyte battery pack without nuclear isotopes',
            powerDrawW: 20,
            massKg: 75,
            costModifierCr: 0,
            specs: { Capacity: '4.5 kWh', CycleLife: '3000 Cycles', NonNuclear: 'Yes' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Deep Space Thermal Insulation (MLI & RHU)',
        systemTag: 'THERMAL TCS',
        defaultOffset: [0, 0.9, -1.1],
        purpose: 'Prevents propellant freezing in deep space (-180°C) and sheds excess engine heat during burns.',
        howItWorks: 'Combines 30-layer gold-coated Kapton aluminized mylar blankets with radioisotope heater units (RHU).',
        missionRole: 'Maintains internal instrument temperatures strictly between +10°C and +30°C.',
        defaultOptionId: 'deep_space_mli',
        options: [
          {
            id: 'deep_space_mli',
            name: '30-Layer Gold Kapton MLI & RHU Heaters',
            shortDesc: 'Comprehensive thermal blanket with 1W isotopic heater units for extreme cold',
            powerDrawW: 30,
            massKg: 35,
            costModifierCr: 0,
            specs: { Blankets: '30-Layer Kapton', TempRange: '-200°C to +150°C', RHUs: '8 Units' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'active_louver_tcs',
            name: 'Active Thermal Louver & Heat Pipe System',
            shortDesc: 'Variable-emittance louvers that open and close autonomously based on solar distance',
            powerDrawW: 45,
            massKg: 42,
            costModifierCr: 5,
            specs: { Louvers: 'Bimetallic Driven', HeatPipes: 'Loop Heat Pipe LHP', VariableEmittance: '0.12 - 0.78' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Liquid Apogee Motor (LAM 440N) & RCS',
        systemTag: 'PROPULSION',
        defaultOffset: [0, -1.8, 0],
        purpose: 'Performs planetary orbit insertion (MOI), trajectory correction maneuvers (TCM), and wheel desaturation.',
        howItWorks: '440N bipropellant engine burning MON-3 and MMH paired with eight 22N attitude thrusters.',
        missionRole: 'Imparts over 2,200 m/s total delta-V required for interplanetary cruise and planetary capture.',
        defaultOptionId: 'lam_440n_engine',
        options: [
          {
            id: 'lam_440n_engine',
            name: 'Liquid Apogee Motor (LAM 440N)',
            shortDesc: 'Flight-proven 440N engine with niobium alloy radiatively cooled nozzle bell',
            powerDrawW: 110,
            massKg: 280,
            costModifierCr: 0,
            specs: { Thrust: '440 N', Isp: '318 s', DeltaV: '2,200 m/s' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'dual_mode_ion_prop',
            name: 'Dual Hall-Effect Xenon & Chemical Hybrid',
            shortDesc: 'Combines chemical LAM with ultra-high Isp ion thrusters for deep cruise',
            powerDrawW: 750,
            massKg: 220,
            costModifierCr: 16,
            specs: { Thrust: '440N Chem + 250mN Ion', Isp: '2,800 s Ion', DeltaV: '+1,400 m/s' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Autonomous Star Trackers & Coarse Sun Sensors',
        systemTag: 'ATTITUDE ADCS',
        defaultOffset: [0.8, 0.8, 0.8],
        purpose: 'Maintains exact 3-axis pointing of the high-gain antenna towards Earth across billions of kilometers.',
        howItWorks: 'Autonomous star pattern recognition cameras and 4 reaction wheels oriented in a tetrahedral cluster.',
        missionRole: 'Preserves 0.01° antenna pointing accuracy during deep space cruise.',
        defaultOptionId: 'deep_space_adcs',
        options: [
          {
            id: 'deep_space_adcs',
            name: 'Dual Star Trackers & 4-Wheel Cluster',
            shortDesc: 'Redundant star cameras with autonomous lost-in-space attitude determination',
            powerDrawW: 65,
            massKg: 38,
            costModifierCr: 0,
            specs: { Pointing: '0.01° Accuracy', Wheels: '4x Tetrahedral 12 Nms', StarCatalog: '20,000 Stars' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'optical_nav_cam',
            name: 'AutoNav Optical Landmark Navigation',
            shortDesc: 'Autonomous optical navigation camera that tracks planetary moon occultations',
            powerDrawW: 90,
            massKg: 46,
            costModifierCr: 7,
            specs: { Autonomy: 'Ground-Independent', LandmarkTracking: 'Sub-pixel', TrajectoryTrim: 'Automatic' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Autonomous Deep Space Computer (OBC)',
        systemTag: 'AVIONICS OBC',
        defaultOffset: [-0.8, 0.8, -0.8],
        purpose: 'Runs autonomous vehicle operations when round-trip communication latency with Earth exceeds 30 minutes.',
        howItWorks: 'Radiation-hardened dual-redundant processors with automated fault detection, isolation, and recovery (FDIR).',
        missionRole: 'Detects anomalies autonomously and safe-modes the probe with antenna oriented toward Earth.',
        defaultOptionId: 'fdir_deep_obc',
        options: [
          {
            id: 'fdir_deep_obc',
            name: 'Autonomous FDIR Deep Space Computer',
            shortDesc: 'High-autonomy computer capable of surviving multi-month communications blackout',
            powerDrawW: 80,
            massKg: 28,
            costModifierCr: 0,
            specs: { AutonomyLevel: 'Level 4 Autonomous', RadHard: '300 krad', Memory: '512 GB Flash' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'ai_coprocessor_obc',
            name: 'Neural Processing Unit (NPU) Space Computer',
            shortDesc: 'Edge AI coprocessor for real-time terrain feature extraction and anomaly prediction',
            powerDrawW: 130,
            massKg: 32,
            costModifierCr: 11,
            specs: { AIInference: '8 TOPS INT8', VisionProcessor: 'Integrated', PowerEfficiency: 'High' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'Deep Space Ka/X-Band Transponders',
        systemTag: 'COMMUNICATIONS',
        defaultOffset: [0, 1.3, 0],
        purpose: 'Transmits telemetry, science images, and receives flight commands across interplanetary distances.',
        howItWorks: 'Traveling Wave Tube Amplifiers (TWTA) outputting 50W RF power in X-band (8.4 GHz) and Ka-band (32 GHz).',
        missionRole: 'Downlinks high-resolution planetary data to NASA Deep Space Network and ISRO ISTRAC ground stations.',
        defaultOptionId: 'ka_x_deep_transponder',
        options: [
          {
            id: 'ka_x_deep_transponder',
            name: 'Ka/X-Band 50W TWTA Transponder',
            shortDesc: 'Dual-frequency deep space transmitter optimized for planetary distances',
            powerDrawW: 170,
            massKg: 32,
            costModifierCr: 0,
            specs: { Frequencies: 'Ka (32 GHz) / X (8.4 GHz)', RFPower: '50 W TWTA', DataRate: '128 kbps at 1.5 AU' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'ultra_deep_100w',
            name: '100W High-Efficiency Solid-State Transponder',
            shortDesc: 'High-power GaN solid-state power amplifier for outer solar system communications',
            powerDrawW: 240,
            massKg: 38,
            costModifierCr: 12,
            specs: { Frequencies: 'Ka/X-Band', RFPower: '100 W GaN SSPA', DataRate: '350 kbps at 1.5 AU' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
      {
        id: 'antenna',
        name: '2.2m Parabolic High-Gain Antenna (HGA)',
        systemTag: 'ANTENNA DISH',
        defaultOffset: [0, 2.1, 0],
        purpose: 'Focuses radio frequency beam into a narrow high-gain lobe directed toward Earth.',
        howItWorks: 'Carbon-composite parabolic dish reflector with Cassegrain subreflector and dual-axis gimbal drive.',
        missionRole: 'Provides +42 dBi antenna gain, enabling communication across more than 200 million kilometers.',
        defaultOptionId: 'parabolic_2_2m_dish',
        options: [
          {
            id: 'parabolic_2_2m_dish',
            name: '2.2m Carbon Composite Parabolic Dish',
            shortDesc: 'Rigid high-surface-accuracy reflector dish with steerable Cassegrain subreflector',
            powerDrawW: 35,
            massKg: 48,
            costModifierCr: 0,
            specs: { Diameter: '2.2 m', Gain: '42.5 dBi (X-band)', SurfaceAccuracy: '0.2 mm RMS' },
            compatibleMissionTypes: ['planetary'],
          },
          {
            id: 'mesh_deployable_3m',
            name: '3.0m Deployable Mesh High-Gain Reflector',
            shortDesc: 'Lightweight gold-plated molybdenum mesh antenna providing maximum downlink gain',
            powerDrawW: 50,
            massKg: 36,
            costModifierCr: 15,
            specs: { Diameter: '3.0 m', Gain: '46.0 dBi (Ka-band)', Weight: 'Ultra-lightweight' },
            compatibleMissionTypes: ['planetary'],
          },
        ],
      },
    ],
  },
  earth_observation: {
    category: 'earth_observation',
    name: 'Earth Observation Satellite',
    classDesignation: 'VYOM Sentinel-EO Mk IV',
    tagline: 'High-Resolution Optical & Synthetic Aperture Radar Reconnaissance',
    purposeSummary: 'Designed for high-precision environmental monitoring, planetary cartography, climate assessment, and multi-spectral surface reconnaissance.',
    recommendedMissionTypes: ['orbital'],
    orbitalRegime: 'Sun-Synchronous Low Earth Orbit (500 - 800 km)',
    baseMassKg: 1850,
    basePowerGenerationW: 2400,
    expectedLifespanYears: 7.5,
    telemetryBand: 'X-Band Downlink / S-Band Command',
    recommendationReason: 'Ideal for orbital monitoring missions that require steady planetary illumination and continuous multispectral data return.',
    detailedOverview: 'Equipped with a forward nadir optical imaging assembly, dual deployable solar wings, and a rigid carbon-composite bus engineered for zero-deflection sensor pointing.',
    components: [
      {
        id: 'bus',
        name: 'Primary Load-Bearing Satellite Bus',
        systemTag: 'STRUCTURE',
        defaultOffset: [0, 0, 0],
        purpose: 'Houses avionics, balances structural mass, and isolates precision optical payloads from mechanical launch vibration.',
        howItWorks: 'Constructed from lightweight carbon-fiber reinforced polymer (CFRP) panels with internal aluminum honeycomb shear webs.',
        missionRole: 'Maintains alignment tolerances of less than 0.005 degrees between optical sensors, star trackers, and reaction wheels.',
        defaultOptionId: 'cfrp_rigid',
        options: [
          {
            id: 'cfrp_rigid',
            name: 'CFRP Monocoque Bus',
            shortDesc: 'Ultra-rigid carbon structure optimized for optical isolation',
            powerDrawW: 0,
            massKg: 420,
            costModifierCr: 0,
            specs: { Material: 'CFRP Honeycomb', Rigidity: 'High', ThermalExpansion: 'Near-Zero' },
            compatibleMissionTypes: ['orbital', 'planetary', 'astrophysics'],
          },
          {
            id: 'al_li_modular',
            name: 'Aluminum-Lithium Modular Frame',
            shortDesc: 'High payload capacity modular frame for heavier radar arrays',
            powerDrawW: 0,
            massKg: 520,
            costModifierCr: -15,
            specs: { Material: 'Al-Li 2195', Rigidity: 'Medium', PayloadCapacity: '+350 kg' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Optical & Radar Observation Payload',
        systemTag: 'PAYLOAD',
        defaultOffset: [0, -1.8, 0],
        purpose: 'Captures ground topography, vegetation health, oceanic thermal maps, and atmospheric chemical columns.',
        howItWorks: 'Combines a 0.5-meter folded Cassegrain telescope with multi-band TDI detectors and active thermal compensation.',
        missionRole: 'Executes the core science and imaging requirements of the orbital mission with sub-meter ground sampling.',
        defaultOptionId: 'multispectral_optical',
        options: [
          {
            id: 'multispectral_optical',
            name: '0.4m Multispectral Optical Imager',
            shortDesc: '7 spectral bands across visible and near-infrared with 0.7m GSD',
            powerDrawW: 380,
            massKg: 280,
            costModifierCr: 0,
            specs: { Aperture: '450 mm', Resolution: '0.7 m/pixel', SwathWidth: '24 km' },
            compatibleMissionTypes: ['orbital'],
          },
          {
            id: 'sar_radar',
            name: 'X-band Synthetic Aperture Radar (SAR)',
            shortDesc: 'All-weather, day-night cloud-penetrating active radar array',
            powerDrawW: 980,
            massKg: 440,
            costModifierCr: 45,
            specs: { Frequency: '9.6 GHz', Resolution: '1.0 m', SwathWidth: '40 km' },
            compatibleMissionTypes: ['orbital'],
            incompatibleWarning: 'High power draw requires upgraded solar array and battery storage.',
          },
          {
            id: 'hyperspectral_sounder',
            name: '220-Band Hyperspectral Imaging Sounder',
            shortDesc: 'Precise atmospheric gas column and soil mineral analysis',
            powerDrawW: 460,
            massKg: 310,
            costModifierCr: 25,
            specs: { SpectralRange: '400-2500 nm', Channels: '220 bands', SwathWidth: '18 km' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'Deployable Gallium Arsenide Solar Arrays',
        systemTag: 'POWER GENERATION',
        defaultOffset: [2.6, 0, 0],
        purpose: 'Converts solar radiant energy into regulated direct-current electrical power.',
        howItWorks: 'Uses triple-junction GaInP/GaAs/Ge photovoltaic cells operating at 30.2% solar conversion efficiency.',
        missionRole: 'Supplies continuous energy to payloads during daylight and recharges batteries for orbital eclipse passes.',
        defaultOptionId: 'dual_wing_standard',
        options: [
          {
            id: 'dual_wing_standard',
            name: 'Dual-Wing 4-Panel GaAs Array',
            shortDesc: 'Generates 2.4 kW peak power with solar tracking drive',
            powerDrawW: 0,
            massKg: 140,
            costModifierCr: 0,
            specs: { PeakPower: '2400 W', CellType: 'Triple Junction GaAs', Efficiency: '30.2%' },
            compatibleMissionTypes: ['orbital', 'planetary'],
          },
          {
            id: 'extended_high_output',
            name: 'Extended 6-Panel High-Flux Array',
            shortDesc: 'Generates 3.6 kW peak power for heavy radar operations',
            powerDrawW: 0,
            massKg: 210,
            costModifierCr: 20,
            specs: { PeakPower: '3600 W', CellType: 'Quad Junction Immersion', Efficiency: '32.5%' },
            compatibleMissionTypes: ['orbital', 'communication'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'Power Conditioning & Li-Ion Energy Storage',
        systemTag: 'ELECTRICAL POWER',
        defaultOffset: [0, 1.2, 0],
        purpose: 'Regulates 28V/100V power buses and stores energy for the 35-minute eclipse phase of each 95-minute orbit.',
        howItWorks: 'High-density Lithium-Nickel-Manganese-Cobalt cells coupled with a high-frequency solid-state PDU.',
        missionRole: 'Prevents power brownouts during high-throughput payload imaging passes and thermal heater cycles.',
        defaultOptionId: 'li_ion_1800wh',
        options: [
          {
            id: 'li_ion_1800wh',
            name: '1800 Wh Space-Qualified Li-Ion Bank',
            shortDesc: 'Nominal energy reserve with 120,000 cycle design lifetime',
            powerDrawW: 15,
            massKg: 85,
            costModifierCr: 0,
            specs: { Capacity: '1800 Wh', DepthOfDischarge: '30%', BusVoltage: '28 V Regulated' },
            compatibleMissionTypes: ['orbital', 'navigation'],
          },
          {
            id: 'li_ion_3200wh',
            name: '3200 Wh Extended Reserve Battery Pack',
            shortDesc: 'Heavy-duty storage designed for SAR pulse cycles and deep orbits',
            powerDrawW: 20,
            massKg: 135,
            costModifierCr: 18,
            specs: { Capacity: '3200 Wh', DepthOfDischarge: '25%', BusVoltage: '50 V Dual' },
            compatibleMissionTypes: ['orbital', 'communication'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'High-Rate X-Band Direct Downlink',
        systemTag: 'TELECOMMUNICATIONS',
        defaultOffset: [0, 0, 1.5],
        purpose: 'Downlinks high-volume raw imagery and scientific telemetry to ground receiving stations.',
        howItWorks: 'Utilizes an 8.2 GHz solid-state power amplifier (SSPA) running QPSK/8PSK high-order modulation.',
        missionRole: 'Transfers up to 800 Megabits per second of processed Earth imagery during each ground station visibility pass.',
        defaultOptionId: 'x_band_800mbps',
        options: [
          {
            id: 'x_band_800mbps',
            name: 'X-Band 800 Mbps SSPA Downlink',
            shortDesc: 'Standard high-volume imagery downlink to regional polar ground stations',
            powerDrawW: 120,
            massKg: 35,
            costModifierCr: 0,
            specs: { Frequency: '8.2 GHz', DataRate: '800 Mbps', RFPower: '40 W' },
            compatibleMissionTypes: ['orbital'],
          },
          {
            id: 'optical_laser_crosslink',
            name: 'Laser Optical Comms Terminal (10 Gbps)',
            shortDesc: 'Optical laser downlink for instantaneous terabyte-scale data transfer',
            powerDrawW: 190,
            massKg: 52,
            costModifierCr: 35,
            specs: { Wavelength: '1550 nm', DataRate: '10 Gbps', BeamDivergence: '15 urad' },
            compatibleMissionTypes: ['orbital', 'communication', 'scientific'],
          },
        ],
      },
      {
        id: 'antenna',
        name: 'Steerable Spot Antenna & Omni TT&C Antennas',
        systemTag: 'RF APERTURES',
        defaultOffset: [0, 1.9, 1.2],
        purpose: 'Directs focused RF energy to Earth receiving terminals while preserving low-rate emergency beacon coverage.',
        howItWorks: 'Dual-gimbal carbon composite dish reflector backed by dual hemispherical S-band patch antennas.',
        missionRole: 'Guarantees reliable mission commanding even during anomalous attitude drift or safe-mode entry.',
        defaultOptionId: 'gimballed_reflector',
        options: [
          {
            id: 'gimballed_reflector',
            name: '0.8m Gimballed Carbon Reflector',
            shortDesc: 'High-gain steerable reflector tracking ground stations across +/-60 deg',
            powerDrawW: 25,
            massKg: 18,
            costModifierCr: 0,
            specs: { Diameter: '0.8 m', Gain: '34 dBi', PointingAccuracy: '0.05 deg' },
            compatibleMissionTypes: ['orbital', 'planetary'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Fault-Tolerant Rad-Hardened On-Board Computer',
        systemTag: 'AVIONICS & AUTONOMY',
        defaultOffset: [-1.4, 0, 0],
        purpose: 'Coordinates all spacecraft operations, sensor sequencing, autonomy algorithms, and fault management.',
        howItWorks: 'Dual-core LEON4 32-bit SPARC V8 architecture with triple-modular redundancy (TMR) and EDAC memory protection.',
        missionRole: 'Executes autonomous threat detection, attitude computations, and real-time telemetry processing.',
        defaultOptionId: 'rad_hard_tmr',
        options: [
          {
            id: 'rad_hard_tmr',
            name: 'Rad-Hardened Dual LEON4 SPARC OBC',
            shortDesc: 'Radiation tolerance exceeding 100 krad with automated error detection',
            powerDrawW: 32,
            massKg: 16,
            costModifierCr: 0,
            specs: { ClockRate: '200 MHz', Storage: '128 GB Flash', RadTolerance: '100 krad(Si)' },
            compatibleMissionTypes: ['orbital', 'planetary', 'human', 'astrophysics'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Attitude Determination & Control System (ADCS)',
        systemTag: 'GUIDANCE & CONTROL',
        defaultOffset: [0, -1.2, -1.2],
        purpose: 'Maintains exact 3-axis pointing toward Earth and aligns solar wings toward the Sun.',
        howItWorks: 'Dual autonomous star trackers, precision gyroscopes, magnetic torquers, and 4 skewed reaction wheels.',
        missionRole: 'Delivers arcsecond-level pointing stability essential for blur-free optical image acquisition.',
        defaultOptionId: 'reaction_wheels_4x',
        options: [
          {
            id: 'reaction_wheels_4x',
            name: '4-Wheel Skewed Reaction Array + Star Trackers',
            shortDesc: 'Sub-arcsecond pointing stability with redundant reaction torque capability',
            powerDrawW: 65,
            massKg: 42,
            costModifierCr: 0,
            specs: { PointingJitter: '0.5 arcsec', MomentumCapacity: '12 Nms', StarSensors: 'Dual Optical' },
            compatibleMissionTypes: ['orbital', 'astrophysics'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Passive & Active Thermal Control Assembly',
        systemTag: 'THERMAL REGULATION',
        defaultOffset: [-1.6, 1.4, 0],
        purpose: 'Prevents sensitive optoelectronics and batteries from freezing in shadow or overheating in direct sunlight.',
        howItWorks: 'Multi-layer insulation (MLI) blankets, ammonia loop heat pipes, and thermostatically switched patch heaters.',
        missionRole: 'Maintains focal-plane detectors at -20 deg C while battery cells stay within +15 deg C to +25 deg C.',
        defaultOptionId: 'mli_loop_heat_pipe',
        options: [
          {
            id: 'mli_loop_heat_pipe',
            name: 'MLI Blankets & Dual Ammonia Heat Pipes',
            shortDesc: 'Balanced thermal control handling orbital swings from -120 deg C to +110 deg C',
            powerDrawW: 40,
            massKg: 38,
            costModifierCr: 0,
            specs: { TemperatureRange: '-20C to +25C', RadiatorArea: '2.4 m^2', HeaterLoops: '16' },
            compatibleMissionTypes: ['orbital', 'communication', 'navigation'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Hydrazine Orbital Maneuvering Propulsion',
        systemTag: 'PROPULSION',
        defaultOffset: [0, 0, -1.8],
        purpose: 'Provides Delta-V for orbit insertion, ground-track maintenance, collision avoidance, and end-of-life deorbit.',
        howItWorks: 'Monopropellant catalytic decomposition over iridium-coated alumina beds delivering 220 seconds specific impulse.',
        missionRole: 'Compensates for atmospheric drag in LEO and ensures controlled safe reentry disposal at mission end.',
        defaultOptionId: 'hydrazine_mono',
        options: [
          {
            id: 'hydrazine_mono',
            name: 'Hydrazine Catalytic Monopropellant (220s Isp)',
            shortDesc: 'Proven chemical thrusters for rapid orbital adjustments and collision evasion',
            powerDrawW: 20,
            massKg: 95,
            costModifierCr: 0,
            specs: { Propellant: 'N2H4', TotalDeltaV: '180 m/s', ThrusterCount: '8x 1N' },
            compatibleMissionTypes: ['orbital', 'planetary'],
          },
          {
            id: 'hall_effect_xenon',
            name: 'Hall Effect Xenon Electric Propulsion (1650s Isp)',
            shortDesc: 'Ultra-high efficiency plasma propulsion extending operational lifespan',
            powerDrawW: 450,
            massKg: 75,
            costModifierCr: 30,
            specs: { Propellant: 'Xenon Gas', TotalDeltaV: '650 m/s', Isp: '1650 s' },
            compatibleMissionTypes: ['orbital', 'scientific'],
            incompatibleWarning: 'High continuous electrical draw requires additional solar array capacity.',
          },
        ],
      },
    ],
  },

  communication: {
    category: 'communication',
    name: 'Communication Satellite',
    classDesignation: 'VYOM SkyLink Relay III',
    tagline: 'High-Throughput Global Broadband & Telecommunications Relay',
    purposeSummary: 'Engineered for high-bandwidth civilian internet, inter-satellite relay, secure defense channels, and trans-oceanic broadcast connectivity.',
    recommendedMissionTypes: ['orbital'],
    orbitalRegime: 'Geostationary Earth Orbit (35,786 km)',
    baseMassKg: 3400,
    basePowerGenerationW: 7800,
    expectedLifespanYears: 15.0,
    telemetryBand: 'Ku/Ka-Band Transponders / C-Band Feeds',
    recommendationReason: 'Provides continuous full-hemisphere coverage and massive high-throughput bandwidth across continents and flight corridors.',
    detailedOverview: 'Features prominent dual 2.4-meter deployable parabolic reflector antennas, high-power traveling wave tube amplifiers (TWTAs), and multi-panel GaAs wings.',
    components: [
      {
        id: 'bus',
        name: 'Heavy GEO Satellite Core Bus',
        systemTag: 'STRUCTURE',
        defaultOffset: [0, 0, 0],
        purpose: 'Provides a robust central cylinder carrying large propellant tanks and supporting expansive antenna towers.',
        howItWorks: 'Composite central thrust cylinder carrying high-pressure propellant bladders surrounded by equipment equipment decks.',
        missionRole: 'Supports structural integrity during geostationary transfer orbit burn and 15 years of uninterrupted station-keeping.',
        defaultOptionId: 'geo_heavy_bus',
        options: [
          {
            id: 'geo_heavy_bus',
            name: 'Standard Heavy Geostationary Bus',
            shortDesc: 'Validated structural framework supporting 4000 kg launch mass',
            powerDrawW: 0,
            massKg: 650,
            costModifierCr: 0,
            specs: { LaunchMassLimit: '4500 kg', Lifetime: '15 Years', Structure: 'Composite Cylinder' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Ka/Ku-Band Multibeam Communications Payload',
        systemTag: 'PAYLOAD',
        defaultOffset: [0, 0, 1.8],
        purpose: 'Receives, filters, frequency-translates, and re-amplifies digital voice, video, and broadband data carriers.',
        howItWorks: 'Digital transparent processors (DTP) coupled to 64 active Ka-band spot-beam phased array feed horns.',
        missionRole: 'Delivers over 120 Gigabits per second throughput to aircraft, ships, remote outposts, and mobile terminals.',
        defaultOptionId: 'ka_band_dtp',
        options: [
          {
            id: 'ka_band_dtp',
            name: 'Digital Transparent Processor Ka-Band Array',
            shortDesc: '64 dynamically reconfigurable spot beams with 120 Gbps capacity',
            powerDrawW: 2800,
            massKg: 520,
            costModifierCr: 0,
            specs: { Throughput: '120 Gbps', Beams: '64 Agile Spots', Bandwidth: '800 MHz/beam' },
            compatibleMissionTypes: ['orbital'],
          },
          {
            id: 'c_ku_hybrid',
            name: 'C/Ku Hybrid Regional Broadcast Suite',
            shortDesc: 'Continental television broadcast and critical maritime coverage',
            powerDrawW: 1900,
            massKg: 430,
            costModifierCr: -20,
            specs: { Throughput: '48 Gbps', Transponders: '36 Ku / 18 C', Reliability: 'High' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'High-Power 8-Panel GaAs Solar Wings',
        systemTag: 'POWER GENERATION',
        defaultOffset: [3.4, 0, 0],
        purpose: 'Generates up to 8 kilowatts of continuous electric power needed by power-hungry RF traveling wave tube amplifiers.',
        howItWorks: 'Five-panel wings deploying on both sides of the bus driven by sun-tracking Solar Array Drive Mechanisms (SADM).',
        missionRole: 'Powers dozens of active transponders while keeping batteries charged through equinox shadow eclipses.',
        defaultOptionId: 'gaas_8kw',
        options: [
          {
            id: 'gaas_8kw',
            name: 'Dual 8 kW Extended GaAs Array',
            shortDesc: 'Industrial telecommunications scale power generation',
            powerDrawW: 0,
            massKg: 320,
            costModifierCr: 0,
            specs: { PeakPower: '8000 W', ArraySpan: '24 meters', CellType: 'Triple-Junction GaAs' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'High-Voltage GEO Battery Bank (4500 Wh)',
        systemTag: 'ELECTRICAL POWER',
        defaultOffset: [0, 1.4, 0],
        purpose: 'Sustains full telecommunication transponder operation through 72-minute equinox solar eclipses in GEO.',
        howItWorks: 'Regulated 100V power bus minimizing resistive line losses across large equipment decks.',
        missionRole: 'Prevents service blackouts for commercial and emergency communications during solar shadow passes.',
        defaultOptionId: 'li_ion_4500wh',
        options: [
          {
            id: 'li_ion_4500wh',
            name: '4500 Wh 100V Space Li-Ion Storage',
            shortDesc: 'Zero-drop power continuity during orbital shadow events',
            powerDrawW: 30,
            massKg: 190,
            costModifierCr: 0,
            specs: { Capacity: '4500 Wh', Voltage: '100 V Regulated', Cycles: '25,000' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'antenna',
        name: 'Dual 2.4m Deployable Parabolic Reflectors',
        systemTag: 'RF APERTURES',
        defaultOffset: [0, -2.0, 0],
        purpose: 'Focuses high-frequency RF signals into narrow, high-gain spot beams across targeted geographical territories.',
        howItWorks: 'Precision gold-plated molybdenum mesh surface backed by a rigid composite perimeter truss.',
        missionRole: 'Delivers 44 dBi of directive antenna gain, enabling small ground user terminals to connect reliably.',
        defaultOptionId: 'dual_24m_reflectors',
        options: [
          {
            id: 'dual_24m_reflectors',
            name: 'Dual 2.4m Deployable Mesh Reflectors',
            shortDesc: 'Dual steerable reflectors providing high directivity across continents',
            powerDrawW: 45,
            massKg: 68,
            costModifierCr: 0,
            specs: { Diameter: '2.4 m x 2', Gain: '44 dBi', SurfaceAccuracy: '0.3 mm RMS' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'Transponder & Matrix Routing Assembly',
        systemTag: 'TELECOMMUNICATIONS',
        defaultOffset: [0, 0, -1.6],
        purpose: 'Routes digital signals between feed horns and high-power amplifier banks.',
        howItWorks: 'Solid-state microwave crossbar switches with low-noise amplifiers and localized filtering.',
        missionRole: 'Allows dynamic reconfiguration of channels to match shifting global data demands.',
        defaultOptionId: 'matrix_crossbar',
        options: [
          {
            id: 'matrix_crossbar',
            name: 'RF Matrix Crossbar & Solid-State Amplifiers',
            shortDesc: 'Dynamic inter-beam signal routing with ultra-low phase noise',
            powerDrawW: 420,
            massKg: 95,
            costModifierCr: 0,
            specs: { NoiseFigure: '1.4 dB', Isolation: '45 dB', Redundancy: '2:1' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Autonomous Station-Keeping Flight Computer',
        systemTag: 'AVIONICS & AUTONOMY',
        defaultOffset: [-1.4, 0, 0],
        purpose: 'Maintains orbital box position (within 0.05 degrees) and autonomously tracks star fields.',
        howItWorks: 'Redundant flight processing cores executing closed-loop autonomous orbit and attitude determination.',
        missionRole: 'Eliminates constant ground-control interventions for routine station-keeping maneuvers.',
        defaultOptionId: 'geo_station_obc',
        options: [
          {
            id: 'geo_station_obc',
            name: 'Redundant GEO Autonomy OBC',
            shortDesc: 'Closed-loop 15-year autonomous station-keeping avionics',
            powerDrawW: 40,
            massKg: 18,
            costModifierCr: 0,
            specs: { ClockRate: '250 MHz', BoxAccuracy: '0.04 deg', FaultRecovery: '<50 ms' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Heavy Wheel Momentum Bias System',
        systemTag: 'GUIDANCE & CONTROL',
        defaultOffset: [0, -1.4, 0],
        purpose: 'Stabilizes the large satellite inertia against solar radiation pressure torque on extended arrays.',
        howItWorks: 'High-momentum reaction wheels complemented by optical Earth and Sun sensors.',
        missionRole: 'Guarantees antenna spot-beam drift stays below 0.03 degrees relative to ground reception terminals.',
        defaultOptionId: 'heavy_momentum_wheels',
        options: [
          {
            id: 'heavy_momentum_wheels',
            name: '50 Nms Momentum Wheels + Dual Earth Sensors',
            shortDesc: 'High-torque momentum management for massive commercial geostationary craft',
            powerDrawW: 85,
            massKg: 64,
            costModifierCr: 0,
            specs: { AngularMomentum: '50 Nms', Torque: '0.3 Nm', LifeExpectancy: '18 Years' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Deployable Optical Solar Reflector Radiators',
        systemTag: 'THERMAL REGULATION',
        defaultOffset: [-1.8, 1.4, 0],
        purpose: 'Dissipates massive waste heat generated by 3000 watts of high-power RF electronics into deep space.',
        howItWorks: 'Quartz mirror optical solar reflectors (OSR) paired with embedded loop heat pipes and north/south radiator panels.',
        missionRole: 'Prevents semiconductor junction breakdown in traveling wave tube amplifiers during peak broadcast hours.',
        defaultOptionId: 'osr_radiator_panels',
        options: [
          {
            id: 'osr_radiator_panels',
            name: 'North/South OSR Thermal Radiator Wings',
            shortDesc: 'Radiates up to 3.5 kW of heat without facing direct solar illumination',
            powerDrawW: 35,
            massKg: 85,
            costModifierCr: 0,
            specs: { HeatRejection: '3500 W', Surface: 'Silvered Quartz OSR', 'Alpha/Epsilon': '0.08 / 0.82' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Bi-Propellant Apogee Engine & Electric Station-Keeping',
        systemTag: 'PROPULSION',
        defaultOffset: [0, 0, -2.2],
        purpose: 'Performs initial circularization into 35,786 km GEO orbit and provides 15 years of North-South station-keeping.',
        howItWorks: '400 N liquid apogee engine (MMH/NTO) for orbit raising, paired with Xenon ion thrusters for fine station-keeping.',
        missionRole: 'Saves over 800 kg of chemical propellant mass by delegating long-term station keeping to electric thrusters.',
        defaultOptionId: 'hybrid_apogee_ion',
        options: [
          {
            id: 'hybrid_apogee_ion',
            name: 'Hybrid 400N Chemical Engine + Xenon Hall Thrusters',
            shortDesc: 'Fast apogee orbit raising combined with ultra-efficient electric station-keeping',
            powerDrawW: 650,
            massKg: 210,
            costModifierCr: 35,
            specs: { ApogeeThrust: '450 N', IonIsp: '1750 s', StationKeepingLife: '16.5 Years' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
    ],
  },

  navigation: {
    category: 'navigation',
    name: 'Navigation Satellite',
    classDesignation: 'VYOM NavNet Chronos II',
    tagline: 'Precision Positioning, Atomic Timing & Resilient Constellation Signals',
    purposeSummary: 'Provides accurate, all-weather global 3-dimensional positioning, real-time velocity metrics, and nanosecond-grade timing synchronization.',
    recommendedMissionTypes: ['orbital'],
    orbitalRegime: 'Medium Earth Orbit (20,200 km · 12-hour period)',
    baseMassKg: 2150,
    basePowerGenerationW: 2800,
    expectedLifespanYears: 12.0,
    telemetryBand: 'L-Band Navigation Carriers (L1, L2, L5) / S-Band TT&C',
    recommendationReason: 'Provides resilient time-of-flight trilateration signals essential for autonomous vehicles, aviation, maritime shipping, and defense grids.',
    detailedOverview: 'Distinguished by a conical helical phased-array L-band antenna face, quadruple atomic clock frequency standards, and radiation-shielded avionics.',
    components: [
      {
        id: 'bus',
        name: 'Octagonal High-Stability Radiation-Shielded Bus',
        systemTag: 'STRUCTURE',
        defaultOffset: [0, 0, 0],
        purpose: 'Shields atomic timing standards from the intense Van Allen trapped radiation belt electrons in MEO.',
        howItWorks: 'Tantalum-lined composite panels engineered to minimize thermal gradient shifts that could perturb atomic frequencies.',
        missionRole: 'Protects delicate resonant clocks from cosmic radiation upsets and single-event latchups.',
        defaultOptionId: 'shielded_octagonal',
        options: [
          {
            id: 'shielded_octagonal',
            name: 'Octagonal Tantalum-Shielded Bus',
            shortDesc: 'Engineered specifically for heavy Van Allen belt radiation exposure in MEO',
            powerDrawW: 0,
            massKg: 490,
            costModifierCr: 0,
            specs: { Shielding: 'Tantalum-Aluminum', RadResistance: '200 krad', Geometry: 'Octagonal Prism' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Quadruple Atomic Clock Frequency Suite',
        systemTag: 'PAYLOAD',
        defaultOffset: [0, 0, 1.5],
        purpose: 'Generates ultra-stable frequency pulses accurate to within 1 second every 3 million years.',
        howItWorks: 'Dual Rubidium Atomic Frequency Standards (RAFS) paired with dual Passive Hydrogen Masers (PHM).',
        missionRole: 'Forms the master time benchmark that makes centimeter-level ground positioning calculations possible.',
        defaultOptionId: 'quad_atomic_standard',
        options: [
          {
            id: 'quad_atomic_standard',
            name: 'Dual Hydrogen Maser + Dual Rubidium Standard',
            shortDesc: 'World-class timing stability with Allan deviation below 1x10^-14',
            powerDrawW: 260,
            massKg: 140,
            costModifierCr: 0,
            specs: { Accuracy: '1x10^-14', Clocks: '2x PHM + 2x RAFS', Drift: '<0.3 ns/day' },
            compatibleMissionTypes: ['orbital'],
          },
          {
            id: 'optical_lattice_standard',
            name: 'Next-Gen Strontium Optical Lattice Standard',
            shortDesc: 'Sub-millimeter positioning precision with 100x stability improvement',
            powerDrawW: 420,
            massKg: 175,
            costModifierCr: 40,
            specs: { Accuracy: '1x10^-16', Technology: 'Strontium Laser Lattice', Drift: '<0.01 ns/day' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'antenna',
        name: 'L-Band Phased Helical Antenna Array',
        systemTag: 'RF APERTURES',
        defaultOffset: [0, -1.8, 0],
        purpose: 'Transmits synchronized right-hand circularly polarized navigation signals across the Earth disc.',
        howItWorks: 'Circular array of cross-phased helical radiating elements shaped for uniform edge-of-earth power density.',
        missionRole: 'Ensures users at the horizon receive identical signal strength as users directly at nadir.',
        defaultOptionId: 'helical_phased_array',
        options: [
          {
            id: 'helical_phased_array',
            name: 'Shaped-Beam L-Band Helical Cluster',
            shortDesc: 'Uniform power distribution across all visible terrestrial user positions',
            powerDrawW: 480,
            massKg: 78,
            costModifierCr: 0,
            specs: { Frequencies: 'L1 (1575.42 MHz), L2, L5', BeamAngle: '28 deg cone', Polarization: 'RHCP' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'Rigid GaAs Solar Wings with Sun-Tracking Mechanism',
        systemTag: 'POWER GENERATION',
        defaultOffset: [2.8, 0, 0],
        purpose: 'Provides reliable electricity in MEO where intense particle flux slowly degrades solar cell efficiency.',
        howItWorks: 'Thick cerium-doped cover glasses protect triple-junction cells against 12 years of severe electron bombardment.',
        missionRole: 'Guarantees continuous 2.8 kW output even after decades of space radiation degradation.',
        defaultOptionId: 'rad_hard_wings',
        options: [
          {
            id: 'rad_hard_wings',
            name: 'MEO Rad-Hardened GaAs Wings (2.8 kW)',
            shortDesc: 'Designed with heavy 150-micron cover glass to resist radiation darkening',
            powerDrawW: 0,
            massKg: 165,
            costModifierCr: 0,
            specs: { PeakPower: '2800 W', EndOfLifeCapacity: '2200 W', CoverGlass: 'CeO2 Doped' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'Regulated Battery Power Unit (2200 Wh)',
        systemTag: 'ELECTRICAL POWER',
        defaultOffset: [0, 1.2, 0],
        purpose: 'Provides steady current to the sensitive atomic clocks with less than 10 microvolts of ripple noise.',
        howItWorks: 'Precision linear and switched power regulators isolated with magnetic shielding.',
        missionRole: 'Guarantees that electrical ripple does not introduce jitter into clock resonance frequencies.',
        defaultOptionId: 'ultra_low_noise_pdu',
        options: [
          {
            id: 'ultra_low_noise_pdu',
            name: 'Ultra-Low Noise 28V PDU + Li-Ion Storage',
            shortDesc: 'Ripple-free power management dedicated to atomic timing integrity',
            powerDrawW: 18,
            massKg: 95,
            costModifierCr: 0,
            specs: { NoiseRipple: '<8 uV', Storage: '2200 Wh', ThermalIsolation: 'High' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'Intersatellite Crosslink Transceiver',
        systemTag: 'TELECOMMUNICATIONS',
        defaultOffset: [0, 0, -1.4],
        purpose: 'Communicates directly between navigation satellites in the constellation without ground contact.',
        howItWorks: 'UHF/Ka-band crosslink ranging transmitters measuring relative inter-satellite distances continuously.',
        missionRole: 'Maintains full constellation navigation accuracy even if ground control stations lose network connectivity.',
        defaultOptionId: 'uhf_crosslink',
        options: [
          {
            id: 'uhf_crosslink',
            name: 'Autonomous Intersatellite Ranging Link (ISL)',
            shortDesc: 'Enables constellation autonavigation without terrestrial station contact',
            powerDrawW: 90,
            massKg: 42,
            costModifierCr: 15,
            specs: { RangeAccuracy: '<5 cm', DataRate: '50 Mbps', LinkMargin: '9 dB' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Triple-Modular Redundant Navigation Computer',
        systemTag: 'AVIONICS & AUTONOMY',
        defaultOffset: [-1.4, 0, 0],
        purpose: 'Synthesizes atomic clock outputs, computes ephemeris parameters, and modulates navigation messages.',
        howItWorks: 'Radiation-hardened FPGA signal generation boards executing hardware voting on every clock cycle.',
        missionRole: 'Generates the civil and encrypted military navigation codes broadcast worldwide.',
        defaultOptionId: 'tmr_nav_engine',
        options: [
          {
            id: 'tmr_nav_engine',
            name: 'TMR Signal Synthesis & Flight Computer',
            shortDesc: 'Hardware majority voting ensuring zero corrupted signal broadcast',
            powerDrawW: 48,
            massKg: 22,
            costModifierCr: 0,
            specs: { Channels: '32 Parallel', IntegrityCheck: 'Real-Time Hardware', SEUImmunity: 'Yes' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Earth Sensor & Zero-Momentum Reaction Wheels',
        systemTag: 'GUIDANCE & CONTROL',
        defaultOffset: [0, -1.2, -1.0],
        purpose: 'Keeps the helical antenna bore-axis pointed at Earth center while rotating solar wings continuously toward the Sun.',
        howItWorks: 'Digital horizon sensors combined with 4 high-reliability reaction wheels and magnetic unloading coils.',
        missionRole: 'Maintains antenna pointing to within 0.1 degrees to ensure uniform coverage across all continents.',
        defaultOptionId: 'zero_momentum_adcs',
        options: [
          {
            id: 'zero_momentum_adcs',
            name: '4-Wheel Zero-Momentum Control Suite',
            shortDesc: 'Continuous Earth and Sun tracking during orbital inclination passes',
            powerDrawW: 55,
            massKg: 38,
            costModifierCr: 0,
            specs: { PointingAccuracy: '0.08 deg', Wheels: '4x 8 Nms', EarthSensors: 'Dual IR' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Precision Active Temperature Stabilizer',
        systemTag: 'THERMAL REGULATION',
        defaultOffset: [-1.5, 1.2, 0],
        purpose: 'Stabilizes the atomic clock cavity to within +/-0.05 degrees Celsius regardless of external orbit temperature.',
        howItWorks: 'Proportional-integral temperature controllers operating precision thermoelectric heat pumps.',
        missionRole: 'Prevents thermal expansion of atomic resonator cavities that would cause timing frequency drift.',
        defaultOptionId: 'precision_thermoelectric',
        options: [
          {
            id: 'precision_thermoelectric',
            name: 'Thermoelectric Active Clock Thermal Enclosure',
            shortDesc: 'Isolates timing standards to +/-0.03C precision',
            powerDrawW: 65,
            massKg: 32,
            costModifierCr: 0,
            specs: { TempStability: '+/-0.03 C', ControlLoops: '8 Independent', Technology: 'Peltier Heat Pumps' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Monopropellant Hydrazine Orbit-Trimming Thrusters',
        systemTag: 'PROPULSION',
        defaultOffset: [0, 0, -1.6],
        purpose: 'Performs precise orbit slot insertion and periodic station-keeping in the 20,200 km orbital constellation plane.',
        howItWorks: 'Low-thrust pulsed hydrazine thrusters delivering fine velocity increments down to 1 mm/s.',
        missionRole: 'Keeps constellation geometry synchronized to prevent coverage blind spots over populated areas.',
        defaultOptionId: 'hydrazine_trim',
        options: [
          {
            id: 'hydrazine_trim',
            name: 'Pulsed Hydrazine Trim Thrusters (120 m/s Delta-V)',
            shortDesc: 'Fine impulse control for exact constellation phasing',
            powerDrawW: 15,
            massKg: 80,
            costModifierCr: 0,
            specs: { MinimumImpulse: '0.005 Ns', DeltaV: '120 m/s', PropellantMass: '55 kg' },
            compatibleMissionTypes: ['orbital'],
          },
        ],
      },
    ],
  },

  scientific: {
    category: 'scientific',
    name: 'Scientific / Research Satellite',
    classDesignation: 'VYOM CosmoLab Explorer V',
    tagline: 'Deep Space Astrophysics, Heliophysics & Planetary Environment Research',
    purposeSummary: 'Engineered for fundamental cosmological discoveries, exoplanet characterization, solar flare monitoring, and magnetic field mapping in deep space.',
    recommendedMissionTypes: ['astrophysics', 'planetary', 'human'],
    orbitalRegime: 'Deep Space / Sun-Earth L2 Lagrange Point (1.5 Million km from Earth)',
    baseMassKg: 2800,
    basePowerGenerationW: 3200,
    expectedLifespanYears: 10.0,
    telemetryBand: 'Deep Space Ka-Band / High-Gain Optical Laser Terminal',
    recommendationReason: 'Crucial for observing distant cosmic phenomena free from terrestrial atmospheric absorption, light pollution, and thermal noise.',
    detailedOverview: 'Features an insulated cryogenic telescope baffle, a 4-meter deployable magnetometer boom, solar radiation storm monitors, and electric ion propulsion.',
    components: [
      {
        id: 'bus',
        name: 'Cryogenically Isolated Hexagonal Truss Bus',
        systemTag: 'STRUCTURE',
        defaultOffset: [0, 0, 0],
        purpose: 'Provides physical support while mechanically and thermally decoupling delicate instruments from the spacecraft bus.',
        howItWorks: 'Beryllium-titanium low-expansion trusses supporting multi-layer Kapton sunshields.',
        missionRole: 'Eliminates structural distortion and micro-vibrations that could blur deep-sky exposures.',
        defaultOptionId: 'cryo_truss_hex',
        options: [
          {
            id: 'cryo_truss_hex',
            name: 'Beryllium Low-Expansion Hexagonal Truss',
            shortDesc: 'Ultra-low coefficient of thermal expansion with zero outgassing',
            powerDrawW: 0,
            massKg: 460,
            costModifierCr: 0,
            specs: { Material: 'Beryllium-Titanium', Outgassing: '<0.01%', MicroVibration: 'Damped' },
            compatibleMissionTypes: ['astrophysics', 'planetary', 'human'],
          },
        ],
      },
      {
        id: 'payload',
        name: 'Cryogenic Deep-Space Telescope & Sensor Suite',
        systemTag: 'PAYLOAD',
        defaultOffset: [0, 0, 2.2],
        purpose: 'Collects faint photons from the early universe, exoplanet atmospheres, and high-energy cosmic rays.',
        howItWorks: '1.2-meter gold-coated beryllium primary mirror feeding an infrared spectrometer cooled to 7 Kelvin.',
        missionRole: 'Executes core cosmological science, detecting redshifted light from ancient galaxies and exoplanet chemical fingerprints.',
        defaultOptionId: 'infrared_cryo_telescope',
        options: [
          {
            id: 'infrared_cryo_telescope',
            name: '1.2m Cryogenic Infrared Telescope + Spectrometer',
            shortDesc: 'Deep-field cosmic infrared exploration cooled to 7K for zero thermal background noise',
            powerDrawW: 420,
            massKg: 580,
            costModifierCr: 0,
            specs: { MirrorDiameter: '1.2 m', Wavelength: '0.6 - 28 um', OperatingTemp: '7 Kelvin' },
            compatibleMissionTypes: ['astrophysics'],
          },
          {
            id: 'planetary_geophysics_suite',
            name: 'Planetary Radar Sounder + Mass Spectrometer',
            shortDesc: 'Subsurface ice exploration and atmospheric sample analysis',
            powerDrawW: 340,
            massKg: 380,
            costModifierCr: -15,
            specs: { RadarPenetration: 'Up to 3 km', SpectrometerRange: '1-1000 amu', Sensors: 'Dual In-Situ' },
            compatibleMissionTypes: ['planetary', 'human'],
          },
          {
            id: 'solar_heliophysics_suite',
            name: 'Extreme UV Solar Imager + Coronagraph',
            shortDesc: 'Solar flare, coronal mass ejection, and magnetic reconnection observatory',
            powerDrawW: 290,
            massKg: 320,
            costModifierCr: -20,
            specs: { UVRange: '17 - 34 nm', Cadence: '1 image/10s', FieldOfView: '1.4 Solar Radii' },
            compatibleMissionTypes: ['astrophysics', 'orbital'],
          },
        ],
      },
      {
        id: 'antenna',
        name: 'High-Gain Deep Space Reflector & Magnetometer Boom',
        systemTag: 'RF APERTURES & BOOMS',
        defaultOffset: [0, -2.4, 0],
        purpose: 'Communicates across millions of kilometers with the Deep Space Network and isolates magnetometer sensors.',
        howItWorks: 'Carbon-silicon carbide 2.0-meter parabolic dish with a 4-meter non-magnetic deployable carbon boom.',
        missionRole: 'Measures interplanetary magnetic field flux without interference from spacecraft electrical currents.',
        defaultOptionId: 'deep_space_dish_boom',
        options: [
          {
            id: 'deep_space_dish_boom',
            name: '2.0m Deep Space Dish + 4m Non-Magnetic Boom',
            shortDesc: 'Dual-purpose high-gain dish and isolated magnetic sensor boom',
            powerDrawW: 55,
            massKg: 62,
            costModifierCr: 0,
            specs: { Gain: '48 dBi (Ka-Band)', BoomLength: '4.2 m', BoomMaterial: 'Non-Magnetic CFRP' },
            compatibleMissionTypes: ['astrophysics', 'planetary'],
          },
        ],
      },
      {
        id: 'solar_panels',
        name: 'Sunshield-Integrated Photovoltaic Array',
        systemTag: 'POWER GENERATION',
        defaultOffset: [3.2, 0, 0],
        purpose: 'Generates electricity while acting as a physical thermal umbrella that keeps the scientific telescope in perpetual shade.',
        howItWorks: 'Gallium arsenide cells mounted onto the sunward facing side of multi-layer Kapton foil insulation.',
        missionRole: 'Supplies power without directing any thermal heat back into the cold optical focal plane.',
        defaultOptionId: 'sunshield_integrated_array',
        options: [
          {
            id: 'sunshield_integrated_array',
            name: 'Sunshield-Integrated Solar Membrane (3.2 kW)',
            shortDesc: 'Combined thermal barrier and power generator for Lagrange and deep space missions',
            powerDrawW: 0,
            massKg: 210,
            costModifierCr: 0,
            specs: { Output: '3200 W', ThermalDrop: '>300 K across shield', Layers: '5x Kapton' },
            compatibleMissionTypes: ['astrophysics', 'planetary'],
          },
        ],
      },
      {
        id: 'power_system',
        name: 'Deep Space Power Conditioning & Energy Storage',
        systemTag: 'ELECTRICAL POWER',
        defaultOffset: [0, 1.4, 0],
        purpose: 'Powers closed-cycle cryocoolers, instrument electronics, and ion thrusters.',
        howItWorks: 'Long-life Li-Ion battery pack with radiation-isolated charging electronics.',
        missionRole: 'Maintains telescope detector thermal stability and attitude sensors during non-sun pointing observational slews.',
        defaultOptionId: 'deep_space_pdu_2600wh',
        options: [
          {
            id: 'deep_space_pdu_2600wh',
            name: '2600 Wh Deep Space Power System',
            shortDesc: 'High-reliability power distribution with dedicated cryocooler feed',
            powerDrawW: 22,
            massKg: 115,
            costModifierCr: 0,
            specs: { Capacity: '2600 Wh', BusChannels: '28V & 100V', Efficiency: '96%' },
            compatibleMissionTypes: ['astrophysics', 'planetary', 'human'],
          },
        ],
      },
      {
        id: 'communication',
        name: 'Ka-Band Deep Space Transponder & Laser Link',
        systemTag: 'TELECOMMUNICATIONS',
        defaultOffset: [0, 0, -1.8],
        purpose: 'Transmits vast scientific datasets across millions of kilometers back to Earth stations.',
        howItWorks: '32 GHz Ka-band travelling wave tube amplifiers coupled with an optional deep space optical laser terminal.',
        missionRole: 'Permits full-resolution transmission of uncompressed multi-gigabyte astronomical image cubes.',
        defaultOptionId: 'ka_deep_space',
        options: [
          {
            id: 'ka_deep_space',
            name: '32 GHz Deep Space Ka-Band Transceiver',
            shortDesc: 'High-gain deep space communications verified across 2 AU distance',
            powerDrawW: 140,
            massKg: 44,
            costModifierCr: 0,
            specs: { Frequency: '32 GHz', DataRate: '50 Mbps at 1.5M km', RFPower: '50 W' },
            compatibleMissionTypes: ['astrophysics', 'planetary'],
          },
        ],
      },
      {
        id: 'obc',
        name: 'Scientific Data Processing & Autonomy Flight Computer',
        systemTag: 'AVIONICS & AUTONOMY',
        defaultOffset: [-1.4, 0, 0],
        purpose: 'Processes raw detector frames, performs onboard cosmic ray rejection, and autonomously schedules observations.',
        howItWorks: 'Quad-core rad-hardened processor with hardware wavelet image compression accelerators.',
        missionRole: 'Compresses scientific data by 8x without loss, multiplying effective deep space downlink bandwidth.',
        defaultOptionId: 'sci_processing_obc',
        options: [
          {
            id: 'sci_processing_obc',
            name: 'Science Image Processing & Autonomy OBC',
            shortDesc: 'Hardware-accelerated data compression and autonomous target tracking',
            powerDrawW: 55,
            massKg: 24,
            costModifierCr: 0,
            specs: { Processing: '800 MIPS', OnboardStorage: '1 TB Solid-State', Compression: 'Hardware Wavelet' },
            compatibleMissionTypes: ['astrophysics', 'planetary', 'human'],
          },
        ],
      },
      {
        id: 'adcs',
        name: 'Ultra-Quiet Micro-Vibration ADCS & Star Trackers',
        systemTag: 'GUIDANCE & CONTROL',
        defaultOffset: [0, -1.2, -1.2],
        purpose: 'Steers the telescope line-of-sight toward distant stars with sub-milliarcsecond pointing precision.',
        howItWorks: 'Magnetic-bearing reaction wheels isolated on viscoelastic shock mounts plus fine guidance sensors.',
        missionRole: 'Permits 10-hour continuous exposures of deep space galaxies without any image smearing or jitter.',
        defaultOptionId: 'sub_milliarcsec_adcs',
        options: [
          {
            id: 'sub_milliarcsec_adcs',
            name: 'Viscoelastic-Isolated Reaction Wheels & Fine Guidance',
            shortDesc: 'Sub-milliarcsecond pointing jitter essential for exoplanet transit detections',
            powerDrawW: 60,
            massKg: 52,
            costModifierCr: 0,
            specs: { Jitter: '0.005 arcsec', Isolation: 'Active Magnetic', StarTrackers: '3x Autonomous' },
            compatibleMissionTypes: ['astrophysics', 'planetary'],
          },
        ],
      },
      {
        id: 'thermal',
        name: 'Closed-Cycle Helium Pulse Tube Cryocooler',
        systemTag: 'THERMAL REGULATION',
        defaultOffset: [-1.8, 1.4, 0],
        purpose: 'Cools the scientific infrared sensors down to absolute cryogenic temperatures (7 Kelvin).',
        howItWorks: 'Stirling/pulse-tube thermodynamic expansion cycle circulating high-purity Helium gas.',
        missionRole: 'Eliminates internal instrument heat so detectors can register infinitesimal thermal signatures from early galaxies.',
        defaultOptionId: 'pulse_tube_cryocooler',
        options: [
          {
            id: 'pulse_tube_cryocooler',
            name: 'Closed-Cycle Helium Cryocooler (7K Operation)',
            shortDesc: 'Vibration-free thermodynamic cooling without consumable liquid cryogen',
            powerDrawW: 180,
            massKg: 68,
            costModifierCr: 30,
            specs: { ColdTipTemp: '7.2 Kelvin', CoolingPower: '200 mW at 8K', Lifetime: '>12 Years' },
            compatibleMissionTypes: ['astrophysics'],
          },
        ],
      },
      {
        id: 'propulsion',
        name: 'Xenon Hall-Effect High-Efficiency Ion Engine',
        systemTag: 'PROPULSION',
        defaultOffset: [0, 0, -2.4],
        purpose: 'Provides gentle, continuous thrust to maintain unstable halo orbits around Sun-Earth Lagrange points (L2).',
        howItWorks: 'Electrostatic ionization of Xenon gas accelerated across a 300V magnetic potential at 30 km/s exhaust velocity.',
        missionRole: 'Consumes less than 40 grams of propellant per month, extending deep space science operations for over a decade.',
        defaultOptionId: 'xenon_hall_ion',
        options: [
          {
            id: 'xenon_hall_ion',
            name: 'Xenon Hall-Effect Ion Thruster (1800s Isp)',
            shortDesc: 'Continuous ultra-high efficiency electric propulsion for Lagrange orbit maintenance',
            powerDrawW: 420,
            massKg: 85,
            costModifierCr: 25,
            specs: { Thrust: '80 mN', Isp: '1800 s', Propellant: 'Xenon (60 kg tank)' },
            compatibleMissionTypes: ['astrophysics', 'planetary'],
          },
        ],
      },
    ],
  },
};

/**
 * Recommends an optimal satellite category based on the user's mission configuration
 */
export function getRecommendedSatellite(
  missionType?: MissionType | null,
  destination?: string | null,
  missionName?: string | null
): { category: SatelliteCategory; reason: string } {
  const name = (missionName || '').toLowerCase();
  const type = (missionType || 'orbital').toLowerCase();
  const dest = (destination || 'earth-orbit').toLowerCase();

  // 1. Human / Crewed Missions
  if (
    name.includes('crew') ||
    name.includes('human') ||
    name.includes('gaganyaan') ||
    name.includes('chandrayaan') ||
    type === 'human'
  ) {
    return {
      category: 'crewed_capsule',
      reason: 'Your mission targets crewed human spaceflight. The Crewed Exploration Capsule provides an autonomous ECLSS life-support cabin, ablative PICA-X heat shield for re-entry, and service propulsion.',
    };
  }

  // 2. Deep Space / Planetary Probes
  if (
    name.includes('mars') ||
    name.includes('probe') ||
    name.includes('mangalyaan') ||
    type === 'planetary' ||
    dest.includes('mars') ||
    dest.includes('jupiter')
  ) {
    return {
      category: 'planetary_probe',
      reason: 'Planetary deep space missions require long-range autonomous navigation, deep-space Ka/X-band parabolic communications, and radiation-shielded RTG power.',
    };
  }

  // 3. Astrophysics / Space Telescopes
  if (
    name.includes('astrosat') ||
    name.includes('telescope') ||
    type === 'astrophysics' ||
    dest.includes('lagrange')
  ) {
    return {
      category: 'scientific',
      reason: 'Deep space astrophysical research requires high optical precision, cryogenic sunshield isolation, and arcsecond-level pointing stability.',
    };
  }

  // 4. Telecom / Relay
  if (dest.includes('geo') || name.includes('telecom') || name.includes('gsat') || name.includes('comm')) {
    return {
      category: 'communication',
      reason: 'Geostationary and orbital relay missions demand high-throughput transponders, large reflector dishes, and robust station-keeping propulsion.',
    };
  }

  return {
    category: 'earth_observation',
    reason: 'Low Earth Orbit (LEO) observation missions achieve optimal coverage with Sun-synchronous optical and radar sensing payloads.',
  };
}

/**
 * Calculates current spacecraft parameters based on selected components
 */
export function calculateSatelliteSpecs(
  category: SatelliteCategory,
  selectedOptions: Record<SatelliteComponentId, string>,
  baseBudgetCr: number
): {
  totalMassKg: number;
  totalPowerDrawW: number;
  powerGenerationW: number;
  netPowerMarginW: number;
  totalCostCr: number;
  isPowerViable: boolean;
  isBudgetViable: boolean;
  warnings: string[];
} {
  const def = SATELLITE_DEFINITIONS[category] || SATELLITE_DEFINITIONS['earth_observation'];
  let totalMass = def.baseMassKg;
  let totalPowerDraw = 0;
  let powerGeneration = def.basePowerGenerationW;
  let costAdjustment = 0;
  const warnings: string[] = [];

  def.components.forEach((comp) => {
    const selectedId = selectedOptions[comp.id] || comp.defaultOptionId;
    const option = comp.options.find((o) => o.id === selectedId) || comp.options[0];
    if (option) {
      totalMass += option.massKg;
      totalPowerDraw += option.powerDrawW;
      costAdjustment += option.costModifierCr;

      if (comp.id === 'solar_panels') {
        if (selectedId === 'extended_high_output') powerGeneration = 3600;
        if (selectedId === 'gaas_8kw') powerGeneration = 8000;
        if (selectedId === 'extended_tri_wing') powerGeneration = 4800;
        if (selectedId === 'dual_wing_gaas') powerGeneration = 3200;
        if (selectedId === 'concentrator_wings') powerGeneration = 2200;
      }

      if (option.incompatibleWarning) {
        warnings.push(option.incompatibleWarning);
      }
    }
  });

  const netPowerMargin = powerGeneration - totalPowerDraw;
  const isPowerViable = netPowerMargin >= 0;

  if (netPowerMargin < 0) {
    warnings.push(`Power deficit detected: Subsystem draw exceeds generation by ${Math.abs(netPowerMargin)} W.`);
  }

  const totalCost = Math.max(10, baseBudgetCr + costAdjustment);
  const isBudgetViable = totalCost <= baseBudgetCr * 1.5;

  return {
    totalMassKg: Math.round(totalMass),
    totalPowerDrawW: Math.round(totalPowerDraw),
    powerGenerationW: Math.round(powerGeneration),
    netPowerMarginW: Math.round(netPowerMargin),
    totalCostCr: parseFloat(totalCost.toFixed(1)),
    isPowerViable,
    isBudgetViable,
    warnings,
  };
}

/**
 * Converts configured satellite state into the legacy SatelliteConfig expected by VYOM stores and services
 */
export function exportToLegacySatelliteConfig(
  category: SatelliteCategory,
  selectedOptions: Record<SatelliteComponentId, string>,
  specs: ReturnType<typeof calculateSatelliteSpecs>
): SatelliteConfig {
  const def = SATELLITE_DEFINITIONS[category] || SATELLITE_DEFINITIONS['earth_observation'];

  const payloadOption = def.components
    .find((c) => c.id === 'payload')
    ?.options.find((o) => o.id === selectedOptions['payload']);

  const propOption = def.components
    .find((c) => c.id === 'propulsion')
    ?.options.find((o) => o.id === selectedOptions['propulsion']);

  const antennaOption = def.components
    .find((c) => c.id === 'antenna')
    ?.options.find((o) => o.id === selectedOptions['antenna']);

  const thermalOption = def.components
    .find((c) => c.id === 'thermal')
    ?.options.find((o) => o.id === selectedOptions['thermal']);

  return {
    type: def.name,
    body: `${def.classDesignation} — ${def.orbitalRegime}`,
    solarPanels: category === 'communication' ? 8 : category === 'crewed_capsule' ? 4 : category === 'scientific' ? 4 : 2,
    batteryCapacityWh: category === 'crewed_capsule' ? 8000 : category === 'communication' ? 4500 : category === 'scientific' ? 2600 : 1800,
    antennaGainDb: antennaOption?.specs['Gain'] ? parseInt(antennaOption.specs['Gain']) : 32,
    payloadType: payloadOption?.name ?? def.components[1]?.name ?? 'Primary Mission Payload',
    propulsionType: propOption?.name ?? def.components[9]?.name ?? 'Propulsion Unit',
    thermalControl: thermalOption?.name ?? def.components[8]?.name ?? 'Thermal Control',
    redundancy: 3,
    subsystems: [
      { name: 'Power & Solar Subsystem', health: 100, status: 'nominal', temperature: 19.5 },
      { name: 'Thermal Radiators & MLI', health: 100, status: 'nominal', temperature: 22.0 },
      { name: 'ADCS (Reaction Wheels)', health: 100, status: 'nominal', temperature: 28.5 },
      { name: 'Communications & Antennas', health: 100, status: 'nominal', temperature: 26.0 },
      { name: 'Primary Mission Payload', health: 100, status: 'nominal', temperature: 31.0 },
      { name: 'Propulsion & Station-Keeping', health: 100, status: 'nominal', temperature: 18.0 },
      { name: 'On-Board Autonomy OBC', health: 100, status: 'nominal', temperature: 38.2 },
    ],
    dataSource: 'model-estimate',
  };
}
