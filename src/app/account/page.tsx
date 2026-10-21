import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, StatusBadge, Avatar } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";
import { profileCompleteness } from "@/lib/account/meta";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Overview" };

export default async function OverviewPage() {
  const { user, profile, prefs, timeZone, displayName, avatarUrl, avatarPath } = await getAccount();
  const verified = !!user.email_confirmed_at;
  const c = profileCompleteness(user, profile, !!avatarPath);

  return (
    <>
      <PageHeader title="Overview" description="Your Omni Account at a glance." />

      <section className="card hero" aria-label="Profile">
        <Avatar url={avatarUrl} name={displayName} size={72} />
        <div className="hero-info">
          <h2 className="hero-name">{displayName}</h2>
          <p className="hero-email">{user.email}</p>
          <p className="row-line">
            <StatusBadge tone={verified ? "ok" : "warn"}>{verified ? "Email verified" : "Email not verified"}</StatusBadge>
          </p>
        </div>
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="acc">
          <h2 id="acc">Account</h2>
          <dl className="kv one">
            <div><dt>Member since</dt><dd>{formatDate(user.created_at, prefs, timeZone)}</dd></div>
            <div><dt>Last sign-in</dt><dd>{formatDateTime(user.last_sign_in_at, prefs, timeZone)}</dd></div>
            <div><dt>Omni User ID</dt><dd className="mono">{user.id}</dd></div>
          </dl>
        </section>

        <section className="card" aria-labelledby="pc">
          <h2 id="pc">Profile completeness</h2>
          <div className="meter" role="progressbar" aria-valuenow={c.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completeness">
            <span style={{ width: `${c.percent}%` }} />
          </div>
          <p className="field-hint" style={{ marginTop: 8 }}>{c.done} of {c.total} steps done</p>
          {c.missing.length ? (
            <ul className="todo">{c.missing.map((m) => <li key={m}>{m}</li>)}</ul>
          ) : <p className="page-sub">Your profile is complete.</p>}
          {c.missing.length ? <Link href="/account/personal">Complete your profile</Link> : null}
        </section>

        <section className="card" aria-labelledby="sec">
          <h2 id="sec">Security</h2>
          <dl className="kv one">
            <div><dt>Email</dt><dd><StatusBadge tone={verified ? "ok" : "warn"}>{verified ? "Verified" : "Not verified"}</StatusBadge></dd></div>
            <div><dt>Two-step verification</dt><dd><StatusBadge tone="muted">Not available yet</StatusBadge></dd></div>
          </dl>
          <p style={{ marginTop: 12 }}><Link href="/account/security">Review sign-in &amp; security</Link></p>
        </section>

        <section className="card" aria-labelledby="ca">
          <h2 id="ca">Connected apps</h2>
          <p className="page-sub">No app connections can be verified yet. Omni Tools signs in with this account; other apps are in development.</p>
          <p style={{ marginTop: 12 }}><Link href="/account/apps">See Omni apps</Link></p>
        </section>
      </div>

      <section className="card" aria-labelledby="act">
        <h2 id="act">Recent activity</h2>
        <p className="page-sub">
          A detailed activity log is not available yet. Your most recent sign-in was {formatDateTime(user.last_sign_in_at, prefs, timeZone)}.{" "}
          <Link href="/account/activity">See account timeline</Link>
        </p>
      </section>
    </>
  );
}
