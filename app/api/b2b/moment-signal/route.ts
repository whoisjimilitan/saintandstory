import { neon } from "@neondatabase/serverless";
import { transitionLeadState } from "@/lib/lead-state-machine";

interface MomentSignal {
  moment_id: string;
  industry: string;
  trigger_event_shown?: string;
  section_viewed?: string;
  cta_clicked?: boolean;
  signal_type?: string;
  signal_layer?: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  const signal: MomentSignal = await request.json();

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Map signal_type to database fields
    let sectionViewed = null;
    let ctaClicked = false;

    if (signal.signal_type === "section_viewed") {
      sectionViewed = signal.section;
    } else if (signal.signal_type === "cta_clicked") {
      ctaClicked = true;
    }

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
        ${signal.trigger_event_shown || null},
        ${sectionViewed},
        ${ctaClicked},
        ${signal.signal_type || 'interaction'},
        ${new Date().toISOString()}
      )
    `;

    console.log(`[MOMENT-SIGNAL] ${signal.signal_type || 'interaction'} event recorded for moment ${signal.moment_id}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[MOMENT-SIGNAL] Failed:", error);
    return Response.json({ error: "Failed to record signal" }, { status: 500 });
  }
}
