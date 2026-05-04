import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { sendNewAssignmentEmail } from "@/lib/resend";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { source_url, language, keyword_languages, target_market, importance, deadline, assigned_specialist_id } = body;

  if (!source_url || !language || !target_market || !importance || !deadline) {
    return NextResponse.json({ error: "შევსება სავალდებულოა" }, { status: 400 });
  }

  const { data: audit, error } = await supabase.from("audits").insert({
    source_url,
    language,
    keyword_languages: keyword_languages ?? [],
    target_market,
    importance,
    deadline,
    assigned_specialist_id: assigned_specialist_id || null,
    created_by: user.id,
    status: "Pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send email if specialist assigned
  if (assigned_specialist_id && audit) {
    const { data: specialist } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", assigned_specialist_id)
      .single();

    if (specialist) {
      await sendNewAssignmentEmail({
        specialistEmail: specialist.email,
        specialistName: specialist.full_name,
        sourceUrl: source_url,
        deadline,
        importance,
      }).catch(console.error);
    }
  }

  return NextResponse.json({ audit }, { status: 201 });
}
