import { GENDERS, LANGUAGE_CODES, countries, isValidTimeZone } from "./options";

/** Personal fields. Every field is optional; empty string means "not set". */
export type Profile = {
  first_name: string;
  last_name: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  phone: string; // E.164
  country: string; // ISO 3166-1 alpha-2
  language: string;
  timezone: string;
};

export const EMPTY_PROFILE: Profile = {
  first_name: "", last_name: "", dob: "", gender: "", phone: "", country: "", language: "", timezone: "",
};

export type Preferences = { date_format: "dmy" | "mdy" | "iso"; time_format: "24h" | "12h" };
export const DEFAULT_PREFERENCES: Preferences = { date_format: "dmy", time_format: "24h" };

export type FieldErrors = Partial<Record<keyof Profile | "display_name", string>>;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

export function validateDisplayName(v: string): string | null {
  const t = v.trim();
  if (!t) return "Enter a display name.";
  if (t.length > 60) return "Use 60 characters or fewer.";
  return null;
}

/** Returns errors keyed by field; an empty object means valid. */
export function validateProfile(p: Profile, now = new Date()): FieldErrors {
  const e: FieldErrors = {};
  if (p.first_name.trim().length > 60) e.first_name = "Use 60 characters or fewer.";
  if (p.last_name.trim().length > 60) e.last_name = "Use 60 characters or fewer.";
  if (p.dob) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(p.dob);
    const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
    const real = d && d.getUTCFullYear() === +m![1] && d.getUTCMonth() === +m![2] - 1 && d.getUTCDate() === +m![3];
    if (!real) e.dob = "Enter a valid date.";
    else if (d! > now) e.dob = "Date of birth cannot be in the future.";
    else if (+m![1] < 1900) e.dob = "Enter a valid date.";
  }
  if (!GENDERS.some((g) => g.value === p.gender)) e.gender = "Choose one of the options.";
  if (p.phone && !/^\+[1-9]\d{6,14}$/.test(normalizePhone(p.phone))) {
    e.phone = "Use international format, e.g. +60123456789.";
  }
  if (p.country && !countries().some((c) => c.code === p.country)) e.country = "Choose a country from the list.";
  if (p.language && !(LANGUAGE_CODES as readonly string[]).includes(p.language)) e.language = "Choose a language from the list.";
  if (p.timezone && !isValidTimeZone(p.timezone)) e.timezone = "Choose a valid time zone.";
  return e;
}

/** Only the fields that actually changed, so untouched stored data is never overwritten. */
export function diffProfile(before: Profile, after: Profile): Partial<Profile> {
  const out: Partial<Profile> = {};
  (Object.keys(after) as (keyof Profile)[]).forEach((k) => {
    const a = k === "phone" ? normalizePhone(after[k]) : after[k].trim();
    if (a !== before[k]) out[k] = a;
  });
  return out;
}

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateAvatarFile(file: { type: string; size: number }): string | null {
  if (!AVATAR_TYPES.includes(file.type)) return "Use a JPEG, PNG or WebP image.";
  if (file.size > 10 * 1024 * 1024) return "That image is too large. Choose one under 10 MB.";
  return null;
}
