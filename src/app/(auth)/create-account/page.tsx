import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { CreateAccountForm } from "@/components/auth/CreateAccountForm";

export const metadata: Metadata = { title: "Create account" };

export default function CreateAccountPage() {
  return (
    <AuthShell>
      <CreateAccountForm />
    </AuthShell>
  );
}
