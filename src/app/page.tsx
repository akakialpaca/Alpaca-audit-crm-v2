import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? (user.user_metadata?.role as string);

  if (role === "admin") redirect("/admin");
  redirect("/specialist");
}
