'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<'complaints' | 'helpdesk'>('complaints');
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  
  const [reply, setReply] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);

  const loadComplaints = () => apiFetch<any[]>('/api/admin/complaints').then(setComplaints).catch(console.error);
  const loadHelp = () => apiFetch<any[]>('/api/admin/help-requests').then(setHelpRequests).catch(console.error);

  useEffect(() => { 
    loadComplaints(); 
    loadHelp();
  }, []);

  const resolveComplaint = async (id: number) => {
    if (!reply.trim()) return alert('Please enter a reply');
    await apiFetch(`/api/admin/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ reply })
    });
    setActiveId(null);
    setReply('');
    loadComplaints();
  };

  const resetPassword = async (candidateId: number) => {
    if (!confirm("Are you sure you want to reset this candidate's password and unblock them?")) return;
    try {
      const res = await apiFetch<{ temp_password: string }>(`/api/admin/users/candidate/${candidateId}/reset-password`, {
        method: 'POST'
      });
      alert(`✅ Password Reset Successful!\n\nTemporary Password: ${res.temp_password}\n\nPlease send this to the candidate immediately.`);
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const resolveHelp = async (id: number) => {
    await apiFetch(`/api/admin/help-requests/${id}/resolve`, { method: 'POST' });
    loadHelp();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('complaints')}
          className={`text-lg font-bold pb-2 ${activeTab === 'complaints' ? 'text-[#082552] border-b-2 border-[#0067f5]' : 'text-gray-400'}`}
        >
          Candidate Complaints
        </button>
        <button 
          onClick={() => setActiveTab('helpdesk')}
          className={`text-lg font-bold pb-2 flex items-center gap-2 ${activeTab === 'helpdesk' ? 'text-[#082552] border-b-2 border-[#0067f5]' : 'text-gray-400'}`}
        >
          SOS / Locked Accounts
          {helpRequests.filter(h => h.status === 'open').length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {helpRequests.filter(h => h.status === 'open').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'complaints' && (
        <>
          {complaints.length === 0 ? <p className="text-gray-500">No complaints found.</p> : (
            <div className="space-y-4">
              {complaints.map(c => (
                 <div key={c.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[#082552] text-lg">{c.subject}</h3>
                        <p className="text-sm text-gray-500">Candidate #{String(c.participant_number).padStart(3,'0')} ({c.full_name})</p>
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
                           <button onClick={() => resolveComplaint(c.id)} className="bg-[#0067f5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">Send Reply & Resolve</button>
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
        </>
      )}

      {activeTab === 'helpdesk' && (
        <>
          {helpRequests.length === 0 ? <p className="text-gray-500">No help requests found.</p> : (
            <div className="space-y-4">
              {helpRequests.map(h => (
                <div key={h.id} className={`bg-white p-5 rounded-xl border shadow-sm ${h.status === 'open' ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-[#082552] text-lg">Locked Out: Candidate #{String(h.participant_number).padStart(3,'0')}</h3>
                      <p className="text-sm text-gray-500">{h.full_name} ({h.matric_number})</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${h.status === 'open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {h.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm text-gray-700 italic border border-gray-100">
                    "{h.message}"
                  </div>
                  
                  {h.status === 'open' && (
                    <div className="flex gap-3">
                      <button onClick={() => resetPassword(h.candidate_id)} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 shadow-sm">
                        Reset Password & Unblock
                      </button>
                      <button onClick={() => resolveHelp(h.id)} className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Mark as Resolved
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
