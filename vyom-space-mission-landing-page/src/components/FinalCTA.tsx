import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section id="about" className="relative overflow-hidden pt-32 sm:pt-44">
      {/* breathtaking planet-limb horizon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div className="relative mt-[26rem] h-[70vh] w-[220vw] shrink-0 sm:w-[170vw]">
          <div className="h-full w-full rounded-[50%] bg-gradient-to-b from-space-800 to-space-950 shadow-[0_-4px_50px_4px_rgba(124,196,255,0.6),0_-30px_180px_20px_rgba(31,95,214,0.55),inset_0_14px_80px_rgba(59,130,246,0.4)]" />
        </div>
      </div>
      {/* upper atmosphere wash */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-cosmic-500/12 to-transparent" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 pb-56 text-center sm:pb-64 lg:px-8">
        <Reveal>
          <div className="mb-7 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-sky-glow/60" />
            <span className="font-display text-[11px] uppercase tracking-[0.45em] text-sky-glow">
              Your Journey Begins
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-sky-glow/60" />
          </div>
          <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] font-bold leading-[1.02] text-gradient-blue text-glow">
            Ready to Begin <br className="hidden sm:block" /> Your Mission?
          </h2>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="mx-auto mt-8 max-w-xl text-[15px] leading-relaxed text-ice/65 sm:text-base">
            Whether you want to explore the universe, experience a demo mission or create your
            own, your journey starts with VYOM.
          </p>
        </Reveal>

        <Reveal delay={0.32}>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#create" className="btn-primary w-full px-12 py-5 text-lg sm:w-auto">
              Create Mission
            </a>
            <a href="#demo" className="btn-ghost w-full px-12 py-5 text-lg sm:w-auto">
              Try Demo Mission
            </a>
          </div>
        </Reveal>
      </div>

      {/* footer sits on the planet surface */}
      <footer className="relative z-10 border-t border-sky-glow/10 bg-space-950/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row lg:px-8">
          <span className="font-display text-lg font-bold tracking-[0.32em] text-gradient-blue">
            VYOM
          </span>

          <p className="text-center text-[11px] uppercase tracking-[0.3em] text-ice/40">
            Space Mission Digital Twin
          </p>

          <p className="text-[11px] tracking-wider text-ice/35">
            © {new Date().getFullYear()} VYOM · Made for curious minds
          </p>
        </div>
      </footer>
    </section>
  );
}
