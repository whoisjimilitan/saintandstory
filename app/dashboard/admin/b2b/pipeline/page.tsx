import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

const ADMIN_EMAILS = [
  "whoisjimi.today@gmail.com",
  "oyedeleoyepeju2014@gmail.com",
  "james@saintandstoryltd.co.uk",
  "oye@saintandstoryltd.co.uk"
];

interface PipelineStage {
  stage: string;
  count: number;
  percentage: number;
}

interface PipelineData {
  new: number;
  contacted: number;
  opened: number;
  clicked: number;
  replied: number;
  qualified: number;
  won: number;
  lost: number;
  total: number;
}

async function getPipelineData(): Promise<PipelineData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[Pipeline] DATABASE_URL not configured');
      return getDefaultPipeline();
    }

    const sql = neon(process.env.DATABASE_URL);

    const leads = await sql`
      SELECT
        id,
        status,
        email_sent_at,
        engagement_score
      FROM b2b_leads
    `;

    const outreach = await sql`
      SELECT
        lead_id,
        MAX(CASE WHEN event_type = 'email_sent' THEN 1 ELSE 0 END) as contacted,
        MAX(CASE WHEN event_type = 'email_opened' THEN 1 ELSE 0 END) as opened,
        MAX(CASE WHEN event_type = 'link_clicked' THEN 1 ELSE 0 END) as clicked,
        MAX(CASE WHEN event_type = 'reply_received' THEN 1 ELSE 0 END) as replied
      FROM b2b_outreach
      GROUP BY lead_id
    `;

    const outreachMap = new Map();
    outreach.forEach((row: any) => {
      outreachMap.set(row.lead_id, {
        contacted: row.contacted,
        opened: row.opened,
        clicked: row.clicked,
        replied: row.replied
      });
    });

    let pipeline: PipelineData = {
      new: 0,
      contacted: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      qualified: 0,
      won: 0,
      lost: 0,
      total: leads.length
    };

    leads.forEach((lead: any) => {
      const outreachData = outreachMap.get(lead.id) || { contacted: 0, opened: 0, clicked: 0, replied: 0 };

      if (lead.status === 'won') {
        pipeline.won++;
      } else if (lead.status === 'lost') {
        pipeline.lost++;
      } else if (lead.status === 'qualified') {
        pipeline.qualified++;
      } else if (outreachData.replied) {
        pipeline.replied++;
      } else if (outreachData.clicked) {
        pipeline.clicked++;
      } else if (outreachData.opened) {
        pipeline.opened++;
      } else if (outreachData.contacted || lead.email_sent_at) {
        pipeline.contacted++;
      } else {
        pipeline.new++;
      }
    });

    return pipeline;
  } catch (err) {
    console.warn('[Pipeline] Failed to fetch pipeline data:', err instanceof Error ? err.message : String(err));
    return getDefaultPipeline();
  }
}

function getDefaultPipeline(): PipelineData {
  return {
    new: 0,
    contacted: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    qualified: 0,
    won: 0,
    lost: 0,
    total: 0
  };
}

export default async function PipelinePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const pipeline = await getPipelineData();

  const stages: PipelineStage[] = [
    { stage: 'New', count: pipeline.new, percentage: pipeline.total > 0 ? (pipeline.new / pipeline.total) * 100 : 0 },
    { stage: 'Contacted', count: pipeline.contacted, percentage: pipeline.total > 0 ? (pipeline.contacted / pipeline.total) * 100 : 0 },
    { stage: 'Opened', count: pipeline.opened, percentage: pipeline.total > 0 ? (pipeline.opened / pipeline.total) * 100 : 0 },
    { stage: 'Clicked', count: pipeline.clicked, percentage: pipeline.total > 0 ? (pipeline.clicked / pipeline.total) * 100 : 0 },
    { stage: 'Replied', count: pipeline.replied, percentage: pipeline.total > 0 ? (pipeline.replied / pipeline.total) * 100 : 0 },
    { stage: 'Qualified', count: pipeline.qualified, percentage: pipeline.total > 0 ? (pipeline.qualified / pipeline.total) * 100 : 0 },
    { stage: 'Won', count: pipeline.won, percentage: pipeline.total > 0 ? (pipeline.won / pipeline.total) * 100 : 0 },
    { stage: 'Lost', count: pipeline.lost, percentage: pipeline.total > 0 ? (pipeline.lost / pipeline.total) * 100 : 0 }
  ];

  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-16">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'PIPELINE'
                ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                : 'bg-white text-[#0D0D0D] border-[#E8E8E8] hover:border-[#D0D0D0]'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.3em] mb-4">Pipeline</p>
        <h1 className="font-sans font-black text-[#0D0D0D] text-6xl tracking-tight mb-3">
          Sales Funnel
        </h1>
        <p className="text-base text-[#666666]">
          Where is your inventory and how is it moving?
        </p>
      </div>

      {/* CONVERSION FUNNEL STAGES - CARD GRID */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Acquisition Pipeline
        </p>
        <div className="grid grid-cols-4 gap-6">
          {stages.map((stage, idx) => {
            const colors = [
              '#EBEBF9', // New - indigo
              '#FFFAF0', // Contacted - amber
              '#F0FFFE', // Opened - cyan
              '#FEF3C7', // Clicked - yellow
              '#F0FDF4', // Replied - green
              '#FCE7F3', // Qualified - pink
              '#DBEAFE', // Won - blue
              '#FEE2E2'  // Lost - red
            ];
            const textColors = [
              '#6366F1',
              '#F59E0B',
              '#06B6D4',
              '#D97706',
              '#10B981',
              '#EC4899',
              '#0284C7',
              '#DC2626'
            ];

            return (
              <div key={stage.stage} className={`bg-[${colors[idx]}] p-6 rounded-lg`} style={{backgroundColor: colors[idx]}}>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] mb-4`} style={{color: textColors[idx]}}>
                  {stage.stage}
                </p>
                <p className="text-5xl font-black text-[#0D0D0D] mb-4">
                  {stage.count}
                </p>
                <p className="text-xs text-[#666666]">
                  {stage.percentage.toFixed(0)}% of total
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTLENECK ANALYSIS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Conversion Rates
        </p>
        <div className="space-y-4">
          {stages.slice(0, -1).map((stage, idx) => {
            const nextStage = stages[idx + 1];
            const conversionRate = stage.count > 0 ? (nextStage.count / stage.count) * 100 : 0;
            const isBottleneck = conversionRate < 50;

            return (
              <div key={`${stage.stage}-${nextStage.stage}`} className="flex items-center justify-between p-4 bg-white border border-[#E5E7EB] rounded">
                <div>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {stage.stage} → {nextStage.stage}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {stage.count} to {nextStage.count}
                  </p>
                </div>
                <p className={`text-2xl font-black ${isBottleneck ? 'text-[#DC2626]' : 'text-[#10B981]'}`}>
                  {conversionRate.toFixed(0)}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-[#F3F4F6] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
            Total Pipeline
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {pipeline.total}
          </p>
          <p className="text-sm text-[#666666]">
            prospects in active engagement
          </p>
        </div>

        <div className="bg-[#F0FDF4] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#10B981] uppercase tracking-[0.2em] mb-4">
            Won
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {pipeline.won}
          </p>
          <p className="text-sm text-[#666666]">
            converted to standing orders
          </p>
        </div>

        <div className="bg-[#FEE2E2] p-8 rounded-lg">
          <p className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-[0.2em] mb-4">
            Lost
          </p>
          <p className="text-5xl font-black text-[#0D0D0D] mb-2">
            {pipeline.lost}
          </p>
          <p className="text-sm text-[#666666]">
            archived or disqualified
          </p>
        </div>
      </div>
    </div>
  );
}
