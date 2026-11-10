'use client';
import { useRef, useState } from 'react';
import { apiFetch, ApiError, normalizeDetail } from '@/lib/api';
import type { PortalData } from '@/app/portal/page';

export function UploadCard({ data, onUploaded }: { data: PortalData; onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(data.submission_status !== 'draft');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/candidate/upload-draft', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
        console.error('Upload failed', res.status, body);
        throw new ApiError(res.status, normalizeDetail(body.detail));
      }
      setUploaded(true);
      setSuccess('Essay uploaded successfully');
      onUploaded();
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const doSubmitFinal = async () => {
    if (!accepted) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/api/candidate/submit-final', {
        method: 'POST',
        body: JSON.stringify({ accepted_rules: true, rules_version: 'v1.0' }),
      });
      onUploaded();
    } catch (e) {
      setError(e instanceof ApiError ? String(e.detail) : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#082552]">Submit your essay</h1>
        <p className="text-[#6B7280] mt-1">Candidate #{String(data.participant_number).padStart(3, '0')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
        {!uploaded ? (
          <>
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-10 text-center cursor-pointer hover:border-[#0067f5] transition-colors"
            >
              <div className="text-4xl mb-3">📄</div>
              <div className="font-medium text-[#082552]">{file ? file.name : 'Choose a PDF file'}</div>
              <div className="text-sm text-[#6B7280] mt-1">Max 5 pages · Min 1,000 words</div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            {file && (
              <button
                onClick={doUpload}
                disabled={uploading}
                className="mt-4 w-full bg-[#0067f5] text-white py-3 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload essay'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✓</div>
              <div className="font-medium text-[#082552]">Essay uploaded</div>
              {data.word_count && (
                <div className="text-sm text-[#6B7280] mt-1">
                  {data.page_count} pages · {data.word_count} words
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E7EB] pt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#0067f5]"
                />
                <span className="text-sm text-[#082552]">
                  I confirm this is my original work and I accept the competition rules.
                </span>
              </label>
              <button
                onClick={doSubmitFinal}
                disabled={!accepted || submitting}
                className="mt-4 w-full bg-[#0067f5] text-white py-3 rounded-lg font-medium hover:bg-[#0055cc] disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Lock essay and submit final →'}
              </button>
              <p className="text-xs text-[#6B7280] text-center mt-3">
                Once you submit, your essay cannot be replaced.
              </p>
            </div>
          </>
        )}

        {error && <div className="mt-4 bg-[#FFF1F2] border border-[#FF0059] rounded-lg p-3 text-sm text-[#FF0059]">{error}</div>}
        {success && <div className="mt-4 bg-[#DCFCE7] border border-[#16A34A] rounded-lg p-3 text-sm text-[#16A34A]">{success}</div>}
      </div>
    </div>
  );
}
