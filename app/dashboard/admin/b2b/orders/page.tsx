import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export default async function B2BOrdersPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  if (!ADMIN_EMAILS.includes(email)) redirect("/dashboard/driver");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Navigation pills */}
      <div className="flex items-center justify-between mb-1">
        <Link href="/dashboard/admin" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.2em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          Admin ↻
        </Link>
        <Link href="/dashboard/admin/b2b" className="text-[10px] font-semibold text-[#888888] hover:text-[#0D0D0D] uppercase tracking-[0.15em] transition-colors border border-[#E8E8E8] px-3 py-1 rounded-full">
          B2B Today ↻
        </Link>
      </div>

      {/* Header */}
      <h1 className="font-sans font-black text-[#0D0D0D] text-3xl tracking-tight mb-2">
        Standing Orders.
      </h1>

      {/* Description */}
      <div className="mb-8">
        <p className="text-sm text-[#666666] mb-2">
          Monitor contracts, standing orders and commercial outcomes.
        </p>
        <p className="text-sm text-[#888888]">
          Coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
