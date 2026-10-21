"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionInfo, signOut, type SessionInfo } from "@/lib/auth/actions";
import { formatDateTime } from "@/lib/format";
import type { Preferences } from "@/lib/profile/schema";
import { Banner } from "@/components/ui/controls";
import { Button } from "@/components/ui/controls";
import { ConfirmDialog, StatusBadge, useToast } from "@/components/ui/primitives";

export function SessionsPanel({ prefs, timeZone }: { prefs: Preferences; timeZone: string }) {
  const router = useRouter();
  const toast = useToast();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [dialog, setDialog] = useState<"others" | "all" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    getSessionInfo().then((i) => live && setInfo(i));
    return () => { live = false; };
  }, []);

  async function run(scope: "others" | "global") {
    setBusy(true);
    const res = await signOut(scope);
    setBusy(false);
    setDialog(null);
    if (!res.ok) return toast("error", res.error);
    if (scope === "global") {
      router.replace("/sign-in?notice=signed-out");
      router.refresh();
    } else toast("success", "Signed out of all other devices.");
  }

  const expires = info?.expiresAt ? new Date(info.expiresAt * 1000).toISOString() : null;

  return (
    <>
      <section className="card" aria-labelledby="cur">
        <h2 id="cur">This device</h2>
        <p className="row-line"><StatusBadge tone="ok">Current session</StatusBadge></p>
        <dl className="kv">
          <div><dt>Signed in</dt><dd>{info ? formatDateTime(info.signedInAt, prefs, timeZone) : "…"}</dd></div>
          <div><dt>Access token renews at</dt><dd>{info ? formatDateTime(expires, prefs, timeZone) : "…"}</dd></div>
        </dl>
        <p className="field-hint" style={{ marginTop: 12 }}>The access token renews automatically while you stay signed in.</p>
      </section>

      <section className="card" aria-labelledby="oth">
        <h2 id="oth">Other devices</h2>
        <div className="stack">
          <Banner kind="info">
            Supabase does not give an account a list of its sessions, so device names, locations and last-active times are not available.
            You can still sign out everywhere else.
          </Banner>
          <div className="form-actions" style={{ marginTop: 0 }}>
            <Button variant="outline" inline onClick={() => setDialog("others")}>Sign out other devices</Button>
            <Button variant="danger" inline onClick={() => setDialog("all")}>Sign out everywhere</Button>
          </div>
        </div>
      </section>

      <ConfirmDialog open={dialog === "others"} title="Sign out other devices?" confirmLabel="Sign out others" busy={busy}
        onConfirm={() => run("others")} onCancel={() => setDialog(null)}>
        <p>Every session except this one will end. Those devices will need to sign in again once their access expires.</p>
      </ConfirmDialog>
      <ConfirmDialog open={dialog === "all"} title="Sign out everywhere?" confirmLabel="Sign out everywhere" danger busy={busy}
        onConfirm={() => run("global")} onCancel={() => setDialog(null)}>
        <p>All sessions, including this one, will end. You will be taken to the sign-in page.</p>
      </ConfirmDialog>
    </>
  );
}
