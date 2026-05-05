import { createServiceClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { AddSpecialistForm } from "./AddSpecialistForm";

export default async function SpecialistsPage() {
  const svc = createServiceClient();
  const { data: allProfiles } = await svc
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: auditCounts } = await svc
    .from("audits")
    .select("assigned_specialist_id, status");

  const specialists = (allProfiles ?? []).filter((p: any) => p.role === "specialist");
  const admins = (allProfiles ?? []).filter((p: any) => p.role === "admin");

  const getCount = (id: string, status?: string) =>
    (auditCounts ?? []).filter((a: any) =>
      a.assigned_specialist_id === id && (!status || a.status === status)
    ).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">გუნდი</h1>
        <p className="text-gray-500 text-sm mt-1">{specialists.length} სპეციალისტი · {admins.length} ადმინი</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">

          {/* Specialists */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">სპეციალისტები</h2>
            <div className="space-y-3">
              {!specialists.length ? (
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 text-center">
                  <p className="text-gray-400 text-sm">სპეციალისტები არ არის</p>
                </div>
              ) : specialists.map((s: any) => (
                <div key={s.id} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#1A1A2E]">{s.full_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{s.email}</p>
                      {s.monthly_hours ? (
                        <p className="text-xs text-[#E8315B] mt-1 font-medium">{s.monthly_hours} საათი/თვე</p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">საათები არ არის მითითებული</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">დამატებულია: {formatDate(s.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4 pt-4 border-t border-[#E5E5E5]">
                    <Stat label="აქტიური" value={getCount(s.id, "In Progress") + getCount(s.id, "Pending")} color="text-blue-600" />
                    <Stat label="შემოწმებაში" value={getCount(s.id, "Review")} color="text-yellow-600" />
                    <Stat label="კორექციაში" value={getCount(s.id, "In Correction")} color="text-orange-600" />
                    <Stat label="დასრულებული" value={getCount(s.id, "Completed")} color="text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admins */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">ადმინისტრატორები</h2>
            <div className="space-y-3">
              {!admins.length ? (
                <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 text-center">
                  <p className="text-gray-400 text-sm">ადმინები არ არის</p>
                </div>
              ) : admins.map((a: any) => (
                <div key={a.id} className="bg-white rounded-xl border border-[#E5E5E5] p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-[#1A1A2E]">{a.full_name}</p>
                    <p className="text-sm text-gray-500">{a.email}</p>
                  </div>
                  <span className="text-xs bg-[#FDE8ED] text-[#E8315B] px-2.5 py-1 rounded-full font-medium shrink-0">ადმინი</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Add Form */}
        <div>
          <AddSpecialistForm />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
