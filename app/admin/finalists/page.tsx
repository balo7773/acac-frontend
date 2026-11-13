'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function FinalistsPage() {
  const [finalists, setFinalists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    apiFetch<any[]>('/api/admin/finalists/list')
      .then(setFinalists)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (submissionId: number, decision: 'approved' | 'rejected') => {
    try {
      await apiFetch(`/api/admin/finalists/${submissionId}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision })
      });
      load();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading finalists...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-2">Finalist Check</h1>
      <p className="text-sm text-gray-500 mb-6">Verify the identity and eligibility of candidates before publishing results.</p>

      {finalists.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-gray-200 text-center text-gray-500">
          No finalists found. Compute Stage 1 to generate the list.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
                      <button onClick={() => handleDecision(f.submission_id, 'approved')} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700">
                        Approve
                      </button>
                    )}
                    {f.status !== 'rejected' && (
                      <button onClick={() => handleDecision(f.submission_id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700">
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
