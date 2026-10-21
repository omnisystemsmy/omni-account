"use client";
import { useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { passwordStrength } from "@/lib/auth/validation";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: string;
};

export function Field({ label, error, hint, id, ...rest }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const descId = `${fid}-desc`;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <input
        id={fid}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? descId : undefined}
        {...rest}
      />
      {error ? (
        <span id={descId} className="field-error" role="alert">{error}</span>
      ) : hint ? (
        <span id={descId} className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function PasswordField({ label, error, hint, id, ...rest }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const descId = `${fid}-desc`;
  const [shown, setShown] = useState(false);
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <div className="input-wrap">
        <input
          id={fid}
          className="input has-toggle"
          type={shown ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? descId : undefined}
          {...rest}
        />
        <button
          type="button"
          className="toggle-vis"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {shown ? (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M1 1l22 22" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {error ? (
        <span id={descId} className="field-error" role="alert">{error}</span>
      ) : hint ? (
        <span id={descId} className="field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

export function StrengthMeter({ password }: { password: string }) {
  const s = passwordStrength(password);
  if (!s) return null;
  return (
    <div className="strength" aria-live="polite">
      <div className="strength-bar" aria-hidden="true">
        <span style={{ width: `${s.value * 100}%`, background: s.color }} />
      </div>
      <span className="strength-label" style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger";
  loading?: boolean;
  inline?: boolean;
};

export function Button({ variant = "primary", loading, inline, children, disabled, className, ...rest }: ButtonProps) {
  const cls = ["btn", `btn-${variant}`, inline ? "btn-inline" : "", className ?? ""].join(" ").trim();
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function Banner({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  return (
    <div className={`banner banner-${kind}`} role={kind === "error" ? "alert" : "status"}>
      <div>{children}</div>
    </div>
  );
}
