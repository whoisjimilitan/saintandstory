import { neon } from "@neondatabase/serverless";
import { generateRecognitionEmail } from "@/lib/recognition-email";
import { transitionLeadState } from "@/lib/lead-state-machine";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    await resend.emails.send({
      from: "james@saintandstory.co.uk",
      to: email,
      subject: recognitionEmail.subject,
      text: recognitionEmail.body,
    });

    // Transition state: new → recognized
    await transitionLeadState(lead_id, "recognized", recognitionEmail.triggerEvent);

    console.log(`[RECOGNITION-EMAIL] Sent to ${email}, lead ${lead_id}`);

    return Response.json({
      success: true,
      trigger_event: recognitionEmail.triggerEvent,
    });
  } catch (error) {
    console.error("[RECOGNITION-EMAIL] Failed:", error);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
