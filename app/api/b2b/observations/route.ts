import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  console.log("[Observations API] POST request received");

  const { userId } = await auth();
  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body = await req.json() as {
    lead_id: string;
    observation: string;
    context?: string;
  };

  const { lead_id, observation, context = "manual" } = body;

  if (!lead_id || !observation) {
    return new Response(
      JSON.stringify({ error: "lead_id and observation required" }),
      { status: 400 }
    );
  }

  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch current observations
    const result = await sql`
      SELECT human_observations FROM b2b_leads WHERE id = ${lead_id}
    `;

    if (result.length === 0) {
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        { status: 404 }
      );
    }

    const currentObservations =
      (result[0]?.human_observations as Record<string, unknown>[] | null) || [];

    // Add new observation
    const newObservation = {
      id: `obs_${Date.now()}`,
      observation,
      context,
      confidence: 100,
      recorded_at: new Date().toISOString(),
    };

    const updatedObservations = [...currentObservations, newObservation];

    // Update database
    await sql`
      UPDATE b2b_leads
      SET human_observations = ${JSON.stringify(updatedObservations)}::jsonb
      WHERE id = ${lead_id}
    `;

    console.log(
      `[Observations API] Recorded observation for lead ${lead_id}`
    );

    return new Response(JSON.stringify({ success: true, observation: newObservation }), {
      status: 200,
    });
  } catch (error) {
    console.error("[Observations API] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
