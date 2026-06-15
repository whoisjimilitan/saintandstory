import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { buildConversationIntelligence } from "@/lib/conversation-intelligence";
import { ConversationIntelligence } from "@/components/ConversationIntelligence";
import { OutcomeCaseSection } from "@/components/OutcomeCaseSection";
import { FrictionValidationSection } from "@/components/FrictionValidationSection";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

export default async function ConversationPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (
    !user?.emailAddresses[0]?.emailAddress ||
    !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)
  ) {
    redirect("/");
  }

  const sql = neon(process.env.DATABASE_URL!);
  const conversation = await buildConversationIntelligence(sql, params.id);

  if (!conversation) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white border border-[#E8E8E8] rounded p-8">
          <p className="text-[#666666]">No conversation data found for this prospect.</p>
          <Link
            href="/dashboard/admin/b2b"
            className="text-[#0D0D0D] font-semibold hover:underline mt-4 inline-block"
          >
            ← Back to Today Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="mb-12 flex items-center gap-4">
        <Link
          href="/dashboard/admin/b2b"
          className="text-[#0D0D0D] font-semibold hover:underline"
        >
          ← Today Queue
        </Link>
        <span className="text-[#D0D0D0]">•</span>
        <h1 className="text-2xl font-black text-[#0D0D0D]">
          {conversation.business_name}
        </h1>
      </div>

      {/* Conversation Intelligence Display */}
      <div className="mb-12">
        <ConversationIntelligence conversation={conversation} />
      </div>

      {/* Outcome Case Analysis */}
      <div className="mb-12">
        <h2 className="text-sm font-semibold text-[#0D0D0D] mb-6">
          DIAGNOSIS
        </h2>
        <OutcomeCaseSection leadId={params.id} />
      </div>

      {/* Friction Validation */}
      <div>
        <h2 className="text-sm font-semibold text-[#0D0D0D] mb-6">
          VALIDATION
        </h2>
        <FrictionValidationSection leadId={params.id} />
      </div>
    </div>
  );
}
