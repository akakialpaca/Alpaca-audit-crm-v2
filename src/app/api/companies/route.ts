import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const svc = createServiceClient();
  const { data, error } = await svc
    .from("companies")
    .select("*, contacts(id, first_name, last_name, position, email, phone, whatsapp_number)")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ companies: data });
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, website, industry, pipeline_stage, notes } = body;
  if (!name?.trim()) return NextResponse.json({ error: "სახელი სავალდებულოა" }, { status: 400 });

  const { data: company, error } = await svc.from("companies").insert({
    name: name.trim(),
    website: website?.trim() || null,
    industry: industry?.trim() || null,
    pipeline_stage: pipeline_stage ?? "Lead",
    notes: notes?.trim() || null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ company }, { status: 201 });
}
