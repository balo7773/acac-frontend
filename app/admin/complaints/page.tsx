'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);

  const load = () => apiFetch<any[]>('/api/admin/complaints').then(setComplaints).catch(console.error);
  useEffect(() => { load(); }, []);

  const resolve = async (id: number) => {
    if (!reply.trim()) return alert('Please enter a reply');
    await apiFetch(`/api/admin/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    });
    setActiveId(null);
    setReply('');
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">Candidate Complaints</h1>
      {complaints.length === 0 ? (
        <p className="text-gray-500">No complaints found.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
             <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
               <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#082552] text-lg">{c.subject}</h3>
                    <p className="text-sm text-gray-500">Player {c.participant_number} ({c.full_name})</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${c.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {c.status.toUpperCase()}
                  </span>
               </div>
               <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-4">{c.message}</p>
               
               {c.status === 'open' ? (
                 activeId === c.id ? (
                   <div className="space-y-2">
                     <textarea 
                       value={reply} 
                       onChange={e => setReply(e.target.value)} 
                       className="w-full border border-gray-300 p-3 rounded-lg text-sm focus:border-[#0067f5] focus:ring-1 focus:ring-[#0067f5] outline-none" 
                       placeholder="Type your reply to the candidate..." 
                       rows={3}
                     />
                     <div className="flex gap-2">
                       <button onClick={() => resolve(c.id)} className="bg-[#0067f5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">Send Reply & Resolve</button>
                       <button onClick={() => setActiveId(null)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                     </div>
                   </div>
                 ) : (
                   <button onClick={() => setActiveId(c.id)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">Reply & Resolve</button>
                 )
               ) : (
                 <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs font-bold text-green-800 mb-1">Your Reply:</p>
                    <p className="text-sm text-green-900 italic">"{c.admin_reply}"</p>
                 </div>
               )}
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
