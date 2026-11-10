"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  // Hide footer on auth pages
    const isPortal = 
    pathname === "/judge" || pathname?.startsWith("/judge/") ||
    pathname === "/admin" || pathname?.startsWith("/admin/") ||
    pathname === "/portal" || pathname?.startsWith("/portal/");

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/admin-login") ||
    isPortal
  ) {
    return null;
  }

  return (
    <footer className="border-t border-[#E5E7EB] bg-white py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="font-bold text-acac-navy">AFIT</span>
          <span className="mx-1.5 text-acac-muted">×</span>
          <span className="font-bold text-acac-navy">Cowrywise</span>
        </p>

        <p className="text-acac-muted">
          © 2026 AFIT Cowrywise Ambassadors Competition
        </p>

        <Link 
          href="/about" 
          className="text-xs text-[#6B7280] transition-colors hover:text-[#0067f5]"
        >
          From the Hosts —
        </Link>
      </div>
    </footer>
  );
}
