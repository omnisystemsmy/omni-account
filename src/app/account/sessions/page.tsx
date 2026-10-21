import type { Metadata } from "next";
import { SessionsPanel } from "@/components/account/SessionsPanel";
import { PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";

export const metadata: Metadata = { title: "Active sessions" };

export default async function SessionsPage() {
  const { prefs, timeZone } = await getAccount();
  return (
    <>
      <PageHeader title="Active sessions" description="Where your Omni Account is signed in." />
      <SessionsPanel prefs={prefs} timeZone={timeZone} />
    </>
  );
}
