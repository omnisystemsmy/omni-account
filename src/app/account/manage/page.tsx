import type { Metadata } from "next";
import Link from "next/link";
import { DeleteAccount } from "@/components/account/DeleteAccount";
import { SignOutButton } from "@/components/account/SignOutButton";
import { PageHeader, StatusBadge } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Account management" };

export default async function ManagePage() {
  const { user, prefs, timeZone } = await getAccount();
  const verified = !!user.email_confirmed_at;
  return (
    <>
      <PageHeader title="Account management" description="Account information and lifecycle." />
      <section className="card" aria-labelledby="inf">
        <h2 id="inf">Account information</h2>
        <dl className="kv">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div><dt>Email status</dt><dd><StatusBadge tone={verified ? "ok" : "warn"}>{verified ? "Verified" : "Not verified"}</StatusBadge></dd></div>
          <div><dt>Created</dt><dd>{formatDate(user.created_at, prefs, timeZone)}</dd></div>
          <div><dt>Omni User ID</dt><dd className="mono">{user.id}</dd></div>
        </dl>
        <p style={{ marginTop: 12 }}><Link href="/account/security">Change password or recover access</Link></p>
      </section>
      <section className="card" aria-labelledby="so">
        <h2 id="so">Sign out</h2>
        <p className="page-sub">End your session on this device. Your account stays remembered here so you can sign back in quickly.</p>
        <div className="stack"><SignOutButton /></div>
      </section>
      <DeleteAccount userId={user.id} />
    </>
  );
}
