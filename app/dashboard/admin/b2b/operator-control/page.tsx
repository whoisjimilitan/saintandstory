/**
 * OPERATOR CONTROL CENTER - Command Center Dashboard
 *
 * Phase 1: Command Center
 * Shows: Today's priorities, pipeline health, pressure types, learnings
 * Single view for all operator needs
 */

'use client';

import { useState } from 'react';

export default function OperatorControlCenter() {
  const [view, setView] = useState<'dashboard' | 'workflows' | 'templates' | 'analytics'>('dashboard');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-2">Operator Control</h1>
        <p className="text-gray-600">Command center for managing 9 pressure types and prospects</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex gap-8">
          {(['dashboard', 'workflows', 'templates', 'analytics'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setView(t)}
              className={`pb-2 text-sm font-medium transition-all border-b-2 ${
                view === t
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {t === 'dashboard' && '📊 Dashboard'}
              {t === 'workflows' && '⚙️ Workflows'}
              {t === 'templates' && '📝 Templates'}
              {t === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <div className="space-y-12">
            {/* Section 1: Today's Priorities */}
            <section>
              <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Today's Priorities</h2>
              <div className="space-y-3">
                <PriorityItem
                  rank={1}
                  prospect="Cornerstone Logistics"
                  pressure="Time-Critical Movement"
                  action="Send operator brief"
                  impact="+35% likely to convert"
                  time="15 min"
                  urgency="high"
                />
                <PriorityItem
                  rank={2}
                  prospect="haart"
                  pressure="Quality Inconsistency"
                  action="Send Operational Independence angle"
                  impact="+12% reply rate"
                  time="5 min"
                  urgency="high"
                />
                <PriorityItem
                  rank={3}
                  prospect="Westpoint Pharmacy"
                  pressure="Capacity Overflow"
                  action="Send scarcity message"
                  impact="+8% reply rate"
                  time="5 min"
                  urgency="medium"
                />
              </div>
            </section>

            {/* Section 2: Pipeline Health */}
            <section>
              <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Pipeline Health</h2>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <MetricCard label="Conversion Rate" value="18%" change="+2.1%" color="green" />
                <MetricCard label="Avg Days to Hot" value="8.3" change="-0.8 days" color="green" />
                <MetricCard label="Open Rate" value="67.2%" change="+4.3%" color="green" />
              </div>

              {/* Funnel Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-xs uppercase text-gray-500 tracking-wider mb-4">Funnel</p>
                <div className="space-y-3">
                  <FunnelRow label="Cold" value={100} color="gray" />
                  <FunnelRow label="Warm" value={82} color="gray" />
                  <FunnelRow label="Engaged" value={61} color="gray" />
                  <FunnelRow label="Trusting" value={44} color="gray" />
                  <FunnelRow label="Hot 🔥" value={18} color="green" />
                </div>
                <p className="text-xs text-gray-600 mt-6">Biggest bottleneck: Gate 2→3 (21 prospects stalled)</p>
              </div>
            </section>

            {/* Section 3: Pressure Type Performance */}
            <section>
              <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">Pressure Type Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <TypeCard
                  name="Quality Inconsistency"
                  your_conversion="18%"
                  system_avg="17.9%"
                  your_edge="+0.1%"
                  best_angle="Operational Independence"
                  status="On par"
                />
                <TypeCard
                  name="Time-Critical Movement"
                  your_conversion="22%"
                  system_avg="20.1%"
                  your_edge="+1.9%"
                  best_angle="Timeline Feasibility"
                  status="Above average"
                />
                <TypeCard
                  name="Capacity Overflow"
                  your_conversion="19.5%"
                  system_avg="18.2%"
                  your_edge="+1.3%"
                  best_angle="Process Automation"
                  status="Above average"
                />
              </div>
            </section>

            {/* Section 4: Recommendations */}
            <section>
              <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-6">System Learning</h2>
              <div className="space-y-3">
                <RecommendationItem
                  title="Operational Independence angle performing +22% better"
                  type="angle"
                  action="Use for next Quality Inconsistency prospects"
                />
                <RecommendationItem
                  title="Capacity Overflow: Try Reputation at Scale angle"
                  type="suggestion"
                  action="You haven't tested this angle yet"
                />
                <RecommendationItem
                  title="Focus on Quality Inconsistency type this week"
                  type="priority"
                  action="Best conversion rate (18%), most volume"
                />
              </div>
            </section>
          </div>
        )}

        {/* WORKFLOWS VIEW */}
        {view === 'workflows' && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold">Workflow Settings</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-4">Customize automation per pressure type</p>
              <p className="text-sm text-gray-900">🔨 Workflow customization component (Phase 2)</p>
            </div>
          </div>
        )}

        {/* TEMPLATES VIEW */}
        {view === 'templates' && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold">Operator Brief Templates</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-4">Store and reuse your proven templates</p>
              <p className="text-sm text-gray-900">🔨 Template management component (Phase 5)</p>
            </div>
          </div>
        )}

        {/* ANALYTICS VIEW */}
        {view === 'analytics' && (
          <div className="space-y-8">
            <h2 className="text-lg font-semibold">Analytics & History</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-4">View all actions, trends, and learnings</p>
              <p className="text-sm text-gray-900">🔨 Analytics component (Phase 6)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityItem({
  rank,
  prospect,
  pressure,
  action,
  impact,
  time,
  urgency,
}: {
  rank: number;
  prospect: string;
  pressure: string;
  action: string;
  impact: string;
  time: string;
  urgency: 'high' | 'medium' | 'low';
}) {
  const colors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-amber-200 bg-amber-50',
    low: 'border-gray-200 bg-gray-50',
  };

  return (
    <div className={`border rounded-lg p-4 ${colors[urgency]}`}>
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <span className="font-bold text-lg text-gray-900">#{rank}</span>
          <div>
            <p className="font-medium text-gray-900">{prospect}</p>
            <p className="text-xs text-gray-600 mb-2">{pressure}</p>
            <p className="text-sm text-gray-700">{action}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{impact}</p>
          <p className="text-xs text-gray-600 mt-2">{time}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  color,
}: {
  label: string;
  value: string;
  change: string;
  color: 'green' | 'amber' | 'red';
}) {
  const colorClass = {
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-serif font-bold text-gray-900 mt-2">{value}</p>
      <p className={`text-sm mt-2 ${colorClass[color]}`}>{change}</p>
    </div>
  );
}

function FunnelRow({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-400',
    green: 'bg-green-600',
  };

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{value}/100</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
        <div className={`h-full ${colorMap[color] || 'bg-gray-400'}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TypeCard({
  name,
  your_conversion,
  system_avg,
  your_edge,
  best_angle,
  status,
}: {
  name: string;
  your_conversion: string;
  system_avg: string;
  your_edge: string;
  best_angle: string;
  status: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="font-medium text-sm text-gray-900 mb-3">{name}</p>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Your: {your_conversion}</span>
          <span className="font-medium text-green-600">{your_edge}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg: {system_avg}</span>
        </div>
        <p className="text-gray-700 pt-2">Angle: {best_angle}</p>
        <p className="text-gray-500">{status}</p>
      </div>
    </div>
  );
}

function RecommendationItem({
  title,
  type,
  action,
}: {
  title: string;
  type: 'angle' | 'suggestion' | 'priority';
  action: string;
}) {
  const icons = {
    angle: '📊',
    suggestion: '💡',
    priority: '🎯',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex gap-3">
        <span className="text-lg">{icons[type]}</span>
        <div className="flex-1">
          <p className="font-medium text-sm text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{action}</p>
        </div>
      </div>
    </div>
  );
}
