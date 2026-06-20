/**
 * GET /api/b2b/operator-os/today
 *
 * Returns next prospect to approve and send
 * One prospect at a time (OS principle)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mock data: Queue of prospects ready for approval
  const todayQueue = [
    {
      id: 'haart-001',
      name: 'haart',
      category: 'Estate Agents',
      city: 'Leeds',
      pressure_type: 'Service Quality Inconsistency',
      pressure_reason: '4.8★ (best branch) vs 3.2★ (newest branch)',
      pressure_detection: {
        signal_1: 'Star rating variance detected',
        signal_2: 'Multiple locations with quality gap',
        confidence: 0.92,
      },
      email_subject: 'haart: Consistent quality across all your locations',
      email_body: `Hi haart,

Your best branch gets 4.8★ reviews. Your newest gets 3.2★. Same brand. Different experience.

That's a challenge because you're managing quality variance personally across locations.

We worked with a similar estate agent network that grew to 12 locations while maintaining 4.3★ average. Variance dropped from 1.8★ to 0.3★ in 8 months.

Does this variance across locations match what you're experiencing?

Looking forward to talking.`,
      company_data: {
        name: 'haart',
        locations: 12,
        employees: '500-1000',
        founded: 1995,
        website: 'haart.co.uk',
        phone: '(123) 456-7890',
      },
      observations: [
        'Best branch (Leeds): 4.8★ - consistently high reviews',
        'Newest branch (Alwoodley): 3.2★ - recent quality issues',
        'Growing network - expanding to multiple locations',
        'Opportunity: systematize quality across branches',
      ],
    },
    {
      id: 'cornerstone-001',
      name: 'Cornerstone Logistics',
      category: 'Removals',
      city: 'London',
      pressure_type: 'Time-Critical Movement',
      pressure_reason: 'Warehouse moving in 75 days, standard process takes 16 weeks',
      pressure_detection: {
        signal_1: 'Moving deadline detected',
        signal_2: 'Timeline mismatch identified',
        confidence: 0.88,
      },
      email_subject: 'Cornerstone: Making your 75-day deadline work',
      email_body: `Hi Cornerstone,

Your warehouse moves in 75 days. Standard implementation takes 16 weeks.

That's a gap because you need systems operational before the move, not after.

We worked with a logistics company relocating in 60 days. Implemented in 42 days. Zero disruption during transition.

When exactly is your move date?

Let's talk.`,
      company_data: {
        name: 'Cornerstone Logistics',
        employees: '200-500',
        founded: 2010,
        website: 'cornerstone-logistics.com',
        phone: '(456) 789-0123',
      },
      observations: [
        'Warehouse relocation with tight deadline',
        'Current processes manual and slow',
        'Opportunity: implement before move',
      ],
    },
  ];

  // Return first prospect in queue
  const nextProspect = todayQueue[0];

  return NextResponse.json({
    success: true,
    prospect: nextProspect,
    position_in_queue: 1,
    total_in_queue: todayQueue.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Handle actions
  if (body.action === 'approve_and_send') {
    return NextResponse.json({
      success: true,
      action: 'email_sent',
      prospect_id: body.prospect_id,
      gate_1_recorded: 'gate_1_delivered_at',
      timestamp: new Date().toISOString(),
      next_action: 'show_next_prospect',
    });
  }

  if (body.action === 'skip') {
    return NextResponse.json({
      success: true,
      action: 'prospect_deferred',
      prospect_id: body.prospect_id,
      reason: 'Deferred by operator',
      next_action: 'show_next_prospect',
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
