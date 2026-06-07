import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { neon } from "@neondatabase/serverless";
import { findBusinessBySlug, buildProspectPageData } from "@/lib/prospect-pages";
import { getIndustryIntelligence } from "@/lib/industry-intelligence";
import { confirmLeadPain } from "@/lib/lead-state-machine";
import { generateEnrichedBrief } from "@/lib/brief-enrichment";
import type { Lead } from "@/lib/b2b-types";
import type { EnrichedBrief } from "@/lib/brief-enrichment";
import ProspectBriefingPage from "@/components/ProspectBriefingPageV2";

// Force dynamic rendering: pages are generated on-demand, not statically
export const dynamic = "force-dynamic";

interface ProspectPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    reply?: string;
    lead_id?: string;
    trigger?: string;
    debug?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProspectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const business = await findBusinessBySlug(slug);

  if (!business) {
    return {
      title: "Prospect Not Found",
    };
  }

  return {
    title: `${business.name} • Delivery Briefing • Saint & Story`,
    description: `Delivery situations we believe matter to ${business.name}. Same-day courier support for your operation.`,
    robots: { index: false, follow: false }, // Don't index prospect pages
  };
}

async function fetchLeadById(leadId: string): Promise<Lead | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT * FROM b2b_leads WHERE id = ${parseInt(leadId)} LIMIT 1`;
    return rows.length > 0 ? (rows[0] as Lead) : null;
  } catch (error) {
    console.error(`[PROSPECT] Failed to fetch lead ${leadId}:`, error);
    return null;
  }
}

export default async function ProspectPage({
  params,
  searchParams,
}: ProspectPageProps) {
  const { slug } = await params;
  const sp = await searchParams;

  console.log("[PROSPECT] Slug requested:", slug);

  // Find business by slug
  const business = await findBusinessBySlug(slug);
  console.log("[PROSPECT] Business found:", business?.name || "NOT FOUND");

  if (!business) {
    console.log("[PROSPECT] 404 - no business found for slug:", slug);
    return notFound();
  }

  // Build page data (movements, briefing, etc.)
  const pageData = await buildProspectPageData(business);
  if (!pageData) {
    return notFound();
  }

  // Fetch industry intelligence for this business category
  const intelligence = getIndustryIntelligence(business.category) || undefined;
  const momentId = `${business.category}-${Date.now()}`;

  // Attempt to generate enriched brief if lead_id present
  let enrichedBrief: EnrichedBrief | null = null;
  let briefMetadata: any = null;

  if (sp?.lead_id) {
    const lead = await fetchLeadById(sp.lead_id);
    if (lead) {
      try {
        enrichedBrief = generateEnrichedBrief(lead);

        // Collect metadata for future briefType classification (non-invasive)
        briefMetadata = {
          leadId: lead.id,
          industry: lead.business_category,
          city: lead.city,
          painPoint: lead.pain_point || null,
          reviewRating: lead.review_rating || null,
          generatedAt: new Date().toISOString(),
          // Placeholder for future: briefType will be determined from engagement data
          // predictedBriefType: null,
          // candidateBriefTypes: [],
        };

        console.log(`[PROSPECT] Generated enriched brief for lead ${sp.lead_id}`);
      } catch (error) {
        console.error(`[PROSPECT] Failed to generate brief for lead ${sp.lead_id}:`, error);
      }
    } else {
      console.log(`[PROSPECT] Lead ${sp.lead_id} not found in database`);
    }
  }

  // Handle reply confirmation
  if (sp?.reply === "confirmed" && sp?.lead_id && sp?.trigger) {
    const leadId = parseInt(sp.lead_id);
    const triggerEvent = decodeURIComponent(sp.trigger);

    try {
      await confirmLeadPain(leadId, triggerEvent);
      console.log(`[PROSPECT] Reply confirmed for lead ${leadId}`);
    } catch (error) {
      console.error("[PROSPECT] Failed to confirm reply:", error);
    }
  }

  // Audit log for validation
  console.log("[PROSPECT-AUDIT]", {
    leadId: sp?.lead_id || null,
    industry: business.category,
    enrichedBriefGenerated: enrichedBrief !== null,
    fallbackUsed: enrichedBrief === null && sp?.lead_id !== undefined,
    pendingConfirmation: sp?.reply === "confirmed",
  });

  return (
    <ProspectBriefingPage
      data={pageData}
      intelligence={intelligence}
      momentId={momentId}
      pendingConfirmation={sp?.reply === "confirmed"}
      lead_id={sp?.lead_id}
      trigger_event={sp?.trigger}
      enrichedBrief={enrichedBrief}
      briefMetadata={briefMetadata}
      debugMode={sp?.debug === "brief" && process.env.NODE_ENV === "development"}
    />
  );
}
