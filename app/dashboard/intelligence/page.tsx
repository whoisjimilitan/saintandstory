"use client";

import { useIntelligence } from "./hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  EmptyState,
} from "./components";

export default function IntelligencePage() {
  const { data: conversations, loading: conversationsLoading } = useIntelligence({
    resource: "conversation",
    limit: 5,
  });

  const { data: signals, loading: signalsLoading } = useIntelligence({
    resource: "signal",
  });

  const { data: observability, loading: observabilityLoading } = useIntelligence({
    resource: "observability",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* HEADER */}
      <div>
        <MetadataLabel className="mb-1">Welcome</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Intelligence Home
        </h1>
      </div>

      {/* SYSTEM STATUS */}
      {!observabilityLoading && observability && (
        <Section
          title="System Status"
          description="Live system health"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3 w-3 rounded-full bg-[#10b981] animate-pulse" />
                <div>
                  <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
                    Status
                  </p>
                  <p className="font-medium text-[#0D0D0D]">Online</p>
                </div>
              </div>
            </Card>
          </div>
        </Section>
      )}

      {/* RECENT CONVERSATIONS */}
      <Section
        title="Recent Conversations"
        description="Latest activity in your workspace"
      >
        {conversationsLoading ? (
          <p className="text-[#888888] text-sm">Loading conversations...</p>
        ) : conversations ? (
          <div className="space-y-3">
            {/* Placeholder for conversation list */}
            <EmptyState
              title="No conversations yet"
              description="Your recent conversations will appear here"
            />
          </div>
        ) : null}
      </Section>

      {/* ACTIVE SIGNALS */}
      <Section
        title="Active Signals"
        description="Patterns and insights that need attention"
      >
        {signalsLoading ? (
          <p className="text-[#888888] text-sm">Loading signals...</p>
        ) : signals ? (
          <div className="space-y-3">
            {/* Placeholder for signals */}
            <EmptyState
              title="No active signals"
              description="Signals will appear here when patterns are detected"
            />
          </div>
        ) : null}
      </Section>

      {/* QUICK ACTIONS */}
      <Section title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 cursor-pointer hover:border-[#0D0D0D] transition-colors">
            <p className="font-medium text-[#0D0D0D]">Start a conversation</p>
            <p className="text-[#888888] text-sm mt-1">Explore new opportunities</p>
          </Card>
          <Card className="p-6 cursor-pointer hover:border-[#0D0D0D] transition-colors">
            <p className="font-medium text-[#0D0D0D]">Review signals</p>
            <p className="text-[#888888] text-sm mt-1">Analyze detected patterns</p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
