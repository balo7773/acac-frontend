'use client';
import Link from 'next/link';

export type SubmissionRow = {
  submission_id: number;
  participant_number: number;
  word_count: number | null;
  page_count: number | null;
  conclusion_outcome: string | null;
  judge_session_status: string;
  phase_2_expires_at: string | null;
  has_single_run: boolean;
};

const statusLabel = (s: string): { text: string; color: string; bg: string } => {
  switch (s) {
    case 'not_started': return { text: 'Not started', color: '#6B7280', bg: '#F3F4F6' };
    case 'phase_1_in_progress': return { text: 'In progress', color: '#F59E0B', bg: '#FEF3C7' };
    case 'phase_2_review': return { text: 'In review', color: '#0067f5', bg: '#EFF6FF' };
    case 'locked_final': return { text: 'Locked', color: '#16A34A', bg: '#DCFCE7' };
    default: return { text: s, color: '#6B7280', bg: '#F3F4F6' };
  }
};

export function SubmissionCard({ row }: { row: SubmissionRow }) {
  const st = statusLabel(row.judge_session_status);
  return (
    <Link
      href={`/judge/submissions/${row.submission_id}`}
      className="block bg-white rounded-xl border border-[#E5E7EB] p-5 hover:border-[#0067f5] transition-colors"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-[#6B7280] mb-1">Candidate</div>
          <div className="text-2xl font-bold text-[#082552]">#{String(row.participant_number).padStart(3, '0')}</div>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ color: st.color, backgroundColor: st.bg }}
        >
          {st.text}
        </span>
      </div>
      {row.has_single_run && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium border border-[#F59E0B]">
          ⚠ Single-model
        </div>
      )}
      <div className="mt-4 flex gap-4 text-sm text-[#6B7280]">
        {row.page_count && <span>{row.page_count} pages</span>}
        {row.word_count && <span>{row.word_count.toLocaleString()} words</span>}
        {row.conclusion_outcome === 'answered' && (
          <span className="text-[#16A34A]">✓ Defense submitted</span>
        )}
        {row.conclusion_outcome === 'auto_zero' && (
          <span className="text-[#FF0059]">Defense timed out</span>
        )}
      </div>
    </Link>
  );
}
