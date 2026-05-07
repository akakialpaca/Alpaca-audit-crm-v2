"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAuditButton({ auditId }: { auditId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/audits/${auditId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/audits");
      router.refresh();
    } else {
      setLoading(false);
      setConfirm(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">დარწმუნებული ხარ?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {loading ? "..." : "დიახ, წაშლა"}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors"
        >
          გაუქმება
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-medium"
    >
      წაშლა
    </button>
  );
}
