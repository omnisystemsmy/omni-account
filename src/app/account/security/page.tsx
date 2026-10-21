import type { Metadata } from "next";
import { SecurityPanel } from "@/components/account/SecurityPanel";
import { PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";

export const metadata: Metadata = { title: "Sign-in & security" };

export default async function SecurityPage() {
  const { user } = await getAccount();
  return (
    <>
      <PageHeader title="Sign-in & security" description="Keep your Omni Account protected." />
      <SecurityPanel email={user.email ?? ""} verified={!!user.email_confirmed_at} />
    </>
  );
}
