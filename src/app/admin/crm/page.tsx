import { createServiceClient } from "@/lib/supabase/server";
import { Company, PIPELINE_STAGES } from "@/lib/utils";
import Link from "next/link";

export default async function CrmPage() {
  const svc = createServiceClient();
  const { data } = await svc
    .from("companies")
    .select("*, contacts(id, first_name, last_name, position, email)")
    .order("created_at", { ascending: false });

  const companies = (data ?? []) as Company[];

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">CRM</h1>
          <p className="text-gray-500 text-sm mt-1">{companies.length} კომპანია</p>
        </div>
        <Link
          href="/admin/crm/new"
          className="bg-[#E8315B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors"
        >
          + ახალი კომპანია
        </Link>
      </div>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {PIPELINE_STAGES.map(stage => {
            const stageCompanies = companies.filter(c => c.pipeline_stage === stage.value);
            return (
              <div key={stage.value} className="w-60 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${stage.color}`}>
                    {stage.label}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{stageCompanies.length}</span>
                </div>
                <div className="space-y-2">
                  {stageCompanies.length === 0 && (
                    <div className="bg-white border border-dashed border-[#E5E5E5] rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-300">ცარიელია</p>
                    </div>
                  )}
                  {stageCompanies.map(company => {
                    const contact = company.contacts?.[0];
                    return (
                      <Link key={company.id} href={`/admin/crm/${company.id}`}>
                        <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 hover:border-[#E8315B] hover:shadow-sm transition-all cursor-pointer">
                          <p className="font-semibold text-[#1A1A2E] text-sm truncate">{company.name}</p>
                          {company.industry && (
                            <p className="text-xs text-gray-400 mt-0.5">{company.industry}</p>
                          )}
                          {contact && (
                            <p className="text-xs text-gray-500 mt-2 truncate">
                              👤 {contact.first_name} {contact.last_name ?? ""}
                            </p>
                          )}
                          {company.website && (
                            <p className="text-xs text-[#E8315B] mt-1 truncate">{company.website}</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All companies table */}
      {companies.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E5E5]">
            <h2 className="font-semibold text-[#1A1A2E] text-sm">ყველა კომპანია</h2>
          </div>
          <table className="w-full">
            <thead className="bg-[#F5F6FA]">
              <tr>
                {["კომპანია", "სფერო", "კონტაქტი", "სტადია", ""].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {companies.map(company => {
                const stage = PIPELINE_STAGES.find(s => s.value === company.pipeline_stage);
                const contact = company.contacts?.[0];
                return (
                  <tr key={company.id} className="hover:bg-[#F5F6FA] transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#1A1A2E]">{company.name}</p>
                      {company.website && <p className="text-xs text-gray-400 truncate max-w-48">{company.website}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{company.industry ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {contact ? (
                        <div>
                          <p className="text-sm text-gray-700">{contact.first_name} {contact.last_name ?? ""}</p>
                          {contact.position && <p className="text-xs text-gray-400">{contact.position}</p>}
                        </div>
                      ) : <span className="text-sm text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stage?.color}`}>
                        {stage?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/crm/${company.id}`} className="text-xs text-[#E8315B] hover:underline font-medium">
                        გახსნა →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {companies.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-16 text-center">
          <p className="text-gray-400 text-sm">კომპანიები არ არის</p>
          <Link href="/admin/crm/new" className="mt-3 inline-block text-sm text-[#E8315B] hover:underline">
            + პირველი კომპანიის დამატება
          </Link>
        </div>
      )}
    </div>
  );
}
