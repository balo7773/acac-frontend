"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { PasswordField, TextField } from "@/components/ui/Input";

/* ---------- Card shell ---------- */

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-start justify-center px-5 py-12 md:items-center md:py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(8,37,82,0.25)]">
        <h1 className="text-[28px] font-bold leading-tight tracking-tight text-acac-navy">{title}</h1>
        <p className="mt-1.5 text-sm text-acac-muted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
    </main>
  );
}

/* ---------- Alerts ---------- */

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "warning";
  children: ReactNode;
}) {
  return <Alert tone={tone}>{children}</Alert>;
}

/* ---------- Inputs (shared — see components/ui/Input.tsx) ---------- */

export { TextField, PasswordField };

/* ---------- Submit ---------- */

export function SubmitButton({
  id,
  loading,
  loadingText,
  children,
}: {
  id: string;
  loading: boolean;
  loadingText: string;
  children: ReactNode;
}) {
  return (
    <button
      id={id}
      type="submit"
      disabled={loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067f5] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden="true"
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
}
