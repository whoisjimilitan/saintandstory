"use client";

import { B2BDiscoverySection } from "@/components/B2BDiscoverySection";

interface IntakeSource {
  name: string;
  route: string;
  status: 'operational' | 'hidden' | 'missing';
  count: number;
  last_activity?: string;
  color: string;
}

export function DiscoverView() {
  // Phase 1 Migration: Module version with feature parity to /dashboard/admin/b2b/discovery
  // Uses same B2BDiscoverySection component with enrichment workflow
  // APIs: /api/b2b/discover (postcode search)
  //       /api/b2b/intelligence/prospect-brief (enrichment)
  //       /api/b2b/add-prospect (save to pipeline)
  //       /api/b2b/send (email generation)
  // Status: Module version (new) - legacy route /dashboard/admin/b2b/discovery kept intact for testing

  const sources: IntakeSource[] = [
    {
      name: 'Postcode Search',
      route: '/api/b2b/discover',
      status: 'operational',
      count: 0,
      last_activity: 'On demand',
      color: '#0D0D0D'
    },
    {
      name: 'CSV Import',
      route: '/api/b2b/csv-import',
      status: 'operational',
      count: 0,
      last_activity: 'On demand',
      color: '#0D0D0D'
    },
    {
      name: 'Manual Entry',
      route: '/api/b2b/manual-entry',
      status: 'operational',
      count: 0,
      last_activity: 'On demand',
      color: '#0D0D0D'
    }
  ];

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Operator Discovery.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Find. Recognise. Act.
        </p>
      </div>

      {/* PRIMARY DISCOVERY WORKFLOW */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Find Opportunities
        </p>
        <div className="bg-white border-2 border-[#0D0D0D] rounded p-8 shadow-sm">
          <B2BDiscoverySection sources={sources} />
        </div>
      </div>

      {/* AFTER YOU SEND - CONTINUITY TO PIPELINE */}
      <div className="mb-16 bg-white border border-[#E8E8E8] rounded p-6">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          After You Send
        </p>
        <div className="space-y-3 text-sm text-[#0D0D0D]">
          <p>
            When you SEND an email, the business appears in <strong>Pipeline</strong> within 5 minutes.
          </p>
          <p>
            You'll see if they open it. If they click a link, you'll know they're interested.
          </p>
          <p>
            If they reply, move them to <strong>Orders</strong> to set up the standing order.
          </p>
          <p className="text-[#666666] text-[10px] pt-2">
            Success path: SEND → Open email → Click link → Reply → Standing order (typical: 5–7 days)
          </p>
        </div>
      </div>
    </div>
  );
}
