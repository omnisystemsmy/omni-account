"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { saveProfile } from "@/lib/auth/actions";
import { GENDERS, LANGUAGE_CODES, languageName } from "@/lib/profile/options";
import { diffProfile, validateDisplayName, validateProfile, type FieldErrors, type Profile } from "@/lib/profile/schema";
import { Button, Field } from "@/components/ui/controls";
import { SelectField, StatusBadge, useToast } from "@/components/ui/primitives";

type Props = {
  initial: Profile;
  displayName: string;
  countries: { code: string; name: string }[];
  timeZones: string[];
};

export function PersonalForm({ initial, displayName: initialName, countries, timeZones }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [saved, setSaved] = useState(initial);
  const [savedName, setSavedName] = useState(initialName);
  const [p, setP] = useState<Profile>(initial);
  const [name, setName] = useState(initialName);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Profile) => (v: string) => setP((s) => ({ ...s, [k]: v }));
  const dirty = name.trim() !== savedName || Object.keys(diffProfile(saved, p)).length > 0;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validateProfile(p);
    const ne = validateDisplayName(name);
    if (ne) errs.display_name = ne;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const patch = diffProfile(saved, p);
    const nameChanged = name.trim() !== savedName;
    if (!Object.keys(patch).length && !nameChanged) return;
    setBusy(true);
    const res = await saveProfile(patch, nameChanged ? name : undefined);
    setBusy(false);
    if (!res.ok) return toast("error", res.error);
    setSaved({ ...saved, ...patch });
    setP((s) => ({ ...s, ...patch }));
    setSavedName(name.trim());
    toast("success", "Personal information saved.");
    router.refresh();
  }

  function cancel() {
    setP(saved);
    setName(savedName);
    setErrors({});
  }

  return (
    <form className="card" onSubmit={onSubmit} noValidate>
      <h2>Your details</h2>
      <p className="page-sub">All fields except display name are optional. Share only what you want to.</p>
      <div className="form-grid">
        <Field label="Display name" value={name} onChange={(e) => setName(e.target.value)} error={errors.display_name} autoComplete="nickname" />
        <span className="form-spacer" />
        <Field label="First name" value={p.first_name} onChange={(e) => set("first_name")(e.target.value)} error={errors.first_name} autoComplete="given-name" />
        <Field label="Last name" value={p.last_name} onChange={(e) => set("last_name")(e.target.value)} error={errors.last_name} autoComplete="family-name" />
        <Field label="Date of birth" type="date" value={p.dob} onChange={(e) => set("dob")(e.target.value)} error={errors.dob} autoComplete="bday" />
        <SelectField id="gender" label="Gender" value={p.gender} onChange={set("gender")} error={errors.gender}>
          {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </SelectField>
        <div className="field">
          <Field label="Phone number" type="tel" inputMode="tel" value={p.phone} onChange={(e) => set("phone")(e.target.value)} error={errors.phone}
            placeholder="+60123456789" autoComplete="tel" hint="Used only as contact information on your profile." />
          {p.phone ? <div><StatusBadge tone="warn">Not verified</StatusBadge></div> : null}
        </div>
        <SelectField id="country" label="Country" value={p.country} onChange={set("country")} error={errors.country}>
          <option value="">Not specified</option>
          {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </SelectField>
        <SelectField id="language" label="Preferred language" value={p.language} onChange={set("language")} error={errors.language}>
          <option value="">Not specified</option>
          {LANGUAGE_CODES.map((c) => <option key={c} value={c}>{languageName(c)}</option>)}
        </SelectField>
        <SelectField id="timezone" label="Time zone" value={p.timezone} onChange={set("timezone")} error={errors.timezone}
          hint="Also used to show dates and times in this portal.">
          <option value="">Not specified (UTC)</option>
          {timeZones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
        </SelectField>
      </div>
      <div className="form-actions">
        <Button type="submit" inline loading={busy} disabled={!dirty}>Save changes</Button>
        <Button type="button" variant="outline" inline onClick={cancel} disabled={!dirty || busy}>Cancel</Button>
      </div>
    </form>
  );
}
