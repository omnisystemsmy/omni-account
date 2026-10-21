"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { resendVerification, signIn } from "@/lib/auth/actions";
import { validateEmail } from "@/lib/auth/validation";
import { Banner, Button, Field, PasswordField } from "@/components/ui/controls";

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [info, setInfo] = useState<string | null>(notice ?? null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setUnverified(false);
    const ee = validateEmail(email);
    const pe = password ? null : "Enter your password.";
    setEmailError(ee);
    setPassError(pe);
    if (ee || pe) return;
    setBusy(true);
    const res = await signIn(email, password);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      setUnverified(res.code === "email_not_confirmed");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  async function resend() {
    setBusy(true);
    const res = await resendVerification(email);
    setBusy(false);
    if (res.ok) {
      setError(null);
      setUnverified(false);
      setInfo(`We sent a new confirmation link to ${email.trim()}.`);
    } else setError(res.error);
  }

  return (
    <>
      <h1 className="auth-title">Sign in</h1>
      <p className="auth-sub">Use your Omni Account to continue.</p>
      <form className="stack" onSubmit={onSubmit} noValidate>
        {info ? <Banner kind="success">{info}</Banner> : null}
        {error ? <Banner kind="error">{error}</Banner> : null}
        {unverified ? (
          <Button type="button" variant="outline" onClick={resend} disabled={busy}>
            Resend confirmation email
          </Button>
        ) : null}
        <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={emailError} placeholder="you@example.com" />
        <PasswordField label="Password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={passError} />
        <div style={{ textAlign: "right", marginTop: -6 }}>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" loading={busy}>Sign in</Button>
      </form>
      <p className="auth-foot">
        New to Omni? <Link href="/create-account">Create an account</Link>
      </p>
    </>
  );
}
