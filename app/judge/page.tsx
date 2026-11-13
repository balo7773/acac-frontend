'use client';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { SubmissionCard, type SubmissionRow } from '@/components/judge/SubmissionCard';

export default function JudgeListPage() {
  const [globalPhase, setGlobalPhase] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/public-phase")
      .then((res) => res.json())
      .then((data) => setGlobalPhase(data.current_phase))
      .catch(console.error);
  }, []);

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

  if (globalPhase === 'completed') {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 bg-white border border-[#E5E7EB] rounded-3xl text-center shadow-lg">
        <div className="text-7xl mb-6">🏆</div>
        <h1 className="text-4xl font-bold text-[#082552] mb-4">Competition Ended</h1>
        <p className="text-lg text-[#6B7280] mb-8">
          Thank you for your service as a Judge in the ACAC competition. 
          The final results have been computed and the winners have been announced.
        </p>
        <div className="bg-[#F7F9FC] p-4 rounded-xl border border-[#E5E7EB] inline-block">
          <p className="text-sm font-medium text-[#082552]">Your scores are permanently locked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      
      {/* Judge Guidelines Accordion */}
      <details className="mb-8 bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden group">
        <summary className="px-6 py-4 cursor-pointer bg-[#F7F9FC] font-bold text-[#082552] flex justify-between items-center hover:bg-gray-100 transition-colors list-none">
          <span className="flex items-center gap-2">
            <span className="text-xl">📋</span> Judge Guidelines & Scoring Instructions
          </span>
          <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
        </summary>
        <div className="p-6 text-sm text-[#082552] space-y-6 border-t border-[#E5E7EB]">
          
          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">1. Anonymity & Blind Review</h3>
            <p className="text-[#6B7280]">You are scoring based purely on the work. You will never see the candidate's name, matric number, or identity—only their Candidate Number. Please judge objectively and do not attempt to guess who the candidate is.</p>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">2. How AI Assists Your Review</h3>
            <p className="text-[#6B7280] mb-2">The system uses two independent AI models (DeepSeek and Gemma) to assist you. When you open an essay, you will see:</p>
            <ul className="list-disc pl-5 text-[#6B7280] space-y-1 mb-2">
              <li><strong>AI Summary:</strong> A quick 3-sentence overview of what the essay argues. Use this to orient yourself.</li>
              <li><strong>AI Claims:</strong> Factual claims the AI extracted from the essay. You can verify if the candidate is making up statistics.</li>
              <li><strong>AI Warnings (⚠️):</strong> If the AI models disagreed on a score, or if they failed to find the exact quote in the essay, a warning badge will appear.</li>
            </ul>
            <p className="text-[#0067f5] font-medium bg-blue-50 p-2 rounded border border-blue-100">Crucial Rule: The AI provides a baseline, but <strong>you have the final say</strong>. You can override the AI's score entirely based on your own reading.</p>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">3. The Scoring Scale</h3>
            <p className="text-[#6B7280] mb-2">How you score depends on your Judge Type:</p>
            <ul className="list-disc pl-5 text-[#6B7280] space-y-1">
              <li><strong>Internal Judges:</strong> Use the slider to score <strong>0 to 100</strong> (decimals are allowed). 50 is average; 100 is flawless.</li>
              <li><strong>External Judges:</strong> Use the buttons to score <strong>0, 1, 2, or 3</strong> (whole numbers only). 0 is Poor, 3 is Excellent. <em>The system will automatically balance your score against the internal judges' scale.</em></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">4. The Conclusion Score</h3>
            <p className="text-[#6B7280] mb-2">This evaluates their defense answer (the 150-word response).</p>
            <ul className="list-disc pl-5 text-[#6B7280] space-y-1">
              <li><strong>0:</strong> They completely missed the question, gave a nonsensical answer, or timed out.</li>
              <li><strong>5 to 30:</strong> A genuine, thoughtful attempt to address the prompt. <em>(Note: 1 to 4 is intentionally skipped to distinguish a total failure from a weak attempt).</em></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">5. Fast-Answer Advisory ⚠️</h3>
            <p className="text-[#6B7280]">If a candidate submitted their 150-word defense in <strong>under 5 minutes</strong>, an amber warning will appear on their submission. This may indicate AI-assisted drafting or a pre-written answer. <strong>Read their answer carefully before scoring.</strong> This is an advisory, not an automatic penalty.</p>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">6. Peer Score Reveal</h3>
            <p className="text-[#6B7280]">You must submit your Phase 1 scores independently. Once enough judges (quorum) have submitted their scores, you will unlock the ability to see your peers' scores during the Phase 2 review window. Do not discuss scores with other judges before submitting your first draft.</p>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">7. Admin Oversight</h3>
            <p className="text-[#6B7280]">Please note that the Admin reviews all similarity flags. If a candidate is found to have plagiarized, the Admin has the power to deduct points (5 to 20) or disqualify the candidate entirely. Your scores will be mathematically adjusted accordingly.</p>
          </div>

        </div>
      </details>
      {/* Stage 2 Guidelines Accordion */}
      <details className="mb-8 bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden group">
        <summary className="px-6 py-4 cursor-pointer bg-[#F7F9FC] font-bold text-[#082552] flex justify-between items-center hover:bg-gray-100 transition-colors list-none">
          <span className="flex items-center gap-2">
            <span className="text-xl">🎤</span> Stage 2 (Live Finale) Scoring Guidelines
          </span>
          <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
        </summary>
        <div className="p-6 text-sm text-[#082552] space-y-6 border-t border-[#E5E7EB]">
          
          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">1. The Live Defense</h3>
            <p className="text-[#6B7280]">In Stage 2, the approved finalists will present their arguments live (via Google Meet or in person). You will score them on 4 specific criteria based on their live performance, not their essay.</p>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">2. The 4 Scoring Criteria</h3>
            <ul className="list-disc pl-5 text-[#6B7280] space-y-1 mb-2">
              <li><strong>Depth of Knowledge (30%):</strong> How well do they understand the topic? Can they answer follow-up questions?</li>
              <li><strong>Argument & Rebuttal (35%):</strong> How strong is their defense? Do they handle counter-arguments gracefully?</li>
              <li><strong>Presentation & Confidence (20%):</strong> Are they clear, articulate, and confident on stage?</li>
              <li><strong>Strategic Acumen (15%):</strong> Do they demonstrate quick thinking and strategic insight under pressure?</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">3. The Scoring Scale</h3>
            <p className="text-[#6B7280] mb-2">Just like Stage 1, the scale depends on your Judge Type:</p>
            <ul className="list-disc pl-5 text-[#6B7280] space-y-1">
              <li><strong>Internal Judges:</strong> Use the slider to score <strong>0 to 100</strong> (decimals allowed).</li>
              <li><strong>External Judges:</strong> Use the buttons to score <strong>0, 1, 2, or 3</strong> (whole numbers only).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-[#0067f5] mb-1 text-base">4. Peer Score Reveal</h3>
            <p className="text-[#6B7280]">You must submit your Stage 2 scores independently. Once the quorum is met, you will be able to see your peers' scores for that finalist. Do not discuss scores before submitting.</p>
          </div>

        </div>
      </details>


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
