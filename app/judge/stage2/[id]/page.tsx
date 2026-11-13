'use client';
import { use, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Stage2ScoreForm } from '@/components/judge/Stage2ScoreForm';

export default function Stage2ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/judge/stage2" className="text-sm font-medium text-gray-500 hover:text-[#0067f5] mb-6 inline-block">
        ← Back to Finalists
      </Link>
      
      <Stage2ScoreForm 
        submissionId={Number(id)} 
        judgeType={user?.judge_type} 
        hasMyScore={submitted} 
        onSubmitted={() => setSubmitted(true)} 
      />
    </div>
  );
}
