/**
 * GET /api/b2b/action-items
 *
 * Returns prospects needing action today
 * Sorted by urgency (follow-up type and days stalled)
 */

export async function GET(request: Request) {
  try {
    // In production, queries b2b_leads for stalled prospects
    // Returns them with their action type

    const action_items = [
      {
        prospect_id: 'haart-leeds-001',
        prospect_name: 'haart',
        category: 'estate-agents',
        location: 'Leeds',
        current_gate: 3,
        status: 'stalled',
        action_needed: 'follow_up_1',
        action_label: 'Send Follow-up 1 (Different Angle)',
        days_in_gate: 3,
        stalled_at_gate: 2,
        urgency: 'high',
      },
      {
        prospect_id: 'monroe-001',
        prospect_name: 'Monroe Estate Agents',
        category: 'estate-agents',
        location: 'Alwoodley',
        current_gate: 3,
        status: 'stalled',
        action_needed: 'follow_up_2',
        action_label: 'Send Follow-up 2 (Scarcity)',
        days_in_gate: 1,
        stalled_at_gate: 3,
        urgency: 'medium',
      },
      {
        prospect_id: 'cornerstone-001',
        prospect_name: 'Cornerstone Logistics',
        category: 'removals',
        location: 'London',
        current_gate: 4,
        status: 'engaged',
        action_needed: 'operator_brief',
        action_label: 'Respond to Prospect',
        days_in_gate: 0,
        reply_preview: 'How does this work for our 12 branches?',
        urgency: 'high',
      },
      {
        prospect_id: 'westpoint-001',
        prospect_name: 'Westpoint Pharmacy',
        category: 'pharmacy',
        location: 'Bristol',
        current_gate: 5,
        status: 'trusting',
        action_needed: 'follow_up_3',
        action_label: 'Operator Phone Call',
        days_in_gate: 2,
        stalled_at_gate: 5,
        urgency: 'medium',
      },
    ];

    // Sort by urgency and days
    const sorted = action_items.sort((a, b) => {
      const urgency_order: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const a_order = urgency_order[a.urgency] ?? 2;
      const b_order = urgency_order[b.urgency] ?? 2;
      if (a_order !== b_order) {
        return a_order - b_order;
      }
      return b.days_in_gate - a.days_in_gate;
    });

    return Response.json({
      success: true,
      data: {
        total_count: sorted.length,
        action_items: sorted,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return Response.json(
      { error: 'Failed to fetch action items' },
      { status: 500 }
    );
  }
}
