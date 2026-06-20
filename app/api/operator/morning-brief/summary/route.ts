import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [discovered, enriched, qualified, orders] = await Promise.all([
      prisma.b2bLead.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      prisma.b2bLead.count({
        where: {
          createdAt: {
            gte: today,
          },
          leadState: {
            in: ["recognised", "understood", "prioritised", "activated"],
          },
        },
      }),

      prisma.b2bLead.count({
        where: {
          leadState: "understood",
          transitionedAt: {
            gte: today,
          },
        },
      }),

      prisma.b2bStandingOrder.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),
    ]);

    return NextResponse.json({
      discovered,
      enriched,
      qualified,
      orders,
    });
  } catch (error) {
    console.error("[Morning Brief Summary Error]", error);
    return NextResponse.json(
      { error: "Failed to load summary data" },
      { status: 500 }
    );
  }
}
