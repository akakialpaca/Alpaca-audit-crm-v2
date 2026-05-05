import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
  const { name, website, industry, pipeline_stage, notes, slug: rawSlug } = body;
  if (!name?.trim()) return NextResponse.json({ error: "სახელი სავალდებულოა" }, { status: 400 });

  const slugBase = rawSlug?.trim() || toSlug(name);

  // Insert first to get UUID, then build slug fallback if needed
  const { data: company, error } = await svc.from("companies").insert({
    name: name.trim(),
    website: website?.trim() || null,
    industry: industry?.trim() || null,
    pipeline_stage: pipeline_stage ?? "Lead",
    notes: notes?.trim() || null,
    created_by: user.id,
    slug: slugBase || null,
  }).select().single();

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "ეს URL-სახელი უკვე გამოყენებულია" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If slug was empty (Georgian name), fallback to first 8 chars of UUID
  if (!company.slug) {
    const fallback = company.id.replace(/-/g, "").slice(0, 8);
    await svc.from("companies").update({ slug: fallback }).eq("id", company.id);
    company.slug = fallback;
  }

  return NextResponse.json({ company }, { status: 201 });
}
