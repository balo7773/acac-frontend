'use client';

export function PreLaunchCard({ pno }: { pno: number }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EFF6FF] flex items-center justify-center mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-[#082552] mb-2">The competition hasn&apos;t started yet</h1>
        <p className="text-[#6B7280] mb-6">
          You&apos;re registered as Player {pno}. We&apos;ll send you an update when Stage 1 opens.
        </p>
      </div>
    </div>
  );
}

export function WaitingCard({ pno, onRefresh }: { pno: number; onRefresh: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EFF6FF] flex items-center justify-center mb-6 animate-pulse">
          <span className="text-3xl">📝</span>
        </div>
        <h1 className="text-2xl font-bold text-[#082552] mb-2">Please wait…</h1>
        <p className="text-[#6B7280] mb-6">
          Question loading. Player {pno}.
        </p>
        <button onClick={onRefresh} className="text-sm text-[#0067f5] hover:underline">
          Refresh now
        </button>
      </div>
    </div>
  );
}

export function SubmittedCard({ pno, answer, submittedAt }: { pno: number; answer: string | null; submittedAt: string | null }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#DCFCE7] flex items-center justify-center mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-[#082552] mb-1">Defense submitted</h1>
          <p className="text-[#6B7280] text-sm">
            Player {pno}{submittedAt ? ` · ${new Date(submittedAt).toLocaleString()}` : ''}
          </p>
        </div>
        {answer && (
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="text-xs uppercase tracking-wide text-[#6B7280] mb-2">Your answer</div>
            <div className="text-sm text-[#082552] whitespace-pre-wrap bg-[#F7F9FC] rounded-lg p-4">{answer}</div>
          </div>
        )}
        <p className="mt-6 text-sm text-[#6B7280] text-center">You may now close this page. Results will be published soon.</p>
      </div>
    </div>
  );
}

export function AutoZeroCard({ pno }: { pno: number }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF1F2] flex items-center justify-center mb-6">
          <span className="text-3xl">⚠</span>
        </div>
        <h1 className="text-2xl font-bold text-[#082552] mb-2">Defense window expired</h1>
        <p className="text-[#6B7280] mb-4">
          Player {pno}. You did not submit a defense answer within the window. This component of your score has been recorded as zero.
        </p>
        <p className="text-sm text-[#6B7280]">You will still see your final verdict once results are published.</p>
      </div>
    </div>
  );
}

export function VerdictCard({ verdict, pno }: { verdict: { status: string; reason?: string } | null; pno: number }) {
  if (!verdict) {
    return <div className="max-w-2xl mx-auto px-6 py-16 text-center text-[#6B7280]">Loading verdict…</div>;
  }
  const s = verdict.status;
  const config = {
    qualified: { bg: '#DCFCE7', ring: '#16A34A', emoji: '🎯', title: 'You qualified', msg: 'You have advanced to Stage 2. Stay tuned for the live round details.' },
    not_selected: { bg: '#F3F4F6', ring: '#6B7280', emoji: '🎓', title: 'Not selected this time', msg: 'Thank you for competing. Your effort was valued.' },
    disqualified: { bg: '#FFF1F2', ring: '#FF0059', emoji: '⛔', title: 'Disqualified', msg: 'You did not pass a competition requirement.' },
    pending: { bg: '#FEF3C7', ring: '#F59E0B', emoji: '⏳', title: 'Results pending', msg: 'Check back soon.' },
  }[s as 'qualified' | 'not_selected' | 'disqualified' | 'pending'] || { bg: '#F3F4F6', ring: '#6B7280', emoji: '·', title: s, msg: '' };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: config.bg }}>
          <span className="text-4xl">{config.emoji}</span>
        </div>
        <h1 className="text-3xl font-bold text-[#082552] mb-2">{config.title}</h1>
        <p className="text-sm text-[#6B7280] mb-4">Player {pno}</p>
        <p className="text-[#082552]">{config.msg}</p>
        {verdict.reason && (
          <p className="mt-4 text-sm text-[#6B7280] bg-[#F7F9FC] rounded-lg p-3">
            <strong className="text-[#082552]">Reason:</strong> {verdict.reason}
          </p>
        )}
      </div>
    </div>
  );
}
