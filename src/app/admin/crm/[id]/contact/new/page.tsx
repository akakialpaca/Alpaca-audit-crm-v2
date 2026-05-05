import Link from "next/link";
import { ContactForm } from "./ContactForm";

export default async function NewContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: companyId } = await params;
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href={`/admin/crm/${companyId}`} className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← კომპანია</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">ახალი კონტაქტი</h1>
      </div>
      <ContactForm companyId={companyId} />
    </div>
  );
}
