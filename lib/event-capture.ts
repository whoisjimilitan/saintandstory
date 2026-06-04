export interface RawMomentEvent {
  event_type: string;
  lead_id?: number;
  industry: string;
  trigger_event?: string;
  section?: string;
  timestamp: string;
}

export async function captureRawEvent(event: RawMomentEvent) {
  // No analysis. No scoring. No interpretation.
  // Just record that event happened.
  return event;
}
