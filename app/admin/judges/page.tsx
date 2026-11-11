"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useToast } from "@/app/components/Toast";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PasswordField, SelectField, TextField } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ApiError, apiFetch } from "@/lib/api";
import { MASKS, maskEmoji, maskLabel, phaseLabel, type Judge, type ToggleJudgeResponse } from "@/lib/admin";

type Filter = "all" | "internal" | "external" | "inactive";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "internal", label: "Internal" },
  { value: "external", label: "External" },
  { value: "inactive", label: "Inactive" },
];

/* ---------- Small presentational bits ---------- */

function MaskBadge({ mask }: { mask: string }) {
  const emoji = maskEmoji(mask);
  if (!emoji) {
    return (
      <span className="rounded-md bg-[#EFF6FF] px-2 py-1 text-xs font-medium text-[#0067f5]">{mask}</span>
    );
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFF6FF] text-base" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-sm font-medium text-[#082552]">{maskLabel(mask)}</span>
    </span>
  );
}

function TypePill({ type }: { type: Judge["judge_type"] }) {
  return type === "internal" ? (
    <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#0067f5]">Internal</span>
  ) : (
    <span className="rounded-full bg-acac-amber/15 px-2.5 py-0.5 text-xs font-medium text-[#B45309]">External</span>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-2.5 py-0.5 text-xs font-medium text-[#6B7280]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" aria-hidden="true" />
      Inactive
    </span>
  );
}

/* ---------- Create modal ---------- */

function CreateJudgeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [judgeType, setJudgeType] = useState<"internal" | "external">("internal");
  const [mask, setMask] = useState(MASKS[0].value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setUsername("");
    setPassword("");
    setJudgeType("internal");
    setMask(MASKS[0].value);
    setErrors({});
    setFormError(null);
  };

  const close = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (username.trim().length < 3) next.username = "Username must be at least 3 characters.";
    if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await apiFetch("/api/admin/judges", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password,
          judge_type: judgeType,
          mask_avatar: mask,
        }),
      });
      reset();
      onCreated();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({
          ...(err.fieldErrors.username && { username: err.fieldErrors.username }),
          ...(err.fieldErrors.password && { password: err.fieldErrors.password }),
        });
        setFormError(err.detail);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Create judge" titleId="create-judge-title" dismissable={!submitting}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <TextField
          id="judge-username"
          label="Username"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          hint="Private — used only for sign-in."
          required
          minLength={3}
        />
        <PasswordField
          id="judge-password"
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Minimum 8 characters."
          required
          minLength={8}
        />

        <fieldset>
          <legend className="mb-1.5 block text-sm font-medium text-acac-navy">Judge type</legend>
          <div role="radiogroup" className="grid grid-cols-2 gap-2">
            {(["internal", "external"] as const).map((t) => {
              const selected = judgeType === t;
              return (
                <button
                  key={t}
                  id={`judge-type-${t}`}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setJudgeType(t)}
                  className={`h-11 rounded-lg border text-sm font-medium capitalize transition-colors ${
                    selected
                      ? "border-[#0067f5] bg-[#EFF6FF] text-[#0067f5]"
                      : "border-[#E5E7EB] bg-white text-acac-navy hover:border-[#0067f5]/40"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </fieldset>

        <SelectField
          id="judge-mask"
          label="Mask"
          value={mask}
          onChange={(e) => setMask(e.target.value)}
          options={MASKS.map((m) => ({ value: m.value, label: `${m.emoji}  ${m.label}` }))}
          hint="Judges are shown publicly by mask, never username."
        />

        {formError && <Alert tone="error">{formError}</Alert>}

        <div className="flex justify-end gap-2 pt-2">
          <Button id="create-judge-cancel" variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button id="create-judge-submit" type="submit" loading={submitting} loadingText="Creating…">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Deactivate modal ---------- */

function DeactivateModal({
  judge,
  onClose,
  onDone,
}: {
  judge: Judge | null;
  onClose: () => void;
  onDone: (res: ToggleJudgeResponse) => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const close = () => {
    if (submitting) return;
    setReason("");
    setError(null);
    onClose();
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!judge) return;
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch<ToggleJudgeResponse>(`/api/admin/judges/${judge.id}/active`, {
        method: "POST",
        body: JSON.stringify({ is_active: false, reason: reason.trim() }),
      });
      setReason("");
      onDone(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={!!judge}
      onClose={close}
      title={judge ? `Deactivate ${maskLabel(judge.mask_avatar)}?` : ""}
      titleId="deactivate-judge-title"
      dismissable={!submitting}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <p className="text-sm leading-relaxed text-[#6B7280]">
          This judge will be excluded from all future scoring. Their existing scores remain in the database but do
          not count toward results. This action is audited.
        </p>
        <TextField
          id="deactivate-reason"
          label="Reason"
          placeholder="e.g., Judge unavailable, conflict of interest"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={error ?? undefined}
          required
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button id="deactivate-cancel" variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button id="deactivate-confirm" type="submit" variant="danger" loading={submitting} loadingText="Deactivating…">
            Deactivate
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ---------- Page ---------- */

/** Backend warning embeds phase='…'; pull it out for the friendlier message. */
function phaseFromWarning(w: string): string | null {
  return w.match(/phase='([^']+)'/)?.[1] ?? null;
}

export default function AdminJudgesPage() {


  const { showToast } = useToast();
  const [judges, setJudges] = useState<Judge[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deactivating, setDeactivating] = useState<Judge | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "warning" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch<{ judges: Judge[]; count: number }>("/api/admin/judges");
      setJudges(res.judges);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.detail : "Couldn't load judges.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const list = judges ?? [];
    return {
      all: list.length,
      internal: list.filter((j) => j.judge_type === "internal").length,
      external: list.filter((j) => j.judge_type === "external").length,
      inactive: list.filter((j) => !j.is_active).length,
    };
  }, [judges]);

  const visible = useMemo(() => {
    const list = judges ?? [];
    switch (filter) {
      case "internal":
        return list.filter((j) => j.judge_type === "internal");
      case "external":
        return list.filter((j) => j.judge_type === "external");
      case "inactive":
        return list.filter((j) => !j.is_active);
      default:
        return list;
    }
  }, [judges, filter]);

  const handleToggleResult = (res: ToggleJudgeResponse, verb: "activated" | "deactivated") => {
    if (res.warning) {
      const phase = phaseFromWarning(res.warning);
      setNotice({
        tone: "warning",
        message: `Judge ${verb}, but leaderboard was not recomputed because phase is '${
          phase ? phaseLabel(phase) : "unknown"
        }'. Call Compute Leaderboard manually.`,
      });
    } else {
      setNotice(null);
    }
    showToast(
      res.recomputed ? `Judge ${verb} — leaderboard recomputed` : `Judge ${verb}`,
      3000,
      { tone: "success", position: "top-right" }
    );
  };

  async function reactivate(j: Judge) {
    setBusyId(j.id);
    setNotice(null);
    try {
      const res = await apiFetch<ToggleJudgeResponse>(`/api/admin/judges/${j.id}/active`, {
        method: "POST",
        body: JSON.stringify({ is_active: true }),
      });
      await load();
      handleToggleResult(res, "activated");
    } catch (e) {
      setNotice({ tone: "error", message: e instanceof ApiError ? e.detail : "Couldn't reactivate judge." });
    } finally {
      setBusyId(null);
    }
  }

  const actionButton = (j: Judge, full = false) =>
    j.is_active ? (
      <Button
        id={`judge-${j.id}-deactivate`}
        size="sm"
        variant="secondary"
        className={`hover:!border-[#FF0059]/40 hover:!text-[#FF0059] ${full ? "w-full" : ""}`}
        onClick={() => {
          setNotice(null);
          setDeactivating(j);
        }}
      >
        Deactivate
      </Button>
    ) : (
      <Button
        id={`judge-${j.id}-activate`}
        size="sm"
        variant="secondary"
        className={full ? "w-full" : ""}
        loading={busyId === j.id}
        onClick={() => reactivate(j)}
      >
        Activate
      </Button>
    );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#082552]">Judges</h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#6B7280]">
            Manage the scoring panel. Judges are identified publicly by their mask, never their username.
          </p>
        </div>
        <Button id="open-create-judge" onClick={() => setCreateOpen(true)} className="shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <path d="M7 2.5v9M2.5 7h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Create Judge
        </Button>
      </header>

      {notice && <Alert tone={notice.tone}>{notice.message}</Alert>}

      {/* Filter tabs */}
      <div role="tablist" aria-label="Filter judges" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const selected = filter === f.value;
          return (
            <button
              key={f.value}
              id={`judge-filter-${f.value}`}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                selected
                  ? "bg-[#0067f5] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#082552] hover:border-[#0067f5]/40 hover:text-[#0067f5]"
              }`}
            >
              {f.label}
              {judges && (
                <span
                  className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                    selected ? "bg-white/20 text-white" : "bg-[#F7F9FC] text-[#6B7280]"
                  }`}
                >
                  {counts[f.value]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loadError && !judges && (
        <Alert tone="error">
          {loadError}{" "}
          <button type="button" onClick={load} className="font-semibold underline underline-offset-2">
            Retry
          </button>
        </Alert>
      )}

      {!judges && !loadError && (
        <div className="h-64 animate-pulse rounded-xl border border-[#E5E7EB] bg-white" aria-busy="true" />
      )}

      {judges && (
        <>
          {visible.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-14 text-center">
              <p className="text-sm font-medium text-[#082552]">
                {judges.length === 0 ? "No judges yet" : "No judges match this filter"}
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {judges.length === 0
                  ? "Create at least 3 judges so Stage 1 scores can be locked and computed."
                  : "Try a different tab."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-xl border border-[#E5E7EB] bg-white md:block">
                <table className="w-full text-left">
                  <thead className="border-b border-[#E5E7EB] bg-[#F7F9FC]/60">
                    <tr className="text-xs font-medium uppercase tracking-[0.06em] text-[#6B7280]">
                      <th scope="col" className="px-5 py-3 font-medium">Mask</th>
                      <th scope="col" className="px-5 py-3 font-medium">Username</th>
                      <th scope="col" className="px-5 py-3 font-medium">Type</th>
                      <th scope="col" className="px-5 py-3 font-medium">Status</th>
                      <th scope="col" className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {visible.map((j) => (
                      <tr key={j.id} className={`transition-colors hover:bg-[#F7F9FC]/60 ${j.is_active ? "" : "opacity-75"}`}>
                        <td className="px-5 py-3.5">
                          <MaskBadge mask={j.mask_avatar} />
                        </td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-[#082552]">{j.username}</td>
                        <td className="px-5 py-3.5">
                          <TypePill type={j.judge_type} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill active={j.is_active} />
                          {!j.is_active && j.deactivation_reason && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-[#6B7280]" title={j.deactivation_reason}>
                              {j.deactivation_reason}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {actionButton(j)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 md:hidden">
                {visible.map((j) => (
                  <li key={j.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <MaskBadge mask={j.mask_avatar} />
                      <StatusPill active={j.is_active} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[#082552]">{j.username}</span>
                      <TypePill type={j.judge_type} />
                    </div>
                    {!j.is_active && j.deactivation_reason && (
                      <p className="mt-2 text-xs text-[#6B7280]">Reason: {j.deactivation_reason}</p>
                    )}
                    <div className="mt-4">{actionButton(j, true)}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      <CreateJudgeModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await load();
          showToast("Judge created", 3000, { tone: "success", position: "top-right" });
        }}
      />

      <DeactivateModal
        judge={deactivating}
        onClose={() => setDeactivating(null)}
        onDone={async (res) => {
          setDeactivating(null);
          await load();
          handleToggleResult(res, "deactivated");
        }}
      />
    </div>
  );
}
