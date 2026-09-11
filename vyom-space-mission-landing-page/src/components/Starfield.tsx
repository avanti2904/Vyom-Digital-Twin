import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  depth: number; // 0..1, larger = closer
  tw: number; // twinkle phase
  ts: number; // twinkle speed
}

/**
 * Fixed full-screen starfield with subtle scroll parallax and twinkling,
 * layered under cosmic nebula gradients. Sits behind all content.
 */
export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(320, Math.floor((w * h) / 5200));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.15 + 0.25,
        depth: Math.random(),
        tw: Math.random() * Math.PI * 2,
        ts: 0.4 + Math.random() * 1.4,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY;
      for (const s of stars) {
        // parallax: closer stars drift more with scroll
        const py = (s.y - scroll * (0.02 + s.depth * 0.075)) % h;
        const y = py < 0 ? py + h : py;
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(s.tw + t * 0.001 * s.ts));
        const size = s.r * (0.6 + s.depth * 0.8);
        ctx.beginPath();
        ctx.arc(s.x, y, size, 0, Math.PI * 2);
        ctx.fillStyle =
          s.depth > 0.82
            ? `rgba(191, 227, 255, ${alpha})`
            : `rgba(230, 241, 255, ${alpha * 0.8})`;
        ctx.fill();
        if (s.depth > 0.94) {
          ctx.beginPath();
          ctx.arc(s.x, y, size * 3.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(124, 196, 255, ${alpha * 0.12})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };

    build();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", build);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      {/* base deep-space gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,#0a2148_0%,#030a1c_45%,#020610_100%)]" />
      {/* nebula washes */}
      <div className="absolute -top-[10%] left-[55%] h-[70vh] w-[70vh] rounded-full bg-[radial-gradient(circle,rgba(31,95,214,0.16),transparent_65%)] blur-2xl" />
      <div className="absolute top-[55%] -left-[15%] h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(15,47,102,0.35),transparent_65%)] blur-2xl" />
      <div className="absolute top-[25%] left-[10%] h-[40vh] w-[40vh] rounded-full bg-[radial-gradient(circle,rgba(124,196,255,0.07),transparent_60%)] blur-xl" />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
