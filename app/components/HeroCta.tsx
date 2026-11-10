"use client";

import Link from "next/link";
import { portalPathFor, useAuth } from "@/lib/auth";
import type { Phase } from "@/lib/admin";

/**
 * Hero primary CTA.
 * - Logged in: routes to the user's own portal, regardless of phase.
 * - Logged out, phase in {pre_launch, stage_1_submitting}: "Enter Competition" -> /register.
 * - Logged out, any later phase: "View Your Verdict" -> /login.
 */
export default function HeroCta({ phase }: { phase: Phase | null }) {
  const { user } = useAuth();

  if (user) {
    return (
      <Link
        id="hero-enter-competition"
        href={portalPathFor(user.role)}
        className="rounded-full bg-[#0067f5] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc]"
      >
        Go to your portal →
      </Link>
    );
  }

  const isEarlyPhase = phase === "pre_launch" || phase === "stage_1_submitting";

  if (isEarlyPhase) {
    return (
      <Link
        id="hero-enter-competition"
        href="/register"
        className="rounded-full bg-[#0067f5] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc]"
      >
        Enter Competition →
      </Link>
    );
  }

  return (
    <Link
      id="hero-view-verdict"
      href="/login"
      className="rounded-full bg-[#0067f5] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc]"
    >
      View Your Verdict →
    </Link>
  );
}
