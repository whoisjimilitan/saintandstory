import type { Metadata } from "next";
import PricingClient from "@/components/PricingClient";

export const metadata: Metadata = {
  title: "Removal Prices UK | Fixed Price, No Hidden Fees | Saint & Story",
  description:
    "Transparent removal pricing with no surprises. Full service from £180. Drivers keep 100% — flat £9.99/month fee. Fixed price confirmed on the call.",
  openGraph: {
    title: "Removal Prices UK | Fixed Price, No Hidden Fees | Saint & Story",
    description:
      "Transparent removal pricing. Full service from £180. Fixed price confirmed on the call — nothing added on move day.",
    url: "https://saintandstoryltd.co.uk/pricing",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Removal Prices UK | Fixed Price | Saint & Story",
    description: "Full service from £180. Fixed price confirmed on the call. No hidden fees.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
