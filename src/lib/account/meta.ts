import type { User } from "@supabase/supabase-js";
import {
  DEFAULT_PREFERENCES, EMPTY_PROFILE, type Preferences, type Profile,
} from "@/lib/profile/schema";

type Meta = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");

/** Profile data lives in Supabase Auth user_metadata; only the signed-in user can write their own. */
export function readProfile(user: Pick<User, "user_metadata">): Profile {
  const raw = ((user.user_metadata as Meta | undefined)?.profile ?? {}) as Meta;
  const out = { ...EMPTY_PROFILE };
  (Object.keys(out) as (keyof Profile)[]).forEach((k) => { out[k] = str(raw[k]); });
  return out;
}

export function readPreferences(user: Pick<User, "user_metadata">): Preferences {
  const raw = ((user.user_metadata as Meta | undefined)?.preferences ?? {}) as Meta;
  const df = raw.date_format;
  const tf = raw.time_format;
  return {
    date_format: df === "mdy" || df === "iso" || df === "dmy" ? df : DEFAULT_PREFERENCES.date_format,
    time_format: tf === "12h" || tf === "24h" ? tf : DEFAULT_PREFERENCES.time_format,
  };
}

export function readAvatarPath(user: Pick<User, "id" | "user_metadata">): string | null {
  const p = str((user.user_metadata as Meta | undefined)?.avatar_path);
  // Only ever accept a path inside the user's own folder.
  return p && p.startsWith(`${user.id}/`) && !p.includes("..") ? p : null;
}

export function displayNameOf(user: Pick<User, "email" | "user_metadata">): string {
  const m = (user.user_metadata ?? {}) as Meta;
  return str(m.display_name) || str(m.full_name) || str(m.name) || user.email?.split("@")[0] || "Omni user";
}

export type Completeness = { done: number; total: number; percent: number; missing: string[] };

/** Calculated only from real stored data. */
export function profileCompleteness(
  user: Pick<User, "email_confirmed_at" | "user_metadata">,
  profile: Profile,
  hasAvatar: boolean,
): Completeness {
  const checks: [string, boolean][] = [
    ["Verify your email", !!user.email_confirmed_at],
    ["Add a display name", !!str((user.user_metadata as Meta | undefined)?.display_name)],
    ["Add your first and last name", !!profile.first_name && !!profile.last_name],
    ["Add a profile picture", hasAvatar],
    ["Choose your country", !!profile.country],
    ["Set your language and time zone", !!profile.language && !!profile.timezone],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    done,
    total: checks.length,
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  };
}
