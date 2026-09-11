import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "About VYOM", href: "#intro" },
  { label: "Create Mission", href: "#create" },
  { label: "Demo Mission", href: "#demo" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Get Started", href: "#about" },
];

function Logo() {
  return (
    <a href="#home" className="group relative">
      {/* pure typographic wordmark — premium gradient VYOM */}
      <span className="font-display text-[22px] font-bold tracking-[0.32em] text-gradient-blue transition-all duration-500 group-hover:drop-shadow-[0_0_14px_rgba(124,196,255,0.55)]">
        VYOM
      </span>
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-sky-glow to-transparent transition-all duration-500 group-hover:w-full" />
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "backdrop-blur-xl bg-space-900/70 border-b border-sky-glow/10 shadow-[0_8px_40px_-12px_rgba(2,6,16,0.9)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Logo />

        {/* desktop links */}
        <ul className="hidden xl:flex items-center gap-7">
          {LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="relative text-[13px] font-medium tracking-wide text-ice/70 transition-colors hover:text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gradient-to-r after:from-sky-glow after:to-transparent after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#create" className="btn-primary hidden sm:inline-flex px-6 py-2.5 text-sm">
            Start Exploring
          </a>

          {/* mobile menu toggle — pure lines, no icons */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menu"
            className="xl:hidden flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-sky-glow/25"
          >
            <span
              className={`block h-px w-4 bg-ice transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-4 bg-ice transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="xl:hidden overflow-hidden backdrop-blur-xl bg-space-900/90 border-b border-sky-glow/10"
          >
            <ul className="flex flex-col px-6 py-4">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-sky-glow/10 py-3.5 text-sm tracking-wide text-ice/80 hover:text-white"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 pb-2">
                <a href="#create" onClick={() => setOpen(false)} className="btn-primary w-full px-6 py-3 text-sm">
                  Start Exploring
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
