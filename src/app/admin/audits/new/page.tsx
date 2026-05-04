import { createServerClient } from "@/lib/supabase/server";
import { NewAuditForm } from "./NewAuditForm";

export default async function NewAuditPage() {
  const supabase = await createServerClient();
  const { data: specialists } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "specialist")
    .order("full_name");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">ახალი აუდიტი</h1>
        <p className="text-gray-500 text-sm mt-1">SEO აუდიტის დამატება და სპეციალისტზე მინიჭება</p>
      </div>
      <NewAuditForm specialists={specialists ?? []} />
    </div>
  );
}
