'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [essayModal, setEssayModal] = useState<any>(null);

  useEffect(() => { apiFetch<any[]>('/api/admin/candidates').then(setCandidates).catch(console.error); }, []);

  const resetPassword = async (candidate_id: number) => {
    if (!confirm("Are you sure you want to reset this candidate's password? They will be given a temporary password.")) return;
    try {
      const res = await apiFetch<{ temp_password: string }>(`/api/admin/users/candidate/${candidate_id}/reset-password`, {
        method: 'POST'
      });
      alert(`✅ Password Reset Successful!\n\nTemporary Password: ${res.temp_password}\n\nPlease send this to the candidate immediately.`);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const viewEssay = async (submission_id: number) => {
    const res = await apiFetch<{ text: string }>(`/api/admin/candidates/${submission_id}/essay`);
    setEssayModal(res.text);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">Master Candidate List</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Candidate</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Judges Marked</th>
              <th className="px-6 py-3">Stage 1 Score</th>
              <th className="px-6 py-3">Complaints</th>
              <th className="px-6 py-3">Essay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {candidates.map((c) => (
              <tr key={c.id} className={c.is_disqualified ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                <td className="px-6 py-4">
                  <p className="font-bold text-[#082552]">Candidate #{String(c.participant_number).padStart(3, '0')}</p>
                  <p className="text-xs text-gray-500">{c.full_name} ({c.matric_number})</p>
                </td>
                <td className="px-6 py-4">
                  {c.is_disqualified ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold" title={c.disqualification_reason}>DISQUALIFIED</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">ACTIVE</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${c.judges_scored >= c.total_active_judges ? 'text-green-600' : 'text-amber-500'}`}>
                    {c.judges_scored} / {c.total_active_judges}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-[#0067f5]">
                  {c.composite_score ? Number(c.composite_score).toFixed(2) : '—'}
                </td>
                <td className="px-6 py-4">
                  {c.open_complaints > 0 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">{c.open_complaints} OPEN</span>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="px-6 py-4 space-x-3 whitespace-nowrap">
                  <button onClick={() => viewEssay(c.submission_id)} className="text-[#0067f5] hover:underline font-medium text-sm">Read Essay</button>
                  <button onClick={() => resetPassword(c.id)} className="text-amber-600 hover:text-amber-800 hover:underline font-medium text-sm">Reset Pass</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {essayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-[#082552]">Candidate Essay</h2>
              <button onClick={() => setEssayModal(null)} className="text-gray-400 hover:text-gray-700 font-bold text-2xl">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-gray-800 leading-relaxed">
              {essayModal}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
