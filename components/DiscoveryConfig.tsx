"use client";

import { useEffect, useState } from "react";

interface DiscoveryConfigItem {
  id: string;
  mode: string;
  niche: string;
  locations: string[];
  enabled: boolean;
  priority: number;
}

export function DiscoveryConfig() {
  const [configs, setConfigs] = useState<DiscoveryConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [niche, setNiche] = useState("");
  const [locations, setLocations] = useState("");

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/b2b/discovery-config?enabled=true");
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (err) {
      console.error("Failed to fetch configs:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!niche || !locations) return;

    try {
      const res = await fetch("/api/b2b/discovery-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "national",
          niche,
          locations: locations.split(",").map(l => l.trim()),
          enabled: true,
          priority: 50,
        }),
      });

      if (res.ok) {
        setNiche("");
        setLocations("");
        await fetchConfigs();
      }
    } catch (err) {
      console.error("Failed to add config:", err);
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    try {
      await fetch("/api/b2b/discovery-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !enabled }),
      });
      await fetchConfigs();
    } catch (err) {
      console.error("Failed to toggle config:", err);
    }
  }

  if (loading) return <div className="text-sm text-[#888888]">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg p-6">
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Add Discovery Parameters</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Niche (e.g., care_home)"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm"
          />
          <input
            type="text"
            placeholder="Cities (comma-separated, e.g., london, manchester)"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E8E8] rounded text-sm"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-[#0D0D0D] text-white px-4 py-2 rounded font-semibold text-sm hover:bg-[#333333] transition-colors"
          >
            Add Configuration
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#0D0D0D] mb-4">Active Discovery Configs</h3>
        <div className="space-y-2">
          {configs.length === 0 ? (
            <p className="text-sm text-[#888888]">No configurations. Using defaults.</p>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between bg-white border border-[#E8E8E8] rounded p-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D0D0D]">{config.niche}</p>
                  <p className="text-xs text-[#888888]">
                    {config.locations.join(", ")} • Priority: {config.priority}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(config.id, config.enabled)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    config.enabled
                      ? "bg-[#E8F5E9] text-[#2ECC71]"
                      : "bg-[#F5F5F5] text-[#888888]"
                  }`}
                >
                  {config.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
