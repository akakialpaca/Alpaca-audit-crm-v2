import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactForm } from "./ContactForm";

export default async function NewContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params;
  const svc = createServiceClient();

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const { data } = await svc
    .from("companies")
    .select("id, slug, name")
    .eq(isUuid ? "id" : "slug", slugOrId)
    .maybeSingle();

  if (!data) notFound();

  const slug = data.slug ?? data.id;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/admin/crm/${slug}`} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← {data.name}</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">ახალი კონტაქტი</h1>
      </div>
      <ContactForm companyId={data.id} companySlug={slug} />
    </div>
  );
}
