import type { MetadataRoute } from "next";

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
  ];

  const cityPages = [
    { path: "/london-home-moves", priority: 0.9 },
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
    { path: "/office-moves", priority: 0.85 },
    { path: "/student-moves", priority: 0.85 },
    { path: "/piano-moving", priority: 0.85 },
    { path: "/app", priority: 0.7 },
  ];

  const allPages = [...staticPages, ...cityPages, ...servicePages];

  return allPages.map(({ path, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}
