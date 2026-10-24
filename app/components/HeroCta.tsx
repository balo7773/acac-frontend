"use client";

import Link from "next/link";
import { portalPathFor, useAuth } from "@/lib/auth";

/** Hero primary CTA: /register when logged out, the role's portal when logged in. */
export default function HeroCta() {
  const { user } = useAuth();
  const href = user ? portalPathFor(user.role) : "/register";

  return (
    <Link
      id="hero-enter-competition"
      href={href}
      className="rounded-full bg-[#0067f5] px-7 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc]"
    >
      Enter Competition →
    </Link>
  );
}
