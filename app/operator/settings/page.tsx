"use client";

import { useState } from "react";

interface DiscoveryConfig {
  id: string;
  niche: string;
  locations: string[];
  enabled: boolean;
  priority: number;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<DiscoveryConfig[]>([
    {
      id: "1",
      niche: "Facilities Management",
      locations: ["London", "Manchester", "Birmingham"],
      enabled: true,
      priority: 1,
    },
  ]);

  const [newNiche, setNewNiche] = useState("");
  const [newLocations, setNewLocations] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [newEnabled, setNewEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleAddConfig = async () => {
    if (!newNiche.trim() || !newLocations.trim()) {
      alert("Please fill in both fields");
      return;
    }

    setSaving(true);
    try {
      const locations = newLocations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc);

      const newConfig: DiscoveryConfig = {
        id: Math.random().toString(),
        niche: newNiche.trim(),
        locations,
        enabled: newEnabled,
        priority: newPriority,
      };

      setConfigs([newConfig, ...configs]);
      setNewNiche("");
      setNewLocations("");
      setNewPriority(1);
      setNewEnabled(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = (id: string) => {
    setConfigs(configs.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-white pt-16 pb-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-[#0D0D0D] mb-2 tracking-tight leading-tight">
            Auto Discovery
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed max-w-2xl font-normal">
            Configure discovery settings and manage automated discovery campaigns.
          </p>
        </div>

        {/* Active Configurations */}
        {configs.length > 0 && (
          <div className="mb-12">
            <div className="space-y-3">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:border-[#0D0D0D] hover:shadow-sm transition-all"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D0D0D]">
                      {config.niche}
                    </p>
                    <p className="text-xs text-[#888888] mt-1">
                      {config.locations.join(", ")}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#999999]">
                      <span>{config.enabled ? "On" : "Off"}</span>
                      <span>•</span>
                      <span>Priority {config.priority}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-xs font-semibold text-[#0D0D0D] hover:text-[#333333] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-[#E8E8E8]"></div>
          </div>
        )}

        {/* Add Configuration - Minimal Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">
              Business Type
            </label>
            <input
              type="text"
              value={newNiche}
              onChange={(e) => setNewNiche(e.target.value)}
              placeholder="e.g., Facilities Management"
              className="w-full px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#CCCCCC] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">
              Locations
            </label>
            <input
              type="text"
              value={newLocations}
              onChange={(e) => setNewLocations(e.target.value)}
              placeholder="e.g., London, Manchester, Birmingham"
              className="w-full px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#CCCCCC] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">
                Priority
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={newPriority}
                onChange={(e) => setNewPriority(parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 text-sm text-[#0D0D0D] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newEnabled}
                  onChange={(e) => setNewEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0D0D0D]"
                />
                <span className="text-xs font-semibold text-[#0D0D0D]">
                  Enable
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-[#E8E8E8]">
            <button
              onClick={handleAddConfig}
              disabled={saving}
              className="px-4 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
