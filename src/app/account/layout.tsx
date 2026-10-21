import Link from "next/link";
import type { ReactNode } from "react";
import { PortalNav } from "@/components/account/PortalNav";
import { RememberAccount } from "@/components/account/RememberAccount";
import { SignOutButton } from "@/components/account/SignOutButton";
import { Brand } from "@/components/ui/Brand";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar, ToastProvider } from "@/components/ui/primitives";
import { getAccount } from "@/lib/account/data";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const { user, displayName, avatarUrl } = await getAccount();

  return (
    <ToastProvider>
      <div className="portal">
        <RememberAccount id={user.id} email={user.email ?? ""} name={displayName} />
        <header className="topbar">
          <Brand />
          <div className="topbar-user">
            <ThemeToggle />
            <Link href="/choose-account" className="avatar-link" aria-label={`${displayName}: switch account`} title="Switch account">
              <Avatar url={avatarUrl} name={displayName} size={36} />
            </Link>
            <SignOutButton />
          </div>
        </header>
        <div className="portal-body">
          <PortalNav />
          <main className="content">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
