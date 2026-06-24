"use client";

import { useState, useEffect } from "react";

interface DiscoveryConfig {
  id?: string;
  niche: string;
  locations: string[];
  enabled: boolean;
  priority: number;
  target_count?: number;
  target_stage?: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<DiscoveryConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state for adding new config
  const [newNiche, setNewNiche] = useState("");
  const [newLocations, setNewLocations] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);
  const [newPriority, setNewPriority] = useState(1);

  // Load existing configs
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await fetch("/api/operator/discovery-config");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error("Failed to load configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConfig = async () => {
    if (!newNiche.trim()) {
      alert("Niche is required");
      return;
    }
    if (!newLocations.trim()) {
      alert("At least one location is required");
      return;
    }

    setSaving(true);
    try {
      const locationArray = newLocations
        .split(",")
        .map((loc) => loc.trim())
        .filter((loc) => loc.length > 0);

      const res = await fetch("/api/operator/discovery-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: newNiche.trim(),
          locations: locationArray,
          enabled: newEnabled,
          priority: newPriority,
          target_count: 100,
          target_stage: "qualified",
        }),
      });

      if (!res.ok) throw new Error("Failed to save config");

      // Reset form
      setNewNiche("");
      setNewLocations("");
      setNewEnabled(true);
      setNewPriority(1);

      // Reload configs
      await loadConfigs();
    } catch (error) {
      console.error("Error saving config:", error);
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async (index: number) => {
    const updated = [...configs];
    updated[index].enabled = !updated[index].enabled;
    setConfigs(updated);

    setSaving(true);
    try {
      await fetch("/api/operator/discovery-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated[index]),
      });
    } catch (error) {
      console.error("Error updating config:", error);
      alert("Failed to update configuration");
      await loadConfigs();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (index: number) => {
    if (!confirm("Delete this configuration?")) return;

    setSaving(true);
    try {
      const configToDelete = configs[index];
      await fetch("/api/operator/discovery-config", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: configToDelete.id }),
      });

      await loadConfigs();
    } catch (error) {
      console.error("Error deleting config:", error);
      alert("Failed to delete configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="px-4 md:px-12">
        {/* Header - Consistent with Today page */}
        <div className="mb-12">
          <p className="text-lg font-bold text-[#0D0D0D] leading-relaxed">
            Autonomous Discovery
          </p>
          <p className="text-sm text-[#888888] mt-2">
            Configure what prospects we discover and when
          </p>
        </div>

        {/* Workflow Overview - Integrated */}
        <div className="mb-16 pb-16 border-b border-[#E8E8E8]">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0D0D0D] mb-2">1</div>
              <p className="text-xs text-[#666666]">Configure</p>
              <p className="text-[10px] text-[#999999] mt-1">Add niche & locations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0D0D0D] mb-2">2</div>
              <p className="text-xs text-[#666666]">Discover</p>
              <p className="text-[10px] text-[#999999] mt-1">02:00 UTC daily</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0D0D0D] mb-2">3</div>
              <p className="text-xs text-[#666666]">Qualify</p>
              <p className="text-[10px] text-[#999999] mt-1">Automatic process</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0D0D0D] mb-2">4</div>
              <p className="text-xs text-[#666666]">Approve</p>
              <p className="text-[10px] text-[#999999] mt-1">Review & send</p>
            </div>
          </div>
        </div>

        {/* Add New Config Section */}
        <div className="mb-16">
          <h3 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-widest mb-8">
            Add Discovery Target
          </h3>

          <div className="space-y-6">
            {/* Niche Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                Business Type
              </label>
              <input
                type="text"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                placeholder="lawyers, plumbers, dentists, accountants..."
                className="w-full px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#CCCCCC] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
              />
            </div>

            {/* Locations Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                Locations
              </label>
              <input
                type="text"
                value={newLocations}
                onChange={(e) => setNewLocations(e.target.value)}
                placeholder="London, Manchester, Dublin, Edinburgh..."
                className="w-full px-3 py-2 text-sm text-[#0D0D0D] placeholder-[#CCCCCC] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
              />
              <p className="text-[10px] text-[#999999] mt-2">Comma-separated cities</p>
            </div>

            {/* Priority & Enabled - Horizontal Layout */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest mb-3">
                  Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={newPriority}
                  onChange={(e) => setNewPriority(parseInt(e.target.value) || 1)}
                  className="w-16 px-3 py-2 text-sm text-[#0D0D0D] border-b border-[#E8E8E8] focus:border-[#0D0D0D] focus:outline-none transition-colors bg-transparent"
                />
                <p className="text-[10px] text-[#999999] mt-2">Higher runs first</p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEnabled}
                    onChange={(e) => setNewEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#0D0D0D]"
                  />
                  <span className="text-xs font-semibold text-[#0D0D0D] uppercase tracking-widest">
                    Enable at launch
                  </span>
                </label>
                <p className="text-[10px] text-[#999999] mt-2 ml-7">Runs at 02:00 UTC</p>
              </div>
            </div>

            {/* Add Button */}
            <div className="pt-6">
              <button
                onClick={handleAddConfig}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0D0D0D] rounded hover:bg-[#2a2a2a] disabled:opacity-50 transition-colors"
              >
                {saving ? "Adding..." : "Add Configuration"}
              </button>
            </div>
          </div>
        </div>

        {/* Active Configurations */}
        <div>
          <h3 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-widest mb-6">
            Your Targets
            {configs.length > 0 && (
              <span className="text-xs font-normal text-[#888888] ml-2">
                ({configs.filter((c) => c.enabled).length} enabled)
              </span>
            )}
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-[#888888]">Loading configurations...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-[#AAAAAA]">No configurations yet.</p>
              <p className="text-xs text-[#AAAAAA] mt-1">Add one above to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 flex items-center justify-between gap-4 border-b transition-colors ${
                    config.enabled
                      ? "border-[#E8E8E8] hover:bg-[#F9F9F9]"
                      : "border-[#E8E8E8] opacity-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0D0D0D]">
                          {config.niche.charAt(0).toUpperCase() + config.niche.slice(1)}
                        </p>
                        <p className="text-xs text-[#888888] mt-1">
                          {config.locations.join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-[#999999] mr-2">
                      P{config.priority}
                    </span>
                    <button
                      onClick={() => handleToggleEnabled(idx)}
                      disabled={saving}
                      className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                        config.enabled
                          ? "bg-[#0D0D0D] text-white hover:bg-[#2a2a2a]"
                          : "text-[#0D0D0D] hover:bg-[#F5F5F5] border border-[#E8E8E8]"
                      }`}
                    >
                      {config.enabled ? "On" : "Off"}
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(idx)}
                      disabled={saving}
                      className="px-2.5 py-1 text-[10px] font-semibold text-[#999999] hover:text-[#0D0D0D] hover:bg-[#F5F5F5] rounded transition-colors border border-[#E8E8E8]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
