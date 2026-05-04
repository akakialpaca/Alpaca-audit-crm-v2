import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { SpecialistSidebar } from "@/components/specialist/Sidebar";

export default async function SpecialistLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? (user.user_metadata?.role as string);
  if (role === "admin") redirect("/admin");

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <SpecialistSidebar userName={profile?.full_name || profile?.email || ""} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
