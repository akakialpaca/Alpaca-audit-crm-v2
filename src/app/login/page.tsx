"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("ელ-ფოსტა ან პაროლი არასწორია");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#E8315B] rounded-lg" />
            <span className="text-2xl font-bold text-[#1A1A2E]">Alpaca</span>
          </div>
          <p className="text-sm text-gray-500">SEO Audit Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E5E5] p-8">
          <h1 className="text-xl font-semibold text-[#1A1A2E] mb-6">შესვლა</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ელ-ფოსტა
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@alpaca.ge"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                პაროლი
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E8315B] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#C9284F] transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "შედის..." : "შესვლა"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
