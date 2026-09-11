import Reveal from "./Reveal";

export default function DemoMission() {
  return (
    <section id="demo" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full bg-cosmic-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -left-40 h-[30rem] w-[30rem] -translate-y-1/2 rounded-full bg-cosmic-500/8 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
        <Reveal>
          <div className="mb-6 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-glow/60" />
            <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
              Demo Mission
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-glow/60" />
          </div>
          <h2 className="font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold leading-[1.08] text-white">
            Experience a Mission{" "}
            <span className="text-gradient-blue text-glow">Before Creating One</span>
          </h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-ice/65 sm:text-base">
            Explore a pre-built space mission and experience how VYOM visualizes mission
            journeys, scenarios and space environments.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-11 flex justify-center">
            <a href="#home" className="btn-ghost px-11 py-4 text-base border-sky-glow/50">
              Launch Demo Mission
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
