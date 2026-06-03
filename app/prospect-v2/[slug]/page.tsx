/**
 * PROSPECT BRIEF V2 - TEST ROUTE
 *
 * Parallel route for testing the redesigned prospect brief
 * following PROSPECT_BRIEF_DESIGN_STANDARD.md
 *
 * Uses ProspectBriefingPageV2 component
 * Same data loading as V1, but with new layout/copy
 *
 * Usage: /prospect-v2/{slug}
 * Example: /prospect-v2/wilson-solicitors
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  findBusinessBySlug,
  buildProspectPageData,
} from "@/lib/prospect-pages";
import ProspectBriefingPageV2 from "@/components/ProspectBriefingPageV2";

interface ProspectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

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
    title: `${business.name} • Delivery Intelligence • Saint & Story`,
    description: `We understand the delivery challenges facing ${business.name}. See what's possible.`,
    robots: { index: false, follow: false },
  };
}

export default async function ProspectPageV2({
  params,
}: ProspectPageProps) {
  const { slug } = await params;

  console.log("[PROSPECT-V2] Slug requested:", slug);

  const business = await findBusinessBySlug(slug);
  console.log("[PROSPECT-V2] Business found:", business?.name || "NOT FOUND");

  if (!business) {
    console.log("[PROSPECT-V2] 404 - no business found for slug:", slug);
    return notFound();
  }

  const pageData = await buildProspectPageData(business);
  console.log("[PROSPECT-V2] Page data built");

  if (!pageData) {
    return notFound();
  }

  return <ProspectBriefingPageV2 data={pageData} />;
}
