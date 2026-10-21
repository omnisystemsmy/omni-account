"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { hasRecoverySession, signOut, updatePassword, verifyRecoveryCode } from "@/lib/auth/actions";
import { validateEmail, validateNewPassword } from "@/lib/auth/validation";
import { Banner, Button, Field, PasswordField, StrengthMeter } from "@/components/ui/controls";
import { StateIcon } from "./AuthShell";

type Stage = "checking" | "code" | "password" | "done";

/**
 * Two ways in: the emailed link (arrives with a recovery session via /auth/callback)
 * or a one-time code, which is what Omni Tools' reset email uses.
 */
export function ResetPasswordForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("checking");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    hasRecoverySession().then((has) => live && setStage(has ? "password" : "code"));
    return () => { live = false; };
  }, []);

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const next = { email: validateEmail(email), code: code.trim() ? null : "Enter the code from the email." };
    setErrors(next);
    if (next.email || next.code) return;
    setBusy(true);
    const res = await verifyRecoveryCode(email, code);
    setBusy(false);
    if (res.ok) setStage("password");
    else setError(res.error);
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const next = { password: validateNewPassword(password), confirm: confirm === password ? null : "Passwords do not match." };
    setErrors(next);
    if (next.password || next.confirm) return;
    setBusy(true);
    const res = await updatePassword(password);
    if (!res.ok) {
      setBusy(false);
      return setError(res.error);
    }
    // End the recovery session on every device so the new password must be used.
    await signOut("global");
    setBusy(false);
    setStage("done");
  }

  if (stage === "checking") {
    return <p className="auth-sub" role="status">Checking your reset link…</p>;
  }

  if (stage === "done") {
    return (
      <div>
        <StateIcon kind="check" />
        <h1 className="auth-title">Password updated</h1>
        <p className="auth-sub">Sign in with your new password.</p>
        <div className="stack">
          <Button onClick={() => router.replace("/sign-in?notice=password-reset")}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  if (stage === "password") {
    return (
      <>
        <h1 className="auth-title">Set a new password</h1>
        <p className="auth-sub">Choose a password you have not used on this account.</p>
        <form className="stack" onSubmit={submitPassword} noValidate>
          {error ? <Banner kind="error">{error}</Banner> : null}
          <div className="field" style={{ gap: 10 }}>
            <PasswordField label="New password" autoComplete="new-password" value={password}
              onChange={(e) => setPassword(e.target.value)} error={errors.password}
              hint="At least 8 characters, with a letter and a number." />
            <StrengthMeter password={password} />
          </div>
          <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          <Button type="submit" loading={busy}>Update password</Button>
        </form>
      </>
    );
  }

  return (
    <>
      <h1 className="auth-title">Enter your reset code</h1>
      <p className="auth-sub">
        Open the link in your reset email, or enter the code it contains. Links expire, so request a new one if it does not work.
      </p>
      <form className="stack" onSubmit={submitCode} noValidate>
        {error ? <Banner kind="error">{error}</Banner> : null}
        <Field label="Email" type="email" autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Reset code" inputMode="numeric" autoComplete="one-time-code" value={code}
          onChange={(e) => setCode(e.target.value)} error={errors.code} />
        <Button type="submit" loading={busy}>Continue</Button>
      </form>
      <p className="auth-foot"><Link href="/forgot-password">Request a new email</Link></p>
    </>
  );
}
