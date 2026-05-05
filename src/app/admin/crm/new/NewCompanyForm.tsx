"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES } from "@/lib/utils";

const INDUSTRIES = ["უძრავი ქონება", "ელ-კომერცია", "სამართალი", "მედიცინა", "განათლება", "სასტუმრო/ტურიზმი", "ფინანსები", "ტექნოლოგია"];

const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#EBEBF0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white";

export function NewCompanyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [stage, setStage] = useState("Lead");
  const [companyNotes, setCompanyNotes] = useState("");

  // Contact fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [contactNotes, setContactNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) { setError("კომპანიის სახელი სავალდებულოა"); return; }
    setLoading(true);
    setError("");

    const effectiveIndustry = industry === "__custom__" ? customIndustry.trim() : industry;

    const companyRes = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: companyName.trim(),
        website: website.trim() || null,
        industry: effectiveIndustry || null,
        pipeline_stage: stage,
        notes: companyNotes.trim() || null,
      }),
    });

    if (!companyRes.ok) {
      const { error } = await companyRes.json();
      setError(error ?? "კომპანიის შექმნა ვერ მოხერხდა");
      setLoading(false);
      return;
    }

    const { company } = await companyRes.json();

    if (firstName.trim()) {
      const contactRes = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          position: position.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          whatsapp_number: whatsapp.trim() || null,
          linkedin_url: linkedin.trim() || null,
          notes: contactNotes.trim() || null,
        }),
      });
      if (!contactRes.ok) {
        const { error } = await contactRes.json();
        setError(error ?? "კონტაქტის შექმნა ვერ მოხერხდა");
        setLoading(false);
        return;
      }
    }

    router.push(`/admin/crm/${company.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Company */}
      <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 space-y-5">
        <h2 className="font-semibold text-[#1A1A2E]">კომპანიის ინფო</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი *</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Alpaca LLC" className={inp} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ვებსაიტი</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" className={inp} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">ინდუსტრია / სფერო</label>
            <select value={industry} onChange={e => setIndustry(e.target.value)} className={inp}>
              <option value="">— აირჩიეთ —</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              <option value="__custom__">სხვა (ჩაწერა)</option>
            </select>
            {industry === "__custom__" && (
              <input value={customIndustry} onChange={e => setCustomIndustry(e.target.value)} placeholder="სფეროს სახელი..." className={`${inp} mt-2`} />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pipeline სტადია</label>
            <select value={stage} onChange={e => setStage(e.target.value)} className={inp}>
              {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">შენიშვნები</label>
          <textarea value={companyNotes} onChange={e => setCompanyNotes(e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="დამატებითი ინფო..." />
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-[#EBEBF0] p-6 space-y-5">
        <h2 className="font-semibold text-[#1A1A2E]">კონტაქტ-პირი <span className="text-xs text-gray-400 font-normal">(სურვილისამებრ)</span></h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი</label>
            <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="გიორგი" className={inp} />
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
          <textarea value={contactNotes} onChange={e => setContactNotes(e.target.value)} rows={2} className={`${inp} resize-none`} placeholder="კონტაქტის შესახებ ინფო..." />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60">
          {loading ? "ემატება..." : "დამატება"}
        </button>
        <a href="/admin/crm" className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          გაუქმება
        </a>
      </div>
    </form>
  );
}
