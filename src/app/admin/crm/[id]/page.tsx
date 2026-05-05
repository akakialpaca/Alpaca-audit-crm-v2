import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Company, Contact, ContactActivity, ACTIVITY_LABELS, PIPELINE_STAGES, formatDate, formatDateTime, AuditStatus } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StageSelector } from "./StageSelector";
import { ActivityLogForm } from "./ActivityLogForm";
import { CompanyStatusActions } from "./CompanyStatusActions";
import Link from "next/link";

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params;
  const svc = createServiceClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const { data: companyData } = await svc
    .from("companies")
    .select("*")
    .eq(isUuid ? "id" : "slug", slugOrId)
    .maybeSingle();

  if (!companyData) notFound();

  const company = companyData as Company & { slug?: string };
  const slug = company.slug ?? company.id;

  const { data: contactsData } = await svc
    .from("contacts")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true });

  const contacts = (contactsData ?? []) as Contact[];
  const contactIds = contacts.map(c => c.id);

  const [activitiesRes, auditsRes] = await Promise.all([
    contactIds.length > 0
      ? svc.from("contact_activities")
          .select("*, profiles(full_name)")
          .in("contact_id", contactIds)
          .order("created_at", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] }),
    contactIds.length > 0
      ? svc.from("audits")
          .select("id, source_url, status, deadline, created_at")
          .in("contact_id", contactIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  const activities = (activitiesRes.data ?? []) as ContactActivity[];
  const audits = (auditsRes.data ?? []) as any[];
  const stage = PIPELINE_STAGES.find(s => s.value === company.pipeline_stage);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/admin/crm" className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← CRM</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{company.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#E8315B] hover:underline">{company.website}</a>
              )}
              {company.industry && <span className="text-sm text-gray-500">{company.industry}</span>}
              <span className="text-xs text-gray-400">დამატებულია: {formatDate(company.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <Link
              href={`/admin/crm/${slug}/edit`}
              className="text-xs text-gray-400 hover:text-[#E8315B] transition-colors"
            >
              ✏️ რედაქტირება
            </Link>
            <CompanyStatusActions
              companyId={company.id}
              companySlug={slug}
              currentStatus={(company as any).status ?? "active"}
              statusReason={(company as any).status_reason ?? null}
              statusChangedAt={(company as any).status_changed_at ?? null}
            />
          </div>
        </div>
      </div>

      {/* Status banners */}
      {(company as any).status === "blacklisted" && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-5 py-4">
          <span className="text-xl leading-none shrink-0">🚫</span>
          <div>
            <p className="font-semibold text-orange-800 text-sm">შავ სიაში შეყვანილი კომპანია</p>
            {(company as any).status_reason && (
              <p className="text-sm text-orange-700 mt-0.5">{(company as any).status_reason}</p>
            )}
            {(company as any).status_changed_at && (
              <p className="text-xs text-orange-500 mt-1">{formatDateTime((company as any).status_changed_at)}</p>
            )}
          </div>
        </div>
      )}

      {/* Pipeline Stage */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-5">
        <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Pipeline სტადია</p>
        <StageSelector companyId={company.id} currentStage={company.pipeline_stage} />
        {company.notes && (
          <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-[#E5E5E5]">{company.notes}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1A1A2E]">კონტაქტები ({contacts.length})</h2>
            <Link href={`/admin/crm/${slug}/contact/new`}
              className="text-xs text-[#E8315B] hover:underline font-medium">
              + კონტაქტი
            </Link>
          </div>

          {contacts.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#E5E5E5] p-6 text-center">
              <p className="text-sm text-gray-400">კონტაქტი არ არის</p>
              <Link href={`/admin/crm/${slug}/contact/new`} className="mt-2 inline-block text-xs text-[#E8315B] hover:underline">
                + პირველი კონტაქტის დამატება
              </Link>
            </div>
          ) : contacts.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{c.first_name} {c.last_name ?? ""}</p>
                  {c.position && <p className="text-xs text-gray-500 mt-0.5">{c.position}</p>}
                </div>
                <Link href={`/admin/crm/${slug}/contact/${c.id}/edit`}
                  className="text-xs text-gray-400 hover:text-[#E8315B] transition-colors shrink-0 ml-2">
                  ✏️
                </Link>
              </div>
              <div className="mt-3 space-y-1.5">
                {c.email && <p className="text-xs text-gray-600">✉️ <a href={`mailto:${c.email}`} className="hover:text-[#E8315B]">{c.email}</a></p>}
                {c.phone && <p className="text-xs text-gray-600">📞 {c.phone}</p>}
                {c.whatsapp_number && <p className="text-xs text-green-600">💬 {c.whatsapp_number}</p>}
                {c.linkedin_url && <p className="text-xs text-blue-600">🔗 <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a></p>}
                {c.notes && <p className="text-xs text-gray-400 mt-2 italic">{c.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Linked Audits */}
        <div className="space-y-4">
          <h2 className="font-semibold text-[#1A1A2E]">დაკავშირებული აუდიტები ({audits.length})</h2>
          {audits.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-[#E5E5E5] p-6 text-center">
              <p className="text-sm text-gray-400">აუდიტი არ არის</p>
              <Link href="/admin/audits/new" className="mt-2 inline-block text-xs text-[#E8315B] hover:underline">
                + ახალი აუდიტი
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {audits.map((a: any) => (
                <Link key={a.id} href={`/admin/audits/${a.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-[#E5E5E5] p-4 hover:border-[#E8315B] transition-colors">
                  <div className="min-w-0 mr-3">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate max-w-52">{a.source_url}</p>
                    <p className="text-xs text-gray-400">{formatDate(a.deadline)}</p>
                  </div>
                  <StatusBadge status={a.status as AuditStatus} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
        <h2 className="font-semibold text-[#1A1A2E]">Activity Log</h2>

        {contacts.length > 0 && (
          <ActivityLogForm contactId={contacts[0].id} />
        )}

        {activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">აქტივობა არ არის</p>
        ) : (
          <div className="space-y-3 mt-4">
            {activities.map(a => (
              <div key={a.id} className="flex gap-3">
                <div className="w-8 h-8 bg-[#F5F6FA] rounded-full flex items-center justify-center shrink-0 text-sm">
                  {a.type === "call" ? "📞" : a.type === "email" ? "✉️" : a.type === "meeting" ? "🤝" : "📝"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-700">{ACTIVITY_LABELS[a.type]}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(a.created_at)}</span>
                    {a.profiles && <span className="text-xs text-gray-400">· {(a.profiles as any).full_name}</span>}
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{a.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
