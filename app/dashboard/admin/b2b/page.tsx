import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { buildOperatingBrief } from "@/lib/operating-brief-builder";
import GoodMorningSection from "@/components/GoodMorningSection";
import TodaysWorkSection from "@/components/TodaysWorkSection";
import WhatWeAreLearningSection from "@/components/WhatWeAreLearningSection";
import RevenueAtRiskSection from "@/components/RevenueAtRiskSection";
import SystemInputsSection from "@/components/SystemInputsSection";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

async function getOperatingBrief() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("[B2B Home] DATABASE_URL not configured");
      return getDefaultBrief();
    }

    const sql = neon(process.env.DATABASE_URL);
    return await buildOperatingBrief(sql);
  } catch (err) {
    console.error("[B2B Home] Error building Operating Brief:", err);
    return getDefaultBrief();
  }
}

function getDefaultBrief() {
  return {
    good_morning: [],
    todays_work: [],
    what_we_are_learning: [],
    revenue_at_risk: [],
    system_inputs: {
      total_leads: 0,
      qualified_for_outreach: 0,
      commercial_fit: 0,
      conversations_active: 0,
      jobs_created: 0,
      discovery_sources: []
    }
  };
}

export default async function B2BTodayPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  const brief = await getOperatingBrief();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-16">
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/b2b" className="text-[10px] font-semibold text-[#0D0D0D] uppercase tracking-[0.15em] border border-[#0D0D0D] px-3 py-1 rounded-full">
            Today
          </Link>
          <Link href="/dashboard/admin/b2b/pipeline" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Pipeline
          </Link>
          <Link href="/dashboard/admin/b2b/discovery" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Discovery
          </Link>
          <Link href="/dashboard/admin/b2b/orders" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Orders
          </Link>
          <Link href="/dashboard/admin/b2b/analytics" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
            Analytics
          </Link>
        </div>
      </div>

      {/* SECTION 1: GOOD MORNING */}
      <GoodMorningSection items={brief.good_morning} />

      {/* SECTION 2: TODAY'S WORK */}
      <TodaysWorkSection items={brief.todays_work} />

      {/* SECTION 3: WHAT WE ARE LEARNING */}
      <WhatWeAreLearningSection insights={brief.what_we_are_learning} />

      {/* SECTION 4: REVENUE AT RISK */}
      <RevenueAtRiskSection leads={brief.revenue_at_risk} />

      {/* SECTION 5: SYSTEM INPUTS */}
      <SystemInputsSection data={brief.system_inputs} />
    </div>
  );
}
