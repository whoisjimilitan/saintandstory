"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Prospect {
  id: string;
  businessName: string;
  location: string;
  stage: "discover" | "qualify" | "enrich" | "sent" | "replied" | "converted";
  stageUpdatedAt: string;
  nextAction?: string;
}

export default function PipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleProspects: Prospect[] = [
      {
        id: "1",
        businessName: "Acme Facilities",
        location: "London",
        stage: "discover",
        stageUpdatedAt: "2 hours ago",
      },
      {
        id: "1b",
        businessName: "Prime Services",
        location: "Manchester",
        stage: "discover",
        stageUpdatedAt: "1 day ago",
      },
      {
        id: "1c",
        businessName: "Metro FM",
        location: "Birmingham",
        stage: "discover",
        stageUpdatedAt: "3 hours ago",
      },
      {
        id: "2",
        businessName: "Beta Services",
        location: "Manchester",
        stage: "qualify",
        stageUpdatedAt: "1 day ago",
        nextAction: "Review",
      },
      {
        id: "2b",
        businessName: "Capital FM",
        location: "London",
        stage: "qualify",
        stageUpdatedAt: "Yesterday",
        nextAction: "Review",
      },
      {
        id: "2c",
        businessName: "Nexus Group",
        location: "Bristol",
        stage: "qualify",
        stageUpdatedAt: "2 days ago",
        nextAction: "Review",
      },
      {
        id: "3",
        businessName: "John's Movers",
        location: "London",
        stage: "enrich",
        stageUpdatedAt: "Yesterday",
        nextAction: "Email",
      },
      {
        id: "3b",
        businessName: "Sarah M Group",
        location: "Edinburgh",
        stage: "enrich",
        stageUpdatedAt: "6 hours ago",
        nextAction: "Email",
      },
      {
        id: "4",
        businessName: "Tower Management",
        location: "Birmingham",
        stage: "sent",
        stageUpdatedAt: "6 hours ago",
        nextAction: "Monitor",
      },
      {
        id: "4b",
        businessName: "New FM",
        location: "Leeds",
        stage: "sent",
        stageUpdatedAt: "2 days ago",
        nextAction: "Monitor",
      },
      {
        id: "4c",
        businessName: "Metro Services",
        location: "Bristol",
        stage: "sent",
        stageUpdatedAt: "3 hours ago",
        nextAction: "Monitor",
      },
      {
        id: "5",
        businessName: "Smith & Co",
        location: "Bristol",
        stage: "replied",
        stageUpdatedAt: "2 hours ago",
        nextAction: "Follow up",
      },
      {
        id: "5b",
        businessName: "ABC Corp",
        location: "London",
        stage: "replied",
        stageUpdatedAt: "1 day ago",
        nextAction: "Follow up",
      },
      {
        id: "6",
        businessName: "XYZ Inc",
        location: "Manchester",
        stage: "converted",
        stageUpdatedAt: "Yesterday",
      },
    ];

    setProspects(sampleProspects);
    setLoading(false);
  }, []);

  const stages = [
    { key: "discover", label: "Discovered" },
    { key: "qualify", label: "Qualified" },
    { key: "enrich", label: "Emailed" },
    { key: "sent", label: "Sent" },
    { key: "replied", label: "Replied" },
    { key: "converted", label: "Won" },
  ];

  const getProspectsForStage = (stage: string) => {
    return prospects.filter((p) => p.stage === stage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-[#666666]">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-32 pb-12">
      <div className="px-6 md:px-12">
        {/* Premium Header - Matches Today Page */}
        <div className="mb-16">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Pipeline Board
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Complete prospect journey across all stages
          </p>
        </div>

        {/* Compact One-Screen Board - No Scroll */}
        <div className="w-full">
          <div className="grid grid-cols-6 gap-3">
            {stages.map((stage) => {
              const stageProspects = getProspectsForStage(stage.key);
              const topProspects = stageProspects.slice(0, 2);

              return (
                <div key={stage.key} className="flex flex-col">
                  {/* Stage Header - Premium Typography */}
                  <div className="mb-4 pb-3 border-b-2 border-[#E8E8E8]">
                    <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] leading-tight">
                      {stage.label}
                    </p>
                    <p className="text-2xl font-black text-[#0D0D0D] mt-2 leading-none">
                      {stageProspects.length}
                    </p>
                  </div>

                  {/* Prospect Cards - Compact, Premium */}
                  <div className="space-y-2 flex-1">
                    {topProspects.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-[11px] text-[#CCCCCC] font-medium">
                          —
                        </p>
                      </div>
                    ) : (
                      topProspects.map((prospect) => (
                        <Link
                          key={prospect.id}
                          href={`/operator/understand?id=${prospect.id}`}
                        >
                          <div className="p-2.5 bg-white border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:shadow-sm transition-all cursor-pointer group">
                            <p className="text-xs font-semibold text-[#0D0D0D] truncate group-hover:text-[#0D0D0D] line-clamp-1">
                              {prospect.businessName}
                            </p>
                            <p className="text-[10px] text-[#999999] mt-0.5 truncate">
                              {prospect.location}
                            </p>
                            <p className="text-[9px] text-[#CCCCCC] mt-1">
                              {prospect.stageUpdatedAt}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}

                    {/* Show +N if more than 2 */}
                    {stageProspects.length > 2 && (
                      <div className="pt-1 mt-1 border-t border-[#E8E8E8]">
                        <button
                          onClick={() => {
                            // Could open modal or navigate with stage filter
                            window.location.href = `/operator/understand?stage=${stage.key}`;
                          }}
                          className="text-[10px] font-semibold text-[#0D0D0D] hover:text-[#0D0D0D] underline"
                        >
                          +{stageProspects.length - 2} more
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend / Guidance - Premium & Minimal */}
        <div className="mt-12 pt-8 border-t border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.1em] mb-4">
            How to use
          </p>
          <ul className="space-y-2 text-xs text-[#666666]">
            <li>• <span className="font-semibold text-[#0D0D0D]">Click any prospect</span> to review or take action</li>
            <li>• <span className="font-semibold text-[#0D0D0D]">Click +N more</span> to see all prospects in a stage</li>
            <li>• <span className="font-semibold text-[#0D0D0D]">Watch the flow</span> — prospects move left to right as they progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
