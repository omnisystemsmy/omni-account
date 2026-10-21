import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { safeNext } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;
  const message =
    notice === "password-reset" ? "Password updated. Sign in with your new password." :
    notice === "deleted" ? "Your account has been deleted." :
    notice === "signed-out" ? "You have been signed out." : undefined;
  return (
    <AuthShell>
      <SignInForm next={safeNext(next)} notice={message} />
    </AuthShell>
  );
}
