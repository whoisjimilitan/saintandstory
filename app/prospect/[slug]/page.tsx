import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findBusinessBySlug, buildProspectPageData } from "@/lib/prospect-pages";
import ProspectBriefingPage from "@/components/ProspectBriefingPageV2";

// Force dynamic rendering: pages are generated on-demand, not statically
export const dynamic = "force-dynamic";

interface ProspectPageProps {
  params: Promise<{ slug: string }>;
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

export default async function ProspectPage({ params }: ProspectPageProps) {
  const { slug } = await params;

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

  return <ProspectBriefingPage data={pageData} />;
}
