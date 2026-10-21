"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signOut } from "@/lib/auth/actions";
import { Banner, Button, PasswordField } from "@/components/ui/controls";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!password) return setError("Enter your password to confirm.");
    setBusy(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setBusy(false);
        return setError(body.error ?? "Could not delete the account. Please try again.");
      }
      await signOut("local");
      router.replace("/sign-in?notice=deleted");
      router.refresh();
    } catch {
      setBusy(false);
      setError("No internet connection. Check it and try again.");
    }
  }

  return (
    <section className="card danger" aria-labelledby="del">
      <h2 id="del">Delete account</h2>
      <p className="page-sub">
        Permanently deletes your Omni Account and signs you out everywhere. Omni apps that use this account will no longer
        recognise you. This cannot be undone.
      </p>
      {!open ? (
        <div className="stack">
          <Button variant="danger" inline onClick={() => setOpen(true)}>Delete my account</Button>
        </div>
      ) : (
        <form className="stack" onSubmit={onSubmit} noValidate>
          {error ? <Banner kind="error">{error}</Banner> : null}
          <PasswordField label="Confirm with your password" autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)} />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Button type="submit" variant="danger" inline loading={busy}>Permanently delete</Button>
            <Button type="button" variant="outline" inline onClick={() => { setOpen(false); setPassword(""); setError(null); }} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
