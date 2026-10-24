import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "danger" | "secondary";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[#0067f5] text-white hover:bg-[#0055cc] focus-visible:ring-[#0067f5]/30",
  secondary:
    "border border-[#E5E7EB] bg-white text-acac-navy hover:border-[#0067f5]/40 hover:text-[#0067f5] focus-visible:ring-[#0067f5]/20",
  ghost: "bg-transparent text-acac-navy hover:bg-acac-surface focus-visible:ring-[#0067f5]/20",
  danger: "bg-[#FF0059] text-white hover:bg-[#e0004e] focus-visible:ring-[#FF0059]/30",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: ReactNode;
};

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className ?? ""}`}
      {...rest}
    >
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
