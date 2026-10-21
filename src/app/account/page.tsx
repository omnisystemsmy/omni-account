import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { displayNameOf, formatDate } from "@/lib/account";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;
  const verified = !!user.email_confirmed_at;

  return (
    <>
      <div>
        <h1 className="page-title">Welcome, {displayNameOf(user)}</h1>
        <p className="page-sub">Your Omni Account is shared across Omni apps.</p>
      </div>
      <section className="card" aria-labelledby="ov">
        <h2 id="ov">Account</h2>
        <dl className="kv">
          <div><dt>Email</dt><dd>{user.email}</dd></div>
          <div>
            <dt>Email status</dt>
            <dd><span className={`badge ${verified ? "badge-ok" : "badge-warn"}`}>{verified ? "Verified" : "Not verified"}</span></dd>
          </div>
          <div><dt>Member since</dt><dd>{formatDate(user.created_at)}</dd></div>
          <div><dt>Last sign-in</dt><dd>{formatDate(user.last_sign_in_at)}</dd></div>
          <div><dt>Omni User ID</dt><dd className="mono">{user.id}</dd></div>
        </dl>
      </section>
    </>
  );
}
