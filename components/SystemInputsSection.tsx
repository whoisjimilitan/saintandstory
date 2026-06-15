"use client";

interface SystemInput {
  total_leads: number;
  qualified_for_outreach: number;
  commercial_fit: number;
  conversations_active: number;
  jobs_created: number;
  discovery_sources: Array<{
    type: string;
    count_7_days: number;
  }>;
}

interface SystemInputsSectionProps {
  data: SystemInput;
}

export default function SystemInputsSection({ data }: SystemInputsSectionProps) {
  if (!data) {
    return null;
  }

  return (
    <div className="pt-12 border-t border-[#E8E8E8]">
      <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
        System Inputs
      </p>

      {/* Pipeline Health */}
      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="border border-[#E8E8E8] rounded px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-2">
            Total in Pipeline
          </p>
          <p className="text-3xl font-black text-[#0D0D0D]">
            {data.total_leads}
          </p>
        </div>

        <div className="border border-[#E8E8E8] rounded px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-2">
            Ready for Outreach
          </p>
          <p className="text-3xl font-black text-[#0D0D0D]">
            {data.qualified_for_outreach}
          </p>
        </div>

        <div className="border border-[#E8E8E8] rounded px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-2">
            Commercial Fit
          </p>
          <p className="text-3xl font-black text-[#0D0D0D]">
            {data.commercial_fit}
          </p>
        </div>
      </div>

      {/* Discovery Sources */}
      {data.discovery_sources && data.discovery_sources.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888888] mb-4">
            Discovery Sources (Last 7 Days)
          </p>
          <div className="grid grid-cols-2 gap-4 text-[10px] text-[#888888]">
            {data.discovery_sources.map((source) => (
              <div key={source.type} className="border border-[#E8E8E8] rounded px-4 py-2">
                <p className="capitalize">
                  {source.type.replace(/_/g, " ")}: <span className="font-semibold text-[#0D0D0D]">{source.count_7_days}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
