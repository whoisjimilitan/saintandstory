"use client";

import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { getTier1Businesses, getTier2Businesses, getTier3Businesses } from "@/lib/business-pain-promise-map";

interface TierConfig {
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  categories: string[];
  enabled: boolean;
  priority: number;
}

const TIER_DESCRIPTIONS = {
  1: "Legal, Medical, Compliance",
  2: "Premium & High-Value",
  3: "Operational & Standard",
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const tier1Categories = getTier1Businesses();
  const tier2Categories = getTier2Businesses();
  const tier3Categories = getTier3Businesses();

  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<any>(null);

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

  const handleStartDiscovery = async () => {
    setDiscoveryRunning(true);
    setDiscoveryResult(null);

    try {
      const res = await fetch("/api/operator/trigger-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tiers: configs }),
      });

      const data = await res.json();

      if (res.ok) {
        setDiscoveryResult(data);
        showToast({
          title: "Discovery Started",
          description: `Found ${data.leadsFound} leads across ${data.tiersProcessed} tiers.`,
          type: "success",
        });
      } else {
        showToast({
          title: "Discovery Failed",
          description: data.error || "Failed to start discovery",
          type: "error",
        });
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start discovery",
        type: "error",
      });
    } finally {
      setDiscoveryRunning(false);
    }
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
          <p className="text-xs text-[#666666]">
            Enable tiers. Searches only enabled tiers.
          </p>
        </div>

        {/* Summary */}
        {enabledTiers.length > 0 && (
          <div className="mb-6 p-3 bg-[#F9F9F9] border border-[#E8E8E8] rounded text-xs text-[#0D0D0D]">
            {enabledTiers.length} tier{enabledTiers.length !== 1 ? "s" : ""} • {totalCategories} categories
          </div>
        )}

        {/* Tier Cards */}
        <div className="space-y-3">
          {configs.map((config) => (
            <div
              key={config.tier}
              className={`border rounded p-4 transition-all ${
                config.enabled ? "border-[#0D0D0D] bg-white" : "border-[#E8E8E8] bg-[#F9F9F9]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#0D0D0D]">{config.name}</p>
                  <p className="text-xs text-[#888888] mt-0.5">{config.description} • {config.categories.length} categories</p>
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

              {config.enabled && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E8E8E8]">
                  <label className="text-xs font-semibold text-[#0D0D0D]">Priority:</label>
                  <select
                    value={config.priority}
                    onChange={(e) => handleChangePriority(config.tier, parseInt(e.target.value))}
                    className="w-12 px-2 py-1 text-xs border border-[#E8E8E8] rounded text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
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

        {/* Start Discovery Button */}
        <div className="mt-8 pt-8 border-t border-[#E8E8E8]">
          <button
            onClick={handleStartDiscovery}
            disabled={discoveryRunning || enabledTiers.length === 0}
            className={`px-6 py-2.5 font-semibold rounded text-white text-sm transition-all ${
              discoveryRunning || enabledTiers.length === 0
                ? "bg-[#CCCCCC] cursor-not-allowed"
                : "bg-[#0D0D0D] hover:bg-[#333333]"
            }`}
          >
            {discoveryRunning ? "Running..." : "Start Discovery"}
          </button>
          <p className="text-xs text-[#888888] mt-2">
            {enabledTiers.length === 0
              ? "Enable at least one tier"
              : "Searches enabled tiers. 2-5 min."}
          </p>
        </div>

        {/* Discovery Results */}
        {discoveryResult && (
          <div className="mt-6 p-4 bg-[#F0F9FF] border border-[#B3E5FC] rounded text-xs text-[#0D0D0D]">
            <p className="font-semibold mb-2">✅ Found {discoveryResult.leadsFound} leads</p>
            <p className="text-[#666666]">{discoveryResult.leadsTotal} total in database • {discoveryResult.tiersProcessed} tiers processed</p>
          </div>
        )}
      </div>
    </div>
  );
}
