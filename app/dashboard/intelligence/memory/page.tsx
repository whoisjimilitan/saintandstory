"use client";

import { useIntelligence } from "../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  EmptyState,
} from "../components";

export default function MemoryPage() {
  const { data: memory, loading } = useIntelligence({
    resource: "memory",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <MetadataLabel className="mb-1">Intelligence</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Memory
        </h1>
        <p className="text-sm text-[#888888] mt-2">
          Learned patterns and what works
        </p>
      </div>

      <Section>
        {loading ? (
          <p className="text-[#888888] text-sm">Loading memory...</p>
        ) : Array.isArray(memory) && memory.length > 0 ? (
          <div className="space-y-3">
            {memory.map((pattern: any) => (
              <Card
                key={pattern.id}
                className="p-6 cursor-pointer hover:border-[#0D0D0D] transition-colors"
              >
                <div className="space-y-2">
                  <p className="font-medium text-[#0D0D0D]">
                    {pattern.pattern || "Pattern"}
                  </p>
                  {pattern.frequency !== undefined && (
                    <p className="text-[#888888] text-sm">
                      Frequency: {pattern.frequency} occurrences
                    </p>
                  )}
                  {pattern.lastSeen && (
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mt-3">
                      Last seen: {pattern.lastSeen}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No memory patterns yet"
            description="The system will remember patterns as it learns"
          />
        )}
      </Section>
    </div>
  );
}
