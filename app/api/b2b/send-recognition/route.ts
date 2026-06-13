import { neon } from "@neondatabase/serverless";
import { generateRecognitionEmail } from "@/lib/recognition-email";
import { transitionLeadState } from "@/lib/lead-state-machine";
import { generateSlug } from "@/lib/prospect-pages";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Preview recognition email without sending
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const business_name = searchParams.get("business_name");
  const industry = searchParams.get("industry");
  const email = searchParams.get("email");
  const lead_id = searchParams.get("lead_id");

  if (!business_name || !industry || !email || !lead_id) {
    return Response.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const recognitionEmail = generateRecognitionEmail({
    business_name,
    industry,
    email,
    lead_id: parseInt(lead_id),
  });

  if (!recognitionEmail) {
    return Response.json({ error: "No trigger events found" }, { status: 400 });
  }

  return Response.json({
    subject: recognitionEmail.subject,
    body: recognitionEmail.body,
    triggerEvent: recognitionEmail.triggerEvent,
  });
}

export async function POST(request: Request) {
  const { lead_id, business_name, industry, email } = await request.json();

  const recognitionEmail = generateRecognitionEmail({
    business_name,
    industry,
    email,
    lead_id,
  });

  if (!recognitionEmail) {
    return Response.json({ error: "No trigger events found" }, { status: 400 });
  }

  try {
    // Send email
    const { data, error: sendError } = await resend.emails.send({
      from: "james@saintandstory.co.uk",
      to: email,
      subject: recognitionEmail.subject,
      text: recognitionEmail.body,
    });

    if (sendError) {
      console.error(`[RECOGNITION-EMAIL] Resend error: ${sendError.message}`);
      return Response.json({ error: sendError.message }, { status: 500 });
    }

    // Transition state: new → recognized
    const stateTransitioned = await transitionLeadState(lead_id, "recognized", recognitionEmail.triggerEvent);

    if (!stateTransitioned) {
      console.error(`[RECOGNITION-EMAIL] State transition failed for lead ${lead_id}`);
      return Response.json({
        error: "Email sent but state transition failed"
      }, { status: 500 });
    }

    // Store email sent timestamp and resend message ID for operator memory + webhook tracking
    const sql = neon(process.env.DATABASE_URL!);

    // Get or create outreach record
    const followUp1At = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const followUp2At = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await sql`
      INSERT INTO b2b_outreach (lead_id, subject, body, sent_at, follow_up_1_at, follow_up_2_at, email_type, resend_message_id)
      VALUES (${lead_id}, ${recognitionEmail.subject}, ${recognitionEmail.body}, NOW(), ${followUp1At}, ${followUp2At}, 'recognition', ${data?.id ?? null})
    `;

    await sql`
      UPDATE b2b_leads
      SET email_sent_at = ${new Date().toISOString()}
      WHERE id = ${lead_id}
    `;

    // Fetch updated lead to return to frontend
    const [updatedLead] = await sql`
      SELECT * FROM b2b_leads WHERE id = ${lead_id}
    `;

    // Generate prospect brief URL
    const slug = generateSlug(business_name);
    const prospectBriefUrl = `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://saintandstoryltd.co.uk"}/prospect/${slug}?reply=confirmed&lead_id=${lead_id}&trigger=${encodeURIComponent(recognitionEmail.triggerEvent)}`;

    console.log(`[RECOGNITION-EMAIL] Sent to ${email}, lead ${lead_id}, state transitioned to recognized`);

    return Response.json({
      success: true,
      trigger_event: recognitionEmail.triggerEvent,
      prospectBriefUrl,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("[RECOGNITION-EMAIL] Failed:", error);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
