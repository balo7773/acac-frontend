'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  useEffect(() => { apiFetch<any[]>('/api/admin/audit-log').then(setLogs).catch(console.error); }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">Audit Log</h1>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Actor</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-6 py-3 capitalize">{log.actor_role} #{log.actor_id}</td>
                <td className="px-6 py-3 font-medium text-[#082552]">{log.action}</td>
                <td className="px-6 py-3">{log.target_type} #{log.target_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
