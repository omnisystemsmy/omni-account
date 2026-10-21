export const GENDERS = [
  { value: "", label: "Not specified" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

export const LANGUAGE_CODES = ["en", "ms", "zh", "ta", "id", "ar", "hi", "ja", "ko", "fr", "de", "es", "pt", "ru", "th", "vi"] as const;

export const DATE_FORMATS = [
  { value: "dmy", label: "21 Oct 2026" },
  { value: "mdy", label: "Oct 21, 2026" },
  { value: "iso", label: "2026-10-21" },
] as const;

export const TIME_FORMATS = [
  { value: "24h", label: "24-hour (15:30)" },
  { value: "12h", label: "12-hour (3:30 PM)" },
] as const;

/** Display names come from the platform's own locale data, so there is no hand-maintained list to go stale. */
export function languageName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

let countryCache: { code: string; name: string }[] | null = null;
export function countries(): { code: string; name: string }[] {
  if (countryCache) return countryCache;
  const dn = new Intl.DisplayNames(["en"], { type: "region" });
  const out: { code: string; name: string }[] = [];
  const A = 65;
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(A + i, A + j);
      let name: string | undefined;
      try {
        name = dn.of(code);
      } catch {
        continue;
      }
      // Unassigned codes fall back to the code itself; ZZ/EU/UN etc. are not countries.
      if (!name || name === code || ["ZZ", "EU", "UN", "EZ", "XA", "XB"].includes(code)) continue;
      out.push({ code, name });
    }
  }
  countryCache = out.sort((a, b) => a.name.localeCompare(b.name));
  return countryCache;
}

export function timeZones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone");
  } catch {
    return ["UTC"];
  }
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
