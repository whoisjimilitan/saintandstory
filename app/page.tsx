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
import { generateOrganizationSchema } from "@/lib/schema-generator";

export const metadata: Metadata = {
  title: "Reliable Business Deliveries & Removals — Saint & Story",
  description:
    "When your business needs things moved, collected, or delivered today. Professional support you can depend on.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Reliable Business Deliveries & Removals — Saint & Story",
    description:
      "When your business needs things moved, collected, or delivered today. Professional support you can depend on.",
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
    title: "Reliable Business Deliveries & Removals — Saint & Story",
    description:
      "When your business needs things moved, collected, or delivered today. Professional support you can depend on.",
    images: ["https://saintandstoryltd.co.uk/og-image.png"],
  },
};

export default function Home() {
  const organizationSchema = generateOrganizationSchema();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://saintandstoryltd.co.uk"
      }
    ]
  };

  return (
    <main className="pb-20 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
