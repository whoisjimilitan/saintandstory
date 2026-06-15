"use client";

import Link from "next/link";

interface WorkItem {
  id: string;
  business_name: string;
  category: string | null;
  status: string;
  blocked_outcome: string;
  fit_score: number;
  urgency: string;
  source: string;
}

interface TodaysWorkSectionProps {
  items: WorkItem[];
}

export default function TodaysWorkSection({ items }: TodaysWorkSectionProps) {
  if (!items || items.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight mb-8">
          Today's Work.
        </h2>
        <p className="text-sm text-[#666666] italic">
          No active conversations. Awaiting outreach responses.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="font-sans font-black text-[#0D0D0D] text-2xl tracking-tight mb-8">
        Today's Work.
      </h2>

      <div className="space-y-4">
        {items.map((item) => (
          <Link key={item.id} href={`/dashboard/admin/b2b/conversation/${item.id}`}>
            <div className="border border-[#E8E8E8] rounded px-6 py-4 bg-white hover:bg-[#FAFAFA] hover:border-[#D0D0D0] transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-[#0D0D0D] text-sm mb-1">
                    {item.business_name}
                  </p>
                  <p className="text-xs text-[#666666] mb-2">
                    {item.blocked_outcome || "Outcome unknown"}
                  </p>
                  <div className="flex gap-2 items-center">
                    {item.category && (
                      <span className="text-xs text-[#888888] bg-[#F5F5F5] px-2 py-1 rounded">
                        {item.category}
                      </span>
                    )}
                    {item.fit_score && (
                      <span className="text-xs font-semibold text-[#0D0D0D]">
                        Fit: {item.fit_score}/100
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getUrgencyBadge(item.urgency)}`}>
                    {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getUrgencyBadge(urgency: string): string {
  switch (urgency) {
    case "high":
      return "bg-[#FFF5E6] text-[#CC6600]";
    case "medium":
      return "bg-[#F0F0F0] text-[#0D0D0D]";
    default:
      return "bg-[#F5F5F5] text-[#888888]";
  }
}
