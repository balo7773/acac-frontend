'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AIHealthPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { apiFetch('/api/admin/ai-health').then(setData).catch(console.error); }, []);

  if (!data) return <div className="p-10 text-center text-gray-500">Loading AI Health...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">AI Provider Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {Object.entries(data.models).map(([model, stats]: [string, any]) => (
          <div key={model} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold capitalize text-[#082552]">{model}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${stats.status === 'WORKING' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stats.status}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Jobs Done (1h): <span className="font-bold text-gray-900">{stats.done_1h}</span></p>
              <p>Errors (1h): <span className="font-bold text-gray-900">{stats.errors_1h}</span></p>
              {stats.last_error && (
                <div className="mt-3 p-3 bg-red-50 rounded text-red-700 font-mono text-xs overflow-x-auto">
                  {stats.last_error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-[#082552] mb-4">Queue (24h)</h2>
        <div className="flex gap-6 text-sm text-gray-600">
          <p>Queued: <span className="font-bold text-gray-900">{data.queue_24h.queued}</span></p>
          <p>Running: <span className="font-bold text-gray-900">{data.queue_24h.running}</span></p>
          <p>Done: <span className="font-bold text-gray-900">{data.queue_24h.done}</span></p>
          <p>Failed: <span className="font-bold text-gray-900">{data.queue_24h.failed}</span></p>
        </div>
      </div>
    </div>
  );
}
