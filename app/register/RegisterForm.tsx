"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, type FieldErrors } from "@/lib/api";
import { portalPathFor, useAuth, type RegisterPayload } from "@/lib/auth";
import { useToast } from "../components/Toast";
import { AuthCard, FormAlert, PasswordField, SubmitButton, TextField } from "../components/AuthForm";

type FormState = RegisterPayload & { confirm_password: string };

const EMPTY: FormState = {
  full_name: "",
  matric_number: "",
  whatsapp_number: "",
  linkedin_url: "",
  password: "",
  confirm_password: "",
};

// Mirrors backend Pydantic min_length constraints so users see errors before a round-trip.
function validate(f: FormState): FieldErrors {
  const e: FieldErrors = {};
  const req = (k: keyof FormState, label: string, min = 1) => {
    const v = f[k].trim();
    if (!v) e[k] = `${label} is required.`;
    else if (v.length < min) e[k] = `${label} must be at least ${min} characters.`;
  };
  req("full_name", "Full name", 2);
  req("matric_number", "Matric number", 3);
  req("whatsapp_number", "WhatsApp number", 7);
  req("linkedin_url", "LinkedIn URL", 5);

  if (!f.password) e.password = "Password is required.";
  else if (f.password.length < 8) e.password = "Password must be at least 8 characters.";

  if (!f.confirm_password) e.confirm_password = "Confirm your password.";
  else if (f.password && f.confirm_password !== f.password) e.confirm_password = "Passwords don't match.";

  return e;
}

type Alert = { tone: "error" | "warning"; message: string } | null;

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [alert, setAlert] = useState<Alert>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setAlert(null);

    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    if (!acceptedTerms) {
      setTermsError("You must accept the consent terms to register.");
      return;
    }
    setTermsError(null);

    setSubmitting(true);
    try {
      const { confirm_password: _c, ...payload } = form;
      void _c;
      const res = await register({
        full_name: payload.full_name.trim(),
        matric_number: payload.matric_number.trim(),
        whatsapp_number: payload.whatsapp_number.trim(),
        linkedin_url: payload.linkedin_url.trim(),
        password: payload.password,
      });

      // Part 2 stub: /portal doesn't exist yet → portalPathFor returns "/".
      showToast(
        <>
          <strong className="font-semibold">Account created — you&apos;re Player #{res.participant_number}.</strong>
          <br />
          Save this number: you&apos;ll use it to sign in. Portal coming soon.
        </>,
        12000
      );
      router.push(portalPathFor("candidate"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setAlert({ tone: "warning", message: "Registration is currently closed." });
      } else if (err instanceof ApiError) {
        if (Object.keys(err.fieldErrors).length) setErrors(err.fieldErrors);
        setAlert({ tone: "error", message: err.detail });
      } else {
        setAlert({ tone: "error", message: "Something went wrong. Please try again." });
      }
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Enter the competition"
      subtitle="Register to compete for the AFIT × Cowrywise Ambassador title"
    >
      <form onSubmit={onSubmit} noValidate className="space-y-3">
        <TextField
          id="register-full-name"
          label="Full name"
          autoComplete="name"
          value={form.full_name}
          onChange={set("full_name")}
          error={errors.full_name}
          disabled={submitting}
        />
        <TextField
          id="register-matric"
          label="Matric number"
          placeholder="U26XXX****"
          autoCapitalize="characters"
          spellCheck={false}
          value={form.matric_number}
          onChange={set("matric_number")}
          error={errors.matric_number}
          disabled={submitting}
        />
        <TextField
          id="register-whatsapp"
          label="WhatsApp number"
          type="tel"
          placeholder="+234..."
          autoComplete="tel"
          value={form.whatsapp_number}
          onChange={set("whatsapp_number")}
          error={errors.whatsapp_number}
          disabled={submitting}
        />
        <TextField
          id="register-linkedin"
          label="LinkedIn URL"
          type="url"
          placeholder="https://linkedin.com/in/..."
          autoCapitalize="none"
          spellCheck={false}
          value={form.linkedin_url}
          onChange={set("linkedin_url")}
          error={errors.linkedin_url}
          disabled={submitting}
        />
        <PasswordField
          id="register-password"
          label="Password"
          autoComplete="new-password"
          hint="At least 8 characters."
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          disabled={submitting}
        />
        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          value={form.confirm_password}
          onChange={set("confirm_password")}
          error={errors.confirm_password}
          disabled={submitting}
        />

        {alert && <FormAlert tone={alert.tone}>{alert.message}</FormAlert>}

        <div className="pt-1 md:col-span-2">
          <div className="flex justify-center">
            <label className="flex items-start gap-2 text-sm text-[#082552] cursor-pointer max-w-md">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked) setTermsError(null);
                }}
                className="mt-0.5 h-4 w-4 accent-[#0067f5] shrink-0"
              />
              <span>
                I have read and agree to the{" "}
                <a
                  href="/consent"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0067f5] underline hover:text-[#0055cc]"
                >
                  AI-marking and public-disclosure terms
                </a>
                .
              </span>
            </label>
          </div>
          {termsError && (
            <p className="mt-1 text-center text-xs text-[#FF0059]">{termsError}</p>
          )}

          <SubmitButton id="register-submit" loading={submitting} loadingText="Creating account...">
            Create account →
          </SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-acac-muted">
        Already registered?{" "}
        <Link id="register-to-login" href="/login" className="font-semibold text-acac-blue hover:underline">
          Sign in →
        </Link>
      </p>

      <p className="mt-6 border-t border-[#E5E7EB] pt-5 text-xs leading-relaxed text-acac-muted">
        Registration is only available during Stage 1 submission. If you see &ldquo;Registration
        closed&rdquo; below, the current round is not accepting new entries.
      </p>
    </AuthCard>
  );
}
