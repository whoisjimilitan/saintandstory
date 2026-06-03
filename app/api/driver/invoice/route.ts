import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { jobId } = body;

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.driverId) return NextResponse.json({ error: "Invalid job" }, { status: 400 });

    // Check if invoice already exists
    const existing = await prisma.jobInvoice.findFirst({
      where: { jobId },
    });
    if (existing) return NextResponse.json(existing);

    // Generate invoice number
    const lastInvoice = await prisma.jobInvoice.findFirst({
      orderBy: { createdAt: "desc" },
    });
    const nextNum = (lastInvoice?.invoiceNumber?.replace(/\D/g, "") || "0");
    const invoiceNumber = `INV-${String(parseInt(nextNum) + 1).padStart(6, "0")}`;

    // Create invoice
    const invoice = await prisma.jobInvoice.create({
      data: {
        jobId,
        driverId: job.driverId,
        invoiceNumber,
        amount: job.price || 0,
        status: "pending",
        issuedAt: new Date(),
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
