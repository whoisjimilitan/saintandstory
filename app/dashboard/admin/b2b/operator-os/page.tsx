/**
 * OPERATOR OS - Control Center
 *
 * NOT a dashboard. NOT analytics.
 * IS an operating system for approval/send workflow.
 *
 * Four sections:
 * 1. TODAY - One prospect, one action, one button
 * 2. CONVERSATIONS - Full timeline with one company
 * 3. OPPORTUNITIES - Standing order queue
 * 4. ARCHIVE - Finished/stalled
 */

'use client';

import { useState } from 'react';

export default function OperatorOS() {
  const [view, setView] = useState<'today' | 'conversations' | 'opportunities' | 'archive'>('today');
  const [selectedProspect, setSelectedProspect] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Minimal */}
      <div className="border-b border-gray-200 px-8 py-6">
        <h1 className="text-3xl font-serif font-bold">Control</h1>
        <p className="text-sm text-gray-600 mt-1">Approve and send • One action at a time</p>
      </div>

      {/* Navigation - Four Sections Only */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex gap-8">
          {(['today', 'conversations', 'opportunities', 'archive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setView(tab);
                setSelectedProspect(null);
              }}
              className={`pb-2 text-sm font-medium border-b-2 transition-all ${
                view === tab
                  ? 'text-gray-900 border-gray-900'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab === 'today' && 'Today'}
              {tab === 'conversations' && 'Conversations'}
              {tab === 'opportunities' && 'Opportunities'}
              {tab === 'archive' && 'Archive'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {/* TODAY: One Action at a Time */}
        {view === 'today' && !selectedProspect && (
          <TodayView onSelectProspect={setSelectedProspect} />
        )}

        {/* TODAY: Prospect Expanded (Full Company Data) */}
        {view === 'today' && selectedProspect && (
          <ProspectDetail prospect={selectedProspect} onBack={() => setSelectedProspect(null)} />
        )}

        {/* CONVERSATIONS: Timeline View */}
        {view === 'conversations' && <ConversationsView />}

        {/* OPPORTUNITIES: Standing Order Queue */}
        {view === 'opportunities' && <OpportunitiesView />}

        {/* ARCHIVE: Finished/Stalled */}
        {view === 'archive' && <ArchiveView />}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1: TODAY
// ─────────────────────────────────────────────────────────────────────────

function TodayView({ onSelectProspect }: { onSelectProspect: (id: string) => void }) {
  const prospect = {
    id: 'haart-001',
    name: 'haart',
    category: 'Estate Agents',
    city: 'Leeds',
    pressure_type: 'Service Quality Inconsistency',
    pressure_reason: '4.8★ (best branch) vs 3.2★ (newest branch)',
    email_subject: 'haart: Consistent quality across all your locations',
    email_body: `Hi haart,

Your best branch gets 4.8★ reviews. Your newest gets 3.2★. Same brand. Different experience.

That's a challenge because you're managing quality variance personally across locations.

We worked with a similar estate agent network that grew to 12 locations while maintaining 4.3★ average. Variance dropped from 1.8★ to 0.3★ in 8 months.

Does this variance across locations match what you're experiencing?

Looking forward to talking.`,
  };

  return (
    <div className="max-w-2xl">
      {/* Prospect Header */}
      <div className="mb-12">
        <h2 className="text-4xl font-serif font-bold mb-2">{prospect.name}</h2>
        <p className="text-sm text-gray-600">
          {prospect.category} • {prospect.city}
        </p>
      </div>

      {/* Pressure Context */}
      <div className="mb-8">
        <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Why We're Reaching Out</p>
        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <p className="text-sm font-medium text-gray-900 mb-1">{prospect.pressure_type}</p>
          <p className="text-sm text-gray-700">{prospect.pressure_reason}</p>
          <button
            onClick={() => onSelectProspect(prospect.id)}
            className="text-sm text-gray-600 hover:text-gray-900 mt-3 underline"
          >
            View full company data →
          </button>
        </div>
      </div>

      {/* Email to Send */}
      <div className="mb-8">
        <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Email Ready to Send</p>
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Subject:</p>
            <p className="text-sm font-medium text-gray-900">{prospect.email_subject}</p>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Body:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{prospect.email_body}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800">
          ✓ Approve & Send
        </button>
        <button className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
          ✏️ Customize
        </button>
        <button className="px-6 py-3 border border-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
          ⏭️ Skip
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PROSPECT DETAIL: Full Company Data
// ─────────────────────────────────────────────────────────────────────────

function ProspectDetail({ prospect, onBack }: { prospect: string; onBack: () => void }) {
  return (
    <div className="max-w-3xl">
      <button
        onClick={onBack}
        className="text-sm text-gray-600 hover:text-gray-900 mb-6 underline"
      >
        ← Back to approval
      </button>

      <h2 className="text-3xl font-serif font-bold mb-8">Full Company Information</h2>

      <div className="grid grid-cols-2 gap-8">
        {/* Company Profile */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Company Name</p>
            <p className="text-sm font-medium text-gray-900 mt-1">haart</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Address</p>
            <p className="text-sm text-gray-700 mt-1">Multiple locations (Leeds, Alwoodley, etc.)</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Phone</p>
            <p className="text-sm text-gray-700 mt-1">(123) 456-7890</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Website</p>
            <p className="text-sm text-gray-700 mt-1">haart.co.uk</p>
          </div>
        </div>

        {/* Enrichment Data */}
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Employees</p>
            <p className="text-sm text-gray-700 mt-1">500-1,000</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Industry</p>
            <p className="text-sm text-gray-700 mt-1">Real Estate / Property Management</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Founded</p>
            <p className="text-sm text-gray-700 mt-1">1995</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 tracking-wider">Social</p>
            <p className="text-sm text-gray-700 mt-1">LinkedIn • Twitter • Facebook</p>
          </div>
        </div>
      </div>

      {/* Observation Trail */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-xs uppercase text-gray-500 tracking-wider mb-4">Observation Trail</p>
        <div className="space-y-3">
          <div className="text-sm">
            <p className="font-medium text-gray-900">Best branch (Leeds): 4.8★</p>
            <p className="text-gray-600">Consistently high reviews, strong local presence</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Newest branch (Alwoodley): 3.2★</p>
            <p className="text-gray-600">Recent opening, quality issues noted in reviews</p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">Growing network</p>
            <p className="text-gray-600">Expanding to 12 locations, consistency challenge</p>
          </div>
        </div>
      </div>

      {/* Return to Approval */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
        >
          Ready to Approve & Send
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2: CONVERSATIONS
// ─────────────────────────────────────────────────────────────────────────

function ConversationsView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-6">Select a company to view conversation history</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600">🔨 Timeline view (emails, calls, notes) coming soon</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3: OPPORTUNITIES
// ─────────────────────────────────────────────────────────────────────────

function OpportunitiesView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-6">Ready for Standing Orders</h2>
      <div className="space-y-3">
        <OpportunityCard
          name="Cornerstone Logistics"
          category="Removals"
          touches={4}
          status="Engaged but not replied"
        />
        <OpportunityCard
          name="Monroe Estate Agents"
          category="Estate Agents"
          touches={3}
          status="Slow to respond"
        />
      </div>
    </div>
  );
}

function OpportunityCard({
  name,
  category,
  touches,
  status,
}: {
  name: string;
  category: string;
  touches: number;
  status: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-600">{category}</p>
          <p className="text-sm text-gray-700 mt-2">{touches} touches • {status}</p>
        </div>
        <button className="px-3 py-2 bg-gray-900 text-white text-xs rounded hover:bg-gray-800">
          Create SO
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 4: ARCHIVE
// ─────────────────────────────────────────────────────────────────────────

function ArchiveView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold mb-6">Finished & Stalled</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-sm text-gray-600">🔨 Archive view (with reactivate option) coming soon</p>
      </div>
    </div>
  );
}
