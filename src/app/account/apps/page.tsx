import type { Metadata } from "next";
import { PageHeader, StatusBadge, type BadgeTone } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Connected apps" };

type Status = "Available" | "In development" | "Not connected" | "Connected";
const TONE: Record<Status, BadgeTone> = { Available: "info", "In development": "muted", "Not connected": "warn", Connected: "ok" };

// "Connected" is intentionally never used: per-user connections cannot be verified yet.
const APPS: { name: string; description: string; status: Status; note?: string }[] = [
  { name: "Omni Tools", description: "Scanners, converters, calculators and everyday utilities.", status: "Available", note: "Sign in to the mobile app with your Omni Account." },
  { name: "Omni Docs", description: "Create invoices, letters, receipts and other documents.", status: "In development", note: "Sign-in with Omni Account is not built yet." },
  { name: "Omni Finance", description: "Track money, budgets and spending.", status: "In development" },
  { name: "Omni Notes", description: "Quick notes and checklists.", status: "In development" },
  { name: "Omni Copy", description: "Copy and clipboard tools.", status: "In development" },
  { name: "Omni Plan", description: "Plan tasks and projects.", status: "In development" },
  { name: "Omni Edit", description: "Edit images and files.", status: "In development" },
  { name: "Omni Data", description: "Work with data and spreadsheets.", status: "In development" },
];

export default function AppsPage() {
  return (
    <>
      <PageHeader title="Connected apps" description="Omni apps that use your Omni Account." />
      <ul className="app-grid">
        {APPS.map((a) => (
          <li key={a.name} className="card app-card">
            <span className="app-icon" aria-hidden="true">{a.name.replace("Omni ", "").charAt(0)}</span>
            <div className="app-body">
              <h2>{a.name}</h2>
              <p className="page-sub">{a.description}</p>
              <p className="row-line"><StatusBadge tone={TONE[a.status]}>{a.status}</StatusBadge></p>
              {a.note ? <p className="field-hint">{a.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
      <p className="field-hint">
        Using one Omni Account does not give an app access to another app&apos;s data. Per-app connection status and permissions will appear here when those integrations exist.
      </p>
    </>
  );
}
