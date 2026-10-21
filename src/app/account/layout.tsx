import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PortalNav } from "@/components/account/PortalNav";
import { SignOutButton } from "@/components/account/SignOutButton";
import { createClient } from "@/lib/supabase/server";
import { Brand } from "@/components/ui/Brand";
import { displayNameOf } from "@/lib/account";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  const name = displayNameOf(data.user);

  return (
    <div className="portal">
      <header className="topbar">
        <Brand />
        <div className="topbar-user">
          <span className="avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span>
          <SignOutButton />
        </div>
      </header>
      <div className="portal-body">
        <PortalNav />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
