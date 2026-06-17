"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const PRESSURE_TYPES = [
  "Time-Critical Movement",
  "Capacity Overflow",
  "Service Quality Inconsistency",
  "Geographic Service Gaps",
  "Customer Acquisition Friction",
  "Customer Churn",
  "Delivery Reliability",
  "Appointment Scheduling Friction",
  "Communication Breakdown",
];

interface Settings {
  max_emails_per_day: number;
  enabled_pressure_types: string[];
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    max_emails_per_day: 50,
    enabled_pressure_types: PRESSURE_TYPES,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/b2b/settings");
        const data = await res.json();
        setSettings(data.settings || settings);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleTogglePressure = (pressureType: string) => {
    setSettings((s) => ({
      ...s,
      enabled_pressure_types: s.enabled_pressure_types.includes(pressureType)
        ? s.enabled_pressure_types.filter((p) => p !== pressureType)
        : [...s.enabled_pressure_types, pressureType],
    }));
  };

  const handleSave = async () => {
    setSaved(false);
    try {
      const res = await fetch("/api/b2b/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Settings</h1>
            <Link href="/b2b/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-green-800 text-sm">
            ✓ Settings saved
          </div>
        )}

        {/* Email Throttle */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Autonomous Email Throttle
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Max emails per day from autonomous send
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={settings.max_emails_per_day}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    max_emails_per_day: parseInt(e.target.value),
                  }))
                }
                className="w-full"
              />
              <div className="mt-2 flex justify-between">
                <span className="text-xs text-gray-600">10</span>
                <span className="text-sm font-bold text-gray-900">
                  {settings.max_emails_per_day} emails/day
                </span>
                <span className="text-xs text-gray-600">200</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pressure Type Preferences */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pressure Types to Send
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Autonomous send will only email prospects matching enabled pressure types.
            Disable types that aren't converting.
          </p>

          <div className="space-y-3">
            {PRESSURE_TYPES.map((pressureType) => (
              <label
                key={pressureType}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={settings.enabled_pressure_types.includes(
                    pressureType
                  )}
                  onChange={() => handleTogglePressure(pressureType)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-gray-900">
                  {pressureType}
                </span>
              </label>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-4">
            {settings.enabled_pressure_types.length} of {PRESSURE_TYPES.length} enabled
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
