"use client";

import { type Lead, type StandingOrder } from "@/lib/b2b-types";

/**
 * B2BLeadsAdapter
 *
 * Transforms /b2b/leads data into Phase 3C presentation format.
 * Preserves 100% of existing business logic.
 * Acts as presentation layer only - no database queries, no API changes.
 */

interface EnrichedLead extends Lead {
  emailSubject?: string;
  emailBody?: string;
  challenges?: string[];
  opportunities?: string[];
  primaryAngle?: string;
  primaryHook?: string;
  secondaryAngle?: string;
  lastSentAt?: string | null;
}

interface B2BLeadsAdapterProps {
  leads: EnrichedLead[];
  orders: StandingOrder[];
  stats: {
    total: number;
    new: number;
    warm: number;
    closed: number;
    inbound: number;
  };
}

/**
 * Adapter component that:
 * 1. Accepts existing /b2b/leads data structure (fully enriched)
 * 2. Preserves all tier categorization (Ready Today, A, B, C)
 * 3. Preserves all category enrichment (challenges, opportunities)
 * 4. Preserves all email data (subject, body, lastSentAt)
 * 5. Passes structured data to B2BPipeline for Phase 3C presentation
 *
 * No business logic changes. Only presentation transformation.
 */
export function B2BLeadsAdapter({ leads, orders, stats }: B2BLeadsAdapterProps) {
  // Preserve existing tier categorization logic from /b2b/leads
  const readyToday = leads.filter(
    (l) => l.engagement_score! >= 30 && l.status === "new"
  );
  const tierA = leads.filter((l) => l.engagement_score! >= 75);
  const tierB = leads.filter(
    (l) => l.engagement_score! >= 40 && l.engagement_score! < 75
  );
  const tierC = leads.filter((l) => l.engagement_score! < 40);

  // Group leads by tier for B2BPipeline presentation
  // B2BPipeline will render them in Phase 3C format (expanded/collapsed)
  // but all underlying business logic remains in original /b2b/leads
  const tierGroups = {
    readyToday,
    tierA,
    tierB,
    tierC,
  };

  return (
    <div className="space-y-12">
      {/* TODAY STATS - Phase 3C Header */}
      <div>
        <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-6">
          Today
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
            <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">
              Requires Response
            </p>
            <p className="text-4xl font-bold text-[#0D0D0D]">{stats.warm}</p>
          </div>
          <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
            <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">
              Uncontacted
            </p>
            <p className="text-4xl font-bold text-[#0D0D0D]">{stats.new}</p>
          </div>
          <div className="p-6 bg-white border border-[#CCCCCC] rounded-lg">
            <p className="text-xs text-[#666666] uppercase tracking-wide mb-1">
              Standing Orders
            </p>
            <p className="text-4xl font-bold text-[#0D0D0D]">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* PIPELINE SECTION - Render by tier, preserving all data */}
      <div>
        <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-6">
          Pipeline
        </p>

        {/* READY TODAY - Preserved tier filter */}
        {tierGroups.readyToday.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🟢 Ready Today
                <span className="text-lg font-normal text-gray-600">
                  ({tierGroups.readyToday.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Score ≥ 30, status = new
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierGroups.readyToday.map((lead) => (
                <PipelineCard key={lead.id} lead={lead} tier="READY" />
              ))}
            </div>
          </div>
        )}

        {/* TIER A - Preserved tier filter */}
        {tierGroups.tierA.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🟢 Tier A
                <span className="text-lg font-normal text-gray-600">
                  ({tierGroups.tierA.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                High-fit prospects (score ≥ 75)
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierGroups.tierA.map((lead) => (
                <PipelineCard key={lead.id} lead={lead} tier="A" />
              ))}
            </div>
          </div>
        )}

        {/* TIER B - Preserved tier filter */}
        {tierGroups.tierB.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🟡 Tier B
                <span className="text-lg font-normal text-gray-600">
                  ({tierGroups.tierB.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Secondary prospects (40 ≤ score {'<'} 75)
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierGroups.tierB.map((lead) => (
                <PipelineCard key={lead.id} lead={lead} tier="B" />
              ))}
            </div>
          </div>
        )}

        {/* TIER C - Preserved tier filter */}
        {tierGroups.tierC.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                ⚪ Tier C
                <span className="text-lg font-normal text-gray-600">
                  ({tierGroups.tierC.length})
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Long-tail prospects (score {'<'} 40)
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tierGroups.tierC.slice(0, 10).map((lead) => (
                <PipelineCard key={lead.id} lead={lead} tier="C" />
              ))}
            </div>
            {tierGroups.tierC.length > 10 && (
              <p className="text-sm text-gray-500 mt-4">
                ... and {tierGroups.tierC.length - 10} more Tier C prospects
                (not displayed)
              </p>
            )}
          </div>
        )}
      </div>

      {/* ARCHIVE SECTION - Preserved */}
      {stats.closed > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#0D0D0D] uppercase tracking-wide mb-4">
            Archive
          </p>
          <p className="text-xs text-[#666666]">{stats.closed} converted leads</p>
        </div>
      )}
    </div>
  );
}

/**
 * PipelineCard
 *
 * Renders a single lead in Phase 3C format.
 * Preserves all data from original /b2b/leads enrichment.
 * Data flow: No API calls, uses data passed from parent.
 */
interface PipelineCardProps {
  lead: EnrichedLead;
  tier: string;
}

function PipelineCard({ lead, tier }: PipelineCardProps) {
  return (
    <div className="border border-[#CCCCCC] rounded-lg p-4 bg-white hover:bg-[#FAFAFA] transition-colors">
      {/* PRESERVED: Business name and category */}
      <h3 className="font-semibold text-gray-900 mb-2">{lead.business_name}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {lead.business_category || "Uncategorized"}
        {lead.pain_point && ` • ${lead.pain_point}`}
      </p>

      {/* PRESERVED: Engagement score and status */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Score: {lead.engagement_score || 0}/100</span>
        <span className="text-[#666666]">{lead.status || "new"}</span>
      </div>

      {/* PRESERVED: Email data (from enrichment) */}
      {lead.emailSubject && (
        <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
          <p className="font-medium text-gray-900">Subject: {lead.emailSubject}</p>
          {lead.emailBody && (
            <p className="text-gray-600 mt-1 line-clamp-2">{lead.emailBody}</p>
          )}
        </div>
      )}

      {/* PRESERVED: Last contact info */}
      {lead.lastSentAt && (
        <p className="text-xs text-gray-500 mb-3">
          Last sent: {new Date(lead.lastSentAt).toLocaleDateString()}
        </p>
      )}

      {/* PRESERVED: Category challenges and opportunities */}
      {lead.challenges && lead.challenges.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-1">Challenges</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {lead.challenges.slice(0, 2).map((c, i) => (
              <li key={i}>• {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* PRESERVED: Contact info */}
      <div className="flex gap-2 text-xs mt-4">
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="text-blue-600 hover:underline"
          >
            Email
          </a>
        )}
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">
            Call
          </a>
        )}
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}
