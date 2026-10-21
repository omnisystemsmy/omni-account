import type { Metadata } from "next";
import { SecurityPanel } from "@/components/account/SecurityPanel";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Security" };

export default async function SecurityPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <>
      <div>
        <h1 className="page-title">Security</h1>
        <p className="page-sub">Keep your Omni Account protected.</p>
      </div>
      <SecurityPanel email={data.user?.email ?? ""} />
    </>
  );
}
