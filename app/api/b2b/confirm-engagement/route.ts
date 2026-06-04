import { confirmLeadPain } from "@/lib/lead-state-machine";

interface ConfirmationRequest {
  lead_id: number;
  trigger_event: string;
  engagement_type: string;
  engagement_signals?: {
    tabFocusActive: boolean;
    scrollDepth: number;
    sectionVisible: boolean;
  };
}

export async function POST(request: Request) {
  const {
    lead_id,
    trigger_event,
    engagement_type,
    engagement_signals,
  }: ConfirmationRequest = await request.json();

  // HYBRID SIGNAL VALIDATION
  if (engagement_type === "hybrid_signal" && engagement_signals) {
    const { tabFocusActive, scrollDepth, sectionVisible } = engagement_signals;

    // STRICT RULE: All conditions must be met
    const isValid =
      tabFocusActive && (scrollDepth >= 30 || sectionVisible);

    if (!isValid) {
      console.log(
        `[CONFIRMATION] Lead ${lead_id}: REJECTED - insufficient engagement signals`
      );
      return Response.json(
        { error: "Engagement validation failed" },
        { status: 400 }
      );
    }

    console.log(
      `[CONFIRMATION] Lead ${lead_id}: VALIDATED - tab focus: ${tabFocusActive}, scroll: ${scrollDepth}%, section: ${sectionVisible}`
    );
  }

  try {
    // ONLY NOW confirm the lead pain
    await confirmLeadPain(lead_id, trigger_event);

    console.log(
      `[SELF-CONFIRMED] Lead ${lead_id} confirmed via ${engagement_type}`
    );

    return Response.json({ success: true, confirmed: true });
  } catch (error) {
    console.error("[CONFIRMATION] Failed:", error);
    return Response.json({ error: "Confirmation failed" }, { status: 500 });
  }
}
