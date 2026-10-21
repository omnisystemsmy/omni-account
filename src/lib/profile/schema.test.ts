import { describe, expect, it } from "vitest";
import { EMPTY_PROFILE, diffProfile, validateAvatarFile, validateDisplayName, validateProfile } from "./schema";
import { profileCompleteness, readAvatarPath, readPreferences, readProfile } from "@/lib/account/meta";
import { formatDate, formatDateTime } from "@/lib/format";

const NOW = new Date("2026-10-21T12:00:00Z");

describe("profile validation", () => {
  it("accepts an empty profile (all optional)", () => {
    expect(validateProfile(EMPTY_PROFILE, NOW)).toEqual({});
  });
  it("validates dob", () => {
    expect(validateProfile({ ...EMPTY_PROFILE, dob: "2030-01-01" }, NOW).dob).toMatch(/future/);
    expect(validateProfile({ ...EMPTY_PROFILE, dob: "2001-02-30" }, NOW).dob).toBeTruthy();
    expect(validateProfile({ ...EMPTY_PROFILE, dob: "1999-12-31" }, NOW).dob).toBeUndefined();
  });
  it("validates phone, country, language, timezone, gender", () => {
    const e = validateProfile({ ...EMPTY_PROFILE, phone: "0123", country: "XX1", language: "xx", timezone: "Mars/Base", gender: "?" }, NOW);
    expect(Object.keys(e).sort()).toEqual(["country", "gender", "language", "phone", "timezone"]);
    const ok = validateProfile({ ...EMPTY_PROFILE, phone: "+60 12-345 6789", country: "MY", language: "ms", timezone: "Asia/Kuala_Lumpur" }, NOW);
    expect(ok).toEqual({});
  });
  it("validates display name and avatar", () => {
    expect(validateDisplayName("  ")).toBeTruthy();
    expect(validateDisplayName("Aiman")).toBeNull();
    expect(validateAvatarFile({ type: "image/gif", size: 10 })).toBeTruthy();
    expect(validateAvatarFile({ type: "image/png", size: 99_000_000 })).toBeTruthy();
    expect(validateAvatarFile({ type: "image/webp", size: 1000 })).toBeNull();
  });
  it("diff contains only changed fields", () => {
    const before = { ...EMPTY_PROFILE, first_name: "A", country: "MY" };
    expect(diffProfile(before, { ...before, first_name: "A ", phone: "+60 12 345 6789" })).toEqual({ phone: "+60123456789" });
  });
});

describe("account metadata", () => {
  const user = { id: "u1", email_confirmed_at: "x", user_metadata: { display_name: "Y", profile: { first_name: "A", last_name: 5 }, avatar_path: "u1/a.webp", preferences: { time_format: "12h" } } };
  it("reads safely from untrusted metadata", () => {
    expect(readProfile(user).first_name).toBe("A");
    expect(readProfile(user).last_name).toBe("");
    expect(readPreferences(user)).toEqual({ date_format: "dmy", time_format: "12h" });
  });
  it("only accepts avatar paths inside the user's own folder", () => {
    expect(readAvatarPath(user)).toBe("u1/a.webp");
    expect(readAvatarPath({ id: "u1", user_metadata: { avatar_path: "u2/a.webp" } })).toBeNull();
    expect(readAvatarPath({ id: "u1", user_metadata: { avatar_path: "u1/../u2/a.webp" } })).toBeNull();
  });
  it("computes completeness from real data", () => {
    const c = profileCompleteness(user, readProfile(user), true);
    expect(c.done).toBe(3);
    expect(c.missing).toContain("Choose your country");
  });
});

describe("formatting", () => {
  const prefs = { date_format: "dmy", time_format: "24h" } as const;
  it("respects format and time zone", () => {
    expect(formatDate("2026-10-21T23:30:00Z", prefs)).toBe("21 Oct 2026");
    expect(formatDate("2026-10-21T23:30:00Z", prefs, "Asia/Kuala_Lumpur")).toBe("22 Oct 2026");
    expect(formatDate("2026-10-21T10:00:00Z", { ...prefs, date_format: "iso" })).toBe("2026-10-21");
    expect(formatDateTime("2026-10-21T15:30:00Z", { date_format: "mdy", time_format: "12h" })).toBe("Oct 21, 2026, 3:30 PM");
    expect(formatDate(null, prefs)).toBe("—");
  });
});
