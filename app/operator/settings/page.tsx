"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DiscoveryConfig {
  id: string;
  niche: string;
  locations: string[];
  enabled: boolean;
  priority: number;
}

export default function SettingsPage() {
  const router = useRouter();
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

      // In production, this would POST to /api/operator/discovery-config
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
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-12">
        {/* Header */}
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Autonomous Discovery
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Configure what prospects we find and when
          </p>
        </div>

        {/* Purpose Section - Minimal, Clear */}
        <div className="mb-16 pb-8 border-b border-[#E8E8E8]">
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.08em] mb-3">
            How It Works
          </p>
          <div className="space-y-2 text-xs text-[#666666]">
            <p>• Set your discovery targets (business type + locations)</p>
            <p>• System runs automatically every day at 02:00 UTC</p>
            <p>• Prospects are discovered, enriched, and qualified</p>
            <p>• You review and approve in your morning brief</p>
          </div>
        </div>

        {/* Active Configurations - What's Running */}
        {configs.length > 0 && (
          <div className="mb-16 pb-12 border-b border-[#E8E8E8]">
            <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.08em] mb-1">
              Active Configurations
            </p>
            <p className="text-xs text-[#888888] mb-6">
              {configs.length} target{configs.length !== 1 ? "s" : ""} configured
            </p>

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
                    <div className="flex items-center gap-4 mt-2">
                      <span
                        className={`text-[10px] font-semibold ${
                          config.enabled ? "text-[#0D0D0D]" : "text-[#CCCCCC]"
                        }`}
                      >
                        {config.enabled ? "Enabled" : "Disabled"}
                      </span>
                      <span className="text-[10px] text-[#999999]">
                        Priority: {config.priority}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-xs font-semibold text-[#0D0D0D] border border-[#E8E8E8] px-3 py-1.5 rounded hover:bg-[#F5F5F5] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Configuration */}
        <div>
          <p className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-[0.08em] mb-1">
            Add Discovery Target
          </p>
          <p className="text-xs text-[#888888] mb-6">
            Create a new automated discovery configuration
          </p>

          <div className="space-y-6">
            {/* Niche Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] mb-2">
                Business Type
              </label>
              <input
                type="text"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                placeholder="e.g., Facilities Management, Accountants, Plumbers"
                className="w-full px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#CCCCCC] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
              />
            </div>

            {/* Locations Input */}
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
              <p className="text-[10px] text-[#999999] mt-1">Comma-separated cities</p>
            </div>

            {/* Priority & Toggle - Horizontal */}
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
                <p className="text-[10px] text-[#999999] mt-1">Higher runs first</p>
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
                    Enabled
                  </span>
                </label>
              </div>
            </div>

            {/* Add Button */}
            <div className="pt-6 border-t border-[#E8E8E8]">
              <button
                onClick={handleAddConfig}
                disabled={saving}
                className="px-4 py-2.5 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Configuration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
