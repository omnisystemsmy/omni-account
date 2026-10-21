"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth/actions";
import {
  initials, lastUsedLabel, loadRemembered, removeAccount, saveRemembered, upsertAccount,
  type RememberedAccount,
} from "@/lib/accounts/remembered";
import { Banner, Button } from "@/components/ui/controls";

type Status = "loading" | "ready";

export function ChooseAccount({ next, notice }: { next: string; notice?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");
  const [accounts, setAccounts] = useState<RememberedAccount[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      let list = loadRemembered();
      let active: string | null = null;
      try {
        // Validated against Supabase; a locally stored record can never make someone "signed in".
        const { data, error } = await createClient().auth.getUser();
        if (data.user) {
          active = data.user.id;
          const meta = data.user.user_metadata as { display_name?: string } | undefined;
          const known = list.find((a) => a.id === data.user!.id);
          if (!known && data.user.email) {
            list = upsertAccount(list, { id: data.user.id, email: data.user.email, name: meta?.display_name ?? "" });
            saveRemembered(list);
          }
        } else if (error && error.name !== "AuthSessionMissingError") {
          if (live) setCheckFailed(true);
        }
      } catch {
        if (live) setCheckFailed(true);
      }
      if (!live) return;
      setAccounts(list);
      setActiveId(active);
      setStatus("ready");
    })();
    return () => { live = false; };
  }, []);

  const enc = encodeURIComponent;

  function select(a: RememberedAccount) {
    if (a.id === activeId) router.push(next);
    else router.push(`/sign-in?email=${enc(a.email)}&next=${enc(next)}`);
  }

  async function remove(a: RememberedAccount) {
    const isActive = a.id === activeId;
    if (isActive && confirming !== a.id) return setConfirming(a.id);
    setBusy(true);
    if (isActive) {
      // Removing the signed-in account from this device also ends its session here. The Supabase user is untouched.
      await signOut("local");
      setActiveId(null);
    }
    const nextList = removeAccount(accounts, a.id);
    saveRemembered(nextList);
    setAccounts(nextList);
    setConfirming(null);
    setBusy(false);
    router.refresh();
  }

  const message =
    notice === "signed-out" ? "You have been signed out. Choose an account to sign back in." :
    notice === "session-expired" ? "Your session ended. Sign in again to continue." : null;

  return (
    <>
      <h1 className="auth-title">Choose an account</h1>
      <p className="auth-sub">to continue to Omni Account</p>

      <div className="stack">
        {message ? <Banner kind="info">{message}</Banner> : null}
        {checkFailed ? <Banner kind="error">We could not check your session. Select an account to sign in.</Banner> : null}

        {status === "loading" ? (
          <div role="status" aria-live="polite" className="acct-list">
            <div className="acct-skeleton" /><div className="acct-skeleton" />
            <span className="sr-only">Loading accounts…</span>
          </div>
        ) : accounts.length === 0 ? (
          <p className="auth-sub" style={{ textAlign: "center" }}>No accounts on this device yet.</p>
        ) : (
          <ul className="acct-list">
            {accounts.map((a) => {
              const active = a.id === activeId;
              const display = a.name || a.email.split("@")[0];
              return (
                <li key={a.id} className="acct-item">
                  <button type="button" className="acct-row" onClick={() => select(a)} disabled={busy}>
                    <span className="acct-avatar" aria-hidden="true">{initials(a.name, a.email)}</span>
                    <span className="acct-info">
                      <span className="acct-name">{display}</span>
                      <span className="acct-email">{a.email}</span>
                      <span className="acct-meta">
                        <span className={`badge ${active ? "badge-ok" : "badge-warn"}`}>{active ? "Signed in" : "Sign in required"}</span>
                        <span>Last used {lastUsedLabel(a.lastUsedAt)}</span>
                      </span>
                    </span>
                    <span className="acct-go" aria-hidden="true">›</span>
                    <span className="sr-only">{active ? "Continue as" : "Sign in as"} {display}</span>
                  </button>
                  {confirming === a.id ? (
                    <div className="acct-confirm" role="alert">
                      <span>This also signs you out on this device.</span>
                      <Button variant="danger" inline style={{ minHeight: 36, padding: "0 16px" }} onClick={() => remove(a)} loading={busy}>Remove</Button>
                      <Button variant="outline" inline style={{ minHeight: 36, padding: "0 16px" }} onClick={() => setConfirming(null)} disabled={busy}>Cancel</Button>
                    </div>
                  ) : (
                    <button type="button" className="acct-remove" onClick={() => remove(a)} disabled={busy}
                      aria-label={`Remove ${display} from this device`} title="Remove from this device">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <Link className="btn btn-outline" href={`/sign-in?add=1&next=${enc(next)}`} style={{ textDecoration: "none" }}>
          + Add another account
        </Link>
        <p className="field-hint" style={{ textAlign: "center" }}>
          Only one account is signed in at a time. Removing an account only forgets it on this device.
        </p>
      </div>
    </>
  );
}
