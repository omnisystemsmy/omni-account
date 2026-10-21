import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ChooseAccount } from "@/components/auth/ChooseAccount";
import { safeNext } from "@/lib/auth/validation";

export const metadata: Metadata = { title: "Choose an account" };

export default async function ChooseAccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; notice?: string }>;
}) {
  const { next, notice } = await searchParams;
  return (
    <AuthShell>
      <ChooseAccount next={safeNext(next)} notice={notice} />
    </AuthShell>
  );
}
