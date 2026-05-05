import { createServiceClient } from "@/lib/supabase/server";
import { Audit, AuditStatus, isOverdue } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";

interface SpecialistStat {
  id: string;
  full_name: string;
  completed: number;
  active: number;
  in_correction: number;
}

const PERIODS = [
  { value: "", label: "ყველა" },
  { value: "week", label: "ეს კვირა" },
  { value: "month", label: "ეს თვე" },
];

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const svc = createServiceClient();

  let auditQuery = svc
    .from("audits")
    .select("*, profiles!assigned_specialist_id(id, full_name)")
    .order("created_at", { ascending: false });

  if (period === "week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    auditQuery = auditQuery.gte("created_at", d.toISOString());
  } else if (period === "month") {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    auditQuery = auditQuery.gte("created_at", firstDay.toISOString());
  }

  const [{ data: audits }, { data: specialists }] = await Promise.all([
    auditQuery,
    svc.from("profiles").select("*").eq("role", "specialist"),
  ]);

  const all = (audits ?? []) as Audit[];
  const total = all.length;
  const active = all.filter(a => ["Pending", "In Progress"].includes(a.status)).length;
  const inReview = all.filter(a => a.status === "Review").length;
  const overdue = all.filter(a => isOverdue(a.deadline, a.status)).length;
  const completed = all.filter(a => a.status === "Completed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const specialistStats: SpecialistStat[] = (specialists ?? []).map(s => ({
    id: s.id,
    full_name: s.full_name,
    completed: all.filter(a => a.assigned_specialist_id === s.id && a.status === "Completed").length,
    active: all.filter(a => a.assigned_specialist_id === s.id && ["Pending", "In Progress"].includes(a.status)).length,
    in_correction: all.filter(a => a.assigned_specialist_id === s.id && a.status === "In Correction").length,
  }));

  const recentAudits = all.slice(0, 5);
  const currentPeriod = period ?? "";

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">SEO Audit მართვის სისტემა</p>
        </div>
        {/* Period filter */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {PERIODS.map(p => (
            <Link
              key={p.value}
              href={p.value ? `/admin?period=${p.value}` : "/admin"}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                currentPeriod === p.value
                  ? "bg-white text-[#1A1A2E] shadow-sm font-semibold"
                  : "text-gray-500 hover:text-[#1A1A2E]"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "სულ", value: total, color: "text-[#1A1A2E]" },
          { label: "აქტიური", value: active, color: "text-blue-600" },
          { label: "შემოწმებაში", value: inReview, color: "text-yellow-600" },
          { label: "ვადაგადაცილებული", value: overdue, color: "text-red-600" },
          { label: "დასრულებული", value: completed, color: "text-green-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">დასრულების მაჩვენებელი</p>
          <span className="text-lg font-bold text-[#1A1A2E]">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-[#E8315B] h-2 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Specialist Performance */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <h2 className="font-semibold text-[#1A1A2E] mb-4">სპეციალისტების სტატისტიკა</h2>
          {specialistStats.length === 0 ? (
            <p className="text-sm text-gray-400">სპეციალისტები არ არის</p>
          ) : (
            <div className="space-y-3">
              {specialistStats.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-[#E5E5E5] last:border-0">
                  <p className="text-sm font-medium text-[#1A1A2E]">{s.full_name}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="text-blue-600 font-medium">{s.active} აქტიური</span>
                    {s.in_correction > 0 && <span className="text-orange-500 font-medium">{s.in_correction} კორ.</span>}
                    <span className="text-green-600 font-medium">{s.completed} დასრულ.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audits */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1A1A2E]">ბოლო აუდიტები</h2>
            <Link href="/admin/audits" className="text-xs text-[#E8315B] hover:underline">ყველა →</Link>
          </div>
          {recentAudits.length === 0 ? (
            <p className="text-sm text-gray-400">აუდიტები არ არის</p>
          ) : (
            <div className="space-y-3">
              {recentAudits.map(audit => (
                <Link
                  key={audit.id}
                  href={`/admin/audits/${audit.id}`}
                  className="flex items-center justify-between py-2 border-b border-[#E5E5E5] last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#1A1A2E] truncate max-w-48">{audit.source_url}</p>
                    <p className="text-xs text-gray-400">{audit.deadline}</p>
                  </div>
                  <StatusBadge status={audit.status as AuditStatus} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
