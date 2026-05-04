"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSpecialistForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const data = {
      full_name: (form.elements.namedItem("full_name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    };

    const res = await fetch("/api/specialists", {
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

    setSuccess(`სპეციალისტი ${data.full_name} წარმატებით დაემატა.`);
    form.reset();
    setLoading(false);
    router.refresh();
  }

  const inputClass = "w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#D42B2B]/20 focus:border-[#D42B2B] transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h2 className="font-semibold text-[#1A1A1A] mb-5">სპეციალისტის დამატება</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი გვარი *</label>
          <input name="full_name" required placeholder="გიორგი ბერიძე" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ელ-ფოსტა *</label>
          <input name="email" type="email" required placeholder="giorgi@alpaca.ge" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">პაროლი *</label>
          <input name="password" type="password" required minLength={8} placeholder="მინ. 8 სიმბოლო" className={inputClass} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#D42B2B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#B52323] transition-colors disabled:opacity-60"
        >
          {loading ? "ემატება..." : "დამატება"}
        </button>
      </form>
    </div>
  );
}
