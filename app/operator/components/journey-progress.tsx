"use client";

import { useRouter, usePathname } from "next/navigation";

const JOURNEY_STAGES = [
  { id: "today", label: "Today", href: "/operator" },
  { id: "discover", label: "Discover", href: "/operator/discover" },
  { id: "understand", label: "Understand", href: "/operator/understand" },
  { id: "outreach", label: "Outreach", href: "/operator/outreach" },
  { id: "pipeline", label: "Pipeline", href: "/operator/pipeline" },
  { id: "orders", label: "Orders", href: "/operator/orders" },
];

interface JourneyProgressProps {
  currentStage: string;
  prospectCount?: Record<string, number>;
  prospectId?: string;
}

export function JourneyProgress({ currentStage, prospectCount = {}, prospectId }: JourneyProgressProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleStageClick = (stageId: string, href: string) => {
    if (stageId === currentStage) return;

    // If viewing a specific prospect, maintain context
    const url = prospectId && (stageId === "understand" || stageId === "outreach")
      ? `${href}?prospectId=${prospectId}`
      : href;

    router.push(url);
  };

  return (
    <div className="mb-8 px-4 md:px-0">
      {/* Journey Progress Bar */}
      <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
        {JOURNEY_STAGES.map((stage, index) => {
          const isActive = stage.id === currentStage;
          const isPast = JOURNEY_STAGES.findIndex(s => s.id === currentStage) > index;
          const count = prospectCount[stage.id] || 0;

          return (
            <div key={stage.id} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              {/* Stage Button */}
              <button
                onClick={() => handleStageClick(stage.id, stage.href)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F5F5F5] text-[#0D0D0D] hover:bg-[#E8E8E8]"
                }`}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.05em]">
                  {stage.label}
                </span>
                {count > 0 && (
                  <span className={`text-[10px] font-bold ${isActive ? "text-white" : "text-[#888888]"}`}>
                    {count}
                  </span>
                )}
              </button>

              {/* Connector */}
              {index < JOURNEY_STAGES.length - 1 && (
                <div className={`w-4 h-0.5 ${isPast || isActive ? "bg-[#0D0D0D]" : "bg-[#E8E8E8]"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Description */}
      <div className="mt-3 text-xs text-[#888888]">
        {currentStage === "today" && "View your daily briefing and pipeline overview"}
        {currentStage === "discover" && "Search for and discover new prospects"}
        {currentStage === "understand" && "Deep dive and qualify prospects"}
        {currentStage === "outreach" && "Send trust-signal emails and track engagement"}
        {currentStage === "pipeline" && "Monitor progress through all stages"}
        {currentStage === "orders" && "Track and close revenue-generating deals"}
      </div>
    </div>
  );
}
