import Link from "next/link";
import { NewCompanyForm } from "./NewCompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/crm" className="text-xs text-gray-400 hover:text-gray-600 mb-2 block">← CRM</Link>
        <h1 className="text-2xl font-bold text-[#1A1A2E]">ახალი კომპანია</h1>
      </div>
      <NewCompanyForm />
    </div>
  );
}
