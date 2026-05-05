import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditCompanyForm } from "./EditCompanyForm";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params;
  const svc = createServiceClient();

  const { data } = await svc
    .from("companies")
    .select("*")
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .maybeSingle();

  if (!data) notFound();

  const slug = data.slug ?? data.id;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/admin/crm/${slug}`} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← კომპანია</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">კომპანიის რედაქტირება</h1>
      </div>
      <EditCompanyForm
        companyId={data.id}
        companySlug={slug}
        initial={{
          name: data.name,
          website: data.website,
          industry: data.industry,
          pipeline_stage: data.pipeline_stage,
          notes: data.notes,
          slug: data.slug,
        }}
      />
    </div>
  );
}
