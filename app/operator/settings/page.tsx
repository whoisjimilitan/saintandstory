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
  1: "Legal, Medical, Compliance — Highest consequence (case dismissed, patient harmed, regulatory fines)",
  2: "Premium & High-Value — Financial impact ($10k+ crew costs, lost deals, irreplaceable samples)",
  3: "Operational — Standard deadlines (retail, hospitality, construction, real estate)",
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

        {/* Start Discovery Button */}
        <div className="mt-8 pt-8 border-t border-[#E8E8E8]">
          <button
            onClick={handleStartDiscovery}
            disabled={discoveryRunning || enabledTiers.length === 0}
            className={`px-6 py-3 font-semibold rounded text-white text-sm transition-all ${
              discoveryRunning || enabledTiers.length === 0
                ? "bg-[#CCCCCC] cursor-not-allowed"
                : "bg-[#0D0D0D] hover:bg-[#333333]"
            }`}
          >
            {discoveryRunning ? "🔄 Discovery Running..." : "Start Discovery Now"}
          </button>
          <p className="text-xs text-[#888888] mt-2">
            {enabledTiers.length === 0
              ? "Enable at least one tier to start discovery"
              : "Searches all enabled tiers across UK cities. Takes 2-5 minutes."}
          </p>
        </div>

        {/* Discovery Results */}
        {discoveryResult && (
          <div className="mt-8 p-6 bg-[#F0F9FF] border border-[#B3E5FC] rounded-lg">
            <p className="text-sm font-semibold text-[#0D0D0D] mb-3">✅ Discovery Complete</p>
            <div className="space-y-2 text-xs text-[#666666]">
              <p>
                <span className="font-semibold">{discoveryResult.leadsFound}</span> leads found
              </p>
              <p>
                <span className="font-semibold">{discoveryResult.tiersProcessed}</span> tiers processed
              </p>
              <p>
                <span className="font-semibold">{discoveryResult.leadsTotal}</span> total leads in database
              </p>
              <p className="text-[#999999] mt-3">
                Results will appear on the TODAY page within 30 seconds.
              </p>
            </div>
          </div>
        )}

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
