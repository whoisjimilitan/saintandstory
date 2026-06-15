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

    // Get all prospects and their states
    const leads = await sql`
      SELECT 
        id,
        status,
        email_sent_at,
        engagement_score
      FROM b2b_leads
    `;

    // Get outreach metrics
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
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
        <h1 className="font-sans font-black text-[#0D0D0D] text-4xl tracking-tight mb-1">
          System Pipeline.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Where is the inventory and how is it moving?
        </p>
      </div>

      {/* Pipeline Funnel Visualization */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Conversion Funnel
        </p>
        <div className="space-y-3">
          {stages.map((stage, idx) => {
            const isBottleneck = idx > 0 && stage.count < stages[idx - 1].count * 0.5;
            return (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-[#0D0D0D]">
                    {stage.stage}
                  </p>
                  <p className="text-sm font-semibold text-[#0D0D0D]">
                    {stage.count}
                    <span className="text-[#888888] font-normal ml-2">
                      {stage.percentage.toFixed(0)}%
                    </span>
                  </p>
                </div>
                <div className="w-full bg-[#F5F5F5] rounded h-8 overflow-hidden border border-[#E8E8E8]">
                  <div
                    className={`h-full transition-all ${
                      isBottleneck
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]'
                        : 'bg-[#0D0D0D]'
                    }`}
                    style={{ width: `${Math.max(stage.percentage, 2)}%` }}
                  />
                </div>
                {isBottleneck && (
                  <p className="text-[10px] text-[#FF6B6B] font-medium mt-1">
                    ⚠️ Bottleneck: {Math.round((1 - stage.count / stages[idx - 1].count) * 100)}% drop from {stages[idx - 1].stage}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Cards Grid */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Stage Breakdown
        </p>
        <div className="grid grid-cols-4 gap-4">
          {stages.map((stage) => (
            <div key={stage.stage} className="border border-[#E8E8E8] rounded px-4 py-6 bg-white hover:border-[#D0D0D0] transition-colors">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
                {stage.stage}
              </p>
              <p className="text-4xl font-black text-[#0D0D0D] mb-2">
                {stage.count}
              </p>
              <p className="text-[10px] font-medium text-[#0D0D0D]">
                {stage.percentage.toFixed(0)}% of total
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-16 border-t border-[#E8E8E8] pt-12">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          System Health Indicators
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Contact Rate
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {pipeline.total > 0 ? Math.round((pipeline.contacted / pipeline.total) * 100) : 0}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              {pipeline.contacted} of {pipeline.total} contacted
            </p>
          </div>

          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Engagement Rate
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {pipeline.contacted > 0 ? Math.round((pipeline.opened / pipeline.contacted) * 100) : 0}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              {pipeline.opened} opened emails
            </p>
          </div>

          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Reply Rate
            </p>
            <p className="text-4xl font-black text-[#0D0D0D]">
              {pipeline.contacted > 0 ? Math.round((pipeline.replied / pipeline.contacted) * 100) : 0}%
            </p>
            <p className="text-[10px] text-[#666666] mt-2">
              {pipeline.replied} replied
            </p>
          </div>
        </div>
      </div>

      {/* Total Inventory */}
      <div className="pt-8 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-4">
          Total Inventory
        </p>
        <p className="text-5xl font-black text-[#0D0D0D]">
          {pipeline.total}
        </p>
        <p className="text-sm text-[#666666] mt-2">
          Prospects in system
        </p>
      </div>
    </div>
  );
}
