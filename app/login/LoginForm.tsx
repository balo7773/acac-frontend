"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { portalPathFor, useAuth, type Role } from "@/lib/auth";
import { AuthCard, FormAlert, PasswordField, SubmitButton, TextField } from "../components/AuthForm";

const ROLES: { value: Role; label: string }[] = [
  { value: "candidate", label: "Candidate" },
  { value: "judge", label: "Judge" },
  { value: "admin", label: "Admin" },
];

type Alert = { tone: "error" | "warning"; message: string } | null;

export default function LoginForm() {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [role, setRole] = useState<Role>("candidate");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);

  // Already signed in → bounce home.
  useEffect(() => {
    if (!authLoading && user) router.replace(portalPathFor(user.role));
  }, [authLoading, user, router]);

  const isCandidate = role === "candidate";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAlert(null);

    const ident = identifier.trim();
    if (!ident || !password) {
      setAlert({ tone: "error", message: "Enter your credentials to continue." });
      return;
    }
    // Backend rejects non-numeric candidate identifiers with a 400; catch it early.
    if (isCandidate && !/^\d+$/.test(ident)) {
      setAlert({
        tone: "error",
        message: "Candidates sign in with their numeric participant number (e.g. 466).",
      });
      return;
    }

    setSubmitting(true);
    try {
      const me = await login(ident, password, role);
      router.push(portalPathFor(me.role));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        const mins = err.retryAfter ? Math.ceil(err.retryAfter / 60) : null;
        setAlert({
          tone: "warning",
          message: mins ? `${err.detail} Try again in ${mins} minute${mins === 1 ? "" : "s"}.` : err.detail,
        });
      } else if (err instanceof ApiError) {
        setAlert({ tone: "error", message: err.detail });
      } else {
        setAlert({ tone: "error", message: "Something went wrong. Please try again." });
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your competition">
      {/* Role selector */}
      <div role="radiogroup" aria-label="Sign in as" className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => {
          const selected = r.value === role;
          return (
            <button
              key={r.value}
              id={`role-${r.value}`}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setRole(r.value);
                setAlert(null);
              }}
              className={`h-10 rounded-full border text-sm font-semibold transition-colors duration-150 ${
                selected
                  ? "border-[#0067f5] bg-[#0067f5] text-white"
                  : "border-[#E5E7EB] bg-white text-acac-navy hover:border-[#7cb4fc]"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        <TextField
          id="login-identifier"
          label={isCandidate ? "Participant number" : "Username"}
          placeholder={isCandidate ? "e.g. 466" : "Your username"}
          inputMode={isCandidate ? "numeric" : "text"}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          hint={isCandidate ? "The number you received when you registered." : undefined}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={submitting}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
        />

        {alert && <FormAlert tone={alert.tone}>{alert.message}</FormAlert>}

        <div className="pt-2">
          <SubmitButton id="login-submit" loading={submitting} loadingText="Signing in...">
            Sign in →
          </SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-acac-muted">
        New candidate?{" "}
        <Link id="login-to-register" href="/register" className="font-semibold text-acac-blue hover:underline">
          Register →
        </Link>
      </p>
    </AuthCard>
  );
}
