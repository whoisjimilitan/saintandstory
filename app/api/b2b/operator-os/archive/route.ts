/**
 * GET /api/b2b/operator-os/archive
 *
 * Returns archived prospects (completed, stalled, operator-paused)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const archive = [
    {
      id: 'techsmart-001',
      name: 'TechSmart Solutions',
      category: 'IT Services',
      status: 'completed',
      reason: 'Closed deal - standing order converted to customer',
      archived_date: '2026-05-15',
    },
    {
      id: 'globalex-001',
      name: 'GlobalEx Freight',
      category: 'Logistics',
      status: 'stalled',
      reason: 'No engagement after 12 emails (2% open rate)',
      archived_date: '2026-04-20',
      can_reactivate: true,
    },
    {
      id: 'peninsula-001',
      name: 'Peninsula Removals',
      category: 'Removals',
      status: 'paused',
      reason: 'Operator marked as "revisit after Q3"',
      archived_date: '2026-06-10',
      can_reactivate: true,
    },
  ];

  return NextResponse.json({
    success: true,
    archive,
    total: archive.length,
    breakdown: {
      completed: 1,
      stalled: 1,
      paused: 1,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === 'reactivate') {
    return NextResponse.json({
      success: true,
      action: 'prospect_reactivated',
      prospect_id: body.prospect_id,
      status: 'moved_to_today_queue',
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
