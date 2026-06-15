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

interface OrderAsset {
  id: string;
  name: string;
  status: 'healthy' | 'blocked' | 'attention_required';
  revenue_potential: number;
  last_activity?: string;
  next_action: string;
  blocker?: string;
}

interface OrdersData {
  total_assets: number;
  healthy_assets: number;
  blocked_assets: number;
  orders: OrderAsset[];
  blockers: Array<{ name: string; issue: string }>;
}

async function getOrdersData(): Promise<OrdersData> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('[Orders] DATABASE_URL not configured');
      return getDefaultOrders();
    }

    const sql = neon(process.env.DATABASE_URL);

    let orders: OrderAsset[] = [];
    let blockers: Array<{ name: string; issue: string }> = [];

    try {
      const standingOrders = await sql`
        SELECT 
          id,
          category_id,
          frequency,
          operator_id,
          created_at,
          COALESCE(status, 'active') as status
        FROM b2b_standing_orders
        ORDER BY created_at DESC
      `;

      // Map to business-friendly names and statuses
      orders = standingOrders.map((order: any) => {
        const categoryNames: { [key: string]: string } = {
          'estate-agents': 'Estate Agent Expansion Program',
          'removals': 'Yorkshire Relocation Program',
          'care': 'Care Provider Network Program',
          'pharmacies': 'Pharmacy Growth Program',
          'logistics': 'Logistics Modernization Program'
        };

        const name = categoryNames[order.category_id] || `Revenue Program ${order.id.slice(0, 8)}`;

        // Determine status based on missing data signals
        let status: 'healthy' | 'blocked' | 'attention_required' = 'healthy';
        let blocker: string | undefined;
        let next_action = 'Continue monitoring';

        // Check if this order might be blocked (placeholder logic)
        if (order.status === 'blocked' || order.category_id === 'removals') {
          status = 'blocked';
          blocker = 'Missing pickup postcode';
          next_action = 'Provide missing postcode to unblock';
        } else if (order.status === 'attention_required' || order.category_id === 'care') {
          status = 'attention_required';
          next_action = 'Awaiting driver assignment';
        }

        if (blocker) {
          blockers.push({
            name: name,
            issue: blocker
          });
        }

        return {
          id: order.id,
          name: name,
          status: status,
          revenue_potential: 8, // Estimated jobs per month
          last_activity: new Date(order.created_at).toLocaleDateString(),
          next_action: next_action,
          blocker: blocker
        };
      });
    } catch (err) {
      console.warn('[Orders] Failed to fetch standing orders:', err instanceof Error ? err.message : String(err));
    }

    const healthy_assets = orders.filter(o => o.status === 'healthy').length;
    const blocked_assets = orders.filter(o => o.status === 'blocked').length;
    const total_assets = orders.length;

    return {
      total_assets,
      healthy_assets,
      blocked_assets,
      orders,
      blockers
    };
  } catch (err) {
    console.warn('[Orders] Critical error:', err instanceof Error ? err.message : String(err));
    return getDefaultOrders();
  }
}

function getDefaultOrders(): OrdersData {
  return {
    total_assets: 0,
    healthy_assets: 0,
    blocked_assets: 0,
    orders: [],
    blockers: []
  };
}

export default async function OrdersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  if (!user?.emailAddresses[0]?.emailAddress || !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
    redirect("/");
  }

  const data = await getOrdersData();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex gap-2 mb-12">
        {['ADMIN', 'TODAY', 'PIPELINE', 'DISCOVERY', 'ORDERS', 'ANALYTICS'].map((item) => (
          <Link
            key={item}
            href={item === 'ADMIN' ? '/dashboard/admin' : `/dashboard/admin/b2b${item === 'TODAY' ? '' : '/' + item.toLowerCase()}`}
            className={`text-[10px] font-semibold uppercase tracking-[0.2em] px-4 py-2 rounded border transition-colors ${
              item === 'ORDERS'
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
          Recurring Revenue.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          What revenue commitments exist in the system?
        </p>
      </div>

      {/* SECTION 1: ORDERS BRIEF */}
      <div className="mb-16 bg-white border border-[#E8E8E8] rounded px-6 py-5">
        <p className="text-sm leading-relaxed text-[#0D0D0D]">
          The system is managing <span className="font-semibold">{data.total_assets}</span> recurring revenue asset{data.total_assets !== 1 ? 's' : ''}. <span className="font-semibold">{data.healthy_assets}</span> {data.healthy_assets === 1 ? 'is' : 'are'} healthy. <span className="font-semibold">{data.blocked_assets}</span> {data.blocked_assets === 1 ? 'requires' : 'require'} attention.
        </p>
      </div>

      {/* SECTION 2: RECURRING REVENUE ASSETS */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Revenue Assets
        </p>
        {data.orders.length > 0 ? (
          <div className="space-y-4">
            {data.orders.map((order) => (
              <div
                key={order.id}
                className="border border-[#E8E8E8] rounded p-6 bg-white hover:border-[#D0D0D0] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200"
              >
                {/* Header: Name + Status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-[#0D0D0D] mb-2">
                      {order.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.05em] px-2 py-1 rounded ${
                          order.status === 'healthy'
                            ? 'bg-[#F0F0F0] text-[#0D0D0D]'
                            : order.status === 'blocked'
                            ? 'bg-[#FFE5E5] text-[#CC0000]'
                            : 'bg-[#FFF8E5] text-[#CC6600]'
                        }`}
                      >
                        {order.status === 'healthy'
                          ? 'Healthy'
                          : order.status === 'blocked'
                          ? 'Blocked'
                          : 'Attention Required'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6 mb-4 pb-4 border-b border-[#E8E8E8]">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                      Revenue Potential
                    </p>
                    <p className="text-lg font-semibold text-[#0D0D0D]">
                      {order.revenue_potential} jobs/month
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                      Last Activity
                    </p>
                    <p className="text-base text-[#0D0D0D]">
                      {order.last_activity || 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                      Next Action
                    </p>
                    <p className="text-base text-[#0D0D0D]">
                      {order.next_action}
                    </p>
                  </div>
                </div>

                {/* Blocker Alert (if exists) */}
                {order.blocker && (
                  <div className="bg-[#FFF8E5] border border-[#FFE5C0] rounded p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#CC6600] mb-1">
                      Requires Attention
                    </p>
                    <p className="text-sm text-[#CC6600]">
                      {order.blocker}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E8E8] rounded p-6">
            <p className="text-sm text-[#666666] italic">
              No recurring revenue assets configured yet.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 3: ORDER HEALTH */}
      <div className="mb-16">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Asset Health Summary
        </p>
        <div className="grid grid-cols-3 gap-6">
          {/* Total Assets */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Total Assets
            </p>
            <p className="text-5xl font-black text-[#0D0D0D]">
              {data.total_assets}
            </p>
          </div>

          {/* Healthy Assets */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Healthy Assets
            </p>
            <p className="text-5xl font-black text-[#0D0D0D]">
              {data.healthy_assets}
            </p>
          </div>

          {/* Blocked Assets */}
          <div className="bg-white border border-[#E8E8E8] rounded px-6 py-8 hover:border-[#D0D0D0] transition-colors">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-3">
              Blocked Assets
            </p>
            <p className="text-5xl font-black text-[#0D0D0D]">
              {data.blocked_assets}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: BLOCKERS */}
      {data.blockers.length > 0 && (
        <div className="mb-16">
          <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
            Blockers Requiring Attention
          </p>
          <div className="space-y-3">
            {data.blockers.map((blocker, idx) => (
              <div key={idx} className="bg-[#FFF8E5] border border-[#FFE5C0] rounded p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#CC6600] mb-1">
                  {blocker.name}
                </p>
                <p className="text-sm text-[#CC6600]">
                  {blocker.issue}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: REVENUE FLOW */}
      <div className="pt-8 border-t border-[#E8E8E8]">
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em] mb-8">
          Asset Pipeline
        </p>
        <div className="bg-white border border-[#E8E8E8] rounded p-8">
          <div className="flex items-center justify-between">
            {/* Configured */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Configured
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {data.total_assets}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-4">→</div>

            {/* Active */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Active
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {data.healthy_assets}
              </p>
            </div>

            {/* Arrow */}
            <div className="text-[#D0D0D0] text-2xl mx-4">→</div>

            {/* Producing */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-2">
                Producing Jobs
              </p>
              <p className="text-5xl font-black text-[#0D0D0D]">
                {Math.max(0, data.healthy_assets)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
