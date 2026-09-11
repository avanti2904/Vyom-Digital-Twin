import { motion } from "framer-motion";
import Reveal from "./Reveal";

const QUALITIES = ["Visual", "Interactive", "Understandable"];

export default function WhatIsVyom() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      {/* soft ambient depth */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-glow/60" />
            <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
              What is VYOM
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-glow/60" />
          </div>
          <h2 className="font-display text-[clamp(2rem,5.5vw,4rem)] font-bold leading-[1.05] text-gradient-blue text-glow">
            One Platform. <br className="hidden sm:block" />
            A Universe of Possibilities.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-relaxed text-ice/65 sm:text-base">
            VYOM is a Space Mission Digital Twin platform designed to make complex space
            missions more accessible, visual and understandable. Explore missions, create your
            own mission scenarios, experience simulations and learn through AI-powered
            explanations.
          </p>
        </Reveal>

        {/* elegant typographic quality line — replaces the old pillar grid */}
        <div className="mx-auto mt-14 flex max-w-2xl items-center justify-center gap-5 sm:gap-8">
          {QUALITIES.map((q, i) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-5 sm:gap-8"
            >
              <span className="font-display text-sm font-medium uppercase tracking-[0.3em] text-ice/60 transition-colors duration-300 hover:text-sky-glow sm:text-base">
                {q}
              </span>
              {i < QUALITIES.length - 1 && (
                <span className="h-1.5 w-1.5 rounded-full bg-sky-glow/50 shadow-[0_0_8px_rgba(124,196,255,0.7)]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
