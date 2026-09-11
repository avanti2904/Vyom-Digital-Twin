import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

const PARTICLES: { top: string; left: string; size: number; delay: number; dur: number }[] = [
  { top: "22%", left: "12%", size: 3, delay: 0, dur: 9 },
  { top: "34%", left: "84%", size: 2, delay: 1.4, dur: 11 },
  { top: "62%", left: "8%", size: 2, delay: 2.6, dur: 10 },
  { top: "18%", left: "68%", size: 3, delay: 0.8, dur: 12 },
  { top: "72%", left: "78%", size: 2, delay: 3.4, dur: 9 },
  { top: "48%", left: "92%", size: 2, delay: 1.9, dur: 13 },
  { top: "80%", left: "30%", size: 3, delay: 4.2, dur: 10 },
  { top: "28%", left: "40%", size: 2, delay: 5.1, dur: 11 },
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // cinematic parallax: content drifts up and fades as you leave the hero
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const ringsY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const ringsScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);

  return (
    <section ref={ref} id="home" className="relative min-h-screen overflow-hidden">
      {/* ---- atmospheric depth layers ---- */}
      <div className="pointer-events-none absolute inset-0">
        {/* deep nebula washes */}
        <div className="animate-aurora absolute -top-[20%] left-[8%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(31,95,214,0.22),transparent_62%)] blur-3xl" />
        <div className="animate-aurora-late absolute top-[30%] right-[-12%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(15,47,102,0.5),transparent_62%)] blur-3xl" />
        <div className="animate-aurora absolute bottom-[-10%] left-[30%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,rgba(124,196,255,0.1),transparent_58%)] blur-2xl" />

        {/* central luminous core behind the title */}
        <div className="absolute left-1/2 top-1/2 h-[64vh] w-[64vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),rgba(31,95,214,0.06)_45%,transparent_70%)] blur-xl" />

        {/* slow rotating orbital rings — elegant space geometry, no icons */}
        <motion.div
          style={{ y: ringsY, scale: ringsScale }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="animate-spin-slower relative h-[52vh] w-[52vh] rounded-full border border-sky-glow/12 sm:h-[64vh] sm:w-[64vh]">
            <span className="absolute left-1/2 -top-[3px] h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-sky-glow/80 shadow-[0_0_14px_rgba(124,196,255,0.95)]" />
          </div>
          <div className="animate-spin-slow absolute left-1/2 top-1/2 h-[72vh] w-[72vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-glow/8 sm:h-[88vh] sm:w-[88vh]">
            <span className="absolute top-1/2 -right-[2.5px] h-[5px] w-[5px] -translate-y-1/2 rounded-full bg-ice/70 shadow-[0_0_10px_rgba(191,227,255,0.9)]" />
          </div>
          <div className="absolute left-1/2 top-1/2 h-[38vh] w-[38vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cosmic-400/10 sm:h-[46vh] sm:w-[46vh]" />
        </motion.div>

        {/* floating glow particles */}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="drift-particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}

        {/* occasional shooting stars */}
        <span className="shooting-star" style={{ top: "16%", left: "78%" }} />
        <span className="shooting-star" style={{ top: "8%", left: "45%", animationDelay: "6.5s", animationDuration: "15s" }} />

        {/* horizon light at the base — the journey begins here */}
        <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[radial-gradient(ellipse_at_50%_130%,rgba(31,95,214,0.28),rgba(10,33,72,0.12)_50%,transparent_75%)]" />
        <div className="absolute inset-x-[8%] bottom-[8vh] hairline opacity-70" />

        {/* fade into the story section */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-space-950" />
      </div>

      {/* ---- content ---- */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-5 pt-28 pb-24 text-center lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease }}
          className="mb-8 flex items-center gap-4"
        >
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-sky-glow/70" />
          <span className="font-display text-[11px] font-medium uppercase tracking-[0.45em] text-sky-glow">
            Space Mission Digital Twin
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-sky-glow/70" />
        </motion.div>

        {/* staggered letter reveal */}
        <h1
          data-cursor="hover"
          className="font-display text-glow text-[clamp(4.6rem,17vw,12rem)] font-bold leading-[0.9] tracking-[0.14em]"
        >
          {"VYOM".split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 70, filter: "blur(16px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.2, delay: 0.35 + i * 0.13, ease }}
              className="inline-block text-gradient-blue"
            >
              {ch}
            </motion.span>
          ))}
        </h1>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.95, ease }}
          className="mt-6 font-display text-[clamp(1rem,3vw,1.8rem)] font-medium uppercase tracking-[0.34em] text-ice"
        >
          Space Mission Digital&nbsp;Twin
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15, ease }}
          className="mt-6 font-display text-lg font-medium tracking-[0.14em] text-sky-glow/90 sm:text-xl"
        >
          Explore. Simulate. Understand.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease }}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-ice/65 sm:text-base"
        >
          An interactive platform that transforms complex space missions into visual,
          understandable and engaging digital experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5, ease }}
          className="mt-11 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row"
        >
          <a href="#create" className="btn-primary w-full px-10 py-4 text-base sm:w-auto">
            Create Mission
          </a>
          <a href="#demo" className="btn-ghost w-full px-10 py-4 text-base sm:w-auto">
            Try Demo Mission
          </a>
        </motion.div>
      </motion.div>

      {/* scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1.2 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-ice/45">Scroll</span>
        <span className="relative block h-14 w-px overflow-hidden bg-sky-glow/15">
          <span className="scroll-indicator-line absolute inset-x-0 h-full bg-gradient-to-b from-transparent via-sky-glow to-transparent" />
        </span>
      </motion.div>
    </section>
  );
}
