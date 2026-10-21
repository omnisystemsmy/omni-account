import type { Metadata } from "next";
import Link from "next/link";
import { ExportData } from "@/components/account/ExportData";
import { PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Privacy & data" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy & data" description="What Omni Account stores about you and what you can do with it." />
      <section className="card" aria-labelledby="st">
        <h2 id="st">Information we store</h2>
        <ul className="plain">
          <li><strong>Sign-in:</strong> your email address and a securely hashed password (we never see or store your plain password).</li>
          <li><strong>Profile:</strong> display name and any optional details you add in Personal information.</li>
          <li><strong>Picture:</strong> the profile picture you upload, in a private store only you can access.</li>
          <li><strong>Preferences:</strong> date and time formats. Your theme choice stays in your browser.</li>
          <li><strong>Account records:</strong> when the account was created and last signed in.</li>
        </ul>
        <p className="field-hint" style={{ marginTop: 12 }}>Omni Account does not use analytics or advertising trackers.</p>
      </section>
      <section className="card" aria-labelledby="ex">
        <h2 id="ex">Download your data</h2>
        <p className="page-sub">
          Get a copy of the information above as a JSON file. It covers Omni Account data only, not data held by individual Omni apps.
        </p>
        <div className="stack"><ExportData /></div>
      </section>
      <section className="card" aria-labelledby="dl">
        <h2 id="dl">Delete your account</h2>
        <p className="page-sub">
          Deleting your account removes your sign-in and profile picture. It does not by itself remove data kept inside Omni apps
          (for example files stored on your device or in an app). <Link href="/account/manage">Go to account management</Link>
        </p>
      </section>
    </>
  );
}
