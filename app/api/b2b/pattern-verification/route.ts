import { neon } from "@neondatabase/serverless";
import {
  verifyPattern,
  rejectPattern,
  mergePattern,
  getUnverifiedPatterns,
  getVerifiedPatterns,
  getVerificationStats
} from "@/lib/pattern-verification";

/**
 * Pattern Verification API
 *
 * GET /api/b2b/pattern-verification?action=list
 * POST /api/b2b/pattern-verification (verify/reject/merge)
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);

    // List unverified patterns (review queue)
    if (action === "list") {
      const unverified = await getUnverifiedPatterns(sql);
      const stats = await getVerificationStats(sql);

      return Response.json({
        patterns: unverified,
        stats
      });
    }

    // Get verified patterns only
    if (action === "verified") {
      const verified = await getVerifiedPatterns(sql);
      return Response.json({ patterns: verified });
    }

    // Get verification statistics
    if (action === "stats") {
      const stats = await getVerificationStats(sql);
      return Response.json(stats);
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[Pattern Verification API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, pattern_id, operator_id, reason, merge_into_pattern_id } = body;

    if (!pattern_id || !operator_id || !action) {
      return Response.json(
        { error: "Missing required fields: pattern_id, operator_id, action" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return Response.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const sql = neon(process.env.DATABASE_URL);
    let success = false;

    // Handle different actions
    if (action === "verify") {
      success = await verifyPattern(sql, pattern_id, operator_id);
    } else if (action === "reject") {
      success = await rejectPattern(sql, pattern_id, operator_id, reason);
    } else if (action === "merge") {
      if (!merge_into_pattern_id) {
        return Response.json(
          { error: "merge action requires merge_into_pattern_id" },
          { status: 400 }
        );
      }
      success = await mergePattern(sql, pattern_id, merge_into_pattern_id, operator_id);
    } else {
      return Response.json(
        { error: "Unknown action. Use: verify, reject, or merge" },
        { status: 400 }
      );
    }

    if (!success) {
      return Response.json(
        { error: "Failed to process action. Pattern may not exist." },
        { status: 404 }
      );
    }

    // Get updated stats
    const stats = await getVerificationStats(sql);

    return Response.json({
      success: true,
      action,
      pattern_id,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("[Pattern Verification API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
