"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProspectInPipeline {
  id: string;
  businessName: string;
  contactName?: string;
  stage: "discover" | "enrich" | "qualify" | "propose" | "orders";
  confidenceScore?: number;
  lastActivity?: string;
  createdAt?: string;
  emailSentAt?: string;
}

interface PipelineState {
  loading: boolean;
  error: string | null;
  prospects: ProspectInPipeline[];
  selectedStage: string | null;
}

const STAGES = [
  { name: "discover", label: "Discover", color: "bg-blue-500" },
  { name: "enrich", label: "Enrich", color: "bg-green-500" },
  { name: "qualify", label: "Qualify", color: "bg-orange-500" },
  { name: "propose", label: "Propose", color: "bg-purple-500" },
  { name: "orders", label: "Orders", color: "bg-red-500" },
];

export default function PipelinePage() {
  const [state, setState] = useState<PipelineState>({
    loading: true,
    error: null,
    prospects: [],
    selectedStage: null,
  });

  const [stageFilters, setStageFilters] = useState<Record<string, ProspectInPipeline[]>>({
    discover: [],
    enrich: [],
    qualify: [],
    propose: [],
    orders: [],
  });

  // Fetch pipeline data
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const res = await fetch("/api/b2b/prospects");
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch pipeline`);

        const data = await res.json();
        const prospects = Array.isArray(data) ? data : data.prospects || [];

        // Group by stage
        const grouped: Record<string, ProspectInPipeline[]> = {
          discover: [],
          enrich: [],
          qualify: [],
          propose: [],
          orders: [],
        };

        prospects.forEach((prospect: ProspectInPipeline) => {
          if (grouped[prospect.stage]) {
            grouped[prospect.stage].push(prospect);
          }
        });

        // Sort each stage by most recent activity
        Object.keys(grouped).forEach((stage) => {
          grouped[stage].sort((a, b) => {
            const aDate = new Date(a.lastActivity || a.createdAt || 0).getTime();
            const bDate = new Date(b.lastActivity || b.createdAt || 0).getTime();
            return bDate - aDate;
          });
        });

        setState((s) => ({
          ...s,
          loading: false,
          prospects,
        }));
        setStageFilters(grouped);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load pipeline";
        setState((s) => ({
          ...s,
          loading: false,
          error: message,
        }));
      }
    };

    fetchPipeline();
  }, []);

  if (state.loading) {
    return (
      <div className="px-4 md:px-12 py-10 max-w-6xl">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-[#666666]">Loading pipeline...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="px-4 md:px-12 py-10 max-w-6xl">
        <div className="mb-12">
          <Link
            href="/operator"
            className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors mb-6 inline-block"
          >
            ← Back to Today
          </Link>
          <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl tracking-tight leading-tight">
            Pipeline
          </h1>
        </div>

        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white text-center">
          <p className="text-sm text-[#666666] mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalProspects = state.prospects.length;

  return (
    <div className="px-4 md:px-12 py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/operator"
          className="text-xs font-semibold text-[#888888] hover:text-[#0D0D0D] transition-colors mb-6 inline-block"
        >
          ← Back to Today
        </Link>
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl md:text-5xl tracking-tight leading-tight mb-3">
          Pipeline
        </h1>
        <p className="text-sm md:text-base text-[#888888] font-normal">
          {totalProspects} prospect{totalProspects !== 1 ? "s" : ""} in pipeline
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E8E8E8] mb-12"></div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {STAGES.map((stageConfig) => (
          <div key={stageConfig.name}>
            {/* Stage Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${stageConfig.color}`}></div>
                <h2 className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em]">
                  {stageConfig.label}
                </h2>
              </div>
              <p className="text-xs text-[#888888]">
                {stageFilters[stageConfig.name as keyof typeof stageFilters]?.length || 0} prospects
              </p>
            </div>

            {/* Stage Prospects */}
            <div className="space-y-3">
              {stageFilters[stageConfig.name as keyof typeof stageFilters]?.length === 0 ? (
                <div className="p-3 bg-[#F5F5F5] rounded border border-[#E8E8E8] text-center">
                  <p className="text-xs text-[#888888]">Empty</p>
                </div>
              ) : (
                stageFilters[stageConfig.name as keyof typeof stageFilters]?.map((prospect) => (
                  <Link
                    key={prospect.id}
                    href={
                      stageConfig.name === "orders"
                        ? `/operator/orders?orderId=${prospect.id}`
                        : `/operator/understand?prospectId=${prospect.id}`
                    }
                    className="block p-3 border border-[#E8E8E8] rounded-lg bg-white hover:border-[#0D0D0D] hover:shadow-sm transition-all cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-[#0D0D0D] mb-1 line-clamp-2">
                      {prospect.businessName}
                    </p>
                    {prospect.confidenceScore !== undefined && (
                      <p className="text-[9px] text-[#888888]">
                        {prospect.confidenceScore}% confidence
                      </p>
                    )}
                    {prospect.lastActivity && (
                      <p className="text-[9px] text-[#C9C9C9] mt-1">
                        {new Date(prospect.lastActivity).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {totalProspects === 0 && (
        <div className="border border-[#E8E8E8] rounded-lg p-12 bg-white text-center mt-12">
          <p className="text-sm text-[#888888] mb-4">
            No prospects in pipeline yet.
          </p>
          <Link
            href="/operator/discover"
            className="text-xs font-semibold text-[#0D0D0D] hover:text-[#666666] transition-colors"
          >
            Start discovering →
          </Link>
        </div>
      )}
    </div>
  );
}
