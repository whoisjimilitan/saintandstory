"use client";

import { useEffect, useState } from "react";

interface Setting {
  pressure_type: string;
  enabled: boolean;
  max_emails_per_day: number;
  allowed_variants: string;
}

const PRESSURE_TYPES = [
  "Delivery delays",
  "Staff turnover",
  "Cash flow",
  "Customer complaints",
  "Operations chaos",
];

export function SettingsView() {
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [globalMaxEmails, setGlobalMaxEmails] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [insights, setInsights] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadSettingsAndInsights() {
      try {
        const [settingsRes, insightsRes] = await Promise.all([
          fetch("/api/b2b/settings"),
          fetch("/api/b2b/learning"),
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data.settings || {});
          setGlobalMaxEmails(data.globalMaxEmails || 50);
        }

        if (insightsRes.ok) {
          const data = await insightsRes.json();
          setInsights(data.data || {});
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSettingsAndInsights();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/b2b/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: Object.entries(settings).map(([type, config]) => ({
            pressure_type: type,
            enabled: config.enabled,
            max_emails_per_day: config.max_emails_per_day,
            allowed_variants: config.allowed_variants,
          })),
          globalMaxEmails,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 px-6 py-10">
        <p className="text-sm text-[#888888]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-10 overflow-auto">
      <div className="max-w-3xl space-y-16">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-black text-[#0D0D0D] tracking-tight">
            System Settings
          </h1>
          <p className="text-sm text-[#888888] mt-3">
            Control operator behavior: which pressure types to use, sending limits, copy variants
          </p>
        </div>

        {/* LEARNING INSIGHTS (if available) */}
        {insights.pressureTypes && insights.pressureTypes.length > 0 && (
          <div className="space-y-4 p-4 bg-[#F5F5F5] border border-[#E8E8E8]">
            <h2 className="text-sm font-medium text-[#0D0D0D]">
              Based on Learning Insights
            </h2>
            <p className="text-xs text-[#666666]">
              Top performing pressure types. Consider enabling these:
            </p>
            <div className="space-y-2">
              {insights.pressureTypes.slice(0, 3).map((metric: any) => (
                <p key={metric.pressure_type} className="text-xs text-[#0D0D0D]">
                  • <strong>{metric.pressure_type}</strong> ({(metric.yes_rate * 100).toFixed(0)}% response rate)
                </p>
              ))}
            </div>
          </div>
        )}

        {/* GLOBAL SETTINGS */}
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D] block">
              Global Max Emails Per Day
            </label>
            <p className="text-xs text-[#888888] mb-3">
              Limit total system emails sent daily (0–500, 0 = no limit)
            </p>
            <input
              type="number"
              min="0"
              max="500"
              value={globalMaxEmails}
              onChange={(e) => setGlobalMaxEmails(parseInt(e.target.value) || 0)}
              className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-4 py-3 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
            />
          </div>
        </div>

        {/* PRESSURE TYPE CONTROLS */}
        <div className="space-y-8 pt-12 border-t border-[#E8E8E8]">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            Pressure Type Controls
          </h2>

          <div className="space-y-6">
            {PRESSURE_TYPES.map((type) => {
              const setting = settings[type] || {
                pressure_type: type,
                enabled: true,
                max_emails_per_day: 50,
                allowed_variants: "BOTH",
              };

              return (
                <div
                  key={type}
                  className="space-y-4 pb-6 border-b border-[#E8E8E8]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-[#0D0D0D]">{type}</p>
                      <p className="text-xs text-[#888888] mt-1">
                        Control this pressure type's behavior
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            [type]: {
                              ...setting,
                              enabled: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 accent-[#0D0D0D]"
                      />
                      <span className="text-sm text-[#888888]">
                        {setting.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {setting.enabled && (
                    <div className="space-y-4 ml-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#888888] block mb-2">
                          Max Emails Per Day
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="500"
                          value={setting.max_emails_per_day}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [type]: {
                                ...setting,
                                max_emails_per_day: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-3 py-2 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-[0.2em] text-[#888888] block mb-2">
                          Allowed Copy Variants
                        </label>
                        <select
                          value={setting.allowed_variants}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              [type]: {
                                ...setting,
                                allowed_variants: e.target.value,
                              },
                            })
                          }
                          className="w-full text-sm bg-[#F5F5F5] border border-[#E8E8E8] px-3 py-2 text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D]"
                        >
                          <option value="A">Variant A only (pain-first)</option>
                          <option value="B">Variant B only (solution-first)</option>
                          <option value="BOTH">Both variants (A/B random)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STATUS */}
        {success && (
          <div className="text-sm text-green-600 border-l-2 border-green-600 pl-4 py-2">
            ✓ Settings saved successfully
          </div>
        )}

        {/* SAVE BUTTON */}
        <div className="pt-8 border-t border-[#E8E8E8]">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="text-sm font-medium text-white bg-[#0D0D0D] px-4 py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* INFO */}
        <div className="space-y-4 pt-8 border-t border-[#E8E8E8]">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#0D0D0D]">
            How Settings Work
          </h3>
          <div className="space-y-2 text-xs text-[#666666]">
            <p>
              <strong>Enabled:</strong> Turn pressure types on/off. Disabled types will not be sent manually or automatically.
            </p>
            <p>
              <strong>Max Emails Per Day:</strong> Limit per pressure type (0 = no limit).
            </p>
            <p>
              <strong>Copy Variants:</strong> Choose which email versions to use for this pressure type.
            </p>
            <p>
              <strong>Global Limit:</strong> Total emails across all types per day (additional constraint).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
