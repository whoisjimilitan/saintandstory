import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import ExperimentTracker from "@/components/ExperimentTracker";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <ExperimentTracker variant="control" />
      {/* Fixed Bark-style nav */}
      <Nav />
      {/* 1. White centered hero — search widget */}
      <Hero />
      {/* 2. Trust numbers bar */}
      <TrustBar />
      {/* 3. How it works — 3 steps */}
      <HowItWorks />
      {/* 4. Testimonial carousel with floating photos (Bark-style) */}
      <TestimonialCarousel />
      {/* 5. Bark-style 4-column footer */}
      <SiteFooter />
      {/* Mobile sticky CTA */}
      <MobileBar />
    </main>
  );
}
