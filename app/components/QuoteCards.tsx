"use client";

import { useEffect, useRef, useState } from "react";

type Entry = {
  id: number;
  type: "quote" | "history";
  snippet: string;
  explanation: string;
  author?: string;
  source: string;
};

const PAGE_SIZE = 2;
const ROTATE_MS = 20000;

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuoteGlyph() {
  return (
    <svg
      viewBox="0 0 32 24"
      className="absolute right-4 top-4 h-10 w-10 text-acac-blue/10"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 24V14.4C0 6.4 5.6 1.6 12.8 0l1.6 3.2C9.6 4.8 7.2 8 7.2 12h6.4v12H0zm17.6 0V14.4c0-8 5.6-12.8 12.8-14.4L32 3.2C27.2 4.8 24.8 8 24.8 12h6.4v12H17.6z" />
    </svg>
  );
}

export default function QuoteCards() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [startIdx, setStartIdx] = useState(0);
  const [flipped, setFlipped] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/financial-quotes-and-history.json")
      .then((r) => r.json())
      .then((data: Entry[]) => setEntries(data))
      .catch(() => {});
  }, []);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      advance("next");
    }, ROTATE_MS);
  };

  useEffect(() => {
    if (entries.length === 0) return;
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length]);

  const advance = (dir: "next" | "prev") => {
    if (entries.length === 0) return;
    setDirection(dir);
    setFlipped(null);
    setStartIdx((prev) => {
      const count = entries.length;
      const delta = dir === "next" ? PAGE_SIZE : -PAGE_SIZE;
      return (((prev + delta) % count) + count) % count;
    });
  };

  const handleManualNav = (dir: "next" | "prev") => {
    advance(dir);
    resetTimer(); // manual nav restarts the 20s clock rather than stacking an early auto-advance
  };

  if (entries.length === 0) return null;

  const visible = Array.from({ length: PAGE_SIZE }, (_, i) => entries[(startIdx + i) % entries.length]);

  return (
    <div className="mx-auto max-w-5xl px-5 md:px-8">
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => handleManualNav("prev")}
          aria-label="Previous"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-acac-border bg-white text-acac-navy shadow-sm transition-colors hover:border-acac-blue hover:text-acac-blue"
        >
          <ChevronIcon direction="left" />
        </button>

        <div className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          {visible.map((entry) => {
            const isFlipped = flipped === entry.id;
            const isQuote = entry.type === "quote";
            return (
              <button
                key={`${entry.id}-${startIdx}`}
                type="button"
                onClick={() => setFlipped(isFlipped ? null : entry.id)}
                className={`group relative min-h-[190px] overflow-hidden rounded-2xl border bg-white p-6 text-left shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${
                  isQuote ? "border-acac-blue/20" : "border-acac-amber/30"
                } animate-[card-enter_450ms_ease-out]`}
                style={{
                  animationName: "card-enter",
                  ["--enter-x" as string]: direction === "next" ? "16px" : "-16px",
                }}
              >
                {/* Accent top bar — color-codes quote vs history at a glance */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-1 w-full ${isQuote ? "bg-acac-blue" : "bg-acac-amber"}`}
                />
                <QuoteGlyph />

                {!isFlipped ? (
                  <>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        isQuote ? "text-acac-blue" : "text-acac-amber"
                      }`}
                    >
                      {isQuote ? "Quote" : "History"}
                    </p>
                    <p className="relative mt-3 text-base font-semibold leading-snug text-acac-navy">
                      {entry.snippet}
                    </p>
                    {entry.author && (
                      <p className="mt-4 text-sm font-medium italic text-acac-muted">— {entry.author}</p>
                    )}
                    <p className="mt-4 text-xs font-semibold text-acac-blue opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Tap to read more →
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed text-acac-navy">{entry.explanation}</p>
                    <p className="mt-4 text-xs text-acac-muted">Source: {entry.source}</p>
                    <p className="mt-3 text-xs font-semibold text-acac-blue">← Tap to go back</p>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => handleManualNav("next")}
          aria-label="Next"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-acac-border bg-white text-acac-navy shadow-sm transition-colors hover:border-acac-blue hover:text-acac-blue"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
