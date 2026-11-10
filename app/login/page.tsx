import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";
import FloatingBubbles from "./FloatingBubbles";

export const metadata: Metadata = {
  title: "Sign in — ACAC",
  description: "Sign in to the AFIT Cowrywise Ambassadors Competition.",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F9FC] flex items-center justify-center px-4 py-4">
      <FloatingBubbles />

      <div className="relative z-10 w-full max-w-[700px] bg-white rounded-2xl p-6 shadow-xl border border-gray-200 flex flex-col">
        <div className="flex flex-col items-center mb-3 shrink-0">
          <Image
            src="/logos/venn.png"
            alt="AFIT × Cowrywise"
            width={340}
            height={100}
            className="h-20 w-auto object-contain mb-2"
            priority
          />
          <h1 className="text-xl font-bold tracking-tight text-[#082552]">
            ACAC
          </h1>
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#6B7280] text-center font-medium mt-1">
            AFIT × Cowrywise Ambassadors Competition
          </p>
        </div>

        {/* LoginForm WITHOUT hideRoleSelector, so Candidate/Judge pills show up */}
        <LoginForm />
      </div>
    </main>
  );
}
