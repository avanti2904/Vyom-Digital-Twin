import { useEffect, useRef, useState } from "react";

/**
 * Premium custom cursor: a crisp light dot that tracks instantly,
 * trailed by a soft orbital ring that eases behind it.
 * Expands gently over links, buttons and [data-cursor="hover"] targets.
 * Desktop (fine pointer) only — untouched on touch devices.
 */
export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");
    return () => document.documentElement.classList.remove("has-custom-cursor");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let dx = tx, dy = ty;
    let rx = tx, ry = ty;
    let visible = false;
    let hovering = false;
    let pressed = false;
    let raf = 0;

    const setVisible = (v: boolean) => {
      visible = v;
      dot.style.opacity = v ? "1" : "0";
      ring.style.opacity = v ? "1" : "0";
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        dx = rx = tx;
        dy = ry = ty;
        setVisible(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      hovering = !!(t && t.closest && t.closest("a, button, [data-cursor='hover']"));
      ring.style.borderColor = hovering ? "rgba(191, 227, 255, 0.85)" : "rgba(124, 196, 255, 0.45)";
      ring.style.background = hovering ? "rgba(124, 196, 255, 0.06)" : "transparent";
    };

    const onDown = () => { pressed = true; };
    const onUp = () => { pressed = false; };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const loop = () => {
      // dot snaps quickly, ring glides behind — smooth, cinematic trail
      dx += (tx - dx) * 0.42;
      dy += (ty - dy) * 0.42;
      rx += (tx - rx) * 0.15;
      ry += (ty - ry) * 0.15;

      const dotScale = hovering ? 0.45 : pressed ? 0.7 : 1;
      const ringScale = hovering ? 1.75 : pressed ? 0.82 : 1;

      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%) scale(${dotScale})`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* trailing orbital ring */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border opacity-0"
        style={{
          borderColor: "rgba(124, 196, 255, 0.45)",
          boxShadow: "0 0 18px -4px rgba(124, 196, 255, 0.35)",
          transition: "opacity 0.3s ease, border-color 0.3s ease, background 0.3s ease",
          willChange: "transform",
        }}
      />
      {/* core dot */}
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full opacity-0"
        style={{
          background: "#dceeff",
          boxShadow: "0 0 10px rgba(191, 227, 255, 0.9)",
          transition: "opacity 0.3s ease",
          willChange: "transform",
        }}
      />
    </>
  );
}
