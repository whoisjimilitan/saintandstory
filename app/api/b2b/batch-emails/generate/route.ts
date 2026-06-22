import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface EmailPreview {
  prospectId: string;
  businessName: string;
  city: string;
  subject: string;
  body: string;
  wordCount: number;
}

const generateTrustSignalEmail = (prospect: any): { subject: string; body: string } => {
  const { businessName, city, pressureSignal, industry } = prospect;

  // Generate subject based on pressure signal
  const subjectLines: Record<string, string> = {
    "weekend-overflow": `${city}: Weekend peak scheduling?`,
    "documents-stuck": `${city}: Document handling bottleneck?`,
    "growth-outpacing": `${city}: Scaling ${industry}?`,
    "compliance-shift": `${city}: ${industry} compliance update`,
    "cost-pressure": `${city}: ${industry} margins under pressure?`,
  };

  const subject = subjectLines[pressureSignal || "growth-outpacing"] || `${city}: Quick question about ${businessName}`;

  // Generate body with trust signals
  const bodies: Record<string, string> = {
    "weekend-overflow": `Hi there,

I noticed ${businessName} operates in ${city}. Most ${industry.toLowerCase()}s hit peak demand on weekends – curious if that's creating a bottleneck for you?

If it's not relevant, no worries. If it is, might be worth a 5-min chat.

Best,
The Team`,

    "documents-stuck": `Hi,

Been following ${industry.toLowerCase()} trends in ${city}. A lot of firms mention document workflows becoming a headache.

Is that on your radar? If so, might be worth exploring.

Best,
The Team`,

    "growth-outpacing": `Hi,

Spotted ${businessName} expanding in ${city}. When growth accelerates, operational friction usually follows.

Worth a quick conversation?

Best,
The Team`,
  };

  const body = bodies[pressureSignal || "growth-outpacing"] || `Hi,

I came across ${businessName} in ${city}. Thought there might be a fit for what we're doing.

Worth a brief conversation?

Best,
The Team`;

  return { subject, body };
};

export async function POST(request: Request) {
  try {
    const { prospectIds } = await request.json();

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid prospectIds array" },
        { status: 400 }
      );
    }

    // Fetch prospects
    const prospects = await prisma.b2bLead.findMany({
      where: {
        id: { in: prospectIds },
      },
      select: {
        id: true,
        businessName: true,
        city: true,
        businessCategory: true,
        email: true,
      },
    });

    // Generate emails
    const emails: EmailPreview[] = prospects.map((prospect) => {
      const { subject, body } = generateTrustSignalEmail({
        ...prospect,
        industry: prospect.businessCategory || "your industry",
        pressureSignal: "growth-outpacing", // Default - could be extended to use stored pressure signals
      });

      return {
        prospectId: prospect.id,
        businessName: prospect.businessName,
        city: prospect.city || "Unknown",
        subject,
        body,
        wordCount: body.split(/\s+/).length,
      };
    });

    return NextResponse.json({
      success: true,
      emails,
      count: emails.length,
    });
  } catch (error) {
    console.error("[BATCH EMAIL GENERATE] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate emails" },
      { status: 500 }
    );
  }
}
