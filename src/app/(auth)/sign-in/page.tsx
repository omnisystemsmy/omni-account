import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { safeNext } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string; email?: string; add?: string }>;
}) {
  const { next, notice, email, add } = await searchParams;
  const presetEmail = email && email.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(email) ? email : undefined;
  const message =
    notice === "password-reset" ? "Password updated. Sign in with your new password." :
    notice === "deleted" ? "Your account has been deleted." :
    notice === "signed-out" ? "You have been signed out." : undefined;
  return (
    <AuthShell>
      <SignInForm next={safeNext(next)} notice={message} noticeKey={notice} email={presetEmail} add={add === "1"} />
    </AuthShell>
  );
}
