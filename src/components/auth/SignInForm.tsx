"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { resendVerification, signIn } from "@/lib/auth/actions";
import { validateEmail } from "@/lib/auth/validation";
import { initials, loadRemembered } from "@/lib/accounts/remembered";
import { Banner, Button, Field, PasswordField } from "@/components/ui/controls";

export function SignInForm({
  next, notice, noticeKey, email: presetEmail, add,
}: { next: string; notice?: string; noticeKey?: string; email?: string; add?: boolean }) {
  const router = useRouter();
  const locked = !!presetEmail;
  const [email, setEmail] = useState(presetEmail ?? "");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [info, setInfo] = useState<string | null>(notice ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const list = loadRemembered();
    if (!locked && !add && list.length > 0) {
      // Returning visitor: offer the account chooser instead of an empty form.
      const q = new URLSearchParams({ next });
      if (noticeKey) q.set("notice", noticeKey);
      router.replace(`/choose-account?${q}`);
    }
  }, [locked, add, next, noticeKey, router]);

  // Display name of the remembered account (client-only; empty during SSR).
  const rememberedName = useSyncExternalStore(
    () => () => {},
    () => (presetEmail ? loadRemembered().find((a) => a.email.toLowerCase() === presetEmail.toLowerCase())?.name ?? "" : ""),
    () => "",
  );

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
      <h1 className="auth-title">{locked ? "Welcome back" : add ? "Add another account" : "Sign in"}</h1>
      <p className="auth-sub">
        {locked ? "Enter your password to continue." : add ? "Sign in with another Omni Account. This replaces the account signed in on this device." : "Use your Omni Account to continue."}
      </p>
      <form className="stack" onSubmit={onSubmit} noValidate>
        {info ? <Banner kind="success">{info}</Banner> : null}
        {error ? <Banner kind="error">{error}</Banner> : null}
        {unverified ? (
          <Button type="button" variant="outline" onClick={resend} disabled={busy}>
            Resend confirmation email
          </Button>
        ) : null}
        {locked ? (
          <div className="acct-chip">
            <span className="acct-avatar" aria-hidden="true">{initials(rememberedName, email)}</span>
            <span className="acct-info">
              {rememberedName ? <span className="acct-name">{rememberedName}</span> : null}
              <span className="acct-email">{email}</span>
            </span>
            <Link href={`/choose-account?next=${encodeURIComponent(next)}`}>Change</Link>
          </div>
        ) : (
          <Field label="Email" type="email" autoComplete="email" inputMode="email" value={email}
            onChange={(e) => setEmail(e.target.value)} error={emailError} placeholder="you@example.com" />
        )}
        <PasswordField label="Password" autoComplete="current-password" autoFocus={locked} value={password}
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
