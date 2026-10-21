"use client";
import { useState, type FormEvent } from "react";
import { requestEmailChange } from "@/lib/auth/actions";
import { validateEmail } from "@/lib/auth/validation";
import { Banner, Button, Field, PasswordField } from "@/components/ui/controls";
import { StatusBadge } from "@/components/ui/primitives";

export function EmailChangeCard({ email, verified, pendingEmail }: { email: string; verified: boolean; pendingEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const [next, setNext] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    const v = {
      email: validateEmail(next) ?? (next.trim().toLowerCase() === email.toLowerCase() ? "That is already your email." : null),
      password: password ? null : "Enter your password.",
    };
    setErrors(v);
    if (v.email || v.password) return;
    setBusy(true);
    const res = await requestEmailChange(email, password, next);
    setBusy(false);
    if (res.ok) {
      setStatus({ kind: "success", text: `We sent a confirmation link to ${next.trim()}. Your email changes only after you open it (you may also get one at ${email}).` });
      setOpen(false); setPassword(""); setNext("");
    } else setStatus({ kind: "error", text: res.error });
  }

  return (
    <section className="card" aria-labelledby="em">
      <h2 id="em">Email address</h2>
      <p className="row-line">
        <span className="mono-wrap">{email}</span>
        <StatusBadge tone={verified ? "ok" : "warn"}>{verified ? "Verified" : "Not verified"}</StatusBadge>
      </p>
      {pendingEmail ? <div className="stack"><Banner kind="info">Change to <strong>{pendingEmail}</strong> is waiting for confirmation.</Banner></div> : null}
      <p className="page-sub">Your email is your sign-in identity across Omni apps. Changing it requires confirming through email.</p>
      <div className="stack">
        {status ? <Banner kind={status.kind}>{status.text}</Banner> : null}
        {!open ? (
          <Button variant="outline" inline onClick={() => setOpen(true)}>Change email</Button>
        ) : (
          <form className="stack" style={{ marginTop: 0 }} onSubmit={onSubmit} noValidate>
            <Field label="New email address" type="email" autoComplete="email" value={next} onChange={(e) => setNext(e.target.value)} error={errors.email} />
            <PasswordField label="Current password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            <div className="form-actions">
              <Button type="submit" inline loading={busy}>Send confirmation</Button>
              <Button type="button" variant="outline" inline onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
