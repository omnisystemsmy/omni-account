import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { displayNameOf, readAvatarPath, readPreferences, readProfile } from "./meta";

/** Single validated read of the signed-in user for a request (getUser() hits Supabase Auth, not a cookie). */
export const getAccount = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  const user = data.user;

  const avatarPath = readAvatarPath(user);
  let avatarUrl: string | null = null;
  if (avatarPath) {
    // Private bucket: a short-lived signed URL, never a permanent public link.
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(avatarPath, 3600);
    avatarUrl = signed?.signedUrl ?? null;
  }

  const profile = readProfile(user);
  return {
    user,
    profile,
    prefs: readPreferences(user),
    displayName: displayNameOf(user),
    avatarPath,
    avatarUrl,
    timeZone: profile.timezone || "UTC",
  };
});
