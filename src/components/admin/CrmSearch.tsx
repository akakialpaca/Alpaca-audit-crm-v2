"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function CrmSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const current = searchParams.get("search") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) params.set("search", e.target.value);
    else params.delete("search");
    startTransition(() => router.push(`/admin/crm?${params.toString()}`));
  }

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        placeholder="კომპანიის ძიება..."
        defaultValue={current}
        onChange={handleChange}
        className="w-full max-w-xs pl-9 pr-4 py-2 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white"
      />
    </div>
  );
}
