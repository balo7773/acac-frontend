const STAGES = [
  {
    n: "01",
    label: "Stage 1",
    title: "The Essay",
    body: "Submit a 1,000–5,000 word essay on Nigerian economic policy and fiscal reform.",
  },
  {
    n: "02",
    label: "Stage 2",
    title: "The Defense",
    body: "Defend your thesis in a timed defense against an AI-generated question.",
  },
  {
    n: "03",
    label: "Stage 3",
    title: "The Final",
    body: "Live presentation and scoring in front of the AFIT judges panel.",
  },
];

export default function ThreeStages() {
  return (
    <section id="stages" className="mt-16 scroll-mt-20 bg-acac-surface pb-20 md:mt-24 md:pb-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-acac-blue">
          Three Stages
        </p>
        <h2 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-acac-navy md:text-[40px]">
          The path to the final
        </h2>

        <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STAGES.map((s, i) => (
            <li
              key={s.n}
              className="group relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_-12px_rgba(8,37,82,0.22)]"
            >
              {/* Left accent bar — the "one strong color decision" instead of five small tweaks */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-1 bg-acac-blue transition-all duration-200 group-hover:w-1.5"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-5 top-4 text-6xl font-bold leading-none text-acac-blue/10"
              >
                {s.n}
              </span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-acac-blue">
                {s.label}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-acac-navy">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-acac-muted">{s.body}</p>

              {/* Progress indicator — makes "tiered journey" visible, not just implied by numbers */}
              <div className="mt-5 flex gap-1.5">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className={`h-1 flex-1 rounded-full ${dot <= i ? "bg-acac-blue" : "bg-acac-border"}`}
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
