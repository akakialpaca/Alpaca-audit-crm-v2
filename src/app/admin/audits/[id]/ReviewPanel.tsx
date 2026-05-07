"use client";

import { useState } from "react";
import { Audit } from "@/lib/utils";

export function ReviewPanel({ audit }: { audit: Audit & { profiles: { id: string; full_name: string; email: string } | null } }) {
  const [comments, setComments] = useState(audit.admin_comments ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (done || (audit.status !== "Review" && audit.status !== "In Correction")) {
    if (done || audit.status === "Completed") {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-medium">✓ აუდიტი დასრულებულია</p>
        </div>
      );
    }
    return null;
  }

  async function updateStatus(newStatus: "Completed" | "In Correction") {
    if (newStatus === "In Correction" && !comments.trim()) {
      setError("კომენტარი სავალდებულოა კორექციისთვის");
      return;
    }
    setError("");
    setLoading(newStatus);

    const res = await fetch(`/api/audits/${audit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        admin_comments: newStatus === "In Correction" ? comments : null,
      }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა. სცადეთ თავიდან.");
      setLoading(null);
      return;
    }

    if (newStatus === "Completed") setDone(true);
    setLoading(null);
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
      <h2 className="font-semibold text-[#1A1A2E]">
        {audit.status === "Review" ? "შემოწმება" : "კორექციის შემდეგ შემოწმება"}
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          კომენტარი {audit.status === "Review" ? "(კორექციის შემთხვევაში)" : "*"}
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="კორექციის დეტალები სპეციალისტისთვის..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => updateStatus("Completed")}
          disabled={!!loading}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {loading === "Completed" ? "..." : "✓ დამტკიცება"}
        </button>
        <button
          onClick={() => updateStatus("In Correction")}
          disabled={!!loading}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
        >
          {loading === "In Correction" ? "..." : "↩ კორექციაზე გაგზავნა"}
        </button>
      </div>
    </div>
  );
}
