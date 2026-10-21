import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/ProfileForm";
import { createClient } from "@/lib/supabase/server";
import { displayNameOf } from "@/lib/account";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user!;
  return (
    <>
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="page-sub">How you appear across Omni apps.</p>
      </div>
      <ProfileForm email={user.email ?? ""} initialName={displayNameOf(user)} />
    </>
  );
}
