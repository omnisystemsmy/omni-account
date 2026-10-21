"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { updateDisplayName } from "@/lib/auth/actions";
import { Banner, Button, Field } from "@/components/ui/controls";

export function ProfileForm({ email, initialName }: { email: string; initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!name.trim()) return setNameError("Enter a display name.");
    if (name.trim().length > 60) return setNameError("Use 60 characters or fewer.");
    setNameError(null);
    setBusy(true);
    const res = await updateDisplayName(name);
    setBusy(false);
    if (res.ok) {
      setStatus({ kind: "success", text: "Profile updated." });
      router.refresh();
    } else setStatus({ kind: "error", text: res.error });
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <h2>Personal information</h2>
      <div className="stack">
        {status ? <Banner kind={status.kind}>{status.text}</Banner> : null}
        <Field label="Display name" value={name} onChange={(e) => setName(e.target.value)} error={nameError} autoComplete="name" />
        <Field label="Email" value={email} readOnly disabled hint="Your email is your sign-in identity and cannot be changed here yet." />
        <Button type="submit" inline loading={busy}>Save changes</Button>
      </div>
    </form>
  );
}
