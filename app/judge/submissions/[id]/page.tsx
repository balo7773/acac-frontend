'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ScoreForm } from '@/components/judge/ScoreForm';
import { RevisionForm } from '@/components/judge/RevisionForm';
import { useTimeOffset } from '@/lib/useTimeOffset';

type EssayScore = { criterion_key: string; initial_raw_score: number | null; final_raw_score: number | null };
type ConcScore = { initial_raw_score: number | null; final_raw_score: number | null; zero_score_reason: string | null };
type AiClaim = { id: number; model_name: string; claim_type: string; claim_text: string; quote_text: string };
type Flag = { id: number; flag_type: string; raised_by: string; status: string };

type EvaluationBundle = {
  submission: {
    submission_id: number;
    participant_number: number;
    word_count: number | null;
    page_count: number | null;
    conclusion_outcome: string | null;
    question_text: string | null;
    answer_text: string | null;
    window_ends_at: string | null;
    judge_session_status: string;
    phase_2_expires_at: string | null;
  };
  bundle: Record<string, unknown>;
  ai_claims: AiClaim[];
  ai_summary: { summary_text: string; model_name: string; created_at: string } | null;
  summary_pending: boolean;
  answer_duration_seconds: number | null;
  answered_under_5min: boolean;
  markers: string[];
  my_essay_scores: EssayScore[];
  my_conclusion_score: ConcScore | null;
  flags: Flag[];
};

export default function JudgeSubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const submissionId = parseInt(id, 10);
  const router = useRouter();
  const { user } = useAuth();
  const { offsetMs } = useTimeOffset();

  const [data, setData] = useState<EvaluationBundle | null>(null);
  const [essay, setEssay] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const d = await apiFetch<EvaluationBundle>(`/api/judge/submissions/${submissionId}`);
      setData(d);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Failed to load');
    }
  };

  useEffect(() => { load(); }, [submissionId]);

  // Poll whenever no summary exists yet — covers pending, queued, failed,
  // and initial-load states. Stops as soon as the summary card renders.
  useEffect(() => {
    if (!data || data.ai_summary) return;
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [data?.ai_summary]);

  // Poll while preparing or defense is still open — auto-unlocks the essay.
  useEffect(() => {
    if (!data) return;
    const stillOpen = data.submission.conclusion_outcome === 'in_progress'
      && data.submission.window_ends_at
      && new Date(data.submission.window_ends_at).getTime() > Date.now();
    const preparing = data.submission.conclusion_outcome === 'preparing';
    if (!stillOpen && !preparing) return;
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [data?.submission.conclusion_outcome, data?.submission.window_ends_at]);

  const openFull = async () => {
    setOpening(true);
    try {
      const res = await apiFetch<{ canonical_text: string }>(
        `/api/judge/submissions/${submissionId}/open-full`,
        { method: 'POST' }
      );
      setEssay(res.canonical_text);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.detail : 'Failed to open essay');
    } finally {
      setOpening(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-4 text-[#FF0059]">{error}</div>
        <button onClick={() => router.push('/judge')} className="mt-4 text-[#0067f5] hover:underline">
          ← Back to list
        </button>
      </div>
    );
  }

  if (!data) return <div className="p-16 text-center text-[#6B7280]">Loading…</div>;

  const hasScores = data.my_essay_scores.length > 0;
  const isLocked = hasScores && data.my_essay_scores.every((s) => s.final_raw_score !== null);
  const hasEssay = essay !== null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button onClick={() => router.push('/judge')} className="text-sm text-[#6B7280] hover:text-[#082552] mb-4">
        ← Back to submissions
      </button>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wide text-[#6B7280]">Candidate</div>
        <h1 className="text-3xl font-bold text-[#082552]">
          #{data.submission.participant_number}
        </h1>
        <div className="flex gap-4 text-sm text-[#6B7280] mt-2">
          {data.submission.page_count && <span>{data.submission.page_count} pages</span>}
          {data.submission.word_count && <span>{data.submission.word_count.toLocaleString()} words</span>}
          {data.submission.conclusion_outcome === 'answered' && (
            <span className="text-[#16A34A]">✓ Defense submitted</span>
          )}
        </div>
      </div>

      {/* Markers banner — surface single-model or unstable evaluation warnings */}
      {data.markers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {data.markers.includes('single_run') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium border border-[#F59E0B]">
              ⚠ Single-model evaluation (one AI provider failed)
            </span>
          )}
          {data.markers.includes('unstable') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium border border-[#F59E0B]">
              ⚠ Unstable run (models disagreed)
            </span>
          )}
          {data.markers.includes('unverified_quote') && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-medium border border-[#EF4444]">
              ⚠ Unverified quote
            </span>
          )}
        </div>
      )}

      {/* Fast-answer advisory — possible AI-assisted drafting */}
      {data.answered_under_5min && data.answer_duration_seconds !== null && (
        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⏱</span>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#92400E] mb-1">
                Answer submitted in {(() => {
                  const sec = data.answer_duration_seconds!;
                  const m = Math.floor(sec / 60);
                  const s = sec % 60;
                  return `${m}m ${String(s).padStart(2, '0')}s`;
                })()} — under 5 minutes
              </h3>
              <p className="text-sm text-[#92400E] leading-relaxed">
                The candidate submitted their defense faster than expected for a genuine
                150-word answer. This <strong>may indicate AI-assisted drafting or a
                pre-written response</strong>, which is not permitted in the defense stage.
                Score with scrutiny — check for robotic phrasing, off-topic content, or
                lack of engagement with the specific question asked.
              </p>
              <p className="text-xs text-[#92400E]/70 mt-2 italic">
                This is an advisory signal, not proof. A fast typist or sharp thinker can
                legitimately finish quickly. Use your judgment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Duration display even when not flagged — useful context */}
      {!data.answered_under_5min && data.answer_duration_seconds !== null && (
        <div className="text-xs text-[#6B7280] mb-4">
          Defense answered in {(() => {
            const sec = data.answer_duration_seconds!;
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            return `${m}m ${String(s).padStart(2, '0')}s`;
          })()}
        </div>
      )}

      {/* AI summary — 3 states: ready / loading / absent */}
      {data.ai_summary ? (
        <div className="bg-[#EFF6FF] rounded-2xl border border-[#7cb4fc] p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[#0067f5] font-medium">
              AI Summary
            </h2>
            <span className="text-xs text-[#6B7280]">
              via {data.ai_summary.model_name}
            </span>
          </div>
          <p className="text-[#082552] leading-relaxed">
            {data.ai_summary.summary_text}
          </p>
          <p className="mt-3 text-xs text-[#6B7280] italic">
            Generated automatically from the essay. Not a score or recommendation.
          </p>
        </div>
      ) : (
        <div className="bg-[#EFF6FF] rounded-2xl border border-[#7cb4fc] p-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[#0067f5] font-medium">
              AI Summary
            </h2>
            <span className="text-xs text-[#6B7280] animate-pulse">
              {data.summary_pending === false ? 'initializing…' : 'generating…'}
            </span>
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-[#7cb4fc]/30 rounded w-full" />
            <div className="h-3 bg-[#7cb4fc]/30 rounded w-11/12" />
            <div className="h-3 bg-[#7cb4fc]/30 rounded w-9/12" />
          </div>
          <p className="mt-3 text-xs text-[#6B7280] italic">
            Generating a 3-sentence overview from the essay. This card will update automatically.
          </p>
        </div>
      )}

      {/* Step 1: essay access — preparing / locked-during-defense / unlockable */}
      {!hasEssay && (() => {
        const windowEnd = data.submission.window_ends_at
          ? new Date(data.submission.window_ends_at).getTime()
          : null;
        const defenseStillOpen = data.submission.conclusion_outcome === 'in_progress'
          && windowEnd !== null && windowEnd > Date.now();
        const preparing = data.submission.conclusion_outcome === 'preparing';

        if (preparing) {
          return (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h2 className="text-lg font-bold text-[#082552] mb-2">Defense question not yet delivered</h2>
              <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                The essay unlocks automatically once the defense window closes or the candidate submits.
              </p>
              <button onClick={load} className="mt-4 text-sm text-[#0067f5] hover:underline">Check again</button>
            </div>
          );
        }

        if (defenseStillOpen) {
          return (
            <div className="bg-white rounded-2xl border border-[#F59E0B] p-8 text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="text-lg font-bold text-[#082552] mb-2">Essay locked until defense closes</h2>
              <p className="text-sm text-[#6B7280] mb-4 max-w-md mx-auto">
                The candidate is still answering their defense question. The essay unlocks automatically
                when the window closes or the candidate submits.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FEF3C7] text-[#F59E0B] font-mono font-bold">
                Unlocks at {new Date(windowEnd!).toLocaleTimeString()}
              </div>
              <button onClick={load} className="block mt-4 text-sm text-[#0067f5] hover:underline mx-auto">
                Refresh now
              </button>
            </div>
          );
        }

        return (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
            <div className="text-4xl mb-3">📄</div>
            <h2 className="text-lg font-bold text-[#082552] mb-2">Essay content locked</h2>
            <p className="text-sm text-[#6B7280] mb-5 max-w-md mx-auto">
              The full essay is revealed only when you explicitly open it. This is audited to ensure
              equal review conditions for all judges.
            </p>
            <button
              onClick={openFull}
              disabled={opening}
              className="bg-[#0067f5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50"
            >
              {opening ? 'Opening…' : 'Open full essay →'}
            </button>
          </div>
        );
      })()}

      {/* Step 2: essay visible + AI claims */}
      {hasEssay && (
        <>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-4">
            <h2 className="text-sm uppercase tracking-wide text-[#6B7280] mb-3">Essay</h2>
            <div className="text-sm text-[#082552] whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
              {essay}
            </div>
          </div>

          {data.ai_claims.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-4">
              <h2 className="text-sm uppercase tracking-wide text-[#6B7280] mb-3">
                AI-detected claims ({data.ai_claims.length})
              </h2>
              <div className="space-y-3">
                {data.ai_claims.map((c) => (
                  <div key={c.id} className="border-l-2 border-[#7cb4fc] pl-3">
                    <div className="text-xs text-[#6B7280] uppercase tracking-wide">
                      {c.claim_type.replace('_', ' ')} · {c.model_name}
                    </div>
                    <div className="text-sm text-[#082552] mt-1">{c.claim_text}</div>
                    <div className="text-xs text-[#6B7280] mt-1 italic">&ldquo;{c.quote_text}&rdquo;</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.submission.question_text && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 mb-4">
              <h2 className="text-sm uppercase tracking-wide text-[#6B7280] mb-3">Defense question</h2>
              <p className="text-[#082552]">{data.submission.question_text}</p>
              {data.submission.answer_text && (
                <>
                  <h3 className="text-sm uppercase tracking-wide text-[#6B7280] mt-4 mb-2">Defense answer</h3>
                  <p className="text-[#082552] whitespace-pre-wrap text-sm">{data.submission.answer_text}</p>
                </>
              )}
            </div>
          )}

          {/* Step 3: scoring form */}
          {data.submission.judge_session_status === 'locked_final' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
              <h2 className="text-lg font-bold text-[#082552] mb-3">Scores locked</h2>
              <div className="space-y-2">
                {data.my_essay_scores.map((sc) => (
                  <div key={sc.criterion_key} className="flex justify-between text-sm">
                    <span className="text-[#6B7280] uppercase">{sc.criterion_key}</span>
                    <span className="font-mono font-bold text-[#082552]">
                      {sc.final_raw_score ?? sc.initial_raw_score}
                    </span>
                  </div>
                ))}
                {data.my_conclusion_score && (
                  <div className="flex justify-between text-sm border-t border-[#E5E7EB] pt-2">
                    <span className="text-[#6B7280]">Conclusion</span>
                    <span className="font-mono font-bold text-[#082552]">
                      {data.my_conclusion_score.final_raw_score ?? data.my_conclusion_score.initial_raw_score}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-[#6B7280] mt-4">
                Your revision window has closed. Scores are now locked permanently.
              </p>
            </div>
          )}

          {data.submission.judge_session_status === 'phase_2_review' && (
            <RevisionForm
              submissionId={submissionId}
              currentScores={{
                c1: data.my_essay_scores.find((x) => x.criterion_key === 'c1')?.final_raw_score
                  ?? data.my_essay_scores.find((x) => x.criterion_key === 'c1')?.initial_raw_score ?? null,
                c2: data.my_essay_scores.find((x) => x.criterion_key === 'c2')?.final_raw_score
                  ?? data.my_essay_scores.find((x) => x.criterion_key === 'c2')?.initial_raw_score ?? null,
                c3: data.my_essay_scores.find((x) => x.criterion_key === 'c3')?.final_raw_score
                  ?? data.my_essay_scores.find((x) => x.criterion_key === 'c3')?.initial_raw_score ?? null,
                c4: data.my_essay_scores.find((x) => x.criterion_key === 'c4')?.final_raw_score
                  ?? data.my_essay_scores.find((x) => x.criterion_key === 'c4')?.initial_raw_score ?? null,
                c5: data.my_essay_scores.find((x) => x.criterion_key === 'c5')?.final_raw_score
                  ?? data.my_essay_scores.find((x) => x.criterion_key === 'c5')?.initial_raw_score ?? null,
              }}
              phase2ExpiresAt={data.submission.phase_2_expires_at}
              offsetMs={offsetMs}
              judgeType={user?.judge_type}
              onSubmitted={load}
            />
          )}

          {(data.submission.judge_session_status === 'not_started'
            || data.submission.judge_session_status === 'phase_1_in_progress') && (
            <ScoreForm
              submissionId={submissionId}
              judgeType={user?.judge_type}
              disabled={false}
              onSubmitted={load}
            />
          )}
        </>
      )}
    </div>
  );
}
