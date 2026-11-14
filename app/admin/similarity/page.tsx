'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function SimilarityPage() {
  const [pairs, setPairs] = useState<any[]>([]);
  const [activePair, setActivePair] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Penalty state
  const [penaltyPts, setPenaltyPts] = useState(10);
  const [penaltyReason, setPenaltyReason] = useState('');

  const load = () => apiFetch<any[]>('/api/admin/similarity-pairs').then(setPairs).catch(console.error);
  useEffect(() => { load(); }, []);

  const openCompare = async (pair: any) => {
    setActivePair(pair);
    setLoading(true);
    try {
      const d = await apiFetch(`/api/admin/similarity-pairs/${pair.id}/details`);
      setDetails(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDismiss = async () => {
    await apiFetch(`/api/admin/similarity-pairs/${activePair.id}/decision`, {
      method: 'POST', body: JSON.stringify({ decision: 'cleared' })
    });
    closeModal();
  };

  const handlePenalty = async () => {
    if (!penaltyReason) return alert('Please provide a reason');
    setLoading(true);
    try {
      await apiFetch(`/api/admin/submissions/${details.submission_id_a}/penalty`, {
        method: 'POST', body: JSON.stringify({ points: penaltyPts, reason: penaltyReason })
      });
      await apiFetch(`/api/admin/submissions/${details.submission_id_b}/penalty`, {
        method: 'POST', body: JSON.stringify({ points: penaltyPts, reason: penaltyReason })
      });
      await apiFetch(`/api/admin/similarity-pairs/${activePair.id}/decision`, {
        method: 'POST', body: JSON.stringify({ decision: 'penalty_applied' })
      });
      alert(`Deducted ${penaltyPts} points from both candidates.`);
      closeModal();
    } catch (e: any) { alert('Error: ' + e.message); }
    setLoading(false);
  };

  const handleDQ = async () => {
    if (!confirm('Are you sure you want to disqualify BOTH candidates?')) return;
    await apiFetch(`/api/admin/similarity-pairs/${activePair.id}/decision`, {
      method: 'POST', body: JSON.stringify({ decision: 'confirmed_violation' })
    });
    alert('Both candidates have been disqualified and scores removed.');
    closeModal();
  };

  const [scanningId, setScanningId] = useState<number | null>(null);

  const runAiScan = async (id: number) => {
    setScanningId(id);
    try {
      const res = await apiFetch<{ ai_score: number; ai_reasoning: string }>(`/api/admin/similarity-pairs/${id}/ai-scan`, {
        method: 'POST'
      });
      alert(`🤖 AI Analysis Complete!\n\nScore: ${res.ai_score}/100\nReasoning: ${res.ai_reasoning}`);
      load(); // Refresh the list to show the new score
    } catch (e: any) {
      alert('AI Scan Failed: ' + e.message);
    } finally {
      setScanningId(null);
    }
  };

  const closeModal = () => {
    setActivePair(null); setDetails(null); setPenaltyReason('');
    load();
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">Similarity Flags</h1>
      {pairs.length === 0 ? <p className="text-gray-500">No similarity flags found.</p> : (
        <div className="space-y-4">
          {pairs.map((p) => (
            <div key={p.id} className={`p-5 rounded-xl border shadow-sm flex justify-between items-center ${p.admin_decision === 'pending' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'}`}>
              <div>
                <p className="font-bold text-[#082552] text-lg">
                  Candidate #{String(p.participant_a || 0).padStart(3, '0')} vs Candidate #{String(p.participant_b || 0).padStart(3, '0')}
                </p>
                <p className="text-sm font-medium text-red-500 mt-1">Similarity: {(Number(p.similarity_score) * 100).toFixed(1)}%</p>
                {p.shared_passages && typeof p.shared_passages === 'string' && (
                  <p className="text-xs text-purple-700 mt-2 bg-purple-50 p-2 rounded border border-purple-100 italic max-w-sm">
                    🤖 AI Reasoning: {p.shared_passages}
                  </p>
                )}
                
                {p.admin_decision !== 'pending' && (
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    p.admin_decision === 'cleared' ? 'bg-green-100 text-green-700 border border-green-300' : 
                    p.admin_decision === 'penalty_applied' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 
                    'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    Verdict: {p.admin_decision === 'confirmed_violation' ? 'DISQUALIFIED' : p.admin_decision.replace('_', ' ')}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => runAiScan(p.id)} disabled={scanningId === p.id} className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
                  {scanningId === p.id ? 'Scanning...' : '🤖 AI Deep Scan'}
                </button>
                <button onClick={() => openCompare(p)} className={`px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm ${p.admin_decision === 'pending' ? 'bg-[#0067f5] text-white hover:bg-blue-600' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
                  {p.admin_decision === 'pending' ? 'Compare Essays' : 'Review Evidence'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Screen Modal */}
      {activePair && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl max-w-7xl mx-auto w-full">
            <div className="bg-[#F7F9FC] border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#082552]">Side-by-Side Comparison</h2>
                <p className="text-sm text-red-500 font-medium mt-1">Similarity Score: {(Number(activePair.similarity_score) * 100).toFixed(1)}%</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 font-bold text-2xl">&times;</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {loading ? (
                <div className="w-full flex items-center justify-center text-gray-500 font-medium">Loading essays...</div>
              ) : details ? (
                <>
                  <div className="flex-1 border-r border-gray-200 overflow-y-auto p-6 bg-white">
                    <h3 className="font-bold text-[#0067f5] mb-4 sticky top-0 bg-white pb-2">Candidate #{String(details.pno_a).padStart(3, '0')}</h3>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{details.text_a}</div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <h3 className="font-bold text-[#0067f5] mb-4 sticky top-0 bg-gray-50 pb-2">Candidate #{String(details.pno_b).padStart(3, '0')}</h3>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{details.text_b}</div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
              <button onClick={handleDismiss} className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 order-2 md:order-1">
                Dismiss Flag
              </button>

              <div className="flex items-center gap-3 order-1 md:order-2 flex-wrap justify-end">
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 pl-2">Deduct</span>
                  <input type="number" min="5" max="20" value={penaltyPts} onChange={e => setPenaltyPts(Number(e.target.value))} className="w-16 border border-gray-300 rounded p-1 text-center font-bold text-red-600 focus:outline-none" />
                  <span className="text-sm font-medium text-gray-600">pts</span>
                  <input type="text" placeholder="Reason (required)" value={penaltyReason} onChange={e => setPenaltyReason(e.target.value)} className="border border-gray-300 rounded p-1.5 text-sm w-40 focus:outline-none focus:border-[#0067f5]" />
                  <button onClick={handlePenalty} disabled={loading} className="bg-amber-500 text-white px-4 py-1.5 rounded font-bold text-sm hover:bg-amber-600 disabled:opacity-50">
                    Apply Penalty
                  </button>
                </div>

                <button onClick={handleDQ} className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm">
                  Confirm & Disqualify Both
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
