import { createServerClient } from "@/lib/supabase/server";
import { Audit, AuditStatus, Importance, formatDate, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ImportanceBadge } from "@/components/ui/ImportanceBadge";
import Link from "next/link";

export default async function SpecialistDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: audits } = await supabase
    .from("audits")
    .select("*")
    .eq("assigned_specialist_id", user!.id)
    .order("deadline", { ascending: true });

  const all = (audits ?? []) as Audit[];
  const active = all.filter(a => ["Pending", "In Progress", "In Correction"].includes(a.status));
  const inReview = all.filter(a => a.status === "Review");
  const history = all.filter(a => a.status === "Completed");

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">ჩემი დავალებები</h1>
        <p className="text-gray-500 text-sm mt-1">{active.length} აქტიური · {inReview.length} შემოწმებაში</p>
      </div>

      {/* Active */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          აქტიური დავალებები
        </h2>
        {active.length === 0 && inReview.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-8 text-center">
            <p className="text-gray-400 text-sm">აქტიური დავალებები არ გაქვს</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...active, ...inReview].map(audit => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </section>

      {/* History */}
      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            ისტორია
          </h2>
          <div className="space-y-3">
            {history.map(audit => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AuditCard({ audit }: { audit: Audit }) {
  const overdue = isOverdue(audit.deadline, audit.status);
  return (
    <Link
      href={`/specialist/audits/${audit.id}`}
      className="block bg-white rounded-xl border border-[#E5E5E5] p-5 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-[#1A1A1A] truncate">{audit.source_url}</p>
          <p className="text-xs text-gray-400 mt-0.5">{audit.target_market} · {audit.language}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={audit.status as AuditStatus} />
          <ImportanceBadge importance={audit.importance as Importance} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E5E5E5]">
        <p className={`text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
          {overdue ? "⚠ " : ""}ვადა: {formatDate(audit.deadline)}
        </p>
        {audit.status === "In Correction" && (
          <span className="text-xs text-orange-600 font-medium">კომენტარი იხ. →</span>
        )}
      </div>
    </Link>
  );
}
