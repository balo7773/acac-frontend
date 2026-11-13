'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Stage2ScoreForm } from '@/components/judge/Stage2ScoreForm';
import { apiFetch } from '@/lib/api';

export default function Stage2ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [hasScored, setHasScored] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if this specific candidate has already been scored by this judge
    apiFetch<{ finalists: any[] }>('/api/judge/stage2/finalists')
      .then((res) => {
        const match = res.finalists.find((f) => f.submission_id === Number(id));
        setHasScored(match ? match.has_my_score : false);
      })
      .catch(() => setHasScored(false));
  }, [id]);

  if (hasScored === null) return <div className="p-10 text-center text-gray-500">Checking status...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/judge/stage2" className="text-sm font-medium text-gray-500 hover:text-[#0067f5] mb-6 inline-block">
        ← Back to Finalists
      </Link>
      
      <Stage2ScoreForm 
        submissionId={Number(id)} 
        judgeType={user?.judge_type} 
        hasMyScore={hasScored} 
        onSubmitted={() => setHasScored(true)} 
      />
    </div>
  );
}
