"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PIPELINE_STAGES, PipelineStage } from "@/lib/utils";

export function StageSelector({ companyId, currentStage }: { companyId: string; currentStage: PipelineStage }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStage(stage: PipelineStage) {
    if (stage === currentStage || loading) return;
    setLoading(true);
    await fetch(`/api/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_stage: stage }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {PIPELINE_STAGES.map(s => (
        <button
          key={s.value}
          onClick={() => setStage(s.value as PipelineStage)}
          disabled={loading}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
            currentStage === s.value
              ? `${s.color} border-current opacity-100 ring-2 ring-offset-1 ring-current`
              : `${s.color} border-transparent opacity-50 hover:opacity-80`
          } disabled:cursor-not-allowed`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
