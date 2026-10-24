import { PHASES, PHASE_LABELS, phaseIndex, type Phase } from "@/lib/admin";

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7.25l2.5 2.5L11 4.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Circle({ state }: { state: "done" | "current" | "locked" }) {
  if (state === "done") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0067f5]">
        <Check />
      </span>
    );
  }
  if (state === "current") {
    return (
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0067f5] shadow-[0_0_0_6px_rgba(0,103,245,0.12)]">
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }
  return <span className="h-8 w-8 shrink-0 rounded-full border-2 border-[#E5E7EB] bg-white" />;
}

function CurrentPill() {
  return (
    <span className="mt-1.5 inline-block rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#0067f5]">
      CURRENT
    </span>
  );
}

/** Visual 8-step phase chain. Horizontal ≥ md, vertical on mobile. */
export function PhaseStepper({ current }: { current: Phase }) {
  const cur = phaseIndex(current);
  const stateOf = (i: number): "done" | "current" | "locked" =>
    i < cur ? "done" : i === cur ? "current" : "locked";
  // A connector between i and i+1 is blue only if both neighbours are at-or-before current.
  const lineBlue = (i: number) => i + 1 <= cur;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      {/* Desktop: horizontal */}
      <ol className="hidden md:flex" aria-label="Competition phases">
        {PHASES.map((p, i) => {
          const s = stateOf(i);
          return (
            <li
              key={p}
              className="relative flex flex-1 flex-col items-center text-center"
              aria-current={s === "current" ? "step" : undefined}
            >
              {i < PHASES.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[calc(50%+16px)] right-[calc(-50%+16px)] top-[15px] h-0.5 ${
                    lineBlue(i) ? "bg-[#0067f5]" : "bg-[#E5E7EB]"
                  }`}
                />
              )}
              <Circle state={s} />
              <span
                className={`mt-2.5 px-1 text-xs leading-snug ${
                  s === "current"
                    ? "font-bold text-[#0067f5]"
                    : s === "done"
                      ? "font-medium text-[#082552]"
                      : "text-[#6B7280]/80"
                }`}
              >
                {PHASE_LABELS[p]}
              </span>
              {s === "current" && <CurrentPill />}
            </li>
          );
        })}
      </ol>

      {/* Mobile: vertical */}
      <ol className="md:hidden" aria-label="Competition phases">
        {PHASES.map((p, i) => {
          const s = stateOf(i);
          return (
            <li key={p} className="relative flex gap-4 pb-6 last:pb-0" aria-current={s === "current" ? "step" : undefined}>
              {i < PHASES.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${lineBlue(i) ? "bg-[#0067f5]" : "bg-[#E5E7EB]"}`}
                />
              )}
              <Circle state={s} />
              <div className="pt-1.5">
                <span
                  className={`block text-sm ${
                    s === "current"
                      ? "font-bold text-[#0067f5]"
                      : s === "done"
                        ? "font-medium text-[#082552]"
                        : "text-[#6B7280]/80"
                  }`}
                >
                  {PHASE_LABELS[p]}
                </span>
                {s === "current" && <CurrentPill />}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
