"use client";

import { useIntelligence } from "../hooks/useIntelligence";
import {
  MetadataLabel,
  Section,
  Card,
  InsightCard,
  EmptyState,
} from "../components";

export default function ObservabilityPage() {
  const { data: health, loading } = useIntelligence({
    resource: "observability",
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div>
        <MetadataLabel className="mb-1">Intelligence</MetadataLabel>
        <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight">
          Observability
        </h1>
        <p className="text-sm text-[#888888] mt-2">
          System health and status
        </p>
      </div>

      <Section title="System Status">
        {loading ? (
          <p className="text-[#888888] text-sm">Loading system status...</p>
        ) : health ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InsightCard
              title="Status"
              value={(health as any).status === "online" ? "Online" : "Offline"}
              variant={
                (health as any).status === "online" ? "highlight" : "default"
              }
            />
            {(health as any).lastCheck && (
              <InsightCard
                title="Last Check"
                value={(health as any).lastCheck}
              />
            )}
            {(health as any).activeAlerts !== undefined && (
              <InsightCard
                title="Active Alerts"
                value={(health as any).activeAlerts}
                variant={
                  (health as any).activeAlerts > 0 ? "critical" : "default"
                }
              />
            )}
          </div>
        ) : (
          <EmptyState
            title="No system data"
            description="System status will appear here"
          />
        )}
      </Section>
    </div>
  );
}
