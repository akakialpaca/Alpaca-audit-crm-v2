export const runtime = "edge";

import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: contact_id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { type, content } = await req.json();
  if (!type || !content?.trim()) return NextResponse.json({ error: "type და content სავალდებულოა" }, { status: 400 });

  const { data: activity, error } = await svc.from("contact_activities").insert({
    contact_id,
    type,
    content: content.trim(),
    created_by: user.id,
  }).select("*, profiles(full_name)").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity }, { status: 201 });
}
