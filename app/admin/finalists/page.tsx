'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function FinalistsPage() {
  const [phase, setPhase] = useState<string>('');
  const [finalists, setFinalists] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auth/public-phase").then(r => r.json()),
      apiFetch<any[]>('/api/admin/finalists/list').catch(() => []),
      apiFetch<any>('/api/admin/stage2/progress').catch(() => null),
      apiFetch<any[]>('/api/admin/final-results').catch(() => [])
    ]).then(([phaseRes, finalistsRes, progressRes, resultsRes]) => {
      setPhase(phaseRes.current_phase);
      setFinalists(finalistsRes);
      setProgress(progressRes);
      setResults(resultsRes);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDecision = async (submissionId: number, decision: 'approved' | 'rejected') => {
    try {
      await apiFetch(`/api/admin/finalists/${submissionId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision })
      });
      loadData();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const computeWinner = async () => {
    if (!confirm('Are you sure? This will compute the final winner and end the competition.')) return;
    setComputing(true);
    try {
      await apiFetch('/api/admin/compute-final', { method: 'POST' });
      alert('✅ Final Winner Computed! The competition is now marked as Completed.');
      loadData(); // Reload to show the podium
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setComputing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-2">Final Stage Control</h1>
      <p className="text-sm text-gray-500 mb-8">Verify finalists, monitor judging, and compute the final winner.</p>

      {/* 1. BEFORE STAGE 2 (Approval phase) */}
      {(phase === 'finalist_check' || phase === 'results_published') && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Approve Finalists</h2>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Rank / Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {finalists.map((f) => (
                <tr key={f.submission_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#082552]">Candidate #{String(f.participant_number).padStart(3, '0')}</p>
                    <p className="text-xs text-gray-500">{f.full_name} ({f.matric_number})</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">Rank {f.stage1_rank}</p>
                    <p className="text-xs text-gray-500">{Number(f.composite_score).toFixed(2)} pts ({f.admitted_by})</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      f.status === 'approved' ? 'bg-green-100 text-green-700' :
                      f.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {f.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {f.status !== 'approved' && (
                      <button onClick={() => handleDecision(f.submission_id, 'approved')} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">Approve</button>
                    )}
                    {f.status !== 'rejected' && (
                      <button onClick={() => handleDecision(f.submission_id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. DURING STAGE 2 (Monitor & Compute) */}
      {phase === 'stage_2_live' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
            <h2 className="text-lg font-bold text-gray-700 mb-4">Judge Progress</h2>
            <div className="text-5xl font-bold text-[#0067f5] mb-2">
              {progress?.completed_judges || 0} <span className="text-2xl text-gray-400">/ {progress?.total_judges || 0}</span>
            </div>
            <p className="text-gray-500">Judges have submitted all scores for the {progress?.total_finalists || 0} finalists.</p>
          </div>

          <button onClick={computeWinner} disabled={computing || (progress?.completed_judges || 0) === 0}
            className="w-full bg-[#0067f5] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg">
            {computing ? 'Computing...' : 'Compute Final Winner 🏆'}
          </button>
        </div>
      )}

      {/* 3. AFTER STAGE 2 (Final Results Podium) */}
      {phase === 'completed' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-2xl text-center mb-8">
            <h2 className="text-xl font-bold text-[#082552]">Competition Completed</h2>
            <p className="text-sm text-blue-800 mt-1">The final results have been computed.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Stage 1</th>
                  <th className="px-6 py-4">Stage 2</th>
                  <th className="px-6 py-4 text-right">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map((r) => (
                  <tr key={r.submission_id} className={r.final_rank === 1 ? 'bg-yellow-50' : r.final_rank === 2 ? 'bg-gray-50' : r.final_rank === 3 ? 'bg-orange-50' : ''}>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${r.final_rank === 1 ? 'text-yellow-600' : r.final_rank === 2 ? 'text-gray-500' : r.final_rank === 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                        {r.final_rank === 1 ? '🥇' : r.final_rank === 2 ? '🥈' : r.final_rank === 3 ? '🥉' : ''} #{r.final_rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#082552]">{r.full_name}</p>
                      <p className="text-xs text-gray-500">Candidate #{String(r.participant_number).padStart(3, '0')}</p>
                    </td>
                    <td className="px-6 py-4 font-mono">{Number(r.stage1_score).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono">{Number(r.stage2_score).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#0067f5] text-lg">{Number(r.overall_score).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
