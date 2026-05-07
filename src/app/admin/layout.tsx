export const runtime = "edge";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/Sidebar";

export const metadata: Metadata = {
  title: "Alpaca CRM",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await createServiceClient()
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", session.user.id)
    .maybeSingle();

  const role = profile?.role ?? (session.user.user_metadata?.role as string);
  if (role !== "admin") redirect("/specialist");

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <AdminSidebar userName={profile?.full_name || profile?.email || "Admin"} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
