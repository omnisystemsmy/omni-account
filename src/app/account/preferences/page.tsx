import type { Metadata } from "next";
import { PreferencesForm } from "@/components/account/PreferencesForm";
import { PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";

export const metadata: Metadata = { title: "Preferences" };

export default async function PreferencesPage() {
  const { prefs, timeZone } = await getAccount();
  return (
    <>
      <PageHeader title="Preferences" description="Choose how Omni Account shows dates and times." />
      <PreferencesForm initial={prefs} timeZone={timeZone} />
    </>
  );
}
