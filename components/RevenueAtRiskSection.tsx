"use client";

import Link from "next/link";

interface AtRiskLead {
  id: string;
  business_name: string;
  category: string | null;
  blocked_outcome: string;
  fit_score: number;
  status: string;
  source: string;
}

interface RevenueAtRiskSectionProps {
  leads: AtRiskLead[];
}

export default function RevenueAtRiskSection({ leads }: RevenueAtRiskSectionProps) {
  if (!leads || leads.length === 0) {
    return null;
  }

  return (
    <div className="mb-16">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        Validated Opportunities
      </p>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Link key={lead.id} href={`/dashboard/admin/b2b/lead/${lead.id}`}>
            <div className="border border-[#E8E8E8] rounded px-6 py-4 bg-white hover:bg-[#FAFAFA] hover:border-[#D0D0D0] transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-[#0D0D0D] text-sm mb-1">
                    {lead.business_name}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {lead.blocked_outcome}
                  </p>
                </div>
                <div className="text-right">
                  <div className="bg-[#FFF5E6] text-[#CC6600] font-semibold text-sm px-3 py-1 rounded">
                    {lead.fit_score}
                  </div>
                  {lead.status === "not_contacted" && (
                    <p className="text-xs text-[#888888] mt-1">Ready for outreach</p>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
