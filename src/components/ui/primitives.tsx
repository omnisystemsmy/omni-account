"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./controls";

/* ---------- Page header ---------- */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-sub">{description}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  );
}

/* ---------- Status badge ---------- */
export type BadgeTone = "ok" | "warn" | "info" | "muted" | "error";
export function StatusBadge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/* ---------- Empty state ---------- */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const letters = (name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("") || "?").toUpperCase();
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  if (url && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="avatar-img" src={url} alt="" style={style} onError={() => setFailed(true)} />;
  }
  return <span className="avatar-fallback" style={style} aria-hidden="true">{letters}</span>;
}

/* ---------- Confirmation dialog (native <dialog>: focus trap + Esc for free) ---------- */
export function ConfirmDialog({
  open, title, children, confirmLabel, danger, busy, onConfirm, onCancel,
}: {
  open: boolean; title: string; children: ReactNode; confirmLabel: string;
  danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="dialog" onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }} aria-labelledby="dlg-title">
      <h2 id="dlg-title">{title}</h2>
      <div className="dialog-body">{children}</div>
      <div className="dialog-actions">
        <Button variant="outline" inline onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant={danger ? "danger" : "primary"} inline onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </div>
    </dialog>
  );
}

/* ---------- Success / error notifications ---------- */
type Toast = { id: number; kind: "success" | "error"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, kind, text }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 5000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast toast-${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Select ---------- */
export function SelectField({
  label, value, onChange, error, hint, children, id,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string | null; hint?: string; children: ReactNode; id: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="input select" value={value} onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-d` : undefined}>
        {children}
      </select>
      {error ? <span id={`${id}-d`} className="field-error" role="alert">{error}</span>
        : hint ? <span id={`${id}-d`} className="field-hint">{hint}</span> : null}
    </div>
  );
}
