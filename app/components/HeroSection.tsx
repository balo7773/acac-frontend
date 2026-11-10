"use client";

import { useEffect, useState } from "react";
import HeroCta from "./HeroCta";
import { phaseLabel, fmtCountdown, type Phase } from "@/lib/admin";

type PublicStatus = {
  current_phase: Phase;
  stage_1_submission_deadline: string | null;
  registered_count: number;
};

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M8 2v8m0 0L4.75 6.75M8 10l3.25-3.25M2.5 13.5h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroSection() {
  const [status, setStatus] = useState<PublicStatus | null>(null);
  const [now, setNow] = useState<number | null>(null);

  // Fetch real phase/deadline/count on mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/status")
      .then((r) => r.json())
      .then((data: PublicStatus) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        // Silent fail: hero still renders without the live badge/count rather than breaking the page.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Live countdown ticker — only runs once we have a deadline to count down to.
  useEffect(() => {
    if (!status?.stage_1_submission_deadline) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status?.stage_1_submission_deadline]);

  const deadlineMs = status?.stage_1_submission_deadline
    ? new Date(status.stage_1_submission_deadline).getTime()
    : null;
  const countdown = deadlineMs !== null && now !== null ? fmtCountdown(deadlineMs - now) : null;
  const isOpenPhase = status?.current_phase === "pre_launch" || status?.current_phase === "stage_1_submitting";

  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="max-w-3xl pb-10 pt-16 md:pb-14 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-acac-blue">
          Air Force Institute of Technology · Cowrywise Student Ambassadors
        </p>

        <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-acac-navy md:text-7xl">
          Prove your mind.
          <br />
          <span className="text-acac-blue">Take the stage.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-acac-navy/80">
          The AFIT × Cowrywise Ambassadors Competition 2026 tests financial intellect, economic
          defense, and strategic acumen among AFIT leaders.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <HeroCta phase={status?.current_phase ?? null} />
          <a
            id="hero-download-brief"
            href="/acac-brief.pdf"
            download
            className="inline-flex items-center gap-2 text-sm font-medium text-acac-navy underline-offset-4 hover:underline"
          >
            <DownloadIcon />
            Download Brief (PDF)
          </a>
        </div>

        {/* Live status badge — only rendered once the fetch resolves, so there's no flash of stale/wrong text */}
        {status && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium">
            <span className="inline-flex items-center gap-2 text-acac-amber">
              <span className="h-2 w-2 rounded-full bg-acac-amber" aria-hidden="true" />
              {phaseLabel(status.current_phase)}
            </span>
            {isOpenPhase && countdown && (
              <span className="rounded-full border border-acac-amber/40 bg-acac-amber/10 px-3 py-1 text-xs font-mono font-semibold text-acac-amber">
                Closes in {countdown}
              </span>
            )}
          </div>
        )}

        {/* Proof-of-stakes: a real number, not a decorative badge */}
        <div className="mt-8 flex items-baseline gap-3 border-t border-acac-border pt-6">
          <span className="text-3xl font-bold tabular-nums text-acac-navy md:text-4xl">
            {status ? status.registered_count.toLocaleString() : "—"}
          </span>
          <span className="text-sm font-medium text-acac-muted">Candidates registered</span>
        </div>
      </div>
    </section>
  );
}
