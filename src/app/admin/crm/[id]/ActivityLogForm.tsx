"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITY_LABELS, ActivityType } from "@/lib/utils";

const TYPES = Object.entries(ACTIVITY_LABELS) as [ActivityType, string][];

export function ActivityLogForm({ contactId }: { contactId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ActivityType>("note");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/contacts/${contactId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, content }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
    } else {
      setContent("");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-lg border-2 border-dashed border-[#E5E5E5] text-sm text-gray-400 hover:border-[#E8315B] hover:text-[#E8315B] transition-colors"
      >
        + აქტივობის დამატება
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#F5F6FA] rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        {TYPES.map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setType(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              type === val
                ? "bg-[#E8315B] text-white border-[#E8315B]"
                : "bg-white text-gray-600 border-[#E5E5E5] hover:border-[#E8315B] hover:text-[#E8315B]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        placeholder="დეტალები..."
        className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white resize-none"
        autoFocus
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-[#E8315B] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60">
          {loading ? "..." : "შენახვა"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setError(""); }}
          className="px-4 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-200 transition-colors">
          გაუქმება
        </button>
      </div>
    </form>
  );
}
