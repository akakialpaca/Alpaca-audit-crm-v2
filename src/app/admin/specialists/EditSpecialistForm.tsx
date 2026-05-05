"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  full_name: string;
  whatsapp_number: string | null;
  monthly_hours: number | null;
}

export function EditSpecialistForm({ id, full_name, whatsapp_number, monthly_hours }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(full_name);
  const [wa, setWa] = useState(whatsapp_number ?? "");
  const [hours, setHours] = useState(monthly_hours?.toString() ?? "");

  async function handleSave() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/specialists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: name.trim(),
        whatsapp_number: wa.trim() || null,
        monthly_hours: hours ? parseInt(hours) : null,
      }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
    } else {
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  const inp = "w-full px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-[#E8315B] transition-colors"
      >
        ✏️ რედაქტირება
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#E5E5E5] space-y-3">
      <div>
        <label className="block text-xs text-gray-500 mb-1">სახელი გვარი</label>
        <input value={name} onChange={e => setName(e.target.value)} className={inp} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">WhatsApp ნომერი</label>
        <input value={wa} onChange={e => setWa(e.target.value)} placeholder="+995 5XX XXX XXX" className={inp} />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1">საათები/თვე</label>
        <input value={hours} onChange={e => setHours(e.target.value)} type="number" min={1} placeholder="მაგ. 20" className={inp} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#E8315B] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60"
        >
          {loading ? "..." : "შენახვა"}
        </button>
        <button
          onClick={() => { setOpen(false); setError(""); }}
          className="px-4 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 transition-colors"
        >
          გაუქმება
        </button>
      </div>
    </div>
  );
}
