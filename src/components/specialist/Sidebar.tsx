"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  {
    href: "/specialist",
    label: "ჩემი დავალებები",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4"/>
      </svg>
    ),
  },
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
    <aside className="w-56 min-h-screen bg-white border-r border-[#EBEBF0] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#EBEBF0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E8315B] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#1A1A2E]">Alpaca</p>
            <p className="text-[10px] text-gray-400 leading-none">SEO Audit</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/audits");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-[#FDE8ED] text-[#E8315B] font-semibold"
                  : "text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-50"
              )}
            >
              <span className={active ? "text-[#E8315B]" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-2 border-t border-[#EBEBF0]">
        <div className="px-3 py-2">
          <p className="text-xs font-medium text-[#1A1A2E] truncate">{userName}</p>
          <p className="text-[10px] text-gray-400">სპეციალისტი</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 rounded-lg border border-[#EBEBF0] text-sm text-gray-500 hover:border-[#E8315B] hover:text-[#E8315B] transition-colors text-left"
        >
          გასვლა
        </button>
      </div>
    </aside>
  );
}
