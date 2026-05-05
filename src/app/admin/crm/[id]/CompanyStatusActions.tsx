"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Action = "blacklist" | "delete" | "unblacklist" | null;

interface Props {
  companyId: string;
  companySlug: string;
  currentStatus: string;
  statusReason: string | null;
  statusChangedAt: string | null;
}

export function CompanyStatusActions({ companyId, companySlug, currentStatus, statusReason, statusChangedAt }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<Action>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function confirm() {
    if (!action) return;
    if (action !== "unblacklist" && !reason.trim()) {
      setError("მიზეზი სავალდებულოა");
      return;
    }
    setLoading(true);
    setError("");

    let newStatus = "active";
    if (action === "blacklist") newStatus = "blacklisted";
    if (action === "delete") newStatus = "deleted";

    const res = await fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        status_reason: action === "unblacklist" ? null : reason.trim(),
      }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
      setLoading(false);
      return;
    }

    if (action === "delete") {
      router.push("/admin/crm");
    } else {
      router.refresh();
    }
    setAction(null);
    setReason("");
    setLoading(false);
  }

  function cancel() {
    setAction(null);
    setReason("");
    setError("");
  }

  return (
    <>
      {/* Action buttons */}
      <div className="flex gap-2">
        {currentStatus === "blacklisted" ? (
          <button
            onClick={() => setAction("unblacklist")}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            ✓ შავი სიიდან ამოღება
          </button>
        ) : currentStatus === "active" ? (
          <button
            onClick={() => setAction("blacklist")}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            🚫 შავი სია
          </button>
        ) : null}

        {currentStatus !== "deleted" && (
          <button
            onClick={() => setAction("delete")}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-red-500 hover:text-red-600 transition-colors"
          >
            🗑 წაშლა
          </button>
        )}
      </div>

      {/* Modal overlay */}
      {action && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-[#1A1A2E] text-lg">
              {action === "delete" && "კომპანიის წაშლა"}
              {action === "blacklist" && "შავ სიაში შეყვანა"}
              {action === "unblacklist" && "შავი სიიდან ამოღება"}
            </h2>

            {action === "delete" && (
              <p className="text-sm text-gray-500">
                კომპანია დაიმალება სიიდან. ყველა კონტაქტი და ისტორია შენახული დარჩება.
              </p>
            )}
            {action === "blacklist" && (
              <p className="text-sm text-gray-500">
                კომპანია შავ სიაში გადადის და სიაში გამოჩნდება სპეციალური ნიშნით.
              </p>
            )}

            {action !== "unblacklist" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  მიზეზი *
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    action === "delete"
                      ? "მაგ. კლიენტი გადაიყვანეს სხვა სისტემაში..."
                      : "მაგ. კლიენტმა გადახდა ვერ განახორციელა..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors resize-none"
                  autoFocus
                />
              </div>
            )}

            {action === "unblacklist" && (
              <p className="text-sm text-gray-600">
                კომპანია ისევ აქტიურ სტატუსში გადავა.
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={confirm}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                  action === "delete" ? "bg-red-600 hover:bg-red-700" :
                  action === "blacklist" ? "bg-orange-500 hover:bg-orange-600" :
                  "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "..." :
                  action === "delete" ? "წაშლა" :
                  action === "blacklist" ? "შავ სიაში შეყვანა" :
                  "ამოღება"}
              </button>
              <button onClick={cancel}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
                გაუქმება
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
