import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const metrics = await prisma.b2b_learning_metrics.findMany({
      orderBy: {
        conversion_rate: "desc",
      },
    });

    // Calculate totals
    const totalSent = metrics.reduce((sum, m) => sum + m.emails_sent, 0);
    const totalYes = metrics.reduce((sum, m) => sum + m.responses_yes, 0);
    const totalNo = metrics.reduce((sum, m) => sum + m.responses_no, 0);

    return NextResponse.json({
      metrics,
      totals: {
        emails_sent: totalSent,
        responses_yes: totalYes,
        responses_no: totalNo,
        yes_rate: totalSent > 0 ? (totalYes / totalSent) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("[LEARNING] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
