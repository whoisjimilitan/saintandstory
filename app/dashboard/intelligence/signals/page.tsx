"use client";

import { useIntelligence } from "../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  EmptyState,
} from "../components";

export default function SignalsPage() {
  const { data: signals, loading } = useIntelligence({
    resource: "signal",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <MetadataLabel className="mb-1">Intelligence</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Signals
        </h1>
        <p className="text-sm text-[#888888] mt-2">
          Patterns and insights that need attention
        </p>
      </div>

      <Section>
        {loading ? (
          <p className="text-[#888888] text-sm">Loading signals...</p>
        ) : Array.isArray(signals) && signals.length > 0 ? (
          <div className="space-y-3">
            {signals.map((signal: any) => (
              <Card
                key={signal.id}
                className="p-6 cursor-pointer hover:border-[#0D0D0D] transition-colors"
              >
                <div className="space-y-2">
                  <p className="font-medium text-[#0D0D0D]">
                    {signal.type || "Signal"}
                  </p>
                  <p className="text-[#888888] text-sm">
                    {signal.description || "—"}
                  </p>
                  {signal.confidence !== undefined && (
                    <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mt-3">
                      Confidence: {Math.round(signal.confidence)}%
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active signals"
            description="Signals will appear here when patterns are detected"
          />
        )}
      </Section>
    </div>
  );
}
