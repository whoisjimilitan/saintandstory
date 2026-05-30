import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";
import ExperimentTracker from "@/components/ExperimentTracker";

export default function Home() {
  return (
    <main className="pb-20 md:pb-0">
      <ExperimentTracker variant="control" />
      <Nav />
      <Hero />
      <TrustBar />
      <FeatureCards />
      <HowItWorks />
      <FAQ />
      <TestimonialCarousel />
      <SiteFooter />
      <MobileBar />
    </main>
  );
}
