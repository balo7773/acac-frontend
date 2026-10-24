"use client";

import { useCallback, useEffect, useState } from "react";
import { PhaseStepper } from "@/components/admin/PhaseStepper";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/app/components/Toast";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { inputBase, labelBase } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";
import {
  fmtCountdown,
  fmtDateTime,
  phaseLabel,
  type Phase,
  type PhaseState,
} from "@/lib/admin";

/** Primary action per phase. `pre_launch` is special-cased (duration input + /stage-1/start). */
const ACTIONS: Partial<Record<Phase, { label: string; description: string }>> = {
  pre_launch: {
    label: "Start Competition",
    description: "Opens Stage 1 submissions and sets the submission + conclusion deadlines.",
  },
  stage_1_submitting: {
    label: "Close submissions → Grading",
    description: "Locks the submission window and queues AI grading jobs.",
  },
  stage_1_grading: {
    label: "Send to review",
    description: "Moves graded essays into the judge review phase.",
  },
  stage_1_review: {
    label: "Advance to Finalist Check",
    description: "Ends judge review. Select finalists afterwards from the Leaderboard page.",
  },
  finalist_check: {
    label: "Publish results",
    description: "Makes Stage 1 results visible to candidates.",
  },
  results_published: {
    label: "Start Stage 2",
    description: "Opens the live Stage 2 round for finalists.",
  },
  stage_2_live: {
    label: "Complete competition",
    description: "Closes Stage 2 and marks the competition as completed.",
  },
};

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.75V8l2.25 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Deadline({ label, iso, now }: { label: string; iso: string; now: number | null }) {
  const remaining = now === null ? null : new Date(iso).getTime() - now;
  const passed = remaining !== null && remaining <= 0;
  const urgent = remaining !== null && remaining > 0 && remaining < 60_000;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatCard label={label} icon={<ClockIcon />} value={<span className="text-base">{fmtDateTime(iso)}</span>} />
      <StatCard
        label="Time remaining"
        mono
        accent={passed ? "navy" : urgent ? "pink" : "blue"}
        value={remaining === null ? "--:--:--" : passed ? "Passed" : fmtCountdown(remaining)}
        sub={passed ? "This deadline has elapsed." : undefined}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<PhaseState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const [hours, setHours] = useState("24");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const d = await apiFetch<PhaseState>("/api/admin/phase");
      setData(d);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.detail : "Couldn't load competition state.");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live countdown tick.
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const onSuccess = async (newPhase: string) => {
    setConfirming(false);
    setActionError(null);
    await refresh();
    showToast(`Phase updated to ${phaseLabel(newPhase)}`, 3000, { tone: "success", position: "top-right" });
  };

  const handleError = (e: unknown) => {
    setActionError(e instanceof ApiError ? e.detail : "Something went wrong. Please try again.");
  };

  async function startCompetition() {
    const duration = Number(hours);
    if (!Number.isFinite(duration) || duration < 0.1) {
      setActionError("Submission window must be at least 0.1 hours.");
      return;
    }
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await apiFetch<{ current_phase: string }>("/api/admin/stage-1/start", {
        method: "POST",
        body: JSON.stringify({ duration_hours: duration }),
      });
      await onSuccess(res.current_phase ?? "stage_1_submitting");
    } catch (e) {
      handleError(e);
    } finally {
      setSubmitting(false);
    }
  }

  async function advancePhase(nextPhase: Phase) {
    setSubmitting(true);
    setActionError(null);
    try {
      const res = await apiFetch<{ current_phase: string }>("/api/admin/phase", {
        method: "POST",
        body: JSON.stringify({ new_phase: nextPhase }),
      });
      await onSuccess(res.current_phase ?? nextPhase);
    } catch (e) {
      handleError(e);
    } finally {
      setSubmitting(false);
    }
  }

  const current = data?.current_phase;
  const next = data?.next_phase ?? null;
  const action = current ? ACTIONS[current] : undefined;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#082552]">Competition Control</h1>
        <p className="mt-1.5 text-sm text-[#6B7280]">
          Manage phase transitions and monitor the competition lifecycle.
        </p>
      </header>

      {loadError && !data && (
        <Alert tone="error">
          {loadError}{" "}
          <button type="button" onClick={refresh} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </Alert>
      )}

      {!data && !loadError && (
        <div className="space-y-4" aria-busy="true">
          <div className="h-[118px] animate-pulse rounded-xl border border-[#E5E7EB] bg-white" />
          <div className="h-40 animate-pulse rounded-xl border border-[#E5E7EB] bg-white" />
        </div>
      )}

      {data && current && (
        <>
          <PhaseStepper current={current} />

          {/* Current state */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6" aria-labelledby="state-heading">
            <h2 id="state-heading" className="sr-only">
              Current state
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm text-[#6B7280]">Current phase:</span>
              <span className="text-lg font-bold text-[#082552]">{phaseLabel(current)}</span>
              {next && (
                <span className="ml-auto text-xs text-[#6B7280]">
                  Next: <span className="font-medium text-[#082552]">{phaseLabel(next)}</span>
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3">
              {data.stage_1_submission_deadline && (
                <Deadline label="Submission deadline" iso={data.stage_1_submission_deadline} now={now} />
              )}
              {data.stage_1_conclusion_closing_time && (
                <Deadline label="Conclusion closing time" iso={data.stage_1_conclusion_closing_time} now={now} />
              )}
              {!data.stage_1_submission_deadline && !data.stage_1_conclusion_closing_time && (
                <p className="text-sm text-[#6B7280]">No deadlines set for this phase.</p>
              )}
            </div>
          </section>

          {/* Action */}
          <section className="rounded-xl border border-[#E5E7EB] bg-white p-6" aria-labelledby="action-heading">
            <h2 id="action-heading" className="text-base font-bold text-[#082552]">
              {current === "completed" ? "Competition complete" : "Next action"}
            </h2>

            {current === "completed" || !action ? (
              <p className="mt-1.5 text-sm text-[#6B7280]">
                The competition has reached its final phase. There are no further transitions.
              </p>
            ) : (
              <>
                <p className="mt-1.5 text-sm text-[#6B7280]">{action.description}</p>

                {current === "pre_launch" ? (
                  <form
                    className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"
                    onSubmit={(e) => {
                      e.preventDefault();
                      startCompetition();
                    }}
                  >
                    <div className="sm:w-56">
                      <label htmlFor="duration-hours" className={labelBase}>
                        Submission window (hours)
                      </label>
                      <input
                        id="duration-hours"
                        type="number"
                        min={0.1}
                        step={0.5}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className={`${inputBase} border-[#E5E7EB] tabular-nums`}
                      />
                    </div>
                    <Button id="start-competition" type="submit" size="lg" loading={submitting} loadingText="Starting…">
                      {action.label}
                    </Button>
                  </form>
                ) : (
                  <div className="mt-5">
                    {!confirming ? (
                      <Button
                        id="advance-phase"
                        size="lg"
                        onClick={() => {
                          setActionError(null);
                          setConfirming(true);
                        }}
                        disabled={!next}
                      >
                        {action.label}
                      </Button>
                    ) : (
                      <div className="reveal rounded-lg border border-acac-amber/40 bg-acac-amber/10 p-4">
                        <p className="text-sm text-[#92400E]">
                          This will move the competition to{" "}
                          <strong className="font-semibold">&ldquo;{phaseLabel(next)}&rdquo;</strong>. This action
                          cannot be undone.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            id="confirm-advance-phase"
                            onClick={() => next && advancePhase(next)}
                            loading={submitting}
                            loadingText="Updating…"
                          >
                            Confirm
                          </Button>
                          <Button
                            id="cancel-advance-phase"
                            variant="secondary"
                            onClick={() => setConfirming(false)}
                            disabled={submitting}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {actionError && (
                  <Alert tone="error" className="mt-4">
                    {actionError}
                  </Alert>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
