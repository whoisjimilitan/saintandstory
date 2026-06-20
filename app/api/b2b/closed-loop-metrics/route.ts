/**
 * GET /api/b2b/closed-loop-metrics
 *
 * Returns funnel metrics for closed-loop dashboard
 * Shows: gate 1-6 counts, conversion rate, biggest drop, trends
 */

export async function GET(request: Request) {
  try {
    // In production, this queries b2b_leads with gate status columns
    // For now, returning example metrics based on test data

    const metrics = {
      funnel: {
        gate_1_delivered: 100,
        gate_2_opened: 82,
        gate_3_visited: 61,
        gate_4_replied: 44,
        gate_5_advancing: 22,
        gate_6_hot: 18, // Standing orders created
      },
      conversion_rate: 0.18, // 18% from cold to hot
      avg_days_to_hot: 8.3,
      biggest_drop: {
        from_gate: 2,
        to_gate: 3,
        count: 21,
        percentage: 25.6,
      },
      week_trend: 0.22, // +22% vs last week
      action_items: {
        total_needing_action: 8,
        follow_up_1_due: 3,
        follow_up_2_due: 2,
        follow_up_3_due: 1,
        operator_brief_needed: 2,
      },
    };

    return Response.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching closed-loop metrics:', error);
    return Response.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
