import type { Metadata } from "next";
import { DeleteAccount } from "@/components/account/DeleteAccount";

export const metadata: Metadata = { title: "Account management" };

export default function ManagePage() {
  return (
    <>
      <div>
        <h1 className="page-title">Account management</h1>
        <p className="page-sub">Manage the lifecycle of your Omni Account.</p>
      </div>
      <DeleteAccount />
    </>
  );
}
