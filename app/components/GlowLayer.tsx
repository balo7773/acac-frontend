"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient background glow for the hero: drifts on its own in a slow idle
 * loop, and eases toward the cursor position whenever a mouse is present.
 * On touch devices (no mousemove events fire), it simply keeps its idle
 * drift — this is a desktop-only enhancement layered on top of a baseline
 * that works everywhere.
 *
 * Respects prefers-reduced-motion: renders a single static glow with no
 * animation loop at all for people who've asked for reduced motion.
 */
export default function GlowLayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const glow = glowRef.current;
    if (!container || !glow) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Static centered glow, no RAF loop, no listeners.
      glow.style.transform = "translate3d(-50%, -50%, 0)";
      glow.style.left = "50%";
      glow.style.top = "40%";
      return;
    }

    let raf = 0;
    let current = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let hasPointer = false;
    const startTime = performance.now();

    const setTargetFromEvent = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      hasPointer = true;
    };

    const onLeave = () => {
      hasPointer = false;
    };

    container.addEventListener("mousemove", setTargetFromEvent);
    container.addEventListener("mouseleave", onLeave);

    const tick = (t: number) => {
      const rect = container.getBoundingClientRect();
      const elapsed = (t - startTime) / 1000;

      if (!hasPointer) {
        // Slow idle circular drift around the center of the hero when no mouse is active.
        const cx = rect.width * 0.5;
        const cy = rect.height * 0.4;
        const radiusX = rect.width * 0.18;
        const radiusY = rect.height * 0.15;
        target.x = cx + Math.cos(elapsed * 0.15) * radiusX;
        target.y = cy + Math.sin(elapsed * 0.2) * radiusY;
      }

      // Ease current position toward target — the "weight on a string" feel.
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;

      glow.style.left = `${current.x}px`;
      glow.style.top = `${current.y}px`;
      glow.style.transform = "translate3d(-50%, -50%, 0)";

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mousemove", setTargetFromEvent);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={glowRef}
        className="absolute h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,103,245,0.16) 0%, rgba(124,180,252,0.10) 45%, transparent 70%)",
          left: "50%",
          top: "40%",
        }}
      />
    </div>
  );
}
