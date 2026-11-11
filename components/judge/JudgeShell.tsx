'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
 // Adjust path if your SiteFooter is elsewhere

const maskDisplay = (mask?: string) => {
  const m = (mask || '').replace('mask_', '');
  // Map the masks to Judge 1-4
  if (m === 'owl') return 'Judge 1';
  if (m === 'lion') return 'Judge 2';
  if (m === 'fox') return 'Judge 3';
  if (m === 'bear') return 'Judge 4';
  return 'Judge'; // Fallback
};

const judgeTypeLabel = (t?: string) => {
  if (t === 'internal') return 'Internal judge';
  if (t === 'external') return 'External judge';
  return 'Judge';
};


const getJudgeName = (mask?: string) => {
  if (!mask) return "Judge";
  const map: Record<string, string> = {
    mask_owl: "Judge 1",
    mask_falcon: "Judge 2",
    mask_lion: "Judge 3",
    mask_panther: "Judge 4",
  };
  return map[mask] || "Judge";
};

export function JudgeShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          
          {/* Left side: Back button + Logo */}
          <div className="flex items-center gap-5">
            <Link 
              href="/" 
              className="text-xs font-semibold text-gray-500 hover:text-[#0067f5] transition-colors border-r border-gray-300 pr-5 hidden sm:block"
            >
              ← Back to Home
            </Link>
            <Link href="/judge" className="flex items-baseline gap-2">
              <span className="text-[20px] font-bold tracking-tight text-[#082552]">ACAC</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#6B7280]">Judge</span>
            </Link>
          </div>

          {/* Right side: User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-[#082552]">
                {getJudgeName(user?.mask_avatar)}
              </div>
              <div className="text-xs text-[#6B7280]">{judgeTypeLabel(user?.judge_type)}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#0067f5] font-bold">
              {getJudgeName(user?.mask_avatar).charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-[#6B7280] hover:text-[#082552] transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      
    </div>
  );
}
