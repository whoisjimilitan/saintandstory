import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  console.log("[CONTRACTS] Fetching standing orders");

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const standingOrders = await prisma.b2bStandingOrder.findMany({
      orderBy: { createdAt: "desc" },
    });

    const contracts = standingOrders.map(order => ({
      id: order.id,
      businessName: order.businessName,
      contactName: order.contactName,
      contactEmail: order.contactEmail,
      contactPhone: order.contactPhone,
      serviceType: order.serviceType,
      frequency: order.frequency || "weekly",
      dayOfWeek: order.dayOfWeek,
      preferredTime: order.preferredTime,
      price: order.price?.toString() || "0",
      active: order.active || true,
      createdAt: order.createdAt.toISOString(),
      lastGeneratedAt: order.lastGeneratedAt?.toISOString() || null,
      nextScheduledAt: order.nextScheduledAt?.toISOString() || null,
    }));

    console.log(`[CONTRACTS] Found ${contracts.length} standing orders`);

    return NextResponse.json({
      success: true,
      contracts,
    });
  } catch (error) {
    console.error("[CONTRACTS] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
