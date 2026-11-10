'use client';
import { useEffect, useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { useTimeOffset } from '@/lib/useTimeOffset';
import { UploadCard } from '@/components/candidate/UploadCard';
import { DefenseCard } from '@/components/candidate/DefenseCard';
import VerdictReveal from '@/components/candidate/VerdictReveal';
import {
  PreLaunchCard,
  WaitingCard,
  SubmittedCard,
  AutoZeroCard,
  VerdictCard,
} from '@/components/candidate/PortalStates';

export type PortalData = {
  participant_number: number;
  full_name: string;
  matric_number: string;
  whatsapp_number: string;
  linkedin_url: string;
  submission_id: number;
  submission_status: string;
  page_count: number | null;
  word_count: number | null;
  final_submitted_at: string | null;
  window_outcome: string | null;
  question_text: string | null;
  question_delivered_at: string | null;
  window_ends_at: string | null;
  draft_text: string | null;
  answer_text: string | null;
  answer_submitted_at: string | null;
  current_phase: string;
};

type Verdict = { status: string; reason?: string };

export default function PortalPage() {
  const [data, setData] = useState<PortalData | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { offsetMs } = useTimeOffset();
  
  // Complaint state hooks (MUST be at the top before any early returns)
  const [showComplaint, setShowComplaint] = useState(false);
  const [compSubject, setCompSubject] = useState('');
  const [compMsg, setCompMsg] = useState('');
  const [compStatus, setCompStatus] = useState('');


  const load = async () => {
    try {
      const p = await apiFetch<PortalData>('/api/candidate/portal');
      setData(p);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Connection error');
    }
  };

  useEffect(() => { load(); }, []);

  // Poll whenever we're waiting on the backend or a countdown is running.
  // Covers the case where the candidate has submitted but job_a hasn't delivered
  // the question yet (state 'preparing'), and the case where a countdown is live.
  useEffect(() => {
    if (!data) return;
    const pollByOutcome = ['preparing', 'in_progress'].includes(data.window_outcome ?? '');
    const pollByPhase = ['stage_1_grading', 'stage_1_review', 'finalist_check'].includes(data.current_phase);
    if (!pollByOutcome && !pollByPhase) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [data?.current_phase, data?.window_outcome]);

  // Fetch verdict when results are published
  useEffect(() => {
    if (!data) return;
    const phases = ['results_published', 'stage_2_live', 'completed'];
    if (!phases.includes(data.current_phase)) return;
    apiFetch<Verdict>('/api/candidate/verdict').then(setVerdict).catch(() => {});
  }, [data?.current_phase]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-4 text-[#FF0059] whitespace-pre-wrap">
          {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
        <button onClick={load} className="mt-4 text-[#0067f5] hover:underline">Try again</button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-16 text-center text-[#6B7280]">Loading your portal…</div>;
  }


  const submitComplaint = async () => {
    if (!compSubject || !compMsg) return;
    setCompStatus('sending');
    try {
      await apiFetch('/api/candidate/complaints', {
        method: 'POST',
        body: JSON.stringify({ subject: compSubject, message: compMsg })
      });
      setCompStatus('sent');
      setTimeout(() => { setShowComplaint(false); setCompStatus(''); setCompSubject(''); setCompMsg(''); }, 2000);
    } catch (e) {
      setCompStatus('error');
    }
  };

  const phase = data.current_phase;

  if (phase === 'pre_launch') {
    return <PreLaunchCard pno={data.participant_number} />;
  }

  if (phase === 'results_published' || phase === 'stage_2_live' || phase === 'completed') {
    return <VerdictReveal verdict={verdict} pno={data.participant_number} />;
  }

  if (data.submission_status === 'draft') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Competition Topic */}
        <div className="bg-[#082552] text-white border border-[#1E3A8A] rounded-2xl p-6 md:p-8 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7cb4fc] mb-2">Competition Topic</p>
          
          <p className="text-[15px] leading-relaxed mb-4 font-medium text-white">
            Acting as the Special Adviser to the President on Financial and Economic Reforms, propose a specific economic policy of your choice. Analyze its real-world viability, the trade-offs involved, and its potential impact on the Nigerian economy.
          </p>
          
          <ul className="space-y-3 text-sm text-[#93C5FD]">
            <li className="flex items-start gap-2">
              <span className="text-[#7cb4fc] font-bold mt-0.5">•</span>
              <span><strong className="text-white">Historical Context:</strong> If your proposed policy (or a similar one) has been implemented previously in Nigeria or elsewhere, you must explicitly reference that historical attempt and its outcomes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#7cb4fc] font-bold mt-0.5">•</span>
              <span><strong className="text-white">Fiscal Realism:</strong> You must explicitly address the fiscal cost of your proposed policy, how will it be funded, and what is the immediate trade-off?</span>
            </li>
          </ul>
        </div>

        {/* Submission Rules */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#082552] mb-4">Submission Rules</h2>
          <ul className="space-y-3 text-sm text-[#4B5563]">
            <li className="flex items-start gap-2">
              <span className="text-[#0067f5] font-bold mt-0.5">•</span>
              <span><strong className="text-[#082552]">Format:</strong> PDF only.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0067f5] font-bold mt-0.5">•</span>
              <span><strong className="text-[#082552]">Length:</strong> Minimum 1,000 words. Maximum 2,500 words.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0067f5] font-bold mt-0.5">•</span>
              <span><strong className="text-[#082552]">Typography:</strong> Times New Roman, 12pt font size.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0067f5] font-bold mt-0.5">•</span>
              <span><strong className="text-[#082552]">Styling:</strong> All text must be in black. Anything worth highlighting must be underlined and italicized.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0067f5] font-bold mt-0.5">•</span>
              <span><strong className="text-[#082552]">Originality:</strong> No AI-generated prose (AI for research is allowed). If you use AI to draft any text, you must edit it properly.</span>
            </li>
          </ul>
        </div>
        
        <UploadCard data={data} onUploaded={load} />
      </div>
    );
  }

  if (data.window_outcome === 'preparing') {
    return <WaitingCard pno={data.participant_number} onRefresh={load} />;
  }

  if (data.window_outcome === 'in_progress') {
    return <DefenseCard data={data} offsetMs={offsetMs} onDone={load} />;
  }

  if (data.window_outcome === 'answered') {
    return <SubmittedCard pno={data.participant_number} answer={data.answer_text} submittedAt={data.answer_submitted_at} />;
  }

  if (data.window_outcome === 'auto_zero') {
    return <AutoZeroCard pno={data.participant_number} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center text-[#6B7280]">
      <p>Waiting for the next phase…</p>
      <button onClick={load} className="mt-3 text-[#0067f5] hover:underline">Refresh</button>
    </div>
  );
}
