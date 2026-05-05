import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const svc = createServiceClient();

  let query = svc
    .from("contacts")
    .select("*, company:companies(id, name)")
    .order("created_at", { ascending: false })
    .limit(20);

  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contacts: data });
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { company_id, first_name, last_name, position, email, phone, whatsapp_number, linkedin_url, notes } = body;
  if (!first_name?.trim()) return NextResponse.json({ error: "სახელი სავალდებულოა" }, { status: 400 });

  const { data: contact, error } = await svc.from("contacts").insert({
    company_id: company_id || null,
    first_name: first_name.trim(),
    last_name: last_name?.trim() || null,
    position: position?.trim() || null,
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    whatsapp_number: whatsapp_number?.trim() || null,
    linkedin_url: linkedin_url?.trim() || null,
    notes: notes?.trim() || null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ contact }, { status: 201 });
}
