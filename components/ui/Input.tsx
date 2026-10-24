"use client";

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

/**
 * Shared input styling — originally from the Part 2 login form. Every text-like
 * control in the app should use `inputBase` so size/radius/focus ring stay identical.
 */
export const inputBase =
  "h-11 w-full rounded-lg border bg-white px-3 text-[15px] text-acac-navy outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#9CA3AF] focus:border-[#0067f5] focus:ring-2 focus:ring-[#0067f5]/20 disabled:bg-acac-surface";

export const labelBase = "mb-1.5 block text-sm font-medium text-acac-navy";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="mt-1.5 text-xs text-acac-muted">
        {hint}
      </p>
    );
  }
  return null;
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export function TextField({ id, label, error, hint, className, ...rest }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={`${inputBase} ${error ? "border-red-400" : "border-[#E5E7EB]"} ${className ?? ""}`}
        {...rest}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M1.75 10S4.75 4.25 10 4.25 18.25 10 18.25 10 15.25 15.75 10 15.75 1.75 10 1.75 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      {off && <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

export function PasswordField({ id, label, error, hint, ...rest }: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, error, hint)}
          className={`${inputBase} pr-11 ${error ? "border-red-400" : "border-[#E5E7EB]"}`}
          {...rest}
        />
        <button
          id={`${id}-toggle`}
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-acac-muted transition-colors hover:text-acac-navy"
        >
          <EyeIcon off={visible} />
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  hint?: string;
};

export function SelectField({ id, label, options, error, hint, className, ...rest }: SelectProps) {
  return (
    <div>
      <label htmlFor={id} className={labelBase}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, error, hint)}
          className={`${inputBase} appearance-none pr-10 ${error ? "border-red-400" : "border-[#E5E7EB]"} ${className ?? ""}`}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-acac-muted"
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}
