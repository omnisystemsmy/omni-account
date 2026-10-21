"use client";
import { createClient } from "@/lib/supabase/client";
import { authMessage } from "./errors";
import { readAvatarPath, readPreferences, readProfile } from "@/lib/account/meta";
import type { Preferences, Profile } from "@/lib/profile/schema";

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

/* ------------------------------------------------------------------ */
/* Profile, preferences, email and avatar (all scoped to the signed-in user by Supabase) */


async function freshUser() {
  const { data, error } = await createClient().auth.getUser();
  if (error || !data.user) throw Object.assign(new Error("session"), { code: "session_expired" });
  return data.user;
}

/** Merges only the changed profile fields into the stored object; untouched data is preserved. */
export async function saveProfile(patch: Partial<Profile>, displayName?: string): Promise<Result> {
  try {
    const user = await freshUser();
    const data: Record<string, unknown> = { profile: { ...readProfile(user), ...patch } };
    if (displayName !== undefined) data.display_name = displayName.trim();
    const { error } = await createClient().auth.updateUser({ data });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function savePreferences(patch: Partial<Preferences>): Promise<Result> {
  try {
    const user = await freshUser();
    const { error } = await createClient().auth.updateUser({ data: { preferences: { ...readPreferences(user), ...patch } } });
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

/** Email changes go through Supabase's confirmation flow; the address only changes after the link is opened. */
export async function requestEmailChange(currentEmail: string, password: string, newEmail: string): Promise<Result> {
  const check = await signIn(currentEmail, password);
  if (!check.ok) return { ok: false, error: "Your password is not correct." };
  try {
    const { error } = await createClient().auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: `${siteUrl()}/auth/callback?next=/account/personal` },
    );
    return error ? fail(error) : ok(undefined);
  } catch (e) {
    return fail(e);
  }
}

export async function sendRecoveryEmail(email: string): Promise<Result> {
  return requestPasswordReset(email);
}

export type SessionInfo = { signedInAt: string | null; expiresAt: number | null };
export async function getSessionInfo(): Promise<SessionInfo> {
  const supabase = createClient();
  const [{ data: s }, { data: u }] = await Promise.all([supabase.auth.getSession(), supabase.auth.getUser()]);
  return { signedInAt: u.user?.last_sign_in_at ?? null, expiresAt: s.session?.expires_at ?? null };
}

const BUCKET = "avatars";

async function toAvatarBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85));
  if (!blob) throw new Error("encode");
  return blob; // re-encoding also strips EXIF/location metadata
}

export async function uploadAvatar(file: File): Promise<Result<{ path: string }>> {
  try {
    const user = await freshUser();
    const old = readAvatarPath(user);
    const blob = await toAvatarBlob(file);
    const path = `${user.id}/avatar-${Date.now()}.webp`;
    const storage = createClient().storage.from(BUCKET);
    const up = await storage.upload(path, blob, { contentType: "image/webp", upsert: false });
    if (up.error) {
      const missing = /bucket not found/i.test(up.error.message);
      return { ok: false, error: missing ? "Profile pictures are not set up yet. Please contact support." : "Could not upload the picture. Please try again." };
    }
    const { error } = await createClient().auth.updateUser({ data: { avatar_path: path } });
    if (error) {
      await storage.remove([path]); // do not leave an orphan
      return fail(error);
    }
    if (old && old !== path) await storage.remove([old]);
    return ok({ path });
  } catch {
    return { ok: false, error: "That image could not be processed. Try a different one." };
  }
}

export async function removeAvatar(): Promise<Result> {
  try {
    const user = await freshUser();
    const old = readAvatarPath(user);
    const { error } = await createClient().auth.updateUser({ data: { avatar_path: null } });
    if (error) return fail(error);
    if (old) await createClient().storage.from(BUCKET).remove([old]);
    return ok(undefined);
  } catch (e) {
    return fail(e);
  }
}
