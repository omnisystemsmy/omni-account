"use client";
import { useSyncExternalStore } from "react";
import { getThemePref, setThemePref, subscribeTheme, type ThemePref } from "@/lib/theme";

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Match device" },
];

export function ThemePicker() {
  const pref = useSyncExternalStore<ThemePref>(subscribeTheme, getThemePref, () => "system");
  return (
    <fieldset className="segmented">
      <legend>Theme</legend>
      {OPTIONS.map((o) => (
        <label key={o.value} className={pref === o.value ? "on" : ""}>
          <input type="radio" name="theme" value={o.value} checked={pref === o.value} onChange={() => setThemePref(o.value)} />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
