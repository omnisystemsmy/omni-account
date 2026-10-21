import type { Metadata } from "next";
import { EmailChangeCard } from "@/components/account/EmailChangeCard";
import { PersonalForm } from "@/components/account/PersonalForm";
import { PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";
import { countries, timeZones } from "@/lib/profile/options";

export const metadata: Metadata = { title: "Personal information" };

export default async function PersonalPage() {
  const { user, profile, displayName } = await getAccount();
  return (
    <>
      <PageHeader title="Personal information" description="Details about you. Only you can see and change them." />
      <PersonalForm initial={profile} displayName={displayName} countries={countries()} timeZones={timeZones()} />
      <EmailChangeCard email={user.email ?? ""} verified={!!user.email_confirmed_at} pendingEmail={user.new_email ?? null} />
    </>
  );
}
