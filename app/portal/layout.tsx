'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, loading, router]);

  if (loading) return <div className="p-16 text-center text-[#6B7280]">Loading…</div>;
  if (!user || user.role !== 'candidate') return null;
  return <div className="min-h-screen bg-[#F7F9FC]">{children}</div>;
}
