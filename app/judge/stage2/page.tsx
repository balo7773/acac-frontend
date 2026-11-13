'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, ApiError } from '@/lib/api';

export default function Stage2FinalistsPage() {
  const [finalists, setFinalists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ finalists: any[] }>('/api/judge/stage2/finalists')
      .then((res) => setFinalists(res.finalists))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) {
          setError("locked"); // Clean state for phase lock
        } else {
          setError(e instanceof ApiError ? e.detail : 'Failed to load');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading finalists...</div>;

  if (error === "locked") {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-[#082552] mb-2">Stage 2 Not Started</h2>
        <p className="text-[#6B7280]">Stage 2 scoring will unlock once the Admin officially starts the Live Stage.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <h2 className="text-lg font-bold text-red-800 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#082552]">Stage 2: Live Finalists</h1>
        <p className="text-gray-500 mt-1">Score the finalists based on their live defense.</p>
      </div>

      {finalists.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-white rounded-xl border">No finalists have been approved yet.</p>
      ) : (
        <div className="space-y-4">
          {finalists.map((f) => (
            <div key={f.submission_id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-[#082552] text-lg">Candidate #{String(f.participant_number).padStart(3, '0')}</p>
                <p className="text-sm text-gray-500">Rank {f.stage1_rank} (Stage 1 Score: {Number(f.composite_score).toFixed(1)})</p>
              </div>
              <Link href={`/judge/stage2/${f.submission_id}`} className={`px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm ${
                f.has_my_score ? 'bg-green-100 text-green-700' : 'bg-[#0067f5] text-white hover:bg-blue-600'
              }`}>
                {f.has_my_score ? 'Edit Score' : 'Score Live'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
