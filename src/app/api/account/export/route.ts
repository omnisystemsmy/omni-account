import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readAvatarPath, readPreferences, readProfile } from "@/lib/account/meta";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = {
    exportedAt: new Date().toISOString(),
    scope: "Omni Account data only. Data held inside individual Omni apps is not included.",
    account: {
      id: user.id,
      email: user.email,
      emailVerified: !!user.email_confirmed_at,
      createdAt: user.created_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    },
    profile: { displayName: (user.user_metadata?.display_name as string | undefined) ?? null, ...readProfile(user) },
    preferences: readPreferences(user),
    profilePicture: readAvatarPath(user) ? "stored (private)" : "none",
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="omni-account-data.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
