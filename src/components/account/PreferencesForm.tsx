"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { savePreferences } from "@/lib/auth/actions";
import { DATE_FORMATS, TIME_FORMATS } from "@/lib/profile/options";
import type { Preferences } from "@/lib/profile/schema";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/controls";
import { SelectField, useToast } from "@/components/ui/primitives";

export function PreferencesForm({ initial, timeZone }: { initial: Preferences; timeZone: string }) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const dirty = p.date_format !== saved.date_format || p.time_format !== saved.time_format;
  const sample = formatDateTime("2026-10-21T15:30:00Z", p, timeZone);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await savePreferences(p);
    setBusy(false);
    if (!res.ok) return toast("error", res.error);
    setSaved(p);
    toast("success", "Preferences saved.");
    router.refresh();
  }

  return (
    <>
      <form className="card" onSubmit={onSubmit}>
        <h2>Date and time</h2>
        <p className="page-sub">Used for dates and times shown in this portal, in your time zone ({timeZone === "UTC" ? "UTC; set one in Personal information" : timeZone.replace(/_/g, " ")}).</p>
        <div className="form-grid">
          <SelectField id="df" label="Date format" value={p.date_format} onChange={(v) => setP({ ...p, date_format: v as Preferences["date_format"] })}>
            {DATE_FORMATS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </SelectField>
          <SelectField id="tf" label="Time format" value={p.time_format} onChange={(v) => setP({ ...p, time_format: v as Preferences["time_format"] })}>
            {TIME_FORMATS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </SelectField>
        </div>
        <p className="field-hint" style={{ marginTop: 12 }}>Preview: {sample}</p>
        <div className="form-actions">
          <Button type="submit" inline loading={busy} disabled={!dirty}>Save preferences</Button>
          <Button type="button" variant="outline" inline onClick={() => setP(saved)} disabled={!dirty || busy}>Cancel</Button>
        </div>
      </form>
      <section className="card" aria-labelledby="nt">
        <h2 id="nt">Language and notifications</h2>
        <p className="page-sub">
          Your preferred language and time zone are part of Personal information. Omni Account is currently available in English only.
          Notification settings will appear here once Omni Account sends notifications beyond security emails.
        </p>
      </section>
    </>
  );
}
