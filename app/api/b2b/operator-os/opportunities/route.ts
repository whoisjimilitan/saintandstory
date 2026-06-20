/**
 * GET /api/b2b/operator-os/opportunities
 *
 * Returns prospects ready for standing orders
 * (3+ touches, no reply, good fit)
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const opportunities = [
    {
      id: 'cornerstone-001',
      name: 'Cornerstone Logistics',
      category: 'Removals',
      touches: 4,
      status: 'Engaged but not replied',
      last_contact: '2026-06-19',
      reason_ready: 'Multiple touches, showing interest, ready for standing order',
    },
    {
      id: 'monroe-001',
      name: 'Monroe Estate Agents',
      category: 'Estate Agents',
      touches: 3,
      status: 'Slow to respond',
      last_contact: '2026-06-18',
      reason_ready: 'Consistent pattern, good fit, needs sustained outreach',
    },
    {
      id: 'westpoint-001',
      name: 'Westpoint Pharmacy',
      category: 'Pharmacy',
      touches: 5,
      status: 'Multiple opens, no reply',
      last_contact: '2026-06-17',
      reason_ready: 'High engagement (5 opens), time for standing order escalation',
    },
  ];

  return NextResponse.json({
    success: true,
    opportunities,
    total: opportunities.length,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === 'create_standing_order') {
    return NextResponse.json({
      success: true,
      action: 'standing_order_created',
      prospect_id: body.prospect_id,
      frequency: body.frequency || 'weekly',
      first_email_sent: new Date().toISOString(),
      next_send: 'in 7 days',
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
