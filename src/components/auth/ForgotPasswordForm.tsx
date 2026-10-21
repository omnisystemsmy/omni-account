"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/lib/auth/actions";
import { validateEmail } from "@/lib/auth/validation";
import { Banner, Button, Field } from "@/components/ui/controls";
import { StateIcon } from "./AuthShell";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const ee = validateEmail(email);
    setEmailError(ee);
    if (ee) return;
    setBusy(true);
    const res = await requestPasswordReset(email);
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error);
  }

  if (sent) {
    return (
      <div>
        <StateIcon kind="mail" />
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-sub">
          If an Omni Account exists for <strong>{email.trim()}</strong>, we sent instructions to reset the password.
        </p>
        <div className="stack">
          <Link className="btn btn-primary" href={`/reset-password?email=${encodeURIComponent(email.trim())}`} style={{ textDecoration: "none" }}>
            I have a reset code
          </Link>
          <Link className="btn btn-outline" href="/sign-in" style={{ textDecoration: "none" }}>Back to sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-title">Forgot password?</h1>
      <p className="auth-sub">Enter your email and we will send you a link to reset it.</p>
      <form className="stack" onSubmit={onSubmit} noValidate>
        {error ? <Banner kind="error">{error}</Banner> : null}
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={emailError} placeholder="you@example.com" />
        <Button type="submit" loading={busy}>Send reset email</Button>
      </form>
      <p className="auth-foot"><Link href="/sign-in">Back to sign in</Link></p>
    </>
  );
}
