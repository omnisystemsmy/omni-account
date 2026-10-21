"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { changePassword, sendRecoveryEmail } from "@/lib/auth/actions";
import { validateNewPassword } from "@/lib/auth/validation";
import { Banner, Button, PasswordField, StrengthMeter } from "@/components/ui/controls";
import { StatusBadge, useToast } from "@/components/ui/primitives";

type Status = { kind: "success" | "error"; text: string } | null;

export function SecurityPanel({ email, verified }: { email: string; verified: boolean }) {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [mailBusy, setMailBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    const v = {
      current: current ? null : "Enter your current password.",
      next: validateNewPassword(next) ?? (next === current ? "Choose a different password." : null),
      confirm: confirm === next ? null : "Passwords do not match.",
    };
    setErrors(v);
    if (v.current || v.next || v.confirm) return;
    setBusy(true);
    const res = await changePassword(email, current, next);
    setBusy(false);
    if (res.ok) {
      toast("success", "Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } else setStatus({ kind: "error", text: res.error });
  }

  async function sendReset() {
    setMailBusy(true);
    const res = await sendRecoveryEmail(email);
    setMailBusy(false);
    toast(res.ok ? "success" : "error", res.ok ? `Reset email sent to ${email}.` : res.error);
  }

  return (
    <>
      <section className="card" aria-labelledby="ver">
        <h2 id="ver">Sign-in method</h2>
        <dl className="kv">
          <div><dt>Email</dt><dd>{email}</dd></div>
          <div><dt>Email status</dt><dd><StatusBadge tone={verified ? "ok" : "warn"}>{verified ? "Verified" : "Not verified"}</StatusBadge></dd></div>
          <div><dt>Password</dt><dd>Set</dd></div>
          <div><dt>Two-step verification</dt><dd><StatusBadge tone="muted">Not available yet</StatusBadge></dd></div>
        </dl>
        <p className="field-hint" style={{ marginTop: 12 }}>
          To change your email address, go to <Link href="/account/personal">Personal information</Link>.
        </p>
      </section>

      <form className="card" onSubmit={onSubmit} noValidate>
        <h2>Change password</h2>
        <div className="stack">
          {status ? <Banner kind={status.kind}>{status.text}</Banner> : null}
          <PasswordField label="Current password" autoComplete="current-password" value={current}
            onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
          <div className="field" style={{ gap: 10 }}>
            <PasswordField label="New password" autoComplete="new-password" value={next}
              onChange={(e) => setNext(e.target.value)} error={errors.next}
              hint="At least 8 characters, with a letter and a number." />
            <StrengthMeter password={next} />
          </div>
          <PasswordField label="Confirm new password" autoComplete="new-password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
          <Button type="submit" inline loading={busy}>Update password</Button>
        </div>
      </form>

      <section className="card" aria-labelledby="rec">
        <h2 id="rec">Password recovery</h2>
        <p className="page-sub">Forgot your current password? We can email a reset link to {email}.</p>
        <div className="stack">
          <Button variant="outline" inline onClick={sendReset} loading={mailBusy}>Email me a reset link</Button>
        </div>
      </section>
    </>
  );
}
