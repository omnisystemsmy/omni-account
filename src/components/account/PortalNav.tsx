"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/personal", label: "Personal information" },
  { href: "/account/profile", label: "Profile & appearance" },
  { href: "/account/security", label: "Sign-in & security" },
  { href: "/account/sessions", label: "Active sessions" },
  { href: "/account/activity", label: "Security activity" },
  { href: "/account/apps", label: "Connected apps" },
  { href: "/account/preferences", label: "Preferences" },
  { href: "/account/privacy", label: "Privacy & data" },
  { href: "/account/manage", label: "Account management" },
];

export function PortalNav() {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Account sections">
      {ITEMS.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path === i.href ? "page" : undefined}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
