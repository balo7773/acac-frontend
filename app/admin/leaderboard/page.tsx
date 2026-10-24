"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/admin/StatCard";
import { useToast } from "@/app/components/Toast";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ApiError, apiFetch } from "@/lib/api";
import {
  fmtScore,
  phaseLabel,
  toNum,
  type LeaderboardRow,
  type PhaseState,
  type SelectFinalistsResponse,
} from "@/lib/admin";

// Hardcoded display until the Settings page lands in Part 6.
const FINALISTS_TARGET = 5;
const BLUR_MARGIN = 0.5;

const NOT_COMPUTABLE = new Set(["pre_launch", "stage_1_submitting"]);

type SortKey =
  | "rank"
  | "participant_number"
  | "full_name"
  | "essay_score"
  | "conclusion_score"
  | "composite_score";
type Sort = { key: SortKey; dir: "asc" | "desc" };

function compare(a: LeaderboardRow, b: LeaderboardRow, key: SortKey): number {
  if (key === "full_name") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
  const av = toNum(a[key] as number | string | null);
  const bv = toNum(b[key] as number | string | null);
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  return av - bv;
}

/* ---------- Pills ---------- */

function BlurPill() {
  return (
    <span className="rounded-full bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-[#0067f5]">
      BLUR
    </span>
  );
}

function DecisionPill({ decision }: { decision: LeaderboardRow["finalist_decision"] }) {
  if (decision === "approved") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-emerald-700">
        APPROVED
      </span>
    );
  }
  if (decision === "rejected") {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-red-700">
        REJECTED
      </span>
    );
  }
  return <span className="text-sm text-[#6B7280]">—</span>;
}

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? "bg-gradient-to-br from-[#0067f5] to-[#7cb4fc] text-white"
      : rank <= FINALISTS_TARGET
        ? "bg-[#EFF6FF] text-[#0067f5]"
        : "bg-[#F7F9FC] text-[#082552]";
  return (
    <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums ${medal}`}>
      {rank}
    </span>
  );
}

function TrophyIllustration() {
  return (
    <div className="relative mx-auto h-28 w-28">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0067f5]/15 to-[#7cb4fc]/25" />
      <div className="absolute inset-3 flex items-center justify-center rounded-full bg-gradient-to-br from-[#0067f5] to-[#3d8bff] shadow-[0_12px_32px_-12px_rgba(0,103,245,0.6)]">
        <svg width="40" height="40" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M6 3.5h8v3.75a4 4 0 01-8 0V3.5zM6 5H3.5v1a2.5 2.5 0 002.6 2.5M14 5h2.5v1a2.5 2.5 0 01-2.6 2.5M10 11.25V14M7 16.5h6M8 14h4"
            stroke="white"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* ---------- Sortable header ---------- */

function Th({
  label,
  k,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  k?: SortKey;
  sort: Sort;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = k && sort.key === k;
  const base = `px-4 py-3 text-xs font-medium uppercase tracking-[0.06em] ${align === "right" ? "text-right" : "text-left"}`;
  if (!k) {
    return (
      <th scope="col" className={`${base} text-[#6B7280]`}>
        {label}
      </th>
    );
  }
  return (
    <th scope="col" className={base} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        id={`sort-${k}`}
        type="button"
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 uppercase tracking-[0.06em] transition-colors hover:text-[#0067f5] ${
          active ? "text-[#0067f5]" : "text-[#6B7280]"
        } ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={active ? "opacity-100" : "opacity-30"}>
          <path
            d={active && sort.dir === "desc" ? "M2 3.5L5 6.5 8 3.5" : "M2 6.5L5 3.5 8 6.5"}
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </th>
  );
}

/* ---------- Page ---------- */

export default function AdminLeaderboardPage() {
  const { showToast } = useToast();
  const [phase, setPhase] = useState<PhaseState | null>(null);
  const [phaseError, setPhaseError] = useState<string | null>(null);

  const [rows, setRows] = useState<LeaderboardRow[] | null>(null); // null = not computed yet
  const [computing, setComputing] = useState(false);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [computedAt, setComputedAt] = useState<Date | null>(null);

  const [selecting, setSelecting] = useState(false);
  const [selectResult, setSelectResult] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const [sort, setSort] = useState<Sort>({ key: "rank", dir: "asc" });

  const loadPhase = useCallback(async () => {
    try {
      setPhase(await apiFetch<PhaseState>("/api/admin/phase"));
      setPhaseError(null);
    } catch (e) {
      setPhaseError(e instanceof ApiError ? e.detail : "Couldn't load competition phase.");
    }
  }, []);

  useEffect(() => {
    loadPhase();
  }, [loadPhase]);

  const current = phase?.current_phase;
  const canCompute = !!current && !NOT_COMPUTABLE.has(current);
  const canSelect = current === "finalist_check";

  async function compute(): Promise<boolean> {
    setComputing(true);
    setComputeError(null);
    try {
      const res = await apiFetch<{ leaderboard: LeaderboardRow[] }>("/api/admin/compute-stage1", { method: "POST" });
      setRows(res.leaderboard ?? []);
      setComputedAt(new Date());
      return true;
    } catch (e) {
      setComputeError(e instanceof ApiError ? e.detail : "Couldn't compute the leaderboard.");
      return false;
    } finally {
      setComputing(false);
    }
  }

  async function selectFinalists() {
    setSelecting(true);
    setSelectResult(null);
    try {
      const res = await apiFetch<SelectFinalistsResponse>("/api/admin/finalists/select", { method: "POST" });
      const byRank = res.admitted.filter((a) => a.admitted_by === "rank").length;
      const byBlur = res.admitted.filter((a) => a.admitted_by === "blur").length;
      const other = res.count - byRank - byBlur;
      setSelectResult({
        tone: "success",
        message: `${res.count} finalist${res.count === 1 ? "" : "s"} admitted: ${byRank} by rank, ${byBlur} by blur${
          other > 0 ? `, ${other} by replacement` : ""
        }.`,
      });
      showToast("Finalists selected", 3000, { tone: "success", position: "top-right" });
      await compute(); // refetch to surface finalist_decision
    } catch (e) {
      setSelectResult({ tone: "error", message: e instanceof ApiError ? e.detail : "Couldn't select finalists." });
    } finally {
      setSelecting(false);
    }
  }

  const onSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "rank" || key === "full_name" || key === "participant_number" ? "asc" : "desc" }
    );

  const sorted = useMemo(() => {
    if (!rows) return [];
    const copy = [...rows];
    copy.sort((a, b) => {
      const c = compare(a, b, sort.key);
      return (sort.dir === "asc" ? c : -c) || a.rank - b.rank;
    });
    return copy;
  }, [rows, sort]);

  const blurCount = rows?.filter((r) => r.is_in_blur_zone).length ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#082552]">Leaderboard</h1>
          <p className="mt-1.5 text-sm text-[#6B7280]">Compute and review Stage 1 results.</p>
        </div>
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <Button
            id="compute-stage1"
            onClick={compute}
            disabled={!canCompute}
            loading={computing}
            loadingText="Computing…"
            title={!canCompute ? "Available after submissions close" : undefined}
          >
            {rows ? "Recompute Stage 1" : "Compute Stage 1"}
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>
          {phase && !canCompute && <span className="text-xs text-[#6B7280]">Available after submissions close.</span>}
          {computedAt && (
            <span className="text-xs text-[#6B7280]">
              Last computed {computedAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      {phaseError && <Alert tone="error">{phaseError}</Alert>}
      {computeError && <Alert tone="error">{computeError}</Alert>}

      {/* Settings strip + finalist action */}
      {rows !== null && (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Phase" value={<span className="text-base">{phaseLabel(current)}</span>} />
            <StatCard label="Finalists target" value={FINALISTS_TARGET} mono />
            <StatCard label="Blur margin" value={BLUR_MARGIN.toFixed(1)} mono />
            <StatCard label="Ranked / in blur" value={`${rows.length} / ${blurCount}`} mono accent="blue" />
          </div>

          {canSelect && rows.length > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-[#0067f5]/20 bg-[#EFF6FF]/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#082552]">Ready to select finalists</p>
                <p className="mt-0.5 text-sm text-[#6B7280]">
                  Admits the top {FINALISTS_TARGET} by rank plus anyone within {BLUR_MARGIN} points of #{FINALISTS_TARGET}.
                </p>
              </div>
              <Button id="select-finalists" onClick={selectFinalists} loading={selecting} loadingText="Selecting…" className="shrink-0">
                Select Top {FINALISTS_TARGET} + Blur
              </Button>
            </div>
          )}

          {selectResult && <Alert tone={selectResult.tone}>{selectResult.message}</Alert>}
        </section>
      )}

      {/* Empty: not yet computed */}
      {rows === null && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white px-6 py-16 text-center">
          <TrophyIllustration />
          <p className="mx-auto mt-6 max-w-sm text-sm text-[#6B7280]">
            {computing ? "Computing results…" : <>Click &ldquo;Compute Stage 1&rdquo; above to generate the leaderboard.</>}
          </p>
        </div>
      )}

      {/* Empty: computed but no rows */}
      {rows !== null && rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-[#082552]">No results yet.</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#6B7280]">
            Ensure submissions exist and at least 3 judges have locked scores.
          </p>
        </div>
      )}

      {rows !== null && rows.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white md:block">
            <table className="w-full min-w-[960px]">
              <thead className="border-b border-[#E5E7EB] bg-[#F7F9FC]/60">
                <tr>
                  <Th label="Rank" k="rank" sort={sort} onSort={onSort} />
                  <Th label="Participant #" k="participant_number" sort={sort} onSort={onSort} />
                  <Th label="Full name" k="full_name" sort={sort} onSort={onSort} />
                  <Th label="Matric" sort={sort} onSort={onSort} />
                  <Th label="WhatsApp" sort={sort} onSort={onSort} />
                  <Th label="Essay" k="essay_score" sort={sort} onSort={onSort} align="right" />
                  <Th label="Conclusion" k="conclusion_score" sort={sort} onSort={onSort} align="right" />
                  <Th label="Composite" k="composite_score" sort={sort} onSort={onSort} align="right" />
                  <Th label="Blur" sort={sort} onSort={onSort} />
                  <Th label="Decision" sort={sort} onSort={onSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sorted.map((r) => (
                  <tr
                    key={r.submission_id}
                    className={`transition-colors hover:bg-[#F7F9FC]/70 ${r.is_in_blur_zone ? "bg-[#EFF6FF]/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <RankBadge rank={r.rank} />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium tabular-nums text-[#082552]">#{r.participant_number}</td>
                    <td className="px-4 py-3 text-sm text-[#082552]">{r.full_name}</td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">{r.matric_number}</td>
                    <td className="px-4 py-3 text-xs tabular-nums text-[#6B7280]">{r.whatsapp_number}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-[#082552]">{fmtScore(r.essay_score)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-[#082552]">{fmtScore(r.conclusion_score)}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-[#0067f5]">
                      {fmtScore(r.composite_score)}
                    </td>
                    <td className="px-4 py-3">{r.is_in_blur_zone && <BlurPill />}</td>
                    <td className="px-4 py-3">
                      <DecisionPill decision={r.finalist_decision} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden">
            <label htmlFor="mobile-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="mobile-sort"
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":") as [SortKey, Sort["dir"]];
                setSort({ key, dir });
              }}
              className="mb-3 h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#082552] outline-none focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20"
            >
              <option value="rank:asc">Sort: Rank</option>
              <option value="composite_score:desc">Sort: Composite (high → low)</option>
              <option value="essay_score:desc">Sort: Essay (high → low)</option>
              <option value="conclusion_score:desc">Sort: Conclusion (high → low)</option>
              <option value="full_name:asc">Sort: Name (A → Z)</option>
            </select>
            <ul className="space-y-3">
              {sorted.map((r) => (
                <li key={r.submission_id} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <RankBadge rank={r.rank} />
                      <div>
                        <p className="text-sm font-semibold text-[#082552]">{r.full_name}</p>
                        <p className="text-xs text-[#6B7280]">#{r.participant_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold tabular-nums text-[#0067f5]">{fmtScore(r.composite_score)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">Composite</p>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-[#E5E7EB] pt-3 text-xs">
                    <dt className="text-[#6B7280]">Essay</dt>
                    <dd className="text-right tabular-nums text-[#082552]">{fmtScore(r.essay_score)}</dd>
                    <dt className="text-[#6B7280]">Conclusion</dt>
                    <dd className="text-right tabular-nums text-[#082552]">{fmtScore(r.conclusion_score)}</dd>
                    <dt className="text-[#6B7280]">Matric</dt>
                    <dd className="text-right text-[#082552]">{r.matric_number}</dd>
                    <dt className="text-[#6B7280]">WhatsApp</dt>
                    <dd className="text-right tabular-nums text-[#082552]">{r.whatsapp_number}</dd>
                  </dl>
                  {(r.is_in_blur_zone || r.finalist_decision) && (
                    <div className="mt-3 flex gap-2">
                      {r.is_in_blur_zone && <BlurPill />}
                      {r.finalist_decision && <DecisionPill decision={r.finalist_decision} />}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
