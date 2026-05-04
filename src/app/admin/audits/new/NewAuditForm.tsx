"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LANGUAGES = ["ქართული", "English", "Русский", "Türkçe", "Deutsch", "Français", "სხვა"];
const MARKETS = ["საქართველო", "რუსეთი", "თურქეთი", "გერმანია", "აშშ", "დიდი ბრიტანეთი", "სხვა"];

interface Specialist {
  id: string;
  full_name: string;
  email: string;
}

export function NewAuditForm({ specialists }: { specialists: Specialist[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keywordLangs, setKeywordLangs] = useState<string[]>([]);

  function toggleKeywordLang(lang: string) {
    setKeywordLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      source_url: (form.elements.namedItem("source_url") as HTMLInputElement).value,
      language: (form.elements.namedItem("language") as HTMLSelectElement).value,
      keyword_languages: keywordLangs,
      target_market: (form.elements.namedItem("target_market") as HTMLSelectElement).value,
      importance: (form.elements.namedItem("importance") as HTMLSelectElement).value,
      deadline: (form.elements.namedItem("deadline") as HTMLInputElement).value,
      assigned_specialist_id: (form.elements.namedItem("assigned_specialist_id") as HTMLSelectElement).value || null,
    };

    const res = await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა. სცადეთ თავიდან.");
      setLoading(false);
      return;
    }

    router.push("/admin/audits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-5">
      <Field label="წყარო URL *">
        <input
          name="source_url"
          type="url"
          required
          placeholder="https://example.com"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="საიტის ენა *">
          <select name="language" required className={inputClass}>
            <option value="">აირჩიეთ...</option>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </Field>

        <Field label="სამიზნე ბაზარი *">
          <select name="target_market" required className={inputClass}>
            <option value="">აირჩიეთ...</option>
            {MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>
      </div>

      <Field label="საკვანძო სიტყვების ენა">
        <div className="flex flex-wrap gap-2 pt-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleKeywordLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                keywordLangs.includes(lang)
                  ? "bg-[#D42B2B] text-white border-[#D42B2B]"
                  : "bg-white text-gray-600 border-[#E5E5E5] hover:border-gray-400"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="მნიშვნელობა *">
          <select name="importance" required className={inputClass}>
            <option value="">აირჩიეთ...</option>
            <option value="High">მაღალი</option>
            <option value="Medium">საშუალო</option>
            <option value="Low">დაბალი</option>
          </select>
        </Field>

        <Field label="ვადა *">
          <input
            name="deadline"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="სპეციალისტი">
        <select name="assigned_specialist_id" className={inputClass}>
          <option value="">დანიშვნის გარეშე</option>
          {specialists.map(s => (
            <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
          ))}
        </select>
      </Field>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#D42B2B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#B52323] transition-colors disabled:opacity-60"
        >
          {loading ? "ემატება..." : "დამატება"}
        </button>
        <a
          href="/admin/audits"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          გაუქმება
        </a>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#D42B2B]/20 focus:border-[#D42B2B] transition-colors bg-white";
