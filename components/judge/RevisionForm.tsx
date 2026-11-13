'use client';
import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { useCountdown, formatMMSS } from '@/lib/useTimeOffset';

const CRITERIA = [
  { key: 'c1', label: 'Fiscal policy understanding' },
  { key: 'c2', label: 'Monetary policy understanding' },
  { key: 'c3', label: 'Structural reform insight' },
  { key: 'c4', label: 'Data and evidence usage' },
  { key: 'c5', label: 'Coherence and argumentation' },
] as const;

type CriterionKey = typeof CRITERIA[number]['key'];

export function RevisionForm({
  submissionId,
  aiScores,
  currentScores,
  phase2ExpiresAt,
  offsetMs,
  judgeType,
  isPhaseLocked,
  onSubmitted,
}: {
  submissionId: number;
  aiScores: Record<string, number>;
  currentScores: Record<CriterionKey, number | null>;
  phase2ExpiresAt: string | null;
  offsetMs: number;
  judgeType: 'internal' | 'external' | undefined;
  isPhaseLocked?: boolean;
  onSubmitted: () => void;
}) {
  const isExternal = judgeType === 'external';
  const [scores, setScores] = useState<Record<CriterionKey, number>>({
    c1: currentScores.c1 ?? 0,
    c2: currentScores.c2 ?? 0,
    c3: currentScores.c3 ?? 0,
    c4: currentScores.c4 ?? 0,
    c5: currentScores.c5 ?? 0,
  });
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ms, expired } = useCountdown(phase2ExpiresAt, offsetMs);

  const changed = CRITERIA.filter((c) => scores[c.key] !== (currentScores[c.key] ?? 0));

  const submit = async () => {
    if (changed.length === 0) { setError('No changes to submit.'); return; }
    if (!reason.trim()) { setError('A written reason is required for any revision.'); return; }
    setSubmitting(true); setError(null);
    try {
      const payload: Record<string, unknown> = { revision_reason: reason };
      changed.forEach((c) => { payload[c.key] = scores[c.key]; });
      await apiFetch(`/api/judge/submissions/${submissionId}/submit-phase2`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Revision failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#082552]">Phase 2 revision</h2>
        <div className={`px-3 py-1 rounded-full font-mono font-bold text-sm ${
          expired || (ms > 0 && ms < 60000)
            ? 'bg-[#FFF1F2] text-[#FF0059]'
            : 'bg-[#EFF6FF] text-[#0067f5]'
        }`}>
          {expired ? 'WINDOW CLOSED' : formatMMSS(ms)}
        </div>
      </div>

      <p className="text-sm text-[#6B7280] mb-4">
        Change any criteria to revise. A written reason is required. After the window closes, scores lock permanently.
      </p>

      {isPhaseLocked && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium">
                🔒 The revision window is now closed. The admin has advanced the competition.
              </div>
            )}
            <div className="space-y-4 mb-4">
        {CRITERIA.map((c) => {
          const cur = scores[c.key];
          const orig = currentScores[c.key] ?? 0;
          const isChanged = cur !== orig;
          return (
            <div key={c.key} className={`p-3 rounded-lg ${isChanged ? 'bg-[#EFF6FF]' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-[#082552]">{c.label}</label>
                <span className="text-sm font-mono text-[#082552]">
                  {orig} → <strong className="text-[#0067f5]">{cur}</strong>
                  {aiScores[c.key] !== undefined && (
                    <span className="text-[#6B7280] ml-2 text-xs font-semibold">
                      (AI: {isExternal 
                        ? (aiScores[c.key] * 3).toFixed(1) 
                        : (aiScores[c.key] * 100).toFixed(0)}
                      {isExternal ? '/3' : '/100'})
                    </span>
                  )}
                </span>
              </div>
              {isExternal ? (
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((v) => (
                    <button key={v} type="button" disabled={expired}
                      onClick={() => setScores((s) => ({ ...s, [c.key]: v }))}
                      className={`flex-1 py-1.5 rounded font-bold text-sm ${
                        cur === v ? 'bg-[#0067f5] text-white' : 'bg-[#F7F9FC] text-[#082552]'
                      } disabled:opacity-50`}>
                      {v}
                    </button>
                  ))}
                </div>
              ) : (
                <input type="range" min="0" max="100" step="0.5" disabled={expired}
                  value={cur}
                  onChange={(e) => setScores((s) => ({ ...s, [c.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-[#0067f5] disabled:opacity-50" />
              )}
            </div>
          );
        })}
      </div>

      {changed.length > 0 && (
        <div className="mb-4">
          <label className="text-sm font-medium text-[#082552] mb-1 block">Revision reason (required)</label>
          <textarea disabled={expired} value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you revising these scores?"
            className="w-full h-20 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20 outline-none resize-none disabled:bg-[#F7F9FC]" />
        </div>
      )}

      {error && (
        <div className="mb-3 bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-3 text-sm text-[#FF0059]">{error}</div>
      )}

      <div className="bg-[#F7F9FC] border border-[#E5E7EB] rounded-lg p-4 mb-4 text-sm text-[#6B7280]">
        <p><strong>Need to change a score?</strong> Adjust the buttons above and click "Lock revisions" before the timer ends.</p>
        <p className="mt-1">If you are satisfied with your scores, you can safely return to the portal. No further action is required.</p>
      </div>

      <button onClick={submit} disabled={expired || submitting || changed.length === 0 || isPhaseLocked}
        className="w-full bg-[#0067f5] text-white py-3 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Lock revisions →'}
      </button>
    </div>
  );
}
