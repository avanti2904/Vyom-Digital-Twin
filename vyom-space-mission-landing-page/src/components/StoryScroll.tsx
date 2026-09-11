import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function StoryScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track cursor position for subtle interactive depth in this section
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // only track if section is in or near viewport
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePos({ x: nx, y: ny });
      }
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  // Phase 1: 0.00 -> 0.22 ("Space missions are complex.")
  const op1 = useTransform(scrollYProgress, [0.0, 0.05, 0.17, 0.24], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0.0, 0.05, 0.24], [40, 0, -40]);

  // Phase 2: 0.26 -> 0.48 ("Mission data and information are often difficult to understand.")
  const op2 = useTransform(scrollYProgress, [0.24, 0.29, 0.44, 0.50], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.24, 0.29, 0.50], [40, 0, -40]);

  // Phase 3: 0.52 -> 0.72 ("VYOM makes space easier to explore and understand.")
  const op3 = useTransform(scrollYProgress, [0.50, 0.55, 0.69, 0.75], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.50, 0.55, 0.75], [40, 0, -40]);

  // Phase 4: 0.76 -> 1.00 ("Meet VYOM" + intro paragraph)
  const op4 = useTransform(scrollYProgress, [0.74, 0.80, 1.0], [0, 1, 1]);
  const y4 = useTransform(scrollYProgress, [0.74, 0.80, 1.0], [40, 0, 0]);

  // Visual transformations driven by scroll
  // Trajectory drawing along the path
  const trajDashOffset = useTransform(scrollYProgress, [0.02, 0.65], [1100, 0]);

  // Spacecraft progress along the trajectory
  const craftProgress = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  // Orbital paths opacity and scale
  const orbit1Opacity = useTransform(scrollYProgress, [0.0, 0.2, 0.8, 1.0], [0.15, 0.45, 0.55, 0.3]);
  const orbit2Opacity = useTransform(scrollYProgress, [0.15, 0.45, 0.75, 1.0], [0, 0.4, 0.6, 0.35]);
  const orbitRotation = useTransform(scrollYProgress, [0, 1], [0, 120]);

  // Abstract data scatter -> organized convergence
  // In Phase 2: elements are scattered. In Phase 3 & 4: converge into clean alignment
  const convergence = useTransform(scrollYProgress, [0.35, 0.65], [0, 1]);

  // Parallax star and nebula movement
  const nebulaY = useTransform(scrollYProgress, [0, 1], [-40, 80]);
  const particlesY = useTransform(scrollYProgress, [0, 1], [30, -70]);

  // Progress bar indicator on left side
  const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="intro" ref={containerRef} className="relative h-[480vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-space-950">
        {/* ========================================================
            BACKGROUND ATMOSPHERE & PARALLAX NEBULA
            ======================================================== */}
        <motion.div
          style={{ y: nebulaY }}
          className="pointer-events-none absolute inset-0"
        >
          {/* Deep blue cosmic glow washes */}
          <div className="absolute top-[15%] left-[20%] h-[60vh] w-[60vh] rounded-full bg-[radial-gradient(circle,rgba(31,95,214,0.18),transparent_65%)] blur-3xl" />
          <div className="absolute top-[45%] right-[15%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(15,47,102,0.4),transparent_65%)] blur-3xl" />
          <div className="absolute bottom-[10%] left-[40%] h-[50vh] w-[50vh] rounded-full bg-[radial-gradient(circle,rgba(124,196,255,0.1),transparent_60%)] blur-2xl" />
        </motion.div>

        {/* ========================================================
            DYNAMIC SPACE VISUALS CANVAS (ORBITS, TRAJECTORIES, DATA)
            ======================================================== */}
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
          }}
        >
          {/* SVG canvas for smooth vector orbital paths and trajectory */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="trajGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1f5fd6" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#bfe3ff" stopOpacity="1" />
              </linearGradient>

              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#bfe3ff" stopOpacity="1" />
                <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Orbit 1: Wide elliptical orbital path */}
            <g transform="translate(720, 450)">
              <motion.ellipse
                rx="520"
                ry="230"
                fill="none"
                stroke="rgba(124, 196, 255, 0.25)"
                strokeWidth="1.2"
                strokeDasharray="4 8"
                style={{
                  opacity: orbit1Opacity,
                  rotate: orbitRotation,
                }}
              />
            </g>

            {/* Orbit 2: Inclined secondary orbit */}
            <g transform="translate(720, 450) rotate(-28)">
              <motion.ellipse
                rx="420"
                ry="170"
                fill="none"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="1"
                style={{
                  opacity: orbit2Opacity,
                }}
              />
            </g>

            {/* Orbit 3: Inner tight orbit */}
            <g transform="translate(720, 450) rotate(35)">
              <motion.ellipse
                rx="280"
                ry="110"
                fill="none"
                stroke="rgba(124, 196, 255, 0.2)"
                strokeWidth="1"
                strokeDasharray="2 6"
                style={{
                  opacity: orbit2Opacity,
                }}
              />
            </g>

            {/* Drawn Mission Trajectory Arc (curves smoothly through space) */}
            <path
              id="missionTrajectory"
              d="M 120 720 C 380 620, 440 240, 720 320 C 980 400, 1160 220, 1340 160"
              fill="none"
              stroke="rgba(31, 95, 214, 0.2)"
              strokeWidth="2"
            />
            <motion.path
              d="M 120 720 C 380 620, 440 240, 720 320 C 980 400, 1160 220, 1340 160"
              fill="none"
              stroke="url(#trajGrad)"
              strokeWidth="2.5"
              strokeDasharray="1100"
              style={{ strokeDashoffset: trajDashOffset }}
            />

            {/* Trajectory Waypoints with soft glow */}
            <circle cx="120" cy="720" r="14" fill="url(#nodeGlow)" />
            <circle cx="120" cy="720" r="3" fill="#ffffff" />

            <circle cx="720" cy="320" r="16" fill="url(#nodeGlow)" />
            <circle cx="720" cy="320" r="3.5" fill="#ffffff" />

            <circle cx="1340" cy="160" r="18" fill="url(#nodeGlow)" />
            <circle cx="1340" cy="160" r="4" fill="#ffffff" />
          </svg>

          {/* Interactive Floating Spacecraft element following the trajectory */}
          <motion.div
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: useTransform(
                craftProgress,
                [0, 0.35, 0.65, 1],
                ["12%", "38%", "68%", "92%"]
              ),
              top: useTransform(
                craftProgress,
                [0, 0.35, 0.65, 1],
                ["76%", "34%", "38%", "18%"]
              ),
            }}
          >
            {/* Spacecraft light trail / glow */}
            <div className="absolute inset-0 -m-2 rounded-full bg-sky-glow/30 blur-md animate-pulse-glow" />
            {/* Spacecraft body: geometric modern hull without icons */}
            <div className="relative h-3 w-3 rounded-full bg-ice shadow-[0_0_12px_rgba(191,227,255,1)]" />
            {/* Subtly angled solar panel slivers */}
            <div className="absolute top-1/2 left-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 bg-cosmic-400/80 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
          </motion.div>

          {/* Abstract Mission Data Elements:
              Scatter in Phase 2 -> Converge into organized layout in Phase 3/4 */}
          <motion.div style={{ y: particlesY }} className="absolute inset-0">
            {/* Abstract node 1 */}
            <motion.div
              className="absolute rounded-lg border border-sky-glow/20 bg-space-900/60 px-3 py-1.5 backdrop-blur-sm"
              style={{
                left: useTransform(convergence, [0, 1], ["14%", "28%"]),
                top: useTransform(convergence, [0, 1], ["24%", "36%"]),
                opacity: useTransform(scrollYProgress, [0.2, 0.3, 0.7, 0.85], [0, 0.75, 0.75, 0.2]),
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-glow animate-pulse-glow" />
                <span className="font-display text-[10px] tracking-widest text-ice/70 uppercase">
                  ALT 420 KM · V 7.6 KM/S
                </span>
              </div>
            </motion.div>

            {/* Abstract node 2 */}
            <motion.div
              className="absolute rounded-lg border border-sky-glow/20 bg-space-900/60 px-3 py-1.5 backdrop-blur-sm"
              style={{
                right: useTransform(convergence, [0, 1], ["12%", "28%"]),
                top: useTransform(convergence, [0, 1], ["68%", "36%"]),
                opacity: useTransform(scrollYProgress, [0.22, 0.32, 0.7, 0.85], [0, 0.75, 0.75, 0.2]),
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cosmic-400 animate-pulse-glow" />
                <span className="font-display text-[10px] tracking-widest text-ice/70 uppercase">
                  ORBIT INC 51.6° · ECC 0.0008
                </span>
              </div>
            </motion.div>

            {/* Abstract node 3 */}
            <motion.div
              className="absolute rounded-lg border border-sky-glow/20 bg-space-900/60 px-3 py-1.5 backdrop-blur-sm"
              style={{
                left: useTransform(convergence, [0, 1], ["65%", "50%"]),
                bottom: useTransform(convergence, [0, 1], ["18%", "26%"]),
                transform: "translateX(-50%)",
                opacity: useTransform(scrollYProgress, [0.25, 0.35, 0.7, 0.85], [0, 0.75, 0.75, 0.2]),
              }}
            >
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ice animate-pulse-glow" />
                <span className="font-display text-[10px] tracking-widest text-ice/70 uppercase">
                  TELEMETRY SYNC · ACTIVE
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating luminous particles */}
          {[
            { top: "18%", left: "22%", size: 3, delay: "0s" },
            { top: "72%", left: "15%", size: 2.5, delay: "1.2s" },
            { top: "28%", left: "80%", size: 2, delay: "0.6s" },
            { top: "62%", left: "85%", size: 3, delay: "2.1s" },
            { top: "82%", left: "55%", size: 2, delay: "1.8s" },
          ].map((p, i) => (
            <div
              key={i}
              className="drift-particle"
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        {/* ========================================================
            SCROLL PROGRESS RAIL (LEFT SIDE)
            ======================================================== */}
        <div className="absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex lg:left-12">
          <span className="font-display text-[9px] uppercase tracking-[0.3em] text-ice/40">
            Phase
          </span>
          <div className="relative h-44 w-px bg-sky-glow/15">
            <motion.div
              style={{ height: progressHeight }}
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-sky-glow to-cosmic-500 shadow-[0_0_8px_rgba(124,196,255,0.8)]"
            />
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-sky-glow/60" />
        </div>

        {/* ========================================================
            CINEMATIC STATEMENTS OVERLAY
            ======================================================== */}
        <div className="relative flex h-full w-full items-center justify-center px-6">
          {/* Statement 1: "Space missions are complex." */}
          <motion.div
            style={{ opacity: op1, y: y1 }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-sky-glow/60" />
              <span className="font-display text-[11px] uppercase tracking-[0.4em] text-sky-glow">
                The Challenge
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-sky-glow/60" />
            </div>
            <h2 className="max-w-4xl font-display text-[clamp(2.2rem,6.5vw,4.8rem)] font-bold leading-[1.08] text-white">
              Space missions are{" "}
              <span className="text-gradient-blue text-glow">complex.</span>
            </h2>
          </motion.div>

          {/* Statement 2: "Mission data and information are often difficult to understand." */}
          <motion.div
            style={{ opacity: op2, y: y2 }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-sky-glow/60" />
              <span className="font-display text-[11px] uppercase tracking-[0.4em] text-sky-glow">
                The Reality
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-sky-glow/60" />
            </div>
            <h2 className="max-w-4xl font-display text-[clamp(2rem,5.5vw,4.2rem)] font-bold leading-[1.12] text-white">
              Mission data and information are often{" "}
              <span className="text-gradient-blue text-glow">
                difficult to understand.
              </span>
            </h2>
          </motion.div>

          {/* Statement 3: "VYOM makes space easier to explore and understand." */}
          <motion.div
            style={{ opacity: op3, y: y3 }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-sky-glow/60" />
              <span className="font-display text-[11px] uppercase tracking-[0.4em] text-sky-glow">
                The Vision
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-sky-glow/60" />
            </div>
            <h2 className="max-w-4xl font-display text-[clamp(2.2rem,6vw,4.6rem)] font-bold leading-[1.1] text-white">
              VYOM makes space{" "}
              <span className="text-gradient-blue text-glow">
                easier to explore and understand.
              </span>
            </h2>
          </motion.div>

          {/* Statement 4: "Meet VYOM" + Intro paragraph */}
          <motion.div
            style={{ opacity: op4, y: y4 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-glow/60" />
              <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
                Introducing The Platform
              </span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-glow/60" />
            </div>

            <h2
              data-cursor="hover"
              className="font-display text-glow text-[clamp(3.2rem,9vw,6.8rem)] font-bold leading-[0.95] tracking-[0.08em] text-gradient-blue"
            >
              Meet VYOM
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-[16px] leading-relaxed text-ice/80 sm:text-lg">
              VYOM is an interactive Space Mission Digital Twin platform that helps users
              explore, visualize and understand space missions through interactive
              experiences.
            </p>

            {/* Quick entry links into the rest of the journey */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a href="#create" className="btn-primary px-8 py-3.5 text-sm">
                Create Mission
              </a>
              <a href="#demo" className="btn-ghost px-8 py-3.5 text-sm border-sky-glow/40">
                Try Demo Mission
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom subtle edge divider into next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-space-950" />
      </div>
    </section>
  );
}
