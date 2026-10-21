"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/controls";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    await signOut("local");
    router.replace("/sign-in?notice=signed-out");
    router.refresh();
  }
  return (
    <Button variant="outline" inline onClick={onClick} loading={busy} style={{ minHeight: 40 }}>
      Sign out
    </Button>
  );
}
