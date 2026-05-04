import { redirect } from "next/navigation";
import { createServerClient, createAdminClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = await createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? (user.user_metadata?.role as string);
  if (role !== "admin") redirect("/specialist");

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <AdminSidebar userName={profile.full_name || profile.email} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
