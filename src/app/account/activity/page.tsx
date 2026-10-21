import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Security activity" };

export default async function ActivityPage() {
  const { user, prefs, timeZone } = await getAccount();
  const u = user as typeof user & { recovery_sent_at?: string; confirmation_sent_at?: string; email_change_sent_at?: string };
  const events = [
    { label: "Signed in", at: user.last_sign_in_at },
    { label: "Account profile last updated", at: user.updated_at },
    { label: "Password reset email requested", at: u.recovery_sent_at },
    { label: "Email change requested", at: u.email_change_sent_at },
    { label: "Email verified", at: user.email_confirmed_at },
    { label: "Account created", at: user.created_at },
  ]
    .filter((e): e is { label: string; at: string } => !!e.at)
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return (
    <>
      <PageHeader title="Security activity" description="Key moments recorded on your account." />
      <section className="card" aria-labelledby="tl">
        <h2 id="tl">Account timeline</h2>
        {events.length ? (
          <ol className="timeline">
            {events.map((e) => (
              <li key={e.label}><strong>{e.label}</strong><span>{formatDateTime(e.at, prefs, timeZone)}</span></li>
            ))}
          </ol>
        ) : <EmptyState title="Nothing recorded yet" />}
        <p className="field-hint" style={{ marginTop: 16 }}>
          This shows the latest time of each event, taken from your account record. A full history with devices and locations is not available yet.
        </p>
      </section>
    </>
  );
}
