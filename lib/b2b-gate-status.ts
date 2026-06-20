/**
 * GATE STATUS TRACKER
 *
 * Tracks prospect progression through 6 gates:
 * Gate 1: Email delivered
 * Gate 2: Email opened (wait 72h)
 * Gate 3: Page visited (wait 24h)
 * Gate 4: Prospect replied
 * Gate 5: Conversation advancing (wait 48h)
 * Gate 6: Standing order created = HOT PROSPECT
 */

export interface GateStatus {
  prospect_id: string;
  prospect_name: string;
  current_gate: 1 | 2 | 3 | 4 | 5 | 6;
  status: 'cold' | 'warming' | 'engaged' | 'trusting' | 'hot' | 'stalled';
  gates_passed: {
    gate_1_delivered: boolean;
    gate_2_opened: boolean;
    gate_3_visited: boolean;
    gate_4_replied: boolean;
    gate_5_advancing: boolean;
    gate_6_hot: boolean;
  };
  gates_timestamps: {
    gate_1_delivered_at: Date | null;
    gate_2_opened_at: Date | null;
    gate_3_visited_at: Date | null;
    gate_4_replied_at: Date | null;
    gate_5_advancing_at: Date | null;
    gate_6_hot_at: Date | null;
  };
  days_in_current_gate: number;
  stalled: boolean;
  stalled_at_gate?: number;
  time_until_followup?: number; // hours
}

/**
 * Get current gate status for a prospect
 * Returns which gate they're at and whether they're stalled
 */
export async function getGateStatus(prospect_id: string): Promise<GateStatus> {
  // In real implementation, this queries b2b_leads table for gate timestamps
  // For now, returning example structure

  const gates_timestamps: GateStatus['gates_timestamps'] = {
    gate_1_delivered_at: new Date('2026-06-20T10:00:00'),
    gate_2_opened_at: new Date('2026-06-20T14:30:00'),
    gate_3_visited_at: null,
    gate_4_replied_at: null,
    gate_5_advancing_at: null,
    gate_6_hot_at: null,
  };

  // Determine current gate
  let current_gate: 1 | 2 | 3 | 4 | 5 | 6 = 1;
  if (gates_timestamps.gate_6_hot_at) current_gate = 6;
  else if (gates_timestamps.gate_5_advancing_at) current_gate = 5;
  else if (gates_timestamps.gate_4_replied_at) current_gate = 4;
  else if (gates_timestamps.gate_3_visited_at) current_gate = 3;
  else if (gates_timestamps.gate_2_opened_at) current_gate = 2;

  // Determine status
  let status: 'cold' | 'warming' | 'engaged' | 'trusting' | 'hot' | 'stalled' =
    'cold';
  if (current_gate === 6) status = 'hot';
  else if (current_gate === 5) status = 'trusting';
  else if (current_gate === 4) status = 'engaged';
  else if (current_gate === 3) status = 'warming';
  else if (current_gate === 2) status = 'warming';

  // Check if stalled
  const now = new Date();
  let stalled = false;
  let stalled_at_gate: number | undefined;

  // Gate 2: stalled if opened_at NULL after 72h
  if (!gates_timestamps.gate_2_opened_at && gates_timestamps.gate_1_delivered_at) {
    const hours_since = (now.getTime() - gates_timestamps.gate_1_delivered_at.getTime()) / (1000 * 60 * 60);
    if (hours_since > 72) {
      stalled = true;
      stalled_at_gate = 2;
    }
  }

  // Gate 3: stalled if visited_at NULL after 24h
  if (!gates_timestamps.gate_3_visited_at && gates_timestamps.gate_2_opened_at) {
    const hours_since = (now.getTime() - gates_timestamps.gate_2_opened_at.getTime()) / (1000 * 60 * 60);
    if (hours_since > 24) {
      stalled = true;
      stalled_at_gate = 3;
    }
  }

  // Gate 5: stalled if advancing_at NULL after 48h
  if (!gates_timestamps.gate_5_advancing_at && gates_timestamps.gate_4_replied_at) {
    const replied_at = gates_timestamps.gate_4_replied_at;
    const hours_since = (now.getTime() - replied_at.getTime()) / (1000 * 60 * 60);
    if (hours_since > 48) {
      stalled = true;
      stalled_at_gate = 5;
    }
  }

  // Calculate days in current gate
  const last_timestamp =
    gates_timestamps.gate_6_hot_at ||
    gates_timestamps.gate_5_advancing_at ||
    gates_timestamps.gate_4_replied_at ||
    gates_timestamps.gate_3_visited_at ||
    gates_timestamps.gate_2_opened_at ||
    gates_timestamps.gate_1_delivered_at;

  const days_in_current_gate = last_timestamp
    ? Math.floor((now.getTime() - last_timestamp.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    prospect_id,
    prospect_name: 'Example Prospect',
    current_gate,
    status: stalled ? 'stalled' : status,
    gates_passed: {
      gate_1_delivered: !!gates_timestamps.gate_1_delivered_at,
      gate_2_opened: !!gates_timestamps.gate_2_opened_at,
      gate_3_visited: !!gates_timestamps.gate_3_visited_at,
      gate_4_replied: !!gates_timestamps.gate_4_replied_at,
      gate_5_advancing: !!gates_timestamps.gate_5_advancing_at,
      gate_6_hot: !!gates_timestamps.gate_6_hot_at,
    },
    gates_timestamps,
    days_in_current_gate,
    stalled,
    stalled_at_gate,
    time_until_followup: stalled_at_gate === 2 ? 72 : stalled_at_gate === 3 ? 24 : 48,
  };
}

/**
 * Check if prospect is stalled at a specific gate
 * Returns true if they've exceeded the time threshold for that gate
 */
export function isProspectStalled(gate_status: GateStatus): boolean {
  return gate_status.stalled;
}

/**
 * Get the follow-up number that should trigger
 * Based on which gate they're stalled at
 */
export function getFollowUpNumber(gate_status: GateStatus): 1 | 2 | 3 | 4 | null {
  if (gate_status.stalled_at_gate === 2) return 1; // Follow-up 1: different angle
  if (gate_status.stalled_at_gate === 3) return 2; // Follow-up 2: scarcity
  if (gate_status.stalled_at_gate === 5) return 3; // Follow-up 3: operator call
  return null; // Not stalled or at final gate
}
