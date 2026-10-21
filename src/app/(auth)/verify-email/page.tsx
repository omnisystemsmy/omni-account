import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, StateIcon } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Email verified" };

/** Landing page after a successful email-confirmation link (see /auth/callback). */
export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <StateIcon kind="check" />
      <h1 className="auth-title">Email verified</h1>
      <p className="auth-sub">Your email address is confirmed. You can now use your Omni Account.</p>
      <div className="stack">
        <Link className="btn btn-primary" href="/account" style={{ textDecoration: "none" }}>Continue to your account</Link>
      </div>
    </AuthShell>
  );
}
