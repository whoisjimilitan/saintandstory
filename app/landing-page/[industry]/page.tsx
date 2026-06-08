import { Metadata } from "next";
import LandingPageContent from "@/components/landing/LandingPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const industryName = industry
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${industryName} Operations | Saint & Story`,
    description: `Tracking what's happening in ${industryName.toLowerCase()} operations.`,
  };
}

export default async function LandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ industry: string }>;
  searchParams: Promise<{ company?: string; city?: string }>;
}) {
  const { industry } = await params;
  const { company, city } = await searchParams;

  return (
    <LandingPageContent
      industry={industry}
      company={company}
      city={city}
    />
  );
}
