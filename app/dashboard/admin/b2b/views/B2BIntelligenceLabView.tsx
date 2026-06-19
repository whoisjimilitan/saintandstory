"use client";

import { B2bAutopilotPanel } from "@/app/components/B2bAutopilotPanel";
import { B2bBehaviorInsights } from "@/app/components/B2bBehaviorInsights";
import { B2bMemoryPanel } from "@/app/components/B2bMemoryPanel";
import { B2bRevenueIntelligence } from "@/app/components/B2bRevenueIntelligence";
import { B2bSystemObservability } from "@/app/components/B2bSystemObservability";

export function B2BIntelligenceLabView() {
  return (
    <div className="flex-1 p-6 space-y-6 bg-[#FAFAFA]">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">
          B2B Intelligence Lab
        </h1>
        <p className="text-sm text-gray-500">
          Autonomous intelligence system (live production engine)
        </p>
      </div>

      {/* CORE INTELLIGENCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SYSTEM AUTOPILOT */}
        <div className="bg-white rounded-xl border border-gray-200">
          <B2bAutopilotPanel />
        </div>

        {/* BEHAVIOR INTELLIGENCE */}
        <div className="bg-white rounded-xl border border-gray-200">
          <B2bBehaviorInsights />
        </div>

        {/* MEMORY LAYER */}
        <div className="bg-white rounded-xl border border-gray-200">
          <B2bMemoryPanel />
        </div>

        {/* REVENUE INTELLIGENCE */}
        <div className="bg-white rounded-xl border border-gray-200">
          <B2bRevenueIntelligence />
        </div>

        {/* SYSTEM OBSERVABILITY (full width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <B2bSystemObservability />
        </div>

      </div>
    </div>
  );
}
