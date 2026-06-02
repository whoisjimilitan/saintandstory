import type { Metadata } from "next";

const BASE = "https://pdfseeds.com";

export const metadata: Metadata = {
  title: "Earn Forever — PDF Seeds Curator Programme",
  description:
    "You're already the one they ask. We make sure you always have the answer. Share your link. It earns forever. Join 367 curators earning £7.99 per recommendation.",
  alternates: { canonical: `${BASE}/earn` },
  openGraph: {
    title: "Earn Forever — PDF Seeds Curator Programme",
    description:
      "You're already the one they ask. Share your link. It earns forever. 80% per sale. One-time £19.99.",
    url: `${BASE}/earn`,
    siteName: "PDF Seeds",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Earn Forever — PDF Seeds Curator Programme",
    description:
      "You're already the one they ask. Share your link. It earns forever. 80% per sale. One-time £19.99.",
  },
};

export default function EarnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
