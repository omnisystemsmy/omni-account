import type { Metadata } from "next";
import { AvatarManager } from "@/components/account/AvatarManager";
import { ThemePicker } from "@/components/account/ThemePicker";
import { PageHeader } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";

export const metadata: Metadata = { title: "Profile & appearance" };

export default async function ProfilePage() {
  const { displayName, avatarUrl, avatarPath } = await getAccount();
  return (
    <>
      <PageHeader title="Profile & appearance" description="How you look in Omni apps and in this portal." />
      <AvatarManager name={displayName} url={avatarUrl} hasAvatar={!!avatarPath} />
      <section className="card" aria-labelledby="th">
        <h2 id="th">Theme</h2>
        <p className="page-sub">Applies on this device and is remembered in this browser.</p>
        <div className="stack"><ThemePicker /></div>
      </section>
    </>
  );
}
