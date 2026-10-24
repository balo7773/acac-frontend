"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { portalPathFor, roleLabel, useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Competition Stages", href: "/#stages" },
  { label: "Rules", href: "/rules" },
  { label: "FAQ", href: "/faq" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // /api/auth/me doesn't return display_name, so fall back to the role after a reload.
  const greeting = user ? user.display_name ?? roleLabel(user.role) : "";

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-acac-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Wordmark lockup */}
        <Link href="/" className="flex items-baseline gap-2" aria-label="ACAC Arena home">
          <span className="text-[20px] font-bold tracking-tight text-acac-navy">ACAC</span>
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-acac-muted">
            Arena
          </span>
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:block" aria-label="Primary">
          <ul className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-acac-navy transition-colors duration-200 hover:text-acac-blue"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right — desktop. Hidden (not removed) while the session loads to avoid layout jump. */}
        <div
          className={`hidden items-center gap-5 transition-opacity duration-200 md:flex ${
            loading ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {user ? (
            <>
              <span className="text-sm text-acac-muted">
                Hi, <span className="font-medium text-acac-navy">{greeting}</span>
              </span>
              <button
                id="header-logout"
                type="button"
                onClick={handleLogout}
                className="text-sm text-acac-muted transition-colors duration-200 hover:text-acac-navy"
              >
                Log out
              </button>
              <Link
                id="header-go-to-portal"
                href={portalPathFor(user.role)}
                className="rounded-full bg-acac-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-acac-blue-hover"
              >
                Go to portal →
              </Link>
            </>
          ) : (
            <>
              <Link
                id="header-login"
                href="/login"
                className="text-sm text-acac-muted transition-colors duration-200 hover:text-acac-navy"
              >
                Already registered? <span className="font-medium">Log in</span>
              </Link>
              <Link
                id="header-enter-competition"
                href="/register"
                className="rounded-full bg-acac-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-acac-blue-hover"
              >
                Enter Competition →
              </Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          id="mobile-menu-toggle"
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-[2px] w-5 rounded bg-acac-navy transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 rounded bg-acac-navy transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-5 rounded bg-acac-navy transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel — no primary CTA here; it lives in the page flow */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-acac-border bg-white px-5 pb-5 pt-2 md:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-[15px] font-medium text-acac-navy"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 border-t border-acac-border pt-3">
              {user ? (
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-acac-muted">
                    Hi, <span className="font-medium text-acac-navy">{greeting}</span>
                  </span>
                  <button
                    id="mobile-logout"
                    type="button"
                    onClick={handleLogout}
                    className="font-medium text-acac-navy"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm text-acac-muted"
                >
                  Already registered? <span className="font-medium text-acac-navy">Log in</span>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
