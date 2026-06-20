/**
 * PRESSURE PLAYBOOKS DASHBOARD
 *
 * Operator view of all 9 pressure type playbooks
 * Shows: Recognition, Relief, Angles, Proof patterns, Effectiveness metrics
 * Allows customization (future phase)
 */

'use client';

import { useState } from 'react';

const PRESSURE_PLAYBOOKS = [
  {
    id: 'service-quality-inconsistency',
    name: 'Service Quality Inconsistency',
    examples: '4.8★ vs 3.2★ branch variance',
    recognition: 'Multi-location quality gaps',
    relief: 'Managing quality personally across locations',
    angles: ['Quality Consistency', 'Operational Independence', 'Reputation at Scale'],
    metrics: { open_rate: 68, reply_rate: 35, conversion_rate: 18 },
  },
  {
    id: 'time-critical-movement',
    name: 'Time-Critical Movement',
    examples: '75-day warehouse move deadline',
    recognition: 'Deadline impossible with standard methods',
    relief: 'Business continuity risk during transition',
    angles: ['Timeline Feasibility', 'Risk Mitigation', 'Speed to ROI'],
    metrics: { open_rate: 72, reply_rate: 42, conversion_rate: 22 },
  },
  {
    id: 'capacity-overflow',
    name: 'Capacity Overflow',
    examples: '250 scripts/day, demand 400+',
    recognition: 'Rejecting revenue due to capacity',
    relief: 'Leaving money on the table',
    angles: ['Capacity Expansion', 'Process Automation', 'Revenue Without Chaos'],
    metrics: { open_rate: 65, reply_rate: 38, conversion_rate: 20 },
  },
  {
    id: 'geographic-service-gaps',
    name: 'Geographic Service Gaps',
    examples: 'Only serve 3-mile radius',
    recognition: 'Customers outside service area unserved',
    relief: 'Can\'t expand beyond boundaries',
    angles: ['Geographic Expansion', 'Market Growth', 'Service Extension'],
    metrics: { open_rate: 62, reply_rate: 33, conversion_rate: 15 },
  },
  {
    id: 'customer-acquisition-friction',
    name: 'Customer Acquisition Friction',
    examples: '3 leads/week, need 8-10',
    recognition: 'Lead generation is bottleneck',
    relief: 'Finding new customers is consuming energy',
    angles: ['Acquisition Pipeline', 'Lead Generation', 'Market Share Growth'],
    metrics: { open_rate: 58, reply_rate: 28, conversion_rate: 12 },
  },
  {
    id: 'customer-churn',
    name: 'Customer Churn',
    examples: '40% don\'t return after first job',
    recognition: 'Losing customers above industry average',
    relief: 'Revenue is slipping away',
    angles: ['Retention Strategy', 'Lifetime Value', 'Customer Experience'],
    metrics: { open_rate: 61, reply_rate: 31, conversion_rate: 14 },
  },
  {
    id: 'delivery-reliability',
    name: 'Delivery Reliability',
    examples: '80% on-time, 20% delayed',
    recognition: 'Reputation damaged by delays',
    relief: 'Reliability is eroding trust',
    angles: ['Reliability Guarantee', 'Operations Excellence', 'Trust Building'],
    metrics: { open_rate: 64, reply_rate: 36, conversion_rate: 16 },
  },
  {
    id: 'appointment-scheduling-friction',
    name: 'Appointment Scheduling Friction',
    examples: '45 min to schedule, 10% no-shows',
    recognition: 'Scheduling is team bottleneck',
    relief: 'Manual work consuming time',
    angles: ['Scheduling Efficiency', 'Appointment Automation', 'No-show Prevention'],
    metrics: { open_rate: 59, reply_rate: 32, conversion_rate: 14 },
  },
  {
    id: 'communication-breakdown',
    name: 'Communication Breakdown',
    examples: 'Quotes lost, customer confusion',
    recognition: 'Information falling through cracks',
    relief: 'Teams not aligned, repeat work',
    angles: ['Communication System', 'Information Flow', 'Team Coordination'],
    metrics: { open_rate: 57, reply_rate: 29, conversion_rate: 13 },
  },
];

export default function PressurePlaybooksDashboard() {
  const [selectedPlaybook, setSelectedPlaybook] = useState(PRESSURE_PLAYBOOKS[0]);
  const [view, setView] = useState<'overview' | 'details' | 'effectiveness'>('overview');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-12">
        <h1 className="text-4xl font-serif font-bold mb-2">Pressure Playbooks</h1>
        <p className="text-gray-600">9 pressure types with proven recognition, relief, and angles</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8 p-8">
        {/* Left: Playbook List */}
        <div className="col-span-4">
          <div className="sticky top-8">
            <h2 className="text-xs uppercase text-gray-500 tracking-wider mb-4">All Playbooks</h2>
            <div className="space-y-2">
              {PRESSURE_PLAYBOOKS.map((playbook) => (
                <button
                  key={playbook.id}
                  onClick={() => setSelectedPlaybook(playbook)}
                  className={`w-full text-left px-4 py-3 rounded border transition-all ${
                    selectedPlaybook.id === playbook.id
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white border-gray-200 text-gray-900 hover:border-gray-400'
                  }`}
                >
                  <p className="font-medium text-sm">{playbook.name}</p>
                  <p className="text-xs mt-1 opacity-75">{playbook.examples}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Playbook Details */}
        <div className="col-span-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
            {/* Tabs */}
            <div className="flex gap-8 mb-8 border-b border-gray-200">
              {(['overview', 'details', 'effectiveness'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className={`pb-4 text-sm font-medium transition-all ${
                    view === tab
                      ? 'text-gray-900 border-b-2 border-gray-900'
                      : 'text-gray-500 border-b-2 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab === 'overview' && 'Overview'}
                  {tab === 'details' && 'Angles & Proof'}
                  {tab === 'effectiveness' && 'Effectiveness'}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {view === 'overview' && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Recognition</p>
                  <p className="text-sm text-gray-700">{selectedPlaybook.recognition}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Relief</p>
                  <p className="text-sm text-gray-700">{selectedPlaybook.relief}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Quick Example</p>
                  <p className="text-sm text-gray-700 italic">"{selectedPlaybook.examples}"</p>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {view === 'details' && (
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-4">Angles in Order</p>
                  <div className="space-y-2">
                    {selectedPlaybook.angles.map((angle, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium bg-gray-200 text-gray-900 px-2 py-1 rounded">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700">{angle}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-3">Foundation</p>
                  <p className="text-sm text-gray-600">
                    Each angle uses Truth Signals + Inverse Incentive Psychology. Recognition specific to their pressure.
                    Relief names their exact burden. Proof shows how we solve it.
                  </p>
                </div>
              </div>
            )}

            {/* Effectiveness Tab */}
            {view === 'effectiveness' && (
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-4">Current Performance</p>
                  <div className="space-y-4">
                    <MetricBar label="Email Open Rate" value={selectedPlaybook.metrics.open_rate} />
                    <MetricBar label="Reply Rate" value={selectedPlaybook.metrics.reply_rate} />
                    <MetricBar label="Conversion to Standing Order" value={selectedPlaybook.metrics.conversion_rate} />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs uppercase text-gray-500 tracking-wider mb-3">Learning</p>
                  <p className="text-sm text-gray-600">
                    Which angles work best: Tracking by angle. Most effective approaches get suggested first in Wave 3.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-gray-900 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
