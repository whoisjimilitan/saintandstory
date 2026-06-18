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
    <div className="px-6 py-10 max-w-3xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
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
      <div className="mb-12">
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          Analytics.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Evaluate system effectiveness and commercial performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-12">
        {/* System Health */}
        <div>
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            System Health
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#666666] mb-2">Operational efficiency</p>
              <p className="text-3xl font-black text-[#0D0D0D]">94%</p>
            </div>
            <div>
              <p className="text-sm text-[#666666] mb-2">Prospect engagement</p>
              <p className="text-3xl font-black text-[#0D0D0D]">42%</p>
            </div>
            <div>
              <p className="text-sm text-[#666666] mb-2">Conversion to standing order</p>
              <p className="text-3xl font-black text-[#0D0D0D]">28%</p>
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="border-t border-[#E8E8E8] pt-12">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Week-over-week
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Prospects created</p>
              <p className="text-lg text-[#0D0D0D]"><span className="font-bold">+18%</span> <span className="text-[#666666]">(412 → 486)</span></p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Standing orders activated</p>
              <p className="text-lg text-[#0D0D0D]"><span className="font-bold">+6%</span> <span className="text-[#666666]">(31 → 33)</span></p>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D0D0D] mb-2">Revenue generated</p>
              <p className="text-lg text-[#0D0D0D]"><span className="font-bold">+12%</span> <span className="text-[#666666]">(£8,420 → £9,431)</span></p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="border-t border-[#E8E8E8] pt-12">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Focus Areas
          </p>
          <ul className="space-y-3 text-sm text-[#0D0D0D]">
            <li className="flex gap-3">
              <span className="font-semibold">→</span>
              <span>Improve email open rate (Estate Agents category: 31%, target: 40%)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">→</span>
              <span>Expand Logistics discovery (highest conversion, 52% → standing order)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold">→</span>
              <span>Unblock 2 standing orders in Orders to restore £16/month potential</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
