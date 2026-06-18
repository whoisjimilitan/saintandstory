import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export default async function B2BAnalyticsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-16">
        {['ADMIN', 'TODAY', 'DISCOVERY', 'PIPELINE', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'ANALYTICS'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.3em] mb-4">Analytics</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-6xl tracking-tight mb-3">
          System Performance
        </h1>
        <p className="text-base text-[#666666]">
          Evaluate effectiveness and commercial performance
        </p>
      </div>

      {/* SYSTEM HEALTH METRICS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          System Health
        </p>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-[#F0FDF4] p-8 rounded-lg">
            <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-4">
              Operational Efficiency
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] mb-2">
              94%
            </p>
            <p className="text-sm text-[#666666]">
              uptime and reliability
            </p>
          </div>

          <div className="bg-[#EBEBF9] p-8 rounded-lg">
            <p className="text-[10px] font-semibold text-[#6366F1] uppercase tracking-[0.2em] mb-4">
              Prospect Engagement
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] mb-2">
              42%
            </p>
            <p className="text-sm text-[#666666]">
              email open rate
            </p>
          </div>

          <div className="bg-[#FEF3C7] p-8 rounded-lg">
            <p className="text-[10px] font-semibold text-[#D97706] uppercase tracking-[0.2em] mb-4">
              Conversion Rate
            </p>
            <p className="text-5xl font-black text-[#0D0D0D] mb-2">
              28%
            </p>
            <p className="text-sm text-[#666666]">
              to standing order
            </p>
          </div>
        </div>
      </div>

      {/* WEEK-OVER-WEEK TRENDS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Week-over-week Performance
        </p>
        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Prospects Created</p>
              <p className="text-xs text-[#666666]">412 → 486</p>
            </div>
            <p className="text-3xl font-black text-[#10B981]">
              +18%
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Standing Orders Activated</p>
              <p className="text-xs text-[#666666]">31 → 33</p>
            </div>
            <p className="text-3xl font-black text-[#10B981]">
              +6%
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] p-6 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-1">Revenue Generated</p>
              <p className="text-xs text-[#666666]">£8,420 → £9,431</p>
            </div>
            <p className="text-3xl font-black text-[#10B981]">
              +12%
            </p>
          </div>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Recommended Focus Areas
        </p>
        <div className="space-y-4">
          <div className="bg-[#FFFAF0] border-l-4 border-[#F59E0B] p-6 rounded-lg">
            <p className="text-sm font-bold text-[#0D0D0D] mb-2">
              Improve Email Engagement
            </p>
            <p className="text-sm text-[#666666]">
              Estate Agents category: 31% open rate (target: 40%). A/B test subject lines to improve visibility.
            </p>
          </div>

          <div className="bg-[#F0FDF4] border-l-4 border-[#10B981] p-6 rounded-lg">
            <p className="text-sm font-bold text-[#0D0D0D] mb-2">
              Expand High-Converting Category
            </p>
            <p className="text-sm text-[#666666]">
              Logistics shows 52% conversion rate. Increase discovery volume in this category to accelerate revenue growth.
            </p>
          </div>

          <div className="bg-[#FEE2E2] border-l-4 border-[#DC2626] p-6 rounded-lg">
            <p className="text-sm font-bold text-[#0D0D0D] mb-2">
              Unblock Revenue
            </p>
            <p className="text-sm text-[#666666]">
              2 standing orders blocked. Resolving these issues will restore £16/month potential revenue immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
