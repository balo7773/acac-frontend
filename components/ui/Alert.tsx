import type { ReactNode } from "react";

export type AlertTone = "error" | "warning" | "success" | "info";

const TONES: Record<AlertTone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  warning: "border-acac-amber/40 bg-acac-amber/10 text-[#92400E]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-[#0067f5]/20 bg-[#EFF6FF] text-[#0055cc]",
};

function Icon({ tone }: { tone: AlertTone }) {
  if (tone === "success") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.25 8.25l1.75 1.75 3.75-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.75v3.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11" r=".9" fill="currentColor" />
    </svg>
  );
}

export function Alert({
  tone,
  children,
  className,
}: {
  tone: AlertTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${TONES[tone]} ${className ?? ""}`}
    >
      <Icon tone={tone} />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
