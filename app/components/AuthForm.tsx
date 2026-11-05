"use client";

import type { ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { PasswordField, TextField } from "@/components/ui/Input";

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
    <div className="w-full">
      <h1 className="text-center text-[26px] font-bold leading-tight tracking-tight text-acac-navy">{title}</h1>
      <p className="mt-1 text-center text-sm text-acac-muted">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "warning";
  children: ReactNode;
}) {
  return <Alert tone={tone}>{children}</Alert>;
}

export { TextField, PasswordField };

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
      className="flex h-12 w-full max-w-xs mx-auto items-center justify-center gap-2 rounded-full bg-[#0067f5] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-[#0055cc] disabled:cursor-not-allowed disabled:opacity-70"
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
