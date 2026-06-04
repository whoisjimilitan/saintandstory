import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findBusinessBySlug, buildProspectPageData } from "@/lib/prospect-pages";
import { getIndustryIntelligence } from "@/lib/industry-intelligence";
import { confirmLeadPain } from "@/lib/lead-state-machine";
import ProspectBriefingPage from "@/components/ProspectBriefingPageV2";

// Force dynamic rendering: pages are generated on-demand, not statically
export const dynamic = "force-dynamic";

interface ProspectPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{
    reply?: string;
    lead_id?: string;
    trigger?: string;
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

  return (
    <ProspectBriefingPage
      data={pageData}
      intelligence={intelligence}
      momentId={momentId}
      pendingConfirmation={sp?.reply === "confirmed"}
      lead_id={sp?.lead_id}
      trigger_event={sp?.trigger}
    />
  );
}
