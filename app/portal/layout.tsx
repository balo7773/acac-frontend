'use client';

import Link from "next/link";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'candidate')) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#6B7280]">Loading Candidate Portal...</div>;
  }
  
  if (!user || user.role !== 'candidate') {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      {/* Top Header for Portal */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-sm font-semibold text-gray-500 hover:text-[#0067f5] transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </Link>
          <div className="text-sm font-bold text-[#082552] uppercase tracking-wider">
            Candidate #{user.user_id}
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {children}
      </main>
    </div>
  );
}
