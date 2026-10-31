'use client';
import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';

export type JudgeType = 'internal' | 'external' | undefined;

const CRITERIA: { key: 'c1' | 'c2' | 'c3' | 'c4' | 'c5'; label: string; weight: string }[] = [
  { key: 'c1', label: 'Fiscal policy understanding', weight: '15%' },
  { key: 'c2', label: 'Monetary policy understanding', weight: '25%' },
  { key: 'c3', label: 'Structural reform insight', weight: '25%' },
  { key: 'c4', label: 'Data and evidence usage', weight: '25%' },
  { key: 'c5', label: 'Coherence and argumentation', weight: '10%' },
];

type Scores = { c1: number; c2: number; c3: number; c4: number; c5: number };

export function ScoreForm({
  submissionId,
  judgeType,
  disabled,
  onSubmitted,
}: {
  submissionId: number;
  judgeType: JudgeType;
  disabled: boolean;
  onSubmitted: () => void;
}) {
  const isExternal = judgeType === 'external';
  const [scores, setScores] = useState<Scores>({ c1: 0, c2: 0, c3: 0, c4: 0, c5: 0 });
  const [conclusion, setConclusion] = useState<number>(0);
  const [zeroReason, setZeroReason] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setScore = (k: keyof Scores, v: number) => {
    setScores((s) => ({ ...s, [k]: v }));
  };

  const submit = async () => {
    setError(null);
    if (conclusion === 0 && !zeroReason.trim()) {
      setError('When the conclusion score is 0, you must provide a reason.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/judge/submissions/${submissionId}/lock-phase1`, {
        method: 'POST',
        body: JSON.stringify({
          ...scores,
          conclusion_score: conclusion,
          zero_score_reason: conclusion === 0 ? zeroReason : null,
        }),
      });
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#082552]">Phase 1 scores</h2>
        <span className="text-xs text-[#6B7280]">
          {isExternal ? 'Scale: 0–3 whole numbers' : 'Scale: 0–100'}
        </span>
      </div>

      <div className="space-y-5">
        {CRITERIA.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#082552]">
                {c.label} <span className="text-[#6B7280] font-normal">· {c.weight}</span>
              </label>
              <span className="text-sm font-mono font-bold text-[#0067f5]">
                {scores[c.key]}
              </span>
            </div>
            {isExternal ? (
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button
                    key={v}
                    type="button"
                    disabled={disabled}
                    onClick={() => setScore(c.key, v)}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                      scores[c.key] === v
                        ? 'bg-[#0067f5] text-white'
                        : 'bg-[#F7F9FC] text-[#082552] hover:bg-[#EFF6FF]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                disabled={disabled}
                value={scores[c.key]}
                onChange={(e) => setScore(c.key, parseFloat(e.target.value))}
                className="w-full accent-[#0067f5] disabled:opacity-50"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#082552]">
            Conclusion score <span className="text-[#6B7280] font-normal">· 30%</span>
          </label>
          <span className="text-sm font-mono font-bold text-[#0067f5]">{conclusion}</span>
        </div>
        <p className="text-xs text-[#6B7280] mb-2">
          Enter 0 if the defense did not address the question, or a value from 5 to 30 for a genuine attempt.
        </p>
        <input
          type="number"
          min="0"
          max="30"
          step="0.5"
          disabled={disabled}
          value={conclusion}
          onChange={(e) => setConclusion(parseFloat(e.target.value) || 0)}
          className="w-full h-11 rounded-lg border border-[#E5E7EB] px-3 text-[#082552] focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20 outline-none disabled:bg-[#F7F9FC]"
        />
        {conclusion === 0 && (
          <div className="mt-3">
            <label className="text-xs font-medium text-[#6B7280]">Zero-score reason (required)</label>
            <textarea
              disabled={disabled}
              value={zeroReason}
              onChange={(e) => setZeroReason(e.target.value)}
              placeholder="Why is this defense scored zero? e.g., Did not address the question."
              className="mt-1 w-full h-20 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#082552] focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20 outline-none resize-none disabled:bg-[#F7F9FC]"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-3 text-sm text-[#FF0059]">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={disabled || submitting}
        className="mt-6 w-full bg-[#0067f5] text-white py-3 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : disabled ? 'Scores locked' : 'Lock Phase 1 scores →'}
      </button>
    </div>
  );
}
