"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { portalPathFor, useAuth, type Role } from "@/lib/auth";
import { AuthCard, FormAlert, PasswordField, SubmitButton, TextField } from "../components/AuthForm";

// Admin is intentionally not on the public login page.
// Admins sign in at /admin-login (hidden URL).
const ROLES: { value: Role; label: string }[] = [
  { value: "candidate", label: "Candidate" },
  { value: "judge", label: "Judge" },
];

type Alert = { tone: "error" | "warning"; message: string } | null;

export default function LoginForm({ defaultRole = "candidate", hideRoleSelector = false }: { defaultRole?: Role, hideRoleSelector?: boolean } = {}) {
  const router = useRouter();
  const { user, loading: authLoading, login } = useAuth();

  const [role, setRole] = useState<Role>(defaultRole);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  
  const [showHelp, setShowHelp] = useState(false);
  const [helpIdent, setHelpIdent] = useState("");
  const [helpMsg, setHelpMsg] = useState("");
  const [helpStatus, setHelpStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

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
      
      // Use window.location.href to force a hard reload and bypass React routing conflicts
      if (password === "TempPass2026!") {
        window.location.href = "/reset-password";
      } else {
        router.push(portalPathFor(me.role));
      }
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

  async function submitHelp(e: FormEvent) {
    e.preventDefault();
    if (!helpIdent || !helpMsg) return;
    setHelpStatus("sending");
    try {
      const res = await fetch("/api/public/help-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant_number: helpIdent.trim(), message: helpMsg.trim() })
      });
      if (res.ok) {
        setHelpStatus("sent");
      } else {
        setHelpStatus("error");
      }
    } catch {
      setHelpStatus("error");
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to continue your competition">
      {/* Role selector — hidden on /admin-login */}
      {!hideRoleSelector && (
      <div role="radiogroup" aria-label="Sign in as" className="grid grid-cols-2 gap-2">
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
      )}

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

      <p className="mt-4 text-center text-sm text-acac-muted">
        Trouble logging in?{" "}
        <button type="button" onClick={() => setShowHelp(true)} className="font-semibold text-[#0067f5] hover:underline">
          Request Help
        </button>
      </p>

      {/* SOS Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative">
            <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 font-bold text-xl">&times;</button>
            <h3 className="text-xl font-bold text-[#082552] mb-2 pr-6">Account Locked?</h3>
            <p className="text-sm text-[#6B7280] mb-5">Enter your Candidate Number and a brief message. The Admin will reset your password.</p>
            
            {helpStatus === "sent" ? (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium text-center">
                ✅ Request sent! The Admin will contact you soon.
              </div>
            ) : (
              <form onSubmit={submitHelp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Number</label>
                  <input value={helpIdent} onChange={e => setHelpIdent(e.target.value)} placeholder="e.g. 1" className="w-full border rounded-lg p-2.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea value={helpMsg} onChange={e => setHelpMsg(e.target.value)} placeholder="I'm locked out and need my password reset." className="w-full border rounded-lg p-2.5 text-sm h-24 resize-none" required />
                </div>
                {helpStatus === "error" && <p className="text-xs text-red-500">Could not find that Candidate Number in our system.</p>}
                <button disabled={helpStatus === "sending"} type="submit" className="w-full bg-[#0067f5] text-white font-bold py-2.5 rounded-lg hover:bg-blue-600 transition-colors">
                  {helpStatus === "sending" ? "Sending..." : "Send SOS Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AuthCard>
  );
}
