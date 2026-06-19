"use client";

import { useIntelligence } from "../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  EmptyState,
} from "../components";

export default function RevenuePage() {
  const { data: revenue, loading } = useIntelligence({
    resource: "revenue",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <MetadataLabel className="mb-1">Intelligence</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Revenue
        </h1>
        <p className="text-sm text-[#888888] mt-2">
          Patterns that correlate to revenue
        </p>
      </div>

      <Section>
        {loading ? (
          <p className="text-[#888888] text-sm">Loading revenue data...</p>
        ) : Array.isArray(revenue) && revenue.length > 0 ? (
          <div className="space-y-3">
            {revenue.map((pattern: any) => (
              <Card
                key={pattern.id}
                className="p-6 cursor-pointer hover:border-[#0D0D0D] transition-colors"
              >
                <div className="space-y-2">
                  <p className="font-medium text-[#0D0D0D]">
                    {pattern.pattern || "Pattern"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {pattern.revenue !== undefined && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
                          Revenue
                        </p>
                        <p className="text-[#0D0D0D] font-medium mt-1">
                          £{pattern.revenue.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {pattern.roi !== undefined && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
                          ROI
                        </p>
                        <p className="text-[#0D0D0D] font-medium mt-1">
                          {pattern.roi}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No revenue data yet"
            description="Revenue patterns will appear as the system learns correlations"
          />
        )}
      </Section>
    </div>
  );
}
