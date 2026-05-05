import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import { sendNewAssignmentEmail } from "@/lib/resend";
import { sendWhatsAppNewAudit } from "@/lib/greenapi";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await createServiceClient().from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { source_url, language, keyword_languages, target_market, importance, deadline, assigned_specialist_id, notes } = body;

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
    notes: notes || null,
    created_by: user.id,
    status: "Pending",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send notifications if specialist assigned
  if (assigned_specialist_id && audit) {
    const { data: specialist } = await createServiceClient()
      .from("profiles")
      .select("email, full_name, whatsapp_number")
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

      if (specialist.whatsapp_number) {
        await sendWhatsAppNewAudit({
          toNumber: specialist.whatsapp_number,
          specialistName: specialist.full_name,
          sourceUrl: source_url,
          deadline,
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ audit }, { status: 201 });
}
