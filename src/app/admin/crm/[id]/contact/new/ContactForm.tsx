"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#EBEBF0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white";

interface Props {
  companyId: string;
  initial?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    position?: string;
    email?: string;
    phone?: string;
    whatsapp_number?: string;
    linkedin_url?: string;
    notes?: string;
  };
}

export function ContactForm({ companyId, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(initial?.first_name ?? "");
  const [lastName, setLastName] = useState(initial?.last_name ?? "");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp_number ?? "");
  const [linkedin, setLinkedin] = useState(initial?.linkedin_url ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) { setError("სახელი სავალდებულოა"); return; }
    setLoading(true);
    setError("");

    const isEdit = !!initial?.id;
    const url = isEdit ? `/api/contacts/${initial!.id}` : "/api/contacts";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: companyId,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        position: position.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        whatsapp_number: whatsapp.trim() || null,
        linkedin_url: linkedin.trim() || null,
        notes: notes.trim() || null,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
      setLoading(false);
      return;
    }

    router.push(`/admin/crm/${companyId}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#EBEBF0] p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი *</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="გიორგი" className={inp} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">გვარი</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="მამულაშვილი" className={inp} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">პოზიცია</label>
          <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Marketing Manager" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">მეილი</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="email@company.com" className={inp} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ტელეფონი</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+995 5XX XXX XXX" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
          <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+995 5XX XXX XXX" className={inp} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">LinkedIn</label>
        <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." className={inp} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">შენიშვნები</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="კონტაქტის შესახებ..." />
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60">
          {loading ? "..." : initial?.id ? "შენახვა" : "დამატება"}
        </button>
        <a href={`/admin/crm/${companyId}`} className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          გაუქმება
        </a>
      </div>
    </form>
  );
}
