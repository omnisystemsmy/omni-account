import { createClient as createSupabaseJs } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseEnv } from "@/lib/supabase/env";

/**
 * Permanently deletes the signed-in user's account.
 *
 * 1. The caller must be signed in (validated server-side with getUser()).
 * 2. They must re-enter their password; it is checked on a throwaway client so
 *    the check cannot replace or alter their real session.
 * 3. Deletion itself is the existing `delete-account` Edge Function, which holds
 *    the service-role key and deletes only the user behind the token it receives.
 *    No privileged key exists in this app.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) return NextResponse.json({ error: "Enter your password to confirm." }, { status: 400 });

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) return NextResponse.json({ error: "Please sign in again to do this." }, { status: 401 });

  const { url, key } = supabaseEnv();
  const probe = createSupabaseJs(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: pwError } = await probe.auth.signInWithPassword({ email: user.email, password });
  if (pwError) return NextResponse.json({ error: "That password is not correct." }, { status: 403 });

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return NextResponse.json({ error: "Please sign in again to do this." }, { status: 401 });

  const res = await fetch(`${url}/functions/v1/delete-account`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, apikey: key },
  });
  if (!res.ok) {
    const message = res.status === 404
      ? "Account deletion is not available yet. Please contact support."
      : "Could not delete the account. Please try again later.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.json({ ok: true });
}
