import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not configured");
  }
  return neon(process.env.DATABASE_URL);
}

export async function GET() {
  try {
    const sql = getDb();
    const configs = await sql`
      SELECT id, niche, locations, enabled, priority, target_count, target_stage
      FROM discovery_config
      ORDER BY priority DESC, niche ASC
    `;

    return NextResponse.json({
      success: true,
      configs: configs || [],
    });
  } catch (error) {
    console.error("[DISCOVERY CONFIG] Error fetching configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch configurations", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { niche, locations, enabled, priority, target_count, target_stage } =
      await request.json();

    if (!niche || !locations || locations.length === 0) {
      return NextResponse.json(
        { error: "Niche and locations are required", success: false },
        { status: 400 }
      );
    }

    const sql = getDb();
    const result = await sql`
      INSERT INTO discovery_config (niche, locations, enabled, priority, target_count, target_stage)
      VALUES (${niche.toLowerCase()}, ${JSON.stringify(locations)}, ${enabled}, ${priority || 1}, ${target_count || 100}, ${target_stage || "qualified"})
      RETURNING id, niche, locations, enabled, priority, target_count, target_stage
    `;

    return NextResponse.json({
      success: true,
      config: result[0],
    });
  } catch (error) {
    console.error("[DISCOVERY CONFIG] Error creating config:", error);
    return NextResponse.json(
      { error: "Failed to create configuration", success: false },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, niche, locations, enabled, priority } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required", success: false },
        { status: 400 }
      );
    }

    const sql = getDb();
    const result = await sql`
      UPDATE discovery_config
      SET
        niche = ${niche},
        locations = ${JSON.stringify(locations)},
        enabled = ${enabled},
        priority = ${priority},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, niche, locations, enabled, priority
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Configuration not found", success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config: result[0],
    });
  } catch (error) {
    console.error("[DISCOVERY CONFIG] Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration", success: false },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID is required", success: false },
        { status: 400 }
      );
    }

    const sql = getDb();
    await sql`
      DELETE FROM discovery_config WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: "Configuration deleted",
    });
  } catch (error) {
    console.error("[DISCOVERY CONFIG] Error deleting config:", error);
    return NextResponse.json(
      { error: "Failed to delete configuration", success: false },
      { status: 500 }
    );
  }
}
