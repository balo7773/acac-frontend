'use client';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError, normalizeDetail } from '@/lib/api';
import { useCountdown, formatMMSS } from '@/lib/useTimeOffset';
import type { PortalData } from '@/app/portal/page';

export function DefenseCard({ data, offsetMs, onDone }: { data: PortalData; offsetMs: number; onDone: () => void }) {
  const [answer, setAnswer] = useState(data.draft_text || data.answer_text || '');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const { ms, expired } = useCountdown(data.window_ends_at, offsetMs);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const validWords = wordCount >= 150 && wordCount <= 500;

  // Autosave every 10s while typing
  useEffect(() => {
    if (!answer.trim()) return;
    const id = setTimeout(async () => {
      try {
        setSaving(true);
        await apiFetch('/api/candidate/save-defense-draft', {
          method: 'POST',
          body: JSON.stringify({ answer_text: answer }),
        });
        setLastSaved(new Date().toLocaleTimeString());
      } catch {}
      finally { setSaving(false); }
    }, 10000);
    return () => clearTimeout(id);
  }, [answer]);

  const submit = async () => {
    if (!validWords) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/candidate/submit-defense', {
        method: 'POST',
        body: JSON.stringify({ answer_text: answer }),
      });
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? normalizeDetail(e.detail) : 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#082552]">Defense Question</h1>
          <p className="text-sm text-[#6B7280]">Candidate #{data.participant_number}</p>
        </div>
        <div className={`px-4 py-2 rounded-full font-mono font-bold ${expired ? 'bg-[#FFF1F2] text-[#FF0059]' : ms < 60000 ? 'bg-[#FFF1F2] text-[#FF0059]' : 'bg-[#EFF6FF] text-[#0067f5]'}`}>
          {expired ? 'TIME UP' : formatMMSS(ms)}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-6">
        <div className="text-xs uppercase tracking-wide text-[#0067f5] mb-2">Your question</div>
        <p className="text-lg text-[#082552] leading-relaxed">{data.question_text}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-[#082552] font-medium">Your defense</div>
          <div className={`text-sm ${validWords ? 'text-[#6B7280]' : 'text-[#FF0059]'}`}>
            {wordCount} / 150–500 words
          </div>
        </div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={expired || submitting}
          placeholder="Write your answer here. Use full sentences. The judges will read this."
          className="w-full h-64 p-4 rounded-lg border border-[#E5E7EB] focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20 outline-none resize-none text-[#082552] disabled:bg-[#F7F9FC]"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-[#6B7280]">
            {saving ? 'Saving…' : lastSaved ? `Autosaved at ${lastSaved}` : 'Autosave after 10s of inactivity'}
          </div>
          <button
            onClick={submit}
            disabled={!validWords || submitting || expired}
            className="bg-[#0067f5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit defense →'}
          </button>
        </div>
        {expired && (
          <div className="mt-3 bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-3 text-sm text-[#FF0059]">
            Time is up. If you have not submitted, the window will close shortly.
          </div>
        )}
        {error && <div className="mt-3 bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-3 text-sm text-[#FF0059]">{error}</div>}
      </div>
    </div>
  );
}
