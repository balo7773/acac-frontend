import HeroCta from "./HeroCta";

// Part 1: static. Real phase + deadline come from /api/time + /api/status in Part 2.
const REGISTRATION_DAYS_LEFT = 7;

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
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
  return (
    <section className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="max-w-3xl pb-8 pt-16 md:pb-12 md:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-acac-blue">
          Air Force Institute of Technology · Cowrywise Student Ambassadors
        </p>

        <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight text-acac-navy md:text-7xl">
          Prove your mind.
          <br />
          <span className="text-acac-blue">Take the stage.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-acac-navy/80">
          The AFIT × Cowrywise Ambassadors Competition tests financial intellect, economic
          defense, and strategic acumen among AFIT leaders.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <HeroCta />
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

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-medium">
          <span className="inline-flex items-center gap-2 text-acac-amber">
            <span className="h-2 w-2 rounded-full bg-acac-amber" aria-hidden="true" />
            Stage 1 Registration Open
          </span>
          <span className="rounded-full border border-acac-amber/40 bg-acac-amber/10 px-3 py-1 text-xs font-semibold text-acac-amber">
            Registration closes in {REGISTRATION_DAYS_LEFT} days
          </span>
        </div>
      </div>
    </section>
  );
}
