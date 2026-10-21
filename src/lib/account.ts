import type { User } from "@supabase/supabase-js";

export function displayNameOf(user: User): string {
  const meta = user.user_metadata as { display_name?: string; full_name?: string; name?: string } | undefined;
  return meta?.display_name || meta?.full_name || meta?.name || user.email?.split("@")[0] || "Omni user";
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
