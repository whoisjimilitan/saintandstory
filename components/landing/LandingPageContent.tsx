"use client";

import HeroCard from "@/components/landing/HeroCard";
import BriefSummaryCard from "@/components/landing/BriefSummaryCard";
import ImplicationCard from "@/components/landing/ImplicationCard";
import EvidenceCard from "@/components/landing/EvidenceCard";
import CTAButton from "@/components/landing/CTAButton";

interface LandingPageContentProps {
  industry: string;
  company?: string;
  city?: string;
}

export default function LandingPageContent({
  industry,
  company,
  city,
}: LandingPageContentProps) {
  const industryName = industry
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const companyName = company || industryName;
  const cityName = city || "your region";

  // Handle CTA click → Prepopulated Email system (Tier 2 Step 3)
  const handleCTA = async () => {
    try {
      const response = await fetch(
        `/api/dev/prepopulated-email?industry=${industry}&company=${encodeURIComponent(companyName)}&city=${encodeURIComponent(cityName)}`
      );

      if (!response.ok) {
        console.error("Email generation failed", response.status);
        return;
      }

      const data = await response.json();

      // Email validation passed, open mailto: link
      if (data.success && data.mailtoLink) {
        window.location.href = data.mailtoLink;
      } else {
        console.error("Email validation failed", data.validation);
      }
    } catch (error) {
      console.error("Error generating prepopulated email:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero: Recognition + CTA */}
        <HeroCard
          observation={`We're tracking what's happening in ${industryName.toLowerCase()} operations across ${cityName}.`}
          briefContext={`This pattern of operational coordination is becoming standard practice. We've documented how it shows up across similar businesses in your space.`}
          prospectName={companyName !== industryName ? companyName : undefined}
          onCTA={handleCTA}
          ctaLabel="See what's next"
        />

        <div className="mt-6" />

        {/* Situation Overview: Recap Brief insights */}
        <BriefSummaryCard
          title="What We're Tracking"
          summary={`For ${industryName.toLowerCase()} businesses, same-day coordination and delivery management have become operational pressure points. This usually emerges once volume stabilizes and manual systems start sitting alongside daily work.`}
          pattern={`Across similar operations, this typically surfaces as: courier dependency, deadline friction, and coordination overhead.`}
        />

        <div className="mt-6" />

        {/* Implication: Decision leverage */}
        <ImplicationCard
          implication={`For ${companyName}, this would translate into structured visibility across daily delivery and coordination activity. Right now, this visibility is distributed across emails, phone calls, and manual tracking.`}
          consequence={`When operations are owned rather than brokered, the coordination becomes a competitive asset instead of a cost center.`}
          decisionRelevance={`This is why we brought this to your attention now — it's becoming a standard expectation in your industry.`}
        />

        <div className="mt-6" />

        {/* Evidence: Credibility without marketing */}
        <EvidenceCard
          evidence={`Across the companies we're tracking, the pattern is consistent: businesses that own their coordination report 40% better delivery predictability and 25% lower per-unit coordination cost compared to broker-dependent models.`}
          source={`Data from ongoing tracking in ${cityName} and surrounding regions (anonymized)`}
          context={`This is not a new phenomenon — it's becoming increasingly standard as operations mature and customer expectations shift toward real-time visibility.`}
        />

        <div className="mt-8" />

        {/* Single CTA (Deferred Decision) */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E8E8]">
          <p className="text-[10px] uppercase tracking-[0.1em] text-[#888888] font-semibold mb-3">
            Next Step
          </p>
          <p className="text-sm text-[#0D0D0D] mb-4">
            We've mapped a specific breakdown of what this looks like for{" "}
            {companyName}. Let's explore it together.
          </p>
          <CTAButton
            label="See what's next"
            onClick={handleCTA}
            fullWidth={true}
            showIcon={true}
          />
        </div>

        {/* Footer: Continuity note */}
        <p className="text-[10px] text-[#888888] text-center mt-6 italic">
          (This continues from your brief. No pitch, just next steps.)
        </p>
      </div>
    </div>
  );
}
