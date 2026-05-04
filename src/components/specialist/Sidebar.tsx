"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/specialist", label: "ჩემი დავალებები", icon: "📋" },
];

export function SpecialistSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 min-h-screen bg-[#1A1A1A] flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#D42B2B] rounded-md" />
          <span className="text-white font-bold text-lg">Alpaca</span>
        </div>
        <p className="text-white/40 text-xs mt-1">სპეციალისტი</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#D42B2B] text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <p className="text-white/60 text-xs truncate mb-2">{userName}</p>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          გამოსვლა →
        </button>
      </div>
    </aside>
  );
}
