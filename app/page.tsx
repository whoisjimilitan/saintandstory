import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import ForEveryMove from "@/components/ForEveryMove";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import ClaimArea from "@/components/ClaimArea";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const metadata: Metadata = {
  title: "Same-Day Couriers & UK Removals — Saint & Story Logistics",
  description:
    "Same-day urgent deliveries. Reasonable pricing. Professional drivers.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Same-Day Couriers & UK Removals — Saint & Story Logistics",
    description:
      "Same-day urgent deliveries. Reasonable pricing. Professional drivers.",
    url: "https://saintandstoryltd.co.uk",
    siteName: "Saint & Story",
    type: "website",
    images: [
      {
        url: "https://saintandstoryltd.co.uk/og-image.png",
        width: 3560,
        height: 1184,
        alt: "Logistics without the luck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Same-Day Couriers & UK Removals — Saint & Story Logistics",
    description:
      "Same-day urgent deliveries. Reasonable pricing. Professional drivers.",
    images: ["https://saintandstoryltd.co.uk/og-image.png"],
  },
};

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />
      <Hero />
      <WhySection />
      <ForEveryMove />
      <HowItWorks />
      <Testimonials />
      <ClaimArea />
      <SiteFooter />
      <MobileBar />
      <WhatsAppWidget /> {/* Widget only on homepage, using wa.me by default */}
    </main>
  );
}
