import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export default async function B2BPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
        {['ADMIN', 'DISCOVERY', 'PIPELINE', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b/${item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              !['DISCOVERY', 'PIPELINE', 'ORDERS', 'ANALYTICS'].includes(item)
                ? 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Header */}
      <div>
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          B2B Intelligence Lab.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Discovery → Pipeline → Orders → Analytics
        </p>
      </div>
    </div>
  );
}
