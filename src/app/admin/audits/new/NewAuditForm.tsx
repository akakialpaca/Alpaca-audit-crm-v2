"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContactSearch } from "@/components/admin/ContactSearch";

const PRESET_MARKETS = ["საქართველო", "აშშ"];
const PRESET_LANGS = ["ქართული", "ინგლისური", "რუსული"];
const PRESET_KW_LANGS = ["ქართული", "ინგლისური", "რუსული"];

interface Specialist {
  id: string;
  full_name: string;
  email: string;
}

export function NewAuditForm({ specialists }: { specialists: Specialist[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactId, setContactId] = useState<string | null>(null);

  const [markets, setMarkets] = useState<string[]>([]);
  const [customMarket, setCustomMarket] = useState("");

  const [language, setLanguage] = useState("");
  const [customLang, setCustomLang] = useState("");
  const [showCustomLang, setShowCustomLang] = useState(false);

  const [keywordLangs, setKeywordLangs] = useState<string[]>([]);
  const [customKwLang, setCustomKwLang] = useState("");

  function toggleMarket(m: string) {
    setMarkets(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  function addCustomMarket() {
    const val = customMarket.trim();
    if (val && !markets.includes(val)) setMarkets(prev => [...prev, val]);
    setCustomMarket("");
  }

  function toggleKwLang(l: string) {
    setKeywordLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  }

  function addCustomKwLang() {
    const val = customKwLang.trim();
    if (val && !keywordLangs.includes(val)) setKeywordLangs(prev => [...prev, val]);
    setCustomKwLang("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (markets.length === 0) { setError("სამიზნე ბაზარი სავალდებულოა"); return; }
    if (!language) { setError("აუდიტის ენა სავალდებულოა"); return; }
    const specialistId = (form.elements.namedItem("assigned_specialist_id") as HTMLSelectElement).value;
    if (!specialistId) { setError("სპეციალისტის მიმაგრება სავალდებულოა"); return; }

    setLoading(true);
    const form = e.currentTarget;

    const data = {
      source_url: (form.elements.namedItem("source_url") as HTMLInputElement).value,
      language,
      keyword_languages: keywordLangs,
      target_market: markets.join(", "),
      importance: (form.elements.namedItem("importance") as HTMLSelectElement).value,
      deadline: (form.elements.namedItem("deadline") as HTMLInputElement).value,
      assigned_specialist_id: (form.elements.namedItem("assigned_specialist_id") as HTMLSelectElement).value || null,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value || null,
      contact_id: contactId,
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#EBEBF0] p-6 space-y-5">

      <Field label="წყარო URL *">
        <input name="source_url" type="url" required placeholder="https://example.com" className={inp} />
      </Field>

      <Field label="აუდიტის ენა *">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {PRESET_LANGS.map(l => (
              <button key={l} type="button"
                onClick={() => { setLanguage(l); setShowCustomLang(false); setCustomLang(""); }}
                className={tag(language === l && !showCustomLang)}>
                {l}
              </button>
            ))}
            <button type="button"
              onClick={() => { setShowCustomLang(true); setLanguage(""); }}
              className={tag(showCustomLang)}>
              + სხვა
            </button>
          </div>
          {showCustomLang && (
            <input
              value={customLang}
              onChange={e => { setCustomLang(e.target.value); setLanguage(e.target.value); }}
              placeholder="ჩაწერეთ ენა..."
              className={inp}
              autoFocus
            />
          )}
        </div>
      </Field>

      {/* სამიზნე ბაზარი — multi + custom */}
      <Field label="სამიზნე ბაზარი *">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {PRESET_MARKETS.map(m => (
              <button key={m} type="button" onClick={() => toggleMarket(m)}
                className={tag(markets.includes(m))}>
                {m}
              </button>
            ))}
            {markets.filter(m => !PRESET_MARKETS.includes(m)).map(m => (
              <button key={m} type="button" onClick={() => toggleMarket(m)}
                className={tag(true)}>
                {m} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customMarket}
              onChange={e => setCustomMarket(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomMarket())}
              placeholder="სხვა ქვეყანა..."
              className={`${inp} flex-1`}
            />
            <button type="button" onClick={addCustomMarket}
              className="px-3 py-2 rounded-lg border border-[#EBEBF0] text-sm text-gray-600 hover:border-[#E8315B] hover:text-[#E8315B] transition-colors">
              + დამატება
            </button>
          </div>
          {markets.length > 0 && (
            <p className="text-xs text-gray-400">არჩეული: {markets.join(", ")}</p>
          )}
        </div>
      </Field>

      {/* საკვანძო სიტყვების ენა */}
      <Field label="საკვანძო სიტყვების ენა">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {PRESET_KW_LANGS.map(l => (
              <button key={l} type="button" onClick={() => toggleKwLang(l)}
                className={tag(keywordLangs.includes(l))}>
                {l}
              </button>
            ))}
            {keywordLangs.filter(l => !PRESET_KW_LANGS.includes(l)).map(l => (
              <button key={l} type="button" onClick={() => toggleKwLang(l)}
                className={tag(true)}>
                {l} ✕
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customKwLang}
              onChange={e => setCustomKwLang(e.target.value)}
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustomKwLang())}
              placeholder="სხვა ენა..."
              className={`${inp} flex-1`}
            />
            <button type="button" onClick={addCustomKwLang}
              className="px-3 py-2 rounded-lg border border-[#EBEBF0] text-sm text-gray-600 hover:border-[#E8315B] hover:text-[#E8315B] transition-colors">
              + დამატება
            </button>
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="მნიშვნელობა *">
          <select name="importance" required className={inp}>
            <option value="">აირჩიეთ...</option>
            <option value="High">მაღალი</option>
            <option value="Medium">საშუალო</option>
            <option value="Low">დაბალი</option>
          </select>
        </Field>
        <Field label="ვადა *">
          <input name="deadline" type="date" required
            min={new Date().toISOString().split("T")[0]} className={inp} />
        </Field>
      </div>

      <Field label="სპეციალისტი *">
        <select name="assigned_specialist_id" className={inp}>
          <option value="">აირჩიეთ სპეციალისტი...</option>
          {specialists.map(s => (
            <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
          ))}
        </select>
      </Field>

      <Field label="დამატებითი კომენტარი სპეციალისტისთვის">
        <textarea name="notes" rows={3}
          placeholder="დამატებითი ინსტრუქცია ან ინფორმაცია სპეციალისტისთვის..."
          className={`${inp} resize-none`} />
      </Field>

      <div className="border-t border-[#EBEBF0] pt-5">
        <Field label="კლიენტი (CRM კონტაქტი)">
          <ContactSearch value={contactId} onChange={setContactId} />
          <p className="text-xs text-gray-400 mt-1.5">
            ჩაწერე კონტაქტის სახელი ან მეილი. <a href="/admin/crm/new" target="_blank" className="text-[#E8315B] hover:underline">+ ახალი კონტაქტი</a>
          </p>
        </Field>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60">
          {loading ? "ემატება..." : "დამატება"}
        </button>
        <a href="/admin/audits"
          className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
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

function tag(active: boolean) {
  return `px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
    active
      ? "bg-[#E8315B] text-white border-[#E8315B]"
      : "bg-white text-gray-600 border-[#EBEBF0] hover:border-[#E8315B] hover:text-[#E8315B]"
  }`;
}

const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#EBEBF0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white";
