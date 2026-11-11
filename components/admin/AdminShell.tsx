"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { roleLabel, useAuth } from "@/lib/auth";

type NavItem = { href: string; label: string; enabled: boolean; note?: string; icon: ReactNode };

const ico = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", enabled: true, icon: ico("M3 10.5L10 4l7 6.5M5 9v7h4v-4h2v4h4V9") },
  { href: "/admin/candidates", label: "Candidates", enabled: true, icon: ico("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z") },
  {
    href: "/admin/judges",
    label: "Judges",
    enabled: true,
    icon: ico("M7.5 9a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5zM2.5 16c0-2.5 2.25-4.25 5-4.25s5 1.75 5 4.25M13 4a2.5 2.5 0 010 4.75M14.5 11.9c1.75.45 3 1.85 3 4.1"),
  },
  {
    href: "/admin/leaderboard",
    label: "Leaderboard",
    enabled: true,
    icon: ico("M6 3.5h8v3.75a4 4 0 01-8 0V3.5zM6 5H3.5v1a2.5 2.5 0 002.6 2.5M14 5h2.5v1a2.5 2.5 0 01-2.6 2.5M10 11.25V14M7 16.5h6M8 14h4"),
  },
  { href: "/admin/similarity", label: "Similarity", enabled: true, icon: ico("M7.5 13.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12.5 15.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z") },
  { href: "/admin/settings", label: "Settings", enabled: true, icon: ico("M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1L4.7 4.7") },
  { href: "/admin/ai-health", label: "AI Health", enabled: true, icon: ico("M2.5 10h3l2-4.5 3 9 2-4.5h5") },
  { href: "/admin/complaints", label: "Complaints", enabled: true, icon: ico("M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0") },
  { href: "/admin/audit-log", label: "Audit Log", enabled: true, icon: ico("M5.5 2.5h6.5l3 3v12h-9.5v-15zM12 2.5v3h3M8 9.5h4.5M8 12.5h4.5") },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Wordmark() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5" aria-label="ACAC Admin dashboard">
      <span className="text-[20px] font-bold tracking-tight text-[#082552]">ACAC</span>
      <span className="rounded-full bg-[#FFE5EC] px-2 py-0.5 text-[11px] font-semibold tracking-[0.18em] text-[#FF0059]">
        ADMIN
      </span>
    </Link>
  );
}

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    apiFetch<{ total: number }>('/api/admin/notification-counts')
      .then(res => setAlertCount(res.total))
      .catch(e => alert('Badge API Error: ' + e.message));
  }, []);

  return (
    <nav aria-label="Admin">
      <ul className="space-y-1">
        {navItems.map((item) => {
          if (!item.enabled) {
            return (
              <li key={item.label}>
                <span
                  aria-disabled="true"
                  title={`Coming in ${item.note}`}
                  className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#082552]/40"
                >
                  <span className="text-[#6B7280]/50">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <span className="rounded-md bg-[#F7F9FC] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#6B7280]/70">
                    {item.note}
                  </span>
                </span>
              </li>
            );
          }
          const active = isActive(pathname, item.href);
          return (
            <li key={item.label}>
              <Link
                id={`admin-nav-${item.label.toLowerCase()}`}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                  active
                    ? "bg-[#EFF6FF] font-medium text-[#0067f5]"
                    : "text-[#082552] hover:bg-[#F7F9FC] hover:text-[#0067f5]"
                }`}
              >
                <span className={active ? "text-[#0067f5]" : "text-[#6B7280] group-hover:text-[#0067f5]"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.label === "Complaints" && alertCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {alertCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminShell({
 children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const signOut = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-[#E5E7EB] bg-white px-4 py-6 md:flex">
        <div className="px-2">
          <Wordmark />
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        <SidebarFooter onSignOut={signOut} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[#E5E7EB] bg-white px-4 md:hidden">
        <button
          id="admin-menu-toggle"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="-ml-1 flex h-10 w-10 items-center justify-center rounded-lg text-[#082552] hover:bg-[#F7F9FC]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <Wordmark />
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="modal-fade absolute inset-0 bg-black/40" aria-hidden="true" onClick={() => setOpen(false)} />
          <aside
            id="admin-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="drawer-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white px-4 py-5 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2">
              <Wordmark />
              <button
                id="admin-menu-close"
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F7F9FC] hover:text-[#082552]"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter onSignOut={signOut} />
          </aside>
        </div>
      )}

      <main className="min-h-screen bg-[#F7F9FC] p-6 md:ml-60 md:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
