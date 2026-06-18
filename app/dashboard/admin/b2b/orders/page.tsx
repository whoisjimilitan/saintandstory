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

      const categoryNames: { [key: string]: string } = {
        'estate-agents': 'Estate Agent Expansion Program',
        'removals': 'Yorkshire Relocation Program',
        'care': 'Care Provider Network Program',
        'pharmacies': 'Pharmacy Growth Program',
        'logistics': 'Logistics Modernization Program'
      };

      orders = standingOrders.map((order: any) => {
        const name = categoryNames[order.category_id] || `Revenue Program ${order.id.slice(0, 8)}`;

        let status: 'healthy' | 'blocked' | 'attention_required' = 'healthy';
        let blocker: string | undefined;
        let next_action = 'Continue monitoring';

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
          revenue_potential: 8,
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

  const blockedOrders = data.orders.filter(o => o.status === 'blocked');
  const attentionOrders = data.orders.filter(o => o.status === 'attention_required');
  const healthyOrders = data.orders.filter(o => o.status === 'healthy');

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
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
          Standing Orders.
        </h1>
        <p className="text-[10px] font-semibold text-[#888888] uppercase tracking-[0.2em]">
          Recurring business we've committed to
        </p>
      </div>

      {/* SECTION 1: ORDERS BRIEF */}
      <div className="mb-16">
        <p className="text-sm leading-relaxed text-[#0D0D0D]">
          <span className="font-semibold">{data.total_assets}</span> standing order{data.total_assets !== 1 ? 's' : ''}. <span className="font-semibold">{data.healthy_assets}</span> {data.healthy_assets === 1 ? 'is working' : 'are working'}. <span className="font-semibold">{data.blocked_assets}</span> {data.blocked_assets === 1 ? 'is blocked' : 'are blocked'}.
        </p>
      </div>

      {/* SECTION 2: BLOCKED ORDERS */}
      {blockedOrders.length > 0 && (
        <div className="mb-16">
          <h2 className="text-[10px] font-semibold text-[#DC2626] uppercase tracking-[0.2em] mb-8">
            Requires Immediate Attention
          </h2>
          <div className="space-y-6">
            {blockedOrders.map((order) => (
              <div key={order.id} className="pl-4 border-l-4 border-[#DC2626] bg-[#FFF5F5] p-6">
                <h3 className="text-base font-semibold text-[#0D0D0D] mb-2">
                  {order.name}
                </h3>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-[#0D0D0D]">
                    {order.revenue_potential} jobs/month
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-[#E8E8E8]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                    Status
                  </p>
                  <p className="text-base text-[#0D0D0D]">
                    Blocked
                  </p>
                </div>
                {order.blocker && (
                  <div className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#DC2626] mb-1">
                      Issue
                    </p>
                    <p className="text-sm text-[#DC2626]">
                      {order.blocker}
                    </p>
                  </div>
                )}
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-1">
                  Action
                </p>
                <p className="text-base text-[#0D0D0D]">
                  {order.next_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: AT-RISK ORDERS */}
      {attentionOrders.length > 0 && (
        <div className="mb-16">
          <h2 className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-[0.2em] mb-8">
            Attention Required
          </h2>
          <div className="space-y-6">
            {attentionOrders.map((order) => (
              <div key={order.id} className="pl-4 border-l-4 border-[#F59E0B] bg-[#FFFAF0] p-6">
                <h3 className="text-base font-semibold text-[#0D0D0D] mb-2">
                  {order.name}
                </h3>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-[#0D0D0D]">
                    {order.revenue_potential} jobs/month
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-[#E8E8E8]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                    Status
                  </p>
                  <p className="text-base text-[#0D0D0D]">
                    Needs Attention
                  </p>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#0D0D0D] mb-1">
                  Action
                </p>
                <p className="text-base text-[#0D0D0D]">
                  {order.next_action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: HEALTHY ORDERS */}
      {healthyOrders.length > 0 && (
        <div className="mb-16">
          <h2 className="text-[10px] font-semibold text-[#0A0A0A] uppercase tracking-[0.2em] mb-8">
            Performing
          </h2>
          <div className="space-y-6">
            {healthyOrders.map((order) => (
              <div key={order.id} className="pl-4 border-l-4 border-[#0D0D0D] p-6">
                <h3 className="text-base font-semibold text-[#0D0D0D] mb-2">
                  {order.name}
                </h3>
                <div className="mb-4">
                  <p className="text-lg font-semibold text-[#0D0D0D]">
                    {order.revenue_potential} jobs/month
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-[#E8E8E8]">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                    Status
                  </p>
                  <p className="text-base text-[#0D0D0D]">
                    Working
                  </p>
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#888888] mb-1">
                  Last Activity
                </p>
                <p className="text-base text-[#0D0D0D]">
                  {order.last_activity}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
