/**
 * GET /api/b2b/operator-os/conversations/:prospect_id
 *
 * Returns full interaction timeline for one prospect
 * Emails, calls, notes, replies, standing orders, gate progression
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospect_id: string }> }
) {
  const { prospect_id } = await params;

  // Mock conversation history
  const conversations: Record<string, any> = {
    'haart-001': {
      prospect_id: 'haart-001',
      prospect_name: 'haart',
      timeline: [
        {
          type: 'email_sent',
          date: '2026-06-20T10:00:00Z',
          subject: 'haart: Consistent quality across all your locations',
          status: 'delivered',
          gate_1_recorded: true,
        },
        {
          type: 'email_opened',
          date: '2026-06-20T14:30:00Z',
          gate_2_recorded: true,
        },
        {
          type: 'observation',
          date: '2026-06-20T16:00:00Z',
          note: 'haart manages 12 locations independently, quality variance consistent challenge',
        },
      ],
      email_history: [
        {
          date: '2026-06-20',
          subject: 'haart: Consistent quality across all your locations',
          body: 'Recognition of 4.8★ vs 3.2★ variance...',
          status: 'opened',
        },
      ],
      standing_orders: [],
      gate_status: {
        gate_1_delivered: true,
        gate_2_opened: true,
        gate_3_visited: false,
        gate_4_replied: false,
        gate_5_advancing: false,
        gate_6_hot: false,
      },
    },
    'cornerstone-001': {
      prospect_id: 'cornerstone-001',
      prospect_name: 'Cornerstone Logistics',
      timeline: [
        {
          type: 'email_sent',
          date: '2026-06-20T09:00:00Z',
          subject: 'Cornerstone: Making your 75-day deadline work',
          status: 'delivered',
          gate_1_recorded: true,
        },
      ],
      email_history: [],
      standing_orders: [],
      gate_status: {
        gate_1_delivered: true,
        gate_2_opened: false,
        gate_3_visited: false,
        gate_4_replied: false,
        gate_5_advancing: false,
        gate_6_hot: false,
      },
    },
  };

  const conversation = conversations[prospect_id];

  if (!conversation) {
    return Response.json({ error: 'Prospect not found' }, { status: 404 });
  }

  return Response.json({
    success: true,
    conversation,
  });
}
