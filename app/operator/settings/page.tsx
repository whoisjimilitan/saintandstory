"use client";

import { useState, useEffect } from "react";

interface OperatorSettings {
  // Google Places Configuration
  googlePlaces: {
    defaultCountry: string;
    defaultCities: string[];
    searchRadius: number;
    radiusUnit: "miles" | "km";
    categoryFilter: string[];
  };
  // Discovery Preferences
  discovery: {
    defaultSource: "google_places" | "manual" | "csv" | "dork_search";
    autoQualifyThreshold: number;
    enabledSources: {
      googlePlaces: boolean;
      manual: boolean;
      csv: boolean;
      dorkSearch: boolean;
    };
  };
  // Advanced
  advanced: {
    googlePlacesApiKey?: string;
    csvTemplate?: string;
  };
}

const COUNTRY_OPTIONS = ["UK", "USA", "Canada", "Australia", "Ireland"];
const CITY_SUGGESTIONS = {
  UK: ["London", "Manchester", "Birmingham", "Bristol", "Leeds", "Edinburgh"],
  USA: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
  Australia: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
  Ireland: ["Dublin", "Cork", "Galway", "Limerick", "Belfast"],
};
const BUSINESS_CATEGORIES = [
  "law-firm",
  "removals",
  "pharmacy",
  "restaurant",
  "ecommerce",
  "taxi-service",
  "construction",
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<OperatorSettings>({
    googlePlaces: {
      defaultCountry: "UK",
      defaultCities: ["London"],
      searchRadius: 25,
      radiusUnit: "miles",
      categoryFilter: [],
    },
    discovery: {
      defaultSource: "google_places",
      autoQualifyThreshold: 70,
      enabledSources: {
        googlePlaces: true,
        manual: true,
        csv: true,
        dorkSearch: true,
      },
    },
    advanced: {
      googlePlacesApiKey: "",
      csvTemplate: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from API
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/operator/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/operator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-0 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black text-[#0D0D0D] mb-2">Settings</h1>
          <p className="text-sm text-[#888888]">
            Configure Google Places search and discovery preferences
          </p>
        </div>

        {/* Google Places Section */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 mb-8">
          <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
            Google Places Configuration
          </h2>

          {/* Country Selection */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Default Country
            </label>
            <select
              value={settings.googlePlaces.defaultCountry}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  googlePlaces: {
                    ...settings.googlePlaces,
                    defaultCountry: e.target.value,
                    defaultCities: [], // Reset cities when country changes
                  },
                })
              }
              className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Cities Selection */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Search Cities
            </label>
            <div className="space-y-2">
              {CITY_SUGGESTIONS[
                settings.googlePlaces.defaultCountry as keyof typeof CITY_SUGGESTIONS
              ]?.map((city) => (
                <label key={city} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.googlePlaces.defaultCities.includes(city)}
                    onChange={(e) => {
                      const cities = e.target.checked
                        ? [...settings.googlePlaces.defaultCities, city]
                        : settings.googlePlaces.defaultCities.filter((c) => c !== city);
                      setSettings({
                        ...settings,
                        googlePlaces: {
                          ...settings.googlePlaces,
                          defaultCities: cities,
                        },
                      });
                    }}
                    className="w-4 h-4 accent-[#0D0D0D]"
                  />
                  <span className="text-sm text-[#0D0D0D]">{city}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Radius */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Search Radius
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                value={settings.googlePlaces.searchRadius}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googlePlaces: {
                      ...settings.googlePlaces,
                      searchRadius: parseInt(e.target.value) || 25,
                    },
                  })
                }
                className="flex-1 px-4 py-2 border border-[#E8E8E8] rounded text-sm focus:outline-none focus:border-[#0D0D0D]"
              />
              <select
                value={settings.googlePlaces.radiusUnit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    googlePlaces: {
                      ...settings.googlePlaces,
                      radiusUnit: e.target.value as "miles" | "km",
                    },
                  })
                }
                className="px-4 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
              >
                <option value="miles">Miles</option>
                <option value="km">Km</option>
              </select>
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Business Categories to Search
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BUSINESS_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.googlePlaces.categoryFilter.includes(category)}
                    onChange={(e) => {
                      const categories = e.target.checked
                        ? [...settings.googlePlaces.categoryFilter, category]
                        : settings.googlePlaces.categoryFilter.filter((c) => c !== category);
                      setSettings({
                        ...settings,
                        googlePlaces: {
                          ...settings.googlePlaces,
                          categoryFilter: categories,
                        },
                      });
                    }}
                    className="w-4 h-4 accent-[#0D0D0D]"
                  />
                  <span className="text-sm text-[#0D0D0D]">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Discovery Preferences Section */}
        <div className="border border-[#E8E8E8] rounded-lg p-8 mb-8">
          <h2 className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] mb-6">
            Discovery Preferences
          </h2>

          {/* Default Source */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Default Discovery Source
            </label>
            <select
              value={settings.discovery.defaultSource}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  discovery: {
                    ...settings.discovery,
                    defaultSource: e.target.value as any,
                  },
                })
              }
              className="w-full px-4 py-2 border border-[#E8E8E8] rounded text-sm text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
            >
              <option value="google_places">Google Places</option>
              <option value="manual">Manual Entry</option>
              <option value="csv">CSV Import</option>
              <option value="dork_search">Dork Search</option>
            </select>
          </div>

          {/* Auto-Qualify Threshold */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Auto-Qualify Confidence Threshold ({settings.discovery.autoQualifyThreshold}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.discovery.autoQualifyThreshold}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  discovery: {
                    ...settings.discovery,
                    autoQualifyThreshold: parseInt(e.target.value),
                  },
                })
              }
              className="w-full"
            />
            <p className="text-xs text-[#888888] mt-2">
              Prospects with confidence score below this won't auto-qualify
            </p>
          </div>

          {/* Enabled Sources */}
          <div>
            <label className="block text-xs font-semibold text-[#0D0D0D] uppercase mb-3">
              Enabled Discovery Sources
            </label>
            <div className="space-y-3">
              {Object.entries(settings.discovery.enabledSources).map(([source, enabled]) => (
                <label key={source} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        discovery: {
                          ...settings.discovery,
                          enabledSources: {
                            ...settings.discovery.enabledSources,
                            [source]: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 accent-[#0D0D0D]"
                  />
                  <span className="text-sm text-[#0D0D0D] capitalize">
                    {source.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-[#0D0D0D] text-white text-xs font-semibold rounded hover:bg-[#333333] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : saved ? "✓ Saved" : "Save Settings"}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-3 border border-[#E8E8E8] text-[#0D0D0D] text-xs font-semibold rounded hover:bg-[#F5F5F5] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
