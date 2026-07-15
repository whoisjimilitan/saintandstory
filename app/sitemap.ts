import type { MetadataRoute } from "next";
import { PROGRAMMATIC_CITIES } from "@/lib/city-pages";

const BASE_URL = "https://saintandstoryltd.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/services", priority: 0.9 },
    { path: "/how-it-works", priority: 0.9 },
    { path: "/pricing", priority: 0.8 },
    { path: "/contact", priority: 0.7 },
    { path: "/for-drivers", priority: 0.8 },
    { path: "/app", priority: 0.7 },
  ];

  const cityPages = [
    { path: "/london-home-moves", priority: 0.95 },
    { path: "/birmingham-removals", priority: 0.9 },
    { path: "/leeds-removals", priority: 0.9 },
    { path: "/bristol-removals", priority: 0.9 },
    { path: "/liverpool-removals", priority: 0.9 },
    { path: "/glasgow-removals", priority: 0.9 },
    { path: "/sheffield-removals", priority: 0.9 },
    { path: "/manchester-office-moves", priority: 0.85 },
    { path: "/london-drivers", priority: 0.8 },
  ];

  const servicePages = [
    { path: "/services", priority: 0.9 },
    { path: "/same-day-courier", priority: 0.87 },
    { path: "/medical-courier", priority: 0.87 },
    { path: "/man-and-van", priority: 0.87 },
    { path: "/legal-documents", priority: 0.87 },
    { path: "/office-moves", priority: 0.85 },
    { path: "/student-moves", priority: 0.85 },
    { path: "/piano-moving", priority: 0.85 },
    { path: "/house-clearance", priority: 0.85 },
    { path: "/b2b/florists", priority: 0.8 },
    { path: "/b2b/restaurants", priority: 0.8 },
    { path: "/b2b/retailers", priority: 0.8 },
    { path: "/b2b/legal", priority: 0.8 },
    { path: "/b2b/estate-agents", priority: 0.8 },
  ];

  const programmaticPages = PROGRAMMATIC_CITIES.map((c) => ({
    path: `/${c.slug}`,
    priority: 0.85,
  }));

  const allPages = [...staticPages, ...cityPages, ...servicePages, ...programmaticPages];

  return allPages.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
