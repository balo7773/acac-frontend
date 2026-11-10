'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function SettingsPage() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { apiFetch('/api/admin/settings').then(setData).catch(console.error); }, []);

  const save = async (e: any) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          min_active_judges: Number(e.target.min_judges.value),
          blur_margin: Number(e.target.blur.value),
          answer_word_min: Number(e.target.min_words.value)
        })
      });
      setMsg('Settings updated successfully (new version created).');
    } catch (err: any) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="p-10 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-[#082552] mb-6">Competition Settings</h1>
      <form onSubmit={save} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Active Judges (Quorum)</label>
          <input name="min_judges" type="number" defaultValue={data.min_active_judges} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Blur Margin</label>
          <input name="blur" type="number" step="0.1" defaultValue={data.blur_margin} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Defense Word Count</label>
          <input name="min_words" type="number" defaultValue={data.answer_word_min} className="w-full border p-2 rounded" />
        </div>
        <button disabled={saving} type="submit" className="bg-[#0067f5] text-white px-6 py-2 rounded font-medium hover:bg-blue-600 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save New Version'}
        </button>
        {msg && <p className="text-sm text-green-600 font-medium">{msg}</p>}
      </form>
    </div>
  );
}
