"use client";
import { useEffect } from "react";
import { loadRemembered, saveRemembered, upsertAccount } from "@/lib/accounts/remembered";

/**
 * Records the account on this device. Rendered only by the portal layout, i.e. after the
 * server validated the session with getUser(), so only genuinely signed-in accounts are remembered.
 */
export function RememberAccount({ id, email, name }: { id: string; email: string; name: string }) {
  useEffect(() => {
    saveRemembered(upsertAccount(loadRemembered(), { id, email, name }));
  }, [id, email, name]);
  return null;
}
