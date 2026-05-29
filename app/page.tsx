import ExperimentTracker from "@/components/ExperimentTracker";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import LogoMarquee from "@/components/LogoMarquee";
import TrustBar from "@/components/TrustBar";
import HowItWorks from "@/components/HowItWorks";
import WhyUs from "@/components/WhyUs";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import QuoteSection from "@/components/QuoteSection";
import MobileBar from "@/components/MobileBar";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <ExperimentTracker variant="control" />
      {/* Fixed nav */}
      <Nav />
      {/* 1. Bark-style hero — search widget + auto-open modal */}
      <Hero />
      {/* 2. City/coverage marquee */}
      <LogoMarquee />
      {/* 3. Trust stats — 4 big numbers */}
      <TrustBar />
      {/* 4. How it works — 3 numbered steps */}
      <HowItWorks />
      {/* 5. Why us — 8 differentiators */}
      <WhyUs />
      {/* 6. Testimonials — social proof grid */}
      <Testimonials />
      {/* 7. FAQ — objection removal */}
      <FAQ />
      {/* 8. Quote form — final conversion */}
      <QuoteSection />
      {/* 9. Mobile sticky CTA */}
      <MobileBar />
    </main>
  );
}
