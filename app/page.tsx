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

export const metadata: Metadata = {
  title: "UK Removal Company | Fixed Price. Verified Driver. | Saint & Story",
  description:
    "Book a verified removal driver instantly. Man and van, house moves, office removals — fixed price in minutes. No hidden fees. London, Manchester, Birmingham & 30+ UK cities.",
  openGraph: {
    title: "UK Removal Company | Fixed Price. Verified Driver. | Saint & Story",
    description:
      "Book a verified removal driver instantly. Fixed price in 60 seconds. Man and van, house moves, office removals. No hidden fees. 30+ UK cities.",
    url: "https://saintandstoryltd.co.uk",
    siteName: "Saint & Story",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Removal Company | Fixed Price. Verified Driver.",
    description:
      "Book a verified removal driver instantly. Fixed price in 60 seconds. Man and van, house moves, office removals.",
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
    </main>
  );
}
