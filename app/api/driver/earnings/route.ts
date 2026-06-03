import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const driver = await prisma.driver.findUnique({
      where: { clerkUserId: userId },
    });
    if (!driver) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayInvoices, weekInvoices, monthInvoices, allInvoices] = await Promise.all([
      prisma.jobInvoice.aggregate({
        where: { driverId: driver.id, issuedAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      prisma.jobInvoice.aggregate({
        where: { driverId: driver.id, issuedAt: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
      prisma.jobInvoice.aggregate({
        where: { driverId: driver.id, issuedAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.jobInvoice.findMany({
        where: { driverId: driver.id },
        orderBy: { issuedAt: "desc" },
        take: 10,
      }),
    ]);

    const pending = allInvoices
      .filter(i => i.status === "pending")
      .reduce((sum, i) => sum + (i.amount?.toNumber() || 0), 0);

    return NextResponse.json({
      today: todayInvoices._sum.amount?.toNumber() || 0,
      week: weekInvoices._sum.amount?.toNumber() || 0,
      month: monthInvoices._sum.amount?.toNumber() || 0,
      pending,
      paid: allInvoices
        .filter(i => i.status === "paid")
        .reduce((sum, i) => sum + (i.amount?.toNumber() || 0), 0),
      invoices: allInvoices.map(i => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        amount: i.amount?.toNumber() || 0,
        status: i.status,
        issuedAt: i.issuedAt?.toISOString(),
        paidAt: i.paidAt?.toISOString(),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
