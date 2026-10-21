"use client";
import { createClient } from "@/lib/supabase/client";
import { authMessage } from "./errors";

/** UI components call these; they never touch the Supabase SDK directly. */
export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

const ok = <T,>(data: T): Result<T> => ({ ok: true, data });
const fail = (e: unknown): { ok: false; error: string } => {
  const err = e as { code?: string; message?: string };
  return { ok: false, error: authMessage(err?.code, err?.message) };
};

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<Result<{ needsVerification: boolean }>> {
  try {
    const { data, error } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: displayName.trim() ? { display_name: displayName.trim() } : undefined,
        emailRedirectTo: `${siteUrl()}/auth/callback?next=/account`,
      },
    });
    if (error) return fail(error);
    // Supabase hides an already-registered address behind an empty identities list.
    if (data.user && (data.user.identities ?? []).length === 0) {
      return { ok: false, error: authMessage("user_already_exists") };
    }
    return ok({ needsVerification: !data.session });
  } catch (e) {
    return fail(e);
  }
}

export async function signIn(email: string, password: string): Promise<Result & { code?: string }> {
  try {
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ...fail(error), code: error.code };
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function resendVerification(email: string): Promise<Result> {
  try {
    const { error } = await createClient().auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: `${siteUrl()}/auth/callback?next=/account` },
    });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

/** Never reveals whether the address has an account. */
export async function requestPasswordReset(email: string): Promise<Result> {
  try {
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
    });
    if (error && error.code !== "user_not_found") return fail(error);
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

/** Fallback for the code-style recovery email used by Omni Tools. */
export async function verifyRecoveryCode(email: string, code: string): Promise<Result> {
  try {
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "recovery" });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function updatePassword(password: string): Promise<Result> {
  try {
    const { error } = await createClient().auth.updateUser({ password });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

/** Re-authenticates with the current password before a sensitive change. */
export async function changePassword(email: string, current: string, next: string): Promise<Result> {
  const check = await signIn(email, current);
  if (!check.ok) return { ok: false, error: "Your current password is not correct." };
  return updatePassword(next);
}

export async function updateDisplayName(name: string): Promise<Result> {
  try {
    const { error } = await createClient().auth.updateUser({ data: { display_name: name.trim() } });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function signOut(scope: "global" | "local" | "others" = "local"): Promise<Result> {
  try {
    const { error } = await createClient().auth.signOut({ scope });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function hasRecoverySession(): Promise<boolean> {
  const { data } = await createClient().auth.getUser();
  return !!data.user;
}
