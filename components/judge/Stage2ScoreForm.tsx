'use client';
import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';

const CRITERIA = [
  { key: 'c1', label: 'Depth of Knowledge', weight: '30%' },
  { key: 'c2', label: 'Argument & Rebuttal', weight: '35%' },
  { key: 'c3', label: 'Presentation & Confidence', weight: '20%' },
  { key: 'c4', label: 'Strategic Acumen', weight: '15%' },
] as const;

type CriterionKey = typeof CRITERIA[number]['key'];

export function Stage2ScoreForm({
  submissionId,
  judgeType,
  hasMyScore,
  onSubmitted,
}: {
  submissionId: number;
  judgeType: 'internal' | 'external' | undefined;
  hasMyScore: boolean;
  onSubmitted: () => void;
}) {
  const isExternal = judgeType === 'external';
  const [scores, setScores] = useState<Record<CriterionKey, number>>({
    c1: 0, c2: 0, c3: 0, c4: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      await apiFetch(`/api/judge/stage2/${submissionId}/score`, {
        method: 'POST',
        body: JSON.stringify(scores),
      });
      onSubmitted();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Submission failed');
    } finally { setSubmitting(false); }
  };

  if (hasMyScore) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="font-bold text-green-800 mb-1">Score Submitted</p>
        <p className="text-sm text-green-700">You have successfully scored this candidate for Stage 2.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-[#082552]">Stage 2 Live Defense Score</h2>
        <span className="text-xs font-bold text-[#0067f5] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
          {isExternal ? 'Scale: 0-3' : 'Scale: 0-100'}
        </span>
      </div>

      <div className="space-y-6">
        {CRITERIA.map((c) => (
          <div key={c.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#082552]">
                {c.label} <span className="text-[#6B7280] font-normal">· {c.weight}</span>
              </label>
              <span className="text-sm font-bold text-[#0067f5]">{scores[c.key]}</span>
            </div>
            
            {isExternal ? (
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((v) => (
                  <button key={v} type="button" onClick={() => setScores((s) => ({ ...s, [c.key]: v }))}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${
                      scores[c.key] === v ? 'bg-[#0067f5] text-white shadow-sm' : 'bg-[#F7F9FC] text-[#082552] hover:bg-gray-100'
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            ) : (
              <input type="range" min="0" max="100" step="0.5"
                value={scores[c.key]}
                onChange={(e) => setScores((s) => ({ ...s, [c.key]: parseFloat(e.target.value) }))}
                className="w-full accent-[#0067f5]" />
            )}
          </div>
        ))}
      </div>

      {error && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      <button onClick={submit} disabled={submitting}
        className="w-full mt-8 bg-[#0067f5] text-white py-3 rounded-lg font-bold hover:bg-[#0055cc] transition-colors disabled:opacity-50">
        {submitting ? 'Submitting…' : 'Lock Stage 2 Score →'}
      </button>
    </div>
  );
}
