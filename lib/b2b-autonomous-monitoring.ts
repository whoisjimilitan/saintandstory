/**
 * AUTONOMOUS GATE MONITORING
 * Monitors gates 2-6 continuously
 */

export interface ProspectGateStatus {
  prospect_id: string;
  prospect_name: string;
  gate_1_delivered_at: string;
  gate_2_opened_at?: string;
  gate_3_visited_at?: string;
  gate_4_replied_at?: string;
  gate_5_advancing_at?: string;
  gate_6_hot_at?: string;
  current_gate: number;
  days_in_current_gate: number;
  next_action?: string;
}

/**
 * Simulate gate progression (in production: track from email service)
 */
export function monitorGateProgression(prospect_id: string): ProspectGateStatus {
  // Mock: Simulate realistic gate progression
  const gate1 = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2); // 2 days ago

  // Gate 2: ~70% open within 24 hours
  const opened = Math.random() < 0.7;
  const gate2 = opened ? new Date(gate1.getTime() + 1000 * 60 * 60 * 8) : undefined;

  // Gate 3: ~50% visit if opened
  const visited = opened && Math.random() < 0.5;
  const gate3 = visited ? new Date(gate2!.getTime() + 1000 * 60 * 60 * 4) : undefined;

  // Gate 4: ~40% reply if visited
  const replied = visited && Math.random() < 0.4;
  const gate4 = replied ? new Date(gate3!.getTime() + 1000 * 60 * 60 * 12) : undefined;

  // Gate 5: ~30% advancing if replied
  const advancing = replied && Math.random() < 0.3;
  const gate5 = advancing ? new Date(gate4!.getTime() + 1000 * 60 * 60 * 24) : undefined;

  // Gate 6: ~20% standing order if advancing
  const hot = advancing && Math.random() < 0.2;
  const gate6 = hot ? new Date(gate5!.getTime() + 1000 * 60 * 60 * 24 * 2) : undefined;

  // Determine current gate
  let currentGate = 1;
  let daysInGate = 0;
  let nextAction = '';

  if (gate6) {
    currentGate = 6;
    daysInGate = Math.floor(
      (new Date().getTime() - gate6.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextAction = 'Standing order active';
  } else if (gate5) {
    currentGate = 5;
    daysInGate = Math.floor(
      (new Date().getTime() - gate5.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextAction = 'Monitor for standing order readiness';
  } else if (gate4) {
    currentGate = 4;
    daysInGate = Math.floor(
      (new Date().getTime() - gate4.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextAction = 'Send follow-up offer';
  } else if (gate3) {
    currentGate = 3;
    daysInGate = Math.floor(
      (new Date().getTime() - gate3.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextAction = 'Send follow-up email (new angle)';
  } else if (gate2) {
    currentGate = 2;
    daysInGate = Math.floor(
      (new Date().getTime() - gate2.getTime()) / (1000 * 60 * 60 * 24)
    );
    nextAction = 'Wait for visit or send follow-up (3-5 days)';
  } else {
    currentGate = 1;
    daysInGate = 2;
    nextAction = 'Monitor for open (24-48 hours)';
  }

  return {
    prospect_id,
    prospect_name: `Prospect-${prospect_id}`,
    gate_1_delivered_at: gate1.toISOString(),
    gate_2_opened_at: gate2?.toISOString(),
    gate_3_visited_at: gate3?.toISOString(),
    gate_4_replied_at: gate4?.toISOString(),
    gate_5_advancing_at: gate5?.toISOString(),
    gate_6_hot_at: gate6?.toISOString(),
    current_gate: currentGate,
    days_in_current_gate: daysInGate,
    next_action: nextAction,
  };
}

/**
 * Monitor all sent emails
 */
export function monitorAllProspects(prospectIds: string[]): ProspectGateStatus[] {
  return prospectIds.map((id) => monitorGateProgression(id));
}

/**
 * Detect stalled prospects (stuck in gate too long)
 */
export function detectStalledProspects(statuses: ProspectGateStatus[]): ProspectGateStatus[] {
  return statuses.filter((s) => {
    // Stalled if:
    // Gate 1-2: > 3 days without opening
    // Gate 2-3: > 3 days without visit
    // Gate 3-4: > 7 days without reply
    if (s.current_gate <= 2 && s.days_in_current_gate > 3) return true;
    if (s.current_gate === 3 && s.days_in_current_gate > 3) return true;
    if (s.current_gate === 4 && s.days_in_current_gate > 7) return true;
    return false;
  });
}

/**
 * Autonomous monitoring process
 */
export function runAutonomousMonitoring(sentEmails: string[]): {
  total_monitored: number;
  gate_distribution: Record<number, number>;
  stalled_count: number;
  next_actions: string[];
  statuses: ProspectGateStatus[];
} {
  console.log(`[Monitoring] Monitoring ${sentEmails.length} prospects...`);

  const statuses = monitorAllProspects(sentEmails);

  // Gate distribution
  const gateDistribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  };
  statuses.forEach((s) => {
    gateDistribution[s.current_gate]++;
  });

  // Detect stalled
  const stalled = detectStalledProspects(statuses);

  // Collect next actions
  const nextActions = statuses.map((s) => s.next_action!);

  console.log(`[Monitoring] Gate 1: ${gateDistribution[1]} | Gate 2: ${gateDistribution[2]} | Gate 3: ${gateDistribution[3]} | Gate 4: ${gateDistribution[4]} | Gate 5: ${gateDistribution[5]} | Gate 6: ${gateDistribution[6]}`);
  console.log(`[Monitoring] Stalled prospects: ${stalled.length}`);

  return {
    total_monitored: statuses.length,
    gate_distribution: gateDistribution,
    stalled_count: stalled.length,
    next_actions: nextActions,
    statuses,
  };
}
