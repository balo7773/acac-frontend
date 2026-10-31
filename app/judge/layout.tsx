'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { JudgeShell } from '@/components/judge/JudgeShell';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'judge')) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="p-16 text-center text-[#6B7280]">Loading…</div>;
  if (!user || user.role !== 'judge') return null;
  return <JudgeShell>{children}</JudgeShell>;
}
