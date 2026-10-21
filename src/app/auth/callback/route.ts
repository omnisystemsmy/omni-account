import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/validation";

/**
 * Landing point for links in Supabase emails. Handles both PKCE (`code`) and
 * token-hash (`token_hash` + `type`) links, then redirects to a same-origin path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const isRecovery = next.startsWith("/reset-password") || type === "recovery";

  const supabase = await createClient();
  let failed = true;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = !!error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    failed = !!error;
  }

  if (failed) {
    return NextResponse.redirect(`${origin}/auth/error${isRecovery ? "?reason=recovery" : ""}`);
  }
  if (type === "signup" || type === "email") return NextResponse.redirect(`${origin}/verify-email`);
  return NextResponse.redirect(`${origin}${next}`);
}
