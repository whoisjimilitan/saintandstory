import { neon } from "@neondatabase/serverless";

export type LeadState = "new" | "recognized" | "engaged" | "self_confirmed";

interface StateTransition {
  lead_id: number;
  from_state: LeadState;
  to_state: LeadState;
  trigger_event?: string;
}

export async function transitionLeadState(
  lead_id: number,
  toState: LeadState,
  triggerEvent?: string
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get current state
    const [lead] = await sql`
      SELECT lead_state FROM b2b_leads WHERE id = ${lead_id}
    `;

    if (!lead) {
      console.warn(`[STATE-MACHINE] Lead not found: ${lead_id}`);
      return false;
    }

    const fromState = (lead.lead_state as LeadState) || "new";
    console.log(`[STATE-MACHINE] Current state for ${lead_id}: ${fromState}`);

    // Validate transition path
    const validTransitions: Record<LeadState, LeadState[]> = {
      new: ["recognized"],
      recognized: ["engaged"],
      engaged: ["self_confirmed"],
      self_confirmed: [],
    };

    if (!validTransitions[fromState]?.includes(toState)) {
      console.warn(`[STATE-MACHINE] Invalid transition: ${fromState} → ${toState}`);
      return false;
    }

    // Update lead state
    const updateResult = await sql`
      UPDATE b2b_leads
      SET lead_state = ${toState}, transitioned_at = NOW()
      WHERE id = ${lead_id}
    `;
    console.log(`[STATE-MACHINE] UPDATE executed for ${lead_id}: ${fromState} → ${toState}`);

    // Log transition to audit trail
    await sql`
      INSERT INTO lead_state_transitions (lead_id, from_state, to_state, trigger_event)
      VALUES (${lead_id}, ${fromState}, ${toState}, ${triggerEvent || null})
    `;
    console.log(`[STATE-MACHINE] Transition logged for ${lead_id}: ${fromState} → ${toState} (trigger: ${triggerEvent})`);

    return true;
  } catch (error) {
    console.error("[STATE-MACHINE] Transition failed for lead", lead_id, ":", error instanceof Error ? error.message : String(error));
    return false;
  }
}

export async function confirmLeadPain(
  lead_id: number,
  trigger_event: string
): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;

  const sql = neon(process.env.DATABASE_URL);

  try {
    // First transition state (handles validation and logging)
    await transitionLeadState(lead_id, "self_confirmed", trigger_event);

    // Then update confirmation fields
    await sql`
      UPDATE b2b_leads
      SET
        self_confirmed = true,
        confirmation_source = 'trigger_event_match',
        confirmed_at = ${new Date().toISOString()},
        trigger_event_matched = ${trigger_event}
      WHERE id = ${lead_id}
    `;

    console.log(`[SELF-CONFIRMED] Lead ${lead_id} confirmed: ${trigger_event}`);
    return true;
  } catch (error) {
    console.error("[CONFIRM-PAIN] Failed:", error);
    return false;
  }
}
