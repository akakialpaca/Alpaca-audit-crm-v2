export const runtime = "edge";

import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { full_name, whatsapp_number, monthly_hours } = await req.json();

  const updates: Record<string, unknown> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (whatsapp_number !== undefined) updates.whatsapp_number = whatsapp_number || null;
  if (monthly_hours !== undefined) updates.monthly_hours = monthly_hours ? Number(monthly_hours) : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "არაფერი შესაცვლელი" }, { status: 400 });
  }

  const { error } = await svc.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
