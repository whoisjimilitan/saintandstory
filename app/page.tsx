import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import PressStrip from "@/components/PressStrip";
import ServiceIntro from "@/components/ServiceIntro";
import PerfectFor from "@/components/PerfectFor";
import BenefitColumns from "@/components/BenefitColumns";
import BookingBlock from "@/components/BookingBlock";
import WhatsIncluded from "@/components/WhatsIncluded";
import TestimonialGrid from "@/components/TestimonialGrid";
import ClosingCTA from "@/components/ClosingCTA";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <Nav />
      <Hero />
      <PressStrip />
      <ServiceIntro />
      <PerfectFor />
      <BenefitColumns />
      <BookingBlock />
      <WhatsIncluded />
      <TestimonialGrid />
      <ClosingCTA />
      <SiteFooter />
      <MobileBar />
    </main>
  );
}
