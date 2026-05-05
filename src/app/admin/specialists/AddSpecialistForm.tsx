"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSpecialistForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [role, setRole] = useState<"specialist" | "admin">("specialist");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const monthly_hours_raw = (form.elements.namedItem("monthly_hours") as HTMLInputElement)?.value;
    const data = {
      full_name: (form.elements.namedItem("full_name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      role,
      monthly_hours: role === "specialist" && monthly_hours_raw ? parseInt(monthly_hours_raw) : null,
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

    setSuccess(`${role === "admin" ? "ადმინი" : "სპეციალისტი"} ${data.full_name} წარმატებით დაემატა.`);
    form.reset();
    setRole("specialist");
    setLoading(false);
    router.refresh();
  }

  const inp = "w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors";

  return (
    <div className="bg-white rounded-xl border border-[#E5E5E5] p-6">
      <h2 className="font-semibold text-[#1A1A2E] mb-5">მომხმარებლის დამატება</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">როლი *</label>
          <div className="flex gap-2">
            {(["specialist", "admin"] as const).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? "bg-[#E8315B] text-white border-[#E8315B]"
                    : "bg-white text-gray-600 border-[#E5E5E5] hover:border-[#E8315B] hover:text-[#E8315B]"
                }`}
              >
                {r === "specialist" ? "სპეციალისტი" : "ადმინი"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">სახელი გვარი *</label>
          <input name="full_name" required placeholder="გიორგი ბერიძე" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">ელ-ფოსტა *</label>
          <input name="email" type="email" required placeholder="giorgi@alpaca.ge" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">პაროლი *</label>
          <input name="password" type="password" required minLength={8} placeholder="მინ. 8 სიმბოლო" className={inp} />
        </div>

        {role === "specialist" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ყოველთვიური საათები
              <span className="text-xs text-gray-400 font-normal ml-1.5">(1 აუდიტი ≈ 1 საათი)</span>
            </label>
            <input
              name="monthly_hours"
              type="number"
              min={1}
              max={999}
              placeholder="მაგ. 20"
              className={inp}
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">{success}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#E8315B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60"
        >
          {loading ? "ემატება..." : "დამატება"}
        </button>
      </form>
    </div>
  );
}
