import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "../login/LoginForm";
import FloatingBubbles from "../login/FloatingBubbles";

export const metadata: Metadata = {
  title: "Admin Sign in — ACAC",
  description: "Admin access only.",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC] flex flex-col items-center justify-start px-5 pt-10 pb-12">
      <FloatingBubbles />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-4">
          <Image src="/logos/venn.png" alt="AFIT × Cowrywise" width={360} height={120} className="h-28 w-auto object-contain" priority />
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-[#082552]">ACAC</h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#6B7280] text-center">
            AFIT × Cowrywise Ambassadors Competition
          </p>
        </div>
        <LoginForm defaultRole="admin" hideRoleSelector={true} />
      </div>
    </main>
  );
}
