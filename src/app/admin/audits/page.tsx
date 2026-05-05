import { createServiceClient } from "@/lib/supabase/server";
import { Audit, AuditStatus, Importance, formatDate, isOverdue, isDueToday } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ImportanceBadge } from "@/components/ui/ImportanceBadge";
import { AuditFilters } from "@/components/admin/AuditFilters";
import { AuditPagination } from "@/components/admin/AuditPagination";
import Link from "next/link";
import { Suspense } from "react";

interface SearchParams {
  status?: string;
  specialist?: string;
  importance?: string;
  search?: string;
  page?: string;
  perPage?: string;
}

export default async function AuditsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const svc = createServiceClient();

  const pageNum = Math.max(1, parseInt(params.page ?? "1") || 1);
  const perPageRaw = params.perPage ?? "10";
  const perPage: number | "all" = perPageRaw === "all" ? "all" : Math.max(1, parseInt(perPageRaw) || 10);

  let query = svc
    .from("audits")
    .select("*, profiles!assigned_specialist_id(id, full_name)", { count: "exact" })
    .order("deadline", { ascending: true });

  if (params.status) query = query.eq("status", params.status);
  if (params.specialist) query = query.eq("assigned_specialist_id", params.specialist);
  if (params.importance) query = query.eq("importance", params.importance);
  if (params.search) query = query.ilike("source_url", `%${params.search}%`);

  if (perPage !== "all") {
    const start = (pageNum - 1) * perPage;
    query = query.range(start, start + perPage - 1);
  }

  const [{ data: audits, count }, { data: specialists }] = await Promise.all([
    query,
    svc.from("profiles").select("id, full_name").eq("role", "specialist"),
  ]);

  const all = (audits ?? []) as Audit[];
  const total = count ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">აუდიტები</h1>
          <p className="text-gray-500 text-sm mt-1">{total} სულ</p>
        </div>
        <Link
          href="/admin/audits/new"
          className="bg-[#E8315B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors"
        >
          + ახალი აუდიტი
        </Link>
      </div>

      <Suspense>
        <AuditFilters specialists={specialists ?? []} />
      </Suspense>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
        {all.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">აუდიტები არ მოიძებნა</p>
            <Link href="/admin/audits/new" className="mt-4 inline-block text-sm text-[#E8315B] hover:underline">
              + პირველი აუდიტის დამატება
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F6FA] border-b border-[#E5E5E5]">
                  <tr>
                    {["ვებსაიტი", "სპეციალისტი", "მნიშვნელობა", "ვადა", "სტატუსი", ""].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {all.map((audit) => {
                    const overdue = isOverdue(audit.deadline, audit.status);
                    const dueToday = !overdue && isDueToday(audit.deadline) && audit.status !== "Completed";
                    const unacknowledged = audit.status === "Pending" && !audit.acknowledged_at && (audit as any).profiles;
                    return (
                      <tr key={audit.id} className="hover:bg-[#F5F6FA] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-[#1A1A2E] max-w-56 truncate">{audit.source_url}</p>
                          <p className="text-xs text-gray-400">{audit.target_market}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{(audit as any).profiles?.full_name ?? "—"}</p>
                          {unacknowledged && (
                            <p className="text-xs text-[#E8315B] font-medium mt-0.5">🔔 დასადასტურებელი</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <ImportanceBadge importance={audit.importance as Importance} />
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                            {formatDate(audit.deadline)}
                          </p>
                          {overdue && <p className="text-xs text-red-500">ვადა გავიდა</p>}
                          {dueToday && <p className="text-xs text-orange-500 font-medium">⚡ დღეს</p>}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={audit.status as AuditStatus} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/admin/audits/${audit.id}`}
                            className="text-xs text-[#E8315B] hover:underline font-medium"
                          >
                            გახსნა →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Suspense>
              <AuditPagination total={total} page={pageNum} perPage={perPage} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
