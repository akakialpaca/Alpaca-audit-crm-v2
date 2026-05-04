import { createServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { AddSpecialistForm } from "./AddSpecialistForm";

export default async function SpecialistsPage() {
  const supabase = await createServerClient();
  const { data: specialists } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "specialist")
    .order("created_at", { ascending: false });

  const { data: auditCounts } = await supabase
    .from("audits")
    .select("assigned_specialist_id, status");

  const getCount = (id: string, status?: string) =>
    (auditCounts ?? []).filter(a =>
      a.assigned_specialist_id === id && (!status || a.status === status)
    ).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">სპეციალისტები</h1>
        <p className="text-gray-500 text-sm mt-1">{specialists?.length ?? 0} სპეციალისტი</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Specialist List */}
        <div className="space-y-3">
          {!specialists?.length ? (
            <div className="bg-white rounded-xl border border-[#E5E5E5] p-8 text-center">
              <p className="text-gray-400 text-sm">სპეციალისტები არ არის</p>
            </div>
          ) : specialists.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-[#E5E5E5] p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[#1A1A2E]">{s.full_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.email}</p>
                  <p className="text-xs text-gray-400 mt-1">დამატებულია: {formatDate(s.created_at)}</p>
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
