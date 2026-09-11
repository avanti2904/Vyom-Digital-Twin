import { motion } from "framer-motion";
import Reveal from "./Reveal";

const CAPABILITIES = [
  {
    title: "Explore Space Missions",
    body: "Travel through curated missions and understand what really happens in space.",
  },
  {
    title: "Create Your Own Mission",
    body: "Shape mission parameters and bring your own scenario to life.",
  },
  {
    title: "Experience Demo Missions",
    body: "Step into pre-built journeys designed for first-time explorers.",
  },
  {
    title: "Visualize Digital Twins",
    body: "Watch missions mirrored as living, interactive digital models.",
  },
  {
    title: "Simulate Space Scenarios",
    body: "Test possibilities, alter conditions and observe how missions respond.",
  },
  {
    title: "Learn with VYOM AI",
    body: "Get clear, guided explanations for every stage of every mission.",
  },
];

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 h-px w-[60%] -translate-x-1/2 hairline" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cosmic-500/6 blur-3xl" />

      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Reveal>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-sky-glow to-transparent" />
            <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
              Capabilities
            </span>
          </div>
          <h2 className="font-display text-[clamp(2rem,5vw,3.6rem)] font-bold leading-[1.05] text-white">
            Everything you need to <span className="text-gradient-blue text-glow">understand space.</span>
          </h2>
        </Reveal>

        <div className="mt-16">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, x: -36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border-b border-sky-glow/10 first:border-t"
            >
              <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:gap-10 sm:py-8">
                <span className="font-display w-12 shrink-0 text-sm tracking-[0.3em] text-sky-glow/50 transition-colors group-hover:text-sky-glow">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-semibold tracking-wide text-ice transition-all duration-500 group-hover:translate-x-2 group-hover:text-white sm:text-2xl lg:text-3xl">
                  {c.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-ice/45 transition-colors duration-500 group-hover:text-ice/70 sm:ml-auto sm:text-right">
                  {c.body}
                </p>
              </div>
              {/* glowing hover underline */}
              <span className="absolute bottom-[-1px] left-0 h-px w-0 bg-gradient-to-r from-sky-glow via-cosmic-400 to-transparent transition-all duration-700 group-hover:w-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
