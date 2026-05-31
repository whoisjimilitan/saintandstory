import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PROGRAMMATIC_CITIES, getCityBySlug } from "@/lib/city-pages";
import CityLandingPage, { buildMetadata } from "@/components/CityLandingPage";

export function generateStaticParams() {
  return PROGRAMMATIC_CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};
  return buildMetadata(city);
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();
  return <CityLandingPage data={city} />;
}
