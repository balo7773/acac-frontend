'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ResultsPage() {
  const [progress, setProgress] = useState<any>(null);
  const [computing, setComputing] = useState(false);

  const load = () => apiFetch('/api/admin/stage2/progress').then(setProgress).catch(console.error);
  
  useEffect(() => { load(); }, []);

  const computeWinner = async () => {
    if (!confirm('Are you sure? This will compute the final winner and end the competition.')) return;
    setComputing(true);
    try {
      await apiFetch('/api/admin/compute-final', { method: 'POST' });
      alert('✅ Final Winner Computed! The competition is now marked as Completed.');
      window.location.href = '/admin';
    } catch (e: any) {
      alert('Error: ' + e.message);
      setComputing(false);
    }
  };

  if (!progress) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold text-[#082552] mb-2">Live Finale Control</h1>
      <p className="text-gray-500 mb-8">Monitor judge progress and compute the final winner.</p>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">Judge Progress</h2>
        <div className="text-5xl font-bold text-[#0067f5] mb-2">
          {progress.completed_judges} <span className="text-2xl text-gray-400">/ {progress.total_judges}</span>
        </div>
        <p className="text-gray-500">Judges have submitted all scores for the {progress.total_finalists} finalists.</p>
      </div>

      <button onClick={computeWinner} disabled={computing || progress.completed_judges === 0}
        className="w-full bg-[#0067f5] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-lg">
        {computing ? 'Computing...' : 'Compute Final Winner 🏆'}
      </button>
    </div>
  );
}
