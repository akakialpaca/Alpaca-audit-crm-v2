import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Audit, AuditStatus, Importance, formatDate, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ImportanceBadge } from "@/components/ui/ImportanceBadge";
import { SpecialistActions } from "./SpecialistActions";
import Link from "next/link";

export default async function SpecialistAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("audits")
    .select("*")
    .eq("id", id)
    .eq("assigned_specialist_id", user!.id)
    .single();

  if (!data) notFound();

  const audit = data as Audit;
  const overdue = isOverdue(audit.deadline, audit.status);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/specialist" className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← დავალებები</Link>
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

      {/* Details */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <h2 className="font-semibold text-[#1A1A2E] mb-4">დეტალები</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
          {[
            { label: "საიტის ენა", value: audit.language },
            { label: "სამიზნე ბაზარი", value: audit.target_market },
            { label: "კ/სიტყვების ენა", value: audit.keyword_languages?.join(", ") || "—" },
            { label: "ვადა", value: formatDate(audit.deadline) },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 mb-0.5">{label}</dt>
              <dd className="text-sm font-medium text-[#1A1A2E]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Admin comments for In Correction */}
      {audit.status === "In Correction" && audit.admin_comments && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <h2 className="font-semibold text-orange-800 mb-2">⚠ ადმინის კომენტარი</h2>
          <p className="text-sm text-orange-700">{audit.admin_comments}</p>
        </div>
      )}

      {/* Actions */}
      <SpecialistActions audit={audit} />
    </div>
  );
}
