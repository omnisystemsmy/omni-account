import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Brand } from "@/components/ui/Brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-shell">
      <div className="auth-theme"><ThemeToggle /></div>
      <div className="auth-brand">
        <Brand />
      </div>
      <div className="auth-card">{children}</div>
      <p className="auth-legal">One Omni Account for every Omni app.</p>
    </main>
  );
}

export function StateIcon({ kind }: { kind: "mail" | "error" | "check" }) {
  const paths = {
    mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
    error: (<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>),
    check: (<><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>),
  };
  return (
    <div className={`state-icon ${kind === "error" ? "error" : ""}`} aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[kind]}
      </svg>
    </div>
  );
}
