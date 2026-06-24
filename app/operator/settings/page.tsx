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
    <div className="min-h-screen bg-[#F9F9F9] pt-32">
      <div className="max-w-4xl mx-auto px-4 md:px-12 py-12">
        {/* Header */}
        <p className="text-lg font-bold text-[#0D0D0D] mb-8 md:mb-12 pb-4 md:pb-8 border-b border-[#E8E8E8] leading-relaxed">
          Autonomous Discovery Configuration
        </p>

        {/* Add New Config Section */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 mb-8 bg-white">
          <h3 className="text-sm font-semibold text-[#0D0D0D] uppercase mb-6">
            Add New Discovery Target
          </h3>

          <div className="space-y-6">
            {/* Niche Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-2">
                Business Niche
              </label>
              <p className="text-xs text-[#888888] mb-2">
                Any business type: lawyers, plumbers, dentists, accountants, electricians, etc.
              </p>
              <input
                type="text"
                value={newNiche}
                onChange={(e) => setNewNiche(e.target.value)}
                placeholder="e.g., insurance brokers, dental practices, logistics companies"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
              />
            </div>

            {/* Locations Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-2">
                Locations (Comma-Separated)
              </label>
              <p className="text-xs text-[#888888] mb-2">
                Any cities: London, Manchester, Dublin, Edinburgh, etc.
              </p>
              <input
                type="text"
                value={newLocations}
                onChange={(e) => setNewLocations(e.target.value)}
                placeholder="e.g., London, Manchester, Birmingham, Edinburgh"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-2">
                Priority
              </label>
              <p className="text-xs text-[#888888] mb-2">
                Higher number = runs first (default 1)
              </p>
              <input
                type="number"
                min="1"
                value={newPriority}
                onChange={(e) => setNewPriority(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] focus:ring-1 focus:ring-[#0D0D0D]"
              />
            </div>

            {/* Enabled */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={newEnabled}
                onChange={(e) => setNewEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#0D0D0D]"
              />
              <label className="text-sm text-[#0D0D0D] font-semibold">
                Enabled (will run at 02:00 UTC)
              </label>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddConfig}
              disabled={saving}
              className="w-full px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "+ Add Configuration"}
            </button>
          </div>
        </div>

        {/* Active Configurations */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 bg-white">
          <h3 className="text-sm font-semibold text-[#0D0D0D] uppercase mb-6">
            Active Configurations ({configs.filter((c) => c.enabled).length})
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-[#E8E8E8] border-t-[#0D0D0D] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#666666]">Loading configurations...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#666666]">No discovery configurations yet. Add one above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config, idx) => (
                <div
                  key={idx}
                  className={`border rounded-lg p-4 flex items-start justify-between gap-4 ${
                    config.enabled
                      ? "border-[#0D0D0D] bg-[#F9F9F9]"
                      : "border-[#E8E8E8] bg-[#F9F9F9] opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-[#0D0D0D]">
                        {config.niche.charAt(0).toUpperCase() + config.niche.slice(1)}
                      </h4>
                      <span className="text-xs font-semibold text-[#888888]">
                        Priority {config.priority}
                      </span>
                    </div>
                    <p className="text-xs text-[#666666]">
                      {config.locations.join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEnabled(idx)}
                      disabled={saving}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                        config.enabled
                          ? "bg-[#0D0D0D] text-white hover:bg-[#333333]"
                          : "bg-[#E8E8E8] text-[#0D0D0D] hover:bg-[#D0D0D0]"
                      }`}
                    >
                      {config.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(idx)}
                      disabled={saving}
                      className="px-3 py-1 text-xs font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>How it works:</strong> Each configuration runs at 02:00 UTC. The system discovers businesses matching
            your niche in each location, qualifies them, and stores them in /operator/queue. You then approve and send
            emails via the reasoning engine.
          </p>
        </div>
      </div>
    </div>
  );
}
