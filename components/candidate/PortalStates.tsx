"use client";
import confetti from "canvas-confetti";
import { useEffect } from "react";

import { useState } from "react";

export function PreLaunchCard({ pno }: { pno: number }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EFF6FF] flex items-center justify-center mb-6">
          <span className="text-3xl">⏳</span>
        </div>
        <h1 className="text-2xl font-bold text-[#082552] mb-2">The competition hasn&apos;t started yet</h1>
        <p className="text-[#6B7280] mb-6">
          You&apos;re registered as Candidate #{String(pno).padStart(3, '0')}. We&apos;ll send you an update when Stage 1 opens.
        </p>
      </div>
    </div>
  );
}

export function WaitingCard({ pno, onRefresh }: { pno: number; onRefresh: () => void }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-10 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#EFF6FF] flex items-center justify-center mb-6 animate-pulse">
          <span className="text-3xl">📝</span>
        </div>
        <h1 className="text-2xl font-bold text-[#082552] mb-2">Please wait…</h1>
        <p className="text-[#6B7280] mb-6">
          Question loading. Candidate #{String(pno).padStart(3, '0')}.
        </p>
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="text-sm font-medium text-[#0067f5] hover:underline disabled:opacity-50"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh now'}
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
            Candidate #{String(pno).padStart(3, '0')}{submittedAt ? ` · ${new Date(submittedAt).toLocaleString()}` : ''}
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
          Candidate #{String(pno).padStart(3, '0')}. You did not submit a defense answer within the window. This component of your score has been recorded as zero.
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
        <p className="text-sm text-[#6B7280] mb-4">Candidate #{String(pno).padStart(3, '0')}</p>
        <p className="text-[#082552]">{config.msg}</p>
      </div>
    </div>
  );
}

export function CompetitionEndedCard({ rank }: { rank: number | null }) {
  useEffect(() => {
    if (rank === 1) {
      // 1. Play the winning sound
      const audio = new Audio('/sounds/pass.mp3');
      audio.volume = 0.6; // Adjust volume so it's not too loud
      audio.play().catch((e) => console.log('Autoplay prevented by browser:', e));

      // 2. Fire the confetti
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // 3. Cleanup when they leave the page
      return () => {
        clearInterval(interval);
        audio.pause();
      };
    }
  }, [rank]);

  if (rank === 1) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-10 bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-300 rounded-3xl text-center shadow-xl">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-4xl font-bold text-yellow-900 mb-2">ACAC Champion!</h1>
        <p className="text-lg text-yellow-800">Congratulations! You are the winner of the AFIT × Cowrywise Ambassadors Competition.</p>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-10 bg-gradient-to-br from-gray-50 to-gray-200 border border-gray-300 rounded-3xl text-center shadow-xl">
        <div className="text-7xl mb-4">🥈</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">1st Runner Up!</h1>
        <p className="text-lg text-gray-600">Outstanding performance. You placed 2nd overall.</p>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-10 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-300 rounded-3xl text-center shadow-xl">
        <div className="text-7xl mb-4">🥉</div>
        <h1 className="text-4xl font-bold text-orange-900 mb-2">2nd Runner Up!</h1>
        <p className="text-lg text-orange-800">Excellent work. You placed 3rd overall.</p>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto mt-16 p-10 bg-white border border-[#E5E7EB] rounded-2xl text-center shadow-sm">
      <div className="text-5xl mb-4">🏁</div>
      <h1 className="text-2xl font-bold text-[#082552] mb-2">Competition Ended</h1>
      <p className="text-[#6B7280]">Thank you for competing. The final results have been announced.</p>
    </div>
  );
}