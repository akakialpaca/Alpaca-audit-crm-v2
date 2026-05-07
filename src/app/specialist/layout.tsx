export const runtime = "edge";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { SpecialistSidebar } from "@/components/specialist/Sidebar";

export const metadata: Metadata = {
  title: "Alpaca Audits",
};

export default async function SpecialistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  const { data: profile } = await createServiceClient()
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", session.user.id)
    .maybeSingle();

  const role = profile?.role ?? (session.user.user_metadata?.role as string);
  if (role === "admin") redirect("/admin");

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <SpecialistSidebar userName={profile?.full_name || profile?.email || ""} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
