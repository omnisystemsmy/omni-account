"use client";
import { useState } from "react";
import { Button } from "@/components/ui/controls";
import { useToast } from "@/components/ui/primitives";

export function ExportData() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/account/export", { cache: "no-store" });
      if (!res.ok) throw new Error("export");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "omni-account-data.json";
      a.click();
      URL.revokeObjectURL(url);
      toast("success", "Your data was downloaded.");
    } catch {
      toast("error", "Could not export your data. Please try again.");
    }
    setBusy(false);
  }
  return <Button variant="outline" inline onClick={download} loading={busy}>Download my data</Button>;
}
