"use client";
import { useEffect, useRef, useState } from "react";

type Fact = {
  id: number;
  category: string;
  snippet: string;
  explanation: string;
  source_name: string;
  source_url: string;
};

const BUBBLE_COUNT = 12;

const COLORS = [
  "#0067f5", // blue
  "#7cb4fc", // light blue
  "#a78bfa", // violet
  "#F59E0B", // amber
  "#FF0059", // pink
  "#10b981", // emerald
  "#FBCFE8", // pastel pink (was navy — matched text color, made text invisible on bounce)
];

function pickFact(facts: Fact[], excludeId?: number): Fact {
  if (facts.length === 0) return { id: 0, category: "", snippet: "", explanation: "", source_name: "", source_url: "" };
  let f = facts[Math.floor(Math.random() * facts.length)];
  let tries = 0;
  while (excludeId !== undefined && f.id === excludeId && tries < 15) {
    f = facts[Math.floor(Math.random() * facts.length)];
    tries++;
  }
  return f;
}

export default function FloatingBubbles() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [bubbleFacts, setBubbleFacts] = useState<(Fact | null)[]>(Array(BUBBLE_COUNT).fill(null));
  const [popped, setPopped] = useState<boolean[]>(Array(BUBBLE_COUNT).fill(false));
  const [activeFact, setActiveFact] = useState<Fact | null>(null);

  // Load facts once
  useEffect(() => {
    fetch("/financial-facts.json")
      .then((r) => r.json())
      .then((data: Fact[]) => {
        setFacts(data);
        setBubbleFacts(Array.from({ length: BUBBLE_COUNT }, () => pickFact(data)));
      })
      .catch(() => {});
  }, []);

  // Physics loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const W = () => container.clientWidth || window.innerWidth;
    const H = () => container.clientHeight || window.innerHeight;

    type Phys = { x: number; y: number; vx: number; vy: number; size: number; el: HTMLDivElement | null; bgEl: HTMLDivElement | null; colorIdx: number };
    const bubbles: Phys[] = Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const size = 100 + Math.random() * 60;
      return {
        x: Math.random() * Math.max(1, W() - size),
        y: Math.random() * Math.max(1, H() - size),
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        size,
        el: null,
        bgEl: null,
        colorIdx: i % COLORS.length,
      };
    });
    const children = container.querySelectorAll<HTMLDivElement>("[data-bubble]");
    children.forEach((el, i) => {
      if (bubbles[i]) {
        bubbles[i].el = el;
        bubbles[i].bgEl = el.querySelector<HTMLDivElement>("[data-bubble-bg]");
      }
    });
    bubbles.forEach((b) => {
      if (!b.el) return;
      b.el.style.width = `${b.size}px`;
      b.el.style.height = `${b.size}px`;
      b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
    });

    let raf = 0;
    const tick = () => {
      const w = W(), h = H();
      bubbles.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        let hit = false;
        if (b.x <= 0) { b.x = 0; b.vx = Math.abs(b.vx); hit = true; }
        else if (b.x >= w - b.size) { b.x = w - b.size; b.vx = -Math.abs(b.vx); hit = true; }
        if (b.y <= 0) { b.y = 0; b.vy = Math.abs(b.vy); hit = true; }
        else if (b.y >= h - b.size) { b.y = h - b.size; b.vy = -Math.abs(b.vy); hit = true; }
        
        if (hit && b.bgEl) {
          b.colorIdx = (b.colorIdx + 1) % COLORS.length;
          b.bgEl.style.backgroundColor = COLORS[b.colorIdx];
        }
        if (b.el) b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClick = (idx: number) => {
    if (popped[idx]) return;
    const f = bubbleFacts[idx];
    if (!f) return;
    setActiveFact(f);
    setPopped((p) => p.map((v, i) => (i === idx ? true : v)));
    // Respawn after 3s with a new fact (excluding the previous one)
    setTimeout(() => {
      setBubbleFacts((bf) => bf.map((old, i) => (i === idx ? pickFact(facts, f.id) : old)));
      setPopped((p) => p.map((v, i) => (i === idx ? false : v)));
    }, 3000);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
          const fact = bubbleFacts[i];
          const isPopped = popped[i];
          return (
            <div
              key={i}
              data-bubble
              className="absolute top-0 left-0 rounded-full"
              style={{
                opacity: isPopped ? 0 : 1,
                transition: "opacity 250ms ease",
                pointerEvents: isPopped ? "none" : "auto",
                cursor: isPopped ? "default" : "pointer",
              }}
              onClick={() => handleClick(i)}
            >
              {/* 80% transparent background layer */}
              <div
                data-bubble-bg
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: COLORS[i % COLORS.length],
                  mixBlendMode: "multiply",
                  opacity: 0.15,
                }}
              />

              {/* 100% opaque text layer */}
              {fact && (
                <div
                  className={`relative z-10 w-full h-full flex items-center justify-center rounded-full ${
                    isPopped ? "animate-[bubble-pop_300ms_ease-out_forwards]" : ""
                  }`}
                >
                  <span
                    className="px-4 text-[10px] font-bold text-[#082552] leading-tight text-center"
                    style={{ opacity: 1 }}
                  >
                    {fact.snippet}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activeFact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-5"
          style={{ background: "rgba(8,37,82,0.5)", animation: "fade-in 200ms ease-out" }}
          onClick={() => setActiveFact(null)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-md w-full shadow-2xl"
            style={{ animation: "fact-modal-in 250ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#0067f5] mb-2">
              {activeFact.category.replace(/_/g, " ")}
            </div>
            <h3 className="text-xl font-bold text-[#082552] mb-3 leading-tight">
              {activeFact.snippet}
            </h3>
            <p className="text-sm text-[#4b5563] leading-relaxed mb-5">
              {activeFact.explanation}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
              <a
                href={activeFact.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#6B7280] hover:text-[#0067f5] truncate max-w-[220px]"
              >
                Source: {activeFact.source_name}
              </a>
              <button
                onClick={() => setActiveFact(null)}
                className="text-sm font-semibold text-[#0067f5] hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
