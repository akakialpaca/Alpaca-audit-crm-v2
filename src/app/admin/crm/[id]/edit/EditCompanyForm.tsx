"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES } from "@/lib/utils";

const INDUSTRIES = ["უძრავი ქონება", "ელ-კომერცია", "სამართალი", "მედიცინა", "განათლება", "სასტუმრო/ტურიზმი", "ფინანსები", "ტექნოლოგია"];
const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#EBEBF0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white";

interface Props {
  companyId: string;
  companySlug: string;
  initial: {
    name: string;
    website: string | null;
    industry: string | null;
    pipeline_stage: string;
    notes: string | null;
    slug: string | null;
  };
}

export function EditCompanyForm({ companyId, companySlug, initial }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(initial.name);
  const [website, setWebsite] = useState(initial.website ?? "");
  const [industry, setIndustry] = useState(INDUSTRIES.includes(initial.industry ?? "") ? (initial.industry ?? "") : initial.industry ? "__custom__" : "");
  const [customIndustry, setCustomIndustry] = useState(INDUSTRIES.includes(initial.industry ?? "") ? "" : (initial.industry ?? ""));
  const [stage, setStage] = useState(initial.pipeline_stage);
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [slug, setSlug] = useState(initial.slug ?? companySlug);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("სახელი სავალდებულოა"); return; }
    setLoading(true);
    setError("");

    const effectiveIndustry = industry === "__custom__" ? customIndustry.trim() : industry;

    const res = await fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        website: website.trim() || null,
        industry: effectiveIndustry || null,
        pipeline_stage: stage,
        notes: notes.trim() || null,
        slug: slug.trim() || null,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
      setLoading(false);
      return;
    }

    const newSlug = slug.trim() || companySlug;
    router.push(`/admin/crm/${newSlug}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#EBEBF0] p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი *</label>
          <input value={name} onChange={e => setName(e.target.value)} className={inp} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">URL სახელი (slug)</label>
          <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="magalitad-econsule" className={inp} />
          <p className="text-xs text-gray-400 mt-1">/admin/crm/{slug || "..."}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">ვებსაიტი</label>
        <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://example.com" className={inp} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ინდუსტრია</label>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className={inp}>
            <option value="">— აირჩიეთ —</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            <option value="__custom__">სხვა</option>
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
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={`${inp} resize-none`} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60">
          {loading ? "..." : "შენახვა"}
        </button>
        <a href={`/admin/crm/${companySlug}`}
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          გაუქმება
        </a>
      </div>
    </form>
  );
}
