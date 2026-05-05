"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { STATUS_LABELS, IMPORTANCE_LABELS } from "@/lib/utils";

interface Specialist {
  id: string;
  full_name: string;
}

export function AuditFilters({ specialists }: { specialists: Specialist[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const current = {
    search: searchParams.get("search") ?? "",
    status: searchParams.get("status") ?? "",
    importance: searchParams.get("importance") ?? "",
    specialist: searchParams.get("specialist") ?? "",
  };

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/admin/audits?${params.toString()}`));
  }

  const hasFilters = current.search || current.status || current.importance || current.specialist;

  function clearAll() {
    startTransition(() => router.push("/admin/audits"));
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="დომენით ძიება..."
          defaultValue={current.search}
          onChange={e => updateParam("search", e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white"
        />
      </div>

      {/* Dropdowns row */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={current.status}
          onChange={e => updateParam("status", e.target.value)}
          className={sel(!!current.status)}
        >
          <option value="">სტატუსი — ყველა</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select
          value={current.importance}
          onChange={e => updateParam("importance", e.target.value)}
          className={sel(!!current.importance)}
        >
          <option value="">მნიშვნელობა — ყველა</option>
          {Object.entries(IMPORTANCE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {specialists.length > 0 && (
          <select
            value={current.specialist}
            onChange={e => updateParam("specialist", e.target.value)}
            className={sel(!!current.specialist)}
          >
            <option value="">სპეციალისტი — ყველა</option>
            {specialists.map(s => (
              <option key={s.id} value={s.id}>{s.full_name}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-[#E8315B] transition-colors underline"
          >
            გასუფთავება
          </button>
        )}
      </div>
    </div>
  );
}

function sel(active: boolean) {
  return `px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 cursor-pointer ${
    active
      ? "border-[#E8315B] text-[#E8315B] bg-[#FDE8ED] font-medium"
      : "border-[#E5E5E5] text-gray-600 bg-white hover:border-[#E8315B]"
  }`;
}
