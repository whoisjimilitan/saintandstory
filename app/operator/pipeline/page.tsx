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

const stageColors = {
  discover: "border-l-[#999999]",
  qualify: "border-l-[#6B9FD1]",
  enrich: "border-l-[#9B7BAC]",
  sent: "border-l-[#D4A574]",
  replied: "border-l-[#E89B5D]",
  converted: "border-l-[#6DB575]",
};

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
        stageUpdatedAt: "2h ago",
      },
      {
        id: "1b",
        businessName: "Prime Services",
        location: "Manchester",
        stage: "discover",
        stageUpdatedAt: "1d ago",
      },
      {
        id: "1c",
        businessName: "Metro FM",
        location: "Birmingham",
        stage: "discover",
        stageUpdatedAt: "3h ago",
      },
      {
        id: "2",
        businessName: "Beta Services",
        location: "Manchester",
        stage: "qualify",
        stageUpdatedAt: "1d ago",
      },
      {
        id: "2b",
        businessName: "Capital FM",
        location: "London",
        stage: "qualify",
        stageUpdatedAt: "Yesterday",
      },
      {
        id: "2c",
        businessName: "Nexus Group",
        location: "Bristol",
        stage: "qualify",
        stageUpdatedAt: "2d ago",
      },
      {
        id: "3",
        businessName: "John's Movers",
        location: "London",
        stage: "enrich",
        stageUpdatedAt: "Yesterday",
      },
      {
        id: "3b",
        businessName: "Sarah M Group",
        location: "Edinburgh",
        stage: "enrich",
        stageUpdatedAt: "6h ago",
      },
      {
        id: "4",
        businessName: "Tower Management",
        location: "Birmingham",
        stage: "sent",
        stageUpdatedAt: "6h ago",
      },
      {
        id: "4b",
        businessName: "New FM",
        location: "Leeds",
        stage: "sent",
        stageUpdatedAt: "2d ago",
      },
      {
        id: "4c",
        businessName: "Metro Services",
        location: "Bristol",
        stage: "sent",
        stageUpdatedAt: "3h ago",
      },
      {
        id: "5",
        businessName: "Smith & Co",
        location: "Bristol",
        stage: "replied",
        stageUpdatedAt: "2h ago",
      },
      {
        id: "5b",
        businessName: "ABC Corp",
        location: "London",
        stage: "replied",
        stageUpdatedAt: "1d ago",
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
          <p className="text-sm text-[#666666]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-8 lg:px-12">
        {/* Header - Matches Today page style */}
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Pipeline Board
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Complete prospect journey
          </p>
        </div>

        {/* Compact Board - Responsive Grid */}
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stages.map((stage) => {
              const stageProspects = getProspectsForStage(stage.key);
              const topProspects = stageProspects.slice(0, 2);
              const colorClass = stageColors[stage.key as keyof typeof stageColors];

              return (
                <div
                  key={stage.key}
                  className={`flex flex-col border-l-4 ${colorClass} bg-white border-r border-b border-t border-[#E8E8E8] rounded-r-lg p-4 hover:shadow-sm transition-shadow`}
                >
                  {/* Stage Header */}
                  <div className="mb-3 pb-3 border-b border-[#E8E8E8]">
                    <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.08em]">
                      {stage.label}
                    </p>
                    <p className="text-xl font-black text-[#0D0D0D] mt-1 leading-none">
                      {stageProspects.length}
                    </p>
                  </div>

                  {/* Prospects - Compact */}
                  <div className="space-y-2 flex-1">
                    {topProspects.length === 0 ? (
                      <p className="text-xs text-[#CCCCCC]">—</p>
                    ) : (
                      topProspects.map((prospect) => (
                        <Link
                          key={prospect.id}
                          href={`/operator/understand?id=${prospect.id}`}
                        >
                          <div className="p-2 bg-[#F9F9F9] border border-[#E8E8E8] rounded hover:border-[#0D0D0D] hover:bg-white transition-all cursor-pointer group">
                            <p className="text-xs font-semibold text-[#0D0D0D] truncate">
                              {prospect.businessName}
                            </p>
                            <p className="text-[10px] text-[#999999] truncate mt-0.5">
                              {prospect.location}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}

                    {/* More indicator */}
                    {stageProspects.length > 2 && (
                      <button
                        onClick={() => {
                          window.location.href = `/operator/understand?stage=${stage.key}`;
                        }}
                        className="text-[10px] font-semibold text-[#0D0D0D] hover:underline mt-1"
                      >
                        +{stageProspects.length - 2}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
