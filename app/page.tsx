import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import ForEveryMove from "@/components/ForEveryMove";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import ClaimArea from "@/components/ClaimArea";
import SiteFooter from "@/components/SiteFooter";
import MobileBar from "@/components/MobileBar";

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
