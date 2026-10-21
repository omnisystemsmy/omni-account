/**
 * Remembered accounts: a convenience list for this browser only.
 *
 * It holds NO credentials and NO tokens, and it never grants access. Whether
 * someone is signed in is decided solely by the Supabase session cookie,
 * validated server-side with getUser(). Removing an entry never touches the
 * Supabase user.
 */
export type RememberedAccount = {
  id: string;
  email: string;
  name: string;
  lastUsedAt: number; // epoch ms
};

export const STORAGE_KEY = "omni-accounts-v1";
export const MAX_REMEMBERED = 8;

/** Defensive parse: drops anything that is not exactly the expected shape (the storage is user-editable). */
export function parseRemembered(raw: string | null): RememberedAccount[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const out: RememberedAccount[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const { id, email, name, lastUsedAt } = item as Record<string, unknown>;
    if (typeof id !== "string" || typeof email !== "string" || typeof name !== "string") continue;
    if (typeof lastUsedAt !== "number" || !Number.isFinite(lastUsedAt)) continue;
    if (!id || id.length > 64 || !email.includes("@") || email.length > 254 || name.length > 120) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, email, name, lastUsedAt });
  }
  return out.sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, MAX_REMEMBERED);
}

export function upsertAccount(list: RememberedAccount[], account: Omit<RememberedAccount, "lastUsedAt">, now = Date.now()): RememberedAccount[] {
  const rest = list.filter((a) => a.id !== account.id);
  return [{ ...account, lastUsedAt: now }, ...rest].sort((a, b) => b.lastUsedAt - a.lastUsedAt).slice(0, MAX_REMEMBERED);
}

export function removeAccount(list: RememberedAccount[], id: string): RememberedAccount[] {
  return list.filter((a) => a.id !== id);
}

export function initials(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2);
  return letters.toUpperCase();
}

export function lastUsedLabel(ts: number, now = Date.now()): string {
  const day = 86_400_000;
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  if (ts >= startOfToday) return "Today";
  if (ts >= startOfToday - day) return "Yesterday";
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ---- browser storage (never throws: storage can be blocked) ----

export function loadRemembered(): RememberedAccount[] {
  try {
    return parseRemembered(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveRemembered(list: RememberedAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore: the chooser is optional convenience */
  }
}
