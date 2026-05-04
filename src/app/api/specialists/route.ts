import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const svc = createServiceClient();
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { full_name, email, password } = await req.json();
  if (!full_name || !email || !password) {
    return NextResponse.json({ error: "ყველა ველი სავალდებულოა" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "პაროლი მინ. 8 სიმბოლო" }, { status: 400 });
  }

  const { data: newUser, error } = await svc.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: "specialist" },
  });

  if (error) {
    if (error.message.includes("already")) {
      return NextResponse.json({ error: "ეს ელ-ფოსტა უკვე გამოყენებულია" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: newUser }, { status: 201 });
}
