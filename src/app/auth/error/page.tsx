import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, StateIcon } from "@/components/auth/AuthShell";

export const metadata: Metadata = { title: "Link problem" };

const COPY: Record<string, { title: string; body: string; cta: [string, string] }> = {
  recovery: {
    title: "Reset link expired",
    body: "This password reset link is invalid or has expired. Request a new one and use it right away.",
    cta: ["Request a new link", "/forgot-password"],
  },
  default: {
    title: "This link did not work",
    body: "The link is invalid, has already been used, or has expired. Try signing in, or request a new email.",
    cta: ["Go to sign in", "/sign-in"],
  },
};

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  const c = COPY[reason ?? ""] ?? COPY.default;
  return (
    <AuthShell>
      <StateIcon kind="error" />
      <h1 className="auth-title">{c.title}</h1>
      <p className="auth-sub">{c.body}</p>
      <div className="stack">
        <Link className="btn btn-primary" href={c.cta[1]} style={{ textDecoration: "none" }}>{c.cta[0]}</Link>
        <Link className="btn btn-outline" href="/sign-in" style={{ textDecoration: "none" }}>Back to sign in</Link>
      </div>
    </AuthShell>
  );
}
