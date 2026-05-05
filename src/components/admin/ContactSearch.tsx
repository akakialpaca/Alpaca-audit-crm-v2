"use client";

import { useState, useEffect, useRef } from "react";

interface ContactOption {
  id: string;
  first_name: string;
  last_name: string | null;
  position: string | null;
  email: string | null;
  company: { id: string; name: string } | null;
}

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
}

export function ContactSearch({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContactOption[]>([]);
  const [selected, setSelected] = useState<ContactOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/contacts?search=${encodeURIComponent(query)}`);
      const { contacts } = await res.json();
      setResults(contacts ?? []);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function select(c: ContactOption) {
    setSelected(c);
    onChange(c.id);
    setQuery("");
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    onChange(null);
    setQuery("");
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between bg-[#FDE8ED] border border-[#E8315B]/30 rounded-lg px-4 py-2.5">
        <div>
          <p className="text-sm font-medium text-[#1A1A2E]">
            {selected.first_name} {selected.last_name ?? ""}
            {selected.company && <span className="text-gray-500 font-normal"> · {selected.company.name}</span>}
          </p>
          {selected.position && <p className="text-xs text-gray-500">{selected.position}</p>}
        </div>
        <button onClick={clear} className="text-xs text-gray-400 hover:text-[#E8315B] ml-3 transition-colors">✕</button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
        placeholder="სახელი, გვარი ან მეილი..."
        className="w-full px-3.5 py-2.5 rounded-lg border border-[#EBEBF0] text-sm focus:outline-none focus:ring-2 focus:ring-[#E8315B]/20 focus:border-[#E8315B] transition-colors bg-white"
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">...</span>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E5E5E5] rounded-xl shadow-lg z-50 overflow-hidden">
          {results.map(c => (
            <button key={c.id} type="button" onClick={() => select(c)}
              className="w-full text-left px-4 py-2.5 hover:bg-[#FDE8ED] transition-colors border-b border-[#E5E5E5] last:border-0">
              <p className="text-sm font-medium text-[#1A1A2E]">
                {c.first_name} {c.last_name ?? ""}
                {c.company && <span className="text-gray-400 font-normal"> · {c.company.name}</span>}
              </p>
              {(c.position || c.email) && (
                <p className="text-xs text-gray-400">{[c.position, c.email].filter(Boolean).join(" · ")}</p>
              )}
            </button>
          ))}
        </div>
      )}
      {open && !loading && query.trim() && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E5E5E5] rounded-xl shadow-lg z-50 px-4 py-3">
          <p className="text-xs text-gray-400">კონტაქტი ვერ მოიძებნა</p>
        </div>
      )}
    </div>
  );
}
