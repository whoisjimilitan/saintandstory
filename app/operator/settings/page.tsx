"use client";

import { useState } from "react";
import { getTier1Businesses, getTier2Businesses } from "@/lib/business-pain-promise-map";

interface TierConfig {
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  categories: string[];
  enabled: boolean;
  priority: number;
}

const TIER_DESCRIPTIONS = {
  1: "Legal, Medical, Compliance — Highest consequence (case dismissed, patient harmed, regulatory fines)",
  2: "Premium & High-Value — Financial impact ($10k+ crew costs, lost deals, irreplaceable samples)",
  3: "Operational — Standard deadlines (retail, hospitality, construction, real estate)",
};

export default function SettingsPage() {
  const tier1Categories = getTier1Businesses();
  const tier2Categories = getTier2Businesses();
  const tier3Categories = ["estate_agent", "realtor", "lettings", "accounting_firm", "tax_service", "architecture_firm", "construction_company", "florist", "event_planning", "retail", "hospitality", "restaurant", "cafe"];

  const [configs, setConfigs] = useState<TierConfig[]>([
    {
      tier: 1,
      name: "Tier 1: Ultra-Motivated",
      description: TIER_DESCRIPTIONS[1],
      categories: tier1Categories,
      enabled: true,
      priority: 1,
    },
    {
      tier: 2,
      name: "Tier 2: Highly-Motivated",
      description: TIER_DESCRIPTIONS[2],
      categories: tier2Categories,
      enabled: true,
      priority: 2,
    },
    {
      tier: 3,
      name: "Tier 3: Operational",
      description: TIER_DESCRIPTIONS[3],
      categories: tier3Categories,
      enabled: false,
      priority: 3,
    },
  ]);

  const handleToggleTier = (tier: 1 | 2 | 3) => {
    setConfigs(configs.map((c) => (c.tier === tier ? { ...c, enabled: !c.enabled } : c)));
  };

  const handleChangePriority = (tier: 1 | 2 | 3, priority: number) => {
    setConfigs(configs.map((c) => (c.tier === tier ? { ...c, priority } : c)));
  };

  const enabledTiers = configs.filter((c) => c.enabled);
  const totalCategories = enabledTiers.reduce((sum, c) => sum + c.categories.length, 0);

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Discovery Tiers
          </h1>
          <p className="text-sm text-[#666666] max-w-2xl font-normal">
            Enable tiers to search. Autonomous discovery finds prospects only within enabled tiers.
          </p>
        </div>

        {/* Summary */}
        {enabledTiers.length > 0 && (
          <div className="mb-8 p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
            <p className="text-xs text-[#0D0D0D] font-semibold">
              {enabledTiers.length} tier{enabledTiers.length !== 1 ? "s" : ""} enabled •{" "}
              <span className="text-[#666666]">{totalCategories} categories total</span>
            </p>
          </div>
        )}

        {/* Tier Cards */}
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.tier}
              className={`border rounded-lg p-6 transition-all ${
                config.enabled ? "border-[#0D0D0D] bg-white" : "border-[#E8E8E8] bg-[#F9F9F9]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">{config.name}</p>
                  <p className="text-xs text-[#666666] mt-1">{config.description}</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer ml-4 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => handleToggleTier(config.tier)}
                    className="w-4 h-4 accent-[#0D0D0D]"
                  />
                  <span className="text-xs font-semibold text-[#0D0D0D]">
                    {config.enabled ? "On" : "Off"}
                  </span>
                </label>
              </div>

              {/* Category Count */}
              <p className="text-xs text-[#888888] mb-4">
                {config.categories.length} categories: {config.categories.slice(0, 3).join(", ")}
                {config.categories.length > 3 ? "..." : ""}
              </p>

              {/* Priority */}
              {config.enabled && (
                <div className="flex items-center gap-3 pt-3 border-t border-[#E8E8E8]">
                  <label className="text-xs font-semibold text-[#0D0D0D]">Priority:</label>
                  <select
                    value={config.priority}
                    onChange={(e) => handleChangePriority(config.tier, parseInt(e.target.value))}
                    className="px-2 py-1 text-xs border border-[#E8E8E8] rounded text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
                  >
                    {[1, 2, 3].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 p-4 bg-[#F9F9F9] border border-[#E8E8E8] rounded-lg">
          <p className="text-xs text-[#666666] leading-relaxed">
            <span className="font-semibold text-[#0D0D0D]">How it works:</span> Autonomous discovery only searches enabled tiers. Higher priority tiers are processed first. Each tier contains pre-qualified categories with matching email psychology.
          </p>
        </div>
      </div>
    </div>
  );
}
