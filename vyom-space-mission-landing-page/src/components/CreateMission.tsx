import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "./Reveal";

const PARAMS = ["Mission Type", "Orbit", "Launch Window", "Payload", "Duration"];

export default function CreateMission() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const arcY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.2, 0.7, 0.2]);

  return (
    <section ref={ref} id="create" className="relative overflow-hidden py-28 sm:py-36">
      {/* parallax orbital arc sweeping behind the content */}
      <motion.div
        style={{ y: arcY, opacity: glowOpacity }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vw] w-[120vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-glow/10 max-w-none"
      />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-cosmic-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
        <Reveal>
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-glow/60" />
            <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
              Create Mission
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-glow/60" />
          </div>
          <h2 className="font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold leading-[1.05] text-white">
            Create Your <span className="text-gradient-blue text-glow">Own Mission</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-ice/65 sm:text-base">
            Design and configure your own space mission. Select mission parameters, explore
            possibilities and visualize how your mission could unfold.
          </p>
        </Reveal>

        {/* elegant typographic parameter strip — pure text, no icons */}
        <Reveal delay={0.25}>
          <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-4">
            {PARAMS.map((p, i) => (
              <motion.span
                key={p}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center gap-3"
              >
                <span className="font-display text-xs font-medium uppercase tracking-[0.3em] text-ice/55 transition-colors duration-300 hover:text-sky-glow">
                  {p}
                </span>
                {i < PARAMS.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-sky-glow/40" />
                )}
              </motion.span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.35}>
          <a href="#home" className="btn-primary mt-12 px-11 py-4 text-base">
            Create a Mission
          </a>
        </Reveal>
      </div>
    </section>
  );
}
