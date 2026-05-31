import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/sign-in", "/sign-up"],
      },
    ],
    sitemap: "https://saintandstoryltd.co.uk/sitemap.xml",
    host: "https://saintandstoryltd.co.uk",
  };
}
