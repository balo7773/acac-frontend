'use client';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { SubmissionCard, type SubmissionRow } from '@/components/judge/SubmissionCard';

export default function JudgeListPage() {
  const [rows, setRows] = useState<SubmissionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiFetch<SubmissionRow[]>('/api/judge/submissions');
      setRows(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Connection failed');
    }
  };

  useEffect(() => { load(); }, []);

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-4 text-[#FF0059]">{error}</div>
      </div>
    );
  }

  if (!rows) return <div className="p-16 text-center text-[#6B7280]">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#082552]">Submissions</h1>
        <p className="text-[#6B7280] mt-1">
          {rows.length} {rows.length === 1 ? 'submission' : 'submissions'} awaiting your evaluation.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-[#082552] font-medium">No submissions yet</p>
          <p className="text-sm text-[#6B7280] mt-1">
            They will appear here once candidates submit their essays.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((r) => <SubmissionCard key={r.submission_id} row={r} />)}
        </div>
      )}
    </div>
  );
}
