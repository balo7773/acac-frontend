/**
 * Admin-panel shared types + helpers. Shapes mirror backend/app/routers/admin.py.
 */

export const PHASES = [
  "pre_launch",
  "stage_1_submitting",
  "stage_1_grading",
  "stage_1_review",
  "finalist_check",
  "results_published",
  "stage_2_live",
  "completed",
] as const;

export type Phase = (typeof PHASES)[number];

export const PHASE_LABELS: Record<Phase, string> = {
  pre_launch: "Pre-Launch",
  stage_1_submitting: "Stage 1: Submitting",
  stage_1_grading: "Stage 1: Grading",
  stage_1_review: "Stage 1: Review",
  finalist_check: "Finalist Check",
  results_published: "Results Published",
  stage_2_live: "Stage 2: Live",
  completed: "Completed",
};

export function phaseLabel(phase: string | null | undefined): string {
  if (!phase) return "—";
  return PHASE_LABELS[phase as Phase] ?? phase.replace(/_/g, " ");
}

export function phaseIndex(phase: string | null | undefined): number {
  return PHASES.indexOf(phase as Phase);
}

/** GET /api/admin/phase */
export type PhaseState = {
  current_phase: Phase;
  next_phase: Phase | null;
  stage_1_submission_deadline: string | null;
  stage_1_conclusion_closing_time: string | null;
};

/** GET /api/admin/judges → judges[] */
export type Judge = {
  id: number;
  username: string;
  judge_type: "internal" | "external";
  mask_avatar: string;
  is_active: boolean;
  deactivated_at: string | null;
  deactivation_reason: string | null;
  created_at: string | null;
};

export type ToggleJudgeResponse = {
  judge_id: number;
  is_active: boolean;
  recomputed: boolean;
  warning: string | null;
};

/** POST /api/admin/compute-stage1 → leaderboard[] (numerics may arrive as strings from Decimal). */
export type LeaderboardRow = {
  submission_id: number;
  participant_number: number;
  full_name: string;
  matric_number: string;
  whatsapp_number: string;
  essay_score: number | string | null;
  conclusion_score: number | string | null;
  composite_score: number | string | null;
  rank: number;
  is_in_blur_zone: boolean;
  finalist_decision: "approved" | "rejected" | null;
};

/** POST /api/admin/finalists/select */
export type SelectFinalistsResponse = {
  admitted: {
    submission_id: number;
    stage1_rank: number;
    composite_score: number | string;
    admitted_by: "rank" | "blur" | "replacement" | string;
    status: string;
  }[];
  count: number;
};

/* ---------- Masks ---------- */

export const MASKS: { value: string; label: string; emoji: string }[] = [
  { value: "mask_owl", label: "Owl", emoji: "🦉" },
  { value: "mask_falcon", label: "Falcon", emoji: "🦅" },
  { value: "mask_lion", label: "Lion", emoji: "🦁" },
  { value: "mask_panther", label: "Panther", emoji: "🐆" },
  { value: "mask_wolf", label: "Wolf", emoji: "🐺" },
];

export const maskLabel = (mask: string) =>
  ({
    mask_owl: "Owl",
    mask_falcon: "Falcon",
    mask_lion: "Lion",
    mask_panther: "Panther",
    mask_wolf: "Wolf",
  })[mask] || mask.replace("mask_", "");

export const maskEmoji = (mask: string): string | null =>
  MASKS.find((m) => m.value === mask)?.emoji ?? null;

/* ---------- Formatting ---------- */

export function toNum(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function fmtScore(v: number | string | null | undefined, digits = 1): string {
  const n = toNum(v);
  return n === null ? "—" : n.toFixed(digits);
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ms → "HH:MM:SS" (hours can exceed 24). Negative → "00:00:00". */
export function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}
