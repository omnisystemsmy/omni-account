"use client";
import { useState, type FormEvent } from "react";
import { changePassword, signOut } from "@/lib/auth/actions";
import { validateNewPassword } from "@/lib/auth/validation";
import { Banner, Button, PasswordField, StrengthMeter } from "@/components/ui/controls";

type Status = { kind: "success" | "error"; text: string } | null;

export function SecurityPanel({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [others, setOthers] = useState<Status>(null);
  const [othersBusy, setOthersBusy] = useState(false);

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
      setStatus({ kind: "success", text: "Password updated." });
      setCurrent(""); setNext(""); setConfirm("");
    } else setStatus({ kind: "error", text: res.error });
  }

  async function signOutOthers() {
    setOthers(null);
    setOthersBusy(true);
    const res = await signOut("others");
    setOthersBusy(false);
    setOthers(res.ok
      ? { kind: "success", text: "Signed out of all other devices." }
      : { kind: "error", text: res.error });
  }

  return (
    <>
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
      <section className="card">
        <h2>Sessions</h2>
        <p className="page-sub">Sign out everywhere except this browser, for example if you lost a device.</p>
        <div className="stack">
          {others ? <Banner kind={others.kind}>{others.text}</Banner> : null}
          <Button variant="outline" inline onClick={signOutOthers} loading={othersBusy}>Sign out other devices</Button>
        </div>
      </section>
    </>
  );
}
