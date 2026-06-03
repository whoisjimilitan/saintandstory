import { prisma } from "@/lib/prisma";
import { JobEventType } from "@prisma/client";

/**
 * Records a job event with optional geolocation and photo
 * @param jobId - The job ID
 * @param eventType - The type of event (assigned, accepted, arrived_pickup, etc.)
 * @param latitude - Optional latitude coordinate
 * @param longitude - Optional longitude coordinate
 * @param photoUrl - Optional proof-of-delivery photo URL
 * @returns The created JobEvent record
 */
export async function recordJobEvent(
  jobId: string,
  eventType: JobEventType,
  latitude?: number,
  longitude?: number,
  photoUrl?: string
) {
  try {
    // Create the job event
    const event = await prisma.jobEvent.create({
      data: {
        jobId,
        eventType,
        latitude: latitude ? BigInt(Math.floor(latitude * 1e8)) / BigInt(1e8) : null,
        longitude: longitude ? BigInt(Math.floor(longitude * 1e8)) / BigInt(1e8) : null,
        timestamp: new Date(),
      },
    });

    // If a photo is provided, create a JobPhoto record
    if (photoUrl) {
      await prisma.jobPhoto.create({
        data: {
          jobId,
          jobEventId: event.id,
          photoType:
            eventType === "collected"
              ? "collection"
              : eventType === "delivered"
                ? "delivery"
                : "collection",
          photoUrl,
          latitude: latitude ? BigInt(Math.floor(latitude * 1e8)) / BigInt(1e8) : null,
          longitude: longitude ? BigInt(Math.floor(longitude * 1e8)) / BigInt(1e8) : null,
        },
      });
    }

    // Update Job model with operation timestamps based on event type
    const jobUpdateData: Record<string, Date> = {};

    switch (eventType) {
      case "arrived_pickup":
        jobUpdateData.arrivedPickupAt = new Date();
        break;
      case "collected":
        jobUpdateData.collectedAt = new Date();
        break;
      case "arrived_delivery":
        jobUpdateData.arrivedDeliveryAt = new Date();
        break;
    }

    if (Object.keys(jobUpdateData).length > 0) {
      await prisma.job.update({
        where: { id: jobId },
        data: jobUpdateData,
      });
    }

    return event;
  } catch (error) {
    console.error(`Failed to record job event for job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Fetches the complete event timeline for a job
 * @param jobId - The job ID
 * @returns Array of job events with related photos, sorted chronologically
 */
export async function getJobTimeline(jobId: string) {
  try {
    const events = await prisma.jobEvent.findMany({
      where: { jobId },
      include: {
        photos: {
          orderBy: { uploadedAt: "desc" },
        },
      },
      orderBy: { timestamp: "asc" },
    });

    return events;
  } catch (error) {
    console.error(`Failed to fetch timeline for job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Gets the human-readable label for a job event type
 * @param eventType - The JobEventType enum value
 * @returns A formatted label for display
 */
export function getEventLabel(eventType: JobEventType): string {
  const labels: Record<JobEventType, string> = {
    assigned: "Job Assigned",
    accepted: "Job Accepted",
    arrived_pickup: "Arrived at Pickup",
    collected: "Items Collected",
    on_way: "On the Way",
    arrived_delivery: "Arrived at Delivery",
    delivered: "Job Delivered",
  };

  return labels[eventType] || eventType;
}

/**
 * Gets the human-readable timeline with event labels and times
 * @param jobId - The job ID
 * @returns Array of timeline entries with formatted labels and timestamps
 */
export async function getFormattedTimeline(jobId: string) {
  const events = await getJobTimeline(jobId);

  return events.map((event) => ({
    id: event.id,
    label: getEventLabel(event.eventType),
    timestamp: event.timestamp,
    formattedTime: event.timestamp.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    latitude: event.latitude ? Number(event.latitude) : null,
    longitude: event.longitude ? Number(event.longitude) : null,
    photoCount: event.photos.length,
    photos: event.photos.map((photo) => ({
      id: photo.id,
      url: photo.photoUrl,
      type: photo.photoType,
      timestamp: photo.uploadedAt,
    })),
  }));
}

/**
 * Creates a job invoice after completion
 * @param jobId - The job ID
 * @param driverId - The driver ID
 * @param amount - The invoice amount
 * @returns The created JobInvoice record
 */
export async function createJobInvoice(
  jobId: string,
  driverId: string,
  amount: number
) {
  try {
    // Generate a unique invoice number: JOB-{jobId}-{timestamp}
    const timestamp = Date.now();
    const invoiceNumber = `JOB-${jobId.substring(0, 8).toUpperCase()}-${timestamp}`;

    const invoice = await prisma.jobInvoice.create({
      data: {
        jobId,
        driverId,
        invoiceNumber,
        amount: BigInt(Math.floor(amount * 100)) / BigInt(100), // Store as decimal
        status: "pending",
      },
    });

    return invoice;
  } catch (error) {
    console.error(`Failed to create invoice for job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Marks a job invoice as paid
 * @param invoiceId - The invoice ID
 * @returns The updated JobInvoice record
 */
export async function markInvoiceAsPaid(invoiceId: string) {
  try {
    const invoice = await prisma.jobInvoice.update({
      where: { id: invoiceId },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    return invoice;
  } catch (error) {
    console.error(`Failed to mark invoice ${invoiceId} as paid:`, error);
    throw error;
  }
}

/**
 * Gets all unpaid invoices for a driver
 * @param driverId - The driver ID
 * @returns Array of unpaid invoices
 */
export async function getUnpaidInvoices(driverId: string) {
  try {
    const invoices = await prisma.jobInvoice.findMany({
      where: {
        driverId,
        status: "pending",
      },
      include: {
        job: true,
      },
      orderBy: { issuedAt: "asc" },
    });

    return invoices;
  } catch (error) {
    console.error(`Failed to fetch unpaid invoices for driver ${driverId}:`, error);
    throw error;
  }
}

/**
 * Gets invoice statistics for a driver
 * @param driverId - The driver ID
 * @returns Object with invoice statistics
 */
export async function getInvoiceStats(driverId: string) {
  try {
    const invoices = await prisma.jobInvoice.findMany({
      where: { driverId },
    });

    const pending = invoices.filter((inv) => inv.status === "pending");
    const paid = invoices.filter((inv) => inv.status === "paid");

    const pendingTotal = pending.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );
    const paidTotal = paid.reduce((sum, inv) => sum + Number(inv.amount), 0);

    return {
      totalInvoices: invoices.length,
      pendingCount: pending.length,
      paidCount: paid.length,
      pendingTotal,
      paidTotal,
      totalEarned: pendingTotal + paidTotal,
    };
  } catch (error) {
    console.error(`Failed to fetch invoice stats for driver ${driverId}:`, error);
    throw error;
  }
}
