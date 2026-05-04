import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Audit, AuditStatus, Importance, STATUS_LABELS, formatDate, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ImportanceBadge } from "@/components/ui/ImportanceBadge";
import { ReviewPanel } from "./ReviewPanel";
import Link from "next/link";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const svc = createServiceClient();

  const { data } = await svc
    .from("audits")
    .select("*, profiles!assigned_specialist_id(id, full_name, email)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const audit = data as Audit & { profiles: { id: string; full_name: string; email: string } | null };
  const overdue = isOverdue(audit.deadline, audit.status);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/audits" className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← აუდიტები</Link>
          <h1 className="text-xl font-bold text-[#1A1A2E] break-all">{audit.source_url}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={audit.status as AuditStatus} />
            <ImportanceBadge importance={audit.importance as Importance} />
            {overdue && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                ვადაგადაცილებული
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <h2 className="font-semibold text-[#1A1A2E] mb-4">დეტალები</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: "საიტის ენა", value: audit.language },
            { label: "სამიზნე ბაზარი", value: audit.target_market },
            { label: "საკვანძო სიტყვების ენა", value: audit.keyword_languages?.join(", ") || "—" },
            { label: "ვადა", value: formatDate(audit.deadline) },
            { label: "სპეციალისტი", value: audit.profiles?.full_name || "—" },
            { label: "შეყვანის თარიღი", value: formatDate(audit.created_at) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
              <dd className="text-sm font-medium text-[#1A1A2E]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Specialist submission */}
      {(audit.audit_result_url || audit.status === "Review" || audit.status === "In Correction" || audit.status === "Completed") && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">სპეციალისტის წარდგინება</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">აუდიტის URL</dt>
              <dd>
                {audit.audit_result_url ? (
                  <a href={audit.audit_result_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-[#E8315B] hover:underline break-all font-medium">
                    {audit.audit_result_url}
                  </a>
                ) : <span className="text-sm text-gray-400">—</span>}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-0.5">პაროლი</dt>
              <dd className="text-sm font-mono bg-gray-50 px-3 py-1.5 rounded border border-[#E5E5E5] inline-block">
                {audit.audit_password || "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Previous comments */}
      {audit.admin_comments && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="font-semibold text-orange-800 mb-2">ადმინის კომენტარი</h2>
          <p className="text-sm text-orange-700">{audit.admin_comments}</p>
        </div>
      )}

      {/* Review Panel */}
      <ReviewPanel audit={audit} />
    </div>
  );
}
