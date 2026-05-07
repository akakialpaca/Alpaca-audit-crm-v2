import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await createServiceClient().from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const instance = process.env.GREEN_API_INSTANCE;
  const token = process.env.GREEN_API_TOKEN;
  if (!instance || !token) {
    return NextResponse.json({ error: "GREEN_API_INSTANCE ან GREEN_API_TOKEN არ არის კონფიგურირებული" }, { status: 500 });
  }

  const res = await fetch(`https://api.green-api.com/waInstance${instance}/getChats/${token}`);
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Green API error: ${text}` }, { status: 502 });
  }

  const chats: Array<{ id: string; name?: string }> = await res.json();
  const groups = chats
    .filter((c) => c.id?.endsWith("@g.us"))
    .map((c) => ({ chatId: c.id, name: c.name ?? "(სახელი არ არის)" }));

  return NextResponse.json({ groups });
}
