import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.website !== undefined) updates.website = body.website || null;
  if (body.industry !== undefined) updates.industry = body.industry || null;
  if (body.pipeline_stage !== undefined) updates.pipeline_stage = body.pipeline_stage;
  if (body.notes !== undefined) updates.notes = body.notes || null;
  if (body.slug !== undefined) updates.slug = body.slug || null;

  if (body.status !== undefined) {
    const allowed = ["active", "blacklisted", "deleted"];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({ error: "არასწორი სტატუსი" }, { status: 400 });
    }
    if ((body.status === "blacklisted" || body.status === "deleted") && !body.status_reason?.trim()) {
      return NextResponse.json({ error: "მიზეზი სავალდებულოა" }, { status: 400 });
    }
    updates.status = body.status;
    updates.status_reason = body.status_reason?.trim() || null;
    updates.status_changed_at = new Date().toISOString();
    updates.status_changed_by = user.id;
  }

  const { error } = await svc.from("companies").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
