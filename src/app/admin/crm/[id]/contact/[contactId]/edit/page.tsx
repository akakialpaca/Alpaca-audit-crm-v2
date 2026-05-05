import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactForm } from "../../new/ContactForm";

export default async function EditContactPage({ params }: { params: Promise<{ id: string; contactId: string }> }) {
  const { id: slugOrId, contactId } = await params;
  const svc = createServiceClient();

  const [companyRes, contactRes] = await Promise.all([
    svc.from("companies").select("id, slug, name").or(`slug.eq.${slugOrId},id.eq.${slugOrId}`).maybeSingle(),
    svc.from("contacts").select("*").eq("id", contactId).single(),
  ]);

  if (!companyRes.data || !contactRes.data) notFound();

  const slug = companyRes.data.slug ?? companyRes.data.id;

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/admin/crm/${slug}`} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← {companyRes.data.name}</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">კონტაქტის რედაქტირება</h1>
      </div>
      <ContactForm companyId={companyRes.data.id} companySlug={slug} initial={contactRes.data} />
    </div>
  );
}
