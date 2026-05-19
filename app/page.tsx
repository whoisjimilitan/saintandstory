import ExperimentTracker from "@/components/ExperimentTracker";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import LogoMarquee from "@/components/LogoMarquee";
import BrandLogos from "@/components/BrandLogos";
import FounderQuote from "@/components/FounderQuote";
import Testimonials from "@/components/Testimonials";
import VideoTestimonials from "@/components/VideoTestimonials";
import HowItWorks from "@/components/HowItWorks";
import Portfolio from "@/components/Portfolio";
import CaseStudies from "@/components/CaseStudies";
import WhyUs from "@/components/WhyUs";
import Included from "@/components/Included";
import FAQ from "@/components/FAQ";
import QuoteSection from "@/components/QuoteSection";
import MobileBar from "@/components/MobileBar";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <ExperimentTracker variant="control" />
      {/* 1. Hero — headline, CTA, phone, social proof */}
      <Hero />
      {/* 2. Trust stats */}
      <TrustBar />
      {/* 3. Coverage marquee */}
      <LogoMarquee />
      {/* 4. Corporate client logos + Trustpilot */}
      <BrandLogos />
      {/* 5. Founder video */}
      <FounderQuote />
      {/* 6. 9 written testimonials 3x3 */}
      <Testimonials />
      {/* 6. 9 video testimonials 3x3 */}
      <VideoTestimonials />
      {/* 7. How it works — 3 steps */}
      <HowItWorks />
      {/* 8. Portfolio — job photo grid */}
      <Portfolio />
      {/* 9. Case studies — 2 before/after */}
      <CaseStudies />
      {/* 10. Why us — benefit list */}
      <WhyUs />
      {/* 11. All included */}
      <Included />
      {/* 12. FAQ — 12 objection handlers */}
      <FAQ />
      {/* 13. Quote form — first name, last name, email, phone */}
      <QuoteSection />
      {/* 14. Mobile sticky CTA */}
      <MobileBar />
    </main>
  );
}
