import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContactForm } from "../../new/ContactForm";

export default async function EditContactPage({ params }: { params: Promise<{ id: string; contactId: string }> }) {
  const { id: companyId, contactId } = await params;
  const svc = createServiceClient();
  const { data } = await svc.from("contacts").select("*").eq("id", contactId).single();
  if (!data) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/admin/crm/${companyId}`} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← კომპანია</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">კონტაქტის რედაქტირება</h1>
      </div>
      <ContactForm companyId={companyId} initial={data} />
    </div>
  );
}
