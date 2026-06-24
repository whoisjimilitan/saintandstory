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
        id: "2",
        businessName: "Beta Services",
        location: "Manchester",
        stage: "qualify",
        stageUpdatedAt: "1 day ago",
        nextAction: "Review and qualify",
      },
      {
        id: "3",
        businessName: "Capital FM",
        location: "London",
        stage: "enrich",
        stageUpdatedAt: "Yesterday",
        nextAction: "Draft email",
      },
      {
        id: "4",
        businessName: "Tower Management",
        location: "Birmingham",
        stage: "sent",
        stageUpdatedAt: "6 hours ago",
        nextAction: "Monitor for replies",
      },
      {
        id: "5",
        businessName: "Smith & Co",
        location: "Bristol",
        stage: "replied",
        stageUpdatedAt: "2 hours ago",
        nextAction: "Follow up with proposal",
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
    { key: "converted", label: "Converted" },
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
    <div className="min-h-screen bg-white pt-32">
      <div className="px-4 md:px-12 py-12">
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Pipeline Board
          </p>
          <p className="text-sm text-[#888888] mt-1">
            Track all prospects through their journey
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-8">
            {stages.map((stage) => {
              const stageProspects = getProspectsForStage(stage.key);
              return (
                <div
                  key={stage.key}
                  className="flex flex-col w-72 flex-shrink-0"
                >
                  <div className="mb-4 pb-3 border-b border-[#E8E8E8]">
                    <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
                      {stage.label}
                    </p>
                    <p className="text-2xl font-black text-[#0D0D0D] mt-2">
                      {stageProspects.length}
                    </p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {stageProspects.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-[#AAAAAA]">No prospects</p>
                      </div>
                    ) : (
                      stageProspects.map((prospect) => (
                        <Link
                          key={prospect.id}
                          href={`/operator/understand?id=${prospect.id}`}
                        >
                          <div className="p-3 bg-white border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:shadow-sm transition-all cursor-pointer">
                            <p className="text-sm font-semibold text-[#0D0D0D] truncate">
                              {prospect.businessName}
                            </p>
                            <p className="text-xs text-[#888888] mt-1">
                              {prospect.location}
                            </p>
                            <p className="text-[10px] text-[#AAAAAA] mt-2">
                              {prospect.stageUpdatedAt}
                            </p>
                            {prospect.nextAction && (
                              <div className="mt-2 pt-2 border-t border-[#E8E8E8]">
                                <p className="text-xs font-semibold text-[#0D0D0D]">
                                  {prospect.nextAction}
                                </p>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))
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
