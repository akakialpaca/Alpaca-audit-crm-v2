"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZES = [
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "100", label: "100" },
  { value: "500", label: "500" },
  { value: "all", label: "ყველა" },
];

interface Props {
  total: number;
  page: number;
  perPage: number | "all";
}

export function AuditPagination({ total, page, perPage }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const totalPages = perPage === "all" ? 1 : Math.ceil(total / perPage);

  function buildUrl(overrides: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(overrides)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    return `/admin/audits?${params.toString()}`;
  }

  function handlePerPageChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("perPage", e.target.value);
    params.delete("page");
    router.push(`/admin/audits?${params.toString()}`);
  }

  const showingFrom = perPage === "all" ? 1 : (page - 1) * perPage + 1;
  const showingTo = perPage === "all" ? total : Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA]">
      <div className="flex items-center gap-2">
        {totalPages > 1 && page > 1 && (
          <Link
            href={buildUrl({ page: String(page - 1) })}
            className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] bg-white hover:border-[#E8315B] hover:text-[#E8315B] transition-colors"
          >
            ← წინა
          </Link>
        )}
        <span className="text-xs text-gray-500">
          {showingFrom}–{showingTo} / {total}
        </span>
        {totalPages > 1 && page < totalPages && (
          <Link
            href={buildUrl({ page: String(page + 1) })}
            className="px-3 py-1.5 text-sm rounded-lg border border-[#E5E5E5] bg-white hover:border-[#E8315B] hover:text-[#E8315B] transition-colors"
          >
            შემდეგი →
          </Link>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">ჩვენება:</span>
        <select
          value={perPage === "all" ? "all" : String(perPage)}
          onChange={handlePerPageChange}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#E8315B] cursor-pointer"
        >
          {PAGE_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
