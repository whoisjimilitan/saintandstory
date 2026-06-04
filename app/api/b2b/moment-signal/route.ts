import { neon } from "@neondatabase/serverless";
import { transitionLeadState } from "@/lib/lead-state-machine";

interface MomentSignal {
  moment_id: string;
  industry: string;
  trigger_event_shown: string;
  section_viewed: string;
  cta_clicked: boolean;
  lead_id?: string;
  signal_layer?: string;
  engagement_signals?: {
    tabFocusActive: boolean;
    scrollDepth: number;
    sectionVisible: boolean;
  };
}

export async function POST(request: Request) {
  const signal: MomentSignal = await request.json();

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Record raw event
    await sql`
      INSERT INTO b2b_moment_signals (
        moment_id,
        industry,
        trigger_event_shown,
        section_viewed,
        cta_clicked,
        signal_layer,
        recorded_at
      )
      VALUES (
        ${signal.moment_id},
        ${signal.industry},
        ${signal.trigger_event_shown},
        ${signal.section_viewed},
        ${signal.cta_clicked},
        ${signal.signal_layer || 'interaction'},
        ${new Date().toISOString()}
      )
    `;

    console.log(`[MOMENT-SIGNAL] ${signal.signal_layer || 'interaction'} event recorded`);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[MOMENT-SIGNAL] Failed:", error);
    return Response.json({ error: "Failed to record signal" }, { status: 500 });
  }
}
