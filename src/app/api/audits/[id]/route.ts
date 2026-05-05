import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase/server";
import {
  sendReviewRequestEmail,
  sendCorrectionEmail,
  sendCompletedEmail,
} from "@/lib/resend";
import {
  sendWhatsAppReviewReady,
  sendWhatsAppCorrection,
} from "@/lib/greenapi";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await createServiceClient().from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  const { data: audit } = await supabase.from("audits").select("*, profiles!assigned_specialist_id(id, full_name, email, whatsapp_number)").eq("id", id).single();
  if (!audit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role === "specialist" && audit.assigned_specialist_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  // Acknowledgment action (separate from status transition)
  if (body.acknowledge === true) {
    if (role !== "specialist" || audit.assigned_specialist_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (audit.acknowledged_at) {
      return NextResponse.json({ success: true });
    }
    const { error } = await createServiceClient().from("audits")
      .update({ acknowledged_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { status, audit_result_url, audit_password, admin_comments } = body;

  // Validate transitions
  if (role === "specialist") {
    const allowed: Record<string, string[]> = {
      "Pending": ["In Progress"],
      "In Progress": ["Review"],
      "In Correction": ["Review"],
    };
    if (!allowed[audit.status]?.includes(status)) {
      return NextResponse.json({ error: "არასწორი სტატუსი" }, { status: 400 });
    }
  }

  if (role === "admin") {
    const allowed: Record<string, string[]> = {
      "Review": ["Completed", "In Correction"],
      "In Correction": ["Completed", "In Correction"],
    };
    if (!allowed[audit.status]?.includes(status)) {
      return NextResponse.json({ error: "არასწორი სტატუსი" }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = { status };
  if (audit_result_url !== undefined) updateData.audit_result_url = audit_result_url;
  if (audit_password !== undefined) updateData.audit_password = audit_password;
  if (admin_comments !== undefined) updateData.admin_comments = admin_comments;

  const { error } = await supabase.from("audits").update(updateData).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const specialist = (audit as any).profiles;

  // Notifications (email + WhatsApp)
  try {
    if (status === "Review" && specialist) {
      await sendReviewRequestEmail({
        sourceUrl: audit.source_url,
        specialistName: specialist.full_name,
        auditId: id,
      });
      await sendWhatsAppReviewReady({
        sourceUrl: audit.source_url,
        specialistName: specialist.full_name,
        auditId: id,
      }).catch(console.error);
    } else if (status === "In Correction" && specialist) {
      await sendCorrectionEmail({
        specialistEmail: specialist.email,
        specialistName: specialist.full_name,
        sourceUrl: audit.source_url,
        comments: admin_comments ?? "",
        auditId: id,
      });
      if (specialist.whatsapp_number) {
        await sendWhatsAppCorrection({
          toNumber: specialist.whatsapp_number,
          specialistName: specialist.full_name,
          sourceUrl: audit.source_url,
          comments: admin_comments ?? "",
          auditId: id,
        }).catch(console.error);
      }
    } else if (status === "Completed" && specialist) {
      await sendCompletedEmail({
        specialistEmail: specialist.email,
        specialistName: specialist.full_name,
        sourceUrl: audit.source_url,
      });
    }
  } catch (e) {
    console.error("Notification failed:", e);
  }

  return NextResponse.json({ success: true });
}
