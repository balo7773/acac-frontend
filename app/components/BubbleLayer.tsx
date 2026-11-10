"use client";

import { useState, type ReactNode } from "react";

function CowrieIcon() {
  return (
    <svg viewBox="0 0 40 40" width="60%" height="60%" fill="none" aria-hidden="true">
      {/* shell body */}
      <ellipse cx="20" cy="20" rx="12" ry="16" fill="currentColor" fillOpacity="0.35" />
      <ellipse cx="20" cy="20" rx="12" ry="16" stroke="currentColor" strokeWidth="2" />
      {/* wavy lip / slit */}
      <path
        d="M20 7c-1.6 2 1.6 3.6 0 5.4s1.6 3.6 0 5.4 1.6 3.6 0 5.4 1.6 3.6 0 5.4 1.6 2.4 0 4.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* teeth */}
      <path
        d="M16.5 12h1.8M16.5 17h1.8M16.5 22h1.8M16.5 27h1.8M21.7 14.5h1.8M21.7 19.5h1.8M21.7 24.5h1.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

type Bubble = {
  id: string;
  label: string;
  content: ReactNode;
  top: string;
  left: string;
  size: number;
  delay: number;
};

const BUBBLES: Bubble[] = [
  { id: "ngn", label: "Naira", content: "₦", top: "35%", left: "12%", size: 56, delay: 0 },
  { id: "usd", label: "Dollar", content: "$", top: "50%", left: "28%", size: 44, delay: 1.2 },
  { id: "eur", label: "Euro", content: "€", top: "30%", left: "48%", size: 64, delay: 2.4 },
  { id: "gbp", label: "Pound", content: "£", top: "55%", left: "68%", size: 40, delay: 3.6 },
  { id: "cowrie", label: "Cowrie shell", content: <CowrieIcon />, top: "25%", left: "85%", size: 52, delay: 4.8 },
];

export default function BubbleLayer() {
  const [popping, setPopping] = useState<Record<string, boolean>>({});

  const pop = (id: string) => {
    // Reset first so rapid re-clicks restart the animation.
    setPopping((p) => ({ ...p, [id]: false }));
    requestAnimationFrame(() => setPopping((p) => ({ ...p, [id]: true })));
  };

  return (
    <section aria-label="Currencies" className="pb-16 pt-4 md:pt-6">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="relative h-[280px] overflow-hidden rounded-2xl md:h-[340px]">
          {BUBBLES.map((b) => (
            <div
              key={b.id}
              className="bubble-drift absolute"
              style={{
                top: b.top,
                left: b.left,
                marginLeft: -b.size / 2,
                marginTop: -b.size / 2,
                animationDelay: `${b.delay}s`,
              }}
            >
              <button
                id={`bubble-${b.id}`}
                type="button"
                aria-label={`${b.label} bubble`}
                onClick={() => pop(b.id)}
                onAnimationEnd={() => setPopping((p) => ({ ...p, [b.id]: false }))}
                className={`group relative flex cursor-pointer select-none items-center justify-center rounded-full font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067f5] ${
                  popping[b.id] ? "bubble-pop" : ""
                }`}
                style={{
                  width: b.size,
                  height: b.size,
                  fontSize: Math.round(b.size * 0.42),
                }}
              >
                {/* fill */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#7cb4fc] opacity-40 transition-opacity duration-200 group-hover:opacity-55"
                />
                {/* border */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full border border-[#7cb4fc] opacity-60"
                />
                {/* symbol */}
                <span className="relative flex h-full w-full items-center justify-center text-[#082552] opacity-30">
                  {b.content}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
