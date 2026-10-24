import type { ReactNode } from "react";

/** Small label/value card. `accent` colours the value (e.g. a live countdown). */
export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "navy",
  mono = false,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "navy" | "blue" | "amber" | "pink";
  mono?: boolean;
}) {
  const color = {
    navy: "text-[#082552]",
    blue: "text-[#0067f5]",
    amber: "text-[#B45309]",
    pink: "text-[#FF0059]",
  }[accent];

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_24px_-16px_rgba(8,37,82,0.25)]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[#6B7280]">
        {icon && <span className="text-[#0067f5]">{icon}</span>}
        {label}
      </div>
      <div className={`mt-2 text-xl font-bold ${color} ${mono ? "tabular-nums" : ""}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-[#6B7280]">{sub}</div>}
    </div>
  );
}
