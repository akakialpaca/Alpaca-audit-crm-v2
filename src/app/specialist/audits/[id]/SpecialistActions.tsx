"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Audit } from "@/lib/utils";

export function SpecialistActions({ audit }: { audit: Audit }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState(audit.audit_result_url ?? "");
  const [password, setPassword] = useState(audit.audit_password ?? "");

  if (audit.status === "Completed") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <p className="text-green-700 font-semibold text-center">✓ დავალება დასრულებულია</p>
        {audit.audit_result_url && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">აუდიტის ლინკი</p>
              <a href={audit.audit_result_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-[#E8315B] hover:underline break-all font-medium">
                {audit.audit_result_url} →
              </a>
            </div>
            {audit.audit_password && (
              <div>
                <p className="text-xs text-gray-500 mb-1">პაროლი</p>
                <span className="inline-block text-sm font-mono bg-white border border-green-200 px-3 py-1.5 rounded-lg text-[#1A1A2E] select-all">
                  {audit.audit_password}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (audit.status === "Review") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-700 font-semibold text-center">⏳ შემოწმებაში — ადმინი განიხილავს</p>
        {audit.audit_result_url && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">წარდგენილი აუდიტი</p>
              <a href={audit.audit_result_url} target="_blank" rel="noopener noreferrer"
                className="text-sm text-[#E8315B] hover:underline break-all font-medium">
                {audit.audit_result_url} →
              </a>
            </div>
            {audit.audit_password && (
              <div>
                <p className="text-xs text-gray-500 mb-1">პაროლი</p>
                <span className="inline-block text-sm font-mono bg-white border border-yellow-200 px-3 py-1.5 rounded-lg text-[#1A1A2E] select-all">
                  {audit.audit_password}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  async function handleAcknowledge() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/audits/${audit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acknowledge: true }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  async function handleStartProgress() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/audits/${audit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "In Progress" }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!resultUrl.trim()) { setError("URL სავალდებულოა"); return; }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/audits/${audit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "Review",
        audit_result_url: resultUrl,
        audit_password: password,
      }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "შეცდომა");
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors";

  return (
    <div className="space-y-4">
      {audit.status === "Pending" && !audit.acknowledged_at && (
        <div className="bg-white rounded-xl border-2 border-[#E8315B] p-6 space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button
            onClick={handleAcknowledge}
            disabled={loading}
            className="w-full bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60"
          >
            {loading ? "..." : "✓ ვადასტურებ აუდიტის მიღებას"}
          </button>
        </div>
      )}

      {audit.status === "Pending" && audit.acknowledged_at && (
        <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
          <p className="text-xs text-green-600 font-medium mb-3">✓ მიღება დადასტურებულია</p>
          <p className="text-sm text-gray-600 mb-4">დაიწყე მუშაობა ამ დავალებაზე</p>
          <button
            onClick={handleStartProgress}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "..." : "▶ დაწყება"}
          </button>
        </div>
      )}

      {(audit.status === "In Progress" || audit.status === "In Correction") && (
        <form onSubmit={handleSubmitReview} className="bg-white rounded-xl border border-[#E5E5E5] p-6 space-y-4">
          <h2 className="font-semibold text-[#1A1A2E]">
            {audit.status === "In Correction" ? "კორექციის შემდეგ გაგზავნა" : "შედეგის გაგზავნა შესამოწმებლად"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">აუდიტის URL *</label>
            <input
              type="text"
              value={resultUrl}
              onChange={e => setResultUrl(e.target.value)}
              placeholder="https://docs.google.com/..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">პაროლი (თუ არის)</label>
            <input
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="საჭიროების შემთხვევაში"
              className={inputClass}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#E8315B] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60"
          >
            {loading ? "..." : "გაგზავნა შესამოწმებლად →"}
          </button>
        </form>
      )}

      {error && !["Pending", "In Progress", "In Correction"].includes(audit.status) && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
      )}
    </div>
  );
}
