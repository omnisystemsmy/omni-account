"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resendVerification, signUp } from "@/lib/auth/actions";
import { validateEmail, validateNewPassword } from "@/lib/auth/validation";
import { Banner, Button, Field, PasswordField, StrengthMeter } from "@/components/ui/controls";
import { StateIcon } from "./AuthShell";

export function CreateAccountForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; confirm?: string | null }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const next = {
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirm: confirm === password ? null : "Passwords do not match.",
    };
    setErrors(next);
    if (next.email || next.password || next.confirm) return;
    setBusy(true);
    const res = await signUp(email, password, name);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    if (res.data.needsVerification) setSentTo(email.trim());
    else {
      router.replace("/account");
      router.refresh();
    }
  }

  async function resend() {
    if (!sentTo) return;
    setBusy(true);
    const res = await resendVerification(sentTo);
    setBusy(false);
    if (res.ok) setResent(true);
    else setError(res.error);
  }

  if (sentTo) {
    return (
      <div>
        <StateIcon kind="mail" />
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-sub">
          We sent a confirmation link to <strong>{sentTo}</strong>. Open it to verify your address, then sign in.
        </p>
        <div className="stack">
          {resent ? <Banner kind="success">A new link is on its way.</Banner> : null}
          {error ? <Banner kind="error">{error}</Banner> : null}
          <Button variant="outline" onClick={resend} loading={busy}>Resend email</Button>
          <Link className="btn btn-primary" href="/sign-in" style={{ textDecoration: "none" }}>Go to sign in</Link>
        </div>
        <p className="auth-foot">Wrong address? <button className="linklike" onClick={() => setSentTo(null)} style={{ all: "unset", color: "var(--primary-pressed)", fontWeight: 600, cursor: "pointer" }}>Go back</button></p>
      </div>
    );
  }

  return (
    <>
      <h1 className="auth-title">Create your Omni Account</h1>
      <p className="auth-sub">One account for Omni Tools, Omni Docs and more.</p>
      <form className="stack" onSubmit={onSubmit} noValidate>
        {error ? <Banner kind="error">{error}</Banner> : null}
        <Field label="Name (optional)" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@example.com" />
        <div className="field" style={{ gap: 10 }}>
          <PasswordField label="Password" autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} error={errors.password}
            hint="At least 8 characters, with a letter and a number." />
          <StrengthMeter password={password} />
        </div>
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
        <Button type="submit" loading={busy}>Create account</Button>
      </form>
      <p className="auth-foot">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </>
  );
}
