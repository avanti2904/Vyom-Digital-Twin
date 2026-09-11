import { motion } from "framer-motion";
import Reveal from "./Reveal";

const WORDS = ["EXPLORE.", "CREATE.", "SIMULATE.", "UNDERSTAND."];

export default function Motto() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-44">
      {/* central glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,95,214,0.18),transparent_60%)] blur-2xl" />
      {/* decorative orbital rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slower rounded-full border border-sky-glow/8" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-sky-glow/5">
        <span className="absolute top-1/2 -left-[3px] h-[6px] w-[6px] -translate-y-1/2 rounded-full bg-sky-glow/70 shadow-[0_0_12px_rgba(124,196,255,0.9)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 text-center lg:px-8">
        <h2 className="font-display flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2 text-[clamp(1.9rem,6.5vw,5.2rem)] font-bold leading-tight tracking-[0.06em]">
          {WORDS.map((w, i) => (
            <motion.span
              key={w}
              initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, delay: i * 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={i % 2 === 0 ? "text-white text-glow" : "text-gradient-blue text-glow"}
            >
              {w}
            </motion.span>
          ))}
        </h2>

        <Reveal delay={1.0}>
          <p className="mx-auto mt-9 max-w-xl font-display text-base font-medium tracking-[0.18em] text-sky-glow/80 sm:text-lg">
            Bringing the universe closer to curious minds.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
